jQuery(document).ready(function () {
    jQuery('[data-miniplayer-id]').each(function(index) {
        var playerContainer = jQuery(this);

        // settings
        var clientId = jQuery(this).attr("data-miniplayer-clientid");

        jQuery('[data-miniplayer-audio-track]', playerContainer).each(function(index) {
            var trackId = jQuery(this).attr("data-miniplayer-audio-track");
            var trackContainer = jQuery(this);

            // DOM elements
            var artwork = jQuery(".g-miniplayer-artwork", trackContainer);
            var band = jQuery('.g-miniplayer-band', trackContainer);
            var song = jQuery('.g-miniplayer-track', trackContainer);

            // Injecting infos
            artwork.attr('src', jQuery(this).attr("data-miniplayer-audio-cover")); // Cover (replacing the default image size "large" with "crop")
            band.html(jQuery(this).attr("data-miniplayer-audio-artist")); // Band Name
            song.html(jQuery(this).attr("data-miniplayer-audio-title")); // Song name
            artwork.attr('alt', jQuery(this).attr("data-miniplayer-audio-artist") + ' - ' + jQuery(this).attr("data-miniplayer-audio-title"))

            // Play btn
            var status = false; // play status

            jQuery('.g-miniplayer-play', trackContainer).click(function(e) {
                e.preventDefault();

                if (status == false) {
                    trackContainer.addClass('open'); // Opening the player
                    jQuery('.g-miniplayer-record', trackContainer).addClass('spinning'); // vinyl now spinning
                    jQuery(this).removeClass('fa fa-play').addClass('fa fa-pause'); // change play btn to pause btn
                    this.audioPlayer = new Audio(trackId); // Create audio object with stream url...
                    this.audioPlayer.play(); // ...and play
                    status = !status; // invert player status
                    this.audioPlayer.addEventListener('ended', function() {
                        trackContainer.removeClass('open'); // Closing the player
                        jQuery('.g-miniplayer-record', trackContainer).removeClass('spinning'); // vinyl stopped spinning
                        jQuery(this).removeClass('fa fa-pause').addClass('fa fa-play'); // change pause btn to play btn
                        status = !status; // invert status
                    });
                } else {
                    trackContainer.removeClass('open'); // Closing the player
                    jQuery('.g-miniplayer-record', trackContainer).removeClass('spinning'); // vinyl stopped spinning
                    jQuery(this).removeClass('fa fa-pause').addClass('fa fa-play'); // change pause btn to play btn
                    this.audioPlayer.pause(); // Pause the player
                    status = !status; // invert status
                }
            });
        });
    });
});
