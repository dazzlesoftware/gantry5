jQuery(document).ready(function () {
    jQuery('[data-team-id]').each(function (index) {
        var mainContainer = jQuery(this)
        var navContainer = jQuery('.g-team-nav', mainContainer);
        
        mainContainer.imagesLoaded(function () {
            var Shuffle = window.Shuffle;
            var element = document.querySelector('.g-team-grid', mainContainer);
            var sizer = jQuery('.g-team-grid-sizer', mainContainer);

            var shuffleInstance = new Shuffle(jQuery('.g-team-grid', mainContainer), {
                itemSelector: '.g-team-grid-item',
                sizer: sizer,
                columnWidth: 0,
                isCentered: false,
                randomize: true,
                useTransforms: true,
              
            });
            jQuery('.g-team-nav-container', navContainer).on('click', function () {
                jQuery('.g-team-nav-item', navContainer).toggleClass('clicked');
            });
    
            jQuery('.g-team-nav-item', navContainer).click(function () {
                jQuery('.g-team-nav-item', navContainer).removeClass('selected');
                jQuery(this).addClass('selected');
                shuffleInstance.filter(jQuery(this).attr('data-group'));
            });
            mainContainer.addClass('visible');
        });
    });
});
