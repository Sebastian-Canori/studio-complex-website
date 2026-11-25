/* Formulario de descarga de recursos gratis (lead magnets).

   Toma cada <form class="sc-recurso-form" data-recurso="..."> de la página,
   lo manda a assets/mail/recurso-form.php con reCAPTCHA v3 (acción "recurso")
   y la campaña de origen (window.scOrigenCampana, de sc-cookies.js), y al
   terminar muestra el botón de descarga. Mide generate_lead en GA4 con
   lead_source "recurso_<clave>" (solo si la persona aceptó las cookies). */
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

  function iniciar(form) {
    var recurso = form.getAttribute("data-recurso");
    var mensaje = form.querySelector(".sc-recurso-msj");
    var listo = document.getElementById(form.getAttribute("data-listo") || "");
    var boton = form.querySelector('button[type="submit"]');

    // La nota desde la que llegó (blog → recurso) viaja como ?desde=<slug>.
    var desde = "";
    try {
      desde = (new URLSearchParams(window.location.search).get("desde") || "").slice(0, 120);
    } catch (e) {}

    form.addEventListener("focusin", cargarRecaptcha, { once: true });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      boton.disabled = true;
      mensaje.textContent = "Enviando…";
      mensaje.className = "sc-recurso-msj";

      cargarRecaptcha()
        .then(function () {
          return grecaptcha.execute(SITE_KEY, { action: "recurso" });
        })
        .then(function (token) {
          var datos = new URLSearchParams(new FormData(form));
          datos.set("recurso", recurso);
          datos.set("nota", desde);
          datos.set("recaptcha_token", token);
          var origen = window.scOrigenCampana ? window.scOrigenCampana() : {};
          Object.keys(origen).forEach(function (k) {
            datos.set(k, origen[k]);
          });
          return fetch("assets/mail/recurso-form.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: datos.toString(),
          });
        })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          mensaje.textContent = data.message || "";
          if (data.status !== "success") {
            mensaje.className = "sc-recurso-msj error";
            return;
          }
          if (window.scEvento) window.scEvento("generate_lead", { lead_source: "recurso_" + recurso });
          if (listo) {
            var enlace = listo.querySelector("a[data-descarga]");
            if (enlace && data.descarga) enlace.href = data.descarga;
            form.hidden = true;
            listo.hidden = false;
            listo.focus();
          }
        })
        .catch(function () {
          mensaje.textContent = "No se pudo enviar. Probá de nuevo en unos minutos o escribinos por WhatsApp.";
          mensaje.className = "sc-recurso-msj error";
        })
        .finally(function () {
          boton.disabled = false;
        });
    });
  }

  function arrancar() {
    document.querySelectorAll("form.sc-recurso-form").forEach(iniciar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
