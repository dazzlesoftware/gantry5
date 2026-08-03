document.addEventListener('DOMContentLoaded', () => {
    const imagesReady = (container) => Promise.all([...container.querySelectorAll('img')].map((image) => (
        image.complete ? Promise.resolve() : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
        })
    )));
    document.querySelectorAll('[data-recentreviews-id]').forEach(async (container) => {
        await imagesReady(container);
        const navigation = container.querySelector('.g-recentreviews-nav');
        const grid = container.querySelector('.g-recentreviews-grid');
        if (!grid || typeof Shuffle === 'undefined') return;
        const buttons = [...navigation?.querySelectorAll('.g-recentreviews-nav-item') || []];
        const shuffle = new Shuffle(grid, {
            itemSelector: '.g-recentreviews-grid-item',
            sizer: container.querySelector('.g-recentreviews-grid-sizer'),
            randomize: true,
            group: navigation?.querySelector('.selected')?.dataset.group
        });
        navigation?.querySelector('.g-recentreviews-nav-container')?.addEventListener('click', () => {
            buttons.forEach((button) => button.classList.toggle('clicked'));
        });
        buttons.forEach((button) => button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.toggle('selected', item === button));
            shuffle.filter(button.dataset.group);
        }));
        container.classList.add('visible');
    });
});
