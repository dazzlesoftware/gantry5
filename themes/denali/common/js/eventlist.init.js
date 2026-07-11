jQuery.easing.easeOutQuart = function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};

jQuery(document).ready(function () {
    jQuery('[data-eventlist-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('eventlist-rtl');
        var preset = '';
        if (main_container.data('eventlist-preset') == false) {
            preset = 0;
        } else {
            preset = main_container.data('eventlist-preset') - 1;
        }

        // Slides
        var slidesOptions = {
            items: 1,
            rtl: rtl,
            loop: false,
            dots: false,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            mouseDrag: false,
            touchDrag: false,
            startPosition: preset,
        };

        // Responsive - Mobile
        slidesOptions['responsive'] = {};
        slidesOptions['responsive'][0] = {};
        slidesOptions['responsive'][0]['items'] = 1;
        slidesOptions['responsive'][0]['mouseDrag'] = true;
        slidesOptions['responsive'][0]['touchDrag'] = true;
        slidesOptions['responsive'][Length.toPx(document.body, main_container.data('eventlist-mobile'))] = {};
        slidesOptions['responsive'][Length.toPx(document.body, main_container.data('eventlist-mobile'))]['items'] = 1;

        var slides = jQuery('.g-eventlist-carousel', main_container).owlCarousel(slidesOptions);
        var owl = slides.data('owl-carousel')

        jQuery('.g-eventlist-item', main_container).click(function() {
            jQuery('.g-eventlist-item', main_container).removeClass('selected');
            jQuery(this).addClass('selected');
            slides.trigger('to.owl.carousel', jQuery(this).index() - 1)
        });
    });
});