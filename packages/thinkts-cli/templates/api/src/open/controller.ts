import { BaseController } from "thinkts";
import * as jwt from "./jwt";

/**
 * Public auth controller — no authentication required.
 * Handles login, token refresh, and public user info.
 */
export default class OpenController extends BaseController {
  /** Health check. */
  indexAction() {
    return this.success({ status: "ok" });
  }

  /** Login with username/password. */
  async loginAction(opts: Record<string, unknown>) {
    const { username, password } = opts;
    if (!username || !password) {
      return this.fail(400, "Username and password required");
    }
    const userModel = this.model("identity/user");
    const user = await userModel.where({ username }).find() as Record<string, unknown> | null;
    if (!user) return this.fail(401, "Invalid credentials");

    // Simple password check — override for production
    const pwdMatch = password === user.password || password === user.encrypted_password;
    if (!pwdMatch) return this.fail(401, "Invalid credentials");

    if (user.status === "disabled") return this.fail(403, "Account disabled");

    const payload = {
      user_id: user.id,
      tenant_id: user.tenant_id,
      username: user.username,
      role: user.role ?? "admin",
    };
    const secret = process.env.JWT_SECRET || "thinkts-secret";
    const token = await jwt.sign(payload, secret);
    const refreshToken = await jwt.sign({ ...payload, type: "refresh" }, secret, "7d");

    return this.success({
      data: { token, refreshToken, user: payload },
    });
  }

  /** Refresh access token. */
  async refreshAction(opts: Record<string, unknown>) {
    const { refreshToken } = opts;
    if (!refreshToken) return this.fail(400, "Refresh token required");
    const secret = process.env.JWT_SECRET || "thinkts-secret";
    try {
      const payload = await jwt.verify(String(refreshToken), secret);
      if (payload.type !== "refresh") return this.fail(401, "Invalid refresh token");
      const { type, exp, iat, ...userPayload } = payload;
      const token = await jwt.sign(userPayload, secret);
      return this.success({ data: { token } });
    } catch {
      return this.fail(401, "Invalid refresh token");
    }
  }

  /** Get current user info from token. */
  async userinfoAction() {
    const auth = this.ctx.user as Record<string, unknown> | undefined;
    if (!auth) return this.fail(401, "Not authenticated");
    return this.success({ data: auth });
  }
}
