const OWNER_SESSION_DURATION_SECONDS = 60 * 60 * 8;

export const OWNER_SESSION_COOKIE = "masalto_social_hub_owner";

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function constantTimeEquals(left: string, right: string) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return encodeBase64Url(new Uint8Array(signature));
}

export function hasMatchingOwnerAccessSecret(candidate: string, secret: string) {
  return Boolean(candidate && secret && constantTimeEquals(candidate, secret));
}

export async function createOwnerSession(secret: string, now = Date.now()) {
  const expiresAt = now + OWNER_SESSION_DURATION_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload, secret)}`;
}

export async function hasValidOwnerSession(
  session: string | undefined,
  secret: string,
  now = Date.now(),
) {
  if (!session || !secret) return false;

  const [payload, signature, extra] = session.split(".");
  if (!payload || !signature || extra) return false;

  const expiresAt = Number(payload);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;

  return constantTimeEquals(signature, await sign(payload, secret));
}

export function ownerSessionMaxAge() {
  return OWNER_SESSION_DURATION_SECONDS;
}
