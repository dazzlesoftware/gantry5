(function () {
    var menuEl = document.getElementById('ml-menu'),
        all_text = jQuery(menuEl).data("all-text"),
        mlmenu = new MLMenu(menuEl, {
            breadcrumbsCtrl: true,  //show breadcrumbs
            initialBreadcrumb: all_text,  //initial breadcrumb text
            backCtrl: false, // show back button
            itemsDelayInterval: 60,  //delay between each menu item sliding animation
        });

    // mobile menu toggle
    var openMenuCtrl = document.querySelector('.action--open'),
        closeMenuCtrl = document.querySelector('.action--close');

    openMenuCtrl.addEventListener('click', openMenu);
    closeMenuCtrl.addEventListener('click', closeMenu);

    function openMenu() {
        classie.add(menuEl, 'menu--open');
    }

    function closeMenu() {
        classie.remove(menuEl, 'menu--open');
    }
})();

// Resize container to see all items
jQuery(window).ready(function() {
    jQuery(".g-vnavigation-container", document.body).each(function () {
        var container = jQuery(this);
        var menu_wrapper = jQuery('#ml-menu .menu__wrap', container);

        window.onload = function() {
            setNavHeight();
        };

        jQuery(window).resize(function() {
            setNavHeight();
        });

        // Grab all elements after vnavigation init
        function setNavHeight() {
            setTimeout(function () {
                var top = 0;
                var levelHeights = jQuery('.menu__level', container).map(function () {
                    top = parseInt(jQuery(this).css('top').replace('px', ''));
                    return jQuery(this).outerHeight();
                }).get();

                var maxLevelHeight = Math.max.apply(null, levelHeights);

                menu_wrapper.css({'height': maxLevelHeight + top});
            }, 1);
        }
    });
});
