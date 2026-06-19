(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-goto]"));
    var index = 0;
    var timer;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initLists() {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.children);
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-sort-select]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    function applyFilter() {
      var value = (input && input.value ? input.value : "").trim().toLowerCase();
      cards.forEach(function (card) {
        var keywords = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", value !== "" && keywords.indexOf(value) === -1);
      });
    }

    function applySort() {
      if (!select) {
        return;
      }
      var mode = select.value;
      var sorted = cards.slice();
      if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }
      if (mode === "rating") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        });
      }
      if (mode === "heat") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
        });
      }
      if (mode === "default") {
        sorted = cards.slice();
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      applyFilter();
    }

    if (input) {
      input.value = query;
      input.addEventListener("input", applyFilter);
      applyFilter();
    }
    if (select) {
      select.addEventListener("change", applySort);
    }
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".stream-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector(".play-layer");
      var started = false;
      if (!video || !layer) {
        return;
      }

      function attach() {
        var url = video.getAttribute("data-stream");
        if (!url) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        if (!started) {
          attach();
          started = true;
        }
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      layer.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLists();
    initPlayer();
  });
})();
