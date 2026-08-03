(() => {
    'use strict';

    document.querySelectorAll('[data-bookblock-id]').forEach((book) => {
        if (book.dataset.bookblockReady) return;
        book.dataset.bookblockReady = 'true';
        book.tabIndex = book.tabIndex >= 0 ? book.tabIndex : 0;
        const pages = [...book.querySelectorAll(':scope > .bb-item')];
        let current = 0;
        let pointerStart = null;

        const show = (index) => {
            if (!pages.length) return;
            current = (index + pages.length) % pages.length;
            pages.forEach((page, pageIndex) => {
                const active = pageIndex === current;
                page.hidden = !active;
                page.classList.toggle('bb-item-current', active);
                page.setAttribute('aria-hidden', String(!active));
            });
            book.style.height = `${pages[current].scrollHeight}px`;
        };

        book.addEventListener('click', (event) => {
            if (event.target.closest('.bb-nav-next')) show(current + 1);
            if (event.target.closest('.bb-nav-prev')) show(current - 1);
            if (event.target.closest('.bb-nav-first')) show(0);
            if (event.target.closest('.bb-nav-last')) show(pages.length - 1);
        });
        book.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') show(current - 1);
            if (event.key === 'ArrowRight') show(current + 1);
        });
        book.addEventListener('pointerdown', (event) => { pointerStart = event.clientX; });
        book.addEventListener('pointerup', (event) => {
            if (pointerStart === null || Math.abs(event.clientX - pointerStart) < 40) return;
            show(current + (event.clientX < pointerStart ? 1 : -1));
            pointerStart = null;
        });
        new ResizeObserver(() => show(current)).observe(book);
        show(0);
    });
})();
