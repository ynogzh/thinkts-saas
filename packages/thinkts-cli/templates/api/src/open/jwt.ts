const encoder = new TextEncoder();

function b64urlDecode(s: string): string {
  return atob(s.replace(/-/g, "+").replace(/_/g, "/"));
}

async function importKey(secret: string, alg: string): Promise<CryptoKey> {
  const hash = alg === "HS512" ? "SHA-512" : alg === "HS384" ? "SHA-384" : "SHA-256";
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash }, false, ["sign", "verify"]);
}

export async function sign(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn = "24h",
  alg = "HS256",
): Promise<string> {
  const header = { alg, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const expMatch = expiresIn.match(/^(\d+)([smhd])$/);
  let exp = now + 86400;
  if (expMatch) {
    const n = parseInt(expMatch[1], 10);
    const unit = expMatch[2];
    exp = now + n * ({ s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 86400);
  }
  const claims = { ...payload, iat: now, exp };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(claims)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const data = encoder.encode(`${headerB64}.${payloadB64}`);

  const key = await importKey(secret, alg);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
  const sigB64 = btoa(String.fromCharCode(...sig)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

export async function verify(
  token: string,
  secret: string,
  alg = "HS256",
): Promise<Record<string, unknown>> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const [headerB64, payloadB64, signatureB64] = parts;

  const key = await importKey(secret, alg);
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const sig = Uint8Array.from(b64urlDecode(signatureB64), c => c.charCodeAt(0));

  const valid = await crypto.subtle.verify("HMAC", key, sig, data);
  if (!valid) throw new Error("Invalid signature");

  const payload = JSON.parse(b64urlDecode(payloadB64)) as Record<string, unknown>;
  if (typeof payload.exp === "number" && Date.now() / 1000 > payload.exp) {
    throw new Error("Token expired");
  }
  return payload;
}
