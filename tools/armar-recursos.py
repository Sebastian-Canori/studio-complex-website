# Arma las páginas de los recursos gratis (lead magnets) y agrega la caja del
# recurso a las notas del blog que lo usan. Correr desde la raíz del repo:
#   python3 tools/armar-recursos.py
#
# No regenera las notas: toma cada nota publicada tal como está y solo inserta
# (o reemplaza) la caja del recurso y las dos etiquetas que necesita. Así no
# arrastra cambios de otras herramientas. Es idempotente.
#
# Molde de la página del recurso: la nota de costos de tiendas (mismo
# encabezado, menú, pie, cookies y analítica que el resto del sitio).
import html, json, os, re, sys
from importlib import import_module

sys.path.insert(0, os.path.dirname(__file__))
RECURSOS = import_module("recursos-datos").RECURSOS
caja_nota = import_module("recursos-datos").caja_nota
NOTAS = {n["slug"]: n for n in import_module("blog-notas").NOTAS}

BASE = "https://studiocomplex.com.ar/"
MOLDE = "nota-cuanto-cuesta-una-tienda-online.html"
V = "202611251900"
CSS = f'  <link rel="stylesheet" href="assets/css/sc-recurso.css?v={V}">\n'
JS = f'  <script src="assets/js/sc-recurso.js?v={V}"></script>\n'
INICIO_MAIN = "        <!-- ==================================================================\n             NOTA DEL BLOG"
FIN_MAIN = "        <!-- ================= fin del servicio ================= -->"


def con_etiquetas(s, js=False):
    s = re.sub(r'  <link rel="stylesheet" href="assets/css/sc-recurso\.css[^"]*">\n', "", s)
    s = s.replace('  <link rel="stylesheet" href="assets/css/sc-sv.css', CSS + '  <link rel="stylesheet" href="assets/css/sc-sv.css', 1)
    s = re.sub(r'  <script src="assets/js/sc-recurso\.js[^"]*"></script>\n', "", s)
    if js:
        s = s.replace("</body>", JS + "</body>", 1)
    return s


def tarjeta(n):
    return f'''
              <a class="sc-nb" href="nota-{n['slug']}.html">
                <span class="sc-nb-img"><img src="assets/images/notas/{n['slug']}.jpg" alt="" loading="lazy"></span>
                <span class="sc-nb-cuerpo">
                  <span class="sc-nb-meta"><b>{n['cat']}</b><span>{n['min']} min de lectura</span></span>
                  <strong class="sc-nb-titulo">{n['titulo']}</strong>
                  <span class="sc-nb-bajada">{n['bajada']}</span>
                  <span class="sc-nb-leer">Leer la nota <i class="tji-arrow-right-2" aria-hidden="true"></i></span>
                </span>
              </a>'''


