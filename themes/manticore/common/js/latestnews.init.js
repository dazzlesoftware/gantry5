jQuery(document).ready(function () {
    jQuery('[data-latestnews-id]').each(function (index) {
        var mainContainer = jQuery(this);
        var navContainer = jQuery('.g-latestnews-nav', mainContainer);

        mainContainer.imagesLoaded(function () {
            var Shuffle = window.Shuffle;
            var element = document.querySelector('.g-latestnews-grid', mainContainer);
            var sizer = jQuery('.g-latestnews-grid-sizer', mainContainer);
            var shuffleInstance = new Shuffle(jQuery('.g-latestnews-grid', mainContainer), {
                itemSelector: '.g-latestnews-grid-item',
                sizer: sizer,
                randomize: true,
                group: jQuery('.selected', navContainer).attr('data-group'),
            });
            jQuery('.g-latestnews-nav-container', navContainer).on('click', function () {
                jQuery('.g-latestnews-nav-item', navContainer).toggleClass('clicked');
            });

            jQuery('.g-latestnews-nav-item', navContainer).click(function () {
                jQuery('.g-latestnews-nav-item', navContainer).removeClass('selected');
                jQuery(this).addClass('selected');
                shuffleInstance.filter(jQuery(this).attr('data-group'));
            });
            mainContainer.addClass('visible');
        });

        // Connect with Facebook + grab reactions & likes
        var token = mainContainer.data('latestnews-accesstoken');
        if (token) {
            jQuery(function ($) {
                var url = '';
                function isURL(str) {
                    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
                        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
                    return pattern.test(str);
                }

                jQuery('[data-latestnews-url]').each(function (index) {
                    if (isURL(jQuery(this).data('latestnews-url')) == true) {
                        url += jQuery(this).data('latestnews-url') + ',';
                    };
                });
                url = url.replace(/,\s*$/, "");

                $.ajax({
                    url: 'https://graph.facebook.com/v3.3/',
                    dataType: 'jsonp',
                    type: 'GET',
                    data: { fields: 'engagement', access_token: token, ids: url },
                    success: function (data) {
                        var news_url = '';
                        var data_news = '';
                        jQuery('[data-latestnews-url]').each(function (index) {
                            news_url = jQuery(this).data('latestnews-url');
                            if (isURL(news_url) == true) {
                                data_news = data[news_url];
                                jQuery('[data-latestnews-url="' + news_url + '"] .reactions').text(data_news.engagement.reaction_count);
                                jQuery('[data-latestnews-url="' + news_url + '"] .comments').text(data_news.engagement.comment_count);
                            };
                        });
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            });
        }
    });
});
