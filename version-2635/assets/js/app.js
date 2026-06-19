(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  var list = document.querySelector('[data-filter-list]');

  if (list) {
    var input = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var empty = document.querySelector('[data-empty-result]');
    var items = Array.prototype.slice.call(list.children);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input && input.value);
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var shown = 0;

      items.forEach(function (item) {
        var title = normalize(item.getAttribute('data-title'));
        var region = normalize(item.getAttribute('data-region'));
        var genre = normalize(item.getAttribute('data-genre'));
        var itemType = item.getAttribute('data-type') || '';
        var itemYear = Number(item.getAttribute('data-year')) || 0;
        var text = title + ' ' + region + ' ' + genre + ' ' + itemType + ' ' + itemYear;
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !year || String(itemYear) === year || (year === 'older' && itemYear < 2020);
        var okType = !type || itemType.indexOf(type) !== -1;
        var visible = okKeyword && okYear && okType;

        item.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [input, yearFilter, typeFilter].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

function applyQueryToSearch() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var input = document.querySelector('[data-filter-input]');

  if (input && query) {
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function initPlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playCover');
  var mounted = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function mount() {
    if (mounted) {
      return;
    }

    mounted = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    mount();

    if (cover) {
      cover.style.display = 'none';
    }

    video.controls = true;
    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        if (cover) {
          cover.style.display = 'grid';
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!mounted) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
