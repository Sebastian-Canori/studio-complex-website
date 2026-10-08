# Eventos de conversión en GA4

Los eventos los emite `assets/js/sc-eventos.js` (`window.scEvento`). Solo se envían si la persona aceptó la analítica en el aviso de cookies: sin consentimiento `gtag` no existe y no pasa nada. No llevan datos personales.

| Evento | Cuándo | Parámetros |
|---|---|---|
| `click_whatsapp` | Clic en cualquier enlace a `wa.me` | `link_location` (header, footer, modal, contenido), `page_path` |
| `click_agenda` | Clic en cualquier enlace a `agenda.html` | igual |
| `click_tel` | Clic en un enlace `tel:` | igual |
| `click_email` | Clic en un enlace `mailto:` | igual |
| `generate_lead` | Envío correcto de un formulario | `lead_source`: `formulario_contacto`, `modal_contanos_tu_caso`, `modal_contanos_tu_caso_whatsapp`, `buscador_dominios` |

Notas:
- El buscador de dominios muestra su "Gracias" también si el envío falla (comportamiento previo), así que ese `lead_source` puede sobrecontar.
- El modal en modo WhatsApp cuenta el lead al abrir WhatsApp, no al enviar el mensaje.

## Estado en la consola de GA4 (propiedad G-4B82XMYNSR, cuenta analiticasc2026@gmail.com)

- Hecho el 8/10: prueba en Tiempo real. Aceptando las cookies y haciendo clic en el WhatsApp llegó `click_whatsapp` a GA4.
- Hecho el 8/10: creadas las dimensiones personalizadas de alcance evento `lead_source` y `link_location`.
- Pendiente (Google tarda hasta 24 h en listar los eventos nuevos): en Admin → Eventos → pestaña "Eventos recientes", marcar con la estrella como evento clave `generate_lead`, `click_whatsapp` y `click_agenda`. `generate_lead` solo aparece cuando entra el primer envío real de un formulario.
- Nota: el parámetro `link_location` casi siempre sale como `contenido` o `footer`; los selectores de header de `sc-eventos.js` no coinciden con el menú del tema. Si se quiere separar el header, ajustar `zona()`.
