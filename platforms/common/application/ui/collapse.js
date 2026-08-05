import __module0 from '../utils/cookie.js';
import __module1 from '../utils/dom.js';

'use strict';

const Cookie = __module0;
const { ready, delegate } = __module1;
const readStorage = () => Cookie.read('genesis-collapsed') || Cookie.read('genesis-collapsed') || {};
const writeStorage = (storage) => {
    Cookie.write('genesis-collapsed', storage);
    Cookie.write('genesis-collapsed', storage);
};

const config = (element) => JSON.parse(element.getAttribute('data-g-collapse') || '{}');
const panelFor = (element, data) => data.target ? element.querySelector(data.target) : element;
const cardFor = (panel) => panel.closest('.card') || panel;
const handleFor = (element, data) => data.handle ? element.querySelector(data.handle) : element.querySelector('.g-collapse');

const setTooltip = (handle, text) => {
    if (!handle) return;
    handle.dataset.title = text || '';
    handle.dataset.tip = text || '';
};

const applyState = (element, data, collapsed) => {
    const panel = panelFor(element, data);
    const card = cardFor(panel);
    panel.removeAttribute('style');
    card.classList.toggle('g-collapsed', collapsed);
    panel.classList.toggle('g-collapsed', collapsed);
    element.classList.toggle('g-collapsed-main', collapsed);
    data.collapsed = collapsed;
    element.setAttribute('data-g-collapse', JSON.stringify(data));
    setTooltip(handleFor(element, data), collapsed ? data.expand : data.collapse);
};

const loadFromStorage = () => {
    const storage = readStorage();
    Object.entries(storage).forEach(([id, collapsed]) => {
        const element = document.querySelector(`[data-g-collapse-id="${CSS.escape(id)}"]`);
        if (element) applyState(element, config(element), Boolean(collapsed));
    });
};

ready(() => {
    delegate(document.body, 'click', '[data-g-collapse]', (event, element) => {
        const data = config(element);
        const handle = handleFor(element, data);
        if (handle && !event.target.closest(data.handle || '.g-collapse')) return;
        event.preventDefault();

        const storage = data.store === false ? {} : readStorage();
        const collapsed = storage[data.id] === undefined ? Boolean(data.collapsed) : Boolean(storage[data.id]);
        const next = !collapsed;
        applyState(element, data, next);
        if (data.store !== false) {
            storage[data.id] = next;
            writeStorage(storage);
        }
    });

    delegate(document.body, 'click', '[data-g-collapse-all]', (event, toggle) => {
        event.preventDefault();
        const collapsed = toggle.dataset.gCollapseAll === 'true';
        const actions = toggle.closest('.g-filter-actions');
        const container = actions && actions.nextElementSibling;
        if (!container) return;
        const storage = readStorage();

        container.querySelectorAll('[data-g-collapse]').forEach((element) => {
            const data = config(element);
            applyState(element, data, collapsed);
            if (data.store !== false) storage[data.id] = collapsed;
        });
        writeStorage(storage);
    });

    delegate(document.body, 'input', '[data-g-collapse-filter]', (event, input) => {
        const filter = JSON.parse(input.dataset.gCollapseFilter || '{}');
        const actions = input.closest('.g-filter-actions');
        const container = actions && actions.nextElementSibling;
        if (!container) return;
        const value = input.value.trim().toLowerCase();

        container.querySelectorAll(filter.element || '.card').forEach((card) => {
            const title = card.querySelector(filter.title || 'h4 .g-title');
            const text = title ? title.textContent.trim().toLowerCase() : '';
            card.style.display = !value || text.startsWith(value) || text.includes(` ${value}`) ? '' : 'none';
        });
    });
});

export default loadFromStorage;
