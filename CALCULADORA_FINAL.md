# Calculadora de Rentabilidad - Versión Final

**Fecha**: 13 de octubre de 2025  
**Versión**: Final Simplificada  
**URL**: http://localhost:3000/wallest/calculadora

---

## 📋 Descripción

Calculadora de rentabilidad inmobiliaria en **una sola pantalla**, con cálculos automáticos en tiempo real y capacidad de guardar proyectos en Supabase.

---

## 🎯 Características

### ✅ Una Sola Pantalla
Todo el formulario, cálculos y acciones están en un mismo componente, sin navegación entre vistas.

### ✅ 5 Secciones Visuales

1. **Datos del Proyecto**
   - Nombre del proyecto *
   - Dirección
   - Comunidad (por defecto "Andalucía")
   - Estado (Borrador, Aprobado, Descartado, En marcha, Terminado)
   - Calificación (estrellas 0-5)
   - Duración de la operación (meses)

2. **Gastos de la Operación**
   - Tabla con 14 conceptos
   - Columnas: Concepto | Estimado (€) | Real (€) | Desviación (€)
   - Fila de TOTAL INVERSIÓN calculada automáticamente
   - Desviación con colores: verde (ahorro), rojo (sobrecosto)

3. **Precio de Venta - Escenarios**
   - Precio de venta Pesimista
   - Precio de venta Realista
   - Precio de venta Optimista

4. **Resultados Automáticos**
   - 3 tarjetas con bordes de colores
   - Cada tarjeta muestra:
     - Beneficio (€)
     - Rentabilidad (%)
     - Rentabilidad Anualizada (%)
   - Actualización en tiempo real

5. **Acciones**
   - Guardar proyecto → Supabase
   - Exportar → CSV
   - Imprimir → window.print()

---

## 🧮 Fórmulas Implementadas

### Total Inversión
```
Total Estimado = Σ todos los gastos estimados
Total Real = Σ todos los gastos reales
```

### Beneficio Neto
```
Beneficio = Precio de venta - Total inversión (real o estimado)
```

### Rentabilidad (%)
```
Rentabilidad = (Beneficio / Total inversión) × 100
```

### Rentabilidad Anualizada (%)
```
Rentabilidad Anualizada = [(1 + Rentabilidad/100)^(12/meses) - 1] × 100
```

### Desviación
```
Desviación = Valor Real - Valor Estimado
```

---

## 💾 Base de Datos

### Tabla: proyectos_rentabilidad

**Campos principales:**
- id (UUID)
- nombre (TEXT) *
- direccion (TEXT)
- comunidad (TEXT) - default 'Andalucía'
- estado (TEXT) - default 'borrador'
- calificacion (INTEGER 0-5)
- duracion_meses (INTEGER) - default 12

**14 conceptos de gastos × 2 (estimado + real):**
- precio_compra_estimado / precio_compra_real
- gastos_compraventa_estimado / gastos_compraventa_real
- gastos_cancelacion_estimado / gastos_cancelacion_real
- itp_estimado / itp_real
- honorarios_profesionales_estimado / honorarios_profesionales_real
- honorarios_complementaria_estimado / honorarios_complementaria_real
- certificado_energetico_estimado / certificado_energetico_real
- comisiones_inmobiliarias_estimado / comisiones_inmobiliarias_real
- reforma_estimado / reforma_real
- seguros_estimado / seguros_real
- suministros_basura_estimado / suministros_basura_real
- cuotas_comunidad_estimado / cuotas_comunidad_real
- deuda_ibi_estimado / deuda_ibi_real
- deuda_comunidad_estimado / deuda_comunidad_real

**Precios de venta:**
- precio_venta_pesimista
- precio_venta_realista
- precio_venta_optimista

**Resultados calculados:**
- rentabilidad_pesimista
- rentabilidad_realista
- rentabilidad_optimista
- rentabilidad_anualizada_pesimista
- rentabilidad_anualizada_realista
- rentabilidad_anualizada_optimista

