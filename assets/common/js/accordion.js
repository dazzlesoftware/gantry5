(() => {
    'use strict';

    const initialize = () => {
        document.querySelectorAll('[data-accordion-id]').forEach((accordion) => {
            if (accordion.dataset.accordionReady) return;
            accordion.dataset.accordionReady = 'true';
            const items = [...accordion.children].filter((item) => item.matches('li'));
            const setOpen = (item, open) => {
                const panel = item.querySelector('.accordion-item-content');
                if (!panel) return;
                item.classList.toggle('active', open);
                panel.classList.toggle('active', open);
                panel.hidden = !open;
                panel.style.opacity = open ? '1' : '0';
                item.querySelector('.indicator span')?.replaceChildren(open ? '-' : '+');
            };

            items.forEach((item, index) => {
                const panel = item.querySelector('.accordion-item-content');
                if (panel && !panel.id) panel.id = `${accordion.dataset.accordionId || 'accordion'}-panel-${index}`;
                setOpen(item, index === 0);
                item.addEventListener('click', (event) => {
                    if (event.target.closest('.accordion-item-content a, .accor-button')) return;
                    const opening = !item.classList.contains('active');
                    items.forEach((candidate) => setOpen(candidate, opening && candidate === item));
                });
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();

