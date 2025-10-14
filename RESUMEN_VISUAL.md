# 📊 Calculadora de Rentabilidad - Resumen Visual

---

## 🎯 EN POCAS PALABRAS

**¿Qué es?**  
Una calculadora de inversión inmobiliaria en **una sola pantalla** que calcula automáticamente beneficios y rentabilidades en 3 escenarios.

**¿Dónde está?**  
`http://localhost:3000/wallest/calculadora`

**¿Qué necesito para empezar?**  
Solo ejecutar un script SQL en Supabase (5 minutos).

---

## 📐 ESTRUCTURA DE LA PANTALLA

```
┌─────────────────────────────────────────────────────────┐
│  🏠 CALCULADORA DE RENTABILIDAD                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📋 SECCIÓN 1: DATOS DEL PROYECTO                       │
│  ┌──────────┬──────────┬──────────┐                    │
│  │ Nombre   │ Dirección│ Comunidad│                    │
│  │ Estado   │ ⭐ Calif │ 📅 Meses  │                    │
│  └──────────┴──────────┴──────────┘                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  💰 SECCIÓN 2: GASTOS DE LA OPERACIÓN                   │
│  ┌────────────┬──────────┬────────┬──────────┐         │
│  │ Concepto   │ Estimado │  Real  │Desviación│         │
│  ├────────────┼──────────┼────────┼──────────┤         │
│  │ Compra     │ 250,000€ │ 0.00€  │  0.00€   │         │
│  │ Reforma    │  35,000€ │ 0.00€  │  0.00€   │         │
│  │ ITP        │  25,000€ │ 0.00€  │  0.00€   │         │
│  │ ...        │     ...  │   ...  │   ...    │         │
│  ├────────────┼──────────┼────────┼──────────┤         │
│  │ TOTAL      │ 318,500€ │ 0.00€  │  0.00€   │         │
│  └────────────┴──────────┴────────┴──────────┘         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 SECCIÓN 3: PRECIO DE VENTA - ESCENARIOS             │
│  ┌──────────┬──────────┬──────────┐                    │
│  │Pesimista │ Realista │Optimista │                    │
│  │ 330,000€ │ 360,000€ │ 390,000€ │                    │
│  └──────────┴──────────┴──────────┘                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📈 SECCIÓN 4: RESULTADOS AUTOMÁTICOS                   │
│  ┌─────────────┬─────────────┬─────────────┐           │
│  │ 🔴 PESIMIST │ 🟡 REALISTA │ 🟢 OPTIMIST │           │
│  ├─────────────┼─────────────┼─────────────┤           │
│  │ Beneficio   │  Beneficio  │  Beneficio  │           │
│  │  11,500€    │   41,500€   │   71,500€   │           │
│  │             │             │             │           │
│  │Rentabilidad │Rentabilidad │Rentabilidad │           │
│  │   3.61%     │   13.03%    │   22.45%    │           │
│  │             │             │             │           │
│  │Rent. Anual. │Rent. Anual. │Rent. Anual. │           │
│  │   5.46%     │   20.11%    │   35.51%    │           │
│  └─────────────┴─────────────┴─────────────┘           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚙️  SECCIÓN 5: ACCIONES                                │
│  ┌────────────┬───────────┬──────────┐                 │
│  │ 💾 Guardar │📄 Exportar│🖨️ Imprimir│                 │
│  └────────────┴───────────┴──────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔢 CAMPOS POR SECCIÓN

| SECCIÓN | CAMPOS | TIPO | OBLIGATORIO |
|---------|--------|------|-------------|
| **1. Datos** | Nombre | Texto | ✅ Sí |
| | Dirección | Texto | ❌ No |
| | Comunidad | Texto | ❌ No (default: Andalucía) |
| | Estado | Select | ❌ No (default: Borrador) |
| | Calificación | Estrellas 0-5 | ❌ No |
| | Duración | Número | ❌ No (default: 12) |
| **2. Gastos** | 14 conceptos × 2 | Número | ✅ Al menos Precio compra |
| | (Estimado + Real) | | |
| **3. Precios** | Pesimista | Número | ✅ Uno de los tres |
| | Realista | Número | ✅ Uno de los tres |
| | Optimista | Número | ❌ No |
| **4. Resultados** | - | Auto | - |
| **5. Acciones** | - | Botones | - |

---

## 📊 LOS 14 CONCEPTOS DE GASTOS

| # | CONCEPTO | DESCRIPCIÓN |
|---|----------|-------------|
| 1 | **Precio de compra** | Valor de adquisición del inmueble |
| 2 | **Gastos compraventa** | Notario, registro, gestoría |
| 3 | **Gastos cancelación** | Notario, registro cancelaciones |
| 4 | **ITP** | Impuesto Transmisiones Patrimoniales |
| 5 | **Honorarios profesionales** | Abogados, asesores |
| 6 | **Honorarios complementaria** | Gestiones administrativas |
| 7 | **Certificado energético** | Certificación obligatoria |
| 8 | **Comisiones inmobiliarias** | Agencia, intermediación |
| 9 | **Reforma** | Obras, materiales, mano de obra |
| 10 | **Seguros** | Hogar, responsabilidad civil |
| 11 | **Suministros / basura** | Agua, luz, gas, basura |
| 12 | **Cuotas comunidad** | Gastos comunidad propietarios |
| 13 | **Deuda IBI** | IBI pendiente de pago |
| 14 | **Deuda comunidad** | Deudas comunidad pendientes |

---

## 🧮 FÓRMULAS APLICADAS

| RESULTADO | FÓRMULA |
|-----------|---------|
| **Total Inversión** | Σ Gastos (estimados o reales) |
| **Beneficio** | Precio venta - Total inversión |
| **Rentabilidad (%)** | (Beneficio / Total inversión) × 100 |
| **Rentabilidad Anualizada (%)** | [(1 + Rent/100)^(12/meses) - 1] × 100 |
| **Desviación** | Real - Estimado |

---

## 🎨 CÓDIGO DE COLORES

### Escenarios
| COLOR | ESCENARIO | SIGNIFICADO |
|-------|-----------|-------------|
| 🔴 Rojo | Pesimista | Escenario conservador / peor caso |
| 🟡 Amarillo | Realista | Escenario más probable |
| 🟢 Verde | Optimista | Mejor escenario posible |

### Desviaciones
| COLOR | VALOR | SIGNIFICADO |
|-------|-------|-------------|
| 🟢 Verde | Negativo | Gastaste menos (ahorro) ✅ |
| 🔴 Rojo | Positivo | Gastaste más (sobrecosto) ❌ |
| ⚪ Gris | Cero | Sin desviación |

### Rentabilidades
| COLOR | RANGO | EVALUACIÓN |
|-------|-------|------------|
| 🔴 Rojo | < 0% | Pérdida |
| 🟡 Amarillo | 0% - 15% | Rentabilidad baja |
| 🟢 Verde | > 15% | Buena rentabilidad |

---

## 💾 DATOS GUARDADOS EN SUPABASE

| CATEGORÍA | CAMPOS | TOTAL |
|-----------|--------|-------|
| Básicos | id, nombre, dirección, comunidad, estado, calificación, duración | 7 |
| Gastos estimados | precio_compra_estimado, ... (14 conceptos) | 14 |
| Gastos reales | precio_compra_real, ... (14 conceptos) | 14 |
| Precios venta | pesimista, realista, optimista | 3 |
| Resultados | rentabilidad × 3, rentabilidad_anualizada × 3 | 6 |
| Metadatos | created_at, updated_at | 2 |
| **TOTAL** | | **46** |

---

## ⚡ ACCIONES DISPONIBLES

| ACCIÓN | BOTÓN | FUNCIONALIDAD |
|--------|-------|---------------|
| **Guardar** | 💾 Guardar proyecto | Inserta en Supabase → Limpia formulario → Mensaje éxito |
| **Exportar** | 📄 Exportar | Genera CSV → Descarga archivo con fecha |
| **Imprimir** | 🖨️ Imprimir | Abre diálogo impresión → PDF o papel |

---

## 📋 FLUJO DE TRABAJO

```
1. PREPARAR
   ├─ Ejecutar script SQL en Supabase
   └─ Acceder a /wallest/calculadora

