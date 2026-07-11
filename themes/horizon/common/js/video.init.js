jQuery(document).ready(function() {
    jQuery('[data-g-video-id]').each(function(index) {
        var vcontainer = jQuery(this),
            video = jQuery('video', vcontainer);

        if (!video.length) { return; }

        video.on('play', function() {
            vcontainer.find('.g-videolocal-play').addClass('pause');
            jQuery('.g-video-captions').hide();
        });

        video.on('pause', function() {
            vcontainer.find('.g-videolocal-play').removeClass('pause');
            jQuery('.g-video-captions').show();
        });

        vcontainer.click(function() {
            jQuery('.g-videolocal-play', vcontainer).toggleClass('pause');
            jQuery('.g-video-captions').hide();
        });

        vcontainer.find('.g-videolocal-play').click(function() {
            var hasVideo = jQuery('video', vcontainer);
            vcontainer.toggleClass('pause');
            jQuery('.g-video-captions').hide();

            hasVideo[0][hasVideo[0].paused ? 'play' : 'pause']();
        });
    });
});
