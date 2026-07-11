jQuery(document).ready(function () {
    jQuery('[data-casestudies-id]').each(function(index) {
        var mainContainer = jQuery(this)
        var navContainer = jQuery('.g-casestudies-nav', mainContainer);

        jQuery('.g-casestudies-grid').masonry({
            // options...
            itemSelector: '.g-casestudies-grid-item',
            columnWidth: '.g-casestudies-grid-sizer',
            percentPosition: false,
            resize: false
        });

        var Shuffle = window.Shuffle;
        var element = document.querySelector('.g-casestudies-grid', mainContainer);
        var sizer = jQuery('.g-casestudies-grid-sizer', mainContainer);

        var shuffleInstance = new Shuffle(element, {
            itemSelector: '.g-casestudies-grid-item',
            sizer: sizer // could also be a selector: '.my-sizer-element'
        });
        shuffleInstance.filter('1');

        jQuery('.g-casestudies-nav-item', navContainer).click(function() {
            jQuery('.g-casestudies-nav-item', navContainer).removeClass('selected');
            jQuery(this).addClass('selected');
            shuffleInstance.filter(jQuery(this).attr('data-group'));
        });
    });
});
