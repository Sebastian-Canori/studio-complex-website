/* ==========================================================================
   Studio Complex · Aviso de cookies y consentimiento de analítica
   --------------------------------------------------------------------------
   Pregunta una sola vez si se acepta la analítica (Google Analytics y
   Microsoft Clarity). La decisión se guarda en el navegador con la clave
   "sc-consent" ("granted" o "denied"). Hasta que no se acepta, esas
   herramientas no se cargan: el snippet de cada <head> expone
   window.scCargarAnalitica y este archivo la llama solo al aceptar.

   Desde cookies.html, un botón con data-sc-cookies-abrir permite cambiar la
   decisión. Si se rechaza después de haber aceptado, se corta la medición en
   el momento y el cambio rige por completo desde la próxima página.

   No usa requestAnimationFrame: en algunos navegadores del equipo no llega a
   dispararse y el aviso quedaba invisible. Se fuerza un reflow, igual que en
   sc-modal.js.

   2026-11 (English, per repo rule for new code): the same consent now also
   loads the Meta pixel (dataset 1880635999759892) on the production host.
   «sc-consent-version» = "2" marks a decision taken after the pixel was
   added: people who had accepted before are asked again, as cookies.html
   promises. People who had rejected stay rejected and nothing loads.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE = "sc-consent";
  var GA_ID = "G-4B82XMYNSR";
  var VERSION_KEY = "sc-consent-version";
  var CURRENT_VERSION = "2"; // 2 = the decision already covers the Meta pixel
  var META_PIXEL_ID = "1880635999759892";

  function isProductionHost() {
    return /(^|\.)studiocomplex\.com\.ar$/.test(window.location.hostname);
  }

  function versionIsCurrent() {
    try {
      return window.localStorage.getItem(VERSION_KEY) === CURRENT_VERSION;
    } catch (e) {
      return false;
    }
  }

  // Standard Meta base code, only after consent and only on the production host.
  function loadMetaPixel() {
    if (!isProductionHost() || window.fbq) return;
    var fbq = (window.fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
    if (/\/agenda\.html$/.test(window.location.pathname)) {
      fbq("track", "ViewContent", { content_name: "agenda" });
    }
  }

  function trackMeta() {
    if (typeof window.fbq === "function") window.fbq.apply(null, arguments);
  }

  // WhatsApp and e-mail links count as Contact, links to the agenda as a custom
  // event, and a valid submit of the contact forms as Lead. Without consent
  // window.fbq does not exist and nothing is sent.
  function watchActions() {
    document.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!link) return;
      var href = link.getAttribute("href") || "";
      if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) trackMeta("track", "Contact", { content_name: "whatsapp" });
      else if (/^mailto:/i.test(href)) trackMeta("track", "Contact", { content_name: "email" });
      else if (/agenda\.html/i.test(href)) trackMeta("trackCustom", "AgendaClick");
    }, true);
    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form || !/^contact-form(-2)?$/.test(form.id || "")) return;
      if (form.checkValidity && !form.checkValidity()) return;
      trackMeta("track", "Lead", { content_name: form.id });
    }, true);
  }

  function leer() {
    try {
      return window.localStorage.getItem(CLAVE);
    } catch (e) {
      return null; // almacenamiento bloqueado: se pregunta igual
    }
  }

  function guardar(valor) {
    try {
      window.localStorage.setItem(CLAVE, valor);
      window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (e) {
      // Si no se puede guardar, el aviso vuelve en la próxima visita.
    }
  }

  function aplicar(valor) {
    if (valor === "granted") {
      if (typeof window.scCargarAnalitica === "function") window.scCargarAnalitica();
      if (window.clarity) window.clarity("consent", true);
      loadMetaPixel();
    } else {
      window["ga-disable-" + GA_ID] = true;
      if (window.clarity) window.clarity("consent", false);
      if (typeof window.fbq === "function") window.fbq("consent", "revoke");
    }
  }

  function iniciar() {
    watchActions();
    if (leer() === "granted" && versionIsCurrent()) loadMetaPixel();

    var aviso = document.getElementById("sc-cookies");
    if (!aviso) return;

    function mostrar() {
      aviso.hidden = false;
      document.body.classList.add("sc-cookies-visible");
      void aviso.offsetHeight; // fuerza el reflow para que la transición corra
      aviso.classList.add("is-visible");
    }

    function cerrar() {
      aviso.classList.remove("is-visible");
      document.body.classList.remove("sc-cookies-visible");
      window.setTimeout(function () {
        aviso.hidden = true;
      }, 350);
    }

    function decidir(valor) {
      guardar(valor);
      aplicar(valor);
      cerrar();
    }

    var si = aviso.querySelector(".sc-cookies-ok");
    var no = aviso.querySelector(".sc-cookies-no");
    if (si) si.addEventListener("click", function () { decidir("granted"); });
    if (no) no.addEventListener("click", function () { decidir("denied"); });

    document.querySelectorAll("[data-sc-cookies-abrir]").forEach(function (el) {
      el.addEventListener("click", mostrar);
    });

    // Ask when there is no decision yet, or when the acceptance predates the pixel.
    if (leer() === null || (leer() === "granted" && !versionIsCurrent())) mostrar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();

/* Suscripcion al newsletter del footer -> Newsletter del panel.

   No tiene relacion con el aviso de cookies: se agrega aca porque este
   archivo es el unico script propio que se carga en todas las paginas del
   sitio, asi se evita editar el HTML de cada una.

   - El formulario del pie (.subscribe-form) suma nombre, WhatsApp y la casilla
     "Acepto recibir las novedades" y manda todo al panel:
     POST /panel/?rest_route=/ndg/v1/newsletter (ver includes/newsletter.php
     del panel). Queda "Sin confirmar" hasta que la persona toca el boton del
     mail de bienvenida, que manda el panel.
   - El panel devuelve a la persona a la home con ?newsletter=confirmado|baja|error
     o ?baja=<clave>. Ese resultado se muestra en una ventana; la baja se
     confirma con un boton (POST), asi los antivirus que abren links no dan
     de baja a nadie. */
