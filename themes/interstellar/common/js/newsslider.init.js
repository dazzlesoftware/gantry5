jQuery(document).ready(function () {
    jQuery('[data-newsslider-id]').each(function(index) {
        var main_container = jQuery(this);
        var autoplay = jQuery(this).attr('data-newsslider-autoplay');

        jQuery('.news-content:first-child()', main_container).addClass('top-content');
        jQuery('.nh-anim:first-child()', main_container).addClass('selected first');
        jQuery('.g-newsslider-pagination li:first-child()', main_container).addClass('selected');

        var hl,
        newsList        = jQuery('.news-headlines', main_container),
        navigation_next = jQuery('.g-newsslider-navigation .next', main_container),
        navigation_prev = jQuery('.g-newsslider-navigation .prev', main_container),
        pagination      = jQuery('.g-newsslider-pagination li', main_container),
        newsListItems   = jQuery('.news-headlines li', main_container),
        firstNewsItem   = jQuery('.news-headlines li:nth-child(1)', main_container),
        newsPreview     = jQuery('.news-preview', main_container),
        elCount         = jQuery('ul.news-headlines', main_container).children().length - 1,
        vPadding        = (parseInt(firstNewsItem.css('padding-top').replace('px', ''), 10)) +
        (parseInt(firstNewsItem.css('padding-bottom').replace('px', ''), 10)),
        vMargin         = (parseInt(firstNewsItem.css('margin-top').replace('px', ''), 10)) +
        (parseInt(firstNewsItem.css('margin-bottom').replace('px', ''), 10)),
        cPadding        = (parseInt(jQuery('.news-content').css('padding-top').replace('px', ''), 10)) +
        (parseInt(jQuery('.news-content').css('padding-bottom').replace('px', ''), 10)),
        speed           = main_container.attr('data-newsslider-delay'), // this is the speed of the switch
        myTimer         = null,
        siblings        = null,
        totalHeight     = null,
        indexEl         = 0,
        i               = null;
        newsListItems.addClass('nh-anim');

        function doTimedSwitch() {
            myTimer = setInterval(function() {
                if ((jQuery('.selected', main_container).prev().index() + 1) === elCount) {
                    firstNewsItem.trigger('click');
                } else {
                    jQuery('.selected', main_container).next(':not(.first)').trigger('click');
                }
            }, speed);
        }

        clearInterval(myTimer);

        if (autoplay == 'true') {
            doTimedSwitch();
        }

        function doClickItem() {
            navigation_next.on('click', function() {
                jQuery('.g-newsslider-headlines li.selected', main_container).next().trigger('click');
            });
            navigation_prev.on('click', function() {
                jQuery('.g-newsslider-headlines li.selected', main_container).prev().trigger('click');
            });

            newsListItems.on('click', function() {
                newsListItems.removeClass('selected');
                jQuery(this).addClass('selected');

                siblings = jQuery(this).prevAll();
                totalHeight = 0;

                // this loop calculates the height of individual elements, including margins/padding
                for (i = 0; i < siblings.length; i += 1) {
                    totalHeight += jQuery(siblings[i]).height();
                    totalHeight += vPadding;
                    totalHeight += vMargin;
                }

                indexEl = jQuery(this).index() + 1;

                jQuery('.g-newsslider-pagination li', main_container).removeClass('selected');
                jQuery('.g-newsslider-pagination li:nth-child(' + indexEl + ')', main_container).addClass('selected');

                jQuery('.news-content:nth-child(' + indexEl + ')', main_container).siblings().removeClass('top-content');
                jQuery('.news-content:nth-child(' + indexEl + ')', main_container).addClass('top-content');

                clearInterval(myTimer);
                // comment out the line below if you don't
                // want it to rotate automatically
                if (autoplay == 'true') {
                    doTimedSwitch();
                }
            });

            pagination.on('click', function() {

                pagination.removeClass('selected');
                jQuery(this).addClass('selected');

                siblings = jQuery(this).prevAll();
                totalHeight = 0;

                // this loop calculates the height of individual elements, including margins/padding
                for (i = 0; i < siblings.length; i += 1) {
                    totalHeight += jQuery(siblings[i]).height();
                    totalHeight += vPadding;
                    totalHeight += vMargin;
                }

                indexEl = jQuery(this).index() + 1;
                jQuery('.g-newsslider-headlines .nh-anim', main_container).removeClass('selected');
                jQuery('.g-newsslider-headlines .nh-anim:nth-child(' + indexEl + ')', main_container).addClass('selected');

                jQuery('.news-content:nth-child(' + indexEl + ')', main_container).siblings().removeClass('top-content');
                jQuery('.news-content:nth-child(' + indexEl + ')', main_container).addClass('top-content');

                clearInterval(myTimer);
                // comment out the line below if you don't
                // want it to rotate automatically
                if (autoplay == 'true') {
                    doTimedSwitch();
                }
            });
        }

        function doWindowResize() {
            jQuery(window).resize(function() {
                clearInterval(myTimer);
                jQuery('.selected', main_container).trigger('click');
            });
        }

        // this is the poor man's 'init' section
        doClickItem();
        doWindowResize();
        jQuery('.selected', main_container).trigger('click');
    });
});
