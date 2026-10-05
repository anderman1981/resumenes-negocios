import { getCollection } from 'astro:content';
import { SERIES_INFO } from '../config.mjs';

/**
 * Devuelve los resúmenes PUBLICADOS: no borradores y cuya fecha ya llegó.
 * Esto habilita el "goteo" (drip): un resumen con fecha futura permanece
 * oculto hasta ese día. Requiere reconstruir el sitio cada día (cron).
 * Ordenados del más reciente al más antiguo.
 */
export async function getPublicados() {
  const ahora = Date.now();
  const isDev = import.meta.env.DEV || process.env.PREVIEW === 'true';
  const entries = await getCollection('resumenes', ({ data }) => !data.borrador);
  return entries
    .filter((e) => isDev || e.data.fecha.valueOf() <= ahora)
    .sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}

/**
 * Devuelve TODOS los módulos de una serie (incluidos los futuros, para
 * mostrarlos como "Próximamente"), ordenados por día. Cada uno lleva
 * `disponible` = true si su fecha ya llegó (o siempre true en modo dev/preview).
 */
export async function getSerie(serieSlug) {
  const ahora = Date.now();
  const isDev = import.meta.env.DEV || process.env.PREVIEW === 'true';
  const entries = await getCollection(
    'resumenes',
    ({ data }) => !data.borrador && data.serie === serieSlug
  );
  return entries
    .map((e) => ({
      entry: e,
      disponible: isDev || e.data.fecha.valueOf() <= ahora,
      esFuturo: e.data.fecha.valueOf() > ahora,
    }))
    .sort((a, b) => (a.entry.data.dia ?? 0) - (b.entry.data.dia ?? 0));
}

/**
 * Lista de series con al menos un módulo publicado, enriquecidas con
 * progreso: total de módulos, cuántos disponibles, portada y el próximo
 * módulo a desbloquear. Sirve para las tarjetas de serie en homepage
 * y catálogo (una serie = una tarjeta que despliega sus capítulos).
 */
export async function getSeries() {
  const isDev = import.meta.env.DEV || process.env.PREVIEW === 'true';
  const ahora = Date.now();
  const allEntries = await getCollection('resumenes', ({ data }) => !data.borrador);
  const publicados = allEntries.filter((e) => isDev || e.data.fecha.valueOf() <= ahora);
  const mapa = new Map();
  for (const e of publicados) {
    if (e.data.serie && !mapa.has(e.data.serie)) {
      const info = SERIES_INFO[e.data.serie] || {};
      mapa.set(e.data.serie, {
        slug: e.data.serie,
        nombre: info.nombre ?? e.data.serieNombre ?? e.data.serie,
        descripcion: info.descripcion ?? 'Un módulo nuevo cada día. Vuelve a diario para desbloquear la siguiente lección.',
        portada: info.portada,
        spotify: info.spotify,
        pdf: info.pdf,
        pdfNombre: info.pdfNombre,
        infografia: info.infografia,
        infografiaNombre: info.infografiaNombre,
      });
    }
  }
  const resultado = [];
  for (const s of mapa.values()) {
    const modulos = await getSerie(s.slug);
    const total = Math.max(
      modulos.length,
      ...modulos.map((m) => m.entry.data.dia ?? 0),
    );
    const disponibles = modulos.filter((m) => m.disponible).length;
    const proximo = modulos.find((m) => !m.disponible);
    const portadaFinal = s.portada || modulos[0]?.entry.data.portada;
    resultado.push({
      ...s,
      total,
      disponibles,
      portada: portadaFinal,
      autor: modulos[0]?.entry.data.autor,
      proximo: proximo
        ? { dia: proximo.entry.data.dia, fecha: proximo.entry.data.fecha }
        : null,
    });
  }
  return resultado;
}

