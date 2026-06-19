(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function (form) {
      var scope = form.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-result]") || document.querySelector("[data-empty-result]");

      function applyFilter() {
        var input = form.querySelector("input[name='q']");
        var yearSelect = form.querySelector("select[name='year']");
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var count = 0;

        cards.forEach(function (card) {
          var haystack = card.getAttribute("data-search") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var visible = true;

          if (query && haystack.indexOf(query) === -1) {
            visible = false;
          }

          if (year && cardYear !== year) {
            visible = false;
          }

          card.hidden = !visible;
          if (visible) {
            count += 1;
          }
        });

        if (empty) {
          empty.hidden = count !== 0;
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      Array.prototype.slice.call(form.querySelectorAll("input, select")).forEach(function (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      });
    });
  });
})();