**Metadatos:**
- created_at
- updated_at

---

## 🚀 Instalación

### 1. Ejecutar Migración SQL

```bash
# Ir a Supabase Dashboard > SQL Editor
# Copiar contenido de: scripts/migracion_calculadora_final.sql
# Ejecutar
```

### 2. Verificar Tabla

```sql
SELECT * FROM proyectos_rentabilidad LIMIT 1;
```

### 3. Acceder a la Aplicación

```
http://localhost:3000/wallest/calculadora
```

---

## 📝 Uso

### Flujo Típico

1. **Completar Datos del Proyecto**
   - Ingresar nombre (obligatorio)
   - Completar dirección, comunidad, etc.
   - Seleccionar estado y calificación
   - Definir duración en meses

2. **Ingresar Gastos**
   - Completar columna "Estimado" con valores proyectados
   - Si ya se ejecutó, completar columna "Real"
   - Ver desviaciones automáticamente

3. **Definir Precios de Venta**
   - Ingresar al menos un precio (realista o pesimista obligatorio)
   - Completar los 3 escenarios para análisis completo

4. **Revisar Resultados**
   - Los resultados se calculan automáticamente
   - Ver beneficio y rentabilidades por escenario
   - Comparar los 3 escenarios

5. **Guardar o Exportar**
   - Click "Guardar proyecto" → guarda en Supabase
   - Click "Exportar" → descarga CSV
   - Click "Imprimir" → imprime página

---

## ✅ Validaciones

### Al Guardar:
- ✅ Nombre del proyecto (obligatorio)
- ✅ Precio de compra (estimado o real) debe ser > 0
- ✅ Al menos un precio de venta (realista o pesimista) debe ser > 0

### Mensajes:
- ✅ "Proyecto guardado correctamente"
- ❌ "Error al guardar el proyecto"
- ⚠️ Validaciones de campos obligatorios

---

## 🎨 Diseño

### Tema Oscuro WOS Mantenido
- Colores: `wos-bg`, `wos-card`, `wos-border`, `wos-accent`, `wos-primary`
- Tipografía consistente
- Espaciado uniforme

### Separadores Visuales
```jsx
<div className="border-t border-wos-border"></div>
```

### Colores Semánticos
- **Escenario Pesimista**: Rojo (`border-red-500/30`, `text-red-400`)
- **Escenario Realista**: Amarillo (`border-yellow-500/30`, `text-yellow-400`)
- **Escenario Optimista**: Verde (`border-green-500/30`, `text-green-400`)

### Desviaciones
- **Negativa (ahorro)**: Verde (`text-green-500`)
- **Positiva (sobrecosto)**: Rojo (`text-red-500`)
- **Cero**: Gris (`text-wos-text-muted`)

### Formato Monetario
```javascript
formatEuro(valor) → "1.234,56 €"
```

---

## 🔧 Funciones Principales

### calcularResultados()
Actualiza automáticamente todos los resultados cuando cambia cualquier valor.

### handleGuardarProyecto()
Valida datos, guarda en Supabase, muestra confirmación.

### handleExportar()
Genera CSV con todos los datos y lo descarga.

### handleImprimir()
Abre diálogo de impresión del navegador.

---

## 📊 Exportación CSV

El archivo CSV incluye:
- Datos del proyecto
- Tabla de gastos (estimado, real, desviación)
- Precios de venta
- Resultados por escenario

Formato:
```csv
Calculadora de Rentabilidad - Exportación

Nombre del proyecto,Proyecto Ejemplo
Dirección,Calle Mayor 15
...

GASTOS DE LA OPERACIÓN
Concepto,Estimado (€),Real (€),Desviación (€)
Precio de compra,250000.00,248000.00,-2000.00
...

PRECIOS DE VENTA
Pesimista,320000.00
Realista,350000.00
Optimista,380000.00

RESULTADOS
Escenario,Beneficio (€),Rentabilidad (%),Rentabilidad Anualizada (%)
Pesimista,50000.00,18.52,18.52
...
```

