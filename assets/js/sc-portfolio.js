/* ==========================================================================
   Studio Complex · Filtro del portfolio (trabajos.html)
   Cada tarjeta lleva data-cat con sus categorías separadas por espacio.
   El botón elegido muestra solo las que la incluyen; "todos" las muestra
   a todas. Sin JS se ven todas y los botones no hacen nada.
   ========================================================================== */
(function () {
  "use strict";

  var botones = document.querySelectorAll(".sc-pf-filtros button");
  var items = document.querySelectorAll(".sc-pf-item");
  if (!botones.length || !items.length) return;

  Array.prototype.forEach.call(botones, function (b) {
    b.addEventListener("click", function () {
      var filtro = b.getAttribute("data-filtro");
      Array.prototype.forEach.call(botones, function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      Array.prototype.forEach.call(items, function (it) {
        var cats = (it.getAttribute("data-cat") || "").split(" ");
        it.hidden = filtro !== "todos" && cats.indexOf(filtro) === -1;
      });
    });
  });
})();
