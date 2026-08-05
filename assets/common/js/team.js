document.addEventListener('DOMContentLoaded', () => {
    const imagesReady = (container) => Promise.all([...container.querySelectorAll('img')].map((image) => (
        image.complete ? Promise.resolve() : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
        })
    )));
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    document.querySelectorAll('[data-team-id]').forEach(async (container) => {
        await imagesReady(container);
        const navigation = container.querySelector('.g-team-nav');
        const grid = container.querySelector('.g-team-grid');
        const sizer = container.querySelector('.g-team-grid-sizer');
        if (!grid || typeof NativeGrid === 'undefined') return;
        const gridLayout = new NativeGrid(grid, {
            itemSelector: '.g-team-grid-item',
            sizer,
            columnWidth: 0,
            isCentered: false,
            randomize: true,
            useTransforms: true
        });
        const buttons = [...navigation?.querySelectorAll('.g-team-nav-item') || []];
        const select = (button, group) => {
            buttons.forEach((item) => item.classList.toggle('selected', item === button));
            gridLayout.filter(group);
        };
        const initial = container.dataset.initialGroup;
        if (initial) select(buttons.find((button) => button.dataset.group === initial), initial);
        navigation?.querySelector('.g-team-nav-container')?.addEventListener('click', () => {
            buttons.forEach((button) => button.classList.toggle('clicked'));
        });
        buttons.forEach((button) => button.addEventListener('click', () => select(button, button.dataset.group)));
        container.classList.add('visible');
        container.querySelectorAll('.g-team-grid-item-blob').forEach((blob) => {
            blob.style.borderRadius = `${random(60, 65)}% ${random(35, 40)}% ${random(50, 55)}% ${random(45, 50)}% / ${random(55, 60)}% ${random(45, 50)}% ${random(50, 55)}% ${random(40, 45)}%`;
            blob.style.animationDuration = `${random(15, 35)}s`;
        });
    });
});

