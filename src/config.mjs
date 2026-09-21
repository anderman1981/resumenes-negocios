// =============================================================
//  CONFIGURACIÓN CENTRAL DEL SITIO
//  Cambia estos valores cuando tengas tu dominio y tu AdSense.
// =============================================================

export const SITE = {
  name: 'Resúmenes de Negocios',
  // Título que aparece en Google y pestaña del navegador
  title: 'Resúmenes de Negocios Online — Libros y documentos en formato claro',
  description:
    'Resúmenes claros y accionables de los mejores libros y documentos sobre negocios online, marketing, emprendimiento y finanzas personales.',
  // ⚠️ Cambia esto por tu dominio real cuando lo tengas (afecta sitemap y SEO)
  url: 'https://tu-dominio.com',
  author: 'Anderson Martínez',
  // ⚠️ Correo de contacto real (OBLIGATORIO para AdSense y para las páginas legales)
  email: 'contacto@tu-dominio.com',
  lang: 'es',
  locale: 'es_ES',
};

// =============================================================
//  GOOGLE ADSENSE
//  1. Regístrate en https://adsense.google.com
//  2. Cuando te aprueben, pega aquí tu ID de editor (ca-pub-XXXX)
//  3. Actualiza también public/ads.txt con el mismo número
//  Mientras esté vacío, NO se cargan anuncios (así puedes desarrollar tranquilo).
// =============================================================
export const ADSENSE = {
  client: '', // ej: 'ca-pub-1234567890123456'
  // Slots de anuncios (los creas en el panel de AdSense y pegas el número)
  slots: {
    inArticle: '',   // anuncio dentro del artículo
    sidebar: '',     // anuncio en la barra lateral
    footer: '',      // anuncio al pie
  },
};

// =============================================================
//  NEWSLETTER / NOTIFICACIONES DIARIAS
//  Para enviar un correo cada día con el módulo publicado necesitas un
//  proveedor de email con automatización "drip" (7 correos, uno por día):
//  MailerLite, Brevo, ConvertKit, Beehiiv... (todos tienen plan gratis).
//  1. Crea un formulario en tu proveedor y copia la URL de "action".
//  2. Pégala en endpoint. Mientras esté vacío, el formulario muestra un aviso.
//  3. Configura en tu proveedor una automatización de 7 correos (1/día).
// =============================================================
export const NEWSLETTER = {
  endpoint: '', // ej: 'https://assets.mailerlite.com/jsonp/XXszXX/forms/.../subscribe'
  campoEmail: 'fields[email]', // nombre del campo email según tu proveedor (MailerLite usa este)
};

// Categorías del sitio (nicho: negocios online)
export const CATEGORIAS = [
  { slug: 'marketing-digital', nombre: 'Marketing Digital' },
  { slug: 'emprendimiento', nombre: 'Emprendimiento' },
  { slug: 'finanzas-personales', nombre: 'Finanzas Personales' },
  { slug: 'productividad', nombre: 'Productividad' },
  { slug: 'ventas', nombre: 'Ventas' },
  { slug: 'ecommerce', nombre: 'E-commerce' },
];
