# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server at http://localhost:3000
npm run build     # Production build (TypeScript and ESLint errors are ignored by config)
npm run lint      # Run ESLint
npm start         # Run production build
```

Environment setup: copy `.env.local.example` to `.env.local` and fill in Supabase credentials. Database requires running SQL migration scripts in `/scripts/` against the Supabase project.

## Architecture

**Stack:** Next.js 14 App Router + TypeScript + Tailwind CSS + Supabase (PostgreSQL)

**Three business domains, each with its own route group:**
- `/wallest/` — Real estate investment management (properties, finances, HR, admin, calculator, macro-projects, Google Drive docs)
- `/renova/` — Renovation project management (reforms, planning, suppliers, materials inventory, project finances)
- `/nexo/` — Sales/CRM (Kanban lead pipeline, commercialization, transactions, contracts)
- `/hub/` — Unified dashboard with cross-domain KPIs and charts

**State management:** React Context only — `AuthContext` (Supabase auth) and `SidebarContext` (sidebar visibility). No Redux or Zustand.

**Database layer:** All database logic lives directly in page/component files via the Supabase client from `lib/supabase.ts`. That file also exports all TypeScript types for DB tables. There is no separate API layer for DB reads/writes — it goes client → Supabase directly.

**Workflow automation via PostgreSQL triggers (not application code):**
- Property status `"COMPRADO"` → auto-creates a reform record in `reformas`
- Reform status `"FINALIZADA"` → auto-creates a commercialization record in `comercializacion`
- KPI aggregations are handled by SQL views, not computed in JS

**API routes** (`app/api/`):
- `/api/chat` — Proxies requests to Claude AI via `@anthropic-ai/sdk`
- `/api/google/` — Google Calendar OAuth2 flow and event sync

**Design system:** Custom Tailwind config with dark theme (`wos-bg` #0a0a0a, `wos-card` #161616, `wos-border` #252525). Brand colors: orange for Wallest/Renova, green for Nexo. All custom tokens are in `tailwind.config.ts`.

**Shared components** (`components/`): `Sidebar.tsx`, `HeaderBar.tsx`, `Charts.tsx` (Recharts wrappers), `ItemsTable.tsx` (generic table), `WOSChat.tsx` (AI chat widget).

## Database

Core tables: `inmuebles` (properties), `finanzas`, `reformas`, `planificacion_reforma`, `materiales`, `proveedores`, `leads`, `comercializacion`, `transacciones`, `macroproyectos`, `administracion`, `rrhh`, `organizador`. All tables have Row Level Security (RLS) enabled.

Migration scripts are in `/scripts/` — run them in order in the Supabase SQL editor when setting up a new instance.

## Contexto de Negocio WOS

### Empresa
- Hasu Activos Inmobiliarios SL / Wallest
- CEO: Patricio Favora
- Objetivo: 1M euros en cuenta Hasu para dic 2027

### IDs Supabase Clave
- Zurgena 1 (reformas): `9326ad4d-a0ba-4c4b-8f34-671d2b33cfd5`
- Zurgena 1 (inmuebles): `35cf7336-b6f3-4c91-a9b0-a90053a2d693`
- Jose Luis inversor: `bd70ed18-113f-4738-a56b-a530d5c342c8`
- Edificio Cuevas reforma: `575fa2af-1dc7-4376-b337-4e2940ade4f6`
- Olula del Rio 1: `347d78d9-1de8-4639-8853-8262b0b962e9`
- Cuevas 1: `08f638a0-d6b3-44cb-91bb-ebc2967ce9e4`
- Cuevas 2: `5d9b12a1-1ccf-49b5-bb32-1e339f234bc5`
- Albox 1: `ffd39202-3b9a-4d3f-95b8-db55cb5e29e9`

### Reglas de Negocio
- Gastos siempre se guardan como negativos en BD
- Si gasto/ingreso es de Zurgena, cuenta = `CaixaBank JV Zurgena 1`
- Separación HASU vs JV en todo el sistema
- Archivos de código se entregan como HTML con botón copiar

### Pendientes Críticos
- Unificar tablas `inmuebles` y `reformas`
- RLS seguridad Supabase
- Bug saldo Zurgena: WOS muestra 1224.29 vs banco 1582 euros (diff 357.71 pagos en B)
- Tabla escenarios portal inversor desde Supabase (hoy hardcodeada)