2. COMPLETAR DATOS
   ├─ Sección 1: Datos del proyecto
   ├─ Sección 2: Gastos (Estimados)
   └─ Sección 3: Precios de venta

3. REVISAR RESULTADOS
   └─ Sección 4: Ver 3 escenarios

4. GUARDAR O EXPORTAR
   ├─ Click "Guardar proyecto" → Supabase
   ├─ Click "Exportar" → CSV
   └─ Click "Imprimir" → PDF/Papel
```

---

## ✅ VALIDACIONES AUTOMÁTICAS

| VALIDACIÓN | MENSAJE |
|------------|---------|
| ❌ Sin nombre | "El nombre del proyecto es obligatorio" |
| ❌ Sin precio compra | "Debe ingresar el precio de compra" |
| ❌ Sin precio venta | "Debe ingresar al menos un precio de venta..." |
| ✅ Todo OK | "Proyecto guardado correctamente" |

---

## 🔄 CÁLCULOS EN TIEMPO REAL

| CUANDO CAMBIAS... | SE RECALCULA... |
|-------------------|-----------------|
| Cualquier gasto | Total inversión |
| Total inversión | Beneficio (× 3) |
| Beneficio | Rentabilidad (× 3) |
| Rentabilidad | Rentabilidad anualizada (× 3) |
| Duración | Rentabilidad anualizada (× 3) |
| Precio venta | Beneficio (× 3) → Todo lo demás |

**Resultado:** Siempre ves los cálculos actualizados, sin botón "Calcular"

---

## 📁 ARCHIVOS DEL PROYECTO

| ARCHIVO | DESCRIPCIÓN | LÍNEAS |
|---------|-------------|--------|
| `/app/wallest/calculadora/page.tsx` | Componente principal | ~600 |
| `/lib/supabase.ts` | Tipos TypeScript | Actualizado |
| `/scripts/migracion_calculadora_final.sql` | Script SQL | ~200 |
| `/CALCULADORA_FINAL.md` | Documentación completa | ~800 |
| `/RESUMEN_FINAL.md` | Resumen ejecutivo | ~500 |
| `/INSTRUCCIONES_RAPIDAS.md` | Guía paso a paso | ~400 |
| `/RESUMEN_VISUAL.md` | Este archivo | ~250 |

---

## 🚀 INICIAR EN 3 PASOS

```
┌─────────────────────────────────────────────┐
│ PASO 1: SUPABASE                            │
│ ┌─────────────────────────────────────────┐ │
│ │ SQL Editor > New Query                  │ │
│ │ Copiar: migracion_calculadora_final.sql│ │
│ │ Run ▶️                                   │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PASO 2: ACCEDER                             │
│ ┌─────────────────────────────────────────┐ │
│ │ http://localhost:3000/wallest/calculadora│ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PASO 3: USAR                                │
│ ┌─────────────────────────────────────────┐ │
│ │ Completar datos → Ver resultados        │ │
│ │ Guardar proyecto ✅                      │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📊 EJEMPLO VISUAL

