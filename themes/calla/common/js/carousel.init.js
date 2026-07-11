jQuery(document).ready(function() {
    jQuery('[data-carousel-id]').each(function(index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('carousel-rtl');
        var autoplay = main_container.data('carousel-autoplay');
        var slider = jQuery(main_container).owlCarousel({
            items: 1,
            rtl: rtl,
            autoplay: autoplay,
            autoplayTimeout: jQuery(this).data('carousel-autoplaytimeout'),
            autoplayHoverPause: jQuery(this).data('carousel-pausehover'),
            loop: true,
            nav: jQuery(this).data('carousel-nav'),
            navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
            dots: false,
            startPosition: main_container.data('carousel-preset')
        });
    });
});
