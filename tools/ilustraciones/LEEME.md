# Ilustraciones propias

`home-sobre.html` es la ilustración del bloque "Sobre Studio Complex" de la home (tienda, resultado de Google y consultas).

Para regenerarla (1200 x 909) y exportarla a `assets/images/about/about-img-1.webp`:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,909 --virtual-time-budget=8000 \
  --screenshot=home-sobre.png "file://$PWD/tools/ilustraciones/home-sobre.html"
cwebp -q 86 -m 6 home-sobre.png -o assets/images/about/about-img-1.webp
```

Los precios y el nombre "tutienda.com" son de ejemplo, no de un cliente real.
