# Pone (o actualiza) <link rel="canonical"> en todas las páginas, apuntando
# a BASE + nombre del archivo. Cuando Studio Complex tenga su dominio,
# cambiar BASE y volver a correr:  python3 tools/canonical.py
# (también actualiza el og:url si existe). La home canónica es BASE a secas.
import glob, re
BASE = "https://studiocomplex.com.ar/"
n = 0
for f in sorted(glob.glob("*.html")):
    if f.startswith("_") or f == "error.html":  # el 404 no lleva canonical
        continue
    url = BASE if f == "index.html" else BASE + f
    s = open(f, encoding="utf-8").read()
    tag = f'<link rel="canonical" href="{url}">'
    if 'rel="canonical"' in s:
        s2 = re.sub(r'<link rel="canonical" href="[^"]*">', tag, s)
    else:
        s2 = re.sub(r'(\n\s*<title>)', f'\n  {tag}\\1', s, count=1)
    if s2 != s:
        open(f, "w", encoding="utf-8").write(s2); n += 1
print(f"canonical en {n} páginas ({BASE})")
