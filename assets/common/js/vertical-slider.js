(function () {
    'use strict';

    function bool(value) {
        return value === 'true' || value === '1';
    }

    document.querySelectorAll('[data-verticalslider-id]').forEach(function (container) {
        let list = container.querySelector('ul');
        if (!list) return;

        let slides = Array.from(list.children);
        if (!slides.length) return;

        let index = Math.max(0, Number.parseInt(container.dataset.verticalsliderPresets || '1', 10) - 1);
        let loop = bool(container.dataset.verticalsliderLoop);
        let interval;

        function show(next) {
            if (loop) next = (next + slides.length) % slides.length;
            index = Math.max(0, Math.min(next, slides.length - 1));
            slides.forEach(function (slide, slideIndex) {
                slide.hidden = slideIndex !== index;
                slide.classList.toggle('active', slideIndex === index);
            });
        }

        function button(label, className, direction) {
            let control = document.createElement('button');
            control.type = 'button';
            control.className = className;
            control.setAttribute('aria-label', label);
            control.innerHTML = '<i class="fa fa-chevron-' + direction + '" aria-hidden="true"></i>';
            return control;
        }

        if (bool(container.dataset.verticalsliderControls)) {
            let previous = button('Previous slide', 'g-verticalslider-prev', 'up');
            let next = button('Next slide', 'g-verticalslider-next', 'down');
            previous.addEventListener('click', function () { show(index - 1); });
            next.addEventListener('click', function () { show(index + 1); });
            container.append(previous, next);
        }

        container.querySelectorAll('[data-thumbnail]').forEach(function (element) {
            element.addEventListener('mouseenter', function () {
                element.style.setProperty('--verticalslider-thumbnail', 'url("' + element.dataset.thumbnail + '")');
            });
        });

        show(index);
        if (bool(container.dataset.verticalsliderAuto)) {
            interval = window.setInterval(function () { show(index + 1); }, Number(container.dataset.verticalsliderPause) || 5000);
            container.addEventListener('mouseenter', function () { window.clearInterval(interval); });
        }
    });
}());
