jQuery(document).ready(function () {
    jQuery('[data-featuredvideos-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('featuredvideos-rtl');
        var autoplay = main_container.data('featuredvideos-autoplay');
        var dots = main_container.data('featuredvideos-dots');

        //Carousel
        var carouselOptions = {
            items: 3,
            rtl: rtl,
            nav: true,
            navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
            navContainer: jQuery('.custom-owl-nav', main_container),
            loop: true,
            dots: false,
            autoplay: autoplay,
            autoplayTimeout: main_container.data('featuredvideos-timeout'),
            smartSpeed: main_container.data('featuredvideos-speed'),
            responsive:{
                0:{
                    stagePadding: 0,
                    items: 1,
                },
                600:{
                    stagePadding: 0,
                    items: 2,
                },
                1000:{
                    stagePadding: 50,
                },
                1300:{
                    stagePadding: 140,
                }
            },
        };

        var carousel = jQuery('[data-featuredvideos-carousel-id]', main_container).owlCarousel(carouselOptions);
    });
});
