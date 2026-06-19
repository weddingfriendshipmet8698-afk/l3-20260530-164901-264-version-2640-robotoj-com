(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function norm(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(root) {
    var q = norm((root.querySelector('[data-search-input]') || {}).value);
    var y = norm((root.querySelector('[data-filter-year]') || {}).value);
    var r = norm((root.querySelector('[data-filter-region]') || {}).value);
    var cards = document.querySelectorAll('.movie-card, .rank-row');

    cards.forEach(function (card) {
      var text = norm([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' '));
      var okText = !q || text.indexOf(q) !== -1;
      var okYear = !y || norm(card.getAttribute('data-year')) === y;
      var okRegion = !r || norm(card.getAttribute('data-region')) === r;
      card.classList.toggle('is-filtered-out', !(okText && okYear && okRegion));
    });
  }

  document.querySelectorAll('[data-search-input], [data-filter-year], [data-filter-region]').forEach(function (el) {
    el.addEventListener('input', function () {
      applyFilters(document);
    });

    el.addEventListener('change', function () {
      applyFilters(document);
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  });

  window.bootPlayer = function (u) {
    var video = document.getElementById('movie-player');
    var layer = document.getElementById('play-layer');
    var started = false;
    var hls = null;

    if (!video || !layer || !u) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = u;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(u);
        hls.attachMedia(video);
      } else {
        video.src = u;
      }
    }

    function play() {
      attach();
      layer.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var p = video.play();

      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          layer.classList.remove('is-hidden');
        });
      }
    }

    layer.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
