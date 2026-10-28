/* ==========================================================================
   Studio Complex · Eventos de conversión (GA4)
   --------------------------------------------------------------------------
   Expone window.scEvento(nombre, parametros) y mide los clics que importan:
     click_whatsapp  → cualquier enlace a wa.me
     click_agenda    → cualquier enlace a agenda.html
     click_tel       → enlaces tel:
     click_email     → enlaces mailto:
   Además cada uno de esos clics se cuenta como interacción sin datos en el panel (scInteraccion).
   Los formularios llaman a scEvento("generate_lead", { lead_source }) cuando
   el envío salió bien (contact-form.js, sc-modal.js, sc-buscador.js).

   gtag solo existe si la persona aceptó las cookies de analítica (ver
   sc-cookies.js). Sin consentimiento, scEvento no hace nada. Nunca se envían
   datos personales: solo el tipo de evento y desde qué zona de la página.
   ========================================================================== */

(function () {
  "use strict";

  window.scEvento = function (nombre, parametros) {
    try {
      if (typeof window.gtag === "function") window.gtag("event", nombre, parametros || {});
    } catch (e) {
      // La medición nunca debe romper la página.
    }
  };


  /* Interacciones sin datos: cada clic en WhatsApp, agenda, teléfono o mail se cuenta en el panel de clientes
     (Solicitudes web > Interacciones) para ver la demanda aunque la persona no deje nombre. Sin cookies ni IP,
     sin datos personales: solo canal, zona de la página, ruta y el tema del botón. No depende de las cookies de
     analítica porque no identifica a nadie. */
  var CANALES = { click_whatsapp: "whatsapp", click_agenda: "agenda", click_tel: "telefono", click_email: "email" };
  var ultimo = {};

  window.scInteraccion = function (evento, a, href) {
    try {
      if (navigator.webdriver) return;
      var canal = CANALES[evento];
      if (!canal) return;
      var clave = canal + "|" + href;
      var ahora = Date.now();
      if (ultimo[clave] && ahora - ultimo[clave] < 5000) return; // doble clic
      ultimo[clave] = ahora;
      var tema = "";
      if (canal === "whatsapp") {
        var m = href.match(/[?&]text=([^&#]*)/);
        if (m) { try { tema = decodeURIComponent(m[1].replace(/\+/g, " ")); } catch (e) { tema = ""; } }
      } else if (canal === "agenda") {
        tema = "Agendar reunión";
      }
      var datos = JSON.stringify({ tipo: "interaccion", canal: canal, zona: zona(a), pagina: location.pathname, tema: tema.slice(0, 100) });
      var blob = new Blob([datos], { type: "text/plain;charset=UTF-8" });
      if (!(navigator.sendBeacon && navigator.sendBeacon("assets/mail/lead-intake.php", blob))) {
        fetch("assets/mail/lead-intake.php", { method: "POST", body: datos, keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" } });
      }
    } catch (e) {
      // La medición nunca debe romper la página.
    }
  };

  function zona(el) {
    if (el.closest("header, .header-area, .tj-header")) return "header";
    if (el.closest("footer, .footer-area, .tj-footer")) return "footer";
    if (el.closest(".sc-modal")) return "modal";
    return "contenido";
  }

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      var nombre = null;
      if (href.indexOf("wa.me/") !== -1 || href.indexOf("api.whatsapp.com") !== -1) nombre = "click_whatsapp";
      else if (/(^|\/)agenda\.html(\?|#|$)/.test(href)) nombre = "click_agenda";
      else if (href.indexOf("tel:") === 0) nombre = "click_tel";
      else if (href.indexOf("mailto:") === 0) nombre = "click_email";
      if (!nombre) return;
      window.scEvento(nombre, { link_location: zona(a), page_path: location.pathname });
      window.scInteraccion(nombre, a, href);
    },
    true
  );
})();
