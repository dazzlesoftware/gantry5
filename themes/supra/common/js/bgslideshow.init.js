jQuery(document).ready(function() {
    jQuery('[data-bgslideshow-id]').each(function(index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('bgslideshow-rtl');
        var slides = jQuery('[data-bgslideshow-slides-id]', main_container).owlCarousel({
            items: 1,
            rtl: rtl,
            loop: false,
            dots: false,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            mouseDrag: false,
            touchDrag: false,
        });

        var owl_carousel_slides = slides.data('owl.carousel');

        var carousel = jQuery('[data-bgslideshow-carousel-id]', main_container).owlCarousel({
            items: main_container.data('bgslideshow-items'),
            rtl: rtl,
            nav: true,
            loop: false,
            dots: false,
            responsive:{
                0: {
                    items: main_container.data('bgslideshow-itemssmallmobile'),
                },
                500: {
                    items: main_container.data('bgslideshow-itemsmobile'),
                },
                750: {
                    items: main_container.data('bgslideshow-itemstablet'),
                },
                1300: {
                    items: main_container.data('bgslideshow-items')
                }
            },
            navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
        });

            // Hightlight first slide
            jQuery('.owl-item:first', carousel).addClass('owl-current');

            // Perform slides change on click
            jQuery(".owl-item", jQuery(carousel)).click(function() {

                // Add proper classes
                jQuery('.owl-item', carousel).removeClass('owl-current');
                jQuery(this).addClass('owl-current');

                // Jump to proper slide
                owl_carousel_slides.to(owl_carousel_slides.relative(jQuery(this).index()));

                // Jump to BG Slide
                jQuery(main_container.data('vegas-element')).vegas('jump', jQuery(this).index());
            });

            jQuery(main_container.data('vegas-element')).on('vegaswalk', function (e, index, slideSettings) {
                jQuery('.owl-item', carousel).removeClass('owl-current');
                jQuery(".owl-item:eq( " + index + " )", carousel).addClass('owl-current');
                owl_carousel_slides.to(owl_carousel_slides.relative(index));

                // Scroll to active element when not in a viewport
                if (jQuery(".owl-item.active:eq( " + index + " )", carousel).hasClass('owl-current') == false) {
                    carousel.data('owl.carousel').to(carousel.data('owl.carousel').relative(index));
                }
            });
        });
});
