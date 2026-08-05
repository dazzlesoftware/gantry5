(() => {
    'use strict';

    const enabled = value => ['1', 'true', 'enabled', 'yes'].includes(String(value).toLowerCase());
    const initialize = (root = document) => {
        const elements = root.matches?.('[data-slideshow-id]')
            ? [root]
            : Array.from(root.querySelectorAll?.('[data-slideshow-id]') || []);
        elements.forEach(container => {
            if (container.dataset.genesisSlideshowReady === 'true') return;
            container.dataset.genesisSlideshowReady = 'true';
            const touchMove = enabled(container.dataset.slideshowTouchmove);
            const breakpoint = Length.toPx(document.body, container.dataset.slideshowMobileBreakpoint);
            container.genesisSlideshow = new Swiper(container, {
                autoplay: enabled(container.dataset.slideshowAutoplay) ? {
                    delay: Number(container.dataset.slideshowTimeout) || 5000,
                    disableOnInteraction: false
                } : false,
                allowTouchMove: touchMove,
                breakpoints: breakpoint ? { [breakpoint]: { slidesPerView: 1.2 } } : undefined,
                centeredSlides: true,
                direction: container.dataset.slideshowDirection || 'horizontal',
                effect: container.dataset.slideshowEffect || 'slide',
                fadeEffect: { crossFade: true },
                grabCursor: touchMove,
                loop: enabled(container.dataset.slideshowLoop),
                navigation: {
                    nextEl: container.querySelector('.swiper-button-next'),
                    prevEl: container.querySelector('.swiper-button-prev')
                },
                pagination: {
                    el: container.querySelector('.swiper-pagination'),
                    type: 'bullets',
                    clickable: true
                },
                slidesPerView: 1,
                speed: Number(container.dataset.slideshowSpeed) || 500
            });
        });
    };

    initialize();
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) initialize(node);
    }))).observe(document.documentElement, { childList: true, subtree: true });
})();
