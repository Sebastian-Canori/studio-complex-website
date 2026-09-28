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

    if (!menosMovimiento) {
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
  if (tienda && !menosMovimiento) {
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
