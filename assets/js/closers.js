(function ($) {
  "use strict";

  var SITE_KEY = "6LfoP9YtAAAAAFOiebw8ebHGJXZeSUwt8EmJxgk4";
  var recaptchaListo = null;

  // Dev copy and local preview have no PHP behind them: the forms simulate the
  // submit so the whole flow (legend + jump to stage 2) can be seen there.
  var MODO_PRUEBA = /^(dev\d*\.sebastiancanori\.com\.ar|localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)$/.test(window.location.hostname);

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

  if (!MODO_PRUEBA) cargarRecaptcha();

  // Same cut as closer-form.php: one year or more closing sales and sold to SME owners.
  function encajaPerfil($form) {
    var anios = $form.find('[name="clExperience"]').val();
    var pymes = $form.find('[name="clB2b"]').val() || "";
    return (anios === "De 1 a 3 años" || anios === "Más de 3 años") && pymes.indexOf("Sí") === 0;
  }

  function leyendaEtapa2(email) {
    var href = "closers-perfil.html?e=" + encodeURIComponent(email);
    return $(
      '<div class="sc-cl-leyenda">' +
        '<p class="sc-cl-leyenda-titulo">¿Creés que sos el postulante ideal?</p>' +
        "<p>Completá tu postulación con más datos y un video corto. Te lleva entre 15 y 20 minutos y nos ayuda a conocerte antes de la entrevista.</p>" +
        '<a class="tj-primary-btn"><span class="btn-text"><span>Completar mi postulación</span></span><span class="btn-icon"><i class="tji-arrow-right-2"></i></span></a>' +
        "</div>"
    )
      .find("a")
      .attr("href", href)
      .end();
  }

  // Stage 2: the email arrives in the link (?e=) and stays editable.
  var params = new URLSearchParams(window.location.search);
  var $perfil = $("#closer-perfil-form");
  if ($perfil.length && params.get("e")) {
    $perfil.find('[name="clEmail"]').val(params.get("e"));
  }

  var forms = [
    { formId: "#closer-form", messagesId: "#closer-messages", action: "closers", url: "assets/mail/closer-form.php", evento: "closer_etapa_1" },
    { formId: "#closer-perfil-form", messagesId: "#closer-perfil-messages", action: "closers_perfil", url: "assets/mail/closer-perfil.php", evento: "closer_etapa_2" },
  ];

  forms.forEach(function (cfg) {
    var $form = $(cfg.formId);
    var $messages = $(cfg.messagesId);
    if (!$form.length) return;

    function alEnviar(response) {
      var ok = response.status === "success";
      var $button = $form.find('button[type="submit"]');
      $messages.text(response.message).css("color", ok ? "green" : "red");
      if (!ok) {
        $button.prop("disabled", false);
        return;
      }
      var esEtapa1 = cfg.formId === "#closer-form";
      var encaja = esEtapa1 && encajaPerfil($form);
      var email = $form.find('[name="clEmail"]').val();
      if (window.scEvento) window.scEvento(cfg.evento, { pase_directo: encaja ? "si" : "no" });
      $form[0].reset();
      $button.prop("disabled", true);
      if (encaja) {
        var $leyenda = leyendaEtapa2(email);
        $messages.after($leyenda);
        $leyenda.find("a").trigger("focus");
      }
    }

    $form.on("submit", function (e) {
      e.preventDefault();
      if (!$form[0].reportValidity()) return;
      var $button = $form.find('button[type="submit"]');
      $button.prop("disabled", true);
      $messages.text("").css("color", "");
      $form.parent().find(".sc-cl-leyenda").remove();

      if (MODO_PRUEBA) {
        alEnviar({
          status: "success",
          message: cfg.formId === "#closer-form"
            ? "Modo prueba: no se envió nada. ¡Gracias! Revisamos tu postulación."
            : "Modo prueba: no se envió nada. ¡Recibimos tu perfil!",
        });
        return;
      }

      cargarRecaptcha()
        .then(function () {
          return grecaptcha.execute(SITE_KEY, { action: cfg.action });
        })
        .then(function (token) {
          $.ajax({
            url: cfg.url,
            type: "POST",
            dataType: "json",
            data: $form.serialize() + "&recaptcha_token=" + encodeURIComponent(token),
          })
            .done(alEnviar)
            .fail(function () {
              $messages
                .text("No se pudo enviar. Probá de nuevo en unos minutos o escribinos a hola@studiocomplex.com.ar.")
                .css("color", "red");
              $button.prop("disabled", false);
            });
        });
    });
  });
})(jQuery);
