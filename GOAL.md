# 目标：thinkts-saas 可组装 SaaS 平台

从通用插件池勾选模块，组装出不同 SaaS 产品。

```
thinkts-saas/
├── packages/
│   ├── thinkts/          ← 框架引擎
│   ├── thinkts-cli/      ← CLI
│   ├── tenant/           ← 租户
│   ├── identity/         ← 用户
│   ├── permission/       ← 权限
│   ├── trade/            ← 订单
│   ├── payment/          ← 支付
│   ├── promote/          ← 营销
│   ├── cms/              ← 内容
│   └── ...
├── apps/
│   └── iotbiz/           ← 共享设备支付平台
└── admin/                ← SaaS 管理后台
```

## 当前状态

| 部分 | 状态 |
|------|------|
| 框架 engine | ✅ PluginLoader + defineModel + 动态路由 |
| 插件 pool | ✅ 8 个插件，30 个 DSL 模型（model.json） |
| 产品 iotbiz | ✅ entry + config + 业务模块 |
| Admin 后台 | 🔶 模板就绪，需改配置驱动渲染 |
| CLI compose | 🔲 未开始 |
| 权限集成 | 🔲 未开始（设计已完成） |

## 定义规范

```
model.ts       ← defineModel({ columns, hooks, system, access })
service.ts     ← class XxxService extends BaseService { ... }
```

## 原则

- thinkts + cli 服务 thinkts-saas，可以改
- 插件 SaaS 通用，业务放 `apps/xxx/src/`
- Admin 基于 shadcn-admin，先搜组件
