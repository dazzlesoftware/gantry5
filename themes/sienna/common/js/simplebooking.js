jQuery(function() {
    jQuery( ".g-simplebooking-datepicker" ).datepicker({
        prevText: '<i class="fa fa-angle-left" aria-hidden="true">'+'<' + '/i>',
        nextText: '<i class="fa fa-angle-right" aria-hidden="true">'+'<' + '/i>'
    });
});

jQuery('[data-simplebooking-id]').each(function(index) {
    var parentContainer = jQuery( this );

    jQuery( this ).find( ".g-simplebooking-button" ).click(function(){
        var empty = jQuery(".g-simplebooking-mainform", parentContainer).find(".g-simplebooking-item-required").filter(function() {
            if (this.value === "" || this.value === '0') {
                return true;
            }
        });
        if(empty.length) {
            empty.addClass("g-simplebooking-item-required-highlighted");
            jQuery(".g-simplebooking-mainform", parentContainer).find(".g-simplebooking-item-required").click(function(){
                this.removeClass("g-simplebooking-item-required-highlighted");
            });
        } else {
            if( jQuery(".g-simplebooking-item-id-1", parentContainer).val().length === 0 && jQuery(".g-simplebooking-item-id-2", parentContainer).val().length === 0 && jQuery(".g-simplebooking-item-id-3", parentContainer).val() == 0 && jQuery(".g-simplebooking-item-id-4", parentContainer).val() == 0  ) {
                jQuery(".g-simplebooking-items .g-simplebooking-item", parentContainer).fadeIn();
            } else {
                jQuery(".g-simplebooking-items .g-simplebooking-item", parentContainer).fadeOut();
            }
            jQuery(".g-simplebooking-items .g-simplebooking-item", parentContainer).filter(function () {
                var dateFrom = jQuery(this).data('start');
                var dateTo = jQuery(this).data('end');
                var dateCheckFrom = jQuery(".g-simplebooking-item-id-1", parentContainer).val();
                var dateCheckTo = jQuery(".g-simplebooking-item-id-2", parentContainer).val();
                var from = new Date(dateFrom);
                var to   = new Date(dateTo);
                var checkFrom = new Date(dateCheckFrom);
                var checkTo = new Date(dateCheckTo);

                return jQuery(this).data('adults') >= jQuery(".g-simplebooking-item-id-3", parentContainer).val() && jQuery(this).data('children') >= jQuery(".g-simplebooking-item-id-4", parentContainer).val() && (checkFrom >= from && checkTo <= to);
            }).fadeIn();
        }
    });

    jQuery(".g-simplebooking-items .g-simplebooking-item", parentContainer).each(function(index) {
        var itemContainer = jQuery( this );
        jQuery( this ).find( ".g-simplebooking-item-container .g-simplebooking-item-button .button" ).click(function(){
            var empty = jQuery(".g-simplebooking-mainform", parentContainer).find(".g-simplebooking-item-required").filter(function() {
                if (this.value === "" || this.value === '0') {
                    return true;
                }
            });
            if(empty.length) {
                empty.addClass("g-simplebooking-item-required-highlighted");
                jQuery(".g-simplebooking-mainform", parentContainer).find(".g-simplebooking-item-required").click(function(){
                    this.removeClass("g-simplebooking-item-required-highlighted");
                });
            } else {
                jQuery(".g-simplebooking-list", itemContainer).hide();
                jQuery(".g-simplebooking-form", itemContainer).fadeIn().css("display", "block");
                jQuery(".g-simplebooking-form .g-simplebooking-item", itemContainer).fadeIn().css("display", "block");
                jQuery(".g-simplebooking-form .g-simplebooking-hidden", itemContainer).fadeIn().css("display", "flex");
            }
        });
        jQuery( this ).find( ".g-simplebooking-buttonback .button" ).click(function(){
            jQuery(".g-simplebooking-list", itemContainer).fadeIn().css("display", "flex");
            jQuery(".g-simplebooking-form", itemContainer).hide();
            jQuery(".g-simplebooking-form .g-simplebooking-hidden", itemContainer).hide();
        });

        jQuery( this ).find( ".g-simplebooking-button2 .button" ).click(function(){
            var empty = jQuery(".g-simplebooking-form .g-simplebooking-hidden", itemContainer).find(".g-simplebooking-item-required").filter(function() {
                return this.value === "";
            });
            if(empty.length) {
                empty.addClass("g-simplebooking-item-required-highlighted");
                jQuery(".g-simplebooking-form .g-simplebooking-hidden", itemContainer).find(".g-simplebooking-item-required").click(function(){
                    this.removeClass("g-simplebooking-item-required-highlighted");
                });
            } else {
                jQuery(".g-simplebooking-form .g-simplebooking-hiddenfields-checkin", itemContainer).val(jQuery(".g-simplebooking-item-id-1", parentContainer).val());
                jQuery(".g-simplebooking-form .g-simplebooking-hiddenfields-checkout", itemContainer).val(jQuery(".g-simplebooking-item-id-2", parentContainer).val());
                jQuery(".g-simplebooking-form .g-simplebooking-hiddenfields-adults", itemContainer).val(jQuery(".g-simplebooking-item-id-3", parentContainer).val());
                jQuery(".g-simplebooking-form .g-simplebooking-hiddenfields-children", itemContainer).val(jQuery(".g-simplebooking-item-id-4", parentContainer).val());
                jQuery.ajax({
                    dataType: 'jsonp',
                    url: 'https://getsimpleform.com/messages/ajax?form_api_token=' + jQuery(".g-simplebooking-form form", itemContainer).attr('data-simplebooking-token'),
                    data: jQuery(".g-simplebooking-form form", itemContainer).serialize()
                }).done(function() {
                    jQuery(".g-simplebooking-form .g-simplebooking-hidden", itemContainer).hide();
                    jQuery(".g-simplebooking-form  .g-simplebooking-thankyou", itemContainer).fadeIn();
                })
                .fail(function() {
                    jQuery(".g-simplebooking-form .g-simplebooking-hidden", itemContainer).hide();
                    jQuery(".g-simplebooking-form  .g-simplebooking-error", itemContainer).fadeIn();
                })
            }
            return false;
        });

    });


});
