jQuery(document).ready(function () {
    jQuery('[data-slider-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('slider-rtl');
        var autoplay = main_container.data('slider-autoplay');
        var dots = main_container.data('slider-dots');

        //Carousel
        var carouselOptions = {
            items: 4,
            rtl: rtl,
            nav: true,
            navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
            navContainer: jQuery('.custom-owl-nav', main_container),
            loop: true,
            dots: false,
            autoplay: autoplay,
            autoplayTimeout: main_container.data('slider-timeout'),
            smartSpeed: main_container.data('slider-speed'),
            responsive:{
                0:{
                    stagePadding: 0,
                    items: 1,
                },
                600:{
                    stagePadding: 0,
                    items: 2,
                },
                800:{
                    stagePadding: 40,
                    items: 2,
                },
                1000:{
                    items: 3,
                    stagePadding: 30,
                },
                1300:{
                    items: 3,
                    stagePadding: 100,
                },
                1500:{
                    items: 4,
                    stagePadding: 140,
                }
            },
        };

        var carousel = jQuery('[data-slider-carousel-id]', main_container).owlCarousel(carouselOptions);
    });
});
