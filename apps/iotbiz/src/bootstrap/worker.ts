import type { ThinkGlobal } from "thinkts";

/**
 * iotbiz bootstrap — register kernel hooks after all plugins loaded.
 */
function bootstrap(think: ThinkGlobal): void {
  think.beforeAction(async (ctx) => {
    const tenantId = ctx.state?.tenantId ?? ctx.tenantId;
    if (tenantId) {
      ctx.state = { ...(ctx.state ?? {}), tenantId };
    }
  }, 100, "iotbiz");

  const publicRoutes: Record<string, boolean> = {
    "open/index": true,
    "open/login": true,
    "open/logout": true,
    "open/userinfo": true,
    "platform/tenant/init": true,
    "identity/user/register": true,
  };

  think.beforeAction(async (ctx) => {
    const routeKey = `${ctx.module}/${ctx.controller}/${ctx.action}`;
    if (publicRoutes[routeKey]) return;

    const tenantId = ctx.state?.tenantId ?? ctx.tenantId;
    if (!tenantId) {
      const header = ctx.request?.headers?.get?.("x-tenant-id");
      if (header) {
        ctx.state = { ...(ctx.state ?? {}), tenantId: Number(header) };
      }
    }
  }, 50, "iotbiz");
}

export default bootstrap;
