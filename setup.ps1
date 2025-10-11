# WOS 1.0 - Script de Setup Automático
# Este script verifica e instala las herramientas necesarias

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  WOS 1.0 - SETUP AUTOMÁTICO" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Función para verificar si un comando existe
function Test-CommandExists {
    param($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# 1. Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Cyan
if (Test-CommandExists node) {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
    
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: v$npmVersion" -ForegroundColor Green
    
    $npxVersion = npx --version
    Write-Host "   ✅ npx instalado: v$npxVersion`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js NO instalado" -ForegroundColor Red
    Write-Host "   📋 Por favor, instala Node.js desde: https://nodejs.org/`n" -ForegroundColor Yellow
}

# 2. Verificar Git
Write-Host "2. Verificando Git..." -ForegroundColor Cyan
if (Test-CommandExists git) {
    $gitVersion = git --version
    Write-Host "   ✅ Git instalado: $gitVersion`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ Git NO instalado" -ForegroundColor Red
    Write-Host "   📋 Por favor, instala Git desde: https://git-scm.com/download/win`n" -ForegroundColor Yellow
}

# 3. Verificar directorio del proyecto
Write-Host "3. Verificando directorio del proyecto..." -ForegroundColor Cyan
$projectPath = "C:\Users\Flia\Workspace\wallest_operating_system"
if (Test-Path $projectPath) {
    Write-Host "   ✅ Directorio del proyecto encontrado`n" -ForegroundColor Green
    Set-Location $projectPath
} else {
    Write-Host "   ❌ Directorio del proyecto NO encontrado" -ForegroundColor Red
    Write-Host "   📋 Ruta esperada: $projectPath`n" -ForegroundColor Yellow
}

# 4. Inicializar Git si no está inicializado
Write-Host "4. Verificando repositorio Git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "   ✅ Repositorio Git ya inicializado`n" -ForegroundColor Green
} else {
    if (Test-CommandExists git) {
        Write-Host "   📦 Inicializando repositorio Git..." -ForegroundColor Yellow
        git init
        Write-Host "   ✅ Repositorio Git inicializado`n" -ForegroundColor Green
        
        # Crear .gitignore si no existe
        if (-not (Test-Path ".gitignore")) {
            Write-Host "   📝 Creando .gitignore..." -ForegroundColor Yellow
            @"
# Dependencias
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/

# Variables de entorno
.env
.env*.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Temporal
*.tmp
*.bak
"@ | Out-File -FilePath .gitignore -Encoding utf8
            Write-Host "   ✅ .gitignore creado`n" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠️  Git no está instalado, no se puede inicializar repositorio`n" -ForegroundColor Yellow
    }
}

# 5. Verificar dependencias del proyecto
Write-Host "5. Verificando dependencias del proyecto..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ✅ Dependencias ya instaladas`n" -ForegroundColor Green
} else {
    if (Test-CommandExists npm) {
        Write-Host "   📦 ¿Deseas instalar las dependencias ahora? (S/N)" -ForegroundColor Yellow
        $response = Read-Host "   Respuesta"
        if ($response -eq "S" -or $response -eq "s") {
            Write-Host "   📦 Instalando dependencias (esto puede tomar varios minutos)..." -ForegroundColor Yellow
            npm install
            Write-Host "   ✅ Dependencias instaladas`n" -ForegroundColor Green
        } else {
            Write-Host "   ⏭️  Saltado. Ejecuta 'npm install' cuando estés listo`n" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  npm no está disponible, instala Node.js primero`n" -ForegroundColor Yellow
    }
}

# Resumen final
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  RESUMEN" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$allReady = $true

if (Test-CommandExists node) {
    Write-Host "✅ Node.js y npm están listos" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js necesita ser instalado" -ForegroundColor Red
    $allReady = $false
}

if (Test-CommandExists git) {
    Write-Host "✅ Git está listo" -ForegroundColor Green
} else {
    Write-Host "❌ Git necesita ser instalado" -ForegroundColor Red
    $allReady = $false
}

if (Test-Path ".git") {
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Repositorio Git NO inicializado" -ForegroundColor Yellow
}

if (Test-Path "node_modules") {
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencias NO instaladas (ejecuta: npm install)" -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor Green

if ($allReady) {
    Write-Host "🎉 ¡Todo listo! Puedes continuar con el despliegue.`n" -ForegroundColor Green
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. npm run dev  # Para probar localmente" -ForegroundColor White
    Write-Host "  2. Ver: plans/.../INSTRUCCIONES_DESPLIEGUE.md`n" -ForegroundColor White
} else {
    Write-Host "⚠️  Hay herramientas que necesitan instalarse.`n" -ForegroundColor Yellow
    Write-Host "Por favor:" -ForegroundColor Cyan
    Write-Host "  1. Instala las herramientas faltantes" -ForegroundColor White
    Write-Host "  2. Reinicia PowerShell" -ForegroundColor White
    Write-Host "  3. Ejecuta este script nuevamente: .\setup.ps1`n" -ForegroundColor White
    Write-Host "Ver SETUP_GUIA.md para instrucciones detalladas.`n" -ForegroundColor Yellow
}

# Pausa para que el usuario pueda leer
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
