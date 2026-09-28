# UX Fixes — App Conductor Gacov

Auditoría realizada el 27/09/2026 en staging (`staging-gacov.andersonmares.xyz`, usuario `ruta1@ingacov.com`).
Todos los cambios son de frontend/Blade únicamente — sin migraciones, sin cambios de modelo.

---

## FIX-01 🔴 CRÍTICO — Badge "LISTO" con máquinas incompletas

**Archivo:** `resources/views/driver/dashboard.blade.php`

**Problema:**  
El badge "LISTO" (verde) aparece en una ubicación cuando solo 1 de 2 máquinas está surtida. La condición actual evalúa algo distinto a "todas las máquinas completas". Esto genera información falsa: el conductor puede asumir que la ubicación está terminada y saltarse la máquina faltante.

**Comportamiento esperado:**
- Badge **"LISTO"** (verde) → SOLO cuando `$pendingCount === 0 && $inProgressCount === 0` (todas las máquinas están COMPLETADO o NO_SURTIDA).
- Badge **"EN PROGRESO"** (amarillo/amber) → cuando hay al menos una máquina en progreso o ya surtida pero quedan otras pendientes.
- Badge **"PENDIENTE"** (gris) → cuando ninguna máquina ha sido tocada aún.

**Búsqueda en el archivo:** buscar la sección donde se calcula el badge por ubicación. El badge usa algo como `@if($locationCompleted)` o similar. Revisar que la variable `$locationCompleted` (o como se llame) requiera que TODAS las máquinas estén terminadas, no solo algunas.

**Variables disponibles en la vista** (ya calculadas por el controlador o inline en la vista):
```
$pendingCount     // máquinas sin tocar
$inProgressCount  // máquinas en INICIADO / PENDIENTE_CARGA / EN_SURTIDO
$completedCount   // máquinas en COMPLETADO
$noSurtidaCount   // máquinas en NO_SURTIDA
$totalMachines    // total de máquinas en la ubicación
```

**Lógica de badge correcta:**
```php
@php
  $allDone = ($pendingCount === 0 && $inProgressCount === 0);
  $anyDone = ($completedCount > 0 || $noSurtidaCount > 0);
@endphp

@if($allDone)
  {{-- LISTO: todas completas o no-surtidas --}}
  <span class="badge-listo">LISTO</span>
@elseif($anyDone)
  {{-- EN PROGRESO: algunas hechas, otras no --}}
  <span class="badge-en-progreso">EN PROGRESO</span>
@else
  {{-- PENDIENTE: ninguna tocada --}}
  <span class="badge-pendiente">PENDIENTE</span>
@endif
```

Usar los estilos CSS/clases ya existentes para PENDIENTE (gris/amarillo) y reusar el verde de LISTO. Si no existe clase para "EN PROGRESO", añadir una con color amber/naranja similar al chip "7 activas" que ya existe en el dashboard.

---

## FIX-02 🟡 — "Sin vehículo" sin instrucción de acción

**Archivo:** `resources/views/driver/dashboard.blade.php`

**Problema:**  
El texto `Sin vehículo` aparece en tipografía monoespaciada (`<code>` o similar) sin contexto. Un conductor nuevo no sabe si es un error, si puede seguir trabajando, o a quién llamar.

**Buscar:** el bloque donde se muestra el estado del vehículo (`vehicleWarehouse`, `$vehicle`, o similar). Buscar texto "Sin vehículo" o "sin_vehiculo" o `!$vehicleWarehouse`.

**Cambio:**  
Reemplazar el texto técnico por un mensaje de acción concreto con ícono de advertencia:

```html
{{-- Antes --}}
<code>Sin vehículo</code>

{{-- Después --}}
<span class="vehicle-warning">
  ⚠️ Sin vehículo asignado — avisa a tu supervisor antes de surtir
</span>
```

O, si el componente ya tiene un bloque de alerta, adaptar el texto. El estilo debe ser similar al chip/badge amarillo-naranja ya existente en la app (no código monoespaciado).

---

## FIX-03 🟡 — Píldoras de máquinas sin leyenda

**Archivo:** `resources/views/driver/stocking/create.blade.php`

**Problema:**  
Las píldoras de navegación entre máquinas (por ejemplo: `● M033 →` `● M017` `● M037 →`) tienen tres estados visuales pero nunca se explican. Un conductor nuevo no sabe que:
- Píldora oscura rellena = máquina actual
- Flecha `→` = máquina pendiente (sin surtir)
- Sin flecha + borde = ya surtida
- `· no surtir` = marcada como no-surtir

**Buscar:** el bloque de pills de máquinas. Probablemente un `@foreach($machines as $m)` con clases condicionales.

**Cambio:**  
Agregar una leyenda pequeña debajo del row de píldoras. Solo mostrarla cuando hay más de una máquina:

```html
@if(count($machines) > 1)
<div class="machine-pill-legend">
  <span>● actual</span>
  <span>→ pendiente</span>
  <span>✓ surtida</span>
  <span>✗ no surtir</span>
</div>
@endif
```

