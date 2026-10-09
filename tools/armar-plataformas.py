# Arma las paginas de plataforma (servicio-tiendanube.html, etc.) a partir de
# tools/plataformas-datos.py, tomando como molde el encabezado, el menu, el
# pie y las piezas visuales de servicio-tiendas-online.html.
# Correr desde la raiz del repo:
#   python3 tools/armar-plataformas.py && python3 tools/seo-tags.py && python3 tools/llms-txt.py
import sys, re, json, html, os
sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
PLAT = import_module("plataformas-datos").PLATAFORMAS

BASE = "https://studiocomplex.com.ar/"
molde = open("servicio-tiendas-online.html", encoding="utf-8").read()

INI = "        <!-- ==================================================================\n             SERVICIO · Tiendas Online"
FIN = "<!-- ================= fin del servicio ================= -->"
i0 = molde.index(INI)
i1 = molde.index(FIN) + len(FIN)
demo = molde[molde.index("                <!-- Demo: una tienda que suma ventas sola -->"):molde.index("          <!-- 2 · CINTA -->")]


def plano(t):
    return html.unescape(re.sub(r"<[^>]+>", "", t)).strip()


def e(t):
    return html.escape(t, quote=False)


def pagina(p):
    url = BASE + p["archivo"]
    datos = "".join(f"<li><b>{e(a)}</b><span>{e(b)}</span></li>" for a, b in p["datos"])
    cinta = "".join(f"<li>{e(x)}</li>" for x in p["cinta"])
    formatos = ""
    for n, (plazo, tit, txt, items, para, dest) in enumerate(p["formatos"]):
        lis = "".join(f'\n                    <li><i class="tji-check"></i>{e(x)}</li>' for x in items)
        delay = f' data-rv-delay="{n * 80}"' if n else ""
        formatos += f'''
                <article class="sc-sv-formato{' destacado' if dest else ''} sc-rv"{delay}>
                  <span class="sc-sv-formato-plazo">{e(plazo)}</span>
                  <h3>{e(tit)}</h3>
                  <p>{e(txt)}</p>
                  <ul>{lis}
                  </ul>
                  <p class="sc-sv-para"><b>Para vos si</b> {e(para)}</p>
                </article>
'''
    cajas = ""
    for n, (ico, tit, txt) in enumerate(p["cajas"]):
        delay = f' data-rv-delay="{(n % 3) * 80}"' if n % 3 else ""
        cajas += f'''
                <article class="sc-sv-caja sc-rv"{delay}>
                  <span class="sc-sv-caja-ico"><i class="{ico}"></i></span>
                  <h3>{e(tit)}</h3>
                  <p>{e(txt)}</p>
                </article>
'''
    autos = ""
    for n, (img, tit, txt, bl) in enumerate(p["autos"]):
        estilo = ' style="background:#fff;padding:9px"' if bl else ""
        delay = f' data-rv-delay="{n * 60}"' if n else ""
        autos += f'''
                <article class="sc-sv-plat sc-rv"{delay}>
                  <img src="assets/images/icons/{img}" alt="" width="52" height="52" loading="lazy"{estilo}>
                  <h3>{e(tit)}</h3>
                  <p>{e(txt)}</p>
                </article>
'''
    pasos = ""
    for tit, txt, nota in p["pasos"]:
        small = f"\n                      <small>{e(nota)}</small>" if nota else ""
        pasos += f'''
                  <li class="sc-sv-paso">
                    <span class="sc-sv-paso-num" aria-hidden="true"></span>
                    <div>
                      <h3>{e(tit)}</h3>
                      <p>{e(txt)}</p>{small}
                    </div>
                  </li>
'''
    casos = ""
    for n, (href, img, alt, cat, tit) in enumerate(p["casos"]):
        delay = f' data-rv-delay="{n * 80}"' if n else ""
        casos += f'''
                <a class="sc-sv-caso sc-rv" href="{href}"{delay}>
                  <img src="assets/images/casos/{img}" alt="{e(alt)}" loading="lazy">
                  <div class="sc-sv-caso-txt"><span>{e(cat)}</span><h3>{e(tit)}</h3><em>Ver el caso <i class="tji-arrow-right-2" aria-hidden="true"></i></em></div>
                </a>
'''
    faq = ""
    for n, (q, a) in enumerate(p["faq"]):
        faq += f'''
                  <details{' open' if n == 0 else ''}>
                    <summary>{e(q)}</summary>
                    <p>{e(a)}</p>
                  </details>'''
    rel = "".join(
        f'\n                <a href="{h}"><i class="{ic}" aria-hidden="true"></i><span><b>{e(t)}</b><small>{e(d)}</small></span><i class="tji-arrow-right-2" aria-hidden="true"></i></a>'
        for h, ic, t, d in p["rel"])
    wa = "https://wa.me/5491153362945?text=" + p["wa_texto"].replace(" ", "%20").replace(",", "%2C")
    auto_h, auto_t = p["auto_link"]
    main = f'''        <!-- ==================================================================
             SERVICIO · {p["nombre"]} (pagina de plataforma)
             Generada por tools/armar-plataformas.py con el contenido de
             tools/plataformas-datos.py. Para cambiar textos, editar ese archivo
             y volver a correr el generador: no editar esta pagina a mano.
             ================================================================== -->
        <div class="sc-sv">

          <!-- 1 · ENCABEZADO -->
          <section class="sc-sv-hero">
            <div class="container">
              <div class="sc-sv-hero-grid">
                <div>
                  <nav class="sc-sv-migas" aria-label="Ubicación">
                    <a href="index.html#servicios">Servicios</a><span aria-hidden="true">/</span><a href="servicio-tiendas-online.html">Tiendas online</a><span aria-hidden="true">/</span><span>{e(p["nombre"])}</span>
                  </nav>
                  <span class="sc-sv-eyebrow">{e(p["eyebrow"])}</span>
                  <h1 class="sc-sv-titulo">{p["h1"]}</h1>
                  <p class="sc-sv-lead">{e(p["lead"])}</p>
                  <div class="sc-sv-btns">
                    <a class="sc-sv-btn primario" href="agenda.html">Agendá una reunión <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                    <a class="sc-sv-btn secundario" href="#casos">Ver trabajos</a>
                  </div>
                  <ul class="sc-sv-hero-datos">{datos}</ul>
                </div>

{demo}
          <!-- 2 · CINTA -->
          <div class="sc-sv-cinta" aria-label="Qué incluye cada tienda">
            <div class="sc-sv-cinta-pista">
              <ul>{cinta}</ul>
              <ul aria-hidden="true">{cinta}</ul>
            </div>
          </div>

          <!-- 3 · FORMATOS -->
          <section class="sc-sv-seccion">
            <div class="container">
              <div class="sc-sv-cabeza lado">
                <div class="sc-rv">
                  <span class="sc-sv-eyebrow">{e(p["formatos_eyebrow"])}</span>
                  <h2 class="sc-sv-h2">{e(p["formatos_h2"])}</h2>
                </div>
                <p class="sc-sv-lead sc-rv" data-rv-delay="100">{e(p["formatos_lead"])}</p>
              </div>
              <div class="sc-sv-formatos">{formatos}              </div>
            </div>
          </section>

          <!-- 4 · QUÉ INCLUYE -->
          <section class="sc-sv-seccion" style="padding-top: 0">
            <div class="container">
              <div class="sc-sv-cabeza">
                <span class="sc-sv-eyebrow sc-rv">{e(p["incluye_eyebrow"])}</span>
                <h2 class="sc-sv-h2 sc-rv">{e(p["incluye_h2"])}</h2>
              </div>
              <div class="sc-sv-bento">{cajas}              </div>
            </div>
          </section>

          <!-- 5 · AUTOMATIZACIONES -->
          <section class="sc-sv-seccion" style="padding-top: 0">
            <div class="container">
              <div class="sc-sv-cabeza lado">
                <div class="sc-rv">
                  <span class="sc-sv-eyebrow">{e(p["auto_eyebrow"])}</span>
                  <h2 class="sc-sv-h2">{e(p["auto_h2"])}</h2>
                </div>
                <p class="sc-sv-lead sc-rv" data-rv-delay="100">{e(p["auto_lead"])}
                  <a href="{auto_h}" style="color: var(--tj-color-theme-primary); font-weight: 700; white-space: nowrap">{e(auto_t)} <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                </p>
              </div>
              <div class="sc-sv-plataformas">{autos}              </div>
            </div>
          </section>

          <!-- 6 · PROCESO -->
          <section class="sc-sv-seccion" style="padding-top: 0">
            <div class="container">
              <div class="sc-sv-proceso-wrap">
                <div class="sc-sv-cabeza">
                  <span class="sc-sv-eyebrow sc-rv">Cómo trabajamos</span>
                  <h2 class="sc-sv-h2 sc-rv">De la primera reunión a la primera venta.</h2>
                  <p class="sc-sv-lead sc-rv">{e(p["proceso_lead"])}</p>
                  <div class="sc-sv-btns sc-rv" style="margin-top: 30px">
                    <a class="sc-sv-btn primario" href="agenda.html">Empezar por la reunión <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                  </div>
                </div>
                <ol class="sc-sv-proceso">{pasos}                </ol>
              </div>
            </div>
          </section>

          <!-- 7 · CASOS -->
          <section class="sc-sv-seccion" id="casos" style="padding-top: 0">
            <div class="container">
              <div class="sc-sv-cabeza lado">
                <div class="sc-rv">
                  <span class="sc-sv-eyebrow">Trabajos</span>
                  <h2 class="sc-sv-h2">{e(p.get("casos_h2", "Tiendas que ya están vendiendo."))}</h2>
                </div>
                <p class="sc-sv-lead sc-rv" data-rv-delay="100">{e(p["casos_lead"])}
                  <a href="trabajos.html" style="color: var(--tj-color-theme-primary); font-weight: 700; white-space: nowrap">Ver todos <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                </p>
              </div>
              <div class="sc-sv-casos">{casos}              </div>
            </div>
          </section>

          <!-- 8 · PREGUNTAS FRECUENTES -->
          <section class="sc-sv-seccion" style="padding-top: 0">
            <div class="container">
              <div class="sc-sv-faq-wrap">
                <div class="sc-sv-cabeza sc-rv">
                  <span class="sc-sv-eyebrow">Preguntas frecuentes</span>
                  <h2 class="sc-sv-h2">Lo que nos preguntan antes de arrancar.</h2>
                  <p class="sc-sv-lead">¿Tenés otra duda? Escribinos por <a href="https://wa.me/5491153362945" target="_blank" rel="noopener" style="color: var(--tj-color-theme-primary); font-weight: 700">WhatsApp</a> y te respondemos.</p>
                </div>
                <div class="sc-sv-faq sc-rv" data-rv-delay="100">{faq}
                </div>
              </div>
            </div>
          </section>

          <!-- Servicios relacionados: links internos entre servicios (SEO) -->
          <section class="sc-sv-rel">
            <div class="container">
              <h2>También te puede servir</h2>
              <div class="sc-sv-rel-lista">{rel}
              </div>
            </div>
          </section>

          <!-- 9 · CIERRE -->
          <section class="sc-sv-cierre">
            <div class="container">
              <div class="sc-sv-cierre-caja sc-rv">
                <h2>{p["cierre_h2"]}</h2>
                <p>{e(p["cierre_p"])}</p>
                <div class="sc-sv-btns">
                  <a class="sc-sv-btn primario" href="agenda.html">Agendá una reunión <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                  <a class="sc-sv-btn secundario" href="{wa}" target="_blank" rel="noopener"><i class="tji-whatsapp" aria-hidden="true"></i> Escribinos por WhatsApp</a>
                </div>
              </div>
            </div>
          </section>

        </div>
        {FIN}'''
    ld = [
        {"@context": "https://schema.org", "@type": "Service", "name": p["service_name"], "serviceType": p["service_type"],
         "description": p["desc"], "provider": {"@type": "Organization", "name": "Studio Complex", "url": BASE}, "areaServed": "Latinoamérica", "url": url},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "Tiendas online", "item": BASE + "servicio-tiendas-online.html"},
            {"@type": "ListItem", "position": 3, "name": p["nombre"], "item": url}]},
    ]
    assert len(p["desc"]) <= 160, (len(p["desc"]), p["desc"])
    s = molde[:i0] + main + molde[i1:]
    s = re.sub(r'<meta name="description"\s+content="[^"]*">', f'<meta name="description"\n    content="{html.escape(p["desc"], quote=True)}">', s, 1)
    s = re.sub(r"<title>.*?</title>", f"<title>{html.escape(p['title'])}</title>", s, 1)
    s = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', s, 1)
    s = re.sub(r'(<script type="application/ld\+json">\n).*?(\n  </script>)',
               lambda m: m.group(1) + json.dumps(ld, ensure_ascii=False, indent=2) + m.group(2), s, 1, flags=re.S)
    # el molde marca "Tiendas Online" como pagina actual del menu: aqui sigue siendo su padre
    open(p["archivo"], "w", encoding="utf-8").write(s)
    print("armada:", p["archivo"], f"({len(s)//1024} KB)")


for p in PLAT:
    pagina(p)
