import { BaseService, AuthError } from "thinkts";

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString("base64url");
}

export default class Auth extends BaseService {
  async login(opts: Record<string, unknown>) {
    const account = String(opts.account ?? opts.email ?? opts.username ?? "").trim();
    const password = String(opts.password ?? "");
    if (!account || !password) throw new AuthError("account and password required");

    const tenantId = opts.tenant_id ? Number(opts.tenant_id) : undefined;
    const tenantCode = opts.tenant_code ? String(opts.tenant_code) : undefined;
    if (!tenantId && !tenantCode) throw new AuthError("tenant_id or tenant_code required");

    let tenant = null;
    if (tenantId) {
      tenant = await this.model("platform_tenant").where({ id: tenantId }).find();
    } else if (tenantCode) {
      tenant = await this.model("platform_tenant").where({ code: tenantCode }).find();
    }
    if (!tenant?.id) throw new AuthError("tenant not found");

    const userModel = this.model("identity_user");
    userModel.acl("superadmin", this.ctx);
    const user = await userModel.where({ tenant_id: tenant.id, email: account }).find();
    if (!user?.id) throw new AuthError("account not found");

    // TODO: real password verification
    if (user.password_hash !== password) throw new AuthError("password incorrect");

    const roleIds = await this.model("permission_user_role")
      .where({ user_id: user.id }).select() as Array<{ role_id: number }>;

    const payload: Record<string, unknown> = {
      sub: String(user.id),
      tenant_id: tenant.id,
      username: user.username,
      roles: roleIds.map((r) => r.role_id),
    };
    const secret = process.env.JWT_SECRET ?? "thinkts-dev";
    const token = await this.#signJWT(JSON.stringify(payload), secret);
    return { token, user, payload };
  }

  async beforeCreate(_ctx: unknown, data: Record<string, unknown>) {
    if (!data.email && !data.username) throw new Error("email or username required");
    if (!data.tenant_id) throw new Error("tenant_id required");
    return data;
  }

  async #signJWT(payload: string, secret: string): Promise<string> {
    const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
    const data = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    return `${data}.${base64UrlEncode(String.fromCharCode(...new Uint8Array(sig)))}`;
  }
}
