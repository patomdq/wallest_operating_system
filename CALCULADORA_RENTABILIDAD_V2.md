# Calculadora de Rentabilidad V2 - Documentación Completa

**Fecha**: 13 de octubre de 2025  
**Versión**: 2.0  
**Módulo**: Wallest Operating System

---

## 📋 Descripción General

Sistema completo de gestión y análisis de proyectos inmobiliarios con cálculo de rentabilidad multi-escenario. Reemplaza completamente el anterior "Simulador de Rentabilidad" por una herramienta profesional de evaluación de inversiones.

---

## 🎯 Características Principales

### 1. Gestión de Proyectos
- ✅ Creación y edición de proyectos
- ✅ Sistema de estados (Borrador, Aprobado, Descartado, En marcha, Terminado)
- ✅ Calificación por estrellas (0-5)
- ✅ Organización por comunidades autónomas
- ✅ Listado completo con acciones rápidas

### 2. Análisis Multi-escenario
- ✅ **Escenario Pesimista**: Proyección conservadora
- ✅ **Escenario Realista**: Proyección más probable
- ✅ **Escenario Optimista**: Proyección favorable
- ✅ Cálculo automático para cada escenario

### 3. Gestión de Conceptos
- ✅ 6 conceptos principales predefinidos
- ✅ Posibilidad de agregar conceptos adicionales ilimitados
- ✅ Checklist de 19 tipos de gastos comunes
- ✅ Comparación Estimado vs Real
- ✅ Cálculo automático de desviaciones

### 4. Análisis de Rentabilidad
- ✅ Rentabilidad Total (%)
- ✅ Rentabilidad Anualizada (%)
- ✅ Beneficio Neto (€)
- ✅ Total de Inversión
- ✅ Cálculo precio objetivo para rentabilidad deseada

---

## 🏗️ Estructura de la Interfaz

### SECCIÓN 1: Listado de Proyectos
Vista principal con tabla de proyectos mostrando:
- Nombre y dirección
- Comunidad autónoma
- Estado actual (con colores semánticos)
- Calificación en estrellas
- Beneficio estimado vs real
- Acciones rápidas (Ver detalle, Editar, Eliminar)

### SECCIÓN 2: Crear Nuevo Proyecto
Formulario simplificado para inicio rápido:
- Nombre del proyecto *
- Dirección
- Comunidad (selector)
- Estado (selector)
- Calificación (estrellas interactivas)

### SECCIÓN 3: Configuración del Proyecto
Detalle completo con:
- Selector de proyecto (navegación rápida)
- Comunidad, Estado, Calificación
- Impuesto aplicable (ITP, IVA+AJD)
- Valor de referencia catastral
- Vendedor NO residente (Sí/No)
- **Checklist horizontal** con 19 conceptos de gastos

### SECCIÓN 4: Comprar AV - Vender
Bloque principal de cálculo:
- **Precios de venta** (Pesimista, Realista, Optimista)
- **Tabla de conceptos** con 4 columnas:
  - Concepto
  - Estimado (€)
  - Real (€)
  - Desviación (€) - con colores verde/rojo
- Conceptos predefinidos:
  1. Precio de compra
  2. Gastos de compraventa (notario, registro, gestión)
  3. Gastos cancelación (notario, registro, gestión)
  4. Impuestos de compra ITP
  5. Retenciones extranjeros
  6. Liquidación complementaria
- Botón + para agregar conceptos adicionales

### SECCIÓN 5: Resultados Finales
Panel de resultados con:
- Opciones: "Con complementaria" / "Sin complementaria"
- **Tabla resumen**:
  - Total inversión
  - Beneficio neto
  - Rentabilidad neta
- **3 tarjetas de escenarios** (Pesimista, Realista, Optimista):
  - Precio de venta
  - Rentabilidad total (%)
  - Rentabilidad anualizada (%)
- Campo duración de la operación (meses)

### SECCIÓN 6: Precio Objetivo
Calculadora inversa:
- Campo: Rentabilidad deseada (%)
- Resultado: Precio máximo de compra
- Botones: Calcular, Exportar (Excel), Imprimir

---

## 🧮 Fórmulas de Cálculo

