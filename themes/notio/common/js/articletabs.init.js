jQuery(document).ready(function () {
    jQuery('[data-articletabs-id]').each(function(index) {
        var mainContainer = jQuery(this);
        mainContainer.responsiveTabs({
        });
    });
});
