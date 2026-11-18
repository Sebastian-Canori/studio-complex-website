#!/usr/bin/env python3
"""Replace the "Servicios" dropdown with the services mega menu.

Usage: python3 tools/megamenu.py index.html [other pages...]
Idempotent: pages that already have the mega menu are rewritten with the
current markup. Adds the stylesheet and script tags once per page.
"""
import re
import sys
from pathlib import Path

VERSION = "202611181930"

# (href, icon, title, description, case image, case title, case href)
GROUPS = [
    ("Tu web o tienda", [
        ("servicio-desarrollo-web.html", "tji-development", "Desarrollo web",
         "Sitios rápidos, claros y pensados para vender.",
         "plataforma-de-cursos", "Plataforma de cursos con acceso automático",
         "caso-plataforma-de-cursos.html"),
        ("servicio-tiendas-online.html", "tji-budget", "Tiendas online",
         "Catálogo, pagos y envíos funcionando desde el día uno.",
         "tienda-a-medida", "Tienda Tiendanube con menú a medida",
         "caso-tienda-a-medida.html"),
    ]),
    ("Más consultas y ventas", [
        ("servicio-seo-tecnico.html", "tji-search", "SEO técnico",
         "Que Google te encuentre cuando te buscan.",
         "marker-webflow", "Migración de WordPress a Webflow con SEO",
         "caso-marker-webflow.html"),
        ("servicio-campanas-ads.html", "tji-growth", "Campañas de Ads",
         "Google y Meta medidos con consultas reales.",
         "retail-rubro-restringido", "Google Ads en un rubro con restricciones",
         "caso-retail-rubro-restringido.html"),
        ("servicio-automatizaciones-ia.html", "tji-spark", "Automatizaciones con IA",
         "Especialistas en IA aplicada: leads, atención, reportes y tareas repetitivas que se resuelven solos.",
         "reparto-de-consultas", "Reparto automático de consultas de WhatsApp",
         "caso-reparto-de-consultas.html"),
        ("servicio-cierre-de-ventas.html", "tji-chat", "Cierre de ventas",
         "Seguimiento para que el presupuesto no se enfríe.",
         "simulador-de-financiacion", "Simulador de financiación conectado a WhatsApp",
         "caso-simulador-de-financiacion.html"),
    ]),
]

PLATFORMS = [
    ("servicio-tiendanube.html", "Tiendanube", "tienda-a-medida",
     "Tienda Tiendanube con menú a medida", "caso-tienda-a-medida.html"),
    ("servicio-shopify.html", "Shopify", "tienda-a-medida",
     "Tienda Tiendanube con menú a medida", "caso-tienda-a-medida.html"),
    ("servicio-woocommerce.html", "WooCommerce", "woocommerce-minorista-mayorista",
     "WooCommerce minorista y mayorista", "caso-woocommerce-minorista-mayorista.html"),
]

LEADS = [
    ("servicio-automatizacion-leads.html", "Automatización de leads", "reparto-de-consultas",
     "Reparto automático de consultas de WhatsApp", "caso-reparto-de-consultas.html"),
    ("servicio-cierre-de-ventas.html", "Seguimiento de ventas", "simulador-de-financiacion",
     "Simulador de financiación conectado a WhatsApp", "caso-simulador-de-financiacion.html"),
]

# Sub-links shown as chips under a service (desktop) and as indented items (mobile).
CHIPS = {
    "servicio-tiendas-online.html": PLATFORMS,
    "servicio-automatizaciones-ia.html": LEADS[:1],
}

DEFAULT_CASE = GROUPS[0][1][1]


def case_attrs(img, title, href):
    return (f' data-case-img="assets/images/menu/{img}.webp"'
            f' data-case-title="{title}" data-case-href="{href}"')


