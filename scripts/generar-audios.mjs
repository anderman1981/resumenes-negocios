#!/usr/bin/env node
// Genera narraciones en español (voz Paulina, macOS `say`) para cada resumen,
// las convierte a MP3 con ffmpeg y actualiza el campo `audio` del frontmatter.
// Narraciones ORIGINALES (nuestras palabras) -> seguras para AdSense.
//
// Uso:  node scripts/generar-audios.mjs
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RES = join(ROOT, 'src', 'content', 'resumenes');
const OUT = join(ROOT, 'public', 'audio');
const VOZ = 'Paulina';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const N = {
'la-arquitectura-de-la-decision':
`Bienvenido a Resúmenes de Negocios. Hoy: la venta como responsabilidad. La mayoría cree que vender es presionar o manipular, pero la venta bien entendida es ayudar a otra persona a tomar una decisión racional que ya desea. La emoción enciende la decisión y la lógica la sostiene para evitar el arrepentimiento. Recuerda esta fórmula: la venta es igual a la convicción que transmites, multiplicada por la confianza que generas. Si cualquiera de las dos es cero, no hay venta. Y una idea final: si no crees de verdad que tu solución mejora la vida de tu cliente, no tienes el derecho moral de pedir su dinero.`,
'psicologia-tactica-de-la-venta':
`Psicología táctica de la venta. La clave de hoy es distinguir un obstáculo de una objeción. El obstáculo aparece antes del precio y refleja una duda del cliente consigo mismo; se disuelve con curiosidad. La objeción aparece después del precio y requiere lógica serena. No lleves dudas sin resolver al momento de pedir la venta. Las excusas no son ataques personales: son formas de evitar el miedo a decidir. Piensa en la cebolla de la culpa: primero culpamos a las circunstancias, luego a otras personas, y en el centro está uno mismo. Tu trabajo es pelar esas capas con respeto para que el cliente enfrente su verdadera decisión.`,
'desarmar-barreras-tiempo-dinero':
`Cómo desarmar las barreras de tiempo y dinero. Las dos objeciones más comunes casi nunca son reales. Sobre el tiempo: el mejor momento para empezar suele ser cuando estás más ocupado, porque si aprendes a hacerlo abrumado, lo harás siempre. Cuidado con la falacia de esperar el resultado antes de comprar la solución: compras la solución precisamente porque aún no tienes el resultado. Sobre el dinero: vas a gastarlo de todos modos en los próximos meses; la pregunta real no es si lo gastas, sino en qué lo inviertes. No te faltan recursos, te falta decidir que esto es una prioridad.`,
'reencuadrar-ajuste-y-autoridad':
`Reencuadrar la falta de ajuste y la autoridad. Cuando el cliente dice que algo no es para él, muchas veces rechaza el esfuerzo que el método exige, no el método en sí. Una herramienta poderosa es el cierre hipotético: pregúntale, si esto fuera perfecto, ¿lo harías? Si dice que no, el problema es la confianza, no el programa. Si dice que sí, descubre qué le falta. Y cuando pide consultarlo con otra persona, valida la relación pero devuélvele el poder de decidir. Recuerda: una nueva identidad exige nuevas prioridades. Cuando inviertes, votas por la persona en la que te quieres convertir.`,
'neutralizar-el-necesito-pensarlo':
`Cómo neutralizar el necesito pensarlo. Pensarlo sin información nueva no es reflexionar: es posponer. No estás tomando una decisión rápida; estás cerrando una decisión que llevas años aplazando. Ten cuidado con el síndrome de la doble quemadura: no dejes que un error del pasado te impida tomar una buena decisión hoy. Y la falacia de la silla mecedora: al posponer, la persona vuelve a la rutina y el problema se pierde en el caos diario. Usa tres preguntas para diagnosticar: ¿crees que el producto resolverá tu problema?, ¿confías en mí?, ¿te crees capaz de aplicarlo? Si responde que sí a las tres, la decisión ya está tomada.`,
'el-marco-closer':
`El marco CLOSER: la estructura de una conversación de ventas. Son seis pasos. Clarificar: descubre la razón real por la que están ahí. Etiquetar: haz que el cliente acepte su problema. Revisar el pasado: agota las falsas alternativas para que tu solución sea la opción lógica. Vender el destino, no el transporte: enfócate en la transformación, no en la lista de módulos. Explorar objeciones: resuélvelas con curiosidad, no a la defensiva. Y reforzar: después del sí, afianza la decisión para evitar el arrepentimiento. La venta es una transferencia de convicción sobre un puente de confianza, sostenido por la emoción y la lógica.`,
'practica-tonalidad-y-game-tape':
`Práctica, tonalidad y revisión de tus llamadas. La venta no es un evento aislado, es un motor de mejora continua. Antes de cada conversación, nutre tu convicción: repasa testimonios reales y recuerda el impacto que generas. La certeza gobierna la tonalidad; no finjas seguridad, porque la convicción real corrige tu tono de forma automática. Cuando aparezca una objeción, recuerda que el cierre es un baile, no una pelea: aísla la preocupación, pregunta con curiosidad, confirma el acuerdo y vuelve a pedir la venta. Y lo que separa al profesional del principiante: grabar y revisar tus propias llamadas para mejorar cada semana.`,
'habitos-atomicos':
`Resumen de Hábitos Atómicos, de James Clear. La idea central: mejorar un uno por ciento cada día parece poco hoy, pero compuesto en el tiempo produce resultados enormes. No subes al nivel de tus metas, caes al nivel de tus sistemas. El cambio duradero nace de la identidad: no digas quiero leer, di soy una persona lectora. Para crear un buen hábito, aplícale cuatro leyes: hazlo obvio, atractivo, sencillo y satisfactorio. Y dos trucos que funcionan: apila el nuevo hábito sobre uno que ya tienes, y usa la regla de los dos minutos para que empezar sea casi imposible de evitar.`,
'la-startup-esbelta':
`Resumen de La Startup Esbelta, de Eric Ries. Una startup es un experimento para descubrir un modelo de negocio, no una versión pequeña de una empresa. En lugar de un plan perfecto, avanzas con el ciclo construir, medir y aprender, y tu objetivo es acortar cada vuelta para aprender rápido. El producto mínimo viable no es un producto a medias: es la forma más simple de empezar a aprender de clientes reales. Usa métricas accionables, no métricas de vanidad. Y con honestidad decide entre perseverar o pivotar. El mayor riesgo no es construir mal, sino construir con excelencia algo que nadie quiere.`,
'padre-rico-padre-pobre':
`Resumen de Padre Rico, Padre Pobre, de Robert Kiyosaki. La regla más importante, en palabras simples: un activo pone dinero en tu bolsillo y un pasivo lo saca. Los ricos acumulan activos que generan ingresos; muchas personas acumulan pasivos creyendo que son activos. Sobre todo al inicio, trabaja para aprender habilidades como ventas, finanzas y liderazgo, no solo por el sueldo. El miedo y la falta de educación financiera son los grandes enemigos. Antes de cada compra grande, pregúntate: ¿esto pondrá dinero en mi bolsillo o lo sacará? Este es un análisis educativo, no asesoramiento de inversión.`,
'como-ganar-amigos':
`Resumen de Cómo ganar amigos e influir sobre las personas, de Dale Carnegie. La crítica pone a la gente a la defensiva y rara vez cambia a nadie. En cambio, el aprecio sincero conecta, porque todos deseamos sentirnos importantes. Para influir, deja de hablar de lo que tú quieres y habla de lo que la otra persona quiere. Interésate de verdad por los demás: harás más amigos escuchando que tratando de impresionar. Y para persuadir, evita la discusión: reconoce los puntos del otro y busca lo que tienen en común. Influir no es imponerse, es entender y valorar genuinamente a las personas.`,
'esto-es-marketing':
`Resumen de Esto es Marketing, de Seth Godin. El marketing que funciona no interrumpe, sirve. En lugar de gustar a todos, eliges tu mínimo mercado viable: el grupo más pequeño que hace viable tu proyecto, y lo sirves profundamente. La gente no compra lo que haces; compra cómo la hace sentir y en quién se convierte. Conecta con su visión del mundo: gente como nosotros hace cosas como esta. Y recuerda que la confianza y la constancia valen más que el alcance masivo. Un buen marketing tiene la valentía de provocar un cambio, y para eso debes tener claro para quién es y para quién no.`,
'el-hombre-mas-rico-de-babilonia':
`Resumen de El hombre más rico de Babilonia, de George Clason. Su fuerza está en la simplicidad. La primera regla: págate a ti mismo primero, ahorrando al menos el diez por ciento de todo lo que ganas antes de gastar el resto. Controla tus gastos, porque lo que llamamos necesario tiende a crecer hasta consumir todo el ingreso. Haz que tu dinero trabaje: los ahorros deben generar más dinero. Protege tu capital y busca consejo de quien de verdad sabe. Y conviértete en tu mejor inversión, aumentando tus habilidades. La riqueza no depende tanto de cuánto ganas, sino de cuánto conservas y haces crecer.`,
'trabajo-profundo':
`Resumen de Trabajo Profundo, de Cal Newport. En un mundo lleno de distracciones, la capacidad de concentrarte sin interrupciones se ha vuelto rara y muy valiosa. El trabajo profundo crea valor y mejora tus habilidades; el trabajo superficial te mantiene ocupado pero avanza poco. La multitarea constante deja un residuo de atención que reduce tu rendimiento. La concentración es un músculo: se entrena y se debilita con la distracción permanente. Agenda bloques protegidos para tu trabajo profundo, con un ritual de inicio, y agrupa los correos y mensajes en franjas concretas. Tu atención es tu recurso más escaso: protégela.`,
'de-cero-a-uno':
`Resumen de De Cero a Uno, de Peter Thiel. Copiar lo que ya existe lleva el mundo de uno a muchos; crear algo genuinamente nuevo lo lleva de cero a uno, y ahí está el mayor valor. La competencia feroz destruye los márgenes, así que en vez de pelear en un mercado saturado, busca ser tan distinto y bueno que no tengas rival directo. Empieza dominando un nicho pequeño antes de expandirte. Ofrece algo diez veces mejor, no un poco mejor. Y pregúntate cuál es tu secreto: esa verdad importante que casi nadie ve todavía. El futuro no se construye copiando, sino creando.`,
'dotcom-secrets':
`Resumen de DotCom Secrets, de Russell Brunson. La mayoría cree que tiene un problema de tráfico, cuando en realidad tiene un problema de embudo y de oferta. Un embudo guía al visitante paso a paso hacia la compra, y convierte mucho más que una página común. Construye una escalera de valor: ofertas de menor a mayor precio, donde cada peldaño lleva al siguiente. Si aumentas cuánto gasta un cliente a lo largo del tiempo, puedes invertir más que tu competencia en atraerlo, y ganas el mercado. Y captura siempre el correo para dar seguimiento. El crecimiento rara vez viene de más tráfico, sino de mejores embudos y ofertas.`,
};

