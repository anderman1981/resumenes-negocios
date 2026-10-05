---
name: crear-nuevo-programa
description: Skill de automatización e implementación para OpenCode que genera y despliega el sitio web completo de la serie multimodal de 7 Días (+ Día 0) a partir de los artefactos del programa.
trigger: /crear-new {topic_slug}
author: Gemini Notebook / OpenCode Production Engine
version: 1.0.0
---

# 🚀 SKILL: Producción y Despliegue Web Multimodal — Serie 7 Días (+ Día 0)

## 🎯 Propósito
Este skill define la especificación técnica completa, mapeo de activos y flujo de ejecución para que el agente **OpenCode** compile, construya y despliegue un portal web educativo multimodal interactivo para cualquier programa de la arquitectura de 7 Días.

---

## 🛠️ Comando de Disparo
```bash
/crear-new {topic_slug}
```
**Ejemplo de uso**:
```bash
/crear-new crecimiento-e-ingresos-startups
```

---

## 📂 Arquitectura Completa de Archivos y Rutas en la Web (`OpenCode`)

OpenCode organizará los activos estáticos y dinámicos en la siguiente estructura de carpetas dentro del repositorio web (`Next.js` / `Astro` / `Tailwind`):

```text
/
├── public/
│   └── assets/
│       └── programas/
│           └── {topic_slug}/
│               ├── audio/
│               │   ├── dia_0_onboarding_escalabilidad.mp3
│               │   ├── dia_1_cuantificacion_pmf.mp3
│               │   ├── dia_2_gtm_fit_economia_unitaria.mp3
│               │   ├── dia_3_velocimetro_escalamiento.mp3
│               │   ├── dia_4_alineacion_ventas_marketing.mp3
│               │   ├── dia_5_formula_contratacion_ventas.mp3
│               │   ├── dia_6_coaching_metrico_compensacion.mp3
│               │   └── dia_7_disrupcion_ia_gtm_moats.mp3
│               ├── pdf/
│               │   ├── dia_0_slides_marco_estructural.pdf
│               │   ├── dia_0_guia_onboarding_sistema.pdf
│               │   ├── dia_1_slides_cuantificacion_pmf.pdf
│               │   ├── dia_1_guia_matriz_cohortes_pmf.pdf
│               │   ├── dia_2_slides_gtm_fit_economia_unitaria.pdf
│               │   ├── dia_2_guia_calculadora_ltv_cac.pdf
│               │   ├── dia_3_slides_velocimetro_escalamiento.pdf
│               │   ├── dia_3_guia_matriz_segmentacion.pdf
│               │   ├── dia_4_slides_alineacion_ventas_marketing.pdf
│               │   ├── dia_4_guia_sla_ventas_marketing.pdf
│               │   ├── dia_5_slides_formula_contratacion.pdf
│               │   ├── dia_5_guia_rubrica_entrevista.pdf
│               │   ├── dia_6_slides_coaching_metrico.pdf
│               │   ├── dia_6_guia_manual_film_review.pdf
│               │   ├── dia_7_slides_disrupcion_ia_gtm.pdf
│               │   └── dia_7_guia_blueprint_moats_beachhead.pdf
│               └── covers/
│                   ├── dia_0_spotify_3d.jpg
│                   ├── dia_1_spotify_3d.jpg
│                   ├── ...
│                   └── dia_7_spotify_3d.jpg
├── src/
│   └── content/
│       └── programas/
│           └── {topic_slug}/
│               ├── meta.json
│               ├── dia_0/
│               │   ├── resumen.md
│               │   ├── guion_podcast.md
│               │   └── quiz.json
│               ├── dia_1/
│               │   ├── resumen.md
│               │   ├── guion_podcast.md
│               │   └── quiz.json
│               ├── dia_2/
│               │   ├── resumen.md
│               │   ├── guion_podcast.md
│               │   └── quiz.json
│               ├── dia_3/
│               │   ├── resumen.md
│               │   ├── guion_podcast.md
│               │   └── quiz.json
│               ├── dia_4/
│               │   ├── resumen.md
│               │   ├── guion_podcast.md
│               │   └── quiz.json
│               ├── dia_5/
│               │   ├── resumen.md
│               │   ├── guion_podcast.md
│               │   └── quiz.json
│               ├── dia_6/
│               │   ├── resumen.md
│               │   ├── guion_podcast.md
│               │   └── quiz.json
│               └── dia_7/
│                   ├── resumen.md
│                   ├── guion_podcast.md
│                   └── quiz.json
```

---

## 🗺️ Mapeo Específico de Artefactos para `crecimiento-e-ingresos-startups`

