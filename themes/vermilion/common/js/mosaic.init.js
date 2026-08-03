document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-mosaic-id]').forEach((container) => {
        const navigation = container.querySelector('.g-mosaic-nav');
        const grid = container.querySelector('.g-mosaic-grid');
        const sizer = container.querySelector('.g-mosaic-grid-sizer');
        if (!grid || typeof Shuffle === 'undefined') return;
        const selected = navigation?.querySelector('.selected');
        const shuffle = new Shuffle(grid, {
            itemSelector: '.g-mosaic-grid-item',
            sizer,
            group: selected?.dataset.group
        });
        const buttons = [...navigation?.querySelectorAll('.g-mosaic-nav-item') || []];
        navigation?.querySelector('.g-mosaic-nav-container')?.addEventListener('click', () => {
            buttons.forEach((button) => button.classList.toggle('clicked'));
        });
        buttons.forEach((button) => button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.toggle('selected', item === button));
            shuffle.filter(button.dataset.group);
        }));
    });
});
