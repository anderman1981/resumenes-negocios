// Comentarios guardados en un JSON real en Vercel Blob (NO base de datos).
// Descargable cuando quieras.
//
// Requisitos en Vercel:
//   1. Storage → Create → Blob (crea el store y añade BLOB_READ_WRITE_TOKEN al proyecto).
//   2. Variable de entorno COMENTARIOS_TOKEN = una-clave-secreta-tuya (para descargar el JSON).
//
// Endpoints:
//   GET  /api/comentarios?slug=xxx           → lista los comentarios de ese artículo
//   POST /api/comentarios  { slug, nombre, texto }  → añade un comentario
//   GET  /api/comentarios?download=1&token=TU_TOKEN  → descarga el JSON completo

import { put, list } from '@vercel/blob';

const ARCHIVO = 'comentarios.json';

async function leerTodo() {
  try {
    const { blobs } = await list({ prefix: ARCHIVO });
    const b = blobs.find((x) => x.pathname === ARCHIVO);
    if (!b) return [];
    // Con access:'private', downloadUrl es una URL firmada; url puede no ser pública.
    const enlace = b.downloadUrl || b.url;
    const r = await fetch(enlace, { cache: 'no-store' });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function guardarTodo(lista) {
  await put(ARCHIVO, JSON.stringify(lista, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

function limpiar(str, max) {
  return String(str || '').replace(/[<>]/g, '').trim().slice(0, max);
}

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({ error: 'Falta el store de Vercel Blob (BLOB_READ_WRITE_TOKEN).' });
    return;
  }

  // Descargar el JSON completo (protegido por token)
  if (req.method === 'GET' && req.query?.download) {
    const token = req.query.token;
    if (!process.env.COMENTARIOS_TOKEN || token !== process.env.COMENTARIOS_TOKEN) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    const todo = await leerTodo();
    res.setHeader('content-disposition', `attachment; filename="${ARCHIVO}"`);
    res.status(200).json(todo);
    return;
  }

  // Listar comentarios de un artículo
  if (req.method === 'GET') {
    const slug = limpiar(req.query?.slug, 200);
    const todo = await leerTodo();
    const items = todo
      .filter((c) => c.slug === slug)
      .map(({ nombre, texto, fecha }) => ({ nombre, texto, fecha }))
      .reverse();
    res.status(200).json({ comentarios: items });
    return;
  }

  // Añadir un comentario
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const slug = limpiar(body.slug, 200);
      const nombre = limpiar(body.nombre, 60) || 'Anónimo';
      const texto = limpiar(body.texto, 1500);
      if (!slug || !texto) {
        res.status(400).json({ error: 'Faltan datos (slug y texto).' });
        return;
      }
      const todo = await leerTodo();
      const nuevo = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        slug,
        nombre,
        texto,
        fecha: new Date().toISOString(),
      };
      todo.push(nuevo);
      // Límite defensivo de tamaño total
      const recorte = todo.slice(-5000);
      await guardarTodo(recorte);
      res.status(200).json({ ok: true, comentario: { nombre, texto, fecha: nuevo.fecha } });
    } catch (e) {
      res.status(500).json({ error: 'Error al guardar', detalle: String(e).slice(0, 200) });
    }
    return;
  }

  res.status(405).json({ error: 'Método no permitido' });
}
