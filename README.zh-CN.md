# banana-mall

`banana-mall` 是一个本地优先的 V1 AI 电商详情页生成与编辑工作台。

它支持：

- 连接任意 OpenAI-compatible Provider，使用 `baseURL + apiKey`
- 拉取 `/models`，做模型能力归一化和默认角色推荐
- 创建商品项目并上传素材
- 基于商品图片做结构化 AI 分析
- 生成可编辑、可排序、可单独重试的 section 级详情页方案
- 按 section 独立生成图片
- 在手机模拟器中预览整张移动端长页
- 编辑/重生成单个 section
- 保留 section 版本历史并导出 JSON / 图片

## 技术栈

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn 风格 UI 基础组件
- Zustand
- react-hook-form + Zod
- Prisma + SQLite
- 本地文件系统存储
- OpenAI-compatible AI 适配层

## 项目结构

```text
auto_mall/
  app/
    api/
    projects/
    settings/
  components/
    analysis/
    editor/
    export/
    layout/
    planner/
    projects/
    providers/
    shared/
    ui/
  hooks/
  lib/
    ai/
      adapters/
      prompts/
      schemas/
    db/
    services/
    storage/
    utils/
    validations/
  prisma/
    migrations/
    schema.prisma
  scripts/
  storage/
    uploads/
    generated/
    exports/
  types/
```

## 主要工作流

1. 打开 `/settings/providers`
2. 输入 `Provider 名称 + baseURL + apiKey`
3. 测试连接
4. 发现模型并查看能力标签
5. 保存当前 Provider 和默认模型角色
6. 打开 `/projects/new` 创建商品项目
7. 上传主图、多角度图、细节图、参考图
8. 在 `/projects/[id]/analysis` 运行商品分析
9. 在 `/projects/[id]/planner` 生成和编辑 section 规划
10. 在 `/projects/[id]/editor` 生成 section 图片并做单段编辑
11. 在 `/projects/[id]/export` 导出项目 JSON 和图片

## Provider 接口约定

V1 默认按 OpenAI-compatible 接口处理，要求 Provider 至少兼容：

- `GET /models`
- `POST /chat/completions`
- `POST /images/generations`

当前实现没有写死某一家供应商，重点是兼容 OpenAI 风格协议。

## 环境变量

项目已附带一个可直接本地运行的 `.env`。如果要自定义，可以参考 `.env.example`。

```env
DATABASE_URL="file:./dev.db"
APP_SECRET="replace-with-your-own-long-secret"
STORAGE_ROOT="./storage"
APP_RUNTIME="web"
# APP_USER_DATA_DIR=""
NEXT_PUBLIC_APP_NAME="banana-mall"
```

说明：

- `DATABASE_URL` 指向 SQLite 数据库
- `APP_SECRET` 用于加密存储 Provider API Key
- `STORAGE_ROOT` 用于本地上传图、生成图、导出文件目录
- `APP_RUNTIME` 用于区分 `web / desktop`
- `APP_USER_DATA_DIR` 预留给桌面版运行时注入，Web 模式通常不需要手动填写

## 安装与运行

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

启动后访问：

- `http://localhost:3000`
- 如果 `3000` 被占用，Next.js 会自动切换到下一个可用端口

## 双形态运行

当前项目同时兼容：

- 网页版
- Windows EXE 桌面版

两者共用同一套：

- Next.js 页面
- Route Handlers API
- Prisma 数据模型
- AI Provider 适配层
- 本地素材与导出逻辑

区别只在运行容器和运行时路径：

- Web 模式继续按当前 Node + Next 方式运行
- Desktop 模式通过 `Electron` 启动内置的 Next standalone 服务，再以桌面窗口承载界面

### Web 版命令

```bash
npm run dev
npm run build
npm run start
```

### Desktop 版命令

```bash
npm run build:desktop
npm run desktop:start
npm run dist:win
```

说明：

- `build:desktop`：构建 Next standalone 并准备桌面分发文件
- `desktop:start`：本地启动 Electron 桌面版
- `dist:win`：生成 Windows 安装包 `exe`

