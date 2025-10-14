# 🚀 Instrucciones Rápidas - Calculadora de Rentabilidad

**Para empezar a usar la calculadora en 3 pasos:**

---

## PASO 1: Ejecutar Script SQL en Supabase

### 1.1 Acceder a Supabase
```
https://app.supabase.com
→ Seleccionar tu proyecto
→ SQL Editor (menú lateral)
→ Click "New query"
```

### 1.2 Copiar y Pegar
```
Abrir archivo: scripts/migracion_calculadora_final.sql
Copiar TODO el contenido
Pegar en el editor SQL de Supabase
```

### 1.3 Ejecutar
```
Click botón "Run" o presionar Ctrl+Enter
Esperar confirmación: "Success. No rows returned"
```

### 1.4 Verificar
```sql
SELECT * FROM proyectos_rentabilidad LIMIT 1;
```
Si no da error, la tabla está creada correctamente.

---

## PASO 2: Acceder a la Calculadora

### URL
```
http://localhost:3000/wallest/calculadora
```

### Navegación desde el menú
```
1. Abrir sidebar
2. Click en "Wallest"
3. Click en "Calculadora de Rentabilidad"
```

---

## PASO 3: Usar la Calculadora

### 3.1 Completar Sección 1 - Datos del Proyecto
```
✏️ Nombre del proyecto: "Mi Primer Proyecto" (OBLIGATORIO)
✏️ Dirección: "Calle Mayor 15, 3º B"
✏️ Comunidad: "Andalucía" (por defecto)
📋 Estado: "Borrador"
⭐ Calificación: Click en las estrellas
📅 Duración: 12 meses
```

### 3.2 Completar Sección 2 - Gastos
```
En la tabla, completar al menos:
💰 Precio de compra (Estimado): 250000 (OBLIGATORIO)
🔧 Reforma (Estimado): 35000
💼 Gastos compraventa (Estimado): 3500
📊 ITP (Estimado): 25000
... (otros conceptos según necesites)

Nota: La columna "Real" es opcional, úsala cuando ejecutes el proyecto
```

### 3.3 Completar Sección 3 - Precios de Venta
```
Definir al menos uno:
📉 Pesimista: 330000
📊 Realista: 360000 (OBLIGATORIO si no hay pesimista)
📈 Optimista: 390000
```

### 3.4 Ver Sección 4 - Resultados
```
✅ Se calculan AUTOMÁTICAMENTE
✅ Aparecen 3 tarjetas con colores
✅ Muestran Beneficio, Rentabilidad, Rentabilidad Anualizada
```

### 3.5 Guardar (Sección 5)
```
Click botón "Guardar proyecto"
Aparecerá: "Proyecto guardado correctamente"
El formulario se limpiará automáticamente
```

---

## 📋 Ejemplo Completo

### Datos de Entrada
```
SECCIÓN 1:
Nombre: Reforma Malasaña 2025
Dirección: Calle Pez 25, 3ºB
Comunidad: Madrid
Estado: En marcha
Calificación: ⭐⭐⭐⭐
Duración: 8 meses

SECCIÓN 2 (Estimados):
Precio de compra: 250,000 €
Gastos compraventa: 3,500 €
ITP: 25,000 €
Reforma: 35,000 €
Comisiones: 5,000 €
(Total: 318,500 €)

SECCIÓN 3:
Pesimista: 330,000 €
Realista: 360,000 €
Optimista: 390,000 €
```

### Resultados Esperados
```
ESCENARIO PESIMISTA:
Beneficio: 11,500 €
Rentabilidad: 3.61%
Rentabilidad Anualizada: 5.46%

ESCENARIO REALISTA:
Beneficio: 41,500 €
Rentabilidad: 13.03%
Rentabilidad Anualizada: 20.11%

ESCENARIO OPTIMISTA:
Beneficio: 71,500 €
Rentabilidad: 22.45%
Rentabilidad Anualizada: 35.51%
```

---

## ⚠️ Campos Obligatorios

Para poder guardar necesitas:
1. ✅ Nombre del proyecto
2. ✅ Precio de compra (estimado o real) > 0
3. ✅ Precio de venta realista O pesimista > 0

Si falta alguno, aparecerá un mensaje de error.

---

## 🎯 Funciones Adicionales

### Exportar a CSV
```
Click botón "Exportar"
→ Se descarga archivo CSV con todos los datos
→ Nombre: calculadora_NombreProyecto_2025-10-13.csv
→ Abre en Excel o Google Sheets
```

