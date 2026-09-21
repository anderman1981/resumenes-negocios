# Automatización de publicaciones en redes sociales

Objetivo: cada vez que se publica el contenido del día, distribuirlo automáticamente a
WhatsApp, Instagram, Facebook, LinkedIn y YouTube.

> ⚠️ **Realidad honesta:** no todas las plataformas permiten publicar de forma automática.
> Abajo tienes qué es 100% automatizable, qué es semiautomático y qué NO tiene forma oficial.

## Qué se puede automatizar (matriz real)

| Plataforma | ¿Auto-publicable? | Cómo | Requisitos |
|---|---|---|---|
| **Facebook (Página)** | ✅ Sí | API oficial (Graph API) o n8n / Buffer / Metricool | Página FB + app de Meta |
| **Instagram** | ✅ Sí (feed/reels) | Graph API (Content Publishing) o n8n / Metricool | Cuenta **Business/Creator** vinculada a una Página FB |
| **LinkedIn** | ✅ Sí | API oficial de Posts o n8n / Buffer | App de LinkedIn + OAuth (aprobación) |
| **YouTube** | ✅ Sí (subir vídeo) | YouTube Data API o n8n | Canal + proyecto Google Cloud |
| **WhatsApp Estados** | ❌ **No oficial** | No existe API para publicar "Estados" | — |
| **WhatsApp Canales/Broadcast** | ⚠️ Parcial | WhatsApp Business Cloud API (mensajes a suscriptores que aceptaron) | Cuenta WhatsApp Business API |

**Conclusión clave sobre WhatsApp:** publicar un **Estado** automáticamente **no es posible** con
herramientas oficiales (cualquier bot que lo haga viola los términos y arriesga el número). Opciones reales:
1. **Manual asistido:** usa la página `/frases` del sitio (botón "Copiar" y "Compartir en WhatsApp"). 1 clic.
2. **Canal de WhatsApp:** crea un Canal y publica ahí (manual, pero llega a todos los seguidores).
3. **Broadcast por WhatsApp Business API:** envía el enlace a quienes se suscribieron (requiere su consentimiento).

## Arquitectura recomendada: n8n (que ya usas en tu homelab)

Tu sitio ya emite un **feed RSS** (`/rss.xml`) y un **feed JSON para redes** (`/social.json`, ver abajo)
con el texto listo para cada plataforma. n8n puede leerlos y publicar.

```
┌─────────────┐   cada día    ┌──────────────┐   lee    ┌────────────────────┐
│ Cron (n8n)  │ ────────────► │  HTTP Request │ ───────► │ /social.json (sitio)│
└─────────────┘               └──────┬───────┘          └────────────────────┘
                                     │ hay item nuevo del día
                     ┌───────────────┼───────────────┬───────────────┐
                     ▼               ▼               ▼               ▼
              ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
              │ Facebook   │  │ Instagram  │  │ LinkedIn   │  │ YouTube    │
              │ (Graph API)│  │ (Graph API)│  │ (Posts API)│  │ (Data API) │
              └────────────┘  └────────────┘  └────────────┘  └────────────┘
                     │
                     ▼  (WhatsApp: solo notificación a ti para publicar Estado a mano)
              ┌────────────┐
              │ Telegram/WA│  "Hoy toca publicar: <texto> <enlace>"
              └────────────┘
```

### Pasos para montarlo en n8n

1. **Nodo Schedule Trigger:** todos los días (o los lunes) a la hora de publicación.
2. **Nodo HTTP Request:** GET a `https://tu-dominio.com/social.json`. Filtra el item cuyo `fecha` sea hoy.
3. **Nodo IF / Filter:** continúa solo si hay contenido nuevo para hoy.
4. **Nodos de publicación** (uno por red):
   - **Facebook Graph:** `POST /{page-id}/feed` con `message` = `post.facebook` + `link` = `post.url`.
   - **Instagram:** crea contenedor de imagen + publica (necesita una imagen; usa la portada/cita).
   - **LinkedIn:** nodo LinkedIn de n8n → "Create Post" con `post.linkedin`.
   - **YouTube:** cuando exista el vídeo, nodo YouTube → "Upload" con `videos/dia-N.mp4` y la
     descripción de `youtube/guiones-youtube.md`.
5. **Nodo de aviso WhatsApp (manual):** envíate a ti mismo por Telegram o WhatsApp el texto de
   `post.whatsapp` para que publiques el Estado con un toque.

### Credenciales que necesitarás (una vez)
- **Meta (FB + IG):** app en developers.facebook.com, token de página, IG Business ID.
- **LinkedIn:** app en linkedin.com/developers, permiso `w_member_social`.
- **YouTube:** proyecto en Google Cloud, OAuth con scope `youtube.upload`.
- Guárdalas en n8n como *Credentials* (no en el código).

## Alternativa sin código: Metricool / Buffer / Publer

Si no quieres montar n8n, herramientas como **Metricool**, **Buffer** o **Publer** publican
automáticamente en FB, IG, LinkedIn (y programan YouTube) leyendo tu RSS o subiendo por lote.
WhatsApp Estados sigue siendo manual en todas.

## El feed para automatización

El sitio genera `/social.json` con, por cada día ya publicado: fecha, url, y el texto listo para
cada red (`whatsapp`, `instagram`, `facebook`, `linkedin`). Tu flujo de n8n o tu herramienta
lo consume directamente. Ver `src/pages/social.json.js`.
