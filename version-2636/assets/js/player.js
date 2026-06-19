(function () {
    window.setupMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function bindSource() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', '1');
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function showButton() {
            if (button && video.paused && video.currentTime < 0.5) {
                button.classList.remove('is-hidden');
            }
        }

        function playVideo() {
            bindSource();
            hideButton();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', hideButton);
        video.addEventListener('ended', showButton);

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
