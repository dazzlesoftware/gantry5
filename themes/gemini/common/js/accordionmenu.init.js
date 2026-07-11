jQuery(document).ready(function () {
    jQuery('[data-accordionmenu-id]').each(function (index) {
        var acContainer = jQuery(this);
        jQuery('li.g-accordionmenu-group', this).on('click', function (event) {
            event.stopPropagation();
            jQuery('li', acContainer).remove("open");
            jQuery(this).toggleClass("open");
        });
    });
});
