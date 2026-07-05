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
| 部分 | 说明 | 要求 |
|------|------|------|
| **thinkts** | 服务器框架，插件系统。抽象底层（路由、DB、中间件、认证、错误处理），上层只写业务 |
| **thinkts-cli** | 脚手架，compose 勾选插件生成产品 | 封装易用，一条命令 |
| **thinkts-saas** | SaaS 管理后台 + 通用插件池 | 插件必须 SaaS 通用 |
| **iotbiz** | 第一个组装产品 | 验证平台可用 |

## 原则

- thinkts 和 thinkts-cli 服务于 thinkts-saas，可以改
- 插件 SaaS 通用。业务特定逻辑放在 `apps/xxx/src/` 里

后台基于 [shadcn-admin-2.2.0](https://github.com/shadcn-admin/shadcn-admin)，实现功能前先搜索现有组件，再利用组件实现。
