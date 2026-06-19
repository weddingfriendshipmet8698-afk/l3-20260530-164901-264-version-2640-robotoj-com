(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (toggle && mobileMenu && header) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      header.classList.toggle('menu-active', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var q = input ? input.value.trim() : '';
      if (q) {
        window.location.href = './search.html?q=' + encodeURIComponent(q);
      } else {
        window.location.href = './search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
        slide.classList.toggle('prev', i < current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(nextSlide, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        nextSlide();
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var grid = document.querySelector('[data-filter-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-filter-card]'));
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var empty = document.querySelector('[data-empty]');
    var activeChip = 'all';
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (input && initial) {
      input.value = initial;
    }

    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }

    function applyFilter() {
      var q = normalize(input ? input.value : '');
      var year = select ? select.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchYear = year === 'all' || cardYear === year;
        var matchChip = activeChip === 'all' || cardType === activeChip || haystack.indexOf(activeChip) !== -1;
        var ok = matchText && matchYear && matchChip;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-filter-chip') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  }

  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-player-button]');
    var url = wrap.getAttribute('data-play-url');

    function prepare() {
      if (!video || !url || video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
      video.setAttribute('data-ready', '1');
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      prepare();
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    wrap.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      playVideo(event);
    });

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
