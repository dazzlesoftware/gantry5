jQuery(document).ready(function () {
    jQuery('[data-testimonials-id]').each(function (index) {
        var container = jQuery(this);
        var slider = jQuery(".g-testimonials-container", container);
        var pagination = jQuery(".g-testimonials-pagination", container);
        var autoplay = container.data('testimonials-autoplay') ? {delay: container.data('testimonials-timeout'), disableOnInteraction: false} : false;

        var galleryThumbs = new Swiper(pagination, {
            spaceBetween: 40,
            slidesPerView: 4,
            freeMode: true,
            allowTouchMove: false,
            noSwiping: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
        });

        var testiSwiper = new Swiper(slider, {
            spaceBetween: 10,
            slidesOffsetBefore: 80,
            speed: container.data('testimonials-speed'),
            loop: container.data('testimonials-loop'),
            autoplay: autoplay,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: galleryThumbs
            }
        });
    });
});
