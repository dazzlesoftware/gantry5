jQuery(function() {
    jQuery( ".g-bookingform-datepicker" ).datepicker({
        prevText: '<i class="fa fa-angle-left" aria-hidden="true">'+'<' + '/i>',
        nextText: '<i class="fa fa-angle-right" aria-hidden="true">'+'<' + '/i>'
    });
});

jQuery('[data-bookingform-id]').each(function(index) {
    var parentContainer = jQuery( this );
    jQuery( this ).find( ".g-bookingform-button1 .button" ).click(function(){
        var empty = jQuery(".g-bookingform-visible", parentContainer).find(".g-bookingform-item-required").filter(function() {
            return this.value === "";
        });
        if(empty.length) {
            empty.addClass("g-bookingform-item-required-highlighted");
            jQuery(".g-bookingform-visible", parentContainer).find(".g-bookingform-item-required").click(function(){
                this.removeClass("g-bookingform-item-required-highlighted");
            });
        } else {
            jQuery(".g-bookingform-visible", parentContainer).hide();
            jQuery(".g-bookingform-hidden", parentContainer).fadeIn().css("display", "flex");
        }

    });

    jQuery( this ).find( ".g-bookingform-buttonback .button" ).click(function(){
        jQuery(".g-bookingform-visible", parentContainer).fadeIn();
        jQuery(".g-bookingform-hidden", parentContainer).hide();
    });

    jQuery( this ).find( ".g-bookingform-button2 .button" ).click(function(){
        var empty = jQuery(".g-bookingform-hidden", parentContainer).find(".g-bookingform-item-required").filter(function() {
            return this.value === "";
        });
        if(empty.length) {
            empty.addClass("g-bookingform-item-required-highlighted");
            jQuery(".g-bookingform-visible", parentContainer).find(".g-bookingform-item-required").click(function(){
                this.removeClass("g-bookingform-item-required-highlighted");
            });
        } else {
            jQuery.ajax({
                dataType: 'jsonp',
                url: 'https://getsimpleform.com/messages/ajax?form_api_token=' + parentContainer.attr('data-bookingform-token'),
                data: parentContainer.serialize()
            }).done(function() {
                jQuery(".g-bookingform-visible", parentContainer).hide();
                jQuery(".g-bookingform-hidden", parentContainer).hide();
                jQuery(".g-bookingform-thankyou", parentContainer).fadeIn();
            })
            .fail(function() {
                jQuery(".g-bookingform-visible", parentContainer).hide();
                jQuery(".g-bookingform-hidden", parentContainer).hide();
                jQuery(".g-bookingform-error", parentContainer).fadeIn();
            })
        }
        return false;
    });

});
