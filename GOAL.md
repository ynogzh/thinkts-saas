# 目标

把 thinkts 搞成插件系统。每个模块写 `plugin.ts` 自声明。模块扫自己的目录注册模型和接口。

```
thinkts-saas/               ← monorepo
├── packages/
│   ├── thinkts/
│   ├── thinkts-cli/
│   ├── tenant/
│   ├── identity/
│   └── ...
├── apps/iotbiz/
└── admin/
```

原则：thinkts 和 thinkts-cli 服务于 thinkts-saas，可以改。
