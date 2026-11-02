import { AccessToken } from "livekit-server-sdk";

export function isLiveKitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_API_KEY &&
    process.env.LIVEKIT_API_SECRET &&
    (process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL),
  );
}

export function getLiveKitUrl(): string {
  return (
    process.env.NEXT_PUBLIC_LIVEKIT_URL ||
    process.env.LIVEKIT_URL ||
    "wss://demo.livekit.cloud"
  );
}

/**
 * Generates a signed LiveKit JWT access token for a user to join a specific room.
 * Runs strictly server-side.
 */
export async function createLiveKitToken({
  roomName,
  userId,
  userName,
  canPublish = true,
  canSubscribe = true,
}: {
  roomName: string;
  userId: string;
  userName: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
}): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret =
    process.env.LIVEKIT_API_SECRET ||
    "secret_key_that_is_at_least_32_characters_long";

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: userName,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish,
    canSubscribe,
  });

  return await at.toJwt();
}