### Imprimir
```
Click botón "Imprimir"
→ Se abre ventana de impresión del navegador
→ Puedes guardar como PDF o imprimir en papel
```

---

## 🔧 Solución de Problemas Comunes

### "Error al guardar el proyecto"
```
✓ Verificar que ejecutaste el script SQL
✓ Verificar conexión a Internet
✓ Revisar archivo .env.local
✓ Intentar refrescar la página (F5)
```

### Los cálculos no aparecen
```
✓ Asegúrate de haber ingresado valores numéricos
✓ Verifica que hay precio de venta
✓ Verifica que hay gastos
✓ Los cálculos son automáticos (no hay botón)
```

### No puedo descargar el CSV
```
✓ Verifica permisos del navegador
✓ Desbloquea pop-ups si es necesario
✓ Prueba en navegador diferente (Chrome recomendado)
```

---

## 📱 Acceso Rápido

### Desde el Dashboard Principal
```
1. Ir a http://localhost:3000
2. Click en tarjeta "Calculadora de Rentabilidad"
```

### Desde el Menú Lateral
```
1. Click en "Wallest"
2. Click en "Calculadora de Rentabilidad"
```

### URL Directa
```
http://localhost:3000/wallest/calculadora
```

---

## 💡 Consejos de Uso

### Para Proyectos Nuevos
```
✓ Completa solo la columna "Estimado"
✓ Sé conservador en el escenario pesimista
✓ Sé realista en el escenario realista
✓ Sé optimista pero razonable en el escenario optimista
```

### Para Proyectos en Ejecución
```
✓ Ve actualizando la columna "Real"
✓ Monitorea las desviaciones (verde = bien, rojo = mal)
✓ Ajusta precios de venta si es necesario
```

### Para Análisis Post-Venta
```
✓ Completa ambas columnas
✓ Analiza dónde hubo desviaciones
✓ Aprende para el siguiente proyecto
```

---

## 🎨 Interpretación de Colores

### En Desviaciones
```
🟢 Verde = Gastaste menos de lo estimado (bueno)
🔴 Rojo = Gastaste más de lo estimado (malo)
⚪ Gris = Sin desviación (exacto)
```

### En Escenarios
```
🔴 Pesimista = Escenario conservador
🟡 Realista = Escenario más probable
🟢 Optimista = Mejor escenario posible
```

### En Rentabilidad
```
🔴 Rojo < 0% = Pérdida
🟡 Amarillo 0-15% = Rentabilidad baja
🟢 Verde > 15% = Buena rentabilidad
```

---

## 📊 Entendiendo los Resultados

### Beneficio
```
= Precio de venta - Total inversión
Puede ser negativo (pérdida)
```

### Rentabilidad (%)
```
= (Beneficio / Inversión) × 100
Ej: 20% significa que ganaste 20€ por cada 100€ invertidos
```

### Rentabilidad Anualizada (%)
```
= Rentabilidad ajustada a 12 meses
Permite comparar proyectos de diferente duración
Ej: 30% en 6 meses = 60% anualizada aprox.
```

---

## ✅ Checklist de Primer Uso

Antes de empezar:
- [ ] Script SQL ejecutado en Supabase
- [ ] Tabla verificada (sin errores al consultar)
- [ ] Servidor corriendo (npm run dev)
- [ ] URL accesible (http://localhost:3000)

Para guardar tu primer proyecto:
- [ ] Nombre ingresado
- [ ] Precio de compra ingresado
- [ ] Precio de venta realista ingresado
- [ ] Ver resultados calculados
- [ ] Click "Guardar proyecto"
- [ ] Mensaje de éxito aparece

---

## 📞 Ayuda

Si tienes problemas:
1. Lee el archivo **CALCULADORA_FINAL.md** (documentación completa)
2. Revisa el archivo **RESUMEN_FINAL.md** (resumen técnico)
3. Consulta los logs de la consola del navegador (F12)
4. Verifica el Dashboard de Supabase

---

## 🎉 ¡Listo!

Ya puedes empezar a usar la Calculadora de Rentabilidad.

**Próximo paso**: Ejecuta el script SQL y empieza a crear proyectos.

---

**¿Dudas?** Consulta la documentación completa en **CALCULADORA_FINAL.md**

**¡Éxito con tus inversiones! 📈**
