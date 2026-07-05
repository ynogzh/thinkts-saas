# 目标：thinkts-saas 可组装 SaaS 平台

## 终局

一个 monorepo，从通用插件池勾选模块，组装出不同 SaaS 产品。

```
thinkts-saas/
├── packages/
│   ├── thinkts/          ← 框架引擎
│   ├── thinkts-cli/      ← 命令行工具
│   ├── tenant/           ← 插件：租户
│   ├── identity/         ← 插件：用户
│   ├── permission/       ← 插件：权限
│   ├── trade/            ← 插件：订单
│   ├── payment/          ← 插件：支付
│   ├── promote/          ← 插件：营销
│   ├── cms/              ← 插件：内容
│   └── ...
├── apps/
│   └── iotbiz/           ← 产品：共享设备支付平台
├── admin/                ← SaaS 管理后台（租户/套餐/插件管理）
└── bun.lock
```

## 组成部分

| 部分 | 说明 |
|------|------|
| **thinkts** | 服务器框架。支持插件系统：plugin.ts 自声明，拓扑加载。插件扫自己的目录注册 model/service |
| **thinkts-cli** | 脚手架工具。`thinkts compose` 勾选插件生成产品 |
| **thinkts-saas** | 平台本身。含 SaaS 管理后台 + 通用插件池。所有插件必须 SaaS 通用，不放业务逻辑 |
| **iotbiz** | 第一个组装产品。引用通用插件 + 自己的设备业务模块 |

## 原则

- thinkts 和 thinkts-cli 服务于 thinkts-saas，可以改
- 插件 SaaS 通用。业务特定逻辑放在 `apps/xxx/src/` 里
