jQuery(document).ready(function () {
    jQuery('[data-slideshow-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('slideshow-rtl');
        var autoplay = main_container.data('slideshow-autoplay');
        var dots = main_container.data('slideshow-dots');

        //Carousel
        var carouselOptions = {
            items: 1,
            rtl: rtl,
            nav: false,
            navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
            loop: true,
            dots: dots,
            autoplay: autoplay,
            autoplayTimeout: main_container.data('slideshow-timeout'),
            smartSpeed: main_container.data('slideshow-speed'),
            startPosition: main_container.data('slideshow-preset'),
        };

        var carousel = jQuery('[data-slideshow-carousel-id]', main_container).owlCarousel(carouselOptions);
    });
});
