function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slideshow-id]').forEach(function (container, index) {
        let autoplay = asBool(container.dataset.slideshowAutoplay) ? { delay: container.dataset.slideshowTimeout, disableOnInteraction: false } : false;
        let touchMove = asBool(container.dataset.slideshowTouchmove);

        let slideSwipe = new Swiper(container, {
            speed: container.dataset.slideshowSpeed,
            loop: asBool(container.dataset.slideshowLoop),
            allowTouchMove: touchMove,
            grabCursor: touchMove,
            autoplay: autoplay,
            direction: container.dataset.direction,
            loop: true,
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
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