function setFrontmatterAudio(slug) {
  const file = join(RES, `${slug}.md`);
  if (!existsSync(file)) { console.log(`  (sin .md para ${slug})`); return; }
  let txt = readFileSync(file, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return;
  let fm = m[1];
  const linea = `audio: "/audio/${slug}.mp3"`;
  if (/^audio:.*$/m.test(fm)) fm = fm.replace(/^audio:.*$/m, linea);
  else fm = fm + `\n${linea}`;
  txt = txt.replace(m[0], `---\n${fm}\n---`);
  writeFileSync(file, txt, 'utf8');
}

let ok = 0;
for (const [slug, texto] of Object.entries(N)) {
  process.stdout.write(`🎙️  ${slug} ... `);
  const aiff = `/tmp/narr-${slug}.aiff`;
  const mp3 = join(OUT, `${slug}.mp3`);
  execSync(`say -v ${VOZ} -o ${aiff} ${JSON.stringify(texto)}`);
  execSync(`ffmpeg -y -i ${aiff} -ac 1 -codec:a libmp3lame -b:a 64k ${JSON.stringify(mp3)} >/dev/null 2>&1`);
  execSync(`rm -f ${aiff}`);
  setFrontmatterAudio(slug);
  ok++;
  console.log('OK');
}
console.log(`\n✅ ${ok} audios generados en public/audio/ y frontmatter actualizado.`);
