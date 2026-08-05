(function () {
    'use strict';

    document.querySelectorAll('[data-toprated-id]').forEach(function (container) {
        let slider = container.querySelector('.g-toprated-slider');
        if (!slider) return;

        slider.style.display = 'flex';
        slider.style.overflowX = 'auto';
        slider.style.scrollBehavior = 'smooth';
        slider.style.scrollSnapType = 'x mandatory';

        Array.from(slider.children).forEach(function (item) {
            item.style.scrollSnapAlign = 'start';
        });

        let nav = container.querySelector('.g-toprated-nav');
        if (nav && container.dataset.topratedNav === 'true') {
            ['Previous', 'Next'].forEach(function (label, index) {
                let button = document.createElement('button');
                button.type = 'button';
                button.className = 'g-toprated-' + label.toLowerCase();
                button.setAttribute('aria-label', label);
                button.textContent = index ? '›' : '‹';
                button.addEventListener('click', function () {
                    slider.scrollBy({ left: (index ? 1 : -1) * slider.clientWidth, behavior: 'smooth' });
                });
                nav.appendChild(button);
            });
        }

        container.querySelectorAll('.g-toprated-filtering [data-toprated-group]').forEach(function (filter) {
            filter.addEventListener('click', function () {
                let group = filter.dataset.topratedGroup;
                container.querySelectorAll('.g-toprated-filtering [data-toprated-group]').forEach(function (item) {
                    item.classList.toggle('active', item === filter);
                });
                Array.from(slider.children).forEach(function (item) {
                    item.hidden = group !== 'all' && item.dataset.topratedGroup !== group;
                });
                slider.scrollLeft = 0;
            });
        });
    });
}());
