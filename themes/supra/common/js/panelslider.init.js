jQuery(document).ready(function() {
    jQuery('[data-panelslider-id]').each(function(index) {
        var main_container = jQuery(this);
        var slides = '';
        var carousel = '';
        var rtl = main_container.data('panelslider-rtl');
        jQuery('[data-panelslider-slides-id]').each(function(index) {
            slides = jQuery(this);
            jQuery(this).owlCarousel({
                items: 1,
                rtl: rtl,
                dots: false,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                mouseDrag: false,
                touchDrag: false,
            });
        });
        jQuery('[data-panelslider-carousel-id]').each(function(index) {
            carousel = jQuery(this);
            panel_items = main_container.data('panelslider-items');
            jQuery(this).owlCarousel({
                items: main_container.data('panelslider-items'),
                rtl: rtl,
                nav: true,
                dots: false,
                            navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
                responsive:{
                    0: {
                        items: 2,
                    },
                    750: {
                        items: 4,
                    },
                    1300: {
                        items: panel_items
                    }
                },
            });

            // Hightlight first slide
            jQuery('.owl-item:first', carousel).addClass('owl-current');

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
