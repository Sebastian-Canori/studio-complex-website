# Formularios del sitio

Los formularios mandan por SMTP2GO y validan con reCAPTCHA v3.

| Archivo | En el repo | Qué hace |
| --- | --- | --- |
| `contact-form.php` | Sí | Formulario de contacto (home y contacto.html) → hola@studiocomplex.com.ar |
| `newsletter-form.php` | Sí | Suscripción del pie → hola@studiocomplex.com.ar |
| `smtp-mailer.php` | **No** | Cliente SMTP. Tiene la clave de SMTP2GO: vive solo en el servidor |
| `recaptcha-verify.php` | **No** | Valida el token. Tiene la clave secreta de reCAPTCHA: vive solo en el servidor |

- Los dos que no están en el repo los bloquea `.gitignore`. El repo es público: nunca subirlos.
- `tools/publicar.py` no sube nada de `assets/mail/`. Los PHP se suben a mano, y solo después de pasar por el repo.
- **Pendiente:** mover las claves a un archivo fuera de `public_html`. Con eso, los cuatro PHP pueden estar en el repo.
