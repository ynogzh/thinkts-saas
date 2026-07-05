import { BaseService, AuthError } from "thinkts";

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

class Auth extends BaseService {
  /**
   * Login with account + password, return JWT token.
   *
   * opts: { account, password, tenant_id | tenant_code }
   */
  async login(opts) {
    const account = String(opts.account ?? opts.email ?? opts.username ?? "").trim();
    const password = String(opts.password ?? "");
    if (!account || !password) {
      throw new AuthError("account and password required");
    }

    const tenantId = await this.#resolveTenantId(opts);
    if (!tenantId) {
      throw new AuthError("tenant_id or tenant_code required");
    }

    const userModel = this.model("identity_user");
    userModel.acl("superadmin", this.ctx);

    let user = await userModel.where({ tenant_id: tenantId, email: account }).find();
    if (!user?.id) {
      user = await userModel.where({ tenant_id: tenantId, username: account }).find();
    }
    if (!user?.id || user.status !== "enabled") {
      throw new AuthError("invalid account or password");
    }

    // Verify password (plaintext for now — override with bcrypt in beforeCreate hook)
    if (String(user.password_hash ?? "") !== password) {
      throw new AuthError("invalid account or password");
    }

    // Resolve role via permission plugin (optional, degrades gracefully)
    let role = user.user_type === "admin" ? "admin" : "user";
    let roleId;
    try {
      const userRole = await this.service("permission.user.role.getPrimaryRole", {
        tenant_id: tenantId,
        user_id: user.id,
      });
      if (userRole?.role_id) {
        roleId = Number(userRole.role_id);
        const roleRow = await this.service("permission.role.getById", {
          tenant_id: tenantId,
          id: roleId,
        });
        role = String(roleRow?.code ?? role);
      }
    } catch {
      // Permission plugin not loaded — use default role
    }

    const payload = {
      id: Number(user.id),
      email: user.email,
      username: user.username,
      name: user.nickname ?? user.username,
      role,
      role_id: roleId,
      tenant_id: tenantId,
      main_dept_id: user.main_dept_id,
      user_type: user.user_type,
    };

    const secret = process.env.JWT_SECRET || "thinkts-secret";
    const token = await this.#signJWT(payload, secret);
    return { token, user: payload };
  }

  /** Register a new user. */
  async register(opts) {
    const tenantId = await this.#resolveTenantId(opts);
    if (!tenantId) throw new AuthError("tenant_id or tenant_code required");

    const userModel = this.model("identity_user");
    const exists = await userModel.where({ tenant_id: tenantId, email: opts.email }).find();
    if (exists?.id) throw new AuthError("email already registered");

    return userModel.add({
      tenant_id: tenantId,
      email: opts.email,
      username: opts.username ?? opts.email,
      nickname: opts.nickname,
      password_hash: opts.password,
      status: "enabled",
      user_type: opts.user_type ?? "user",
    });
  }

  /** Resolve tenant_id from opts or tenant_code. */
  async #resolveTenantId(opts) {
    if (opts.tenant_id !== undefined && opts.tenant_id !== null && opts.tenant_id !== "") {
      return Number(opts.tenant_id);
    }
    const tenantCode = String(opts.tenant_code ?? "").trim();
    if (!tenantCode) return null;
    const tenant = await this.service("platform.tenant.resolveEnabledTenant", { code: tenantCode });
    return tenant?.id ? Number(tenant.id) : null;
  }

  /** Sign a JWT with HS256. */
  async #signJWT(payload, secret) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = { ...payload, iat: now, exp: now + 86400 };

    const data = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(fullPayload))}`;
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

export const hooks = {
  beforeCreate(data) {
    if (!data.email && !data.username) throw new Error("email or username required");
    if (!data.tenant_id) throw new Error("tenant_id required");
    // Hash password in production — override this hook in app layer
    return data;
  },
};

export default { Auth };
