jQuery(document).ready(function () {
    jQuery('[data-socialfeed-id]').each(function (index) {
        var mainContainer = jQuery(this);
        var navContainer = jQuery('.g-socialfeed-nav', mainContainer);
        var source = mainContainer.data('socialfeed-source');

        function load_shuffle_js() {
            var shuffleInstance = '';
            var Shuffle = window.Shuffle;
            var element = document.querySelector('.g-socialfeed-grid', mainContainer);
            var sizer = jQuery('.g-socialfeed-grid-sizer', mainContainer);
            var shuffleInstance = new Shuffle(jQuery('.g-socialfeed-grid', mainContainer), {
                itemSelector: '.g-socialfeed-grid-item',
                sizer: sizer,
                gutterWidth: 0,
                randomize: true,
                group: jQuery('.selected', navContainer).attr('data-group'),
            });

            jQuery('.g-socialfeed-nav-container', navContainer).on('click', function () {
                jQuery('.g-socialfeed-nav-item', navContainer).toggleClass('clicked');
            });

            jQuery('.g-socialfeed-nav-item', navContainer).click(function () {
                jQuery('.g-socialfeed-nav-item', navContainer).removeClass('selected');
                jQuery(this).addClass('selected');
                shuffleInstance.filter(jQuery(this).attr('data-group'));
            });
            mainContainer.addClass('visible');
        }

        // Connect with Facebook + grab reactions & likes
        var token = mainContainer.data('socialfeed-accesstoken');
        if (token && source == 'instagram') {
            var user = mainContainer.data('socialfeed-userid');
            jQuery(function ($) {
                $.ajax({
                    url: 'https://graph.instagram.com/' + user + '/media/',
                    dataType: 'jsonp',
                    type: 'GET',
                    data: { fields: 'id,caption,media_url,permalink', access_token: token },
                    success: function (data) {
                        var elements = [];
                        $.each(data.data, function (index, e) {
                            jQuery('.g-socialfeed-grid', mainContainer).append('<div class="g-socialfeed-grid-item"><div class="g-socialfeed-grid-item-wrapper"><div class="g-socialfeed-grid-item-image"><a data-rel="lightcase:gallery-' + user + '" href="' + e.media_url + '" title="' + (typeof e.caption !== 'undefined' ? e.caption : '') + '"><img src="' + e.media_url + '"/></a></div></div></div>');
                        });
                        load_shuffle_js()
                        $('a[data-rel^=lightcase]', mainContainer).lightcase();
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            });
        } else {
            mainContainer.imagesLoaded(function () {
                load_shuffle_js();
            });
        }
    });
});
