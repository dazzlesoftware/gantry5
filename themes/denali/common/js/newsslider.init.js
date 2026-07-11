jQuery.easing.easeOutQuart = function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
};

jQuery(document).ready(function() {
    jQuery('[data-newsslider-id]').each(function(index) {
        var main_container = jQuery(this);
        var slides = '';
        var rtl = main_container.data('newsslider-rtl');
        jQuery('[data-newsslider-slides-id]').each(function(index) {
            slides = jQuery(this);
            jQuery(this).owlCarousel({
                items: 1,
                rtl: rtl,
                loop: false,
                autoplay: false,
                dots: false,
                nav: true,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                navText: ['<i class="fa fa-chevron-up" aria-hidden="true"></i>', '<i class="fa fa-chevron-down" aria-hidden="true"></i>'],
                responsive : {
                    // breakpoint from 0 up
                    0 : {
                        loop: false,
                        dots: false,
                        mouseDrag: true,
                        touchDrag: true,
                    },
                    816 : {
                        mouseDrag: false,
                        touchDrag: false,
                    },
                },
            });
        });

        // Slides Data
        var owl_carousel_slides = slides.data('owl.carousel');

        jQuery('[data-newsslider-carousel-id]').each(function(index) {
            var container = jQuery(this);
            var carouselLength = jQuery('.g-newsslider-carousel-item-container', jQuery(container)).length;

            // Scroll the thumbnails
            jQuery(this).mThumbnailScroller({
                axis:"y",
                type:"hover-precise",
                advanced:{ updateOnSelectorChange: true },
                contentTouchScroll :50,
                markup:{ thumbnailsContainer: jQuery(container) },
                markup:{ thumbnailContainer: jQuery(".g-newsslider-carousel-item-container", jQuery(container)) }
            });

            // Hightlight first slide
            jQuery(".g-newsslider-carousel-item-container:first", jQuery(container)).addClass('current');

            // Perform slides change on click
            jQuery(".g-newsslider-carousel-item-container", jQuery(container)).click(function() {
                // Add proper classes
                jQuery(".g-newsslider-carousel-item-container", jQuery(container)).removeClass('current');
                jQuery(this).addClass('current');

                // Jump to proper slide
                owl_carousel_slides.to(owl_carousel_slides.relative(jQuery(this).index()));
            });

            // Synchronize with slides
            slides.on('changed.owl.carousel', function(event) {
                var current = owl_carousel_slides._current + 1;
                jQuery(".g-newsslider-carousel-item-container", jQuery(container)).removeClass('current');
                jQuery(".g-newsslider-carousel-item-container:nth-child("+ current +")", jQuery(container)).addClass('current');
                jQuery(container).mThumbnailScroller("scrollTo", ".g-newsslider-carousel-item-container.current");
            });
        });

    });
});
