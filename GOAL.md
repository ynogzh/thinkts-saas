# 目标：实现 thinkts 插件系统

## 一句话

每个插件写 `plugin.ts` 自声明，框架按依赖加载。插件自己扫自己的 models/services。

## 产物结构

```
thinkts-saas/
├── packages/
│   ├── thinkts/           ← 框架：实现插件加载器
│   ├── thinkts-cli/
│   ├── tenant/            ← 租户插件
│   ├── identity/          ← 用户插件
│   └── ...
├── apps/iotbiz/
└── admin/
```

## 插件规范

```ts
// packages/tenant/plugin.ts
export default {
  name: "tenant",
  depends: [],

  async load(ctx) {
    ctx.scanModels("./models");      // 扫自己的 models/ 目录
    ctx.scanServices("./services");  // 扫自己的 services/ 目录
  },
};
```

## 框架要做的

1. 启动时扫 `packages/` 找所有 `plugin.ts`
2. 按 `depends` 拓扑排序
3. 按序调用 `plugin.load(ctx)`
4. `ctx` 上暴露 `scanModels`、`scanServices`、`model`、`service` 等方法

## 原则

- thinkts 和 thinkts-cli 服务于 thinkts-saas，可以改
- 每个变更必须通过现有测试
- 插件必须是 SaaS 通用的，业务逻辑不放插件里
