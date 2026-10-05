# Formularios del sitio

Los formularios mandan por SMTP2GO y validan con reCAPTCHA v3.

| Archivo | En el repo | Qué hace |
| --- | --- | --- |
| `contact-form.php` | Sí | Formulario de contacto (home y contacto.html) → hola@studiocomplex.com.ar |
| `newsletter-form.php` | Sí | Suscripción del pie → hola@studiocomplex.com.ar |
| `smtp-mailer.php` | **No** | Cliente SMTP. Tiene la clave de SMTP2GO: vive solo en el servidor |
| `crm-lead.php` | Sí | Manda cada contacto al CRM como prospecto (con la campaña de la que llegó). Sin `crm-config.php` no hace nada |
| `crm-config.php` | **No** | Dirección del CRM y secreto `LEAD_INTAKE_SECRET`. Vive solo en el servidor (ver abajo) |
| `recaptcha-verify.php` | **No** | Valida el token. Tiene la clave secreta de reCAPTCHA: vive solo en el servidor |

- Los dos que no están en el repo los bloquea `.gitignore`. El repo es público: nunca subirlos.
- `tools/publicar.py` no sube nada de `assets/mail/`. Los PHP se suben a mano, y solo después de pasar por el repo.
- **Pendiente:** mover las claves a un archivo fuera de `public_html`. Con eso, los cuatro PHP pueden estar en el repo.

## Conexión con el CRM

`contact-form.php` manda el mail y además carga el contacto en el CRM (tablero «Formulario web» de Prospectos). Para activarlo, crear en el servidor `assets/mail/crm-config.php` (nunca en el repo; `.gitignore` bloquea `*config*.php`):

```php
<?php return ['url' => 'https://<url-del-crm>/api/integrations/leads', 'secret' => '<LEAD_INTAKE_SECRET del CRM>'];
```

- Antes de crear ese archivo, el formulario funciona igual que siempre (solo el mail).
- Si el CRM no responde, el mail sale igual y el error queda en el log del servidor. Si falla el mail pero el CRM lo recibió, la persona ve el mensaje de éxito: el contacto no se pierde.
- La campaña (utm_*, gclid, fbclid y la página de entrada) la guarda `sc-cookies.js` solo mientras la pestaña está abierta y la manda `contact-form.js` junto con el formulario.
- Orden de salida a producción: primero el CRM en producción con `LEAD_INTAKE_SECRET` cargado, después `crm-lead.php` y `contact-form.php` y, al final, `crm-config.php`. Los anuncios llevan `utm_source=facebook&utm_medium=paid_social&utm_campaign=<nombre>` (Meta) o auto-etiquetado `gclid` (Google Ads).
