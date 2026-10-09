/* ==========================================================================
   Studio Complex · Buscador del menú (lupa) con Whois
   --------------------------------------------------------------------------
   El buscador de la plantilla no hacía nada (form action="#"). Ahora:

   - Si lo que se escribe parece un dominio (tiene un punto y no tiene
     espacios), consulta si está registrado con RDAP, el reemplazo moderno
     de Whois, desde el navegador: https://rdap.org/domain/<dominio>
     rdap.org deriva al registro de cada terminación (NIC Argentina para
     .ar, Verisign para .com, etc.) y responde con CORS abierto, así que no
     hace falta servidor propio.
   - Si no, busca en las páginas del sitio (índice de abajo).

   OJO con las terminaciones: varios países de la región (.uy, .cl, .co,
   .mx, .pe, .py) y .io no publican RDAP y responden 404 aunque el dominio
   exista. Solo se afirma "libre" para las terminaciones de TLD_CONFIABLES,
   verificadas el 28/9/2026. Para el resto se deriva a WhatsApp.
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP = "5491153362945";

  var TLD_CONFIABLES = [
    "com.ar", "net.ar", "org.ar", "gob.ar", "tur.ar", "ar",
    "com", "net", "org", "info", "biz", "site", "online", "store", "shop",
    "app", "dev", "ai", "xyz", "tech", "agency", "digital", "studio", "design", "art"
  ];

  var PAGINAS = [
    { t: "Desarrollo Web", d: "Sitios a medida, landing en 48 horas, sitios corporativos", u: "servicio-desarrollo-web.html", k: "web sitio pagina landing wordpress webflow corporativo diseño" },
    { t: "Tiendas Online", d: "Tiendanube, Shopify y WooCommerce, cuotas y envíos", u: "servicio-tiendas-online.html", k: "tienda ecommerce e-commerce tiendanube shopify woocommerce mercado pago catalogo" },
    { t: "SEO Técnico", d: "Aparecer en Google: auditoría, velocidad, posicionamiento", u: "servicio-seo-tecnico.html", k: "seo google posicionamiento buscador auditoria velocidad" },
    { t: "Campañas de Ads", d: "Google Ads y Meta Ads medidos de punta a punta", u: "servicio-campanas-ads.html", k: "ads anuncios google meta facebook instagram publicidad campañas remarketing" },
    { t: "Automatización de Leads", d: "Reparto de consultas de WhatsApp y registro automático", u: "servicio-automatizacion-leads.html", k: "automatizacion whatsapp consultas leads n8n make reparto asesores" },
    { t: "Cierre de Ventas", d: "Seguimiento de presupuestos hasta el sí", u: "servicio-cierre-de-ventas.html", k: "ventas seguimiento crm presupuestos cierre asistente" },
    { t: "Trabajos", d: "Todos los casos de éxito", u: "trabajos.html", k: "casos trabajos portfolio proyectos" },
    { t: "Caso: De WordPress a Webflow", d: "Marker, sitio B2B en tres idiomas", u: "caso-marker-webflow.html", k: "marker webflow wordpress migracion" },
    { t: "Caso: El alumno paga y entra al aula solo", d: "Tiendanube + Make + aula virtual", u: "caso-plataforma-de-cursos.html", k: "cursos aula elearning tiendanube make" },
    { t: "Caso: Google Ads en un rubro con restricciones", d: "Retail sin suspensiones", u: "caso-retail-rubro-restringido.html", k: "google ads restringido retail" },
    { t: "Caso: Las consultas se reparten entre los asesores", d: "WhatsApp y planilla", u: "caso-reparto-de-consultas.html", k: "whatsapp asesores reparto consultas" },
    { t: "Caso: Una tienda con el menú a medida", d: "Más de 800 productos migrados", u: "caso-tienda-a-medida.html", k: "tienda menu tiendanube migracion" },
    { t: "Blog", d: "Notas sobre web, tiendas, SEO, Ads y ventas", u: "blog.html", k: "blog notas articulos" },
    { t: "Partners", d: "Programa para agencias y freelancers", u: "partners.html", k: "partners socios agencias freelancers referidos marca blanca" },
    { t: "Sobre Nosotros", d: "Quiénes somos y cómo nacimos", u: "sobre-nosotros.html", k: "nosotros equipo empresa quienes" },
    { t: "Equipo", d: "Las personas de Studio Complex", u: "equipo.html", k: "equipo personas jorge sebastian" },
    { t: "Preguntas Frecuentes", d: "Plazos, precios y cómo trabajamos", u: "preguntas-frecuentes.html", k: "preguntas faq dudas" },
    { t: "Agendá una reunión", d: "Media hora sin cargo", u: "agenda.html", k: "reunion agenda turno calendly llamada" },
    { t: "Contacto", d: "Escribinos", u: "contacto.html", k: "contacto mail email telefono whatsapp" }
  ];

  var popup = document.querySelector(".search_popup");
  if (!popup) return;
  var form = popup.querySelector("form");
  var input = popup.querySelector(".search-input-field");
  var titulo = popup.querySelector(".search_input .title");
  if (!form || !input) return;

  if (titulo) titulo.textContent = "Empezá tu proyecto por un dominio.";
  input.placeholder = "Ej: tuempresa.com.ar";
  input.setAttribute("aria-label", "Consultar un dominio o buscar en el sitio");
  input.removeAttribute("required");

  var caja = document.createElement("div");
  caja.className = "sc-bus";
  caja.setAttribute("aria-live", "polite");
  caja.innerHTML = '<p class="sc-bus-ayuda">Escribí el dominio que querés y te decimos si está libre. También podés buscar en el sitio: tiendas, SEO, Ads…</p>';
  form.parentNode.appendChild(caja);

  function norm(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function limpiarDominio(v) {
    v = v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
    return v.split(/[\/?#]/)[0];
  }
  function pareceDominio(v) {
    return /^[a-z0-9áéíóúñü-]+(\.[a-z0-9-]+)+$/i.test(limpiarDominio(v)) && v.indexOf(" ") === -1;
  }
  function tld(dom) {
    var p = dom.split(".");
    var dos = p.slice(-2).join(".");
    return TLD_CONFIABLES.indexOf(dos) !== -1 ? dos : p[p.length - 1];
  }
  function wa(texto) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  }
  function fecha(iso) {
    try { return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return iso; }
  }

  function buscarSitio(q) {
    var t = norm(q).split(/\s+/).filter(Boolean);
    var res = PAGINAS.map(function (p) {
      var h = norm(p.t + " " + p.d + " " + p.k), s = 0;
      t.forEach(function (w) { if (h.indexOf(w) !== -1) s++; });
      return { p: p, s: s };
    }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 6);
    if (!res.length) {
      caja.innerHTML = '<p class="sc-bus-ayuda">No encontramos "' + esc(q) + '". Probá con otra palabra o <a href="' + wa("Hola, estoy buscando: " + q) + '" target="_blank" rel="noopener">preguntanos por WhatsApp</a>.</p>';
      return;
    }
    caja.innerHTML = '<ul class="sc-bus-lista">' + res.map(function (r) {
      return '<li><a href="' + r.p.u + '"><b>' + esc(r.p.t) + '</b><span>' + esc(r.p.d) + '</span></a></li>';
    }).join("") + "</ul>";
  }

  var pedido = 0;
  function consultarDominio(v) {
    var dom = limpiarDominio(v);
    var t = tld(dom);
    var n = ++pedido;
    if (TLD_CONFIABLES.indexOf(t) === -1) {
      caja.innerHTML = '<div class="sc-bus-dom"><p><b>' + esc(dom) + '</b></p><p class="sc-bus-ayuda">Los dominios .' + esc(t) + ' no se pueden consultar desde acá. Escribinos y lo revisamos por vos.</p><button type="button" class="sc-bus-btn" data-proyecto="' + esc(dom) + '" data-motivo="consultar">Consultarlo con nosotros</button></div>';
      return;
    }
    caja.innerHTML = '<p class="sc-bus-ayuda">Consultando <b>' + esc(dom) + '</b>…</p>';
    var ctrl = window.AbortController ? new AbortController() : null;
    var tope = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    fetch("https://rdap.org/domain/" + encodeURIComponent(dom), ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) {
        clearTimeout(tope);
        if (n !== pedido) return;
        if (r.status === 404) { libre(dom, false); return; }
        if (!r.ok) throw new Error("rdap " + r.status);
        return r.json().then(function (d) {
          if (n !== pedido) return;
          var vence = "", alta = "";
          (d.events || []).forEach(function (e) {
            if (e.eventAction === "expiration") vence = fecha(e.eventDate);
            if (e.eventAction === "registration") alta = fecha(e.eventDate);
          });
          var ns = (d.nameservers || []).map(function (x) { return (x.ldhName || "").toLowerCase(); }).filter(Boolean);
          caja.innerHTML = '<div class="sc-bus-dom ocupado"><span class="sc-bus-estado">Registrado</span><p><b>' + esc(dom) + '</b> ya tiene dueño.</p><dl>' +
            (alta ? "<dt>Registrado el</dt><dd>" + esc(alta) + "</dd>" : "") +
            (vence ? "<dt>Vence el</dt><dd>" + esc(vence) + "</dd>" : "") +
            (ns.length ? "<dt>Servidores</dt><dd>" + esc(ns.join(", ")) + "</dd>" : "") +
            '</dl><button type="button" class="sc-bus-btn sec" data-proyecto="' + esc(dom) + '" data-motivo="alternativas">Buscar alternativas y arrancar un proyecto</button></div>';
        });
      })
      .catch(function () {
        clearTimeout(tope);
        if (n !== pedido) return;
        /* NIC Argentina responde el 404 (dominio no registrado) sin cabecera
           CORS, así que el navegador lo ve como error de red. Para
           distinguirlo de una caída real, se consulta un .ar que existe: si
           ese responde, el dominio buscado no está registrado. */
        if (/\.ar$/.test(dom)) {
          fetch("https://rdap.org/domain/nic.ar").then(function (r) {
            if (n !== pedido) return;
            if (r.ok) libre(dom, true); else sinRespuesta(dom);
          }).catch(function () { if (n === pedido) sinRespuesta(dom); });
          return;
        }
        sinRespuesta(dom);
      });
  }

  function libre(dom, ar) {
    caja.innerHTML = '<div class="sc-bus-dom libre"><span class="sc-bus-estado">✓ Disponible</span><p><b>' + esc(dom) + '</b> ' +
      (ar ? 'no figura registrado en NIC Argentina.' : 'está libre para registrar.') +
      '</p><button type="button" class="sc-bus-btn" data-proyecto="' + esc(dom) + '" data-motivo="registrar">Registrarlo y empezar mi proyecto</button></div>';
  }
  function sinRespuesta(dom) {
    caja.innerHTML = '<p class="sc-bus-ayuda">No pudimos consultar <b>' + esc(dom) + '</b> ahora. <button type="button" class="sc-bus-link" data-proyecto="' + esc(dom) + '" data-motivo="consultar">Dejanos tus datos y lo revisamos</button>.</p>';
  }

  /* ------------------------------------------------------------------
     Formulario de nuevo proyecto (reemplaza el paso directo a WhatsApp).
     A DÓNDE VAN LOS DATOS: el sitio es estático, así que hace falta un
     receptor. Cuando esté el mail de la agencia se completa ENDPOINT (un
     Apps Script propio o Formspree) y la consulta llega por mail y a una
     planilla. Mientras ENDPOINT esté vacío, el envío arma el mensaje con
     todos los datos y lo abre en el WhatsApp de Studio Complex, para que
     ninguna consulta se pierda.
     ------------------------------------------------------------------ */
  var ENDPOINT = ""; /* URL del receptor de formularios, cuando exista */
  var MOTIVOS = {
    registrar: "Quiero registrar este dominio y arrancar un proyecto.",
    alternativas: "El dominio está ocupado: quiero ver alternativas y arrancar un proyecto.",
    consultar: "Quiero saber si este dominio está disponible."
  };

  function formProyecto(dom, motivo) {
    caja.innerHTML =
      '<form class="sc-bus-form" novalidate>' +
        '<h3>Tu nuevo proyecto</h3>' +
        '<p class="sc-bus-ayuda">' + esc(MOTIVOS[motivo] || MOTIVOS.registrar) + ' Te respondemos en 24 horas hábiles.</p>' +
        '<div class="sc-bus-campos">' +
          '<label>Dominio<input name="dominio" value="' + esc(dom) + '" autocomplete="off"></label>' +
          '<label>¿Qué querés armar?<select name="proyecto">' +
            '<option>Sitio web</option><option>Tienda online</option><option>Landing page</option><option>Solo registrar el dominio</option><option>Todavía no sé</option>' +
          '</select></label>' +
          '<label>Nombre *<input name="nombre" autocomplete="name" required></label>' +
          '<label>Email *<input name="email" type="email" autocomplete="email" required></label>' +
          '<label>WhatsApp<input name="telefono" type="tel" autocomplete="tel" placeholder="Opcional"></label>' +
          '<label class="ancho">Contanos en dos líneas<textarea name="mensaje" rows="3" placeholder="Qué vendés, para quién, y si ya tenés algo armado"></textarea></label>' +
        '</div>' +
        '<p class="sc-bus-error" hidden>Completá tu nombre y un email válido.</p>' +
        '<button type="submit" class="sc-bus-btn">Enviar</button>' +
      '</form>';
    var f = caja.querySelector("form");
    f.querySelector('[name="nombre"]').focus();
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = {};
      Array.prototype.forEach.call(f.elements, function (el) { if (el.name) d[el.name] = el.value.trim(); });
      var ok = d.nombre && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
      f.querySelector(".sc-bus-error").hidden = !!ok;
      if (!ok) return;
      d.motivo = MOTIVOS[motivo] || "";
      d.origen = "Buscador de dominios · " + location.pathname;
      var gracias = function () {
        if (window.scEvento) window.scEvento("generate_lead", { lead_source: "buscador_dominios" });
        caja.innerHTML = '<div class="sc-bus-dom libre"><span class="sc-bus-estado">✓ Recibido</span><p>Gracias, ' + esc(d.nombre.split(" ")[0]) + '. Te escribimos a <b>' + esc(d.email) + '</b> en las próximas 24 horas hábiles.</p></div>';
      };
      if (ENDPOINT) {
        fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) })
          .then(gracias).catch(gracias);
        return;
      }
      var txt = "Hola! Consulta desde la web.\n" +
        "Dominio: " + d.dominio + "\nProyecto: " + d.proyecto + "\n" + d.motivo + "\n" +
        "Nombre: " + d.nombre + "\nEmail: " + d.email + (d.telefono ? "\nWhatsApp: " + d.telefono : "") +
        (d.mensaje ? "\n\n" + d.mensaje : "");
      window.open(wa(txt), "_blank", "noopener");
      gracias();
    });
  }

  caja.addEventListener("click", function (e) {
    var b = e.target.closest("[data-proyecto]");
    if (!b) return;
    formProyecto(b.getAttribute("data-proyecto"), b.getAttribute("data-motivo"));
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    if (pareceDominio(v)) consultarDominio(v); else buscarSitio(v);
  });

  /* En el teléfono la lupa del encabezado no se ve: el buscador está en el
     menú hamburguesa, que era el de la plantilla y no hacía nada. Ahora
     cierra el menú y abre este mismo buscador con lo que se escribió. */
  var hamb = document.querySelector(".hamburger_search form");
  if (hamb) {
    var hInput = hamb.querySelector("input");
    var hTitulo = document.querySelector(".hamburger-search-area .hamburger-title");
    if (hTitulo) hTitulo.textContent = "Empezá por un dominio";
    if (hInput) {
      hInput.placeholder = "tuempresa.com.ar";
      hInput.setAttribute("aria-label", "Consultar un dominio o buscar en el sitio");
    }
    hamb.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = hInput ? hInput.value.trim() : "";
      [".hamburger-area", ".tj-offcanvas-area", ".body-overlay"].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) el.classList.remove("opened");
      });
      popup.classList.add("search-opened");
      var capa = document.querySelector(".search-popup-overlay");
      if (capa) capa.classList.add("opened");
      input.value = v;
      if (v) {
        if (pareceDominio(v)) consultarDominio(v); else buscarSitio(v);
      } else {
        input.focus();
      }
    });
  }
})();
