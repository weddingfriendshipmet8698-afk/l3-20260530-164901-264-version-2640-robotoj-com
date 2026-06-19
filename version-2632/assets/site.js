
(function () {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[·•]/g, '')
      .replace(/[，,。:：/\\|;；()（）\[\]{}<>《》“”'"`~！？!?]/g, '');
  }

  function bindNavToggle() {
    const toggle = qs('[data-nav-toggle]');
    const nav = qs('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('is-open'));
    qsa('.nav a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('is-open'));
    });
  }

  function setActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    qsa('.nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.endsWith(path)) a.classList.add('is-active');
    });
  }

  function cardText(card) {
    const ds = card.dataset || {};
    const fallback = card.textContent || '';
    return normalize((ds.title || '') + ' ' + (ds.region || '') + ' ' + (ds.type || '') + ' ' + (ds.genre || '') + ' ' + (ds.tags || '') + ' ' + (ds.year || '') + ' ' + fallback);
  }

  function bindLiveFilters(scope = document) {
    const filters = {
      q: qs('[data-filter-q]', scope),
      region: qs('[data-filter-region]', scope),
      year: qs('[data-filter-year]', scope),
      type: qs('[data-filter-type]', scope),
      genre: qs('[data-filter-genre]', scope),
      reset: qs('[data-filter-reset]', scope)
    };
    const cards = qsa('.movie-card[data-id], .bucket-card', scope);
    const empty = qs('[data-empty]', scope);

    if (!cards.length) return;

    function apply() {
      const q = normalize(filters.q && filters.q.value);
      const region = normalize(filters.region && filters.region.value);
      const year = normalize(filters.year && filters.year.value);
      const type = normalize(filters.type && filters.type.value);
      const genre = normalize(filters.genre && filters.genre.value);
      let visible = 0;

      cards.forEach((card) => {
        const hay = cardText(card);
        const ok = (!q || hay.includes(q)) && (!region || normalize(card.dataset.region).includes(region)) && (!year || card.dataset.year === year) && (!type || normalize(card.dataset.type).includes(type)) && (!genre || normalize(card.dataset.genre).includes(genre));
        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });

      if (empty) empty.classList.toggle('hidden', visible !== 0);
    }

    [filters.q, filters.region, filters.year, filters.type, filters.genre].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
    if (filters.reset) {
      filters.reset.addEventListener('click', () => {
        if (filters.q) filters.q.value = '';
        if (filters.region) filters.region.value = '';
        if (filters.year) filters.year.value = '';
        if (filters.type) filters.type.value = '';
        if (filters.genre) filters.genre.value = '';
        apply();
      });
    }
    apply();
  }

  function bindHeroCarousel() {
    const hero = qs('[data-hero-carousel]');
    if (!hero) return;
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) return;

    let index = 0;
    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, sidx) => slide.classList.toggle('is-active', sidx === index));
      dots.forEach((dot, didx) => dot.classList.toggle('is-active', didx === index));
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    setInterval(() => show(index + 1), 5200);
    show(0);
  }

  function bindDetailPlayer() {
    const box = qs('[data-player-root]');
    if (!box) return;
    const video = qs('video', box);
    const buttons = qsa('[data-source]', box);
    if (!video || !buttons.length) return;

    const sources = {
      mp4: video.dataset.mp4,
      m3u8: video.dataset.m3u8
    };

    function activate(type) {
      buttons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.source === type));
      const url = sources[type];
      if (!url) return;
      if (type === 'm3u8' && window.Hls && window.Hls.isSupported()) {
        if (video._hls) video._hls.destroy();
        const hls = new window.Hls();
        video._hls = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      } else {
        if (video._hls) {
          video._hls.destroy();
          video._hls = null;
        }
        video.src = url;
        video.load();
        video.play().catch(() => {});
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => activate(btn.dataset.source));
    });

    activate(buttons[0].dataset.source);
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindNavToggle();
    setActiveNav();
    bindLiveFilters();
    bindHeroCarousel();
    bindDetailPlayer();
  });
})();
