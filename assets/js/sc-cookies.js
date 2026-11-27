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

/* Suscripcion al newsletter del footer.

   No tiene relacion con el aviso de cookies: se agrega aca porque este
   archivo es el unico script propio que se carga (sin comentar) en las
   30 paginas del sitio, asi se evita editar el <script> de cada HTML.
   El formulario no tiene id: se toma por su contenedor .subscribe-form. */
(function () {
  "use strict";

  var SITE_KEY = "6LfoP9YtAAAAAFOiebw8ebHGJXZeSUwt8EmJxgk4";
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

  function iniciar() {
    /* Solo el bloque de suscripción. La ventana "Contanos tu caso" también
       tiene un campo name="email" y quedaba tomada por este envío. */
    document.querySelectorAll(".subscribe-form form").forEach(function (form) {
      var email = form.querySelector('input[name="email"]');
      if (!email) return;

      // Consent notice under the form (no HTML edit needed in each page).
      var aviso = document.createElement("small");
      aviso.className = "sc-newsletter-aviso";
      aviso.textContent =
        "Al suscribirte aceptás recibir novedades de Studio Complex. Guardamos tu email para eso y podés darte de baja cuando quieras desde el link de cada mail.";
      aviso.style.cssText = "display:block;margin-top:10px;font-size:13px;line-height:1.45;color:#0b0e14;opacity:1";
      form.appendChild(aviso);

      // Result message (thanks or error), read aloud by screen readers.
      var mensaje = document.createElement("p");
      mensaje.className = "sc-newsletter-mensaje";
      mensaje.setAttribute("role", "status");
      mensaje.setAttribute("aria-live", "polite");
      mensaje.hidden = true;
      mensaje.style.cssText =
        "margin:12px 0 0;padding:10px 14px;border-radius:8px;font-size:15px;line-height:1.45;font-weight:500";
      form.appendChild(mensaje);

      function mostrar(textoMensaje, ok) {
        mensaje.textContent = textoMensaje;
        mensaje.style.background = ok ? "#e7f6ec" : "#fdecec";
        mensaje.style.color = ok ? "#14532d" : "#7f1d1d";
        mensaje.hidden = false;
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var boton = form.querySelector('button[type="submit"]');
        var texto = boton ? boton.querySelector(".btn-text") : null;
        var original = texto ? texto.textContent : null;

        if (boton) boton.disabled = true;
        mensaje.hidden = true;

        cargarRecaptcha()
          .then(function () {
            return grecaptcha.execute(SITE_KEY, { action: "newsletter" });
          })
          .then(function (token) {
            return fetch("assets/mail/newsletter-form.php", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: "email=" + encodeURIComponent(email.value) + "&recaptcha_token=" + encodeURIComponent(token),
            });
          })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            var ok = data.status === "success";
            if (texto) texto.textContent = ok ? "¡Listo!" : "Reintentar";
            mostrar(
              data.message ||
                (ok
                  ? "¡Gracias por suscribirte! Te mandamos un mail de confirmación."
                  : "No se pudo procesar la suscripción. Intentá nuevamente."),
              ok
            );
            if (ok) {
              form.reset();
              if (window.scEvento) window.scEvento("generate_lead", { lead_source: "newsletter" });
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
    });
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
