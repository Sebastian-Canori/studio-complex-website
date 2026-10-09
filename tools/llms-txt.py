# Regenera llms.txt (índice para buscadores de IA) a partir del <title> y la
# description de cada página. Correr desde la raíz del repo cuando se suma o
# renombra una página o una nota:  python3 tools/llms-txt.py
import glob, html, re

BASE = "https://studiocomplex.com.ar/"


def meta(f):
    s = open(f, encoding="utf-8").read()
    t = re.search(r"<title>([^<]*)</title>", s).group(1).split(" | ")[0].replace(" - Studio Complex", "").strip()
    d = html.unescape(re.search(r'<meta name="description"\s+content="([^"]*)"', s).group(1))
    return t, d


def seccion(titulo, archivos):
    lineas = [f"\n## {titulo}\n"]
    for f in archivos:
        t, d = meta(f)
        lineas.append(f"- [{t}]({BASE}{f}): {d}")
    return "\n".join(lineas)


cabecera = """# Studio Complex

> Studio Complex es un partner digital para empresas de Argentina y Latinoamérica. Hace desarrollo web, tiendas online (Tiendanube, Shopify, WooCommerce), SEO técnico y campañas de Google Ads y Meta Ads. Como complemento, ayuda a ordenar el seguimiento de consultas y ventas por WhatsApp. Idioma: español. Primera reunión sin cargo.

Contacto: hola@studiocomplex.com.ar · WhatsApp +54 9 11 5336 2945 · https://studiocomplex.com.ar/contacto.html
"""
cuerpo = (cabecera + seccion("Servicios", sorted(glob.glob("servicio-*.html")))
          + seccion("Casos de éxito", sorted(glob.glob("caso-*.html")))
          + seccion("Notas del blog", sorted(glob.glob("nota-*.html")))
          + seccion("Información", ["sobre-nosotros.html", "equipo.html", "planes.html", "preguntas-frecuentes.html"]) + "\n")
open("llms.txt", "w", encoding="utf-8").write(cuerpo)
print("llms.txt actualizado")
