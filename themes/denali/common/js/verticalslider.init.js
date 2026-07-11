jQuery(document).ready(function() {
    jQuery('[data-verticalslider-id]').each(function(index) {
        var main_container = jQuery(this);
        var slider = jQuery('ul', main_container).lightSlider({
            item:1,
            vertical:true,
            slideMargin:0,
            mode: 'slide',
            speed: main_container.data('verticalslider-speed'),
            auto: main_container.data('verticalslider-auto'),
            pause: main_container.data('verticalslider-pause'),
            loop: main_container.data('verticalslider-loop'),
            controls: main_container.data('verticalslider-controls'),
            verticalHeight: 1000,
            pager: false,
            prevHtml: '<i class="fa fa-angle-up" aria-hidden="true"></i>',
            nextHtml: '<i class="fa fa-angle-down" aria-hidden="true"></i>',
            responsive : [
                {
                    breakpoint: Length.toPx(document.body, main_container.data('verticalslider-mobile')),
                    settings: {
                        verticalHeight: 2500,
                        enableTouch: false
                    }
                }
            ],
            onAfterSlide: function (el) {
                jQuery(".active .g-verticalslider-image1").addClass('finished');
                jQuery(".active .g-verticalslider-image2").addClass('finished');
                jQuery(".active .g-verticalslider-image3").addClass('finished');
                jQuery(".active .g-verticalslider-content-floatingimage").addClass('finished');
            },
            onBeforeSlide: function (el) {
                jQuery(".active .g-verticalslider-image1").removeClass('finished');
                jQuery(".active .g-verticalslider-image2").removeClass('finished');
                jQuery(".active .g-verticalslider-image3").removeClass('finished');
                jQuery(".active .g-verticalslider-content-floatingimage").removeClass('finished');
            },
        });
        if (main_container.data('verticalslider-presets')) {
             slider.goToSlide(main_container.data('verticalslider-presets'));
        }
    });
});
