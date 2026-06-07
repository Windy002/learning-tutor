# 学习导师

AI 驱动的自适应学习助手，基于动态教学法帮你掌握任何领域。

界面复刻 Claude.ai 设计，内置三套教学模式。

## 快速开始

**Windows：双击 `启动.bat`**

**其他系统：**
```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`

## 配置

1. 右上角 ⚙ → 选 API Base → 填 API Key → 选模型
2. 左侧 `+ 新会话` → 填书名/领域/目标 → 创建
3. AI 自动出第一题，开始对话

## 使用方式

- **Enter** 发送并触发 AI 回复
- **Shift+Enter** 换行
- **Ctrl+B** 切换侧栏

## 三套模板

| 模板 | 风格 |
|------|------|
| 学习导师 | 摸底测试 → 精准补漏 → 循环迭代 → 全景收网 |
| 苏格拉底式 | 纯追问，不给答案 |
| 费曼式 | 必须用白话解释，术语会被打回 |

## 技术栈

React 18 + TypeScript + Tailwind CSS + Zustand + Express

## 要求

- [Node.js 18+](https://nodejs.org)（双击 `启动.bat` 会自动检测）
- DeepSeek / OpenAI / Anthropic API Key（[DeepSeek 注册](https://platform.deepseek.com) 便宜好用）
