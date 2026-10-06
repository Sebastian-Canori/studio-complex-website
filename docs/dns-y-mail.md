# DNS y mail de studiocomplex.com.ar

Estado verificado el 30/09/2026. La zona se edita en el Zone Editor del cPanel
de Turbonube (nameservers `ns1/ns2.turbonube.com`). Son todos registros
públicos: acá no hay claves ni contraseñas.

## Mail saliente (SMTP2GO)

| Registro | Tipo | Valor | Para qué |
|---|---|---|---|
| `s695638._domainkey` | CNAME | `dkim.smtp2go.net` | Firma DKIM de SMTP2GO |
| `em695638` | CNAME | `return.smtp2go.net` | Return-path: alinea SPF con el dominio |

## SPF

Un solo TXT en la raíz (dos registros SPF invalidan la validación):

```
v=spf1 include:_spf.google.com include:_spf.mlsend.com ip4:51.222.46.145 +a +mx ~all
```

- No se agregó `include:spf.smtp2go.com`: el return-path ya alinea y así no se
  acerca el límite de 10 consultas DNS.
- Pendiente de confirmar: `_spf.google.com` parece heredado (el MX no es de
  Google). Si no se usa Workspace, conviene sacarlo.

## DMARC

```
_dmarc  TXT  v=DMARC1; p=none; rua=mailto:hola@studiocomplex.com.ar;
```

- Política `none`: solo monitorea, no rechaza ni desvía mails.
- Los reportes llegan a `hola@studiocomplex.com.ar`. Cuando SPF y DKIM pasen
  en los reportes, subir a `p=quarantine`.

## Otros registros de mail

- `default._domainkey` (TXT): DKIM del hosting.
- `litesrv._domainkey` (CNAME a `mlsend.com`) y TXT `mailerlite-domain-verification`: MailerLite.
- MX: `0 studiocomplex.com.ar` (mail del hosting).

## Redirecciones HTTP(S)

- `.htaccess` fuerza HTTPS y quita `www`.
- `http://www` da 2 saltos (`https://www`, luego `https://`). La primera
  redirección viene de una capa del servidor, no del `.htaccess` ni del
  interruptor "Force HTTPS Redirect" del cPanel (se probó apagarlo, sin efecto).

## Claves

Las claves de SMTP2GO y reCAPTCHA viven solo en el servidor
(ver `assets/mail/README.md`), nunca en este repo.
