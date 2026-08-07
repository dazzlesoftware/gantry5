(() => {
    'use strict';
    const loaded = new Set(), initialized = new WeakSet();
    const applyFont = (root, selector, value) => {
        const font = String(value || '').trim(); if (!font) return;
        let family = font;
        if (font.startsWith('family=')) {
            const parameters = new URLSearchParams(font); family = (parameters.get('family') || '').replace(/\+/g, ' ').split(':')[0];
            const url = `https://fonts.googleapis.com/css?${font}`;
            if (family && !loaded.has(url)) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = url; document.head.append(link); loaded.add(url); }
        }
        if (family) root.querySelectorAll(selector).forEach(node => { node.style.fontFamily = `'${family.replace(/'/g, "\\'")}'`; });
    };
    const styleButtonText = (root, button, font, size, weight) => {
        const text = button?.querySelector('span');
        if (!text) return;
        applyFont(button, 'span', font);
        if (size) text.style.fontSize = `${size}px`;
        if (weight && weight !== 'inherit') text.style.fontWeight = weight;
    };
    const init = root => {
        if (initialized.has(root)) return;
        initialized.add(root);
        applyFont(root, '.g-feature-title', root.dataset.titleFont);
        applyFont(root, '.g-feature-text', root.dataset.textFont);
        const buttons = [...root.querySelectorAll('.g-feature-buttons .btn')];
        let index = 0;
        if (root.dataset.button1Present === '1') styleButtonText(root, buttons[index++], root.dataset.button1Font, root.dataset.button1Size, root.dataset.button1Weight);
        if (root.dataset.button2Present === '1') styleButtonText(root, buttons[index], root.dataset.button2Font, root.dataset.button2Size, root.dataset.button2Weight);
    };
    const scan = (scope = document) => { const roots = scope.matches?.('[data-feature]') ? [scope] : scope.querySelectorAll?.('[data-feature]') || []; roots.forEach(init); };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => scan(), {once: true}) : scan();
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => node.nodeType === 1 && scan(node)))).observe(document.documentElement, {childList: true, subtree: true});
})();