### 1. Rentabilidad Total (%)
```
RT = ((PV - PC - R - IG) / (PC + R + IG)) × 100

Donde:
  PV = Precio de venta
  PC = Precio de compra
  R = Reforma
  IG = Impuestos y gastos
```

### 2. Beneficio Neto (€)
```
BN = PV - (PC + R + IG)
```

### 3. Rentabilidad Anualizada (%)
```
RA = (RT / Duración en meses) × 12
```

### 4. Precio de Compra Objetivo
```
PC_max = PV - OG - ((RD / 100) × (PV - OG))

Donde:
  PC_max = Precio máximo de compra
  PV = Precio de venta
  OG = Otros gastos (suma de conceptos excepto precio compra)
  RD = Rentabilidad deseada
```

### 5. Desviación
```
Desviación = Valor Real - Valor Estimado
```

Interpretación:
- Negativa (verde): ahorro respecto a lo estimado
- Positiva (roja): sobrecosto respecto a lo estimado

---

## 🎨 Diseño y UX

### Paleta de Colores
- **Estados**:
  - Borrador: Gris
  - Aprobado: Verde
  - Descartado: Rojo
  - En marcha: Azul
  - Terminado: Púrpura

- **Rentabilidades**:
  - Pesimista: Rojo
  - Realista: Amarillo
  - Optimista: Verde

- **Desviaciones**:
  - Negativa (ahorro): Verde
  - Positiva (sobrecosto): Rojo
  - Cero: Gris

### Componentes UI
- Tema oscuro consistente con WOS
- Inputs con borde y focus ring
- Botones con efectos hover
- Tablas responsivas con scroll horizontal
- Estrellas interactivas para calificación
- Separadores horizontales entre secciones

---

## 💾 Estructura de Base de Datos

### Tabla: `proyectos_rentabilidad`

```sql
CREATE TABLE proyectos_rentabilidad (
  id UUID PRIMARY KEY,
  
  -- Básico
  nombre TEXT NOT NULL,
  direccion TEXT,
  comunidad TEXT,
  estado TEXT DEFAULT 'borrador',
  calificacion INTEGER (0-5),
  
  -- Configuración
  impuesto TEXT,
  valor_referencia NUMERIC,
  vendedor_no_residente BOOLEAN,
  
  -- Escenarios
  precio_venta_pesimista NUMERIC,
  precio_venta_realista NUMERIC,
  precio_venta_optimista NUMERIC,
  
  -- Conceptos (estimado vs real)
  precio_compra_estimado NUMERIC,
  precio_compra_real NUMERIC,
  gastos_compraventa_estimado NUMERIC,
  gastos_compraventa_real NUMERIC,
  gastos_cancelacion_estimado NUMERIC,
  gastos_cancelacion_real NUMERIC,
  impuestos_compra_estimado NUMERIC,
  impuestos_compra_real NUMERIC,
  retenciones_extranjeros_estimado NUMERIC,
  retenciones_extranjeros_real NUMERIC,
  liquidacion_complementaria_estimado NUMERIC,
  liquidacion_complementaria_real NUMERIC,
  
  -- Adicionales
  conceptos_adicionales JSONB,
  gastos_checklist TEXT[],
  duracion_meses INTEGER,
  
  -- Metadatos
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🚀 Instalación y Configuración

### Paso 1: Ejecutar Migración SQL

```bash
# Acceder a Supabase Dashboard
# SQL Editor > Nueva Query
# Copiar y pegar: scripts/migracion_calculadora_v2.sql
# Ejecutar
```

### Paso 2: Verificar Tabla

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proyectos_rentabilidad';
```

### Paso 3: Reiniciar Servidor

```bash
# Detener servidor actual (Ctrl+C)
npm run dev
```

### Paso 4: Acceder

```
http://localhost:3000/wallest/calculadora
```

---

## 📊 Flujo de Trabajo Típico

### Escenario A: Nuevo Proyecto desde Cero

1. **Crear proyecto**
   - Click en "Nuevo Proyecto"
   - Completar información básica
   - Grabar

2. **Configurar detalles**
   - Seleccionar proyecto del listado
   - Configurar impuestos y características
   - Seleccionar conceptos de gastos relevantes

