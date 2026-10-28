/* ==========================================================================
   Studio Complex · Ventana de contacto
   --------------------------------------------------------------------------
   Abre el formulario en una ventana sobre el sitio, con el fondo desenfocado.
   Se dispara desde cualquier elemento que lleve data-sc-modal.

   A DÓNDE VAN LOS DATOS
   El sitio es estático en GitHub Pages: no hay servidor que reciba un POST.
   Por eso el envío arma un mensaje de WhatsApp con los datos cargados y lo
   abre en el chat de Studio Complex. La consulta llega igual y sin depender
   de nada más.

   Para que en cambio caiga en una planilla o en un mail, como hace la landing
   de nudge scan, alcanza con completar ENDPOINT más abajo con la URL de un
   Apps Script propio de Studio Complex. Si tiene valor, se usa eso en lugar
   de WhatsApp. No conviene reusar el Apps Script de nudge: mezclaría los
   contactos de las dos agencias en la misma planilla.
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP = "5491153362945";
  var ENDPOINT = "assets/mail/lead-intake.php"; /* receptor de la web: carga el lead en el CRM */

  var modal = document.getElementById("sc-modal-contacto");
  if (!modal) return;

  var caja = modal.querySelector(".sc-modal-caja");
  var form = modal.querySelector("form");
  var abierto = Date.now(); /* para descartar bots que envían en menos de 1,5 s */
  var ultimoFoco = null;

  /* ---------------------------------------------------------------- abrir */
  document.addEventListener("click", function (e) {
    var disparador = e.target.closest("[data-sc-modal]");
    if (!disparador) return;
    e.preventDefault();
    abrir(disparador);
  });

  function abrir(disparador) {
    abierto = Date.now();
    ultimoFoco = disparador || document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    /* Leer offsetHeight fuerza un recálculo, así la transición arranca desde
       el estado inicial y no salta.

       No se usa requestAnimationFrame para esto. Se probó y en un navegador
       donde rAF no dispara la ventana quedaba abierta pero con opacidad 0:
       invisible, y con la página bloqueada detrás. Peor que no tener
       animación. Esto es síncrono y no puede quedar a medias. */
    void modal.offsetHeight;
    modal.classList.add("is-abierto");

    var primero = modal.querySelector("input, textarea");
    if (primero) primero.focus();
  }

  function cerrar() {
    modal.classList.remove("is-abierto");
    document.body.style.overflow = "";
    setTimeout(function () {
      modal.hidden = true;
    }, 280);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  /* ---------------------------------------------------------------- cerrar */
  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-sc-cerrar]") || !e.target.closest(".sc-modal-caja")) cerrar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) cerrar();
    if (e.key === "Tab" && !modal.hidden) atraparFoco(e);
  });

  /* El foco no se escapa al sitio de atrás mientras la ventana está abierta */
  function atraparFoco(e) {
    var focos = caja.querySelectorAll("button, input, textarea, a[href]");
    if (!focos.length) return;
    var primero = focos[0];
    var ultimo = focos[focos.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  /* ---------------------------------------------------------------- enviar */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var datos = {
      nombre: valor("sc-nombre"),
      email: valor("sc-email"),
      whatsapp: valor("sc-whatsapp"),
      mensaje: valor("sc-mensaje")
    };

    var hayError = false;
    if (!datos.nombre) { marcar("sc-nombre", true); hayError = true; } else marcar("sc-nombre", false);
    if (!datos.email || datos.email.indexOf("@") < 1) { marcar("sc-email", true); hayError = true; } else marcar("sc-email", false);
    if (!datos.whatsapp) { marcar("sc-whatsapp", true); hayError = true; } else marcar("sc-whatsapp", false);
    if (hayError) return;

    if (ENDPOINT) {
      enviarAlServidor(datos);
    } else {
      abrirWhatsApp(datos);
    }
  });

  function valor(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function marcar(id, conError) {
    var campo = document.getElementById(id).closest(".sc-campo");
    campo.classList.toggle("tiene-error", conError);
  }

  function abrirWhatsApp(d) {
    var texto =
      "Hola! Les escribo desde la web.\n\n" +
      "Nombre: " + d.nombre + "\n" +
      "Email: " + d.email + "\n" +
      "WhatsApp: " + d.whatsapp + "\n" +
      (d.mensaje ? "\nQué necesito: " + d.mensaje + "\n" : "") +
      "\nVengo de: " + document.title;
    if (window.scEvento) window.scEvento("generate_lead", { lead_source: "modal_contanos_tu_caso_whatsapp" });
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    cerrar();
  }

  function enviarAlServidor(d) {
    var boton = form.querySelector(".sc-modal-enviar");
    var textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Enviando…";
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ tipo: "form", form: "modal", origen: document.title, pagina: location.pathname, t: Date.now() - abierto, web: "" }, d))
    })
      .then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        if (window.scEvento) window.scEvento("generate_lead", { lead_source: "modal_contanos_tu_caso" });
        form.innerHTML =
          '<p class="sc-modal-intro" style="margin:0;text-align:center;">' +
          "Listo, recibimos tu consulta. Te escribimos a la brevedad.</p>";
      })
      .catch(function () {
        boton.disabled = false;
        boton.textContent = textoOriginal;
        abrirWhatsApp(d);
      });
  }
})();
