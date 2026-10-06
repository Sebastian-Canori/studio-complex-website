# Pone (o regenera) las etiquetas Open Graph y Twitter en todas las páginas
# indexables, a partir del <title>, la description y el canonical de cada una.
# Es idempotente. Correr desde la raíz del repo DESPUÉS de armar-blog.py, que
# copia las etiquetas de servicio-desarrollo-web.html a las notas y al blog:
#   python3 tools/armar-blog.py && python3 tools/seo-tags.py
import glob, re

IMG = "https://studiocomplex.com.ar/assets/images/og-studio-complex.png"
BLOQUE = re.compile(r"\n  <!-- Open Graph / Twitter -->.*?name=\"twitter:image\" content=\"[^\"]*\">", re.S)

n = 0
for f in sorted(glob.glob("*.html")):
    s = open(f, encoding="utf-8").read()
    if 'rel="canonical"' not in s:  # el 404 no lleva canonical ni etiquetas
        continue
    s = BLOQUE.sub("", s)
    titulo = re.search(r"<title>([^<]*)</title>", s).group(1).strip()
    desc = re.search(r'<meta name="description"\s+content="([^"]*)"', s).group(1)
    url = re.search(r'<link rel="canonical" href="([^"]*)"', s).group(1)
    tipo = "article" if f.startswith(("nota-", "caso-")) else "website"
    tags = f'''
  <!-- Open Graph / Twitter -->
  <meta property="og:type" content="{tipo}">
  <meta property="og:site_name" content="Studio Complex">
  <meta property="og:locale" content="es_AR">
  <meta property="og:title" content="{titulo}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{IMG}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{titulo}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{IMG}">'''
    nuevo = re.sub(r'(<link rel="canonical" href="[^"]*">)', lambda m: m.group(1) + tags, s, count=1)
    if nuevo != open(f, encoding="utf-8").read():
        open(f, "w", encoding="utf-8").write(nuevo)
        n += 1
print(f"etiquetas OG/Twitter actualizadas en {n} páginas")
