jQuery(document).ready(function() {
    jQuery('[data-slider-id]').each(function(index) {
        var main_container = jQuery(this);
        var slides = '';
        var carousel = '';
        var rtl = main_container.data('slider-rtl');
        jQuery('[data-slider-slides-id]').each(function(index) {
            slides = jQuery(this);
            jQuery(this).owlCarousel({
                items: 1,
                rtl: rtl,
                loop: main_container.data('slider-loop'),
                dots: false,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                mouseDrag: false,
                touchDrag: false,
            });
        });
        jQuery('[data-slider-carousel-id]').each(function(index) {
            carousel = jQuery(this);
            slider_items = main_container.data('slider-items');
            jQuery(this).owlCarousel({
                items: slider_items,
                rtl: rtl,
                nav: carousel.data('slider-carousel-nav'),
                navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
                loop: main_container.data('slider-loop'),
                dots: false,
                responsive:{
                    0: {
                        items: 3,
                    },
                    750: {
                        items: slider_items,
                    },
                    1300: {
                        items: slider_items
                    }
                },
            });

            // Hightlight first slide
            jQuery('.owl-item.active:first', carousel).addClass('owl-current');

            // Perform slides change on click
            carousel.on('click', '.owl-item', function(e) {
                // Add proper classes
                jQuery('.owl-item', carousel).removeClass('owl-current');
                jQuery(this).addClass('owl-current');

                // Jump to proper slide
                var owl_carousel = slides.data('owl.carousel');
                owl_carousel.to(owl_carousel.relative(jQuery(this).index()));
            });
        });
    });
});
