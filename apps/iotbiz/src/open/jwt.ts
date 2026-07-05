function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return atob(padded);
}

async function importKey(secret: string, alg: string): Promise<CryptoKey> {
  const data = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    data,
    { name: "HMAC", hash: alg === "HS512" ? "SHA-512" : alg === "HS384" ? "SHA-384" : "SHA-256" },
    false,
    ["verify"]
  );
}

export async function verifyJWT(token: string, secret: string, alg = "HS256"): Promise<Record<string, unknown>> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const [headerB64, payloadB64, signatureB64] = parts;
  const payload = JSON.parse(base64UrlDecode(payloadB64)) as Record<string, unknown>;

  const key = await importKey(secret, alg);
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

  const valid = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!valid) throw new Error("Invalid JWT signature");

  const exp = payload.exp;
  if (typeof exp === "number" && Date.now() / 1000 > exp) {
    throw new Error("JWT expired");
  }
  return payload;
}
