/* ==========================================================================
   Studio Complex · Página de servicio
   --------------------------------------------------------------------------
   1. Revelar los bloques cuando entran en pantalla.
   2. El navegador del encabezado pasa solo de escritorio a tablet y a
      teléfono, y se puede elegir a mano.
   3. El comparador antes / después.
   4. La línea del proceso se llena con el scroll y enciende cada paso.

   Sin JavaScript la página se ve completa: el estado escondido solo se
   aplica si este archivo corre y marca el contenedor con .sc-sv-js.
   ========================================================================== */
(function () {
  "use strict";

  var raiz = document.querySelector(".sc-sv");
  if (!raiz) return;

  var menosMovimiento =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Las demos del encabezado son el contenido de la página (muestran el
     servicio andando), no decoración: corren siempre. Windows marca
     "menos movimiento" solo con apagar los efectos de animación, y en
     muchas PC de escritorio vienen apagados; así las demos quedaban
     quietas (29/9, lo vio Seba en su monitor). El resto de la página
     sigue respetando la preferencia. */
  var demosQuietas = false;

  /* ------------------------------------------------------------------ 1 */
  var bloques = raiz.querySelectorAll(".sc-rv");
  function mostrarTodo() {
    Array.prototype.forEach.call(bloques, function (b) { b.classList.add("is-in"); });
  }

  if (!menosMovimiento && "IntersectionObserver" in window) {
    raiz.classList.add("sc-sv-js");

    /* Red de seguridad, igual que en los casos: si el observador no
       responde en 3 segundos se muestra todo, para que la página nunca
       quede en blanco. */
    var respondio = false;
    setTimeout(function () { if (!respondio) mostrarTodo(); }, 3000);

    var obs = new IntersectionObserver(function (entradas) {
      respondio = true;
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var retraso = parseInt(e.target.getAttribute("data-rv-delay") || "0", 10);
        setTimeout(function () { e.target.classList.add("is-in"); }, retraso);
        obs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    Array.prototype.forEach.call(bloques, function (b) { obs.observe(b); });
  } else {
    mostrarTodo();
  }

  /* ------------------------------------------------------------------ 2 */
  var nav = raiz.querySelector(".sc-sv-nav");
  var botones = raiz.querySelectorAll(".sc-sv-disp button");
  if (nav && botones.length) {
    var modos = ["escritorio", "tablet", "tel"];
    var indice = 0;
    var auto = null;

    function poner(modo) {
      nav.setAttribute("data-modo", modo);
      Array.prototype.forEach.call(botones, function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-modo") === modo ? "true" : "false");
      });
    }

    Array.prototype.forEach.call(botones, function (b) {
      b.addEventListener("click", function () {
        /* Si la persona eligió uno, se queda en ese. */
        clearInterval(auto);
        auto = null;
        poner(b.getAttribute("data-modo"));
      });
    });

    if (!demosQuietas) {
      auto = setInterval(function () {
        indice = (indice + 1) % modos.length;
        poner(modos[indice]);
      }, 2800);
    }
  }

  /* ------------------------------------------------------------ 2b tienda
     Demo de Tiendas Online: marca un producto, lo suma al carrito y
     muestra el aviso de venta. Con menos movimiento queda quieta. */
  var tienda = raiz.querySelector(".sc-sv-tienda");
  if (tienda && !demosQuietas) {
    var prods = tienda.querySelectorAll(".sc-sv-t-prod");
    var contador = tienda.querySelector(".sc-sv-t-carro b");
    var venta = raiz.querySelector(".sc-sv-t-venta");
    var cant = parseInt(contador.textContent, 10) || 0;
    var cual = 0;

    setInterval(function () {
      Array.prototype.forEach.call(prods, function (p) { p.classList.remove("activo"); });
      var p = prods[cual % prods.length];
      /* Si ese producto está oculto (teléfono), pasa al siguiente visible. */
      if (p.offsetParent === null) { cual++; p = prods[cual % prods.length]; }
      p.classList.add("activo");
      cual++;

      setTimeout(function () {
        cant++;
        contador.textContent = cant;
        contador.classList.add("salta");
        setTimeout(function () { contador.classList.remove("salta"); }, 250);
      }, 700);

      if (venta) {
        setTimeout(function () { venta.classList.add("ver"); }, 1100);
        setTimeout(function () { venta.classList.remove("ver"); }, 2700);
      }
    }, 3200);
  }

  /* El circuito de Automatización anima con SVG (animateMotion), que no
     respeta prefers-reduced-motion por sí solo: lo pausamos a mano. */
  if (demosQuietas) {
    Array.prototype.forEach.call(raiz.querySelectorAll("svg.lineas"), function (svg) {
      if (svg.pauseAnimations) svg.pauseAnimations();
    });
  }

  /* --------------------------------------------------------------- 2c SEO
     Tu resultado sube un puesto por vez hasta el primero, espera y vuelve
     a empezar. Cada puesto es --pos en el li; los demás bajan uno. */
  var goo = raiz.querySelector(".sc-sv-goo-lista");
  if (goo) {
    var items = Array.prototype.slice.call(goo.children);
    var tuyo = goo.querySelector(".tuyo");
    var orden = items.slice();
    goo.classList.add("movil");
    /* Cada ítem se desplaza desde su lugar en el HTML hasta el puesto que
       le toca, en píxeles. Un var() dentro del translate no lo tomaba
       Firefox, por eso se calcula acá. */
    function pintarSeo() {
      var paso = items[0].offsetHeight + 8;
      orden.forEach(function (li, i) {
        var original = items.indexOf(li);
        li.style.transform = "translateY(" + (i - original) * paso + "px)";
        var b = li.querySelector("b");
        if (b) b.textContent = "#" + (i + 1);
      });
    }
    window.addEventListener("resize", function () { pintarSeo(); });
    /* Al correr el script el alto de los ítems todavía puede no ser el
       final (fuentes, imágenes): se vuelve a calcular cuando carga todo. */
    window.addEventListener("load", function () { pintarSeo(); });
    pintarSeo();
    if (!demosQuietas) {
      setInterval(function () {
        var i = orden.indexOf(tuyo);
        if (i > 0) {
          orden.splice(i, 1);
          orden.splice(i - 1, 0, tuyo);
        } else {
          orden = items.slice();
        }
        pintarSeo();
      }, 1500);
    } else {
      orden.splice(orden.indexOf(tuyo), 1);
      orden.unshift(tuyo);
      pintarSeo();
    }
  }

  /* --------------------------------------------------------------- 2d Ads
     Las barras crecen al cargar y cada tanto entra una consulta nueva,
     alternando Google y Meta. */
  var ads = raiz.querySelector(".sc-sv-ads");
  if (ads) {
    var graf = ads.querySelector(".sc-sv-ads-graf");
    setTimeout(function () { graf.classList.add("listo"); }, 200);
    var num = ads.querySelector("[data-contador]");
    var avisoAds = raiz.querySelector(".sc-sv-hero .sc-sv-aviso");
    var origen = avisoAds ? avisoAds.querySelector("[data-origen]") : null;
    var fuentes = ["Google Ads · Búsqueda", "Meta Ads · Instagram"];
    var vuelta = 0;
    if (!demosQuietas && num) {
      setInterval(function () {
        num.textContent = parseInt(num.textContent, 10) + 1;
        if (origen) origen.textContent = fuentes[vuelta++ % fuentes.length];
        if (avisoAds) {
          avisoAds.classList.add("ver");
          setTimeout(function () { avisoAds.classList.remove("ver"); }, 1800);
        }
      }, 3000);
    }
  }

  /* ----------------------------------------------------------- 2e Kanban
     Una oportunidad avanza de columna en columna hasta Cerrada; ahí aparece
     el aviso y entra una nueva en la primera columna. */
  var kanban = raiz.querySelector(".sc-sv-kanban");
  if (kanban && !demosQuietas) {
    var cols = kanban.querySelectorAll(".sc-sv-kanban-col");
    var avisoK = raiz.querySelector(".sc-sv-hero .sc-sv-aviso");
    var nombres = ["Distribuidora Sur", "Estudio Norte", "Clínica Centro", "Taller Oeste", "Mayorista Delta"];
    var nIdx = 0;
    var viaje = null;
    var etapa = 0;

    function contar() {
      Array.prototype.forEach.call(cols, function (c) {
        var e = c.querySelector("b em");
        if (e) e.textContent = c.querySelectorAll(".sc-sv-tarj").length;
      });
    }
    function nueva() {
      var t = document.createElement("div");
      t.className = "sc-sv-tarj";
      t.innerHTML = "<span></span><i></i><small>Nueva consulta</small>";
      t.querySelector("span").textContent = nombres[nIdx++ % nombres.length];
      cols[0].insertBefore(t, cols[0].children[1] || null);
      return t;
    }
    var textos = ["Nueva consulta", "Seguimiento hoy", "Propuesta enviada", "Venta cerrada"];
    setInterval(function () {
      if (!viaje) { viaje = nueva(); etapa = 0; contar(); return; }
      etapa++;
      viaje.classList.add("mueve");
      viaje.querySelector("small").textContent = textos[etapa];
      viaje.classList.toggle("hoy", etapa === 1);
      cols[etapa].insertBefore(viaje, cols[etapa].children[1] || null);
      /* Se vuelve a poner para que la animación de entrada corra. */
      viaje.style.animation = "none"; void viaje.offsetWidth; viaje.style.animation = "";
      if (etapa === cols.length - 1) {
        viaje.classList.remove("mueve");
        var ultimas = cols[etapa].querySelectorAll(".sc-sv-tarj");
        if (ultimas.length > 3) ultimas[ultimas.length - 1].remove();
        if (avisoK) {
          avisoK.classList.add("ver");
          setTimeout(function () { avisoK.classList.remove("ver"); }, 1800);
        }
        viaje = null;
      }
      contar();
    }, 1700);
    contar();
  }

  /* ------------------------------------------------------------------ 3 */
  var comp = raiz.querySelector(".sc-sv-comp");
  if (comp) {
    var rango = comp.querySelector("input[type=range]");
    var aplicar = function () { comp.style.setProperty("--corte", rango.value + "%"); };
    rango.addEventListener("input", aplicar);
    aplicar();
  }

  /* ------------------------------------------------------------------ 4 */
  var proceso = raiz.querySelector(".sc-sv-proceso");
  if (proceso) {
    var pasos = proceso.querySelectorAll(".sc-sv-paso");
    var pendiente = false;

    function medir() {
      pendiente = false;
      var r = proceso.getBoundingClientRect();
      var alto = window.innerHeight;
      /* El avance empieza cuando el tope de la lista llega al 70% de la
         pantalla y termina cuando el final pasa por ese mismo punto. */
      var linea = alto * 0.7;
      var avance = (linea - r.top) / r.height;
      avance = Math.max(0, Math.min(1, avance));
      proceso.style.setProperty("--avance", avance.toFixed(3));
      Array.prototype.forEach.call(pasos, function (p) {
        var rp = p.getBoundingClientRect();
        p.classList.toggle("activo", rp.top + 28 < linea);
      });
    }

    var pedir = function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(medir);
    };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    medir();
  }
})();
