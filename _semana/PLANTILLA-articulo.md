# PLANTILLA de artículo / serie — para generar contenido con open code

Este archivo le dice a un agente (open code / Codex) **cómo crear cada `.md`** de la web
respetando exactamente la estructura actual. NO edites este archivo como si fuera un
artículo: cópialo como molde.

## Reglas de ubicación y nombre
- Cada artículo es un archivo `src/content/resumenes/<slug>.md`.
- `<slug>` = minúsculas, números y guiones. Sin acentos ni espacios. Es la URL:
  `https://resumenes-negocios.vercel.app/resumenes/<slug>`.
- En una serie por días, un archivo por día (día 1, día 2, …), cada uno con su `dia` y su `fecha`.

## Reglas del frontmatter (los datos entre `---`)
- `titulo`         (obligatorio) título atractivo, con comillas.
- `libro`          (obligatorio) obra/documento original. En series añade "(Día N)".
- `autor`          (obligatorio) autor original de la obra.
- `categoria`      (obligatorio) uno de estos slugs EXACTOS:
  `marketing-digital` · `emprendimiento` · `finanzas-personales` · `productividad` · `ventas` · `ecommerce`
- `descripcion`    (obligatorio) meta SEO de 150-160 caracteres, una sola frase.
- `minutosLectura` (número) tiempo estimado, normalmente 6-10.
- `ideasClave`     (lista) 3-5 bullets potentes; cada uno entre comillas.
- `fecha`          (obligatorio) `AAAA-MM-DD`. Con esta fecha se activa el goteo:
  el artículo NO aparece hasta ese día. En una serie, un día consecutivo por módulo.
- `destacado`      `true` solo para 1-2 piezas ancla; el resto `false`.
- `borrador`       `true` = no se publica (útil mientras se redacta). `false` = listo.
- `tags`           (lista) 4-6 etiquetas en minúscula.
- `serie`          (solo series) slug del curso, ej: `finanzas-en-30-dias`. Igual en todos los días.
- `serieNombre`    (solo series) nombre visible de la serie. Igual en todos los días.
- `dia`            (solo series) número del módulo dentro de la serie (1, 2, 3…).
- Multimedia (todos opcionales; se rellenan cuando existan):
  - `audio`        ruta local del audio, ej: `/audio/<slug>.mp3`
  - `spotify`      URL del episodio, ej: `https://open.spotify.com/episode/XXXX`
  - `youtube`      solo el ID del vídeo, ej: `dQw4w9WgXcQ`
  - `audioPublico` URL pública del audio (para el feed RSS del podcast)
- Solo en el ÚLTIMO día de una serie (entrega la guía maestra):
  - `guiaFinal: true`
  - `pdf: "/guias/<archivo>.pdf"`
  - `pdfNombre: "Descargar la Guía Maestra"`

## Estructura del cuerpo (Markdown, después del segundo `---`)
Usar SIEMPRE estos encabezados `##`, en este orden:
1. `## De qué trata` — 1 párrafo con la idea rectora del módulo.
2. Secciones propias del tema con `##` (y `###` para subpuntos). En acrónimos/marcos,
   una `###` por letra/paso, como en el ejemplo CLOSER.
3. `## Cómo aplicarlo hoy` — lista numerada de 3-4 acciones concretas.
4. `## Conclusión` — 2-4 frases que cierran y motivan al siguiente día.
5. Cita final de atribución educativa con `>` (obligatoria para material de terceros).

---

## MOLDE — módulo normal de una serie (copiar y rellenar)

```markdown
---
titulo: "TÍTULO DEL DÍA"
libro: "NOMBRE DE LA OBRA (Día N)"
autor: "AUTOR ORIGINAL"
categoria: "productividad"
descripcion: "Meta descripción SEO de 150-160 caracteres, una sola frase que resuma el valor del módulo."
minutosLectura: 8
ideasClave:
  - "Idea potente 1"
  - "Idea potente 2"
  - "Idea potente 3"
  - "Idea potente 4"
fecha: 2026-10-05
destacado: false
borrador: false
tags: ["tag1", "tag2", "tag3", "tag4"]
serie: "SLUG-DE-LA-SERIE"
serieNombre: "NOMBRE VISIBLE DE LA SERIE"
dia: 1
audio: "/audio/SLUG-DEL-ARTICULO.mp3"
spotify: ""
---

## De qué trata

Un párrafo con la idea rectora del módulo y por qué importa.

## SECCIÓN PRINCIPAL DEL TEMA

Desarrollo. Usa **negritas** para los conceptos clave.

### Subpunto o paso 1

Texto.

### Subpunto o paso 2

Texto.

## Cómo aplicarlo hoy

1. **Acción 1**: …
2. **Acción 2**: …
3. **Acción 3**: …

## Conclusión

Dos a cuatro frases que cierran el módulo y enganchan con el siguiente día.

> Resumen original con fines educativos del material de AUTOR. No reproduce el contenido original.
```

---

## MOLDE — ÚLTIMO día de la serie (con Guía Maestra en PDF)

Igual que el anterior, pero añadiendo estos campos al frontmatter:

```yaml
guiaFinal: true
pdf: "/guias/NOMBRE-GUIA.pdf"
pdfNombre: "Descargar la Guía Maestra"
```

---

## Cómo pedirle a open code que genere una serie nueva
Ejemplo de instrucción:

> "Usando `_semana/PLANTILLA-articulo.md`, crea una serie de 7 días llamada
> **‹NOMBRE›** (slug `‹slug-serie›`), categoría `‹categoria›`, basada en
> ‹libro/tema›. Genera 7 archivos en `src/content/resumenes/` con fechas
> consecutivas empezando el ‹AAAA-MM-DD›, `dia` de 1 a 7, `borrador: false`,
> y el día 7 con `guiaFinal: true`. Deja `spotify`/`youtube` vacíos."
