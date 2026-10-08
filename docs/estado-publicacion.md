# Estado de publicación y orden de merge

Actualizado el 8 de octubre de 2026. Sirve para que el repo y el sitio publicado queden alineados sin adivinar.

## Qué es producción hoy

Producción (`studiocomplex.com.ar`) es **la rama `seo/mejoras-tecnicas`** (publicada el 8/10 por cPanel: `lang="es-AR"`, migas de pan y arreglo de las tarjetas del caso WooCommerce en home y trabajos; respaldo previo y 39 de 39 iguales). Se comprobó por hash: los 39 archivos `.html`, `.txt` y `.xml` versionados en la raíz son idénticos a lo que sirve el dominio. Para repetir la comprobación en cualquier momento:

```
python3 tools/comparar-con-produccion.py
```

Es solo lectura. Sale con código 1 si algo difiere.

Lo que existe en producción y **no** está en esa rama:

| Qué | Por qué |
|---|---|
| `formulario-ingreso.html` | Página nueva (formulario de ingreso, `noindex`) que viene de la rama `feat/formulario-ingreso`, publicada el 7/10 por el socio. |
| Carpeta `CRM-Altas` | Otra herramienta, fuera de este repo. |
| `CRM-ventas/` y su `.htaccess` | WordPress del CRM temporal, fuera de este repo. |

El `.htaccess` de la raíz sí es el del repo (el servidor lo protege y no se puede leer por web, por eso la herramienta no lo compara). Además, producción lleva el snippet de GA4 y Clarity (PR #4), que `main` todavía no tiene.

## Ramas

| Rama (en el fork de Sebastián) | Qué contiene | Publicado |
|---|---|---|
| `seo/geo-ai-visibility` (PR #5) | SEO y GEO del 6/10 y 6 notas nuevas del blog, más la analítica y los PR #2, #3 y #4. | Sí |
| `seo/redirects-favicons` | Lo anterior más redirecciones 301, favicon e imagen para compartir con Figtree. | Sí |
| `seo/caso-sosvosjeans` | Lo anterior más el caso de éxito de WooCommerce. | Sí |
| `seo/mejoras-tecnicas` | Lo anterior más `lang="es-AR"`, BreadcrumbList y arreglo de tarjetas. **Es producción.** | Sí |
| `seo/pagina-tiendanube` (PR #6) | Lo anterior más la página de Tiendanube y las herramientas para generar páginas de plataforma. | **No** |
| `seo/paginas-shopify-woocommerce` | Lo anterior más las páginas de Shopify y WooCommerce. | **No** |
| `feat/form-a-crm`, `docs/claude-md` | Formulario conectado al CRM y `CLAUDE.md`. | No (solo locales) |

Las ramas están apiladas: cada una incluye a la anterior.

## Orden de merge recomendado

1. PR #2, #3 y #4 (captcha, botón "Ver sitio en vivo" y GA4 y Clarity).
2. PR #5 (SEO y GEO del 6/10).
3. PR de `seo/caso-sosvosjeans`: deja el repo igual a producción.
4. PR #6 (página de Tiendanube), después de validarla. Al estar apilado, su diff queda solo con Tiendanube.
5. PR de Shopify y WooCommerce, después de validar #6.

Al terminar el paso 3, `python3 tools/comparar-con-produccion.py` sobre `main` debe decir 39 de 39 iguales (más `formulario-ingreso.html` si se mergea esa rama).

## Reglas para mergear

- **No descartar el snippet de GA4 y Clarity** al resolver conflictos: producción lo tiene en todas las páginas y se perdería la medición.
- Los conflictos esperables son solo `sitemap.xml` y `llms.txt`. `llms.txt` se regenera con `python3 tools/llms-txt.py` y `sitemap.xml` se resuelve conservando todas las líneas.
- Después de `python3 tools/armar-blog.py` hay que correr `python3 tools/seo-tags.py` (el generador del blog copia las etiquetas OG de otra página).

## Cómo se publicó

El `CLAUDE.md` del repo dice que publica el socio con `tools/publicar.py`. Entre el 6 y el 8 de octubre se publicó directo por el Administrador de archivos de cPanel, a pedido de Sebastián, en varias tandas: SEO y GEO y notas del blog (6/10), redirecciones y favicon (8/10), imagen para compartir (8/10) y el caso de éxito (8/10). Cada una con respaldo previo de los archivos que se pisaban, verificación por hash contra el repo y el zip temporal enviado a la papelera. Por eso esta documentación y la rama del caso: para que el repo vuelva a ser la fuente de verdad.
