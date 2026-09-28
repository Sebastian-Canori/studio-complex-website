# Arma las notas del blog, blog.html y el bloque de notas del home a partir
# de tools/blog-notas.py. Correr desde la raíz del repo:
#   python3 tools/armar-blog.py
# Toma como molde el encabezado y el pie de servicio-desarrollo-web.html.
import sys, re, json, html, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from importlib import import_module
NOTAS = import_module("blog-notas").NOTAS

BASE = "https://nudge-digital-lab.github.io/studio-complex-website/"
FECHA_ISO = "2026-09-28"
FECHA = "28 sep 2026"
AUTOR = "Equipo Studio Complex"

molde = open("servicio-desarrollo-web.html", encoding="utf-8").read()
a0 = molde.index("        <!-- ==================================================================\n             SERVICIO")
fin = "<!-- ================= fin del servicio ================= -->"
b0 = molde.index(fin) + len(fin) + 1


def tarjeta(n, extra=""):
    return f'''
              <a class="sc-nb{extra}" href="nota-{n['slug']}.html">
                <span class="sc-nb-img"><img src="assets/images/notas/{n['slug']}.jpg" alt="" loading="lazy"></span>
                <span class="sc-nb-cuerpo">
                  <span class="sc-nb-meta"><b>{n['cat']}</b><span>{n['min']} min de lectura</span></span>
                  <strong class="sc-nb-titulo">{n['titulo']}</strong>
                  <span class="sc-nb-bajada">{n['bajada']}</span>
                  <span class="sc-nb-leer">Leer la nota <i class="tji-arrow-right-2" aria-hidden="true"></i></span>
                </span>
              </a>'''


def pagina(main, titulo, desc, ld, menu_blog=True):
    s = molde[:a0] + main + molde[b0:]
    s = re.sub(r'<meta name="description"\s+content="[^"]*">', f'<meta name="description"\n    content="{html.escape(desc, quote=True)}">', s, 1)
    s = re.sub(r"<title>.*?</title>", f"<title>{html.escape(titulo)}</title>", s, 1)
    s = re.sub(r'(<script type="application/ld\+json">\n).*?(\n  </script>)',
               lambda m: m.group(1) + json.dumps(ld, ensure_ascii=False, indent=2) + m.group(2), s, 1, flags=re.S)
    # en el blog ningún ítem del menú queda marcado como actual
    s = s.replace('<li class="has-dropdown current-menu-ancestor"><a href="index.html#servicios">Servicios</a>',
                  '<li class="has-dropdown"><a href="index.html#servicios">Servicios</a>')
    s = s.replace('<li class="current-menu-item"><a href="servicio-desarrollo-web.html">Desarrollo Web</a></li>',
                  '<li><a href="servicio-desarrollo-web.html">Desarrollo Web</a></li>')
    s = s.replace('<label for="sc-mensaje">¿Qué necesitás de tu sitio?</label>', '<label for="sc-mensaje">¿En qué te podemos ayudar?</label>')
    s = s.replace('placeholder="Contanos en dos líneas qué tiene que lograr tu web."', 'placeholder="Contanos en dos líneas qué necesitás."')
    return s


# --- notas ---
for i, n in enumerate(NOTAS):
    otras = [x for x in NOTAS if x is not n][:3] if i == 0 else [NOTAS[(i + k) % len(NOTAS)] for k in (1, 2, 3)]
    servu, servn = n["serv"]
    main = f'''        <!-- ==================================================================
             NOTA DEL BLOG · {n['titulo']}
             Generada con el mismo molde que las otras notas. Estilos en
             assets/css/sc-sv.css (bloque "Blog"). Para sumar una nota nueva,
             copiar este archivo, cambiar el contenido y sumarla en blog.html
             y en el bloque de notas del home.
             ================================================================== -->
        <div class="sc-sv">
          <article>
            <header class="sc-nota-hero">
              <div class="container">
                <div class="sc-nota-ancho">
                  <nav class="sc-sv-migas" aria-label="Ubicación">
                    <a href="blog.html">Blog</a><span aria-hidden="true">/</span><span>{n['cat']}</span>
                  </nav>
                  <span class="sc-sv-eyebrow">{n['cat']}</span>
                  <h1 class="sc-nota-titulo">{n['titulo']}</h1>
                  <p class="sc-nota-bajada">{n['bajada']}</p>
                  <div class="sc-nota-meta"><span>Por <b>{AUTOR}</b></span><span><time datetime="{FECHA_ISO}">{FECHA}</time></span><span>{n['min']} min de lectura</span></div>
                </div>
              </div>
            </header>
            <div class="container">
              <figure class="sc-nota-portada"><img src="assets/images/notas/{n['slug']}.jpg" alt=""></figure>
              <div class="sc-nota-ancho sc-nota-cuerpo">
{n['cuerpo'].strip()}

                <aside class="sc-nota-servicio">
                  <p>¿Querés resolver esto en tu empresa?<span>Mirá cómo trabajamos {servn.lower() if servn != 'SEO Técnico' else 'el SEO técnico'}.</span></p>
                  <a class="sc-sv-btn primario" href="{servu}">Ver {servn} <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                </aside>
              </div>
            </div>
          </article>

          <section class="sc-nota-mas">
            <div class="container">
              <h2>Seguí leyendo</h2>
              <div class="sc-nb-grid">{''.join(tarjeta(x) for x in otras)}
              </div>
            </div>
          </section>

          <section class="sc-sv-cierre">
            <div class="container">
              <div class="sc-sv-cierre-caja">
                <h2>¿Lo vemos en tu <span class="sc-sv-grad">negocio</span>?</h2>
                <p>Media hora de reunión y te decimos por dónde empezar.</p>
                <div class="sc-sv-btns">
                  <a class="sc-sv-btn primario" href="agenda.html">Agendá una reunión <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                  <a class="sc-sv-btn secundario" href="https://wa.me/5491153362945" target="_blank" rel="noopener"><i class="tji-whatsapp" aria-hidden="true"></i> Escribinos por WhatsApp</a>
                </div>
              </div>
            </div>
          </section>
        </div>
        <!-- ================= fin del servicio ================= -->
'''
    ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": n["titulo"], "description": n["bajada"],
          "image": BASE + f"assets/images/notas/{n['slug']}.jpg", "datePublished": FECHA_ISO, "inLanguage": "es",
          "author": {"@type": "Organization", "name": "Studio Complex", "url": BASE},
          "publisher": {"@type": "Organization", "name": "Studio Complex", "url": BASE},
          "mainEntityOfPage": BASE + f"nota-{n['slug']}.html"}
    open(f"nota-{n['slug']}.html", "w", encoding="utf-8").write(
        pagina(main, f"{n['titulo']} | Blog de Studio Complex", n["bajada"], ld))

