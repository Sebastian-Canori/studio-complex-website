# Deja al dia, en todas las paginas indexables, las etiquetas de SEO que se
# derivan del <title>, la description y el canonical de cada una:
#   - Open Graph y Twitter (imagen para compartir).
#   - BreadcrumbList (migas de pan para Google) en JSON-LD.
#   - lang="es-AR" en <html>.
# Es idempotente. Correr desde la raiz del repo DESPUES de armar-blog.py y de
# armar-plataformas.py, que copian el encabezado de otras paginas:
#   python3 tools/armar-blog.py && python3 tools/armar-plataformas.py && python3 tools/seo-tags.py
import glob, html, json, re

BASE = "https://studiocomplex.com.ar/"
IMG = BASE + "assets/images/og-studio-complex-v2.png"
BLOQUE = re.compile(r"\n  <!-- Open Graph / Twitter -->.*?name=\"twitter:image\" content=\"[^\"]*\">", re.S)
MIGAS = re.compile(r"  <!-- Migas de pan \(schema\): las genera tools/seo-tags\.py -->\n  <script type=\"application/ld\+json\">.*?</script>\n", re.S)
LD = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)


def nombre_corto(titulo):
    # "Servicio - Studio Complex", "Nota | Blog de Studio Complex", "Caso - Caso de exito - Studio Complex"
    t = re.split(r"\s+\|\s+Blog de Studio Complex", titulo)[0]
    t = re.sub(r"\s+-\s+Caso de éxito\s+-\s+Studio Complex$", "", t)
    t = re.sub(r"\s+-\s+Studio Complex$", "", t)
    return t.strip()


def migas(f, s, titulo, url):
    """Devuelve la lista de (nombre, url) de las migas de pan, o None si no corresponde."""
    if f in ("index.html", "error.html"):
        return None
    inicio = ("Inicio", BASE)
    if f == "blog.html":
        return [inicio, ("Blog", url)]
    if f == "project.html":
        return [inicio, ("Trabajos realizados", url)]
    if f.startswith("nota-"):
        return [inicio, ("Blog", BASE + "blog.html"), (nombre_corto(titulo), url)]
    if f.startswith("caso-"):
        return [inicio, ("Trabajos realizados", BASE + "project.html"), (nombre_corto(titulo), url)]
    if f.startswith("servicio-"):
        m = re.search(r'class="sc-sv-migas".*?<span>([^<]+)</span>\s*</nav>', s, re.S)
        nombre = html.unescape(m.group(1)).strip() if m else nombre_corto(titulo)
        return [inicio, ("Servicios", BASE + "#servicios"), (nombre, url)]
    return [inicio, (nombre_corto(titulo), url)]


n = 0
for f in sorted(glob.glob("*.html")):
    original = open(f, encoding="utf-8").read()
    s = original.replace('<html class="no-js" lang="es">', '<html class="no-js" lang="es-AR">')
    if 'rel="canonical"' not in s:  # el 404 no lleva canonical ni etiquetas
        if s != original:
            open(f, "w", encoding="utf-8").write(s); n += 1
        continue
    s = BLOQUE.sub("", s)
    s = MIGAS.sub("", s)
    titulo = html.unescape(re.search(r"<title>([^<]*)</title>", s).group(1)).strip()
    desc = re.search(r'<meta name="description"\s+content="([^"]*)"', s).group(1)
    url = re.search(r'<link rel="canonical" href="([^"]*)"', s).group(1)
    tipo = "article" if f.startswith(("nota-", "caso-")) else "website"
    titulo_h = html.escape(titulo, quote=True)
    tags = f'''
  <!-- Open Graph / Twitter -->
  <meta property="og:type" content="{tipo}">
  <meta property="og:site_name" content="Studio Complex">
  <meta property="og:locale" content="es_AR">
  <meta property="og:title" content="{titulo_h}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{IMG}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{titulo_h}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{IMG}">'''
    s = re.sub(r'(<link rel="canonical" href="[^"]*">)', lambda m: m.group(1) + tags, s, count=1)
    # migas de pan: solo si la pagina no trae las suyas (las paginas de plataforma las generan ellas)
    ya_tiene = any('"BreadcrumbList"' in b for b in LD.findall(s))
    camino = None if ya_tiene else migas(f, s, titulo, url)
    if camino:
        ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i, "name": nom, "item": u} for i, (nom, u) in enumerate(camino, 1)]}
        bloque = ('  <!-- Migas de pan (schema): las genera tools/seo-tags.py -->\n  <script type="application/ld+json">\n'
                  + json.dumps(ld, ensure_ascii=False, indent=2) + "\n  </script>\n")
        s = s.replace("</head>", bloque + "</head>", 1)
    if s != original:
        open(f, "w", encoding="utf-8").write(s); n += 1
print(f"SEO actualizado en {n} paginas")
