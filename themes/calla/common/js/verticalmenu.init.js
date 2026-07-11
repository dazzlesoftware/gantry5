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
