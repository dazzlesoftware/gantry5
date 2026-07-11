jQuery(document).ready(function() {
    jQuery('[data-panelslider-id]').each(function(index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('panelslider-rtl');
        var panel_items = main_container.data('panelslider-items');
        var owlnav = main_container.data('panelslider-nav');

        var slides = jQuery('[data-panelslider-slides-id]', main_container).owlCarousel({
            items: 1,
            rtl: rtl,
            dots: false,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            mouseDrag: false,
            touchDrag: false,
        });

        var owl_carousel_slides = slides.data('owl.carousel');

        var carousel =  jQuery('[data-panelslider-carousel-id]', main_container).owlCarousel({
            items: main_container.data('panelslider-items'),
            rtl: rtl,
            nav: owlnav,
            navText: ['<i class="fa fa-chevron-circle-left"></i>', '<i class="fa fa-chevron-circle-right"></i>'],
            dots: false,
            responsive:{
                0: {
                    items: 1,
                },
                480: {
                    items: 2,
                },
                700: {
                    items: 3,
                },
                1300: {
                    items: panel_items
                }
            },
        });

        // Highlight First Slide
        jQuery('.owl-item:first', jQuery(carousel)).addClass('owl-current');

        // Sync Slides
        jQuery(".owl-item", jQuery(carousel)).click(function() {
            jQuery('.owl-item', jQuery('[data-panelslider-carousel-id]', main_container)).removeClass('owl-current');
            jQuery(this).addClass('owl-current');
            owl_carousel_slides.to(owl_carousel_slides.relative(jQuery(this).index()));
        });
    });
});

