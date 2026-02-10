# Vesti MVP 功能说明书 / 使用指南

版本：v0.1
日期：2026-02-10
范围：本地优先，仅 ChatGPT + Claude 实时捕获；Gemini / DeepSeek 仅 UI 占位

---

## 1. 功能概览
- 实时捕获：监听 ChatGPT / Claude 页面，写入本地 IndexedDB
- Sidepanel：Timeline + Reader 浏览
- Insights 摘要：ModelScope 单会话摘要
- 本地存储：不做云同步

## 2. 快速开始（开发）
1) `pnpm install`
2) `pnpm dev`
3) Chrome 加载 `frontend/build/chrome-mv3-dev`

## 3. 生产构建与交付
1) `pnpm build`
2) Chrome 加载 `frontend/build/chrome-mv3-prod`
3) 交付 ZIP：`release/Vesti_MVP.zip`

## 4. 使用流程
1) ChatGPT/Claude 页面出现悬浮球
2) 点击打开 Sidepanel
3) 发送消息 -> Timeline 自动刷新
4) 选择会话 -> Reader 查看
5) Insights 生成摘要

## 5. ModelScope 设置
- 填写 Model ID 与 API Key
- 点击 Test 验证连通

## 6. 重要限制
- Gemini / DeepSeek 仅 UI
- 无云同步 / 多设备
