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

## Conexión con el CRM (hoy: WordPress `/CRM-ventas`)

`contact-form.php` y `newsletter-form.php` mandan el mail y además guardan el dato en el CRM mediante `crm-lead.php` (`sc_send_to_crm`). Crear en el servidor `assets/mail/crm-config.php` (nunca en el repo; `.gitignore` bloquea `*config*.php`):

```php
<?php return ['url' => 'https://studiocomplex.com.ar/CRM-ventas/index.php?rest_route=/sc-crm/v1/intake', 'secret' => '<secreto de intake>'];
```

- En el CRM de WordPress el endpoint lo da el mu-plugin `sc-crm-intake.php` (fuera del repo), que lee el mismo secreto de `wp-content/sc-crm-intake-config.php`. Solo puede crear contactos, leads y suscriptores del grupo «Newsletter».
- Al pasar al CRM propio solo cambia `url` (mismo contrato: JSON con `Authorization: Bearer`).
- Contacto: guarda nombre, mail, teléfono, motivo, mensaje y campaña (utm_*, gclid, fbclid, página de entrada; la recuerda `sc-cookies.js` solo mientras la pestaña está abierta).
- Newsletter: guarda el mail con consentimiento en el grupo «Newsletter» y manda un mail de gracias con la forma de pedir la baja.
- Sin `crm-config.php` los formularios funcionan como siempre (solo mail). Si el CRM no responde, el mail sale igual y el registro se agrega a `sc-intake-fallback.jsonl`, en la carpeta superior a `public_html`, para no perderlo.
- Si falla el mail pero el CRM lo recibió (o al revés), la persona ve el mensaje de éxito.
