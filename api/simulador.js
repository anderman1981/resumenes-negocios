// Función serverless de Vercel: proxy al API de Groq (modelos gratis) para el simulador de ventas.
//
// Variables de entorno en Vercel (Settings → Environment Variables):
//   GROQ_API_KEY   → tu clave de https://console.groq.com/keys   (OBLIGATORIA)
//   GROQ_MODELS    → (opcional) lista separada por comas para la cascada de modelos.
//                    Si uno falla o se queda sin cupo (429), pasa al siguiente.
//
// El navegador NUNCA ve la API key; solo habla con esta función.

// Métodos/autores disponibles para la simulación. Añade más a medida que subas
// autores al sistema: cada entrada define el nombre y el "enfoque" que la IA usa
// para el comportamiento del cliente y la evaluación.
const METODOS = {
  hormozi: {
    nombre: 'Alex Hormozi (venta racional)',
    enfoque: `Comportamiento del cliente (Cebolla de la Culpa): levanta barreras en capas — primero circunstancias (tiempo/dinero), luego autoridad ("debo consultarlo"), y en el núcleo el miedo al fracaso o la postergación ("necesito pensarlo"). Solo cede si el vendedor usa curiosidad neutral, preguntas diagnósticas, reencuadres lógicos (riesgo inverso, información vs. tiempo, coste de la inacción) y el marco CLOSER. Evaluación: usa el marco CLOSER (Clarificar, Etiquetar, Revisar/agotar alternativas, Vender el destino no el vehículo, Explorar objeciones, Reforzar) y el manejo de la cebolla de la culpa.`,
  },
  carnegie: {
    nombre: 'Dale Carnegie (influencia y relaciones)',
    enfoque: `Comportamiento del cliente: responde mal a la crítica, la presión o la discusión, y se abre cuando el vendedor muestra interés genuino, aprecio sincero y entiende su punto de vista. Solo cede si el vendedor deja de hablar de sí mismo y conecta con lo que el cliente realmente quiere. Evaluación: valora si evitó la crítica y la discusión, si despertó un deseo genuino mostrando el beneficio para el cliente, y si construyó relación con escucha y aprecio sinceros.`,
  },
  consultivo: {
    nombre: 'Venta consultiva (preguntas SPIN)',
    enfoque: `Comportamiento del cliente: desconfía de quien presenta el producto demasiado pronto; se abre ante buenas preguntas que le hacen ver la magnitud de su problema. Solo cede si el vendedor diagnostica con preguntas de situación, problema, implicación y necesidad-beneficio antes de proponer. Evaluación: mide la calidad del diagnóstico por preguntas (¿escuchó más de lo que habló?, ¿cuantificó el problema y su implicación antes de ofrecer?).`,
  },
};

function buildSystemPrompt(metodoId) {
  const m = METODOS[metodoId] || METODOS.hormozi;
  return `Eres un Entrenador y Simulador de Ventas de Élite integrado en un sitio web. Pones a prueba y evalúas al usuario mediante un juego de roles realista basado en el método de ${m.nombre}. Respondes siempre en español latino.

ENFOQUE DEL MÉTODO (${m.nombre}):
${m.enfoque}

## FASE 1: ONBOARDING
Si el usuario aún no ha indicado su nicho, oferta y dificultad, NO comiences el juego de roles. Responde exactamente:

"👋 ¡Bienvenido al Simulador de Ventas de Élite! Practicarás con el método de ${m.nombre}.

Para personalizar tu caso, indícame:
1. **Tu Nicho o Industria** (ej. Coaching B2B, Agencia, SaaS, Fitness, Bienes Raíces...).
2. **Tu producto/servicio y su precio aprox.** (ej. Programa de 12 semanas por $2,000 USD).
3. **Nivel de dificultad del cliente:** (Fácil / Intermedio / Leyenda)."

## FASE 2: SIMULACIÓN
Cuando el usuario dé su nicho, oferta y precio, asume INMEDIATAMENTE el papel de un prospecto calificado de esa industria con dudas profundas, siguiendo el ENFOQUE del método indicado arriba.
- No cedas ante argumentos agresivos, descuentos desesperados ni presión emocional.
- Mantén el diálogo 4 a 6 intercambios. Si el vendedor cierra o escribe "EVALUAR", pasa a la Fase 3.
- Mantén el personaje siempre. Respuestas breves y realistas (2-5 frases), como en una llamada real.

## FASE 3: EVALUACIÓN ("GAME TAPE REVIEW")
Al finalizar, sal del personaje y entrega una auditoría en español latino (markdown):

### 📊 Auditoría de Desempeño
- **Puntuación Global (0 a 100).**
- **Nivel alcanzado:** ¿resolviste el bloqueo real o te quedaste en la superficie?

### 🎯 Desglose según el método de ${m.nombre} (1 a 5 ⭐)
Evalúa 3-4 criterios propios de ese método (según el ENFOQUE de arriba).

### 💡 Las 3 Frases a Corregir
Muestra las 3 frases menos efectivas del usuario y reescríbelas según el método de ${m.nombre}:
1. **Lo que dijiste:** "[frase original]"
   - **Cómo mejorarlo:** "[versión optimizada según el método]"`;
}

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

    // Método/autor elegido por el usuario (por defecto Hormozi)
    const metodo = typeof body.metodo === 'string' && METODOS[body.metodo] ? body.metodo : 'hormozi';

    // Formato OpenAI-compatible: system + historial (últimos 20 turnos)
    const mensajes = [
      { role: 'system', content: buildSystemPrompt(metodo) },
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
