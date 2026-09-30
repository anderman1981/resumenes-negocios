# 📁 Finanzas Personales y Contenido Digital

(Serie completa: "Guías Estratégicas de Finanzas Personales y Contenido Digital" — nombre corto en el sitio: **"Finanzas Personales y Contenido Digital"**)

Espacio local para recibir **TODO el material** de la próxima serie.
Publicación programada: **del lunes 6 al domingo 12 de octubre de 2026** (un capítulo por día).

## Qué va aquí (material fuente — NUNCA se publica directamente)

| Archivo | Ejemplo | Notas |
|---------|---------|-------|
| Guiones / notas | `Dia_1_*.md` | markdown |
| Portadas | `Dia_1_Portada_Spotify.jpg` | jpg/png |
| Subtítulos | `Dia_1_*_subtitulos.srt` | — |
| PDFs de referencia | `*.pdf` | git los ignora |
| Audios | `*.m4a` | git los ignora (sube a Spotify y pega el link) |

> ⚠️ Esta carpeta **no lleva `resumen.md`** → `npm run publicar` la salta siempre.
> Así el material fuente jamás se publica por accidente.

## Cómo se publica cada capítulo

1. Se crea `_cola/guias-finanzas-digitales-dia-N/resumen.md`
   partiendo de `plantilla-resumen.md` (de esta carpeta)
2. `npm run publicar` → copia a `src/content/resumenes/`, archiva y hace push
3. El goteo hace el resto: **Día 1 = 6 oct … Día 7 = 12 oct**
4. La tarjeta en homepage + el hub `/curso/guias-finanzas-digitales`
   **se crean solos** (así funciona el sistema de series)

## Slug de los capítulos

```
guias-finanzas-digitales-dia-1
guias-finanzas-digitales-dia-2
…
guias-finanzas-digitales-dia-7
```
