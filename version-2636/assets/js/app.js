(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-card-grid]');
    if (panel && grid) {
        var input = panel.querySelector('[data-filter-input]');
        var category = panel.querySelector('[data-filter-category]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var noResults = panel.querySelector('[data-no-results]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';

        if (input && queryValue) {
            input.value = queryValue;
        }

        function contains(value, query) {
            return String(value || '').toLowerCase().indexOf(query) !== -1;
        }

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var catValue = category ? category.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matchesQuery = !query || contains(text, query);
                var matchesCategory = !catValue || card.getAttribute('data-category') === catValue;
                var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var matches = matchesQuery && matchesCategory && matchesType && matchesYear;

                card.style.display = matches ? '' : 'none';
                if (matches) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, category, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
})();