### 桌面版数据目录

桌面版不会把数据写回项目源码目录，而是写入当前 Windows 用户目录下的应用数据目录，例如：

- `%APPDATA%/banana-mall/prisma/dev.db`
- `%APPDATA%/banana-mall/storage/uploads`
- `%APPDATA%/banana-mall/storage/generated`
- `%APPDATA%/banana-mall/storage/exports`

Electron 启动时会自动注入：

- `APP_RUNTIME=desktop`
- `DATABASE_URL`
- `STORAGE_ROOT`
- `APP_SECRET`
- `APP_USER_DATA_DIR`

这样可以保证：

- Web 版和 Desktop 版共用代码，但不互相污染运行数据
- 升级桌面安装包时，历史项目仍保留在用户目录

## 已验证命令

以下命令已在当前工作区验证通过：

- `npm install`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run build`
- `npm run dev`

桌面打包相关命令将在安装 `electron` 与 `electron-builder` 后可用：

- `npm run build:desktop`
- `npm run desktop:start`
- `npm run dist:win`

## Windows 路径兼容说明

当前项目所在父目录名包含 `&`，这会导致 Windows 下部分 npm 二进制 shim 失效。

为了保证你在这个目录里仍然可以直接执行常规命令，项目内置了路径兼容包装脚本：

- `scripts/run-next-safe.cjs`
- `scripts/run-prisma-safe.cjs`
- `scripts/apply-prisma-migrations.cjs`
- `scripts/build-desktop.cjs`

因此你仍然可以直接使用：

- `npm run dev`
- `npm run prisma:generate`
- `npm run prisma:migrate`

## 数据库与迁移

- Prisma Schema: [prisma/schema.prisma](./prisma/schema.prisma)
- 初始迁移 SQL: [prisma/migrations/20260324000000_init/migration.sql](./prisma/migrations/20260324000000_init/migration.sql)
- 本地迁移脚本会将数据库初始化到 `prisma/dev.db`

当前核心数据模型包括：

- `Project`
- `ProviderConfig`
- `ModelProfile`
- `ProductAsset`
- `ProductAnalysis`
- `PageSection`
- `SectionVersion`
- `GenerationTask`

## 本地存储目录

- 上传素材：`storage/uploads/{projectId}`
- 生成图片：`storage/generated/{projectId}/{sectionId}`
- 导出结果：`storage/exports/{projectId}`

图片文件存储在本地，但数据库中的 JSON 和结构化记录仍然是系统事实源。

## 页面说明

- `/`：项目总览 Dashboard
- `/settings/providers`：Provider 配置中心
- `/projects/new`：新建项目
- `/projects/[id]/analysis`：商品分析页
- `/projects/[id]/planner`：section 规划页
- `/projects/[id]/editor`：主编辑工作台
- `/projects/[id]/export`：导出中心

## API 说明

- Provider：`/api/providers/*`
- 项目：`/api/projects/*`
- 素材：`/api/assets/*`
- 分析：`/api/projects/:id/analyze`
- 规划：`/api/projects/:id/plan-sections`
- 生成：`/api/projects/:id/sections/:sectionId/*`
- 导出：`/api/projects/:id/export/*`

统一返回格式：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## V1 当前能力边界

- UI 和生成内容默认以中文为主
- 商品分析是结构化 JSON 输出，不是散文式回答
- 详情页生成是 section-based，不是整页黑箱一次生成
- 每个 section 都可以单独生成、单独失败、单独重试
- section 图片支持版本历史与激活切换
- 导出支持项目 JSON 和全部激活 section 图片
- 图像编辑 / inpainting 目前只预留接口，还未完整实现
- 长图拼接导出暂未纳入 V1
- 桌面版当前优先支持 Windows，采用 Electron 包装，不包含自动更新

## 后续可扩展方向

- 后台任务队列 / worker
- Provider 专属高级图像编辑能力
- 多用户与权限体系
- 长图拼接导出
- 更精细的模型探测、成本估算和调用观测
