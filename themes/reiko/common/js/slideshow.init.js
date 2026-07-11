jQuery(document).ready(function () {
    jQuery('[data-slideshow-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('slideshow-rtl');
        var nav = main_container.data('slideshow-nav');
        var autoplay = main_container.data('slideshow-autoplay');
        var dots = main_container.data('slideshow-dots');

        //Carousel
        var carouselOptions = {
            items: 1,
            rtl: rtl,
            nav: nav,
            navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
            loop: true,
            dots: false,
            autoplay: main_container.data('slideshow-autoplay'),
            autoplayTimeout: main_container.data('slideshow-timeout'),
            smartSpeed: main_container.data('slideshow-speed'),
            responsive:{
                0:{
                    stagePadding: 0,
                },
                500:{
                    stagePadding: 100,
                    margin: -10,
                },
                800:{
                    stagePadding: 100,
                    margin: -50,
                },
                1000:{
                    stagePadding: 120,
                    margin: -50,
                },
                1500:{
                    stagePadding: 220,
                    margin: -90,
                },
                1800:{
                    stagePadding: 300,
                    margin: -90,
                }
            },

        };

        var carousel = jQuery('[data-slideshow-carousel-id]', main_container).owlCarousel(carouselOptions);
    });
});
