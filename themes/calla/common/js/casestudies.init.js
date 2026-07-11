jQuery(document).ready(function () {
    jQuery('[data-casestudies-id]').each(function (index) {
        var mainContainer = jQuery(this)
        var navContainer = jQuery('.g-casestudies-nav', mainContainer);
        var preset = '';
        if (mainContainer.data('casestudies-preset') == false) {
            preset = 'all';
        } else if (mainContainer.data('casestudies-preset') == 'all') {
            preset = 'all';
        }
        else {
            preset = mainContainer.data('casestudies-preset');
        }
        
        mainContainer.imagesLoaded(function () {
            var Shuffle = window.Shuffle;
            var element = document.querySelector('.g-casestudies-grid', mainContainer);
            var sizer = jQuery('.g-casestudies-grid-sizer', mainContainer);

            var shuffleInstance = new Shuffle(jQuery('.g-casestudies-grid', mainContainer), {
                itemSelector: '.g-casestudies-grid-item',
                sizer: sizer,
                randomize: true,
                group: jQuery('.selected', navContainer).attr('data-group')
              
            });

            jQuery('.g-casestudies-nav-container', navContainer).on('click', function () {
                jQuery('.g-casestudies-nav-item', navContainer).toggleClass('clicked');
            });
            jQuery('.g-casestudies-nav-item', navContainer).click(function () {
                jQuery('.g-casestudies-nav-item', navContainer).removeClass('selected');
                jQuery(this).addClass('selected');
                shuffleInstance.filter(jQuery(this).attr('data-group'));
            });
            mainContainer.addClass('visible');
        });
    });
});
