import { defineCollection, z } from 'astro:content';

// Colección de resúmenes. Cada archivo .md en src/content/resumenes/
// debe tener este "frontmatter" (los datos de arriba entre ---).
const resumenes = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),                    // Título del resumen
    libro: z.string(),                     // Nombre del libro/documento original
    autor: z.string(),                     // Autor original de la obra
    categoria: z.string(),                 // slug de CATEGORIAS (ver src/config.mjs)
    descripcion: z.string(),               // Meta descripción para SEO (150-160 car.)
    portada: z.string().optional(),        // Ruta de imagen (opcional)
    minutosLectura: z.number().default(6),
    ideasClave: z.array(z.string()).default([]), // Bullets destacados
    fecha: z.coerce.date(),
    actualizado: z.coerce.date().optional(),
    destacado: z.boolean().default(false),
    borrador: z.boolean().default(false),  // true = no se publica
    tags: z.array(z.string()).default([]),
    // --- Series / módulos por días (goteo) ---
    serie: z.string().optional(),          // slug de la serie/curso, ej: "vender-mejor-99"
    serieNombre: z.string().optional(),    // nombre visible de la serie
    dia: z.number().optional(),            // número de módulo/día dentro de la serie
    // --- Multimedia ---
    youtube: z.string().optional(),        // ID del vídeo de YouTube (ej: "dQw4w9WgXcQ")
    spotify: z.string().optional(),        // ID o URL del episodio de Spotify
    audio: z.string().optional(),          // ruta del audio local, ej: "/audio/dia-1.mp3"
    audioPublico: z.string().optional(),   // URL pública del audio (para el feed de podcast RSS)
    guiaFinal: z.boolean().default(false), // true = último día, ofrece la Guía Maestra
    // --- Descarga de PDF por día ---
    pdf: z.string().optional(),            // ruta del PDF descargable, ej: "/guias/mi-guia.pdf"
    pdfNombre: z.string().optional(),      // texto del botón, ej: "Descargar plantilla"
  }),
});

export const collections = { resumenes };
