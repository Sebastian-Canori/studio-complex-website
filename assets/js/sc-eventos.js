/* ==========================================================================
   Studio Complex · Eventos de conversión (GA4)
   --------------------------------------------------------------------------
   Expone window.scEvento(nombre, parametros) y mide los clics que importan:
     click_whatsapp  → cualquier enlace a wa.me
     click_agenda    → cualquier enlace a agenda.html
     click_tel       → enlaces tel:
     click_email     → enlaces mailto:
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
    },
    true
  );
})();