# --- listado ---
main = f'''        <!-- ==================================================================
             BLOG · listado de notas
             La primera tarjeta va destacada a todo el ancho. Para sumar una
             nota: agregar su tarjeta arriba de todo (la más nueva primero).
             ================================================================== -->
        <div class="sc-sv">
          <section class="sc-sv-hero" style="padding-bottom: 50px">
            <div class="container">
              <nav class="sc-sv-migas" aria-label="Ubicación"><a href="index.html">Inicio</a><span aria-hidden="true">/</span><span>Blog</span></nav>
              <span class="sc-sv-eyebrow">Blog</span>
              <h1 class="sc-sv-titulo">Notas para <span class="sc-sv-grad">vender</span> mejor en digital.</h1>
              <p class="sc-sv-lead">Lo que aprendemos trabajando con empresas de toda Latinoamérica: web, tiendas, Google, anuncios, automatización y ventas, explicado sin vueltas.</p>
            </div>
          </section>
          <section style="padding-bottom: 90px">
            <div class="container">
              <div class="sc-nb-grid">{''.join(tarjeta(x) for x in NOTAS)}
              </div>
            </div>
          </section>
        </div>
        <!-- ================= fin del servicio ================= -->
'''
ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Blog de Studio Complex", "url": BASE + "blog.html",
      "blogPost": [{"@type": "BlogPosting", "headline": n["titulo"], "url": BASE + f"nota-{n['slug']}.html", "datePublished": FECHA_ISO} for n in NOTAS]}
open("blog.html", "w", encoding="utf-8").write(
    pagina(main, "Blog: Web, Tiendas, SEO, Ads y Automatización | Studio Complex",
           "Notas de Studio Complex sobre sitios web, tiendas online, SEO técnico, Google Ads, automatización de consultas y seguimiento de ventas.", ld))

# --- bloque del home: las 3 más nuevas ---
idx = open("index.html", encoding="utf-8").read()
a = idx.index("        <!-- start: Blog Section -->") if "<!-- start: Blog Section -->" in idx else None
b = idx.index("        <!-- end: Blog Section -->")
if a is None:
    raise SystemExit("no encontré el inicio del bloque del blog en el home")
home = f'''        <!-- start: Blog Section -->
        <!-- Notas del blog: las tres más nuevas. Estilos en sc-sv.css (bloque Blog). -->
        <section class="tj-blog-section section-gap fix sc-sv" style="overflow:visible">
          <div class="container">
            <div class="sec-heading sec-heading-centered">
              <span class="sub-title tj-fade-anim">Blog</span>
              <h2 class="sec-title tj-split-text-1">Notas para Vender Mejor en Digital.</h2>
            </div>
            <div class="sc-nb-grid">{''.join(tarjeta(x) for x in NOTAS[:3])}
            </div>
            <div class="text-center" style="margin-top: 40px">
              <a class="sc-sv-btn secundario" href="blog.html">Ver todas las notas <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
            </div>
          </div>
        </section>
'''
idx = idx[:a] + home + idx[b:]
if 'href="assets/css/sc-sv.css"' not in idx:
    idx = idx.replace('  <link rel="stylesheet" href="assets/css/sc-legal.css">\n',
                      '  <link rel="stylesheet" href="assets/css/sc-legal.css">\n  <link rel="stylesheet" href="assets/css/sc-sv.css">\n', 1)
open("index.html", "w", encoding="utf-8").write(idx)
print("listo:", len(NOTAS), "notas")

# El molde trae el canonical de Desarrollo Web: se corrige para cada página.
import subprocess
subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "canonical.py")], check=True)
