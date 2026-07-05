# thinkts-saas

SaaS 管理平台 — Monorepo 结构。框架、CLI、插件、产品都在一个仓库。

```
thinkts-saas/
├── package.json          ← workspaces: ["packages/*", "apps/*"]
├── admin/                ← SaaS 管理后台
├── packages/
│   ├── thinkts/          ← 服务器框架
│   ├── thinkts-cli/      ← 脚手架工具
│   ├── tenant/           ← 租户管理
│   ├── identity/         ← 用户/登录
│   ├── permission/       ← 角色/权限
│   ├── trade/            ← 交易订单
│   ├── payment/          ← 支付
│   ├── promote/          ← 营销/优惠券
│   ├── cms/              ← 内容管理
│   ├── dashboard/        ← 运营看板
│   ├── event/            ← 事件/Webhook
│   ├── workflow/         ← 工作流
│   └── audit/            ← 审计日志
└── apps/
    └── iotbiz/            ← 共享设备支付平台
```

## Git 仓库

| 仓库 | URL |
|------|-----|
| thinkts | https://github.com/ynogzh/thinkts |
| thinkts-cli | https://github.com/ynogzh/thinkts-cli |
| thinkts-saas | https://github.com/ynogzh/thinkts-saas |
| iotbiz | https://github.com/ynogzh/iotbiz |
