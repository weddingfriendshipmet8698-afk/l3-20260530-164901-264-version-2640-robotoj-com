(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll(".cover-img, .hero-image");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var frame = image.closest(".poster-frame") || image.closest(".hero-slide");

        if (frame) {
          frame.classList.add("has-image-error");
        }

        image.style.display = "none";
      });
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var container = document.querySelector("[data-card-container]");

    if (!panel || !container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
    var searchInput = panel.querySelector("[data-filter-search]");
    var fieldInputs = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
    var resetButton = panel.querySelector("[data-filter-reset]");
    var count = panel.querySelector("[data-filter-count]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function cardText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.category,
        card.dataset.genre,
        card.textContent
      ].join(" "));
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;

        if (query && cardText(card).indexOf(query) === -1) {
          ok = false;
        }

        fieldInputs.forEach(function (input) {
          var field = input.getAttribute("data-filter-field");
          var value = normalize(input.value);
          var cardValue = normalize(card.dataset[field]);

          if (value && cardValue.indexOf(value) === -1) {
            ok = false;
          }
        });

        card.classList.toggle("hidden-by-filter", !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "显示 " + visible + " / " + cards.length;
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    fieldInputs.forEach(function (input) {
      input.addEventListener("change", applyFilters);
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }

        fieldInputs.forEach(function (input) {
          input.value = "";
        });

        applyFilters();
      });
    }

    applyFilters();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector("script[src='" + src + "']");

      if (existing) {
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-video-player]");

    players.forEach(function (player) {
      var button = player.querySelector("[data-play-button]");
      var video = player.querySelector("video");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-src");
      var hlsInstance = null;
      var loaded = false;

      if (!button || !video || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachNative() {
        video.src = source;
        loaded = true;
        setStatus("浏览器已使用原生 HLS 播放能力加载。点击视频控件即可播放或暂停。");
      }

      function attachHls() {
        if (!window.Hls || !window.Hls.isSupported()) {
          attachNative();
          return Promise.resolve();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          loaded = true;
          setStatus("m3u8 播放清单已加载，可以开始播放。");
          video.play().catch(function () {
            setStatus("播放源已加载，请点击视频控件开始播放。");
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("当前播放源加载失败，请刷新后重试或更换浏览器。");

            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });

        return Promise.resolve();
      }

      button.addEventListener("click", function () {
        player.classList.add("is-playing");
        setStatus("正在加载 HLS 播放源...");

        if (loaded) {
          video.play().catch(function () {
            setStatus("播放源已加载，请点击视频控件开始播放。");
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          attachNative();
          video.play().catch(function () {
            setStatus("播放源已加载，请点击视频控件开始播放。");
          });
          return;
        }

        var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";

        Promise.resolve()
          .then(function () {
            if (!window.Hls) {
              return loadScript(hlsUrl);
            }
          })
          .then(attachHls)
          .catch(function () {
            attachNative();
            video.play().catch(function () {
              setStatus("HLS 兼容脚本加载失败，已尝试原生播放；如无法播放，请用 Safari 或部署到 HTTPS 环境访问。");
            });
          });
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupImageFallbacks();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
