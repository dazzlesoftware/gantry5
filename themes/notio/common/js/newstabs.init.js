jQuery(document).ready(function () {
    jQuery('[data-newstabs-id]').each(function(index) {
        var mainContainer = jQuery(this);
        mainContainer.responsiveTabs({
            navigationContainer: '.g-newstabs-tab-panel'
        });

        jQuery(mainContainer.find('.g-newstabs-tab-panel')).hide();

        jQuery(mainContainer.find('.g-newstabs-hamburger')).click(function(e) {
            e.stopPropagation();
            jQuery(mainContainer.find('.g-newstabs-tab-panel')).fadeToggle(200);
        });

        jQuery(document).click(function(e) {
            if(e.target.className !== 'g-newstabs-tab-panel') {
                jQuery(mainContainer.find('.g-newstabs-tab-panel')).fadeOut(200);
            }
        });
    });
});