3. **Ingresar valores**
   - Definir precios de venta (3 escenarios)
   - Completar conceptos con valores estimados
   - Sistema calcula automáticamente

4. **Analizar resultados**
   - Revisar rentabilidades por escenario
   - Comparar beneficios netos
   - Ajustar valores si es necesario

5. **Calcular precio objetivo** (opcional)
   - Definir rentabilidad deseada
   - Sistema calcula precio máximo de compra

### Escenario B: Seguimiento de Proyecto en Marcha

1. **Seleccionar proyecto** existente
2. **Actualizar valores reales**
   - Ingresar gastos reales conforme ocurren
   - Sistema calcula desviaciones automáticamente
3. **Monitorear desviaciones**
   - Verde: estás ahorrando
   - Rojo: hay sobrecostos
4. **Ajustar estado** según avance del proyecto

---

## 🔧 Funcionalidades Avanzadas

### Conceptos Adicionales Ilimitados
- Click en botón "+Agregar concepto"
- Editar nombre del concepto
- Ingresar valores estimado y real
- Se incluyen automáticamente en los cálculos

### Checklist de Gastos
Conceptos predefinidos:
- Plusvalía compra
- Compensaciones vendedor/okupa
- Deuda IBI
- Deuda suministros/basura
- Deuda comunidad propietarios
- Honorarios profesionales
- Cerrajería
- Comisiones inmobiliarias
- Tasas judiciales
- Certificado energético
- Honorarios gestión complementaria
- Plusvalía venta
- IBI
- Suministros/basura
- Cuotas comunidad propietarios
- Derrama comunidad propietarios
- Alarma
- Seguros
- Reforma

### Exportación e Impresión
- **Exportar Excel**: Genera archivo con todos los datos del proyecto
- **Imprimir**: Formato optimizado para impresión

---

## 📈 Casos de Uso

### 1. Evaluación Pre-compra
- Definir precio de venta esperado
- Ingresar gastos estimados
- Calcular rentabilidad esperada
- Determinar precio máximo a ofrecer

### 2. Comparación de Oportunidades
- Crear múltiples proyectos
- Comparar rentabilidades en el listado
- Usar calificación por estrellas
- Descartar los menos rentables

### 3. Seguimiento Post-compra
- Actualizar costos reales
- Monitorear desviaciones
- Ajustar precio de venta si es necesario
- Controlar rentabilidad real

### 4. Análisis de Sensibilidad
- Usar los 3 escenarios
- Evaluar riesgo (diferencia optimista-pesimista)
- Tomar decisiones basadas en múltiples escenarios

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acceso configuradas
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Validaciones en frontend y backend
- ✅ Tipos TypeScript para mayor seguridad

---

## 🐛 Troubleshooting

### Error: "Tabla no existe"
**Solución**: Ejecutar migración SQL en Supabase

### Error: "Cannot read properties of null"
**Solución**: Verificar que hay al menos un proyecto creado

### Los cálculos no actualizan
**Solución**: Verificar que los campos tienen valores numéricos válidos

### No aparecen los proyectos
**Solución**: 
1. Verificar conexión a Supabase
2. Revisar variables de entorno (.env.local)
3. Verificar políticas RLS en Supabase

---

## 📝 Notas Técnicas

### Tecnologías
- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Iconos**: lucide-react
- **Validación**: Zod (futuro)

### Rendimiento
- Cálculos en tiempo real (lado cliente)
- Índices en columnas clave
- Lazy loading de proyectos
- Optimistic UI updates

### Próximas Mejoras
1. Gráficos de comparación (Chart.js)
2. Exportación PDF
3. Historial de cambios
4. Notificaciones de hitos
5. Integración con módulo Activos
6. Dashboard de rentabilidades globales

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisar esta documentación
2. Consultar `scripts/migracion_calculadora_v2.sql`
3. Verificar `lib/supabase.ts` para tipos de datos
4. Revisar logs de consola del navegador
5. Verificar logs de Supabase

---

## 📄 Licencia

Parte del Wallest Operating System  
© 2025 Wallest  
Todos los derechos reservados

---

**Estado**: ✅ Completado y listo para producción  
**Última actualización**: 2025-10-13  
**Versión**: 2.0.0
