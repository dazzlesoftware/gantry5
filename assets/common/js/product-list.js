(function () {
    'use strict';
    document.querySelectorAll('[data-productlist-id]').forEach(function (root) {
        let container = root.querySelector('.g-productlist-container');
        let products = container ? Array.from(container.children) : [];
        let categories = Array.from(root.querySelectorAll('.g-productlist-categories li[data-filter]'));
        let layouts = Array.from(root.querySelectorAll('.g-productlist-layouts li[data-layout]'));
        if (!container) return;

        function filter(value) {
            products.forEach(function (product) {
                let category = product.dataset.category || product.dataset.filter;
                product.hidden = value !== 'all' && String(category) !== String(value);
            });
        }
        categories.forEach(function (category) {
            category.addEventListener('click', function () {
                categories.forEach(function (item) { item.classList.toggle('active', item === category); });
                filter(category.dataset.filter);
            });
        });
        layouts.forEach(function (layout) {
            layout.addEventListener('click', function () {
                layouts.forEach(function (item) { item.classList.toggle('active', item === layout); });
                container.classList.toggle('g-productlist-layout-vertical', layout.dataset.layout === 'vertical');
                container.classList.toggle('g-productlist-layout-samewidth', layout.dataset.layout !== 'vertical');
            });
        });
        root.querySelectorAll('[data-modal-id]').forEach(function (link) {
            let modal = document.getElementById(link.dataset.modalId);
            if (!modal) return;
            link.addEventListener('click', function (event) { event.preventDefault(); modal.classList.add('g-product-modal-open'); modal.style.display = 'block'; });
            modal.querySelectorAll('[class*="close-modal"], .g-product-modal-close').forEach(function (close) {
                close.addEventListener('click', function () { modal.classList.remove('g-product-modal-open'); modal.style.display = 'none'; });
            });
        });
        container.style.opacity = '1';
        filter(root.dataset.productlistDemosync || '1');
    });
}());
