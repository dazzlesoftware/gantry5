jQuery(document).ready(function () {
    jQuery('[data-pricingtable-id]').each(function () {
        jQuery('.g-pricingtable-switcher div').click(function () {
            var container = jQuery(this);
            jQuery('.g-pricingtable-switcher div').removeClass('active');
            jQuery(this).toggleClass('active');
            jQuery('.g-pricingtable-price').each(function () {
                jQuery('.g-pricingtable-price-span', this).text(jQuery(this).data('pricingtable-' + jQuery(container).data('pricingtable-switcher')));
            });
        });
    });
});