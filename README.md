# Banana Mall 🍌

> AI-powered e-commerce detail page generation & editing workspace  
> AI 电商详情页生成与编辑工作台

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron" />
  <img src="https://img.shields.io/badge/AI-OpenAI%20Compatible-green" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
  <img src="https://img.shields.io/github/stars/ziguishian/banana-mall?style=social" />
</p>

## ✨ Overview / 项目简介

Banana Mall is an AI-native workspace designed to turn product images into fully structured, high-conversion e-commerce detail pages.

Banana Mall 是一个 AI 原生的电商内容工作台，可以将商品图片转化为完整的高转化详情页。由 MatrixInspire（灵矩绘境） 开发。

---

<img width="3840" height="2029" alt="image" src="https://github.com/user-attachments/assets/8f197875-61f3-4513-a8f6-a162f5d245bf" />

## 🧠 What You Can Do / 核心能力

- 🖼️ Upload product images and analyze product information  
  上传商品图片，自动解析产品信息

- ✍️ Generate structured detail pages with AI  
  使用 AI 生成结构化电商详情页

- 🧩 Edit and regenerate sections flexibly  
  支持模块级编辑与重生成

- 🔌 Connect any OpenAI-compatible API  
  支持接入任意 OpenAI-compatible API

- 🧪 Multi-model support (Gemini / OpenAI / custom providers)  
  支持多模型（Gemini / OpenAI / 自定义模型）

- 💻 Run as Web app or Desktop app  
  支持 Web 与桌面端运行

---

## 📸 Demo / 示例展示

### 🧩 Detail Page Editor / 编辑器界面
<img width="3840" height="2029" alt="image" src="https://github.com/user-attachments/assets/9319d45c-a38d-4e1e-806a-a1bca8e2960b" />



### 🧠 AI Product Analysis / AI 商品分析
<img width="3840" height="2029" alt="image" src="https://github.com/user-attachments/assets/46a1cbbd-f757-4731-a8c5-fa79cc220b84" />


### 📦 Generated Result / 生成结果
<img width="3840" height="2029" alt="image" src="https://github.com/user-attachments/assets/bd671ab3-7ac9-410e-8d0a-073c8291d791" />

---

## 🚀 Quick Start / 快速开始

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Then open the local address printed by Next.js.  
请打开 Next.js 启动后输出的本地访问地址。

---

## 🔑 Environment / 环境变量

Create `.env` based on `.env.example`:

基于 `.env.example` 创建 `.env` 文件：

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=
DATABASE_URL=
```

Supports any OpenAI-compatible API.  
支持任意 OpenAI-compatible API（包括代理或自建服务）。
你可以不在此处配置，直接在项目页面右上角的设置中设置即可。
<img width="3840" height="2029" alt="image" src="https://github.com/user-attachments/assets/c1068c54-073f-4438-b279-261cf646bc3f" />

---

## 🏗 Architecture / 技术架构

- Next.js (App Router)
- Prisma (Database)
- OpenAI-compatible API layer
- Modular AI pipeline (analysis / planning / generation)
- Electron (Desktop build)

---

## 💻 Web + Desktop / Web 与桌面端

### Web

```bash
npm run dev
npm run build && npm run start
```

### Desktop (Windows EXE)

```bash
npm run build:desktop
npm run dist:win
```

Web 与 Desktop 共用同一套业务逻辑：

> Electron + Next standalone + electron-builder

---

## 🧩 Core Features / 核心功能

### 1. AI Product Analysis / 商品分析
- Extract structured product data  
  提取结构化商品信息
- Generate selling points and descriptions  
  自动生成卖点与文案

### 2. Detail Page Generation / 详情页生成
- Multi-section layout generation  
  多模块详情页结构生成
- AI-generated copy and image prompts  
  AI 文案与图片提示词生成

### 3. Section Editing System / 模块编辑系统
- Regenerate individual sections  
  支持单模块重生成
- Version control for sections  
  模块版本管理

### 4. Provider System / 模型接入系统
- OpenAI-compatible API support  
  支持 OpenAI-compatible API
- Dynamic model discovery  
  动态模型发现
- Multi-provider switching  
  多模型切换

---

## 📦 Project Structure / 项目结构

```
app/            # Next.js App Router
components/     # UI components
lib/            # AI / services / utils
prisma/         # database schema
desktop/        # electron entry
scripts/        # build scripts
```

---

## ⚠️ Notes / 注意事项

- Logs, storage, and local DB are ignored in git  
  日志、存储数据、本地数据库不会提交到 git

- `.env` is not committed  
  `.env` 文件不会被提交

- Designed for local-first development  
  以本地开发为优先设计

---

## 📖 Docs / 文档

- 中文文档: [README.zh-CN.md](./README.zh-CN.md)  
- English Docs: [README.en.md](./README.en.md)

---

## 🧠 Vision / 项目愿景

> Turn ideas into products, instantly.  
> 让想法，直接变成商品。

---

## 📌 Roadmap / 发展规划

- [ ] Template system / 模板系统  
- [ ] Multi-user collaboration / 多人协作  
- [ ] Plugin ecosystem / 插件生态  
- [ ] API service layer / API 服务化  
- [ ] Cloud version / 云端版本  

---

## 🤝 Contributing / 贡献

PRs are welcome.  
欢迎提交 PR。

---

## ⭐ Support / 支持

If you like this project, give it a star ⭐  
如果你觉得这个项目不错，欢迎点个 Star ⭐


<div align="center">

**Made with ❤️ by [MatrixInspire](https://mxinspire.com)**

让灵感落地，让回忆有形

</div>

