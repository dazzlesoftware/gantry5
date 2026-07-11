jQuery.easing.easeOutQuart = function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};

jQuery(document).ready(function () {
    jQuery('[data-slider-id]').each(function (index) {
        var main_container = jQuery(this);
        var rtl = main_container.data('slider-rtl');
        var slider_items = main_container.data('slider-items');
        var slider_items_tablet = main_container.data('slider-itemstablet');
        var slider_items_mobile = main_container.data('slider-itemsmobile');
        var slider_items_smallmobile = main_container.data('slider-itemssmallmobile');
        var autoplay = main_container.data('slider-autoplay');
        var preset = '';

        if (main_container.data('slider-preset') == false) {
            preset = 0;
        } else {
            preset = main_container.data('slider-preset') - 1;
        }

        // Slides
        var slidesOptions = {
            items: 1,
            rtl: rtl,
            loop: false,
            dots: main_container.data('slider-dots'),
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            mouseDrag: false,
            touchDrag: false,
            autoplay: autoplay,
            autoplayTimeout: main_container.data('slider-timeout'),
            afterMove: moved,
            startPosition: preset,
        };
        
        var slides = jQuery('[data-slider-slides-id]', main_container).owlCarousel(slidesOptions).on('changed.owl.carousel', function (event) {
            carousel.trigger('to.owl.carousel', [event.item.index, 300, true]);
            // (Optional) Remove .current class from all items
            carousel.find('.owl-current').removeClass('owl-current');
            // (Optional) Add .current class to current active item
            carousel.find('.owl-item').eq(event.item.index).addClass('owl-current');
           
           // Autoplay Jump
            if (autoplay == true) {
                var currentItem = event.item.index;
                var item_count = parseInt(slides.find('.owl-item').length);
                
                if (currentItem + 1 === item_count) {
                    setTimeout(function () {
                        slides.trigger('to.owl.carousel', 0);
                    }, 5000);

                }
            }
        })

        function moved() {
            var owl = slides.data('owl-carousel');
            if (owl.currentItem + 1 === owl.itemsAmount) {
                alert('THE END');
            }
        }

        //Carousel
        var carouselOptions = {
            items: slider_items,
            rtl: rtl,
            nav: jQuery('[data-slider-carousel-id]', main_container).data('slider-carousel-nav'),
            navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
            loop: false,
            dots: false,
            startPosition: preset,
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

        var carousel = jQuery('[data-slider-carousel-id]', main_container).owlCarousel(carouselOptions).on('click', '.owl-item', function (event) {
            slides.trigger('to.owl.carousel', [jQuery(event.target).parents('.owl-item').index(), 1, true]);
        });
        jQuery(".owl-item.active:nth-child("+ (preset + 1) +")", carousel).addClass('owl-current');
    });
});