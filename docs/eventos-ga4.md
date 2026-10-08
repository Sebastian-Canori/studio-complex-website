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

## Pendiente en la consola de GA4 (propiedad G-4B82XMYNSR)

1. Admin → Eventos: esperar a que aparezcan y marcar como evento clave `generate_lead`, `click_whatsapp` y `click_agenda`.
2. Admin → Definiciones personalizadas: crear la dimensión `lead_source` y `link_location` (alcance: evento).
3. Probar en Tiempo real aceptando las cookies y haciendo clic en un botón de WhatsApp.
