// Función serverless de Vercel: proxy seguro al API de Claude para el simulador de ventas.
// Requiere la variable de entorno ANTHROPIC_API_KEY en Vercel (Settings → Environment Variables).
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en Vercel.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (messages.length === 0) {
      res.status(400).json({ error: 'Faltan mensajes.' });
      return;
    }

    // Limitar el historial para controlar costos (últimos 20 turnos)
    const recorte = messages.slice(-20).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }));

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: recorte,
      }),
    });

    if (!r.ok) {
      const detalle = await r.text();
      res.status(502).json({ error: 'Error del proveedor de IA', detalle: detalle.slice(0, 500) });
      return;
    }

    const data = await r.json();
    const texto = (data.content || []).map((c) => c.text || '').join('').trim();
    res.status(200).json({ reply: texto || 'No pude generar respuesta, intenta de nuevo.' });
  } catch (e) {
    res.status(500).json({ error: 'Error interno', detalle: String(e).slice(0, 300) });
  }
}