Estilo sugerido para `.machine-pill-legend`:
```css
.machine-pill-legend {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  margin-top: 4px;
  flex-wrap: wrap;
}
```

Colocar inmediatamente después del `</div>` que contiene el row de píldoras.

---

## FIX-04 🟡 — 44 productos en Mixta sin subcategorías

**Archivo:** `resources/views/driver/stocking/create.blade.php`

**Problema:**  
El tab "Mixta" muestra 44 productos en una lista plana mezclando snacks, bebidas gaseosas, bebidas hidratantes, dulces y pasabocas. El conductor tiene que scrollear toda la lista sin puntos de referencia.

**Buscar:** el loop de productos en el tab Mixta. Probablemente `@foreach($items as $item)` o `$products->where('category', 'mixta')`.

**Cambio:**  
Agrupar los productos por categoría antes de renderizarlos, e insertar un encabezado por grupo. Si los productos no tienen campo `category`, usar el prefijo del código SKU o el nombre para inferir la categoría (heurística: si el nombre contiene "ML" o "300ML/400ML/500ML/600ML/200ML" → Bebidas; si contiene "CAFÉ" o "CAPPUCCINO" → Café; resto → Snacks).

Implementación preferida — agrupar en PHP antes de pasar a la vista:
```php
// En el controlador o en el blade:
$groupedProducts = $mixtaProducts->groupBy(function($p) {
    $name = strtoupper($p->name);
    if (preg_match('/\d+ML|\bAGUA\b|\bCOCA|\bHIT\b|\bMALTA\b|\bSPORADE\b|\bBRISA\b|\bVIVE\b|\bMR TEA\b|\bSODA\b|\bCIFRUT\b|\bISOT|\bAGUA SAB/i', $name)) {
        return 'Bebidas';
    }
    return 'Snacks y dulces';
});
```

Luego en el blade:
```html
@foreach($groupedProducts as $group => $products)
  <div class="product-group-header">{{ $group }}</div>
  @foreach($products as $product)
    {{-- card del producto --}}
  @endforeach
@endforeach
```

Estilo del encabezado de grupo:
```css
.product-group-header {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted, #64748B);
  padding: 12px 0 4px;
  border-bottom: 1px solid var(--border, #E2E8F0);
  margin-bottom: 8px;
}
```

---

## FIX-05 🟡 — "Marcar máquinas que no vas a surtir hoy" poco visible

**Archivo:** `resources/views/driver/stocking/create.blade.php`

**Problema:**  
Este `<details>/<summary>` está en texto gris semi-transparente (`rgba(255,255,255,0.72)`) y es el único camino para marcar una máquina como No surtir. Un conductor nuevo lo ignora porque parece texto de ayuda, no una acción disponible.

**Buscar:** `<details` o `Marcar máquinas que no vas a surtir hoy` en el archivo.

**Cambio:**  
Reemplazar el estilo del `<summary>` para que parezca un elemento interactivo claro. Mantener el `<details>` (la funcionalidad de expandir está bien), solo mejorar la apariencia:

```html
{{-- Antes --}}
<summary style="cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:rgba(255,255,255,.72)">
  <svg ...><!-- icono --></svg>
  Marcar máquinas que no vas a surtir hoy
</summary>

{{-- Después --}}
<summary class="no-surtir-toggle">
  <svg width="14" height="14" ...><!-- icono de prohibido/x --></svg>
  No voy a surtir alguna máquina de esta ubicación
</summary>
```

CSS para `.no-surtir-toggle`:
```css
.no-surtir-toggle {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  transition: background 0.15s;
}
.no-surtir-toggle:hover {
  background: rgba(255,255,255,0.14);
}
```

Si hay 2 o más máquinas en la ubicación, mostrar el `<details>` expandido por defecto (`<details open>`).

---

## FIX-06 🟡 — Formulario editable cuando la máquina ya fue surtida hoy

**Archivo:** `resources/views/driver/stocking/create.blade.php`

**Problema:**  
El banner verde "✓ Máquina surtida hoy para esta fecha de operación" aparece, pero los campos de productos siguen editables. El conductor puede empezar a rellenar cantidades sin darse cuenta de que ya existe un surtido guardado. El dialog "¿Reabrir este surtido?" no aparece hasta que se intenta guardar.

**Buscar:** la variable que controla si la máquina ya tiene un surtido del día. Probablemente `$existingRecord`, `$machineAlreadyStocked`, o se detecta con `$registeredMachineIds->contains($machine->id)`.

**Cambio:**  
Cuando la máquina ya tiene surtido, deshabilitar todos los inputs del formulario y mostrar un botón prominente de "Reabrir":

