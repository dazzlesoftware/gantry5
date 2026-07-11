jQuery(document).ready(function () {
    jQuery('.tab-link').click(function () {
        var tab_id = jQuery(this).attr('data-tab');

        jQuery('.tab-link').removeClass('selected');
        jQuery('.g-table-tabs-wrapper').removeClass('selected');

        jQuery(this).addClass('selected');
        jQuery("#" + tab_id).addClass('selected');
    })
});
