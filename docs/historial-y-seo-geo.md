# Studio Complex: historial del sitio y trabajo de SEO/GEO

Documento de traspaso para el socio. Resume lo hecho en el sitio studiocomplex.com.ar desde el 3 de septiembre hasta el 6 de octubre de 2026, con foco en lo último: el trabajo de SEO y GEO (visibilidad en buscadores y en respuestas de IA). Es público: no lleva claves, cuentas personales, precios internos ni datos de clientes.

## 1. Resumen

- El sitio parte de la plantilla Tekmino y hoy tiene 35 archivos HTML: 29 páginas de contenido, 6 servicios, 5 casos de éxito y 12 notas de blog (el 404 no se indexa).
- El 6/10 se publicó por cPanel (a pedido de Sebastián) un paquete de SEO/GEO y 6 notas nuevas. Producción coincide archivo por archivo con la rama `seo/geo-ai-visibility` (verificado por hash).
- Falta que el socio mergee el [PR #5](https://github.com/nudge-digital-lab/studio-complex-website/pull/5) para que el repo quede igual a producción.
- Search Console y Bing Webmaster tienen el sitemap enviado y las páginas clave solicitadas.

## 2. Línea de tiempo

| Fechas | Qué pasó |
|---|---|
| 3 sep | Plantilla Tekmino rebrandeada a Studio Complex. Primera versión del copy. Deploy automático por SFTP (se eliminó el 6/9). |
| 4 al 8 sep | Copy de Home y Servicios reescrito con eje comercial directo. Se suman Juan Manuel Kunz y Cecilia C. Juárez al equipo. Menú simplificado, página de Partners, fotos reales, logos de integraciones (Tiendanube, Shopify, WordPress, WooCommerce, n8n, Make, Mercado Pago). Se eliminan las animaciones. |
| 12 al 14 sep | El sitio se orienta a empresas de Latinoamérica. Se reemplazan placeholders de la plantilla. Dirección visual: naranja neón y cian, tipografía Figtree. |
| 17 al 19 sep | Asistente "Complex" (luego oculto), botón de WhatsApp, fotos reales del equipo, página de agenda. Interruptor de tema claro (se desactivó el 23/9). |
| 23 al 25 sep | Ronda de ajustes del home. Primeros cuatro casos de éxito y el de Marker. Aviso de cookies y bloque de suscripción. |
| 28 sep | Jornada grande: página propia para cada uno de los 6 servicios, menú Servicios con desplegable, buscador con Whois, portfolio con carrusel y filtro, home en grilla bento, SEO de las páginas de servicio, CSS y JS con versión para evitar caché, y el blog propio con seis notas. |
| 29 sep | Migración a studiocomplex.com.ar. Se agrega `tools/publicar.py` (publicación por FTPS). Canonicals en todas las páginas. |
| 30 sep | Formulario de contacto con reCAPTCHA y newsletter, con los PHP de mail solo en el servidor (fuera del repo). Documento de DNS y mail. PR #1 (docs) mergeado; PR #2 y #3 abiertos. |
| 2 oct | JSON-LD en la home y descriptions de hasta 160 caracteres. GA4 y Clarity en todas las páginas, solo en el host de producción (PR #4). Search Console verificado por DNS. |
| 4 y 5 oct | `CLAUDE.md` del repo con el flujo de trabajo (rama `docs/claude-md`, sin publicar). Rama `feat/form-a-crm`: el formulario de contacto carga el contacto en el CRM con su campaña, y el aviso de cookies lo menciona (local, sin publicar). |
| 6 oct | SEO/GEO, 6 notas nuevas, publicación por cPanel, Search Console y Bing. Detalle en las secciones 3 a 6. |

## 3. SEO y GEO: qué se hizo el 6/10

GEO es lo que hace que una IA (ChatGPT, Copilot, Gemini, Perplexity, Claude) entienda el sitio y lo cite. Lo que se agregó:

| Pieza | Detalle | Archivos |
|---|---|---|
| `llms.txt` | Resumen del negocio, contacto y enlaces a servicios, casos, notas e información. Se genera con `tools/llms-txt.py`. | `llms.txt` |
| `robots.txt` | Permite explícitamente GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended y Applebot-Extended. Declara el sitemap. | `robots.txt` |
| Open Graph y Twitter | En las 34 páginas indexables, con imagen 1200x630. Se generan con `tools/seo-tags.py`. | todos los `.html`, `assets/images/og-studio-complex.png` |
| Datos estructurados | `sameAs` (Instagram, Facebook, TikTok) en la home. FAQPage con las 10 preguntas visibles de `faq.html`. AboutPage (about y team, con los 4 socios como Person), ContactPage, WebPage (pricing) y CollectionPage (project). | `index.html`, `faq.html`, `about.html`, `team.html`, `contact.html`, `pricing.html`, `project.html` |
| 404 | `noindex` en `error.html`. | `error.html` |
| Sitemap | 34 URLs con `lastmod` del 6/10. | `sitemap.xml` |
| Redes reales | Los íconos de Instagram y Facebook del footer apuntan a los perfiles reales. Se quitaron los de LinkedIn y X, que apuntaban a las portadas genéricas. | todos los `.html` |

Ya existía y no se tocó: canonical y meta description en todas las páginas, Service y FAQPage en los 6 servicios, y BlogPosting o Article en notas y casos.

## 4. Blog: 12 notas

Las 6 de septiembre más 6 nuevas del 6/10. Cada nota nueva abre con una respuesta corta pensada para ser citada, usa solo datos que ya están en el sitio (FAQ, casos, "A cotizar" en precios) y enlaza a casos y servicios.

| Nota | Categoría |
|---|---|
| Cómo lanzar un producto o un servicio con tu marca personal (nueva) | Marca personal |
| ¿Cuánto cuesta una tienda online? Qué mueve el precio (nueva) | Tiendas online |
| ¿Cuánto tarda una web en posicionar en Google? (nueva) | SEO |
| WordPress o Webflow: cuándo conviene migrar (nueva, apoyada en el caso Marker) | Desarrollo web |
| Google Ads en un rubro con restricciones (nueva, apoyada en el caso de retail) | Publicidad |
| Cómo vender cursos online con acceso automático (nueva, apoyada en el caso de cursos) | Tiendas online |
| Cinco señales de que tu web ya no está a la altura de tu empresa | Desarrollo web |
| Tiendanube, Shopify o WooCommerce | Tiendas online |
| Por qué el SEO técnico va antes que escribir notas | SEO |
| Antes de poner un peso en Google Ads | Publicidad |
| Cómo repartir las consultas de WhatsApp entre tu equipo | Automatización |
| Las ventas que se pierden después del presupuesto | Ventas |

Las portadas de las 6 nuevas se renderizan desde `tools/portadas-notas.html` (variantes `?c=7` a `?c=12`) con la misma plantilla de las anteriores.

## 5. Publicación y verificación

- **Cómo se publicó:** por el Administrador de archivos de cPanel. La página de carga acepta un solo archivo por vez, así que se subió un zip con los archivos en la raíz, se extrajo en `public_html` y el zip se mandó a la papelera.
- **Respaldo previo:** copia de los HTML en vivo antes de cada subida.
- **Verificación:** hash de cada archivo contra lo que sirve el dominio (32 de 32 en la primera tanda y 19 de 19 en la segunda), las 34 URLs del sitemap con respuesta 200, JSON-LD que parsea y GA4 y Clarity presentes en todas las páginas.
- **Importante para el socio:** `CLAUDE.md` pide que la publicación en el dominio la haga él con `tools/publicar.py`. Esta vez Sebastián pidió subir directo por cPanel y quedó como excepción explícita. Por eso el PR #5 deja el repo igual a producción.
- **Analítica:** producción tiene el snippet de GA4 y Clarity (PR #4) que `main` todavía no tiene. Al mergear, no resolver conflictos descartándolo, o se pierde la medición.

## 6. Buscadores

- **Google Search Console** (propiedad de dominio): sitemap reenviado con la URL completa y solicitud de indexación para la home, el blog y las 6 notas nuevas.
- **Bing Webmaster Tools:** sitio importado desde Search Console (queda verificado sin tocar DNS), sitemap enviado y 25 URLs mandadas por "Envío de URL". Bing alimenta a Copilot y a ChatGPT Search.
- **Qué esperar:** los datos tardan hasta 48 horas en Bing y de días a semanas en Google. Revisar en 2 o 3 días qué páginas figuran indexadas.

## 7. Estado del repositorio

| Rama | Estado |
|---|---|
| `main` (upstream) | Sin los PR #2 a #5. |
| `seo/geo-ai-visibility` | Es la que se publicó. Parte de producción: incluye `preview/todo-junto` y la analítica (PR #4). 13 commits sobre `upstream/main`. PR #5 abierto. |
| `preview/todo-junto`, `feat/analytics-ga4-clarity`, `feat/caso-cursos-boton-sitio-en-vivo`, `fix/captcha-badge-redondo` | Ya incluidas en la rama SEO. Son los PR #2, #3 y #4. |
| `feat/form-a-crm` | Formulario de contacto conectado al CRM. Local, sin publicar. |
| `docs/claude-md` | `CLAUDE.md` del repo. Local, sin publicar. |

Orden sugerido para mergear: PR #2, #3 y #4 primero (el diff del #5 queda solo con lo de SEO) y después el #5.

## 8. Cómo seguir trabajando

- Blog: editar el contenido en `tools/blog-notas.py` y correr `python3 tools/armar-blog.py && python3 tools/seo-tags.py && python3 tools/llms-txt.py`. `armar-blog.py` regenera todas las notas, `blog.html` y el bloque del home, y copia las etiquetas OG de otra página: por eso `seo-tags.py` tiene que correr después.
- Sumar una nota: agregarla al principio de `NOTAS` (la más nueva primero), con `"fecha": ("AAAA-MM-DD", "d mmm AAAA")`, crear su portada y sumarla al sitemap.
- Usar `<ul>` en las notas y no `<ol>`: el CSS no estiliza listas numeradas.
- Antes de subir HTML al dominio, comprobar que cada página tenga `G-4B82XMYNSR` (GA4).

## 9. Pendientes

- Socio: mergear los PR #2 a #5 y decidir si `feat/form-a-crm` y `docs/claude-md` se publican.
- Medir en 2 o 3 días la indexación en Google y Bing, y en un par de semanas la sección "AI Performance" de Bing.
- Perfiles de LinkedIn y X de la empresa, si existen: sumarlos al `sameAs` y al footer.
- Cifras reales en las notas de costos y tiempos cuando se quiera mostrar rangos (hoy los planes dicen "A cotizar").
- Confirmar si `_spf.google.com` sigue haciendo falta y subir DMARC a `p=quarantine` cuando los reportes pasen (ver `docs/dns-y-mail.md`).
