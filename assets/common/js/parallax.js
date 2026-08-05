(function () {
    'use strict';

    let elements = [];
    let scheduled = false;

    function number(value, fallback) {
        let parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function render() {
        let scrollY = window.scrollY || window.pageYOffset;
        elements.forEach(function (element) {
            let ratio = number(element.dataset.enllaxRatio, 0);
            let offset = number(element.dataset.enllaxOffset, 0);
            let position = Math.round(scrollY * ratio + offset);

            if (element.dataset.enllaxType === 'background') {
                element.style.backgroundPositionY = position + 'px';
            } else {
                element.style.transform = 'translate3d(0,' + position + 'px,0)';
            }
        });
        scheduled = false;
    }

    function schedule() {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(render);
        }
    }

    function init() {
        elements = Array.from(document.querySelectorAll('[data-enllax-ratio]'));
        if (!elements.length) return;
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
