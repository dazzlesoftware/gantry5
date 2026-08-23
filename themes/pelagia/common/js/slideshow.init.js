function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slideshow-id]').forEach(function (container, index) {
        let autoplay = asBool(container.dataset.slideshowAutoplay) ? { delay: container.dataset.slideshowTimeout, disableOnInteraction: false } : false;
        let touchMove = asBool(container.dataset.slideshowTouchmove);

        let slideSwipe = new Swiper(container, {
            speed: container.dataset.slideshowSpeed,
            loop: asBool(container.dataset.slideshowLoop),
            allowTouchMove: touchMove,
            autoplay: autoplay,
            pagination: {
                el: '.swiper-pagination',
                type: 'progressbar',
                clickable: true,
            },
            navigation: {
                nextEl: '.sswiper-button-next',
                prevEl: '.sswiper-button-prev',
            },
            effect: container.dataset.slideshowEffect,
            fadeEffect: {
                crossFade: true
            },
            coverflowEffect: {
                rotate: 30,
                slideShadows: false,
            },
            flipEffect: {
                rotate: 30,
                slideShadows: false,
            },
            cubeEffect: {
                slideShadows: false,
            },
        });
    });
});
