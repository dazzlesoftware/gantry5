jQuery(document).ready(function () {
    jQuery('[data-latestblogs-id]').each(function (index) {
        var mainContainer = jQuery(this);
        var navContainer = jQuery('.g-latestblogs-nav', mainContainer);

        mainContainer.imagesLoaded(function () {
            var Shuffle = window.Shuffle;
            var element = document.querySelector('.g-latestblogs-grid', mainContainer);
            var sizer = jQuery('.g-latestblogs-grid-sizer', mainContainer);
            var shuffleInstance = new Shuffle(jQuery('.g-latestblogs-grid', mainContainer), {
                itemSelector: '.g-latestblogs-grid-item',
                sizer: sizer,
                randomize: true,
                group: jQuery('.selected', navContainer).attr('data-group'),
            });
            jQuery('.g-latestblogs-nav-container', navContainer).on('click', function () {
                jQuery('.g-latestblogs-nav-item', navContainer).toggleClass('clicked');
            });

            jQuery('.g-latestblogs-nav-item', navContainer).click(function () {
                jQuery('.g-latestblogs-nav-item', navContainer).removeClass('selected');
                jQuery(this).addClass('selected');
                shuffleInstance.filter(jQuery(this).attr('data-group'));
            });
            mainContainer.addClass('visible');
        });
    });
});
