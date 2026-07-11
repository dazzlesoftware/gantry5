jQuery(function() {
    jQuery( ".g-simpleform-datepicker" ).datepicker({
        prevText: '<i class="fa fa-angle-left" aria-hidden="true">'+'<' + '/i>',
        nextText: '<i class="fa fa-angle-right" aria-hidden="true">'+'<' + '/i>'
    });
});

jQuery('[data-simpleform-id]').each(function(index) {
    var parentContainer = jQuery( this );
    jQuery( this ).find( ".g-simpleform-button .button" ).click(function(){
        var empty = jQuery(".g-simpleform-fields", parentContainer).find(".g-simpleform-item-required").filter(function() {
            return this.value === "";
        });
        if(empty.length) {
            empty.addClass("g-simpleform-item-required-highlighted");
            jQuery(".g-simpleform-fields", parentContainer).find(".g-simpleform-item-required").click(function(){
                this.removeClass("g-simpleform-item-required-highlighted");
            });
        } else {
            jQuery.ajax({
                dataType: 'jsonp',
                url: 'https://getsimpleform.com/messages/ajax?form_api_token=' + parentContainer.attr('data-simpleform-token'),
                data: parentContainer.serialize()
            }).done(function() {
                jQuery(".g-simpleform-fields", parentContainer).hide();
                jQuery(".g-simpleform-thankyou", parentContainer).fadeIn();
            })
            .fail(function() {
                jQuery(".g-simpleform-fields", parentContainer).hide();
                jQuery(".g-simpleform-error", parentContainer).fadeIn();
            })
        }

    });

});
