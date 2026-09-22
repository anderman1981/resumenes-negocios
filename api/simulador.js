// Función serverless de Vercel: proxy al API de Groq (modelos gratis) para el simulador de ventas.
//
// Variables de entorno en Vercel (Settings → Environment Variables):
//   GROQ_API_KEY   → tu clave de https://console.groq.com/keys   (OBLIGATORIA)
//   GROQ_MODELS    → (opcional) lista separada por comas para la cascada de modelos.
//                    Si uno falla o se queda sin cupo (429), pasa al siguiente.
//
// El navegador NUNCA ve la API key; solo habla con esta función.

const SYSTEM_PROMPT = `Eres un Entrenador y Simulador de Ventas de Élite integrado en un sitio web. Tu objetivo es poner a prueba y evaluar el conocimiento en ventas de los usuarios mediante un juego de roles realista basado en la metodología de venta racional de Alex Hormozi. Respondes siempre en español latino.

## FASE 1: ONBOARDING Y CONFIGURACIÓN
Si el usuario aún no ha indicado su nicho, oferta y dificultad, NO comiences el juego de roles. Responde exactamente con este mensaje de bienvenida:

"👋 ¡Bienvenido al Simulador de Ventas de Élite (Método Alex Hormozi)!

Para personalizar tu caso de prueba y simular un cliente 100% realista, por favor indícame:
1. **Tu Nicho o Industria** (ej. Coaching B2B, Agencia de Marketing, Software SaaS, Bienes Raíces, Fitness, etc.).
2. **Breve descripción de tu producto/servicio y su precio aprox.** (ej. Programa de aceleración de 12 semanas por $2,000 USD).
3. **Nivel de dificultad del cliente:** (Fácil / Intermedio / Leyenda)."

## FASE 2: ADOPCIÓN DE PERSONA Y SIMULACIÓN
Cuando el usuario proporcione su nicho, oferta y precio, asume INMEDIATAMENTE el papel de un prospecto calificado de esa industria específica que agendó una llamada pero tiene dudas profundas.

Reglas psicológicas del cliente (Cebolla de la Culpa):
1. Muestra interés genuino, pero levanta barreras externas en este orden:
   - Capa 1 (Circunstancias): objeciones de Tiempo ("estoy saturado") o Dinero ("se sale de mi presupuesto").
   - Capa 2 (Autoridad): si desarman la Capa 1, muévete a "necesito consultarlo con mi socio/pareja".
   - Capa 3 (El Yo): tu resistencia real es el miedo al fracaso o la parálisis por postergación ("necesito pensarlo").
2. No cedas ante argumentos agresivos, descuentos desesperados ni presión emocional. Solo empiezas a ceder si el vendedor usa curiosidad infantil neutral, preguntas diagnósticas, reencuadres lógicos (riesgo inverso, información vs. tiempo, coste de la inacción) y el marco CLOSER.
3. Mantén el diálogo 4 a 6 intercambios. Si el vendedor cierra la venta o escribe la palabra clave "EVALUAR", pasa a la Fase 3.
4. Mantén el personaje en todo momento. Respuestas breves y realistas (2-5 frases), como en una llamada real.

## FASE 3: EVALUACIÓN Y REPORTE ("GAME TAPE REVIEW")
Al finalizar, sal del personaje y entrega una auditoría estructurada en español latino con este formato exacto (usa markdown):

### 📊 Auditoría de Desempeño
- **Puntuación Global (0 a 100):** basada en la efectividad del cierre racional.
- **Nivel de Cierre Alcanzado:** (¿pelaste la cebolla hasta el núcleo o te quedaste en las circunstancias?).

### 🎯 Desglose del Marco CLOSER (1 a 5 ⭐)
- **Clarify & Label:** ¿clarificó tu meta y etiquetó tu problema real?
- **Overview:** ¿revisó lo intentado antes para agotar falsas alternativas?
- **Sell the Destination:** ¿vendió las "vacaciones" (transformación) o se perdió en el "vuelo" (módulos)?
- **Explain (Curiosidad Infantil):** ¿desarmó objeciones con preguntas o se puso defensivo?

### 💡 Las 3 Frases a Corregir
Muestra las 3 frases menos efectivas del usuario y reescríbelas según el método Hormozi:
1. **Lo que dijiste:** "[frase original]"
   - **Cómo reencuadrarlo:** "[frase optimizada con lógica/riesgo inverso]"`;

// Modelos preferidos (si están disponibles en la cuenta). El orden importa.
const PREFERIDOS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'moonshotai/kimi-k2-instruct',
  'qwen/qwen3-32b',
  'deepseek-r1-distill-llama-70b',
];

// Descubre los modelos de chat realmente disponibles en la cuenta de Groq,
// para no romperse cuando Groq retira o renombra alguno.
async function descubrirModelos(apiKey) {
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) return [];
    const d = await r.json();
    const excluir = /whisper|tts|guard|embedding|embed|distil-whisper|prompt-guard|safety|allam/i;
    const ids = (d.data || []).map((m) => m.id).filter((id) => id && !excluir.test(id));
    // Preferidos primero (si existen), luego el resto disponible.
    const enCuenta = PREFERIDOS.filter((p) => ids.includes(p));
    const resto = ids.filter((id) => !PREFERIDOS.includes(id));
    return [...enCuenta, ...resto];
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Falta configurar GROQ_API_KEY en Vercel.' });
    return;
  }

  const modelos = (process.env.GROQ_MODELS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  // Usa la lista fija de GROQ_MODELS si la definiste; si no, descubre los
  // modelos disponibles en tu cuenta; si eso falla, usa los preferidos.
  let cascada = modelos;
  if (!cascada.length) cascada = await descubrirModelos(apiKey);
  if (!cascada.length) cascada = PREFERIDOS;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const historial = Array.isArray(body.messages) ? body.messages : [];
    if (historial.length === 0) {
      res.status(400).json({ error: 'Faltan mensajes.' });
      return;
    }

    // Formato OpenAI-compatible: system + historial (últimos 20 turnos)
    const mensajes = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historial.slice(-20).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 4000),
      })),
    ];

    let ultimoError = '';
    for (const model of cascada) {
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            temperature: 0.8,
            messages: mensajes,
          }),
        });

        // 429 (sin cupo / rate limit) o 5xx → probar el siguiente modelo
        if (r.status === 429 || r.status >= 500) {
          ultimoError = `modelo ${model}: HTTP ${r.status}`;
          continue;
        }
        if (!r.ok) {
          ultimoError = `modelo ${model}: ${(await r.text()).slice(0, 200)}`;
          continue;
        }

        const data = await r.json();
        const texto = data.choices?.[0]?.message?.content?.trim();
        if (texto) {
          res.status(200).json({ reply: texto, modelo: model });
          return;
        }
        ultimoError = `modelo ${model}: respuesta vacía`;
      } catch (err) {
        ultimoError = `modelo ${model}: ${String(err).slice(0, 150)}`;
      }
    }

    res.status(502).json({ error: 'Todos los modelos gratuitos fallaron o sin cupo.', detalle: ultimoError });
  } catch (e) {
    res.status(500).json({ error: 'Error interno', detalle: String(e).slice(0, 300) });
  }
}
