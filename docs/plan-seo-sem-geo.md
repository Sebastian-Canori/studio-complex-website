# Plan de SEO, SEM y GEO de studiocomplex.com.ar

Objetivo: posicionar a Studio Complex en tiendas online (Tiendanube, WooCommerce/WordPress y Shopify) y en las automatizaciones que se apoyan en esas tiendas. Se avanza de a una pieza, ordenadas por lo que más rápido mueve el resultado, y cada pieza se valida con el socio en un PR antes de publicarse.

Reglas de contenido: solo afirmaciones que ya están probadas en el sitio (casos, FAQ, plazos). Los planes dicen "A cotizar": no se escriben precios. No se usan insignias de partner mientras no exista el alta oficial.

## Orden de implementación

| # | Pieza | Por qué va en este lugar | Estado |
|---|---|---|---|
| 1 | Página `servicio-tiendanube.html` | Búsquedas con intención de compra, y es la plataforma local con más agencias buscadas. Se indexa en días. | En revisión (rama `seo/pagina-tiendanube`) |
| 2 | Páginas de Shopify y de WooCommerce/WordPress | Mismo molde (`tools/armar-plataformas.py`): cada una es de horas, no de días. | Pendiente |
| 3 | Medición: eventos de conversión en GA4 (clic en WhatsApp, formulario, agenda) | Sin esto no se sabe qué página trae consultas y no se puede pautar con criterio. | Pendiente |
| 4 | Técnico rápido: `BreadcrumbList` en servicios y notas, `lang="es-AR"`, enlaces internos y entrada en el menú | Horas de trabajo y mejora la lectura que hace Google del sitio. | Parcial (la página 1 ya trae breadcrumbs) |
| 5 | Perfiles y menciones: LinkedIn de la empresa, Google Business Profile, directorios y programas de socios de Tiendanube y Shopify | Las menciones externas son lo que más pesa para posicionar y para que las IA te citen. Requiere altas de Sebastián. | Pendiente |
| 6 | Páginas de automatización para tiendas (carrito abandonado, aviso de venta, alta automática, reparto de consultas) | La búsqueda de automatización en Tiendanube hoy la ocupan herramientas, no agencias. | Pendiente |
| 7 | Páginas de integraciones: Mercado Pago, envíos, facturación ARCA, WhatsApp | Búsquedas concretas y de alta intención en Argentina. | Pendiente |
| 8 | Notas de migración y comparación, y casos con cifras reales | Contenido citable por buscadores y por IA. Las cifras las aporta el cliente con permiso. | Pendiente |
| 9 | SEM: campañas de Google Ads por plataforma, cada una a su página | Recién rinde con las páginas 1 a 3 listas. Empezar con presupuesto chico. | Pendiente |
| 10 | GEO: pruebas mensuales de preguntas en ChatGPT, Perplexity y Gemini, reseñas verificables y páginas de autor | Se mide mejor cuando ya hay páginas y menciones. | Pendiente |

## Cómo validar una pieza (checklist para el socio)

1. Abrir el PR, leer los textos de la página: ¿alguna afirmación no está respaldada por un caso o por una FAQ existente?
2. Servir el repo por `localhost` y revisarla en 375, 768 y 1440 px.
3. Confirmar: un solo `h1`, título de hasta 61 caracteres, descripción de hasta 160, canonical correcta, JSON-LD que parsea, GA4 presente y que no haya enlaces rotos.
4. Comprobar que el menú y las páginas relacionadas la enlazan.
5. Al mergear: se publica por cPanel con respaldo previo, se verifica por hash y se pide la indexación en Search Console y Bing.

## Cómo se arma una página de plataforma

El contenido vive en `tools/plataformas-datos.py` y el molde en `tools/armar-plataformas.py` (toma el encabezado, el menú y las piezas visuales de `servicio-tiendas-online.html`). Para cambiar un texto se edita el archivo de datos y se vuelve a correr:

```
python3 tools/armar-plataformas.py && python3 tools/seo-tags.py && python3 tools/llms-txt.py
```

No se edita la página generada a mano. Sumar Shopify o WooCommerce es agregar un bloque al archivo de datos.
