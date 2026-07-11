jQuery.easing.easeOutQuart = function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
};

jQuery(document).ready(function() {
    var $window = jQuery(window);
    var window_width = $window.width();

    jQuery('[data-testimonialslider-id]').each(function(index) {
        var main_container = jQuery(this);
        var matchheight = main_container.data('testimonialslider-matchheight');
        var speed = main_container.data('testimonialslider-speed');
        var rtl = main_container.data('testimonialslider-rtl');
        var mobile_width = Length.toPx(document.body, main_container.data('testimonialslider-mobile'));

        if (matchheight === "enabled") {
            jQuery('.g-testimonialslider-carousel', main_container).matchHeight({
                target: jQuery(main_container).closest('.g-block'),
            });
        }

        jQuery('[data-testimonialslider-carousel-id]').each(function(index) {
            var container = jQuery(this);
            var type = "click-50";
            var contentTouchScroll = false;

            if (window_width > mobile_width) {
                type = "hover-precise";
                contentTouchScroll = 25;
            }

            // Scroll the thumbnails
            jQuery(this).mThumbnailScroller({
                axis: "y",
                type: type,
                speed: speed,
                contentTouchScroll: contentTouchScroll,
                markup: { thumbnailsContainer: jQuery(container) },
                markup: { thumbnailContainer: jQuery(".g-testimonialslider-carousel-item-container", jQuery(container)) },
                markup: { buttonsHTML:{ up:"SVG set 2",down:"SVG set 2",left:"SVG set 2",right:"SVG set 2" } },
            });
        });
    });
});
