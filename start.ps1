# Script de inicio para WOS 1.0
# Wallest Operating System

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WOS 1.0 - Wallest Operating System  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no encontrado. Por favor instala Node.js 18+ desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar .env.local
Write-Host ""
Write-Host "Verificando configuración..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "✗ Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "1. Copia .env.local.example a .env.local" -ForegroundColor White
    Write-Host "2. Configura tus credenciales de Supabase" -ForegroundColor White
    Write-Host "3. Ejecuta este script nuevamente" -ForegroundColor White
    exit 1
}
Write-Host "✓ Archivo .env.local encontrado" -ForegroundColor Green

# Verificar node_modules
Write-Host ""
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "→ Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencias ya instaladas" -ForegroundColor Green
}

# Iniciar servidor
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando servidor de desarrollo...  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "La aplicación estará disponible en:" -ForegroundColor Yellow
Write-Host "→ http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

npm run dev
