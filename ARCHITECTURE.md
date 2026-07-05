# ThinkTS-SaaS 总架构

## 三层结构

```
┌─────────────────────────────────────────────────────┐
│                    thinkts-saas                      │
│                                                     │
│  admin/          ← 通用 SaaS 管理后台 (shadcn-admin)  │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│    │ 租户管理  │  │ 权限配置  │  │ 内容管理  │  ...    │
│    └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  apps/           ← 组装出的每个 SaaS 产品             │
│    ┌──────────┐  ┌──────────┐                       │
│    │  iotbiz  │  │  mall    │  ...                   │
│    └──────────┘  └──────────┘                       │
│                                                     │
│  packages/       ← 插件池 + 框架                     │
│    ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐      │
│    │tenant││ident││perm ││trade││pay  ││ cms │...   │
│    └─────┘└─────┘└─────┘└─────┘└─────┘└─────┘      │
│    ┌────────────────────────┐                       │
│    │      thinkts engine     │                      │
│    └────────────────────────┘                       │
│    ┌────────────────────────┐                       │
│    │      thinkts-cli        │                      │
│    └────────────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

## thinkts — 服务器框架

职责：路由、模型、认证、中间件。不关心 SaaS。

```
请求 → 中间件链 → 路由匹配 → 鉴权 → Handler → 响应
                ↑            ↑
            plugin         model.ts
            bootstrap      service.ts
```

| 子系统 | 文件 | 职责 |
|--------|------|------|
| Kernel | `think.ts` | 应用生命周期、插件加载、初始化 |
| PluginLoader | `plugin.ts` | 拓扑排序、依赖解析、load/boot |
| Router | `router/` | Radix tree 匹配、DSL 路由注册、admin API |
| Model | `model/` | defineModel、QueryBuilder、Executor、动态表注册 |
| Service | `service.ts` | BaseService、服务间调用、CRUD 快捷方法 |
| Middleware | `kernel/lifecycle.ts` | JWT 认证、租户隔离、日志、限流 |
| DB | `db/builder.ts` | 连接池、SQL 生成、参数化查询 |

### Plugin 定义规范

```
packages/<name>/
├── package.json        ← { "thinkts": { "depends": ["tenant"] } }
├── index.ts            ← export { name, depends, version }
├── models/             ← 模型定义 + 数据库
│   └── platform_tenant/
│       ├── model.ts    ← defineModel(...)
│       ├── service.ts  ← class XxxService extends BaseService
│       └── migration.sql
└── src/routes/         ← 自定义路由 handler（可选）
```

## thinkts-cli — 项目工具

```
thinkts create <name>       → 新建产品（模型 + 路由 + 模板）
thinkts generate model <n>  → 从 DB 表生成 model.ts
thinkts compose             → 勾选插件组装产品
thinkts migrate             → 运行所有插件的 migration.sql
```

## admin — 通用 SaaS 管理后台

基于 shadcn-admin，通过 API 获取模型元数据，配置驱动渲染。

### 布局

```
┌──────┬──────────────────────────────┐
│      │                              │
│ Menu │         内容区                │
│      │                              │
│ ──── │   ┌──────── ┌──────────┐    │
│ 📊   │   │ 统计卡片 │ 图表区域   │    │
│      │   └──────── └──────────┘    │
│ ──── │                              │
│ 👥   │   ┌─────────────────┐       │
│ 租户  │   │  表格（动态列渲染） │       │
│ 用户  │   └─────────────────┘       │
│ 角色  │                              │
│ ──── │                              │
│ ⚙️   │                              │
│ 系统  │                              │
│ 菜单  │                              │
│ ──── │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

### 菜单自动生成

框架暴露 `/admin/api/menus` — 返回按插件分组的菜单树：

```json
[
  { "key": "/dashboard", "label": "仪表盘", "icon": "LayoutDashboard" },
  {
    "key": "/tenant",
    "label": "租户",
    "icon": "Building",
    "children": [
      { "key": "/tenant/platform_tenant", "label": "平台租户" },
      { "key": "/tenant/tenant_module",    "label": "租户模块" }
    ]
  },
  { "key": "/identity", "label": "用户", "icon": "Users", "children": [...] },
  ...
]
```

