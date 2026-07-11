jQuery(document).ready(function() {
    jQuery('[data-g-video-carousel-id]').each(function(index) {
        var vcontainer = jQuery(this),
        video = jQuery('video', vcontainer);

        if (!video.length) { return; }

        video.on('play', function() {
            vcontainer.find('.g-video-carousel-local-play').addClass('pause');
        });

        video.on('pause', function() {
            vcontainer.find('.g-video-carousel-local-play').removeClass('pause');
        });

        vcontainer.click(function() {
            jQuery('.g-video-carousel-local-play', vcontainer).toggleClass('pause');
        });

        vcontainer.find('.g-video-carousel-local-play').click(function() {
            var hasVideo = jQuery('video', vcontainer);
            vcontainer.toggleClass('pause');

            hasVideo[0][hasVideo[0].paused ? 'play' : 'pause']();
        });
    });

    // Video loader
    jQuery(".g-video-carousel-youtube").each(function() {
        jQuery(this).css('background-image', 'url(//i.ytimg.com/vi/' + this.id + '/hqdefault.jpg)');
        jQuery(document).delegate('#' + this.id, 'click', function() {
            var iframe_url = "//www.youtube.com/embed/" + this.id + "?autoplay=1&autohide=1";
            if (jQuery(this).data('params')) iframe_url += '&' + jQuery(this).data('params');
            var iframe = jQuery('<iframe/>', {'allowfullscreen':'allowfullscreen', 'frameborder': '0', 'src': iframe_url})
            jQuery(this).append(iframe);
        });
    });
});
