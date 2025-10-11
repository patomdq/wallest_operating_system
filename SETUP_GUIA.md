# Guía de Instalación - Node.js y Git para WOS 1.0

## 📋 Requisitos Previos

Antes de desplegar WOS 1.0, necesitas instalar:
- ✅ Node.js (incluye npm y npx)
- ✅ Git

---

## 📦 Opción 1: Instalación de Node.js (Recomendada)

### Método A: Instalador Oficial (Más Fácil)

1. **Descargar Node.js LTS**
   - Ve a: https://nodejs.org/
   - Click en el botón verde "LTS" (versión recomendada)
   - Se descargará automáticamente el instalador para Windows

2. **Ejecutar el Instalador**
   - Doble click en el archivo descargado `node-v20.x.x-x64.msi`
   - Click en **"Next"** (Siguiente)
   - Aceptar la licencia → **"Next"**
   - Mantener ubicación predeterminada → **"Next"**
   - **IMPORTANTE**: Marcar la casilla **"Automatically install the necessary tools"**
   - Click en **"Install"** (Instalar)
   - Esperar a que complete (puede tomar 2-5 minutos)
   - Click en **"Finish"**

3. **Reiniciar la Terminal**
   - Cerrar todas las ventanas de PowerShell o Command Prompt
   - Abrir una nueva terminal

4. **Verificar Instalación**
   ```powershell
   node --version
   # Debería mostrar: v20.x.x
   
   npm --version
   # Debería mostrar: 10.x.x
   
   npx --version
   # Debería mostrar: 10.x.x
   ```

### Método B: Usando winget (Windows Package Manager)

Si tienes Windows 10 versión 1809 o superior:

```powershell
# Ejecutar en PowerShell como Administrador
winget install OpenJS.NodeJS.LTS
```

Luego reiniciar la terminal y verificar.

---

## 🔧 Opción 2: Instalación de Git

### Método A: Instalador Oficial (Recomendado)

1. **Descargar Git**
   - Ve a: https://git-scm.com/download/win
   - Se descargará automáticamente

2. **Ejecutar el Instalador**
   - Doble click en el archivo descargado
   - **"Next"** en todas las opciones (configuración predeterminada está bien)
   - En "Adjusting your PATH environment":
     - Seleccionar **"Git from the command line and also from 3rd-party software"** (recomendado)
   - **"Next"** hasta completar
   - Click en **"Install"**
   - Click en **"Finish"**

3. **Verificar Instalación**
   ```powershell
   git --version
   # Debería mostrar: git version 2.x.x
   ```

### Método B: Usando winget

```powershell
# Ejecutar en PowerShell como Administrador
winget install Git.Git
```

---

## 🚀 Configuración Inicial de Git (Primera Vez)

Después de instalar Git, configura tu identidad:

```powershell
# Navegar al directorio del proyecto
cd C:\Users\Flia\Workspace\wallest_operating_system

# Configurar nombre de usuario (reemplazar con tu nombre)
git config --global user.name "Tu Nombre"

# Configurar email (reemplazar con tu email)
git config --global user.email "tu.email@ejemplo.com"

# Verificar configuración
git config --list
```

---

## 🎯 Inicializar Repositorio Git en el Proyecto

Una vez instalado Git, inicializa el repositorio:

```powershell
# Asegurarse de estar en el directorio correcto
cd C:\Users\Flia\Workspace\wallest_operating_system

# Inicializar repositorio
git init

# Verificar que se creó correctamente
git status
```

**Crear archivo .gitignore** (si no existe):

```powershell
# Crear .gitignore con contenido predeterminado
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
```

**Hacer primer commit**:

```powershell
# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "feat: Implementar WOS 1.0 - Modificaciones técnicas completas

- Actualizar 6 tablas de BD con nuevos campos
- Crear 3 vistas SQL para KPIs
- Implementar 4 triggers para automatizaciones
- Actualizar 7 módulos del frontend
- Agregar documentación completa"

# Verificar que el commit se creó
git log --oneline
```

---

## ✅ Verificación Final

Ejecuta estos comandos para confirmar que todo está instalado:

```powershell
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar npx
npx --version

# Verificar Git
git --version

# Verificar que estás en el directorio correcto
pwd

# Verificar estado de Git
git status
```

**Salida esperada:**
```
node --version
v20.11.0

npm --version
10.2.4

npx --version
10.2.4

git --version
git version 2.43.0

pwd
Path
----
C:\Users\Flia\Workspace\wallest_operating_system

git status
On branch main
nothing to commit, working tree clean
```

---

## 🔧 Solución de Problemas

### Problema: "node no se reconoce como comando"

**Solución 1**: Reiniciar la terminal
- Cerrar PowerShell completamente
- Abrir nueva ventana de PowerShell

**Solución 2**: Verificar PATH manualmente
```powershell
# Ver variables de entorno PATH
$env:PATH -split ';' | Select-String -Pattern 'nodejs'

# Si no aparece Node.js, agregarlo manualmente:
# Panel de Control → Sistema → Configuración avanzada del sistema
# → Variables de entorno → Path → Editar
# → Agregar: C:\Program Files\nodejs\
```

**Solución 3**: Reiniciar Windows
- A veces es necesario reiniciar el sistema completo

### Problema: "git no se reconoce como comando"

Mismas soluciones que para Node.js, pero verificando:
```powershell
$env:PATH -split ';' | Select-String -Pattern 'git'
```

Y agregando si es necesario: `C:\Program Files\Git\cmd\`

### Problema: Permisos en PowerShell

Si tienes problemas de permisos, ejecuta PowerShell como Administrador:
- Click derecho en PowerShell
- Seleccionar "Ejecutar como Administrador"

---

## 📝 Siguiente Paso

Una vez que tengas Node.js, npm, npx y Git instalados y verificados, continúa con:

1. **Instalar dependencias del proyecto**:
   ```powershell
   npm install
   ```

2. **Seguir las instrucciones de despliegue**:
   - Ver: `plans/2025-10-10_17-00-00_wos-1.0-modificaciones/INSTRUCCIONES_DESPLIEGUE.md`

---

## 🆘 Ayuda Adicional

Si sigues teniendo problemas:
1. Verifica que descargaste la versión correcta (64-bit para Windows 64-bit)
2. Asegúrate de tener permisos de administrador
3. Consulta la documentación oficial:
   - Node.js: https://nodejs.org/en/docs/
   - Git: https://git-scm.com/doc

---

**¡Listo para continuar con el despliegue! 🚀**
