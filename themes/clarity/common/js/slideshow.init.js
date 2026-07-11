jQuery(document).ready(function () {
    jQuery('[data-slideshow-id]').each(function (index) {
        var container = jQuery(this);
        var centered = container.data('slideshow-centered');
        var autoplay = container.data('slideshow-autoplay') ? { delay: container.data('slideshow-timeout'), disableOnInteraction: false } : false;
        var touchMove = container.data('slideshow-touchmove');

        var slideSwipe = new Swiper(jQuery(this), {
            speed: container.data('slideshow-speed'),
            loop: container.data('slideshow-loop'),
            allowTouchMove: touchMove,
            centeredSlides: centered,
            autoplay: autoplay,
            direction: container.data('direction'),
            loop: true,
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: container.data('slideshow-effect'),
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