```html
@php $yaFueSurtida = $existingRecord !== null && $existingRecord->status === 'completado'; @endphp

@if($yaFueSurtida)
  {{-- Mostrar formulario solo lectura --}}
  <div class="already-stocked-banner">
    <div class="already-stocked-text">
      ✓ Esta máquina ya fue surtida hoy. Los datos no se pueden editar.
    </div>
    <button type="button" class="reopen-btn" onclick="document.getElementById('reopen-modal').hidden = false">
      Editar este surtido
    </button>
  </div>
  {{-- Deshabilitar todos los inputs --}}
  <fieldset disabled style="all:unset; display:contents;">
    {{-- Aquí va el contenido normal del formulario --}}
  </fieldset>
@else
  {{-- Formulario normal editable --}}
@endif
```

Alternativamente, si el `<fieldset disabled>` rompe los estilos, agregar `pointer-events: none; opacity: 0.6` al contenedor de los productos cuando `$yaFueSurtida`.

---

## FIX-07 🟡 — "MONEDAS G" no está explicado

**Archivo:** `resources/views/driver/stocking/create.blade.php` (tab Dinero)

**Problema:**  
La sección "MONEDAS G" no aclara qué significa "G". Además hay "Moneda G $200" y "Moneda $200" como dos filas separadas (misma denominación, tipo diferente), lo que confunde al conductor sobre cuál usar.

**Buscar:** los encabezados de sección del tab Dinero: "BILLETES", "MONEDAS GRANDES", "MONEDAS G", "MONEDAS PEQUEÑAS".

**Cambio opción A** (si G = Gruesas, moneda física diferente):  
Renombrar "MONEDAS G" a "MONEDAS GRUESAS" para que sea autoexplicativo. Agregar una nota breve:
```html
<div class="denom-section-header">
  MONEDAS GRUESAS
  <span class="denom-note">(moneda grande de borde grueso)</span>
</div>
```

**Cambio opción B** (si G y la normal son el mismo tipo):  
Unificar las filas de la misma denominación en una sola. Si `coin_g_200` y `coin_200` se refieren a la misma moneda física, consolidar en un solo campo y sumar sus valores en el backend.

**Cambio mínimo (sin tocar backend):**  
Al menos renombrar los encabezados para que sean claros:
- "MONEDAS G" → "MONEDAS GRUESAS ($200 y $100 tipo antiguo)"
- "MONEDAS PEQUEÑAS" → "MONEDAS PEQUEÑAS ($200 y $100 tipo nuevo)"

---

## FIX-08 🟡 — Nombres del stepper no corresponden a la acción del conductor

**Archivo:** `resources/views/driver/stocking/create.blade.php` (y posiblemente `loading.blade.php`, `stock.blade.php`)

**Problema:**  
El stepper muestra: `1 Seleccionar → 2 Surtido → 3 Finalizar surtido`. Estos son nombres internos del sistema, no acciones que el conductor reconozca naturalmente.

**Cambio:**  
Renombrar los tres pasos a lenguaje de acción:

| Antes | Después |
|-------|---------|
| 1 Seleccionar | 1 Anotar cantidades |
| 2 Surtido | 2 Confirmar cargue |
| 3 Finalizar surtido | 3 Cerrar máquina |

**Buscar:** el HTML del stepper. Probablemente:
```html
<span>Seleccionar</span>
<span>Surtido</span>
<span>Finalizar surtido</span>
```
o variables `$step`, `$stepLabel`, o similares.

Si el stepper está en un componente compartido (`@include('components.stepper', ...)`), el cambio va en ese componente o en los parámetros que se le pasan desde cada vista.

---

## FIX-09 🟡 — Descripción técnica de tabla en Paso 2

**Archivo:** `resources/views/driver/stocking/loading.blade.php`

**Problema:**  
Texto: "Productos y dinero en filas; máquinas en columnas." — jerga de tablas que el conductor no necesita conocer.

**Buscar:** esa cadena exacta en el archivo.

**Cambio:**  
Reemplazar por:
```
"Revisa los productos que debes cargar en tu vehículo para esta tanda."
```

o simplemente eliminar esa descripción si el encabezado de sección ("Consolidado de carga") ya es suficiente.

---

## Notas para el implementador

1. **No tocar** ningún archivo `.env`, migraciones existentes, ni modelos PHP.
2. **No romper** la lógica del JavaScript/Alpine.js existente al modificar clases en el HTML. Verificar que las clases CSS no sean usadas como selectores JS.
3. **Probar** cada fix en viewport móvil (375px) — toda la app se usa en celular.
4. **El fix del lock** (`location_group` en `CreateStockingInspection`) ya está desplegado en commits `77e275f6` y `6e0803bb`. No re-implementar.
5. **El fix del botón oculto** ("Guardar preparación" cuando todas las máquinas están completas) ya está desplegado en commit `8e54af89`. No re-implementar.
6. Los archivos principales a tocar son:
   - `resources/views/driver/dashboard.blade.php` → FIX-01, FIX-02
   - `resources/views/driver/stocking/create.blade.php` → FIX-03, FIX-04, FIX-05, FIX-06, FIX-07, FIX-08
   - `resources/views/driver/stocking/loading.blade.php` → FIX-09
