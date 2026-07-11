jQuery(document).ready(function () {
    var container = jQuery('.slidingmenu');

    jQuery(container).prependTo(document.body);

    var bodyEl = document.body,
        content = document.querySelector( '#g-page-surround' ),
        openbtn = document.getElementById( 'open-button' ),
        closebtn = document.getElementById( 'close-button' ),
        isOpen = false;

    var body_overlay = jQuery('.slidingmenu-overlay', container);
    jQuery(body_overlay).prependTo(content);

    if (container.data('slidingmenu-animation') === 'sideslide') {
        (function() {
            function init() {
                initEvents();
            }

            function initEvents() {
                openbtn.addEventListener( 'click', toggleMenu );
                if( closebtn ) {
                    closebtn.addEventListener( 'click', toggleMenu );
                }

                // close the menu element if the target it´s not the menu element or one of its descendants..
                content.addEventListener( 'click', function(ev) {
                    var target = ev.target;
                    if( isOpen && target !== openbtn ) {
                        toggleMenu();
                    }
                } );
            }

            function toggleMenu() {
                if( isOpen ) {
                    classie.remove( bodyEl, 'show-menu' );
                }
                else {
                    classie.add( bodyEl, 'show-menu' );
                }
                isOpen = !isOpen;
            }

            init();
        })();
    } else if (container.data('slidingmenu-animation') === 'sideslide-animated') {
        (function() {
            function init() {
                initEvents();
            }

            function initEvents() {
                openbtn.addEventListener( 'click', toggleMenu );
                if( closebtn ) {
                    closebtn.addEventListener( 'click', toggleMenu );
                }

                // close the menu element if the target it´s not the menu element or one of its descendants..
                content.addEventListener( 'click', function(ev) {
                    var target = ev.target;
                    if( isOpen && target !== openbtn ) {
                        toggleMenu();
                    }
                } );
            }

            function toggleMenu() {
                if( isOpen ) {
                    classie.remove( bodyEl, 'show-menu' );
                }
                else {
                    classie.add( bodyEl, 'show-menu' );
                }
                isOpen = !isOpen;
            }

            init();
        })();
    } else if (container.data('slidingmenu-animation') === 'elastic') {
        (function() {
            var morphEl = document.getElementById( 'morph-shape' ),
                s = Snap( morphEl.querySelector( 'svg' ) );
                path = s.select( 'path' );
                initialPath = this.path.attr('d'),
                pathOpen = morphEl.getAttribute( 'data-morph-open' ),
                isAnimating = false;

            function init() {
                initEvents();
            }

            function initEvents() {
                openbtn.addEventListener( 'click', toggleMenu );
                if( closebtn ) {
                    closebtn.addEventListener( 'click', toggleMenu );
                }

                // close the menu element if the target it´s not the menu element or one of its descendants..
                content.addEventListener( 'click', function(ev) {
                    var target = ev.target;
                    if( isOpen && target !== openbtn ) {
                        toggleMenu();
                    }
                } );
            }

            function toggleMenu() {
                if( isAnimating ) return false;
                isAnimating = true;
                if( isOpen ) {
                    classie.remove( bodyEl, 'show-menu' );
                    // animate path
                    setTimeout( function() {
                        // reset path
                        path.attr( 'd', initialPath );
                        isAnimating = false;
                    }, 300 );
                }
                else {
                    classie.add( bodyEl, 'show-menu' );
                    // animate path
                    path.animate( { 'path' : pathOpen }, 400, mina.easeinout, function() { isAnimating = false; } );
                }
                isOpen = !isOpen;
            }

            init();
        })();
    } else if (container.data('slidingmenu-animation') === 'bubble') {
        (function() {
                var morphEl = document.getElementById( 'morph-shape' ),
                s = Snap( morphEl.querySelector( 'svg' ) );
                path = s.select( 'path' );
                initialPath = this.path.attr('d'),
                steps = morphEl.getAttribute( 'data-morph-open' ).split(';');
                stepsTotal = steps.length;
                isAnimating = false;

            function init() {
                initEvents();
            }

            function initEvents() {
                openbtn.addEventListener( 'click', toggleMenu );
                if( closebtn ) {
                    closebtn.addEventListener( 'click', toggleMenu );
                }

                // close the menu element if the target it´s not the menu element or one of its descendants..
                content.addEventListener( 'click', function(ev) {
                    var target = ev.target;
                    if( isOpen && target !== openbtn ) {
                        toggleMenu();
                    }
                } );
            }

            function toggleMenu() {
                if( isAnimating ) return false;
                isAnimating = true;
                if( isOpen ) {
                    classie.remove( bodyEl, 'show-menu' );
                    // animate path
                    setTimeout( function() {
                        // reset path
                        path.attr( 'd', initialPath );
                        isAnimating = false;
                    }, 300 );
                }
                else {
                    classie.add( bodyEl, 'show-menu' );
                    // animate path
                    var pos = 0,
                        nextStep = function( pos ) {
                            if( pos > stepsTotal - 1 ) {
                                isAnimating = false;
                                return;
                            }
                            path.animate( { 'path' : steps[pos] }, pos === 0 ? 400 : 500, pos === 0 ? mina.easein : mina.elastic, function() { nextStep(pos); } );
                            pos++;
                        };

                    nextStep(pos);
                }
                isOpen = !isOpen;
            }

            init();
        })();
    }
});
