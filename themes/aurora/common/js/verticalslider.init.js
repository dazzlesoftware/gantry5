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
            verticalHeight: main_container.data('verticalslider-height'),
            pager: main_container.data('verticalslider-pager'),
            prevHtml: '<i class="fa fa-chevron-up" aria-hidden="true"></i>',
            nextHtml: '<i class="fa fa-chevron-down" aria-hidden="true"></i>',
            responsive : [
                {
                    breakpoint: Length.toPx(document.body, main_container.data('verticalslider-mobile')),
                    settings: {
                        verticalHeight: main_container.data('verticalslider-mobileheight'),
                    }
                }
            ]
        });
        if (main_container.data('verticalslider-presets')) {
             slider.goToSlide(main_container.data('verticalslider-presets'));
        }

        jQuery( function() {
            jQuery( document ).tooltip({
                items: "[data-thumbnail]",
                position: { my: "left+30 center", at: "right center" },
                content: function() {
                    var element = jQuery( this );
                    if ( element.is( "[data-thumbnail]" ) ) {
                        var text = element.attr("data-thumbnail");
                        return "<img class='map' src='" + text +
                        "'>";
                    }
                }
            });
        } );
    });
});
