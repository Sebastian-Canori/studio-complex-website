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
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE = "sc-consent";
  var GA_ID = "G-4B82XMYNSR";

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
    } catch (e) {
      // Si no se puede guardar, el aviso vuelve en la próxima visita.
    }
  }

  function aplicar(valor) {
    if (valor === "granted") {
      if (typeof window.scCargarAnalitica === "function") window.scCargarAnalitica();
      if (window.clarity) window.clarity("consent", true);
    } else {
      window["ga-disable-" + GA_ID] = true;
      if (window.clarity) window.clarity("consent", false);
    }
  }

  function iniciar() {
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

    if (leer() === null) mostrar();
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

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var boton = form.querySelector('button[type="submit"]');
        var texto = boton ? boton.querySelector(".btn-text") : null;
        var original = texto ? texto.textContent : null;

        if (boton) boton.disabled = true;

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
            if (texto) texto.textContent = data.status === "success" ? "¡Listo!" : "Reintentar";
            if (data.status === "success") form.reset();
          })
          .catch(function () {
            if (texto) texto.textContent = "Error, reintentá";
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
