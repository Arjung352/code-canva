/**
 * src/lib/y-monaco.ts
 *
 * Lightweight, direct TypeScript Yjs binding for Monaco Editor.
 * Eliminates fragile direct ESM path imports from monaco-editor internals,
 * ensuring flawless Next.js/Webpack bundling and full cross-browser compatibility.
 */

import * as Y from "yjs";
import { createMutex } from "lib0/mutex";
import type { Awareness } from "y-protocols/awareness";
import type { editor } from "monaco-editor";

class RelativeSelection {
  start: Y.RelativePosition;
  end: Y.RelativePosition;
  direction: number;

  constructor(start: Y.RelativePosition, end: Y.RelativePosition, direction: number) {
    this.start = start;
    this.end = end;
    this.direction = direction;
  }
}

const createRelativeSelection = (
  editorInstance: editor.IStandaloneCodeEditor,
  monacoModel: editor.ITextModel,
  type: Y.Text
) => {
  const sel = editorInstance.getSelection();
  if (sel !== null) {
    const startPos = sel.getStartPosition();
    const endPos = sel.getEndPosition();
    const start = Y.createRelativePositionFromTypeIndex(
      type,
      monacoModel.getOffsetAt(startPos)
    );
    const end = Y.createRelativePositionFromTypeIndex(
      type,
      monacoModel.getOffsetAt(endPos)
    );
    return new RelativeSelection(start, end, sel.getDirection());
  }
  return null;
};

const createMonacoSelectionFromRelativeSelection = (
  editorInstance: editor.IStandaloneCodeEditor,
  type: Y.Text,
  relSel: RelativeSelection,
  doc: Y.Doc
) => {
  const start = Y.createAbsolutePositionFromRelativePosition(relSel.start, doc);
  const end = Y.createAbsolutePositionFromRelativePosition(relSel.end, doc);
  if (start !== null && end !== null && start.type === type && end.type === type) {
    const model = editorInstance.getModel();
    if (!model) return null;
    const startPos = model.getPositionAt(start.index);
    const endPos = model.getPositionAt(end.index);
    return {
      selectionStartLineNumber: startPos.lineNumber,
      selectionStartColumn: startPos.column,
      positionLineNumber: endPos.lineNumber,
      positionColumn: endPos.column,
    };
  }
  return null;
};

export class MonacoBinding {
  doc: Y.Doc;
  ytext: Y.Text;
  monacoModel: editor.ITextModel;
  editors: Set<editor.IStandaloneCodeEditor>;
  mux: ReturnType<typeof createMutex>;
  awareness: Awareness | null;

  private _savedSelections: Map<editor.IStandaloneCodeEditor, RelativeSelection>;
  private _decorations: Map<editor.IStandaloneCodeEditor, string[]>;
  private _beforeTransaction: () => void;
  private _rerenderDecorations: () => void;
  private _ytextObserver: (event: Y.YTextEvent) => void;
  private _monacoChangeHandler: { dispose: () => void };
  private _monacoDisposeHandler: { dispose: () => void };

