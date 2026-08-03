(function (global) {
    'use strict';

    function directMatches(root, selector) {
        if (!selector) return Array.from(root.children);
        var split = selector.split('>');
        var parent = split.length > 1 ? root.querySelector(split[0].trim()) : root;
        var childSelector = split.length > 1 ? split.slice(1).join('>').trim() : selector;
        return parent ? Array.from(parent.children).filter(function (child) { return child.matches(childSelector); }) : [];
    }

    function create(root, options) {
        if (!root || root.dataset.nativeCarouselReady === 'true') return null;
        options = options || {};
        var slides = directMatches(root, options.selector);
        if (!slides.length) return null;

        root.dataset.nativeCarouselReady = 'true';
        root.classList.add('native-carousel');
        var index = 0;
        var timer = null;
        var rtl = options.rtl === true || document.documentElement.dir === 'rtl';

        function show(next, notify) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === index;
                slide.hidden = !active;
                slide.classList.toggle('flex-active-slide', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            root.dispatchEvent(new CustomEvent('gantry:carousel-change', { detail: { index: index, source: notify === false ? null : root } }));
        }

        function control(label, className, delta, html) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = className;
            button.setAttribute('aria-label', label);
            button.innerHTML = html || (delta < 0 ? '&#8249;' : '&#8250;');
            button.addEventListener('click', function () { show(index + (rtl ? -delta : delta)); });
            return button;
        }

        if (options.directionNav !== false && slides.length > 1) {
            var nav = document.createElement('div');
            nav.className = 'flex-direction-nav';
            nav.append(
                control('Previous slide', 'flex-prev', -1, options.prevText),
                control('Next slide', 'flex-next', 1, options.nextText)
            );
            root.appendChild(nav);
        }

        if (options.controlNav !== false && slides.length > 1) {
            var dots = document.createElement('ol');
            dots.className = 'flex-control-nav';
            slides.forEach(function (_, slideIndex) {
                var dot = control('Go to slide ' + (slideIndex + 1), slideIndex === 0 ? 'flex-active' : '', 0, String(slideIndex + 1));
                dot.addEventListener('click', function () { show(slideIndex); });
                dots.appendChild(dot);
            });
            root.appendChild(dots);
            root.addEventListener('gantry:carousel-change', function (event) {
                Array.from(dots.children).forEach(function (dot, dotIndex) { dot.classList.toggle('flex-active', dotIndex === event.detail.index); });
            });
        }

        if (options.asNavFor) {
            slides.forEach(function (slide, slideIndex) {
                slide.hidden = false;
                slide.addEventListener('click', function () {
                    var target = document.querySelector(options.asNavFor);
                    if (target) target.dispatchEvent(new CustomEvent('gantry:carousel-select', { detail: { index: slideIndex } }));
                });
            });
        }
        root.addEventListener('gantry:carousel-select', function (event) { show(event.detail.index, false); });

        if (options.sync) {
            root.addEventListener('gantry:carousel-change', function (event) {
                var target = document.querySelector(options.sync);
                if (target && event.detail.source) target.dispatchEvent(new CustomEvent('gantry:carousel-select', { detail: event.detail }));
            });
        }

        if (options.slideshow !== false && slides.length > 1) {
            var delay = Number(options.slideshowSpeed) || 5000;
            function start() { timer = window.setInterval(function () { show(index + 1); }, delay); }
            function stop() { if (timer) window.clearInterval(timer); timer = null; }
            start();
            if (options.pauseOnHover) {
                root.addEventListener('mouseenter', stop);
                root.addEventListener('mouseleave', start);
            }
        }

        show(0);
        return { show: show, slides: slides };
    }

    global.GantryCarousel = { create: create };
}(window));
