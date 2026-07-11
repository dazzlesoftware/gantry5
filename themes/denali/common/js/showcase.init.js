jQuery.easing.easeOutQuart = function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};

jQuery(document).ready(function () {
    jQuery('[data-showcase-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('showcase-rtl');
        var preset = '';

        if (main_container.data('showcase-preset') == false) {
            preset = 0;
        } else {
            preset = main_container.data('showcase-preset') - 1;
        }

        // Slides
        var slidesOptions = {
            items: 1,
            rtl: rtl,
            responsiveClass: true,
            loop: false,
            dots: false,
            navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
            mouseDrag: true,
            touchDrag: true,
            pullDrag: true,
            nav: true,
            startPosition: preset,
        };

        var slides = jQuery('[data-showcase-slides-id]', main_container);
        slides.owlCarousel(slidesOptions);
        // Fire animation on change
        slides.on('translated.owl.carousel', function (event) {
            jQuery(".owl-item.active .g-showcase-slides-slide").addClass('finished');
        })
        slides.on('translate.owl.carousel', function (event) {
            jQuery(".owl-item.active .g-showcase-slides-slide").removeClass('finished');
        })

        var $first = jQuery('.g-showcase-slides-set:first', '.g-showcase-slides');
        var $last = jQuery('.g-showcase-slides-set:last', '.g-showcase-slides');

        // Have the first and last li's set to a variable
        jQuery(".owl-next", main_container).click(function () {

            var $next;
            var $selected = jQuery(".active", main_container);
            // get the selected item
            // If next li is empty , get the first
            $next = $selected.next('.g-showcase-slides-set', main_container).length ? $selected.next('.g-showcase-slides-set', main_container) : $first;
            $selected.removeClass("active");
            $next.addClass('active');
        });

        jQuery(".owl-prev", main_container).click(function () {
            var $prev,
                $selected = jQuery(".active", main_container);
            // get the selected item
            // If prev li is empty , get the last
            $prev = $selected.prev('.g-showcase-slides-set', main_container).length ? $selected.prev('.g-showcase-slides-set', main_container) : $last;
            $selected.removeClass("active");
            $prev.addClass('active');
        });

    });
});