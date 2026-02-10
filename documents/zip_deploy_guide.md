﻿﻿# Vesti ZIP 交付物部署指南（Chrome）

适用场景：评审 / 交付 / 演示 / 本地安装

## 1. 准备文件
- 交付包位置：`release/Vesti_MVP.zip`
- 解压到任意目录（例如 `D:/Vesti_MVP/`）

## 2. Chrome 安装步骤
1) 打开 `chrome://extensions/`
2) 开启「开发者模式」
3) 点击「加载已解压的扩展程序」
4) 选择解压后的目录（**必须含 `manifest.json`**）

## 3. 常见错误
- **看不到扩展**：确认是否选择了正确目录（不要选到外层空文件夹）
- **manifest.json 不在根目录**：请进入真正的内容目录再加载

## 4. 验证
- 打开 ChatGPT 或 Claude 页面
- 右下角出现悬浮球，点击后 Sidepanel 打开
- 发送一条消息，Timeline 出现真实会话
