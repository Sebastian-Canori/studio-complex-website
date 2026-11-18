// Services mega menu: hover/focus/click open, Esc to close, case card swaps per service.
(function () {
  "use strict";

  var desktop = window.matchMedia("(min-width: 992px)");
  var CLOSE_DELAY = 180;

  function setup(li) {
    var trigger = li.querySelector(":scope > a");
    var panel = li.querySelector(":scope > .sc-mega");
    if (!trigger || !panel) return;
    var timer = null;

    var warmed = false;
    function open() {
      clearTimeout(timer);
      if (!warmed) {
        // Warm the cache on first open so the case swap doesn't flash.
        warmed = true;
        panel.querySelectorAll("[data-case-img]").forEach(function (a) {
          new Image().src = a.getAttribute("data-case-img");
        });
      }
      li.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      clearTimeout(timer);
      li.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }
    function closeLater() {
      clearTimeout(timer);
      timer = setTimeout(close, CLOSE_DELAY);
    }

    li.addEventListener("mouseenter", function () { if (desktop.matches) open(); });
    li.addEventListener("mouseleave", function () { if (desktop.matches) closeLater(); });
    li.addEventListener("focusin", function () { if (desktop.matches) open(); });
    li.addEventListener("focusout", function (e) {
      if (!li.contains(e.relatedTarget)) close();
    });
    trigger.addEventListener("click", function (e) {
      if (!desktop.matches) return;
      e.preventDefault();
      li.classList.contains("is-open") ? close() : open();
    });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && li.classList.contains("is-open")) {
        close();
        trigger.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!li.contains(e.target)) close();
    });

    // Swap the featured case to the one related to the hovered/focused service.
    var card = panel.querySelector(".sc-mega__case");
    if (!card) return;
    var img = card.querySelector("img");
    var title = card.querySelector(".sc-mega__case-title");
    var current = img.getAttribute("src");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(link) {
      var src = link.getAttribute("data-case-img");
      panel.querySelectorAll(".sc-mega__item.is-active").forEach(function (a) { a.classList.remove("is-active"); });
      var row = link.closest(".sc-mega__item");
      if (row) row.classList.add("is-active");
      if (!src || src === current) return;
      current = src;
      var apply = function () {
        img.setAttribute("src", src);
        title.textContent = link.getAttribute("data-case-title");
        card.setAttribute("href", link.getAttribute("data-case-href"));
        card.classList.remove("is-swapping");
      };
      if (reduced) return apply();
      card.classList.add("is-swapping");
      setTimeout(apply, 150);
    }

    panel.querySelectorAll("[data-case-img]").forEach(function (link) {
      link.addEventListener("mouseenter", function () { show(link); });
      link.addEventListener("focus", function () { show(link); });
    });
  }

  document.querySelectorAll(".mainmenu .sc-mega-li").forEach(setup);
})();
