function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-verticalslideshow-id]').forEach(function (container, index) {
        let autoplay = asBool(container.dataset.verticalslideshowAutoplay) ? { delay: container.dataset.verticalslideshowTimeout, disableOnInteraction: false } : false;
        let touchMove = asBool(container.dataset.verticalslideshowTouchmove);

        let slideSwipe = new Swiper(container, {
            speed: container.dataset.verticalslideshowSpeed,
            loop: asBool(container.dataset.verticalslideshowLoop),
            allowTouchMove: touchMove,
            grabCursor: touchMove,
            autoplay: autoplay,
            direction: 'vertical',
            slidesPerView: 2,
            centeredSlides: true,
            spaceBetween: 40,
            initialSlide: 1,
            effect: 'slide',
            navigation: {
                nextEl: '.vswiper-button-next',
                prevEl: '.vswiper-button-prev',
            },
        });
    });
});