def build(trigger_href, panel_id, extra_classes=""):
    cols = []
    for heading, items in GROUPS:
        links = []
        for href, icon, title, desc, img, ctitle, chref in items:
            extra = ""
            if href in CHIPS:
                chips = "".join(
                    f'<a class="sc-mega__chip" href="{h}"{case_attrs(i, t, c)}>{n}</a>'
                    for h, n, i, t, c in CHIPS[href])
                extra = f'<span class="sc-mega__chips">{chips}</span>'
            links.append(
                f'<div class="sc-mega__item">'
                f'<a class="sc-mega__link" href="{href}"{case_attrs(img, ctitle, chref)}>'
                f'<span class="sc-mega__icon" aria-hidden="true"><i class="{icon}"></i></span>'
                f'<span class="sc-mega__text"><span class="sc-mega__title">{title}</span>'
                f'<span class="sc-mega__desc">{desc}</span></span></a>{extra}</div>')
        cols.append(f'<div class="sc-mega__col"><p class="sc-mega__label">{heading}</p>'
                    + "".join(links) + "</div>")

    _, _, _, _, img, ctitle, chref = DEFAULT_CASE
    feature = (
        f'<a class="sc-mega__case" href="{chref}">'
        f'<img src="assets/images/menu/{img}.webp" alt="" width="240" height="320" loading="lazy" decoding="async">'
        f'<span class="sc-mega__case-body"><span class="sc-mega__case-kicker">Caso real</span>'
        f'<span class="sc-mega__case-title">{ctitle}</span>'
        f'<span class="sc-mega__case-cta">Ver caso <i class="tji-arrow-right-2" aria-hidden="true"></i></span></span></a>')

    footer = (
        '<div class="sc-mega__foot"><p>¿No sabés por dónde empezar?</p>'
        '<a href="agenda.html">Agendá 30 min con nosotros <i class="tji-arrow-right-2" aria-hidden="true"></i></a></div>')

    # Plain list for the mobile menu (meanmenu expands the <ul> right before its toggle).
    mobile = ['<ul class="sub-menu sc-mega-mobile">']
    for _, items in GROUPS:
        for href, _, title, *_ in items:
            mobile.append(f'<li><a href="{href}">{title}</a></li>')
            if href in CHIPS:
                mobile += [f'<li class="sc-mega-mobile__sub"><a href="{h}">{n}</a></li>'
                           for h, n, *_ in CHIPS[href]]
    mobile.append("</ul>")

    return (
        f'<li class="has-dropdown sc-mega-li{extra_classes}"><a href="{trigger_href}" aria-haspopup="true" aria-expanded="false" aria-controls="{panel_id}">Servicios</a>'
        f'<div class="sc-mega" id="{panel_id}"><div class="sc-mega__grid">{"".join(cols)}'
        f'<div class="sc-mega__feature">{feature}</div></div>{footer}</div>'
        + "".join(mobile) + "</li>")


OLD = re.compile(
    r'<li class="has-dropdown((?: [\w-]+)*)"><a href="([^"]*)"[^>]*>Servicios</a>.*?Cierre de [Vv]entas</a></li>\s*</ul>\s*</li>',
    re.S)


def process(path):
    html = path.read_text(encoding="utf-8")
    count = 0

    def repl(m):
        nonlocal count
        count += 1
        extra = "".join(f" {c}" for c in m.group(1).split() if c != "sc-mega-li")
        return build(m.group(2), f"sc-mega-panel-{count}", extra)

    html = OLD.sub(repl, html)
    css = f'<link rel="stylesheet" href="assets/css/sc-megamenu.css?v={VERSION}">'
    js = f'<script src="assets/js/sc-megamenu.js?v={VERSION}" defer></script>'
    html = re.sub(r'\s*<link rel="stylesheet" href="assets/css/sc-megamenu\.css[^>]*>', "", html)
    html = re.sub(r'\s*<script src="assets/js/sc-megamenu\.js[^>]*></script>', "", html)
    html = html.replace("</head>", f"  {css}\n</head>", 1)
    html = html.replace("</body>", f"  {js}\n</body>", 1)
    path.write_text(html, encoding="utf-8")
    print(f"{path}: {count} menu(s)")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        process(Path(arg))
