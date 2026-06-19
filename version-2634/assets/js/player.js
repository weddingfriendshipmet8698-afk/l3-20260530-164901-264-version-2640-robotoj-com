function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var button = document.getElementById(options.buttonId);
  var hls = null;

  if (!video) {
    return;
  }

  function playVideo() {
    function startPlayback() {
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (video.__readyToPlay) {
      startPlayback();
      return;
    }

    video.__readyToPlay = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.source;
      video.load();
      startPlayback();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        backBufferLength: 30
      });
      hls.loadSource(options.source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        startPlayback();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          hls.destroy();
          hls = null;
          video.__readyToPlay = false;
        }
      });
      return;
    }

    video.src = options.source;
    video.load();
    startPlayback();
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      playVideo();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
}
