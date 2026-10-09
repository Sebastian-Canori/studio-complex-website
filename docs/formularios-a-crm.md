# Formularios del sitio conectados al CRM (WordPress `/CRM-ventas`)

Actualizado el 9 de octubre de 2026. Rama `feat/form-wp-crm` (commit `48ccaa0` y este).

## Qué hace
- **Contacto** (home y `contacto.html`): manda el mail de siempre (SMTP2GO) y además crea el contacto y un lead en el CRM, con motivo, mensaje, teléfono y campaña (utm, gclid, fbclid, página de entrada). Origen: "Web - formulario de contacto".
- **Newsletter** (pie): guarda el mail en el grupo "Newsletter" solo si la persona dio su consentimiento, deja constancia en su línea de tiempo y manda un mail de gracias con la baja.
- Si el CRM no responde, el mail sale igual y el registro se agrega a `sc-intake-fallback.jsonl`, fuera de `public_html`. Nada se pierde.

## Piezas
| Pieza | Dónde vive | En el repo |
|---|---|---|
| `assets/mail/crm-lead.php`, `contact-form.php`, `newsletter-form.php` | `public_html/assets/mail/` | Sí |
| `assets/mail/crm-config.php` (URL + secreto) | servidor | **No** (plantilla en `docs/crm-wp/crm-config.example.php`) |
| `sc-crm-intake.php` (endpoint `POST /sc-crm/v1/intake`) | `CRM-ventas/wp-content/mu-plugins/` | Copia en `docs/crm-wp/` |
| `sc-crm-intake-config.php` (secreto, `owner_id`) | `CRM-ventas/wp-content/` | **No** (plantilla en `docs/crm-wp/`) |

El endpoint solo crea contactos, leads y suscriptores del grupo Newsletter. Sin secreto responde 503; con secreto incorrecto, 401. El **mismo secreto** va en los dos archivos de configuración y lo pega una persona en el servidor (nunca en el repo ni en el chat).

## Estado de publicación (9/10/2026)
- Publicado por cPanel (zip extraído en `public_html`, producción 43 de 43 iguales al repo, zip a la papelera): PHP de formularios, `sc-cookies.js`, `contact-form.js`, HTML con versión de caché nueva.
- Publicado: `sc-crm-intake.php` en `mu-plugins`. Verificado: el endpoint responde 503 "Intake disabled" y el CRM sigue igual (login 401, sitio 200).
- **Falta:** subir las dos configuraciones y pegar el secreto. Hasta entonces el formulario solo manda mail (y guarda el respaldo local).
- Respaldo de los PHP anteriores: `~/Downloads/sc-live-backup-20261009-form/`.

## Cómo probar (después de pegar el secreto)
1. Enviar el formulario de contacto con datos de prueba y cookies aceptadas.
2. En el CRM: Leads debe mostrar el lead con origen "Web" y la nota con motivo, mensaje y campaña.
3. Suscribirse al newsletter con consentimiento: aparece en Grupos → Newsletter.
4. Borrar los datos de prueba.

## Pasar al CRM propio
Solo cambia `url` en `crm-config.php`. El contrato es el mismo (JSON con `Authorization: Bearer`).

## Pendiente
- Solapa propia de newsletter en el CRM (fecha de alta, consentimiento, origen).
- Sacar de `public_html` el `CRM-Altas.zip` (48 MB) y `.htaccess.bak-20261008`.
- Cabecera `X-Robots-Tag: noindex` en `CRM-Altas` (hoy sin ninguna protección contra indexación).
