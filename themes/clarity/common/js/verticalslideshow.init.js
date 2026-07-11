jQuery(document).ready(function () {
    jQuery('[data-verticalslideshow-id]').each(function (index) {
        var container = jQuery(this);
        var autoplay = container.data('verticalslideshow-autoplay') ? { delay: container.data('verticalslideshow-timeout'), disableOnInteraction: false } : false;
        var touchMove = container.data('verticalslideshow-touchmove');

        var slideSwipe = new Swiper(jQuery(this), {
            speed: container.data('verticalslideshow-speed'),
            loop: container.data('verticalslideshow-loop'),
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
