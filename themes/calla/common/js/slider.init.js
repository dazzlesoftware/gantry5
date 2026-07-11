jQuery.easing.easeOutQuart = function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};

jQuery(document).ready(function () {
    jQuery('[data-slider-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('slider-rtl');
        var nav = main_container.data('slider-nav');
        var slider_items = main_container.data('slider-items');
        var slider_items_tablet = main_container.data('slider-itemstablet');
        var slider_items_mobile = main_container.data('slider-itemsmobile');
        var slider_items_smallmobile = main_container.data('slider-itemssmallmobile');
        var autoplay = main_container.data('slider-autoplay');

        //Carousel
        var carouselOptions = {
            items: 1,
            margin: 40,
            center: true,
            autoplay: autoplay,
            rtl: rtl,
            nav: nav,
            navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
            loop: true,
            dots: false
        };

        // Responsive - Mobile
        carouselOptions['responsive'] = {};
        carouselOptions['responsive'][0] = {};
        carouselOptions['responsive'][0]['items'] = slider_items_smallmobile;
        carouselOptions['responsive'][Length.toPx(document.body, main_container.data('slider-mobile'))] = {};
        carouselOptions['responsive'][Length.toPx(document.body, main_container.data('slider-mobile'))]['items'] = slider_items_mobile;
        carouselOptions['responsive'][Length.toPx(document.body, main_container.data('slider-tablet'))] = {};
        carouselOptions['responsive'][Length.toPx(document.body, main_container.data('slider-tablet'))]['items'] = slider_items_tablet;
        carouselOptions['responsive'][Length.toPx(document.body, main_container.data('slider-desktop'))] = {};
        carouselOptions['responsive'][Length.toPx(document.body, main_container.data('slider-desktop'))]['items'] = slider_items;

        var carousel = jQuery('[data-slider-carousel-id]', main_container).owlCarousel(carouselOptions);
    });
});
