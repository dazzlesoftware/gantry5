(() => {
    const menu = document.getElementById('ml-menu');
    if (!menu) return;
    new MLMenu(menu, {
        breadcrumbsCtrl: true,
        initialBreadcrumb: menu.dataset.allText,
        backCtrl: false,
        itemsDelayInterval: 60
    });
    document.querySelector('.action--open')?.addEventListener('click', () => menu.classList.add('menu--open'));
    document.querySelector('.action--close')?.addEventListener('click', () => menu.classList.remove('menu--open'));
})();
