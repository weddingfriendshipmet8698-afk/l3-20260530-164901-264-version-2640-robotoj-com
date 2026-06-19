(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    document.querySelectorAll('.search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';

        if (!query) {
          return;
        }

        event.preventDefault();
        var action = form.getAttribute('action') || 'search.html';
        window.location.href = action + '?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('.hero-carousel');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function filterCards(scope) {
    var input = scope.querySelector('.filter-input');
    var yearSelect = scope.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('.empty-state');

    function update() {
      var query = normalize(input ? input.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || text.indexOf(year) !== -1;
        var visible = matchQuery && matchYear;

        card.classList.toggle('hidden', !visible);

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', update);
    }

    update();
  }

  function initFilters() {
    document.querySelectorAll('.content-wrap').forEach(function (scope) {
      if (scope.querySelector('.filter-input') && scope.querySelector('[data-card]')) {
        filterCards(scope);
      }
    });
  }

  function initSearchQuery() {
    var page = document.querySelector('[data-search-page]');

    if (!page) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = page.querySelector('.filter-input');

    if (input && query) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    }
  }

  window.initializeVideoPlayer = function (source) {
    ready(function () {
      var video = document.querySelector('.video-player');
      var cover = document.querySelector('.player-cover');
      var hls = null;
      var loaded = false;

      if (!video || !source) {
        return;
      }

      function load() {
        if (loaded) {
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);

          if (window.Hls.Events && window.Hls.ErrorTypes) {
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }

              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            });
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function start() {
        load();
        video.controls = true;

        if (cover) {
          cover.classList.add('is-hidden');
        }

        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initSearchQuery();
  });
})();
