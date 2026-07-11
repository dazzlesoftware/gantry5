jQuery(document).ready(function () {
    jQuery('[data-accordion-id]').each(function(index) {
        var mainContainer = jQuery(this);
        function openFirstPanel() {
            jQuery('> li:first-child div', mainContainer).addClass('active').css('opacity', 0).slideDown("slow").animate({ opacity: 1 }, {
                queue: false,
                duration: 'slow'
            });
            jQuery('> li:first-child', mainContainer).addClass('active').slideDown("slow").animate({ opacity: 1 }, {
                queue: false,
                duration: 'slow'
            });
            jQuery('> li:first-child .toggle i', mainContainer).removeClass('fa-minus');
            jQuery('> li:first-child .toggle i', mainContainer).addClass('fa-minus');
        }

        var allPanels = jQuery('li .accordion-item-content', mainContainer).hide();

        openFirstPanel();

        jQuery('> li', jQuery(this)).click(function() {
            var target = jQuery('.accordion-item-content', jQuery(this));

            if (target.hasClass('active')) {
                target.removeClass('active').slideUp("slow").animate({ opacity: 0 }, {
                    queue: false,
                    duration: 'slow'
                });
            } else {
                allPanels.removeClass('active').slideUp("slow").animate({ opacity: 0 }, {
                    queue: false,
                    duration: 'slow'
                });
                target.addClass('active').slideDown("slow").animate({ opacity: 1 }, {
                    queue: false,
                    duration: 'slow'
                });
            }

            if (jQuery(this).hasClass('active')) {
                jQuery(this).removeClass('active');
                jQuery('.toggle i', jQuery(this)).removeClass('fa-minus');
                jQuery('.toggle i', jQuery(this)).addClass('fa-plus');
            } else {
                jQuery('li', mainContainer).removeClass('active');
                jQuery('.toggle i', mainContainer).removeClass('fa-minus');
                jQuery('.toggle i', mainContainer).addClass('fa-plus');
                jQuery(this).addClass('active');
                jQuery('.toggle i', jQuery(this)).removeClass('fa-plus');
                jQuery('.toggle i', jQuery(this)).addClass('fa-minus');
            }
            return false;
        });

    });
});

jQuery( ".accordion-item-content a" ).click(function( event ) {
    event.stopPropagation();
});

jQuery( ".accor-button" ).click(function( event ) {
    event.stopPropagation();
});