  constructor(
    ytext: Y.Text,
    monacoModel: editor.ITextModel,
    editors: Set<editor.IStandaloneCodeEditor> = new Set(),
    awareness: Awareness | null = null
  ) {
    this.doc = ytext.doc!;
    this.ytext = ytext;
    this.monacoModel = monacoModel;
    this.editors = editors;
    this.mux = createMutex();
    this.awareness = awareness;
    this._savedSelections = new Map();
    this._decorations = new Map();

    this._beforeTransaction = () => {
      this.mux(() => {
        this._savedSelections = new Map();
        editors.forEach((editorItem) => {
          if (editorItem.getModel() === monacoModel) {
            const rsel = createRelativeSelection(editorItem, monacoModel, ytext);
            if (rsel !== null) {
              this._savedSelections.set(editorItem, rsel);
            }
          }
        });
      });
    };

    this.doc.on("beforeAllTransactions", this._beforeTransaction);

    this._rerenderDecorations = () => {
      editors.forEach((editorItem) => {
        if (awareness && editorItem.getModel() === monacoModel) {
          const currentDecorations = this._decorations.get(editorItem) || [];
          const newDecorations: editor.IModelDeltaDecoration[] = [];

          awareness.getStates().forEach((state, clientID) => {
            if (
              clientID !== this.doc.clientID &&
              state.selection != null &&
              state.selection.anchor != null &&
              state.selection.head != null
            ) {
              const anchorAbs = Y.createAbsolutePositionFromRelativePosition(
                state.selection.anchor,
                this.doc
              );
              const headAbs = Y.createAbsolutePositionFromRelativePosition(
                state.selection.head,
                this.doc
              );
              if (
                anchorAbs !== null &&
                headAbs !== null &&
                anchorAbs.type === ytext &&
                headAbs.type === ytext
              ) {
                let start, end, afterContentClassName, beforeContentClassName;
                if (anchorAbs.index < headAbs.index) {
                  start = monacoModel.getPositionAt(anchorAbs.index);
                  end = monacoModel.getPositionAt(headAbs.index);
                  afterContentClassName = "yRemoteSelectionHead yRemoteSelectionHead-" + clientID;
                  beforeContentClassName = undefined;
                } else {
                  start = monacoModel.getPositionAt(headAbs.index);
                  end = monacoModel.getPositionAt(anchorAbs.index);
                  afterContentClassName = undefined;
                  beforeContentClassName = "yRemoteSelectionHead yRemoteSelectionHead-" + clientID;
                }
                newDecorations.push({
                  range: {
                    startLineNumber: start.lineNumber,
                    startColumn: start.column,
                    endLineNumber: end.lineNumber,
                    endColumn: end.column,
                  },
                  options: {
                    className: "yRemoteSelection yRemoteSelection-" + clientID,
                    afterContentClassName,
                    beforeContentClassName,
                  },
                });
              }
            }
          });

          this._decorations.set(
            editorItem,
            editorItem.deltaDecorations(currentDecorations, newDecorations)
          );
        } else {
          this._decorations.delete(editorItem);
        }
      });
    };

    this._ytextObserver = (event: Y.YTextEvent) => {
      this.mux(() => {
        let index = 0;
        event.delta.forEach((op) => {
          if (op.retain !== undefined) {
            index += op.retain;
          } else if (op.insert !== undefined) {
            const pos = monacoModel.getPositionAt(index);
            const range = {
              startLineNumber: pos.lineNumber,
              startColumn: pos.column,
              endLineNumber: pos.lineNumber,
              endColumn: pos.column,
            };
            const insert = op.insert as string;
            monacoModel.applyEdits([{ range, text: insert }]);
            index += insert.length;
          } else if (op.delete !== undefined) {
            const pos = monacoModel.getPositionAt(index);
            const endPos = monacoModel.getPositionAt(index + op.delete);
            const range = {
              startLineNumber: pos.lineNumber,
              startColumn: pos.column,
              endLineNumber: endPos.lineNumber,
              endColumn: endPos.column,
            };
            monacoModel.applyEdits([{ range, text: "" }]);
          }
        });

        this._savedSelections.forEach((rsel, editorItem) => {
          const sel = createMonacoSelectionFromRelativeSelection(
            editorItem,
            ytext,
            rsel,
            this.doc
          );
          if (sel !== null) {
            editorItem.setSelection(sel);
          }
        });
      });
      this._rerenderDecorations();
    };

    ytext.observe(this._ytextObserver);

    // Initial sync
    const ytextValue = ytext.toString();
    if (monacoModel.getValue() !== ytextValue) {
      monacoModel.setValue(ytextValue);
    }

    this._monacoChangeHandler = monacoModel.onDidChangeContent((event) => {
      this.mux(() => {
        this.doc.transact(() => {
          event.changes
            .sort((change1, change2) => change2.rangeOffset - change1.rangeOffset)
            .forEach((change) => {
              ytext.delete(change.rangeOffset, change.rangeLength);
              ytext.insert(change.rangeOffset, change.text);
            });
        }, this);
      });
    });

    this._monacoDisposeHandler = monacoModel.onWillDispose(() => {
      this.destroy();
    });

    if (awareness) {
      editors.forEach((editorItem) => {
        editorItem.onDidChangeCursorSelection(() => {
          if (editorItem.getModel() === monacoModel) {
            const sel = editorItem.getSelection();
            if (sel === null) return;
            let anchor = monacoModel.getOffsetAt(sel.getStartPosition());
            let head = monacoModel.getOffsetAt(sel.getEndPosition());
            if (sel.getDirection() === 1) { // SelectionDirection.RTL = 1
              const tmp = anchor;
              anchor = head;
              head = tmp;
            }
            awareness.setLocalStateField("selection", {
              anchor: Y.createRelativePositionFromTypeIndex(ytext, anchor),
              head: Y.createRelativePositionFromTypeIndex(ytext, head),
            });
          }
        });
      });
      awareness.on("change", this._rerenderDecorations);
    }
  }

  destroy() {
    this._monacoChangeHandler.dispose();
    this._monacoDisposeHandler.dispose();
    this.ytext.unobserve(this._ytextObserver);
    this.doc.off("beforeAllTransactions", this._beforeTransaction);
    if (this.awareness) {
      this.awareness.off("change", this._rerenderDecorations);
    }
  }
}