(function () {
  "use strict";

  var SITE_KEY = "6LfoP9YtAAAAAFOiebw8ebHGJXZeSUwt8EmJxgk4";
  var API = "/panel/?rest_route=/ndg/v1/newsletter";
  var recaptchaListo = null;

  function cargarRecaptcha() {
    if (recaptchaListo) return recaptchaListo;
    recaptchaListo = new Promise(function (resolve) {
      if (window.grecaptcha && window.grecaptcha.execute) {
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=" + SITE_KEY;
      script.onload = function () {
        grecaptcha.ready(resolve);
      };
      document.head.appendChild(script);
    });
    return recaptchaListo;
  }

  function crear(tag, props, estilo) {
    var el = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "texto") el.textContent = props[k];
      else el.setAttribute(k, props[k]);
    });
    if (estilo) el.style.cssText = estilo;
    return el;
  }

  var ESTILO_CAMPO =
    "width:100%;box-sizing:border-box;padding:12px 16px;border-radius:999px;border:1px solid rgba(11,14,20,.25);" +
    "background:#fff;color:#0b0e14;font:inherit;font-size:15px;outline:none";

  function iniciarFormulario(form) {
    var email = form.querySelector('input[name="email"]');
    if (!email) return;
    email.setAttribute("autocomplete", "email");
    email.required = true;

    var abierto = Date.now();

    // Nombre y WhatsApp, debajo del campo de mail.
    var extra = crear("div", { class: "sc-newsletter-extra" },
      "display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:12px");
    var nombre = crear("input", { type: "text", name: "nombre", placeholder: "Tu nombre", autocomplete: "name", "aria-label": "Tu nombre", required: "" }, ESTILO_CAMPO);
    var telefono = crear("input", { type: "tel", name: "telefono", placeholder: "WhatsApp", autocomplete: "tel", "aria-label": "WhatsApp con código de área", required: "" }, ESTILO_CAMPO);
    extra.appendChild(nombre);
    extra.appendChild(telefono);
    form.appendChild(extra);

    // Trampa para bots: invisible para personas.
    var trampa = crear("input", { type: "text", name: "web", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" },
      "position:absolute;left:-9999px;width:1px;height:1px;opacity:0");
    form.appendChild(trampa);

    var etiqueta = crear("label", { class: "sc-newsletter-acepta" },
      "display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:13px;line-height:1.45;color:#0b0e14;cursor:pointer");
    var acepta = crear("input", { type: "checkbox", name: "acepta", value: "1", required: "" }, "margin-top:2px;flex:none");
    etiqueta.appendChild(acepta);
    etiqueta.appendChild(crear("span", {
      texto: "Acepto recibir las novedades de Studio Complex por mail. Te vamos a pedir que confirmes tu mail y podés darte de baja cuando quieras."
    }));
    form.appendChild(etiqueta);

    var mensaje = crear("p", { class: "sc-newsletter-mensaje", role: "status", "aria-live": "polite" },
      "margin:12px 0 0;padding:10px 14px;border-radius:8px;font-size:15px;line-height:1.45;font-weight:500");
    mensaje.hidden = true;
    form.appendChild(mensaje);

    function mostrar(texto, ok) {
      mensaje.textContent = texto;
      mensaje.style.background = ok ? "#e7f6ec" : "#fdecec";
      mensaje.style.color = ok ? "#14532d" : "#7f1d1d";
      mensaje.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (nombre.value.trim().length < 2) return mostrar("Escribí tu nombre.", false);
      if (!email.value.trim() || email.value.indexOf("@") < 1) return mostrar("Revisá el email.", false);
      var digitos = telefono.value.replace(/\D/g, "");
      if (digitos.length < 8 || digitos.length > 15) return mostrar("Revisá el WhatsApp (con código de área).", false);
      if (!acepta.checked) return mostrar("Para suscribirte, aceptá recibir las novedades.", false);

      var boton = form.querySelector('button[type="submit"]');
      var texto = boton ? boton.querySelector(".btn-text") : null;
      var original = texto ? texto.textContent : null;
      if (boton) boton.disabled = true;
      mensaje.hidden = true;

      var campana = window.scOrigenCampana ? window.scOrigenCampana() : {};

      cargarRecaptcha()
        .then(function () {
          return grecaptcha.execute(SITE_KEY, { action: "newsletter" });
        })
        .then(function (token) {
          return fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: nombre.value.trim(),
              email: email.value.trim(),
              telefono: telefono.value.trim(),
              acepta: true,
              rc: token,
              web: trampa.value,
              t: Date.now() - abierto,
              pagina: window.location.href.split("#")[0],
              donde: "pie",
              origen: {
                utm_source: campana.utm_source || "",
                utm_medium: campana.utm_medium || "",
                utm_campaign: campana.utm_campaign || "",
                utm_content: campana.utm_content || "",
                referrer: document.referrer || "",
                gclid: campana.gclid || "",
                fbclid: campana.fbclid || ""
              }
            })
          });
        })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data || {} };
          });
        })
        .then(function (r) {
          if (r.ok) {
            if (texto) texto.textContent = "¡Listo!";
            mostrar(
              r.data.estado === "ya"
                ? "¡Ya estabas suscripto! Te reenviamos por mail el acceso a tu panel."
                : "¡Gracias por suscribirte! Te mandamos un mail: tocá el botón para confirmar tu suscripción.",
              true
            );
            form.reset();
            if (window.scEvento) window.scEvento("generate_lead", { lead_source: "newsletter" });
          } else {
            if (texto) texto.textContent = "Reintentar";
            mostrar(r.data.message || "No se pudo procesar la suscripción. Intentá nuevamente.", false);
          }
        })
        .catch(function () {
          if (texto) texto.textContent = "Error, reintentá";
          mostrar("No se pudo procesar la suscripción. Probá de nuevo en unos minutos.", false);
        })
        .finally(function () {
          if (boton) boton.disabled = false;
          if (texto && original) {
            setTimeout(function () {
              texto.textContent = original;
            }, 4000);
          }
        });
    });
  }

  /* ---------- Resultado al volver del mail (confirmación o baja) ---------- */

  function ventana(titulo, html) {
    var fondo = crear("div", { role: "dialog", "aria-modal": "true", "aria-label": titulo, class: "sc-newsletter-ventana" },
      "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(11,14,20,.55)");
    var caja = crear("div", {},
      "background:#fff;color:#0b0e14;max-width:440px;width:100%;box-sizing:border-box;padding:32px 28px;border-radius:16px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);font-size:16px;line-height:1.55");
    caja.innerHTML = '<h2 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:#0b0e14">' + titulo + "</h2>" + html;
    var cerrar = crear("button", { type: "button", texto: "Cerrar" },
      "margin-top:18px;background:none;border:0;color:#3b4150;font:inherit;font-size:14px;text-decoration:underline;cursor:pointer");
    caja.appendChild(cerrar);
    fondo.appendChild(caja);
    function sacar() {
      fondo.remove();
      document.body.style.overflow = "";
    }
    cerrar.addEventListener("click", sacar);
    fondo.addEventListener("click", function (e) {
      if (e.target === fondo) sacar();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") sacar();
    });
    document.body.appendChild(fondo);
    document.body.style.overflow = "hidden";
    var foco = caja.querySelector("button");
    if (foco) foco.focus();
  }

  function limpiarUrl() {
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete("newsletter");
      url.searchParams.delete("baja");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) {}
  }

  function mostrarResultado() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return;
    }
    var clave = params.get("baja");
    var estado = params.get("newsletter");
    if (!clave && !estado) return;
    limpiarUrl();
    var p = '<p style="margin:0;color:#3b4150">';

    if (clave && /^\d+\.[A-Za-z0-9]+$/.test(clave)) {
      ventana("¿Querés darte de baja?",
        p + "Vas a dejar de recibir el newsletter de Studio Complex.</p>" +
        '<form method="post" action="' + API + "/baja&k=" + encodeURIComponent(clave) + '&volver=1" style="margin:20px 0 0">' +
        '<button type="submit" style="border:0;border-radius:999px;padding:13px 26px;background:#0b0e14;color:#fff;font:inherit;font-weight:600;cursor:pointer">Sí, darme de baja</button></form>');
      return;
    }
    if (estado === "confirmado") {
      ventana("¡Listo, ya estás suscripto!", p + "Gracias por confiar en nuestras novedades. Cada mail trae un link para darte de baja cuando quieras.</p>");
    } else if (estado === "baja") {
      ventana("Te dimos de baja", p + "No vas a recibir más el newsletter. Si fue un error, podés volver a suscribirte desde el pie de cualquier página.</p>");
    } else if (estado === "error") {
      ventana("El link no es válido", p + 'Puede que esté incompleto o vencido. Escribinos a <a href="mailto:hola@studiocomplex.com.ar">hola@studiocomplex.com.ar</a> y lo resolvemos.</p>');
    }
  }

  function iniciar() {
    document.querySelectorAll(".subscribe-form form").forEach(iniciarFormulario);
    mostrarResultado();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();

/* Origen de campaña.

   Si la persona llega desde un anuncio o un link con parámetros de campaña
   (utm_*, gclid de Google Ads, fbclid de Meta), se guarda en sessionStorage:
   se borra al cerrar la pestaña y no sale del navegador. Solo viaja a nuestro
   servidor si envía el formulario de contacto (contact-form.js llama a
   window.scOrigenCampana). Una visita sin parámetros no pisa el dato guardado,
   así que navegar por el sitio no pierde la campaña. */
(function () {
  "use strict";

  var CLAVE = "sc-origen";
  var PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];

  function guardar() {
    var query;
    try {
      query = new URLSearchParams(window.location.search);
    } catch (e) {
      return;
    }
    var origen = {};
    var hay = false;
    PARAMS.forEach(function (nombre) {
      var valor = (query.get(nombre) || "").trim().slice(0, 200);
      if (valor) {
        origen[nombre] = valor;
        hay = true;
      }
    });
    if (!hay) return;
    // Solo la ruta de la página: la URL completa puede traer datos de más.
    origen.landing_page = window.location.pathname;
    try {
      window.sessionStorage.setItem(CLAVE, JSON.stringify(origen));
    } catch (e) {
      // Almacenamiento bloqueado: el formulario se envía igual, sin campaña.
    }
  }

  window.scOrigenCampana = function () {
    try {
      var guardado = JSON.parse(window.sessionStorage.getItem(CLAVE) || "{}");
      return guardado && typeof guardado === "object" ? guardado : {};
    } catch (e) {
      return {};
    }
  };

  guardar();
})();
