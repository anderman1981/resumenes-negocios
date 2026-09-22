// Captura de suscriptores guardada en un JSON en Vercel Blob (privado, sin DB).
// Funciona sin proveedor externo. Descargable con tu token.
//
// Requisitos en Vercel:
//   - Store Blob conectado (BLOB_READ_WRITE_TOKEN, se crea solo).
//   - COMENTARIOS_TOKEN = tu clave secreta (se reutiliza para descargar).
//
// Endpoints:
//   POST /api/suscribir  { email }                          → añade un suscriptor
//   GET  /api/suscribir?download=1&token=TU_TOKEN           → descarga la lista JSON

import { put, list } from '@vercel/blob';

const ARCHIVO = 'suscriptores.json';

function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  let par = Object.entries(process.env).find(([k]) => k.endsWith('_READ_WRITE_TOKEN'));
  if (par) return par[1];
  par = Object.entries(process.env).find(([, v]) => typeof v === 'string' && v.startsWith('vercel_blob_rw_'));
  return par ? par[1] : undefined;
}
const TOKEN = blobToken();

async function leerTodo() {
  try {
    const { blobs } = await list({ prefix: ARCHIVO, token: TOKEN });
    const b = blobs.find((x) => x.pathname === ARCHIVO);
    if (!b) return [];
    const r = await fetch(b.downloadUrl || b.url, { cache: 'no-store', headers: { authorization: `Bearer ${TOKEN}` } });
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
    token: TOKEN,
  });
}

function emailValido(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim());
}

export default async function handler(req, res) {
  // Diagnóstico temporal: lista NOMBRES de variables relacionadas (sin valores).
  if (req.method === 'GET' && req.query?.diag) {
    const nombres = Object.keys(process.env).filter((k) => /blob|token|read_write|rw/i.test(k));
    res.status(200).json({
      variablesRelacionadas: nombres,
      tokenDetectado: Boolean(TOKEN),
      groqPresente: Boolean(process.env.GROQ_API_KEY),
    });
    return;
  }

  if (!TOKEN) {
    res.status(500).json({ error: 'Falta el store de Vercel Blob (BLOB_READ_WRITE_TOKEN).' });
    return;
  }

  // Descargar la lista (protegida por token)
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

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const email = String(body.email || '').trim().toLowerCase();
      if (!emailValido(email)) {
        res.status(400).json({ error: 'Email no válido.' });
        return;
      }
      const todo = await leerTodo();
      if (todo.some((s) => s.email === email)) {
        res.status(200).json({ ok: true, duplicado: true });
        return;
      }
      todo.push({ email, fecha: new Date().toISOString() });
      await guardarTodo(todo.slice(-50000));
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Error al guardar', detalle: String(e).slice(0, 200) });
    }
    return;
  }

  res.status(405).json({ error: 'Método no permitido' });
}
