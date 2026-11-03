import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const PORT = parseInt(process.env.PORT || process.env.YJS_PORT || "1234", 10);
const HOST = process.env.HOST || "0.0.0.0";

const messageSync = 0;
const messageAwareness = 1;

interface WSSharedDoc {
  name: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Map<WebSocket, Set<number>>;
}

const docs = new Map<string, WSSharedDoc>();

function getYDoc(docname: string, gc = true): WSSharedDoc {
  let existing = docs.get(docname);
  if (!existing) {
    const doc = new Y.Doc({ gc });
    const awareness = new awarenessProtocol.Awareness(doc);
    awareness.setLocalState(null);

    const docState: WSSharedDoc = {
      name: docname,
      doc,
      awareness,
      conns: new Map(),
    };

    const awarenessChangeHandler = (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      conn: WebSocket | null
    ) => {
      const changedClients = added.concat(updated, removed);
      if (conn !== null) {
        const connControlledIDs = docState.conns.get(conn);
        if (connControlledIDs !== undefined) {
          added.forEach((clientID) => connControlledIDs.add(clientID));
          removed.forEach((clientID) => connControlledIDs.delete(clientID));
        }
      }
      // Broadcast awareness update
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      const buff = encoding.toUint8Array(encoder);
      docState.conns.forEach((_, c) => {
        send(docState, c, buff);
      });
    };

    awareness.on("update", awarenessChangeHandler);

    doc.on("update", (update: Uint8Array, origin: any) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const buff = encoding.toUint8Array(encoder);
      docState.conns.forEach((_, c) => {
        if (c !== origin) {
          send(docState, c, buff);
        }
      });
    });

    docs.set(docname, docState);
    existing = docState;
  }
  return existing;
}

function send(doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) {
  if (conn.readyState !== WebSocket.OPEN) {
    closeConn(doc, conn);
    return;
  }
  try {
    conn.send(m, (err) => {
      if (err != null) closeConn(doc, conn);
    });
  } catch (e) {
    closeConn(doc, conn);
  }
}

function closeConn(doc: WSSharedDoc, conn: WebSocket) {
  if (doc.conns.has(conn)) {
    const controlledIds = doc.conns.get(conn);
    doc.conns.delete(conn);
    if (controlledIds !== undefined) {
      awarenessProtocol.removeAwarenessStates(
        doc.awareness,
        Array.from(controlledIds),
        null
      );
    }
    if (doc.conns.size === 0) {
      doc.awareness.destroy();
      doc.doc.destroy();
      docs.delete(doc.name);
    }
  }
  try {
    conn.close();
  } catch (e) {}
}

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "codecanvas-yjs-server", activeDocs: docs.size }));
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (conn: WebSocket, req) => {
  conn.binaryType = "nodebuffer";

  // Room name extracted from URL pathname (e.g. /doc-123 or doc-123)
  const url = req.url || "/";
  const docName = url.slice(1).split("?")[0] || "default-doc";

  const doc = getYDoc(docName);
  doc.conns.set(conn, new Set());

  conn.on("message", (message: ArrayBuffer) => {
    try {
      const encoder = encoding.createEncoder();
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc.doc, conn);
          if (encoding.length(encoder) > 1) {
            send(doc, conn, encoding.toUint8Array(encoder));
          }
          break;
        case messageAwareness: {
          awarenessProtocol.applyAwarenessUpdate(
            doc.awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
        }
      }
    } catch (err) {
      console.error("Error processing Yjs message:", err);
    }
  });

  // Step 1: Send SyncStep1 to client
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc.doc);
  send(doc, conn, encoding.toUint8Array(encoder));

  // Send current awareness states
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    send(doc, conn, encoding.toUint8Array(awarenessEncoder));
  }

  conn.on("close", () => {
    closeConn(doc, conn);
  });

  conn.on("error", () => {
    closeConn(doc, conn);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[Yjs Server] Collaborative WebSocket server running on ${HOST}:${PORT}`);
  console.log(`[Yjs Server] Health check available at http://${HOST}:${PORT}/health`);
});

function handleShutdown(signal: string) {
  console.log(`[Yjs Server] Received ${signal}. Closing active connections...`);
  wss.close(() => {
    server.close(() => {
      console.log("[Yjs Server] Shutdown complete.");
      process.exit(0);
    });
  });
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

