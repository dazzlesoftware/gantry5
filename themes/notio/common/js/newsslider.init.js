jQuery(document).ready(function () {
    jQuery(function () {
        if (jQuery('#g-sidebar-top').length && navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
            jQuery('#g-container-header .g-newsslider-carousel').matchHeight({
                target: jQuery('#g-sidebar-top'),
            });
        }
    });
});

jQuery.easing.easeOutQuart = function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};

jQuery(document).ready(function () {
    jQuery('[data-newsslider-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('newsslider-rtl');
        jQuery('[data-newsslider-slides-id]', main_container).each(function (index) {
            slides = jQuery(this);
            jQuery(this).owlCarousel({
                items: 1,
                rtl: rtl,
                loop: false,
                dots: false,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
                responsive: {
                    // breakpoint from 0 up
                    0: {
                        loop: true,
                        dots: false,
                        mouseDrag: true,
                        touchDrag: true,
                    },
                    816: {
                        mouseDrag: false,
                        touchDrag: false,
                    },
                }
            });
        });
        jQuery('[data-newsslider-carousel-id]', main_container).each(function (index) {
            var container = jQuery(this);

            // Scroll the thumbnails
            jQuery(this).mThumbnailScroller({
                axis: "y",
                type: "hover-precise",
                contentTouchScroll: 50,
                markup: { thumbnailsContainer: jQuery(container) },
                markup: { thumbnailContainer: jQuery(".g-newsslider-carousel-item-container", jQuery(container)) }
            });

            // Hightlight first slide
            jQuery(".g-newsslider-carousel-item-container:first", jQuery(container)).addClass('current');

            var autoplay = slides.attr('data-newsslider-autoplay');
            var autoplay_interval = slides.attr('data-newsslider-autoplay_interval');
            var loop = slides.attr('data-newsslider-loop');

            if (autoplay == 'enabled') {
                // Autplay & Loop
                setInterval(function () {
                    // Add proper classes
                    var current = jQuery(".g-newsslider-carousel-item-container", jQuery(container)).parent().find('.current');
                    current.next().trigger("click");
                    if (loop == 'enabled') {


                        if (current.is(':last-child')) {
                            jQuery(".g-newsslider-carousel-item-container:first", jQuery(container)).trigger("click");
                        }
                    }

                }, autoplay_interval);
            }



            // Perform slides change on click
            jQuery(".g-newsslider-carousel-item-container", jQuery(main_container)).click(function () {
                // Add proper classes
                jQuery(".g-newsslider-carousel-item-container", jQuery(main_container)).removeClass('current');
                jQuery(this).addClass('current');

                // Jump to proper slide
                var owl_carousel = jQuery('[data-newsslider-slides-id]', main_container).data('owl.carousel');
                owl_carousel.to(owl_carousel.relative(jQuery(this).index()));
            });
        });
    });
});
