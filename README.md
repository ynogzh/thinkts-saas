# thinkts-saas

SaaS 管理平台 + 通用插件池（Monorepo）。

```
thinkts-saas/
├── package.json          ← workspaces: ["packages/*"]
├── admin/                ← SaaS 管理后台 (租户/套餐/插件/产品)
├── packages/             ← 通用插件池 (每个是独立可复用模块)
│   ├── tenant/           ← @thinkts/tenant
│   ├── identity/         ← @thinkts/identity
│   ├── permission/       ← @thinkts/permission
│   ├── trade/            ← @thinkts/trade
│   ├── payment/          ← @thinkts/payment
│   ├── promote/          ← @thinkts/promote
│   ├── cms/              ← @thinkts/cms
│   ├── dashboard/        ← @thinkts/dashboard
│   ├── event/            ← @thinkts/event
│   ├── workflow/         ← @thinkts/workflow
│   └── audit/            ← @thinkts/audit
└── apps/                 ← 组装出的产品
    └── iotbiz/            ← 共享设备支付平台 (第一个产品)
```

## 原则

thinkts（框架）和 thinkts-cli（工具）服务于 thinkts-saas（产品）。
如果框架或工具的设计阻碍了平台目标，可以直接修改。

## Git 仓库

| 仓库 | URL |
|------|-----|
| thinkts | https://github.com/ynogzh/thinkts |
| thinkts-cli | https://github.com/ynogzh/thinkts-cli |
| thinkts-saas | https://github.com/ynogzh/thinkts-saas |
| iotbiz | https://github.com/ynogzh/iotbiz |