---

## 🐛 Troubleshooting

### "Error al guardar el proyecto"
- Verificar conexión a Supabase
- Revisar variables de entorno (.env.local)
- Verificar que la tabla existe
- Revisar políticas RLS en Supabase

### Los cálculos no actualizan
- Los cálculos son automáticos vía useEffect
- Verificar que los campos tienen valores numéricos válidos
- Refrescar la página si es necesario

### Exportación no funciona
- Verificar permisos del navegador para descargas
- Comprobar que hay datos para exportar

---

## 📈 Mejoras Futuras

1. **Listado de proyectos guardados**
   - Ver todos los proyectos
   - Editar proyectos existentes
   - Eliminar proyectos

2. **Gráficos visuales**
   - Comparación de escenarios
   - Gráfico de torta de gastos
   - Evolución de rentabilidad

3. **Campos adicionales personalizables**
   - Botón + para agregar conceptos
   - Campos custom por usuario

4. **Exportación PDF**
   - Formato profesional
   - Con gráficos incluidos

5. **Historial de cambios**
   - Ver versiones anteriores
   - Comparar cambios

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Políticas de CRUD configuradas
- ✅ Validación de tipos en TypeScript
- ✅ SQL injection protection (Supabase)

---

## 📄 Archivos del Proyecto

```
/app/wallest/calculadora/
  └── page.tsx (componente principal - 600+ líneas)

/lib/
  └── supabase.ts (tipo ProyectoRentabilidad actualizado)

/scripts/
  └── migracion_calculadora_final.sql (script SQL completo)

/docs/
  └── CALCULADORA_FINAL.md (este archivo)
```

---

## 🎓 Conceptos de los 14 Gastos

1. **Precio de compra** - Valor de adquisición del inmueble
2. **Gastos de compraventa** - Notario, registro, gestoría de compra
3. **Gastos de cancelación** - Notario, registro, gestoría de cancelaciones
4. **Impuesto ITP** - Impuesto de Transmisiones Patrimoniales
5. **Honorarios profesionales** - Abogados, asesores, etc.
6. **Honorarios gestión complementaria** - Gestiones administrativas adicionales
7. **Certificado energético** - Certificación energética obligatoria
8. **Comisiones inmobiliarias** - Agencia o intermediación
9. **Reforma** - Obras, materiales, mano de obra
10. **Seguros** - Seguro de hogar, responsabilidad civil, etc.
11. **Suministros / basura** - Agua, luz, gas, tasa de basura
12. **Cuotas comunidad** - Gastos de comunidad de propietarios
13. **Deuda IBI** - Impuesto de Bienes Inmuebles pendiente
14. **Deuda comunidad** - Deudas con la comunidad pendientes

---

## 💡 Consejos de Uso

### Para Proyectos Nuevos
- Completar solo columna "Estimado"
- Definir escenarios conservador y optimista
- Usar para tomar decisión de compra

### Para Proyectos en Curso
- Ir actualizando columna "Real" conforme se ejecuta
- Monitorear desviaciones
- Ajustar precio de venta si es necesario

### Para Análisis Post-venta
- Completar todas las columnas
- Comparar rentabilidad real vs estimada
- Aprender para proyectos futuros

---

## 📞 Soporte

1. Revisar esta documentación
2. Verificar script SQL: `scripts/migracion_calculadora_final.sql`
3. Consultar tipos: `lib/supabase.ts`
4. Revisar logs en consola del navegador
5. Verificar Supabase Dashboard

---

**Estado**: ✅ Completado y funcional  
**Última actualización**: 2025-10-13  
**Desarrollado por**: Memex AI Assistant para WOS

---

¡La Calculadora de Rentabilidad está lista para usar!
