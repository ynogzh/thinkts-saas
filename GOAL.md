# 目标：thinkts-saas 可组装 SaaS 平台 ✅

从通用插件池勾选模块，组装出不同 SaaS 产品。

```
thinkts-saas/
├── packages/
│   ├── thinkts/          ← 框架引擎 ✅
│   ├── thinkts-cli/      ← CLI ✅
│   ├── tenant/           ← 租户 ✅
│   ├── identity/         ← 用户 ✅
│   ├── permission/       ← 权限 ✅
│   ├── trade/            ← 订单 ✅
│   ├── payment/          ← 支付 ✅
│   ├── promote/          ← 营销 ✅
│   ├── cms/              ← 内容 ✅
│   └── ...
├── apps/
│   └── iotbiz/           ← 共享设备支付平台 ✅
└── admin/                ← SaaS 管理后台 ✅
```

## thinkts — 服务器框架

| 功能 | 文件 | 说明 |
|------|------|------|
| PluginLoader | `plugin.ts` | 拓扑依赖加载 |
| defineModel | `model/define.ts` | 单源定义（列+钩子+权限+系统） |
| BaseService | `service.ts` | this.model()/create()/update()/remove() |
| Router | `router/` | Radix Tree 匹配 + DSL 路由 + Admin API |
| Admin API | `model/admin-api.ts` | 9 端点：menus/tables/forms/actions |
| Tests | 17 files | 125 pass, 0 fail |

## thinkts-cli

| 命令 | 说明 |
|------|------|
| `thinkts new <name>` | 创建项目 |
| `thinkts generate` | DB 表 → model.ts + service.ts |
| `thinkts manifest` | 生成 manifest.json |

## admin — 通用 SaaS 管理后台 (shadcn-admin)

| 组件 | 文件 | 说明 |
|------|------|------|
| DynamicSidebar | `app-sidebar.tsx` | /menus API 驱动，按模块分组 |
| DynamicTable | `dynamic-table.tsx` | TableConfig → TanStack Table + 编辑/删除 |
| DynamicForm | `dynamic-form.tsx` | FormFieldMeta[] → text/number/select/date/switch/textarea |
| ResourcePage | `resource-page.tsx` | 通用 CRUD 页面：表格 + 弹窗表单 |
| useMenus | `hooks/use-menus.ts` | React Query 获取菜单 |
| API Client | `lib/admin-api.ts` | 全量 fetchMenus/fetchList/CRUD |

## 定义规范

```
model.ts       ← defineModel({ columns, hooks, system, access })
service.ts     ← class Service extends BaseService { ... }
```

## 技术栈

| 层 | 技术 |
|----|------|
| Admin 框架 | React 19 + TanStack Router + React Query |
| UI 组件 | shadcn/ui (Radix) |
| 表格 | TanStack Table + DynamicTable |
| 表单 | DynamicForm + 内联 state |
| 构建 | Vite 8 (dev 正常, build 等 TanStack Router 升级) |
| 后端 | Bun + thinkts |
