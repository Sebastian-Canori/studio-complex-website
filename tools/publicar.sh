#!/bin/bash
# Publica el sitio en studiocomplex.com.ar (hosting Turbonube, cPanel).
# Sube por FTPS lo que está en git (menos tools/, assets/sass/, assets/mail/
# y la documentación) más .htaccess, robots.txt y sitemap.xml.
# Necesita ~/.local/bin/ftp-studiocomplex (la clave vive en el Llavero,
# servicio "ftp-studiocomplex"). OJO: el servidor exige TLS 1.2; con 1.3 los
# archivos de más de ~14 KB fallan con error 451.
# Uso, desde la raíz del repo:  bash tools/publicar.sh
set -e
cd "$(dirname "$0")/.."
python3 tools/version-assets.py
LISTA=$(mktemp)
( git ls-files; echo .htaccess; echo robots.txt; echo sitemap.xml ) | sort -u \
  | grep -v '^tools/\|^\.git\|README\|\.md$\|^assets/sass/\|^assets/mail/\|^\.gitignore$' > "$LISTA"
while read -r f; do ~/.local/bin/ftp-studiocomplex put "public_html/$f" "$f" >/dev/null; done < "$LISTA"
echo "subidos $(wc -l < "$LISTA" | tr -d ' ') archivos a studiocomplex.com.ar"
rm -f "$LISTA"
