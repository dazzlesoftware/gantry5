jQuery(document).ready(function () {

var Page = (function() {

    var config = {},

    init = function(id) {
        var element = jQuery('[data-bookblock-id="' + id + '"]');
        var direction = element.attr('data-bookblock-direction');
        if (!element) { return false; }

        config[id] = {
            offset: 0,
            $bookBlock : element,
            $navNext : element.find('.bb-nav-next'),
            $navPrev : element.find('.bb-nav-prev'),
            $navFirst : element.find('.bb-nav-first'),
            $navLast : element.find('.bb-nav-last')
        }

        config[id].$bookBlock.bookblock( {
            speed : 1000,
            shadowSides : 0.8,
            shadowFlip : 0.4,
            direction : direction,
        });

        initEvents(id);
        attachResize(id);
    },

    initEvents = function(id) {

        var $slides = config[id].$bookBlock.children();

        // add navigation events
        config[id].$navNext.on( 'click touchstart', function() {
            config[id].$bookBlock.bookblock( 'next' );
            return false;
        } );

        config[id].$navPrev.on( 'click touchstart', function() {
            config[id].$bookBlock.bookblock( 'prev' );
            return false;
        } );

        config[id].$navFirst.on( 'click touchstart', function() {
            config[id].$bookBlock.bookblock( 'first' );
            return false;
        } );

        config[id].$navLast.on( 'click touchstart', function() {
            config[id].$bookBlock.bookblock( 'last' );
            return false;
        } );

        // add swipe events
        $slides.on( {
            'swipeleft' : function( event ) {
                config[id].$bookBlock.bookblock( 'next' );
                return false;
            },
            'swiperight' : function( event ) {
                config[id].$bookBlock.bookblock( 'prev' );
                return false;
            }
        } );

        // add keyboard events
        jQuery( document ).keydown( function(e) {
            var keyCode = e.keyCode || e.which,
            arrow = {
                left : 37,
                up : 38,
                right : 39,
                down : 40
            };

            switch (keyCode) {
                case arrow.left:
                config[id].$bookBlock.bookblock( 'prev' );
                break;
                case arrow.right:
                config[id].$bookBlock.bookblock( 'next' );
                break;
            }
        } );
    };

    attachResize = function(id) {
        var children = config[id].$bookBlock.find('.bb-item'),
            tallest = getTallest(children, id);

        jQuery(window).resize(function() {
            config[id].$bookBlock.css({
                height: 'auto',
            });


            if (jQuery(window).width() <= 767){
                config[id].$bookBlock.removeClass( "bb-vertical" );
                config[id].$bookBlock.addClass( "bb-horizontal" );
            }

            if (jQuery(window).width() >= 767){
                config[id].$bookBlock.removeClass( "bb-horizontal" );
                config[id].$bookBlock.addClass( "bb-vertical" );
            }

            tallest = getTallest(children, id);

            config[id].$bookBlock.css({
                height: tallest,
            });

        }).resize();
    }

    getTallest = function(elements, id) {
        var tallest = 0,
            visible = elements.filter(function(index, element) { return jQuery(element).is(':visible'); });

        jQuery(elements).css('display', 'none').each(function(index, item) {
            item = jQuery(item);
            item.css('display', 'block');
            tallest = Math.max(tallest, item[0].getBoundingClientRect().height + config[id].offset);
            item.css('display', 'none');
        });

        visible.css('display', 'block');

        return tallest;
    }

    return { init : init };

})();


jQuery('[data-bookblock-id]').each(function(index, item) {
    item = jQuery(item);
    Page.init(item.data('bookblock-id'));
});

});
