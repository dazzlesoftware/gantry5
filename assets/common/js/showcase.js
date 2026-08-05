(() => {
    'use strict';

    const enabled = value => ['1', 'true', 'enabled', 'yes'].includes(String(value).toLowerCase());
    const initialize = (root = document) => {
        const elements = root.matches?.('[data-showcase-id]')
            ? [root]
            : Array.from(root.querySelectorAll?.('[data-showcase-id]') || []);
        elements.forEach(container => {
            if (container.dataset.genesisShowcaseReady === 'true') return;
            container.dataset.genesisShowcaseReady = 'true';
            const touchMove = enabled(container.dataset.showcaseTouchmove);
            container.genesisShowcase = new Swiper(container, {
                autoplay: enabled(container.dataset.showcaseAutoplay) ? {
                    delay: Number(container.dataset.showcaseTimeout) || 5000,
                    disableOnInteraction: false
                } : false,
                allowTouchMove: touchMove,
                centeredSlides: false,
                direction: container.dataset.showcaseDirection || 'horizontal',
                effect: container.dataset.showcaseEffect || 'slide',
                fadeEffect: { crossFade: true },
                grabCursor: touchMove,
                loop: enabled(container.dataset.showcaseLoop),
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
                speed: Number(container.dataset.showcaseSpeed) || 500
            });
        });
    };

    initialize();
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) initialize(node);
    }))).observe(document.documentElement, { childList: true, subtree: true });
})();
