@echo off
echo Deteniendo procesos Node.js...
taskkill /F /IM node.exe >nul 2>&1

echo Limpiando cache...
if exist .next rmdir /s /q .next

echo.
echo Iniciando servidor...
npm run dev
