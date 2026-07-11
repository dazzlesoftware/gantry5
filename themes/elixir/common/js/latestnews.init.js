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
    });
});
