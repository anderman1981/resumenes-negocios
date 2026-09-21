#!/usr/bin/env node
/**
 * Generador de plantilla de resumen.
 *
 * Uso:
 *   npm run nuevo -- --libro "Título del libro" --autor "Autor" --categoria ventas
 *
 * Crea un archivo .md en src/content/resumenes/ con la estructura correcta
 * (frontmatter + secciones) listo para que lo rellenes tú o con ayuda de IA.
 *
 * IMPORTANTE: el contenido debe ser un ANÁLISIS ORIGINAL con tus palabras,
 * nunca una copia del texto del libro (protege tu AdSense y evita problemas legales).
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEST = join(__dirname, '..', 'src', 'content', 'resumenes');

function arg(name, def = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const libro = arg('libro', 'Título del libro');
const autor = arg('autor', 'Autor desconocido');
const categoria = arg('categoria', 'emprendimiento');
const titulo = arg('titulo', `Resumen de "${libro}"`);
const slug = arg('slug', slugify(libro));
// --fecha YYYY-MM-DD para programar la publicación (goteo). Por defecto, hoy.
const fecha = arg('fecha', new Date().toISOString().slice(0, 10));
const serie = arg('serie', '');
const serieNombre = arg('serieNombre', '');
const dia = arg('dia', '');

const filename = join(DEST, `${slug}.md`);

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });
if (existsSync(filename)) {
  console.error(`❌ Ya existe: ${filename}`);
  process.exit(1);
}

const bloqueSerie = serie
  ? `serie: "${serie}"\nserieNombre: "${serieNombre || serie}"\ndia: ${dia || 1}\n`
  : '';

const plantilla = `---
titulo: "${titulo}"
libro: "${libro}"
autor: "${autor}"
categoria: "${categoria}"
descripcion: "TODO: descripción de 150-160 caracteres para Google. Debe resumir el valor del artículo."
minutosLectura: 7
ideasClave:
  - "TODO: primera idea clave del libro"
  - "TODO: segunda idea clave"
  - "TODO: tercera idea clave"
fecha: ${fecha}
destacado: false
borrador: true
tags: []
${bloqueSerie}---

## De qué trata

TODO: 1-2 párrafos explicando con TUS palabras el tema central del libro y a quién le sirve.

## Las ideas principales

### 1. TODO: Título de la idea

TODO: explica la idea, por qué importa y da un ejemplo propio.

### 2. TODO: Título de la idea

TODO.

### 3. TODO: Título de la idea

TODO.

## Cómo aplicarlo hoy

TODO: pasos concretos y accionables que el lector puede hacer esta semana.

## Conclusión

TODO: cierre con la gran lección del libro y para quién lo recomiendas.
`;

writeFileSync(filename, plantilla, 'utf8');
console.log(`✅ Creado: src/content/resumenes/${slug}.md`);
console.log(`   Está en modo BORRADOR. Cuando lo termines, pon 'borrador: false' para publicarlo.`);
