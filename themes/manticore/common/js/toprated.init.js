jQuery(document).ready(function () {
    jQuery('[data-toprated-id]').each(function(index) {
        var container = jQuery(this);
        var slider = jQuery('.g-toprated-slider', this);

        var slides = container.data('toprated-slides');
        var slides_scroll = container.data('toprated-slides-scroll');
        var nav = container.data('toprated-nav');
        var autoplay = container.data('toprated-autoplay');
        var autoplay_timeout = container.data('toprated-autoplay-timeout');
        var loop = container.data('toprated-loop');
        var rtl = container.data('toprated-rtl');

        slider.slick({
            slidesToShow: slides,
            slidesToScroll: slides_scroll,
            arrows: nav,
            appendArrows: jQuery('.g-toprated-nav', container),
            autoplay: autoplay,
            autoplaySpeed: parseInt(autoplay_timeout),
            infinite: loop,
            rtl: rtl,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 4,
                    }
                },
                {
                    breakpoint: 815,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 700,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                    }
                }
            ]
        });

        jQuery('.g-toprated-filtering span[data-toprated-group]', container).on('click', function() {
            var current = jQuery(this);
            var group = current.data('toprated-group');

            jQuery(this).parent().find('.g-toprated-group').each(function(index) {
                jQuery(this).removeClass('active');
            });

            current.addClass('active');

            if(group !== 'all') {
                slider.slick('slickUnfilter');
                slider.slick('slickFilter','[data-toprated-group="' + group + '"]');
            } else {
                slider.slick('slickUnfilter');
            }
        });
    });
});
