/* ==========================================================================
   Studio Complex · Aviso de cookies
   --------------------------------------------------------------------------
   Muestra la barra de abajo una sola vez. Cuando la persona toca "Entendido"
   se guarda esa marca en el navegador y no vuelve a aparecer.

   Lo único que se guarda es que el aviso ya se cerró. No hay analítica ni
   pixeles en el sitio: si mañana se suman, este archivo es el lugar donde
   enganchar el consentimiento antes de que carguen.

   No usa requestAnimationFrame: en algunos navegadores del equipo no llega a
   dispararse y el aviso quedaba invisible. Se fuerza un reflow, igual que en
   sc-modal.js.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE = "sc-cookies-ok";

  function iniciar() {
    var aviso = document.getElementById("sc-cookies");
    if (!aviso) return;

    var yaCerrado = false;
    try {
      yaCerrado = window.localStorage.getItem(CLAVE) === "1";
    } catch (e) {
      // Navegación privada con almacenamiento bloqueado: se muestra igual.
      yaCerrado = false;
    }
    if (yaCerrado) return;

    aviso.hidden = false;
    document.body.classList.add("sc-cookies-visible");
    void aviso.offsetHeight; // fuerza el reflow para que la transición corra
    aviso.classList.add("is-visible");

    var boton = aviso.querySelector(".sc-cookies-ok");
    if (!boton) return;

    boton.addEventListener("click", function () {
      aviso.classList.remove("is-visible");
      document.body.classList.remove("sc-cookies-visible");
      try {
        window.localStorage.setItem(CLAVE, "1");
      } catch (e) {
        // Si no se puede guardar, el aviso vuelve en la próxima visita.
      }
      window.setTimeout(function () {
        aviso.hidden = true;
      }, 350);
    });
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