```
ENTRADA:
┌────────────────────────────────────────┐
│ Nombre: Reforma Malasaña 2025         │
│ Duración: 8 meses                      │
│                                        │
│ GASTOS:                                │
│ Compra:     250,000 €                  │
│ Reforma:     35,000 €                  │
│ Gastos:       3,500 €                  │
│ ITP:         25,000 €                  │
│ Comisiones:   5,000 €                  │
│ ──────────────────────                 │
│ TOTAL:      318,500 €                  │
│                                        │
│ VENTAS:                                │
│ Pesimista:  330,000 €                  │
│ Realista:   360,000 €                  │
│ Optimista:  390,000 €                  │
└────────────────────────────────────────┘

SALIDA:
┌──────────────┬──────────────┬──────────────┐
│  PESIMISTA   │   REALISTA   │  OPTIMISTA   │
├──────────────┼──────────────┼──────────────┤
│ Beneficio:   │ Beneficio:   │ Beneficio:   │
│  11,500 €    │  41,500 €    │  71,500 €    │
│              │              │              │
│ Rent: 3.61%  │ Rent: 13.03% │ Rent: 22.45% │
│              │              │              │
│ Anual: 5.46% │ Anual:20.11% │ Anual:35.51% │
└──────────────┴──────────────┴──────────────┘
```

---

## ✨ CARACTERÍSTICAS DESTACADAS

| CARACTERÍSTICA | DESCRIPCIÓN |
|----------------|-------------|
| 🎯 **Una sola pantalla** | Todo visible, sin navegación |
| ⚡ **Cálculos automáticos** | useEffect + tiempo real |
| 📊 **3 escenarios** | Análisis completo de riesgo |
| 💾 **Persistencia** | Supabase integrado |
| 📄 **Exportación** | CSV descargable |
| 🖨️ **Impresión** | PDF o papel |
| 🎨 **Tema oscuro** | WOS consistency |
| 🌐 **Formato europeo** | "1.234,56 €" |
| ✅ **Validaciones** | Campos obligatorios |
| 🎨 **Colores semánticos** | Visual clarity |

---

## 🎓 CONCEPTOS CLAVE

| TÉRMINO | SIGNIFICADO |
|---------|-------------|
| **Estimado** | Valor proyectado antes de ejecutar |
| **Real** | Valor efectivo después de ejecutar |
| **Desviación** | Diferencia entre real y estimado |
| **Beneficio** | Ganancia = Venta - Inversión |
| **Rentabilidad** | % de ganancia sobre inversión |
| **Rent. Anualizada** | Rentabilidad ajustada a 12 meses |
| **Escenario** | Proyección: pesimista, realista, optimista |

---

## 🏆 VENTAJAS

✅ **Simplicidad** - Una sola pantalla  
✅ **Velocidad** - Cálculos instantáneos  
✅ **Precisión** - Fórmulas financieras correctas  
✅ **Flexibilidad** - 3 escenarios paralelos  
✅ **Profesionalidad** - Exportación e impresión  
✅ **Persistencia** - Guarda en base de datos  
✅ **Usabilidad** - Interfaz intuitiva  

---

## 📞 SOPORTE

| NECESITAS... | CONSULTA... |
|--------------|-------------|
| Guía completa | CALCULADORA_FINAL.md |
| Resumen técnico | RESUMEN_FINAL.md |
| Paso a paso | INSTRUCCIONES_RAPIDAS.md |
| Vista rápida | RESUMEN_VISUAL.md (este) |
| Script SQL | scripts/migracion_calculadora_final.sql |

---

**🎉 ¡La calculadora más completa y sencilla para análisis de inversión inmobiliaria!**

**Estado**: ✅ Completado  
**Versión**: Final  
**Fecha**: 2025-10-13