def pagina_recurso(clave, r, molde):
    secciones = "\n".join(
        f'                  <li><div><b>{html.escape(t)}</b><span>{html.escape(d)}</span></div></li>' for t, d in r["secciones"])
    notas = "".join(tarjeta(NOTAS[s]) for s in r["notas"] if s in NOTAS)
    main = f'''        <!-- ==================================================================
             RECURSO GRATIS · {r['titulo']}
             Generada con tools/armar-recursos.py (datos en tools/recursos-datos.py).
             El formulario lo maneja assets/js/sc-recurso.js y lo recibe
             assets/mail/recurso-form.php. Estilos en assets/css/sc-recurso.css.
             ================================================================== -->
        <div class="sc-sv">
          <section class="sc-sv-hero" style="padding-bottom: 40px">
            <div class="container">
              <nav class="sc-sv-migas" aria-label="Ubicación"><a href="index.html">Inicio</a><span aria-hidden="true">/</span><a href="blog.html">Blog</a><span aria-hidden="true">/</span><span>Recurso gratis</span></nav>
              <span class="sc-sv-eyebrow">Recurso gratis · {r['formato']}</span>
              <h1 class="sc-sv-titulo">{r['titulo']}</h1>
              <p class="sc-sv-lead">{r['bajada']}</p>
            </div>
          </section>

          <section style="padding-bottom: 70px">
            <div class="container">
              <div class="sc-recurso-grid">
                <div>
                  <h2 style="font-size: clamp(1.5rem, 3vw, 2rem); margin: 0 0 22px">Qué vas a revisar</h2>
                  <ul class="sc-recurso-lista">
{secciones}
                  </ul>
                </div>
                <div class="sc-recurso-caja">
                  <form class="sc-recurso-form" data-recurso="{clave}" data-listo="sc-recurso-listo" novalidate>
                    <div>
                      <h2>Descargalo gratis</h2>
                      <p style="font-size:15px;margin:0">Te lo mandamos al mail y lo podés bajar al instante.</p>
                    </div>
                    <label>Nombre<input type="text" name="nombre" autocomplete="given-name" required maxlength="80"></label>
                    <label>Email<input type="email" name="email" autocomplete="email" required maxlength="120"></label>
                    <label class="sc-recurso-ok"><input type="checkbox" name="consentimiento" value="si" required><span>Acepto recibir mails de Studio Complex con ideas para vender más. Me puedo dar de baja cuando quiera.</span></label>
                    <button class="sc-sv-btn primario" type="submit">{r['boton']} <i class="tji-arrow-right-2" aria-hidden="true"></i></button>
                    <p class="sc-recurso-msj" role="status" aria-live="polite"></p>
                  </form>
                  <div class="sc-recurso-listo" id="sc-recurso-listo" tabindex="-1" hidden>
                    <h2>¡Listo!</h2>
                    <p style="font-size:15px;margin:0">También te lo mandamos al mail. Si querés revisarlo con nosotros, agendá media hora.</p>
                    <div class="sc-sv-btns">
                      <a class="sc-sv-btn primario" data-descarga href="{r['archivo']}" target="_blank" rel="noopener">Descargar el PDF <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                      <a class="sc-sv-btn secundario" href="agenda.html">Agendá 30 minutos</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="sc-nota-mas">
            <div class="container">
              <h2>Para leer mientras tanto</h2>
              <div class="sc-nb-grid">{notas}
              </div>
            </div>
          </section>

          <section class="sc-sv-cierre">
            <div class="container">
              <div class="sc-sv-cierre-caja">
                <h2>¿Lo vemos en tu <span class="sc-sv-grad">tienda</span>?</h2>
                <p>Media hora de reunión y te decimos por dónde empezar.</p>
                <div class="sc-sv-btns">
                  <a class="sc-sv-btn primario" href="agenda.html">Agendá una reunión <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                  <a class="sc-sv-btn secundario" href="https://wa.me/5491153362945" target="_blank" rel="noopener"><i class="tji-whatsapp" aria-hidden="true"></i> Escribinos por WhatsApp</a>
                </div>
              </div>
            </div>
          </section>
        </div>
'''
    a, b = molde.index(INICIO_MAIN), molde.index(FIN_MAIN)
    s = molde[:a] + main + molde[b:]
    url = BASE + r["pagina"]
    t, d = html.escape(r["titulo_seo"]), html.escape(r["desc"], quote=True)
    s = re.sub(r'<meta name="description"\s+content="[^"]*">', f'<meta name="description"\n    content="{d}">', s, count=1)
    s = re.sub(r"<title>.*?</title>", f"<title>{t}</title>", s, count=1)
    s = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', s, count=1)
    s = re.sub(r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="website">', s, count=1)
    for prop in ("og:title", "twitter:title"):
        s = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*(">)', lambda m: m.group(1) + t + m.group(2), s, count=1)
    for prop in ("og:description", "twitter:description"):
        s = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*(">)', lambda m: m.group(1) + d + m.group(2), s, count=1)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*(">)', lambda m: m.group(1) + url + m.group(2), s, count=1)
    # Datos estructurados: la página del recurso y sus migas de pan.
    ld = {"@context": "https://schema.org", "@type": "WebPage", "name": r["titulo"], "description": r["desc"], "url": url,
          "inLanguage": "es-AR", "publisher": {"@type": "Organization", "name": "Studio Complex", "url": BASE},
          "mainEntity": {"@type": "DigitalDocument", "name": r["titulo"], "encodingFormat": "application/pdf", "isAccessibleForFree": True}}
    migas = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": BASE + "blog.html"},
        {"@type": "ListItem", "position": 3, "name": r["titulo"], "item": url}]}
    bloques = list(re.finditer(r'  <script type="application/ld\+json">\n.*?\n  </script>\n', s, flags=re.S))
    if len(bloques) != 2:
        raise SystemExit(f"esperaba 2 bloques JSON-LD en el molde y hay {len(bloques)}")
    nuevo = "".join(f'  <script type="application/ld+json">\n{json.dumps(x, ensure_ascii=False, indent=2)}\n  </script>\n' for x in (ld, migas))
    s = s[:bloques[0].start()] + nuevo + s[bloques[0].end():bloques[1].start()] + s[bloques[1].end():]
    s = s.replace("<!-- Datos estructurados: el servicio y sus preguntas frecuentes. -->", "<!-- Datos estructurados: la página del recurso. -->", 1)
    return con_etiquetas(s, js=True)


def poner_caja(slug, clave):
    ruta = f"nota-{slug}.html"
    s = open(ruta, encoding="utf-8").read()
    s = re.sub(r'                <aside class="sc-nota-recurso">.*?</aside>\n', "", s, flags=re.S)
    marca = '                <aside class="sc-nota-servicio">'
    if marca not in s:
        raise SystemExit(f"{ruta}: no encontré la caja del servicio")
    s = s.replace(marca, caja_nota(clave, slug) + "\n" + marca, 1)
    open(ruta, "w", encoding="utf-8").write(con_etiquetas(s))


molde = open(MOLDE, encoding="utf-8").read()
for clave, r in RECURSOS.items():
    open(r["pagina"], "w", encoding="utf-8").write(pagina_recurso(clave, r, molde))
    print("página:", r["pagina"])
for slug, n in NOTAS.items():
    if n.get("recurso"):
        poner_caja(slug, n["recurso"])
        print("caja en:", f"nota-{slug}.html", "→", n["recurso"])
