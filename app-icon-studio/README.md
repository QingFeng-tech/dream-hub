# IconForge — App 图标 & 上架截图工具

纯前端 SPA：一键生成多平台 App 图标尺寸包，以及应用商店上架截图（背景 + 手机外壳 + 宣传文案）。

## 安装依赖

```bash
cd app-icon-studio
npm install
```

## 开发

```bash
npm run dev
```

## 构建与部署

```bash
npm run build
```

将 `dist/` 部署到 GitHub Pages 或 Vercel。`vite.config.js` 中已设置 `base: './'` 便于子路径托管。

## 技术栈

- Vue 3 (Composition API)
- Vite 8
- Tailwind CSS 4
- Lucide Vue Next
- JSZip + file-saver（前端 ZIP 打包）
- HTML5 Canvas（缩放与截图合成）

## 功能

1. **App 图标**：上传 1024 图 → 勾选 iOS / Android / Web 尺寸 → 导出 `AppIcons.zip`（`ios/`、`android/`、`web/`）
2. **上架截图**：模版尺寸、纯色/渐变/模糊背景、iPhone/Android 外壳、文案 → 导出 `StoreScreenshots.zip`

所有处理均在浏览器本地完成，不上传服务器。
