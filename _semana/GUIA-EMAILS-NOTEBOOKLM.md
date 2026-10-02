# Guía: generar los emails diarios con NotebookLM

Objetivo: para cada capítulo del día, producir el **texto del correo** (asunto + cuerpo corto)
que notifica a los suscriptores que salió un nuevo post. El diseño del email (HTML) es fijo;
NotebookLM solo rellena el **copy**. Así los correos salen consistentes y rápidos de generar.

## Qué partes tiene cada email

1. **Asunto** (subject) — 1 línea, 40-60 caracteres, con gancho. Sin clickbait engañoso.
2. **Preheader** — 1 línea de ~80 caracteres (el texto gris que se ve junto al asunto).
3. **Saludo + entradilla** — 2-3 frases que enganchan con el dolor/beneficio del día.
4. **3 ideas clave** — bullets (se toman de `ideasClave` del artículo).
5. **CTA** — botón "Leer el resumen de hoy" (apunta a la URL del artículo).
6. **Extras** — línea con el enlace al episodio de Spotify y al vídeo de YouTube si existen.
7. **Pie** — marca + enlace de baja (lo añade el sistema automáticamente, no lo escribas).

## Prompt para NotebookLM (pégalo tal cual)

> Actúa como copywriter de email marketing. A partir del contenido del Día N de la serie
> "Ventas con Lógica", redacta el correo de notificación diaria en **español neutro**.
> Devuélvelo EXACTAMENTE en este formato, sin texto adicional:
>
> ASUNTO: (40-60 caracteres, con gancho, sin clickbait)
> PREHEADER: (~80 caracteres, complementa el asunto, no lo repite)
> ENTRADILLA: (2-3 frases; nombra el problema real y la promesa del día; tono cercano, experto)
> IDEAS:
> - (idea 1, máx 12 palabras)
> - (idea 2, máx 12 palabras)
> - (idea 3, máx 12 palabras)
> CTA: (3-5 palabras para el botón, ej. "Leer el resumen de hoy")
>
> Reglas: nada de MAYÚSCULAS gritando, máximo 1 emoji en el asunto, sin promesas de dinero
> garantizado, sin signos de exclamación múltiples. El objetivo es que el suscriptor haga clic
> para leer el resumen completo en la web.

## Cómo usarlo, día por día

1. En NotebookLM, abre el notebook de la serie (donde están los guiones/PDF del día).
2. Pega el prompt de arriba cambiando "Día N" por el día que toca.
3. Copia la salida (ASUNTO / PREHEADER / ENTRADILLA / IDEAS / CTA).
4. Pégala donde se cargan los emails (ver más abajo cuando el envío esté montado):
   un archivo por día `emails/dia-N.md` con ese bloque, o el campo correspondiente en el panel admin.

## Formato de archivo que consume el sistema (cuando el envío esté activo)

Guarda cada correo como `emails/<slug-del-articulo>.md` con este frontmatter:

```markdown
---
asunto: "..."
preheader: "..."
cta: "Leer el resumen de hoy"
---
Entradilla en 2-3 frases.

- Idea clave 1
- Idea clave 2
- Idea clave 3
```

El resto (plantilla HTML, logo, botón, enlaces a Spotify/YouTube, enlace de baja y la URL del
artículo) lo arma el sistema automáticamente a partir del artículo del día. Tú solo pegas el copy.

## Buenas prácticas de entregabilidad (para no caer en spam)

- Un solo tema por correo (el post del día). Nada de adjuntar PDFs pesados: enlaza.
- Asuntos honestos; evita palabras tipo "GRATIS", "$$$", "URGENTE" en mayúsculas.
- Siempre con enlace de baja visible (lo pone el sistema; es obligatorio por ley).
- Envía a un ritmo constante (1/día) desde el mismo remitente verificado.
