jQuery(document).ready(function() {
    jQuery('[data-particlesjs-id]').each(function(index) {
        if(jQuery(this).data('particlesjs-mode') === 'section') {
            jQuery(this).parentsUntil('#g-page-surround').last().css('position', 'relative');
        }

        particlesJS.load(jQuery(this).attr('id'), jQuery(this).attr('data-particlesjs-path'), function() {});
    });
});
