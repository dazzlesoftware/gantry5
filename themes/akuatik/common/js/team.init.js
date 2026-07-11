jQuery(document).ready(function () {
    jQuery('[data-team-id]').each(function(index) {
        var mainContainer = jQuery(this);
        var navContainer = jQuery('.g-team-nav', mainContainer);
        var initial_group = jQuery(this).attr('data-initial-group');

        mainContainer.imagesLoaded(function () {
            var Shuffle = window.Shuffle;
            var element = document.querySelector('.g-team-grid', mainContainer);
            var sizer = jQuery('.g-team-grid-sizer', mainContainer);

            var shuffleInstance = new Shuffle(jQuery('.g-team-grid', mainContainer), {
                itemSelector: '.g-team-grid-item',
                sizer: sizer,
                columnWidth: 0,
                isCentered: false,
                randomize: true,
                useTransforms: true,
            });
            
            // Initial slide
            if (typeof(initial_group) != 'undefined' && initial_group != null) {
                jQuery("div[data-group]", mainContainer).removeClass('selected');
                jQuery("div[data-group='"+ initial_group +"']", mainContainer).addClass('selected');
                shuffleInstance.filter(initial_group);
            };
            

            jQuery('.g-team-nav-container', navContainer).on('click', function () {
                jQuery('.g-team-nav-item', navContainer).toggleClass('clicked');
            });

            jQuery('.g-team-nav-item', navContainer).click(function () {
                jQuery('.g-team-nav-item', navContainer).removeClass('selected');
                jQuery(this).addClass('selected');
                shuffleInstance.filter(jQuery(this).attr('data-group'));
            });

            mainContainer.addClass('visible');

            jQuery('.g-team-grid-item-blob', mainContainer).each(function(index, item) {
                var p1 = randomIntFromInterval(60, 65);
                var p2 = randomIntFromInterval(35, 40);
                var p3 = randomIntFromInterval(50, 55);
                var p4 = randomIntFromInterval(45, 50);
                var p5 = randomIntFromInterval(55, 60);
                var p6 = randomIntFromInterval(45, 50);
                var p7 = randomIntFromInterval(50, 55);
                var p8 = randomIntFromInterval(40, 45);

                jQuery(item).css('border-radius', p1 + '% ' + p2 + '% ' + p3 + '% ' + p4 + '% / ' + p5 + '% ' + p6 + '% ' + p7 + '% ' + p8 + '%');
                jQuery(item).css('animation-duration', randomIntFromInterval(15, 35) + 's');
            });
        });
    });

    function randomIntFromInterval(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
});
