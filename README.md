# banana-mall

AI e-commerce detail page generation and editing workspace.

AI 电商详情页生成与编辑工作台。

## Docs

- 中文文档: [README.zh-CN.md](./README.zh-CN.md)
- English Docs: [README.en.md](./README.en.md)

## Quick Start

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Then open the local address printed by Next.js.

请打开 Next.js 启动后输出的本地访问地址。

## Web + Desktop

- Web: `npm run dev` / `npm run build && npm run start`
- Windows EXE: `npm run build:desktop` / `npm run dist:win`

Web 版与桌面 EXE 共用同一套业务代码；桌面版使用 `Electron + Next standalone + electron-builder`。

## Notes

- This project supports OpenAI-compatible providers via `baseURL + apiKey`.
- 该项目支持通过 `baseURL + apiKey` 接入 OpenAI-compatible Provider。
- On this Windows workspace, path-safe wrappers are already included for `next` and `prisma`.
- 在当前 Windows 工作目录下，项目已内置 `next` 与 `prisma` 的路径兼容脚本。
