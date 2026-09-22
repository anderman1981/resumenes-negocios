#!/usr/bin/env node
// Genera portadas cuadradas (1500x1500) para cada episodio del podcast.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('podcast-covers', { recursive: true });

const NAVY = '#0f1b3d';
const AZUL = '#1f47f5';
const TEAL = '#14b8a6';

const DIAS = [
  { n: 0, t: ['Introducción', 'a la Guía'], slug: 'dia-0-introduccion' },
  { n: 1, t: ['Filosofía de la', 'venta racional'], slug: 'la-arquitectura-de-la-decision' },
  { n: 2, t: ['Obstáculos', 'vs. objeciones'], slug: 'psicologia-tactica-de-la-venta' },
  { n: 3, t: ['Barreras de', 'tiempo y dinero'], slug: 'desarmar-barreras-tiempo-dinero' },
  { n: 4, t: ['Ajuste y', 'autoridad'], slug: 'reencuadrar-ajuste-y-autoridad' },
  { n: 5, t: ['"Necesito', 'pensarlo"'], slug: 'neutralizar-el-necesito-pensarlo' },
  { n: 6, t: ['El marco', 'CLOSER'], slug: 'el-marco-closer' },
  { n: 7, t: ['Tonalidad', 'y práctica'], slug: 'practica-tonalidad-y-game-tape' },
];

function svg({ n, t }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1500" viewBox="0 0 1500 1500">
  <rect width="1500" height="1500" fill="${NAVY}"/>
  <!-- motivo tech: nodos conectados -->
  <g stroke="${AZUL}" stroke-width="4" opacity="0.5">
    <line x1="1150" y1="150" x2="1330" y2="330"/>
    <line x1="1330" y1="330" x2="1250" y2="520"/>
    <line x1="1250" y1="520" x2="1380" y2="640"/>
  </g>
  <g fill="${TEAL}" opacity="0.85">
    <circle cx="1150" cy="150" r="12"/><circle cx="1330" cy="330" r="12"/>
    <circle cx="1250" cy="520" r="12"/><circle cx="1380" cy="640" r="12"/>
  </g>
  <g stroke="${TEAL}" stroke-width="4" opacity="0.35">
    <line x1="120" y1="1000" x2="300" y2="1120"/>
    <line x1="300" y1="1120" x2="220" y2="1300"/>
  </g>
  <g fill="${AZUL}" opacity="0.7">
    <circle cx="120" cy="1000" r="10"/><circle cx="300" cy="1120" r="10"/><circle cx="220" cy="1300" r="10"/>
  </g>

  <text x="110" y="200" font-family="Arial, sans-serif" font-size="42" font-weight="700" letter-spacing="6" fill="#8eb6ff">RESUMENES DE NEGOCIOS</text>

  <text x="104" y="620" font-family="Arial, sans-serif" font-size="150" font-weight="800" fill="#ffffff">DÍA ${n}</text>
  <rect x="120" y="660" width="150" height="10" fill="${TEAL}"/>

  <text x="110" y="850" font-family="Arial, sans-serif" font-size="112" font-weight="800" fill="#ffffff">${t[0]}</text>
  <text x="110" y="975" font-family="Arial, sans-serif" font-size="112" font-weight="800" fill="#bcd3ff">${t[1]}</text>

  <rect x="0" y="1330" width="1500" height="170" fill="${AZUL}"/>
  <text x="110" y="1438" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="#ffffff">Cómo vender mejor que el 99%</text>
</svg>`;
}

for (const d of DIAS) {
  await sharp(Buffer.from(svg(d))).png().toFile(`podcast-covers/${d.slug}.png`);
  console.log('OK', d.slug);
}
console.log('Portadas en podcast-covers/');
