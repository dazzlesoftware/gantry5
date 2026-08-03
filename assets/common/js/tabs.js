(() => {
    'use strict';

    const selector = [
        '.g-headertabs-container',
        '.g-linktabs-container',
        '.g-featuretabs-container',
        '.g-showcasetabs-container',
        '[data-newstabs-id]',
        '[data-articletabs-id]'
    ].join(',');

    document.querySelectorAll(selector).forEach((tabs) => {
        if (tabs.dataset.nativeTabsReady) return;
        tabs.dataset.nativeTabsReady = 'true';
        const links = [...tabs.querySelectorAll('a[href^="#"]')]
            .filter((link) => tabs.querySelector(link.hash));
        const panels = links.map((link) => tabs.querySelector(link.hash));
        if (!links.length) return;

        const select = (selected, focus = false) => {
            links.forEach((link, index) => {
                const active = index === selected;
                link.setAttribute('role', 'tab');
                link.setAttribute('aria-selected', String(active));
                link.tabIndex = active ? 0 : -1;
                link.closest('li')?.classList.toggle('ui-tabs-active', active);
                panels[index].hidden = !active;
                panels[index].setAttribute('role', 'tabpanel');
            });
            if (focus) links[selected].focus();
        };

        links.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                select(index);
            });
            link.addEventListener('keydown', (event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const selected = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
                    : (index + (event.key === 'ArrowRight' ? 1 : -1) + links.length) % links.length;
                select(selected, true);
            });
        });
        links[0].closest('ul')?.setAttribute('role', 'tablist');
        const hamburger = tabs.querySelector('.g-newstabs-hamburger');
        const panel = tabs.querySelector('.g-newstabs-tab-panel');
        hamburger?.addEventListener('click', (event) => {
            event.stopPropagation();
            panel.hidden = !panel.hidden;
        });
        document.addEventListener('click', (event) => {
            if (panel && !panel.contains(event.target) && event.target !== hamburger) panel.hidden = true;
        });
        select(0);
    });
})();
