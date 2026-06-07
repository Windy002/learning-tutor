@echo off
chcp 65001 >nul
title 学习导师

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 请先安装 Node.js
    echo 下载地址: https://nodejs.org
    start https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    npm install
)

echo 启动中...
start http://localhost:5173
npm run dev
pause
