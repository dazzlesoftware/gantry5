(function () {
    'use strict';

    document.querySelectorAll('[data-swipercarousel-id]').forEach(function (carousel) {
        var id = carousel.id.replace(/^g-swipercarousel-/, '');
        var panelRoot = document.getElementById('g-swipercarousel-panel-' + id);
        var panels = panelRoot ? Array.from(panelRoot.querySelectorAll('.g-swipercarousel-panel')) : [];

        function select(index) {
            panels.forEach(function (panel, panelIndex) {
                panel.classList.toggle('selected', panelIndex === index);
                panel.setAttribute('aria-current', panelIndex === index ? 'true' : 'false');
            });
        }

        carousel.addEventListener('genesis:swiper:change', function (event) { select(event.detail.activeIndex); });
        panels.forEach(function (panel, index) {
            panel.addEventListener('click', function () {
                var instance = carousel.genesisSwiper && carousel.genesisSwiper.instance;
                if (instance) {
                    if (typeof instance.slideToLoop === 'function') instance.slideToLoop(index);
                    else instance.slideTo(index);
                }
                select(index);
            });
        });
        select(0);
    });
}());
