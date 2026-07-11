jQuery(document).ready(function () {
    jQuery('[data-recentreviews-id]').each(function (index) {
        var mainContainer = jQuery(this);
        var navContainer = jQuery('.g-recentreviews-nav', mainContainer);

        mainContainer.imagesLoaded(function () {
            var Shuffle = window.Shuffle;
            var element = document.querySelector('.g-recentreviews-grid', mainContainer);
            var sizer = jQuery('.g-recentreviews-grid-sizer', mainContainer);
            var shuffleInstance = new Shuffle(jQuery('.g-recentreviews-grid', mainContainer), {
                itemSelector: '.g-recentreviews-grid-item',
                sizer: sizer,
                randomize: true,
                group: jQuery('.selected', navContainer).attr('data-group'),                
            });
            jQuery('.g-recentreviews-nav-container', navContainer).on('click', function () {
                jQuery('.g-recentreviews-nav-item', navContainer).toggleClass('clicked');
            });

            jQuery('.g-recentreviews-nav-item', navContainer).click(function () {
                jQuery('.g-recentreviews-nav-item', navContainer).removeClass('selected');
                jQuery(this).addClass('selected');
                shuffleInstance.filter(jQuery(this).attr('data-group'));
            });
            mainContainer.addClass('visible');
        });

    });
});