### Día 0: Marco Estructural del Sistema de Escalabilidad
* **Resumen Web**: `src/content/programas/crecimiento-e-ingresos-startups/dia_0/resumen.md` ← `Dia_0_Resumen_Web_Marco_Estructural-v2.md`
* **Guión Podcast**: `src/content/programas/crecimiento-e-ingresos-startups/dia_0/guion_podcast.md` ← `Dia_0_Guion_Podcast_Onboarding_Aceleracion_Ventas-v3.md`
* **Quiz & Flashcards**: `src/content/programas/crecimiento-e-ingresos-startups/dia_0/quiz.json` ← `Dia_0_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `public/assets/programas/crecimiento-e-ingresos-startups/pdf/dia_0_slides.pdf` ← `Dia_0_Slides_Marco_Estructural_Sistema_Escalabilidad-v2.pdf`
* **PDF Guía**: `public/assets/programas/crecimiento-e-ingresos-startups/pdf/dia_0_guia.pdf` ← `Dia_0_Guia_Descargable_Onboarding_Sistema_7Dias-v2.pdf`
* **Audio Podcast**: `public/assets/programas/crecimiento-e-ingresos-startups/audio/dia_0_podcast.mp3` ← *"El sistema de ventas de siete días"*

### Día 1: Cuantificación del Product-Market Fit e Indicadores Líderes
* **Resumen Web**: `.../dia_1/resumen.md` ← `Dia_1_Resumen_Web_Cuantificacion_PMF-v2.md`
* **Guión Podcast**: `.../dia_1/guion_podcast.md` ← `Dia_1_Guion_Podcast_Cuantificacion_PMF_Indicadores_Lideres-v3.md`
* **Quiz & Flashcards**: `.../dia_1/quiz.json` ← `Dia_1_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `.../pdf/dia_1_slides.pdf` ← `Dia_1_Slides_Cuantificacion_Product_Market_Fit-v2.pdf`
* **PDF Guía**: `.../pdf/dia_1_guia.pdf` ← `Dia_1_Guia_Descargable_Matriz_Cohortes_PMF-v2.pdf`
* **Audio Podcast**: `.../audio/dia_1_podcast.mp3` ← *"Por qué fracasan las startups al escalar"*

### Día 2: Go-To-Market Fit y Economía Unitaria (LTV, CAC, Payback)
* **Resumen Web**: `.../dia_2/resumen.md` ← `Dia_2_Resumen_Web_Go_To_Market_Fit-v2.md`
* **Guión Podcast**: `.../dia_2/guion_podcast.md` ← `Dia_2_Guion_Podcast_GTM_Fit_Economia_Unitaria-v3.md`
* **Quiz & Flashcards**: `.../dia_2/quiz.json` ← `Dia_2_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `.../pdf/dia_2_slides.pdf` ← `Dia_2_Slides_Go_To_Market_Fit_Economia_Unitaria-v2.pdf`
* **PDF Guía**: `.../pdf/dia_2_guia.pdf` ← `Dia_2_Guia_Descargable_Calculadora_LTV_CAC_Payback-v2.pdf`
* **Audio Podcast**: `.../audio/dia_2_podcast.mp3` ← *"Por qué escalar prematuramente destruye startups"*

### Día 3: El Velocímetro de Escalamiento y Ritmo de Crecimiento
* **Resumen Web**: `.../dia_3/resumen.md` ← `Dia_3_Resumen_Web_Velocimetro_Escalamiento-v2.md`
* **Guión Podcast**: `.../dia_3/guion_podcast.md` ← `Dia_3_Guion_Podcast_Velocimetro_Escalamiento_Ritmo-v3.md`
* **Quiz & Flashcards**: `.../dia_3/quiz.json` ← `Dia_3_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `.../pdf/dia_3_slides.pdf` ← `Dia_3_Slides_Velocimetro_Escalamiento_Ritmo_Crecimiento-v2.pdf`
* **PDF Guía**: `.../pdf/dia_3_guia.pdf` ← `Dia_3_Guia_Descargable_Matriz_Segmentacion_Velocimetro-v2.pdf`
* **Audio Podcast**: `.../audio/dia_3_podcast.mp3` ← *"Por qué las startups mueren de éxito"*

