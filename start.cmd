@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [错误] 未找到 Node.js。请先安装 Node.js 18+ 后重试。
  echo.
  pause
  exit /b 1
)

echo ============================================
echo   隔热情报雷达 ThermalInsight Radar
echo   透明陶瓷隔热 / 辐射制冷 行业情报检索
echo ============================================
echo.
echo 正在启动本地服务，稍后会自动打开浏览器...
echo 停止服务：在本窗口按 Ctrl+C
echo.

start "" "http://127.0.0.1:8788"
node server\server.mjs --port 8788

echo.
echo 服务已停止。
pause
