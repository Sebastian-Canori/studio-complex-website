# Pone ?v=<version> en los CSS y JS propios del sitio (main.css y los sc-*)
# en todas las páginas, para que los navegadores no sigan usando una copia
# vieja después de publicar un cambio. GitHub Pages los guarda 10 minutos.
# Correr desde la raíz del repo después de tocar CSS o JS:
#   python3 tools/version-assets.py
import glob, re, time
v = time.strftime("%Y%m%d%H%M")
pat = re.compile(r'((?:href|src)="assets/(?:css|js)/(?:main|sc-[a-z-]+)\.(?:css|js))(?:\?v=\d+)?"')
n = 0
for f in glob.glob("*.html"):
    s = open(f, encoding="utf-8").read()
    s2 = pat.sub(lambda m: f'{m.group(1)}?v={v}"', s)
    if s2 != s:
        open(f, "w", encoding="utf-8").write(s2); n += 1
print(f"versión {v} en {n} páginas")
