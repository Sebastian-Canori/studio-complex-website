# Embudo del blog: recursos gratis y secuencia de mails

Actualizado el 25 de noviembre de 2026. Estrategia completa: artifact "Blog que trae clientes" (https://claude.ai/artifact/RbcVJRqiCdCiG51MXNX3Nk).

## Cómo funciona

1. Una nota del blog (por ejemplo, `nota-cuanto-cuesta-una-tienda-online.html`) muestra la caja **Recurso gratis**, que lleva a la página del recurso con `?desde=<slug de la nota>`.
2. En `recurso-checklist-tienda-online.html` la persona deja nombre, mail y consentimiento.
3. `assets/js/sc-recurso.js` manda el formulario a `assets/mail/recurso-form.php` con reCAPTCHA v3 (acción `recurso`) y la campaña de origen.
4. `recurso-form.php`:
   - guarda el contacto en el CRM como suscriptor (origen "Web - recurso: …", con el recurso y la nota);
   - si existe `brevo-config.php`, lo agrega a la lista de Brevo del recurso (ahí arranca la secuencia);
   - le manda el link de descarga por SMTP2GO y avisa a hola@;
   - devuelve el link y la página muestra el botón de descarga.
5. GA4 registra `generate_lead` con `lead_source: recurso_checklist-tienda-online` (solo con cookies aceptadas).

## Piezas

| Pieza | Qué es |
|---|---|
| `tools/recursos-datos.py` | Datos de cada recurso: textos, PDF, notas relacionadas y la caja de la nota. |
| `tools/armar-recursos.py` | Arma la página de cada recurso y pone la caja en las notas que tienen `"recurso"` en `blog-notas.py`. No regenera las notas: solo inserta la caja. Idempotente. |
| `tools/armar-recurso-checklist.py` | Arma el PDF `assets/recursos/checklist-tienda-online.pdf` (reportlab). |
| `assets/mail/recurso-form.php` | Recibe el formulario. |
| `assets/js/sc-recurso.js`, `assets/css/sc-recurso.css` | Formulario y estilos. |
| `assets/mail/brevo-config.php` | **Solo en el servidor** (lo bloquea `.gitignore`). |

Para cambiar textos: editar `tools/recursos-datos.py` y correr `python3 tools/armar-recursos.py`. `armar-blog.py` también dibuja la caja si alguna vez se regeneran todas las notas.

Para sumar un recurso nuevo: bloque en `recursos-datos.py`, archivo en `assets/recursos/`, clave en `SC_RECURSOS` de `recurso-form.php`, `"recurso"` en las notas que lo ofrecen, URL en `sitemap.xml`, y correr `armar-recursos.py`.

## Puesta en marcha (lo hace una persona)

1. **Brevo**: crear la cuenta gratis con hola@studiocomplex.com.ar y autenticar el dominio (Brevo da los registros DKIM y SPF para el DNS; ese cambio de DNS se confirma antes de hacerlo).
2. En Brevo, crear la lista **"Recurso: checklist tienda online"** y anotar su número.
3. En Brevo, Contactos → Configuración → Atributos: crear `RECURSO` y `NOTA_ORIGEN` (texto). `FIRSTNAME` ya existe.
4. Crear una clave API v3 (SMTP & API → API keys).
5. En el servidor, crear `public_html/assets/mail/brevo-config.php` (nunca en el repo ni en el chat):
   ```php
   <?php return ['api_key' => '<clave API v3>', 'listas' => ['checklist-tienda-online' => <número de lista>]];
   ```
6. En Brevo, Automatizaciones → "Contacto agregado a una lista" → la lista del paso 2, con los mails de abajo y las esperas indicadas.
7. Probar: descargar el checklist con un mail propio, ver que llega el mail con el link, que aparece en el CRM y en la lista de Brevo, y borrar el registro de prueba.

Sin `brevo-config.php` todo funciona igual (descarga, mail con el link, CRM y aviso), pero no arranca la secuencia.

Revisar en Brevo los límites vigentes del plan gratis (al 25/11/2026 se conocía de unos 300 mails por día) antes de sumar más recursos.

## Secuencia "Checklist tienda online" (para cargar en Brevo)

El día 0 lo manda el sitio (mail con el link). La automatización de Brevo empieza el día 2. Todos los mails: remitente "Sebastián de Studio Complex" <hola@studiocomplex.com.ar>, texto simple, un solo link principal y el pie de baja de Brevo. Los links llevan `?utm_source=brevo&utm_medium=email&utm_campaign=checklist-tienda`.

### Día 2: el punto que más se pasa por alto
- **Asunto:** ¿Probaste comprar en tu propia tienda?
- **Texto:**
  Hola {{ contact.FIRSTNAME }}:

  De los 34 puntos del checklist, hay uno que conviene hacer hoy mismo: comprar en tu tienda como si fueras un cliente, desde el celular, con cada medio de pago.

  Anotá cada vez que dudes, cada paso que te pida un dato de más y cuánto tarda en llegar el mail de confirmación. Eso que te molestó a vos le pasa a cada persona que entra.

  Si estás eligiendo plataforma, esta nota te puede servir: Tiendanube, Shopify o WooCommerce, cuál conviene → https://studiocomplex.com.ar/nota-tiendanube-shopify-o-woocommerce.html

  Sebastián

### Día 5: un caso real
- **Asunto:** Cuando la plantilla no alcanza
- **Texto:**
  Hola {{ contact.FIRSTNAME }}:

  Una tienda de accesorios con más de ochocientos productos y sesenta y nueve categorías tenía un problema: la gente no encontraba lo que buscaba. El menú de la plataforma no daba para tanto, así que armamos uno con foto por categoría.

  Te cuento cómo lo encaramos y qué cambió → https://studiocomplex.com.ar/caso-tienda-a-medida.html

  No todas las tiendas necesitan algo a medida. Pero si sentís que la plataforma te limita, vale la pena mirarlo.

  Sebastián

### Día 9: el error más común
- **Asunto:** Vender sin saber de dónde viene la venta
- **Texto:**
  Hola {{ contact.FIRSTNAME }}:

  El bloque del checklist que más tiendas dejan para después es "Medir desde el primer día". Y es el que define si la plata en anuncios se recupera o se pierde.

  Si no sabés qué publicación, qué anuncio o qué búsqueda trajo cada venta, cada decisión es a ojo. Con Analytics midiendo compras y links con UTM en las redes, a la segunda semana ya decidís con números.

  Lo explicamos en esta nota antes de invertir en Google Ads → https://studiocomplex.com.ar/nota-antes-de-invertir-en-google-ads.html

  Sebastián

### Día 14: la invitación
- **Asunto:** ¿Lo vemos juntos?
- **Texto:**
  Hola {{ contact.FIRSTNAME }}:

  Hace dos semanas bajaste el checklist de la tienda. Si te quedaron puntos sin tildar y no sabés por cuál empezar, lo vemos juntos en media hora, sin compromiso: miramos tu tienda y te decimos qué conviene resolver primero.

  Elegí el horario acá → https://studiocomplex.com.ar/agenda.html

  O escribime por WhatsApp: +54 9 11 5336-2945.

  Sebastián

### Después
Al terminar la secuencia, el contacto pasa a la lista general del newsletter (una nota por semana). Señales para avisar al equipo y escribir a mano: clic en la agenda, clic en WhatsApp o respuesta a cualquier mail.

## Regla de redes

Las notas y los recursos del blog se comparten en Instagram, Facebook, TikTok, Threads y Bluesky. **No se publican en LinkedIn** (decisión de Sebastián del 25/11/2026).
