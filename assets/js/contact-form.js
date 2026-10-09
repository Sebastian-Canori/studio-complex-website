(function ($) {
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

  cargarRecaptcha();

  var forms = [
    { formId: "#contact-form", messagesId: "#form-messages", action: "contact" },
    { formId: "#contact-form-2", messagesId: "#form-messages-2", action: "contact" },
  ];

  forms.forEach(function (cfg) {
    var $form = $(cfg.formId);
    var $messages = $(cfg.messagesId);

    if (!$form.length) return;

    $form.on("submit", function (e) {
      e.preventDefault();

      var $button = $form.find('button[type="submit"]');
      $button.prop("disabled", true);
      $messages.text("");

      cargarRecaptcha()
        .then(function () {
          return grecaptcha.execute(SITE_KEY, { action: cfg.action });
        })
        .then(function (token) {
          $.ajax({
            url: "assets/mail/contact-form.php",
            type: "POST",
            dataType: "json",
            data: $form.serialize() + "&recaptcha_token=" + encodeURIComponent(token),
          })
            .done(function (response) {
              $messages
                .text(response.message)
                .css("color", response.status === "success" ? "green" : "red");
              if (response.status === "success") {
                if (window.scEvento) window.scEvento("generate_lead", { lead_source: "formulario_contacto" });
                $form[0].reset();
                // Pagina de gracias: permite medir la conversion como vista de pagina.
                window.setTimeout(function () {
                  window.location.href = "gracias.html";
                }, 700);
              }
            })
            .fail(function () {
              $messages
                .text("No se pudo enviar el mensaje. Probá de nuevo en unos minutos o escribinos por WhatsApp.")
                .css("color", "red");
            })
            .always(function () {
              $button.prop("disabled", false);
            });
        });
    });
  });
})(jQuery);