Admin 启动时请求 `/admin/api/menus`，动态渲染侧边栏。每个模型节点路由到 `/resources/<plugin>/<model>`。

### 资源页面（通用 CRUD）

路由 `/resources/$plugin/$model` 渲染通用表格页：

```
┌─────────────────────────────────────────┐
│  [搜索框] [重置]        [+ 新增] [导出]  │
│─────── 筛选条件 ────────                │
│ ┌───┐ ┌───┐ ┌───┐                       │
│ │状态│ │时间│ │类型│                       │
│ └───┘ └───┘ └───┘                       │
│────────────────────────────────────────  │
│ □  ID  │  名称  │ 状态 │ 时间 │  操作    │
│────────────────────────────────────────  │
│ □  1   │  ...  │ ...  │ ...  │ 编辑 删除  │
│ □  2   │  ...  │ ...  │ ...  │ 编辑 删除  │
│────────────────────────────────────────  │
│ 共 100 条  [<] 1 2 3 ... 10 [>]         │
└─────────────────────────────────────────┘
```

表格列从 `/admin/api/tables/<model>` 获取的 `tableConfig` 驱动：

```ts
interface TableConfig {
  model: string;
  label: string;
  columns: ColumnMeta[];
  filters: FilterMeta[];
  actions: ActionMeta[];      // create, edit, delete, export
  primaryKey: string;
}
```

### 表单页（新增/编辑）

同一路由 `?action=create` 或 `/<id>` 渲染表单：

```ts
interface FormConfig {
  model: string;
  label: string;
  fields: FieldMeta[];
  layout: "vertical" | "horizontal" | "grid";
  primaryKey: string;
}

interface FieldMeta {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "textarea" | "switch";
  required: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}
```

### Admin API 总览

| 端点 | 说明 | 返回 |
|------|------|------|
| `/admin/api/menus` | 菜单树 | `MenuNode[]` |
| `/admin/api/tables/<model>` | 表格配置 | `TableConfig` |
| `/admin/api/tables/<model>/data` | 表格数据 | `{ data, total, page, pageSize }` |
| `/admin/api/forms/<model>` | 表单配置 | `FormConfig` |
| `/admin/api/forms/<model>/<id>` | 单条数据 | `{ data }` |
| `/admin/api/actions/<model>/create` | 新增 | `{ data }` |
| `/admin/api/actions/<model>/update` | 更新 | `{ data }` |
| `/admin/api/actions/<model>/delete` | 删除 | `{ ok }` |

### 技术选型

| 层 | 技术 | 说明 |
|----|------|------|
| Admin 框架 | Next.js + shadcn-admin | 服务端渲染、动态路由 |
| UI 组件 | shadcn/ui (Radix) | Table, Form, Dialog, Select, Command |
| 表格 | TanStack Table | 排序、筛选、分页、选择 |
| 表单 | react-hook-form + zod | 动态字段 + 验证 |
| 状态 | URL search params | 所有筛选/分页/排序在 URL |
| 图标 | lucide-react | 菜单图标，从模型元数据映射 |
| 菜单 | SidebarMenu | shadcn-admin 侧边栏，动态注入 |

## 数据流

```
                        ┌──────────┐
                        │    DB    │
                        └────┬─────┘
                             │
                    ┌────────▼────────┐
                    │   thinkts SDK   │
                    │  .model()       │
                    │  .service()     │
                    └───┬─────────┬───┘
                        │         │
              ┌─────────▼──┐  ┌──▼──────────┐
              │  Admin API │  │  Business   │
              │  /tables/* │  │  Handlers   │
              │  /forms/*  │  │             │
              │  /actions/*│  │             │
              └─────┬──────┘  └──────┬──────┘
                    │                │
              ┌─────▼────────────────▼─────┐
              │        Next.js Admin       │
              │  DynamicTable  DynamicForm │
              │  menus → sidebar           │
              └────────────────────────────┘
```