### Día 4: Alineación Científica entre Ventas y Marketing (SLA)
* **Resumen Web**: `.../dia_4/resumen.md` ← `Dia_4_Resumen_Web_Alineacion_Ventas_Marketing-v2.md`
* **Guión Podcast**: `.../dia_4/guion_podcast.md` ← `Dia_4_Guion_Podcast_Alineacion_Cientifica_SLA-v3.md`
* **Quiz & Flashcards**: `.../dia_4/quiz.json` ← `Dia_4_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `.../pdf/dia_4_slides.pdf` ← `Dia_4_Slides_Alineacion_Cientifica_Ventas_Marketing-v2.pdf`
* **PDF Guía**: `.../pdf/dia_4_guia.pdf` ← `Dia_4_Guia_Descargable_SLA_Ventas_Marketing_Playbook-v2.pdf`
* **Audio Podcast**: `.../audio/dia_4_podcast.mp3` ← *"Cómo alinear ventas y marketing con matemáticas"*

### Día 5: La Fórmula de Contratación de Ventas e Ingeniería de Perfil
* **Resumen Web**: `.../dia_5/resumen.md` ← `Dia_5_Resumen_Web_Formula_Contratacion_Ventas-v2.md`
* **Guión Podcast**: `.../dia_5/guion_podcast.md` ← `Dia_5_Guion_Podcast_Formula_Contratacion_Ventas-v3.md`
* **Quiz & Flashcards**: `.../dia_5/quiz.json` ← `Dia_5_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `.../pdf/dia_5_slides.pdf` ← `Dia_5_Slides_Formula_Contratacion_Ventas_Coachability-v2.pdf`
* **PDF Guía**: `.../pdf/dia_5_guia.pdf` ← `Dia_5_Guia_Descargable_Rubrica_Entrevista_Simulacion_Ventas-v2.pdf`
* **Audio Podcast**: `.../audio/dia_5_podcast.mp3` ← *"La fórmula de HubSpot para fichar comerciales"*

### Día 6: Coaching Métrico, Film Review y Planes de Compensación
* **Resumen Web**: `.../dia_6/resumen.md` ← `Dia_6_Resumen_Web_Coaching_Metrico_Compensacion-v2.md`
* **Guión Podcast**: `.../dia_6/guion_podcast.md` ← `Dia_6_Guion_Podcast_Coaching_Metrico_Compensacion-v3.md`
* **Quiz & Flashcards**: `.../dia_6/quiz.json` ← `Dia_6_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `.../pdf/dia_6_slides.pdf` ← `Dia_6_Slides_Coaching_Metrico_Compensacion_Estructura-v2.pdf`
* **PDF Guía**: `.../pdf/dia_6_guia.pdf` ← `Dia_6_Guia_Descargable_Manual_Film_Review_Planes_Compensaci-v2.pdf`
* **Audio Podcast**: `.../audio/dia_6_podcast.mp3` ← *"La ciencia de escalar ventas"*

### Día 7: Disrupción de IA en Go-To-Market y Moats Estratégicos
* **Resumen Web**: `.../dia_7/resumen.md` ← `Dia_7_Resumen_Web_Disrupcion_IA_GTM_Moats-v2.md`
* **Guión Podcast**: `.../dia_7/guion_podcast.md` ← `Dia_7_Guion_Podcast_Disrupcion_IA_GTM_Moats_Beachhead-v3.md`
* **Quiz & Flashcards**: `.../dia_7/quiz.json` ← `Dia_7_Prompts_Quiz_Flashcards-v2.md`
* **PDF Slides**: `.../pdf/dia_7_slides.pdf` ← `Dia_7_Slides_Disrupcion_IA_GTM_Moats_Beachhead-v2.pdf`
* **PDF Guía**: `.../pdf/dia_7_guia.pdf` ← `Dia_7_Guia_Descargable_Blueprint_Moats_Estrategia_Beachhead_IA.pdf`
* **Audio Podcast**: `.../audio/dia_7_podcast.mp3` ← *"El fin del software de ventas tradicional"*

---

## 💻 Protocolo de Construcción Web para `OpenCode`

OpenCode ejecutará los siguientes pasos automatizados al recibir el comando `/crear-new {topic_slug}`:

1. **Creación de Directorios**: Generar el árbol de carpetas en `public/assets/programas/{topic_slug}/` y `src/content/programas/{topic_slug}/`.
2. **Transformación de Quizzes a JSON**: Parsear los archivos `Dia_X_Prompts_Quiz_Flashcards.md` extrayendo las preguntas, opciones múltiples y retroalimentación para alimentar el componente interactivo `<QuizApp />`.
3. **Renderizado de Páginas por Día**:
   - Componente `<AudioPlayer />` enlazado a la ruta del MP3.
   - Componente `<DownloadBox />` con botones estilizados para descargar los PDFs de Slides y Guías Workbook.
   - Bloque de lectura estilizado en Markdown para el Resumen Web.
   - Componente interactivo `<FlashcardsDeck />` y `<QuizEvaluativo />`.
4. **Generación del Índice Global (`/programas/{topic_slug}`)**: Landing page con la ruta de aprendizaje del Día 0 al Día 7, progreso de usuario y barra de navegación lateral.

---
