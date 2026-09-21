import { getCollection } from 'astro:content';

/**
 * Devuelve los resúmenes PUBLICADOS: no borradores y cuya fecha ya llegó.
 * Esto habilita el "goteo" (drip): un resumen con fecha futura permanece
 * oculto hasta ese día. Requiere reconstruir el sitio cada día (cron).
 * Ordenados del más reciente al más antiguo.
 */
export async function getPublicados() {
  const ahora = Date.now();
  const entries = await getCollection('resumenes', ({ data }) => !data.borrador);
  return entries
    .filter((e) => e.data.fecha.valueOf() <= ahora)
    .sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}

/**
 * Devuelve TODOS los módulos de una serie (incluidos los futuros, para
 * mostrarlos como "Próximamente"), ordenados por día. Cada uno lleva
 * `disponible` = true si su fecha ya llegó.
 */
export async function getSerie(serieSlug) {
  const ahora = Date.now();
  const entries = await getCollection(
    'resumenes',
    ({ data }) => !data.borrador && data.serie === serieSlug
  );
  return entries
    .map((e) => ({ entry: e, disponible: e.data.fecha.valueOf() <= ahora }))
    .sort((a, b) => (a.entry.data.dia ?? 0) - (b.entry.data.dia ?? 0));
}

/** Lista de series con al menos un módulo publicado. */
export async function getSeries() {
  const publicados = await getPublicados();
  const mapa = new Map();
  for (const e of publicados) {
    if (e.data.serie && !mapa.has(e.data.serie)) {
      mapa.set(e.data.serie, {
        slug: e.data.serie,
        nombre: e.data.serieNombre ?? e.data.serie,
      });
    }
  }
  return [...mapa.values()];
}
