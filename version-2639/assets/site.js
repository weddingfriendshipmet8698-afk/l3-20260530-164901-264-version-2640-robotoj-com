
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    if (!slides.length) return;
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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

  function setupFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) return;
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-filter-search]");
    var category = document.querySelector("[data-filter-category]");
    var sort = document.querySelector("[data-filter-sort]");
    var empty = document.querySelector(".no-results");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (search && query) search.value = query;

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var term = normalize(search && search.value);
      var cat = category ? category.value : "all";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.category,
          card.dataset.genre
        ].join(" "));
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchCat = cat === "all" || card.dataset.category === cat;
        var show = matchTerm && matchCat;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    function applySort() {
      if (!sort) return;
      var value = sort.value;
      var grid = filterRoot.querySelector(".movie-grid");
      if (!grid) return;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === "rating") return Number(b.dataset.rating) - Number(a.dataset.rating);
        if (value === "views") return Number(b.dataset.views) - Number(a.dataset.views);
        if (value === "year") return Number(b.dataset.year) - Number(a.dataset.year);
        return 0;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [search, category].forEach(function (control) {
      if (control) control.addEventListener("input", apply);
      if (control) control.addEventListener("change", apply);
    });
    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        apply();
      });
    }
    applySort();
    apply();
  }

  window.initVideoPlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".play-overlay");
    if (!video || !streamUrl) return;
    var hlsInstance = null;
    var attached = false;

    function attach() {
      if (attached) return;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function play() {
      attach();
      if (overlay) overlay.setAttribute("hidden", "");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) overlay.removeAttribute("hidden");
        });
      }
    }

    if (overlay) overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) play();
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
