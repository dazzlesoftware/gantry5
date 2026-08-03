document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-casestudies-id]').forEach((container) => {
        const navigation = container.querySelector('.g-casestudies-nav');
        const grid = container.querySelector('.g-casestudies-grid');
        const sizer = container.querySelector('.g-casestudies-grid-sizer');
        if (!grid || typeof NativeGrid === 'undefined') return;
        const gridLayout = new NativeGrid(grid, {
            itemSelector: '.g-casestudies-grid-item',
            sizer
        });
        gridLayout.filter('1');
        const buttons = [...navigation?.querySelectorAll('.g-casestudies-nav-item') || []];
        buttons.forEach((button) => button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.toggle('selected', item === button));
            gridLayout.filter(button.dataset.group);
        }));
    });
});
