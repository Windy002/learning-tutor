@echo off
chcp 65001 >nul
cd /d %~dp0
echo 正在启动学习导师...
call npm run dev
pause
