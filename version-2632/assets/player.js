
(function () {
  function initPlayer(root) {
    const video = root.querySelector('video');
    const buttons = Array.from(root.querySelectorAll('[data-source]'));
    if (!video || !buttons.length) return;

    const mp4 = video.dataset.mp4;
    const m3u8 = video.dataset.m3u8;

    function destroyHls() {
      if (video._hls) {
        try { video._hls.destroy(); } catch (e) {}
        video._hls = null;
      }
    }

    function useMp4() {
      destroyHls();
      video.src = mp4;
      video.load();
      video.play().catch(() => {});
    }

    function useM3u8() {
      if (!m3u8) return useMp4();
      if (window.Hls && window.Hls.isSupported()) {
        destroyHls();
        const hls = new Hls();
        video._hls = hls;
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        destroyHls();
        video.src = m3u8;
        video.load();
        video.play().catch(() => {});
      } else {
        useMp4();
      }
    }

    function activate(type) {
      buttons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.source === type));
      if (type === 'm3u8') useM3u8(); else useMp4();
    }

    buttons.forEach((btn) => btn.addEventListener('click', () => activate(btn.dataset.source)));
    activate(buttons[0].dataset.source || 'mp4');
  }

  document.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('[data-player-root]')).forEach(initPlayer);
  });
})();
