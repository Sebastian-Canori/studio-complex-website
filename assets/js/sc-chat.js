/* =========================================================================
   Complex — asistente flotante de Studio Complex
   Sin dependencias, sin backend: el sitio esta en GitHub Pages (hosting
   estatico), asi que el bot es guiado — responde con lo que realmente dice
   el sitio y deriva a WhatsApp cuando hace falta una persona.
   La conversacion se guarda en sessionStorage para que no se reinicie al
   cambiar de pagina.
   ========================================================================= */
(function () {
  "use strict";

  var WA_NUMBER = "5491153362945";
  var STORE_KEY = "sc-chat-v1";

  /* --- Contenido: todo sale de lo que ya dice el sitio ------------------ */
  var NODES = {
    inicio: {
      say: [
        "Hola 👋 Soy el asistente de Studio Complex.",
        "Contame qué estás necesitando y te oriento. Si preferís hablar con una persona, te paso el contacto directo.",
      ],
      chips: [
        { label: "Necesito una web", go: "web" },
        { label: "Quiero vender online", go: "tienda" },
        { label: "Quiero más consultas", go: "ads" },
        { label: "Automatizar el seguimiento", go: "automatizacion" },
        { label: "Hablar con una persona", go: "humano" },
      ],
    },

    web: {
      say: [
        "Desarrollamos el sitio a medida, no sobre una plantilla genérica: trabajamos sobre tu identidad de marca.",
        "Incluye la estructura pensada para convertir, el SEO técnico de base y la capacitación para que lo puedas editar vos.",
      ],
      chips: [
        { label: "¿Cuánto tarda?", go: "plazos" },
        { label: "¿Cuánto cuesta?", go: "precios" },
        { label: "¿Cómo trabajan?", go: "proceso" },
        { label: "Quiero cotizar", go: "humano" },
      ],
    },

    tienda: {
      say: [
        "Armamos tiendas sobre <b>Tiendanube</b>, <b>Shopify</b> y <b>WooCommerce</b>, con los cobros de <b>Mercado Pago</b> integrados.",
        "Si ya tenés una tienda andando, también la tomamos para rediseñarla o migrarla sin perder el catálogo.",
      ],
      chips: [
        { label: "¿Cuánto tarda?", go: "plazos" },
        { label: "¿Cuánto cuesta?", go: "precios" },
        { label: "¿Migran una tienda?", go: "migracion" },
        { label: "Quiero cotizar", go: "humano" },
      ],
    },

    ads: {
      say: [
        "Gestionamos campañas de Google Ads y Meta Ads: armado de la cuenta, medición, y reportes con los números que importan.",
        "Antes de pautar revisamos que el sitio esté listo para recibir ese tráfico — pagar clics hacia una página que no convierte es tirar plata.",
      ],
      chips: [
        { label: "¿Cómo se mide?", go: "medicion" },
        { label: "¿Cuánto cuesta?", go: "precios" },
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    automatizacion: {
      say: [
        "Automatizamos el seguimiento comercial con <b>n8n</b> y <b>Make</b>: cada consulta queda registrada, se responde sola cuando corresponde, y llega al equipo con el contexto.",
        "El criterio es simple: IA donde ahorra tiempo, criterio humano donde hace falta.",
      ],
      chips: [
        { label: "¿Con qué se integra?", go: "integraciones" },
        { label: "¿Cuánto cuesta?", go: "precios" },
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    plazos: {
      say: [
        "Una landing de captura la tenemos online en <b>48 horas</b>, siempre que el contenido ya esté definido.",
        "Un sitio completo o una tienda dependen del alcance y de la cantidad de productos. Te lo decimos con fecha concreta en la propuesta, no con un rango vago.",
      ],
      chips: [
        { label: "¿Cómo trabajan?", go: "proceso" },
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    precios: {
      say: [
        "No publicamos lista de precios: cada proyecto se cotiza según el alcance real, así no terminás pagando funciones que no vas a usar.",
        "La cotización sale sin cargo después de una charla corta donde entendemos el negocio.",
      ],
      chips: [
        { label: "Quiero la cotización", go: "humano" },
        { label: "¿Cómo trabajan?", go: "proceso" },
        { label: "Volver", go: "inicio" },
      ],
    },

    proceso: {
      say: [
        "Trabajamos en cinco pasos: <b>diagnóstico</b> → <b>propuesta</b> → <b>ejecución</b> → <b>entrega con capacitación</b> → <b>soporte</b>.",
        "Un solo interlocutor para toda la operación digital: no tenés que coordinar entre cinco proveedores distintos.",
      ],
      chips: [
        { label: "Ver la página completa", href: "index.html#servicios" },
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    integraciones: {
      say: [
        "Nos conectamos con lo que ya usás: Tiendanube, Shopify, WordPress, WooCommerce, Mercado Pago, n8n y Make.",
        "Si usás alguna herramienta que no está en esa lista, contámelo y lo vemos: casi todo lo que tiene API se puede integrar.",
      ],
      chips: [
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    migracion: {
      say: [
        "Sí, migramos tiendas entre plataformas manteniendo el catálogo, los clientes y el posicionamiento que ya ganaste.",
        "El orden que seguimos: primero aprobás el diseño, después se migra. Nunca al revés.",
      ],
      chips: [
        { label: "¿Cuánto tarda?", go: "plazos" },
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    medicion: {
      say: [
        "Medición con Google Analytics 4 y las conversiones cargadas en la cuenta de Ads, para saber qué campaña trae consultas reales y no solo clics.",
        "Los reportes muestran gasto, consultas y costo por consulta. Sin métricas de vanidad.",
      ],
      chips: [
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    regiones: {
      say: [
        "Trabajamos con empresas de toda Latinoamérica: Argentina, Uruguay, Paraguay, Chile, Perú, Colombia y México.",
        "Todo el proceso es remoto, así que la distancia no cambia nada del trabajo.",
      ],
      chips: [
        { label: "Quiero cotizar", go: "humano" },
        { label: "Volver", go: "inicio" },
      ],
    },

    humano: {
      say: [
        "Listo, te paso con el equipo. Escribinos por WhatsApp y te responde una persona:",
      ],
      chips: [
        { label: "Abrir WhatsApp", wa: true, cta: true },
        { label: "Prefiero mail", go: "mail" },
        { label: "Volver", go: "inicio" },
      ],
    },

    mail: {
      say: [
        'Escribinos a <a href="mailto:hola@studiocomplex.com.ar">hola@studiocomplex.com.ar</a> contándonos qué necesitás y te respondemos con una propuesta.',
        "También podés dejar tus datos en el formulario de la página de Contacto.",
      ],
      chips: [
        { label: "Ir a Contacto", href: "contact.html" },
        { label: "Volver", go: "inicio" },
      ],
    },

    nada: {
      say: [
        "Esa no la tengo respondida acá, y prefiero no inventarte una respuesta.",
        "Te paso con una persona del equipo, que te lo contesta bien.",
      ],
      chips: [
        { label: "Abrir WhatsApp", wa: true, cta: true },
        { label: "Ver las opciones", go: "inicio" },
      ],
    },
  };

  /* --- Texto libre: palabras clave a nodo ------------------------------- */
  var KEYWORDS = [
    [/(precio|cuesta|costo|presupuest|cotiza|tarifa|vale|cuanto sale)/, "precios"],
    [/(cuanto tarda|plazo|demora|tiempo|cuando|urgente|rapido)/, "plazos"],
    [/(tienda|ecommerce|e-commerce|vender|catalogo|producto|tiendanube|shopify|woo)/, "tienda"],
    [/(ads|publicidad|pauta|campan|google ads|meta|facebook|instagram|anunci)/, "ads"],
    [/(automatiz|n8n|make|bot|chatbot|seguimiento|crm|lead)/, "automatizacion"],
    [/(seo|posicion|buscador|google organico)/, "web"],
    [/(web|sitio|pagina|landing|wordpress|rediseñ|rediseni)/, "web"],
    [/(migrar|migracion|mudar|cambiar de plataforma)/, "migracion"],
    [/(integra|conecta|api|mercado ?pago|pago)/, "integraciones"],
    [/(como trabajan|proceso|metodolog|pasos|empez)/, "proceso"],
    [/(donde|pais|argentina|uruguay|mexico|chile|colombia|peru|remoto|latinoam)/, "regiones"],
    [/(medir|medicion|analytics|ga4|metrica|reporte|conversion)/, "medicion"],
    [/(hablar|persona|humano|asesor|llamar|telefono|whatsapp|contacto|mail|email)/, "humano"],
    [/^(hola|buenas|buen dia|buenas tardes|buenas noches|hey|que tal)/, "inicio"],
  ];

  /* --- Utilidades ------------------------------------------------------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function waLink(context) {
    var msg = "Hola, vengo de la web de Studio Complex.";
    if (context) msg += " Me interesa: " + context + ".";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  /* --- Estado ----------------------------------------------------------- */
  var state = { log: [], node: "inicio", opened: false, topic: "" };
  try {
    var saved = sessionStorage.getItem(STORE_KEY);
    if (saved) state = JSON.parse(saved);
  } catch (e) { /* sessionStorage bloqueado: seguimos en memoria */ }

  function persist() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* --- Markup ----------------------------------------------------------- */
  var root = el("div", "sc-chat");
  root.innerHTML = [
    '<div class="sc-chat-panel" role="dialog" aria-label="Asistente de Studio Complex">',
    '  <div class="sc-chat-head">',
    '    <span class="sc-chat-av"><img src="assets/images/logos/logo-icon.png" alt=""></span>',
    '    <span class="sc-chat-id">',
    '      <span class="sc-chat-name">Complex</span>',
    '      <span class="sc-chat-state">En línea · te respondemos al toque</span>',
    "    </span>",
    '    <button type="button" class="sc-chat-close" aria-label="Cerrar el asistente">',
    '      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">',
    '        <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    "      </svg>",
    "    </button>",
    "  </div>",
    '  <div class="sc-chat-log" aria-live="polite"></div>',
    '  <div class="sc-chat-chips"></div>',
    '  <form class="sc-chat-form">',
    '    <input type="text" autocomplete="off" placeholder="Escribí tu consulta..." aria-label="Escribí tu consulta">',
    '    <button type="submit" aria-label="Enviar">',
    '      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
    '        <path d="M1.5 8h11M8 3.5L12.5 8 8 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    "      </svg>",
    "    </button>",
    "  </form>",
    '  <div class="sc-chat-foot">Asistente automático · para casos puntuales te derivamos a una persona</div>',
    "</div>",
    '<div class="sc-chat-nudge" role="status">',
    "  ¿Te ayudo a encontrar lo que buscás?",
    '  <button type="button" aria-label="Cerrar el aviso">&times;</button>',
    "</div>",
    '<button type="button" class="sc-chat-launcher" aria-label="Abrir el asistente de Studio Complex">',
    '  <span class="sc-chat-ico">',
    '    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">',
    '      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "    </svg>",
    "  </span>",
    '  <span class="sc-chat-label">¿Hablamos?</span>',
    "</button>",
  ].join("\n");
  document.body.appendChild(root);

  var panel = root.querySelector(".sc-chat-panel");
  var logBox = root.querySelector(".sc-chat-log");
  var chipBox = root.querySelector(".sc-chat-chips");
  var form = root.querySelector(".sc-chat-form");
  var input = form.querySelector("input");
  var nudge = root.querySelector(".sc-chat-nudge");

  /* --- Render ----------------------------------------------------------- */
  function paint(who, text, animate) {
    var m = el("div", "sc-chat-msg " + who, text);
    if (!animate) m.style.animation = "none";
    logBox.appendChild(m);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function push(who, text) {
    /* Lo que escribe la persona se escapa: los textos del bot llevan
       etiquetas a proposito, lo tipeado no. */
    var safe = who === "me" ? escapeHtml(text) : text;
    state.log.push({ who: who, text: safe });
    persist();
    paint(who, safe, true);
  }

  function chips(list) {
    chipBox.innerHTML = "";
    (list || []).forEach(function (c) {
      var b = el("button", "sc-chat-chip" + (c.cta ? " cta" : ""), c.label);
      b.type = "button";
      b.addEventListener("click", function () {
        if (c.wa) {
          push("me", c.label);
          window.open(waLink(state.topic), "_blank", "noopener");
          return;
        }
        if (c.href) {
          push("me", c.label);
          window.location.href = c.href;
          return;
        }
        push("me", c.label);
        state.topic = c.label === "Volver" ? state.topic : c.label;
        go(c.go);
      });
      chipBox.appendChild(b);
    });
  }

  var typingEl = null;
  function typing(on) {
    if (on) {
      if (typingEl) return;
      typingEl = el("div", "sc-chat-typing", "<span></span><span></span><span></span>");
      logBox.appendChild(typingEl);
      logBox.scrollTop = logBox.scrollHeight;
    } else if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  function go(id) {
    var node = NODES[id] || NODES.nada;
    state.node = NODES[id] ? id : "nada";
    persist();
    chips([]);
    var i = 0;
    (function next() {
      if (i >= node.say.length) {
        chips(node.chips);
        return;
      }
      typing(true);
      setTimeout(function () {
        typing(false);
        push("bot", node.say[i]);
        i++;
        next();
      }, i === 0 ? 420 : 620);
    })();
  }

  function answer(text) {
    var t = normalize(text);
    for (var i = 0; i < KEYWORDS.length; i++) {
      if (KEYWORDS[i][0].test(t)) { go(KEYWORDS[i][1]); return; }
    }
    go("nada");
  }

  /* --- Interaccion ------------------------------------------------------ */
  function open() {
    root.classList.add("is-open");
    nudge.classList.remove("is-visible");
    if (!state.opened) {
      state.opened = true;
      persist();
      go("inicio");
    }
    setTimeout(function () { input.focus(); }, 60);
  }

  function close() {
    root.classList.remove("is-open");
  }

  root.querySelector(".sc-chat-launcher").addEventListener("click", function () {
    root.classList.contains("is-open") ? close() : open();
  });
  root.querySelector(".sc-chat-close").addEventListener("click", close);
  nudge.querySelector("button").addEventListener("click", function (e) {
    e.stopPropagation();
    nudge.classList.remove("is-visible");
    try { sessionStorage.setItem(STORE_KEY + "-nudge", "off"); } catch (err) {}
  });
  nudge.addEventListener("click", open);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("is-open")) close();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    push("me", v);
    state.topic = v;
    persist();
    chips([]);
    typing(true);
    setTimeout(function () { typing(false); answer(v); }, 500);
  });

  /* --- Arranque --------------------------------------------------------- */
  if (state.log.length) {
    state.log.forEach(function (m) { paint(m.who, m.text, false); });
    chips((NODES[state.node] || NODES.inicio).chips);
  }

  var nudgeOff = false;
  try { nudgeOff = sessionStorage.getItem(STORE_KEY + "-nudge") === "off"; } catch (e) {}
  if (!state.opened && !nudgeOff) {
    setTimeout(function () {
      if (!root.classList.contains("is-open")) nudge.classList.add("is-visible");
    }, 9000);
  }
})();
