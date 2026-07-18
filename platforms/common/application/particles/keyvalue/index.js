"use strict";

const { ready, delegate } = require('../../utils/dom');
const simpleSort = require('sortablejs');
const translate = require('../../utils/translate');

const collectionIndex = (collection, item) => Array.prototype.indexOf.call(collection, item);

const escapeUnicode = value => String(value).replace(/[\s\S]/g, character => {
    if (/[\x20-\x7e]/.test(character)) return character;
    return `\\u${(`000${character.charCodeAt(0).toString(16)}`).slice(-4)}`;
});

const emitChange = element => element.dispatchEvent(new Event('change', { bubbles: true }));

ready(() => {
    const body = document.body;

    const createSortables = list => {
        const lists = list instanceof Element ? [list] : Array.from(document.querySelectorAll('.g-keyvalue-field ul'));
        lists.forEach(element => {
            element.SimpleSort = simpleSort.create(element, {
                handle: '.fa-reorder',
                filter: '[data-keyvalue-nosort]',
                scroll: false,
                animation: 150,
                onStart() {
                    this.el.classList.add('keyvalue-sorting');
                },
                onEnd(event) {
                    const listElement = this.el;
                    listElement.classList.remove('keyvalue-sorting');
                    if (event.oldIndex === event.newIndex) return;

                    const param = listElement.closest('.settings-param');
                    const dataField = param && param.querySelector('[data-keyvalue-data]');
                    if (!dataField) return;

                    const data = JSON.parse(dataField.value);
                    data.splice(event.newIndex, 0, data.splice(event.oldIndex, 1)[0]);
                    dataField.value = JSON.stringify(data);
                    emitChange(dataField);
                }
            });
        });
    };

    createSortables();

    delegate(body, 'mouseover', '.g-keyvalue-field ul', (event, element) => {
        if (!element.SimpleSort) createSortables(element);
    });

    delegate(body, 'click', '[data-keyvalue-addnew]', (event, element) => {
        event.preventDefault();
        const param = element.closest('.settings-param');
        const list = param && param.querySelector('ul');
        const template = param && param.querySelector('[data-keyvalue-template]');
        if (!list || !template) return;

        const items = Array.from(list.querySelectorAll(':scope > [data-keyvalue-item]'));
        const clone = template.cloneNode(true);
        const last = items[items.length - 1];
        if (last) last.after(clone);
        else list.prepend(clone);

        clone.removeAttribute('style');
        clone.setAttribute('data-keyvalue-item', clone.getAttribute('data-keyvalue-template') || '');
        clone.removeAttribute('data-keyvalue-template');
        clone.removeAttribute('data-keyvalue-nosort');
        const keyInput = clone.querySelector('[data-keyvalue-key]');
        if (keyInput) keyInput.focus();
    });

    delegate(body, 'click', '[data-keyvalue-remove]', (event, element) => {
        event.preventDefault();
        const item = element.closest('[data-keyvalue-item]');
        const param = element.closest('.settings-param');
        const list = element.closest('ul');
        const dataField = param && param.querySelector('[data-keyvalue-data]');
        if (!item || !list || !dataField) return;

        const items = Array.from(list.querySelectorAll(':scope > [data-keyvalue-item]'));
        const index = collectionIndex(items, item);
        const data = JSON.parse(dataField.value);
        data.splice(index, 1);
        dataField.value = escapeUnicode(JSON.stringify(data));
        item.remove();
        emitChange(dataField);
    });

    const onBlur = (event, element) => {
        const parent = element.closest('[data-keyvalue-item]');
        const param = element.closest('.settings-param');
        if (!parent || !param) return;

        const wrapper = parent.querySelector('.g-keyvalue-wrapper');
        const keyElement = parent.querySelector('[data-keyvalue-key]');
        const valueElement = parent.querySelector('[data-keyvalue-value]');
        const dataField = param.querySelector('[data-keyvalue-data]');
        if (!wrapper || !keyElement || !valueElement || !dataField) return;

        const previousKey = keyElement.getAttribute('data-keyvalue-key');
        const keyValue = String(keyElement.value || '').trim();
        const value = String(valueElement.value || '').trim();
        const list = element.closest('ul');
        const items = Array.from(list.querySelectorAll(':scope > [data-keyvalue-item]:not(.g-keyvalue-warning):not(.g-keyvalue-excluded)'));
        const index = collectionIndex(items, parent);
        const data = JSON.parse(dataField.value);
        const exclude = JSON.parse(dataField.getAttribute('data-keyvalue-exclude') || 'null');
        const excluded = Array.isArray(exclude) && exclude.includes(keyValue);
        const duplicate = data.some(object => Object.prototype.hasOwnProperty.call(object, keyValue)) && previousKey !== keyValue;

        if (keyElement === element) {
            if (previousKey !== keyValue && !duplicate) {
                if (typeof data[index] !== 'undefined') delete data[index][previousKey];
                keyElement.setAttribute('data-keyvalue-key', keyValue || '');
            }

            parent.classList.toggle('g-keyvalue-warning', duplicate);
            parent.classList.toggle('g-keyvalue-excluded', excluded);
            const message = duplicate
                ? translate('GANTRY5_PLATFORM_JS_KEYVALUE_DUPLICATE', keyValue)
                : excluded ? translate('GANTRY5_PLATFORM_JS_KEYVALUE_EXCLUDED', keyValue) : null;

            if (message) wrapper.setAttribute('data-tip', message);
            else wrapper.removeAttribute('data-tip');
            wrapper.setAttribute('data-tip-place', 'top-right');
            wrapper.setAttribute('data-tip-spacing', '2');
            wrapper.setAttribute('data-tip-offset', '8');

            if (excluded || duplicate) {
                const tooltip = window.G5.tips.get(wrapper);
                if (tooltip) tooltip.show();
            } else {
                window.G5.tips.remove(wrapper);
            }
        }

        if (keyValue && !excluded && !duplicate) {
            if (!data[index]) data.splice(index, 0, {});
            data[index][keyValue] = value;
        }

        dataField.value = escapeUnicode(JSON.stringify(data));
        emitChange(dataField);
    };

    delegate(body, 'keydown', '[data-keyvalue-item] input[type="text"]', (event, element) => {
        if (event.key === 'Enter') onBlur(event, element);
    });
    delegate(body, 'blur', '[data-keyvalue-item] input[type="text"]', onBlur, true);

    delegate(body, 'update', '[data-keyvalue-data]', (event, element) => {
        const parent = element.parentElement;
        const list = parent && parent.querySelector('ul');
        const template = parent && parent.querySelector('[data-keyvalue-template]');
        if (!parent || !list || !template) return;

        parent.querySelectorAll('[data-keyvalue-item]').forEach(item => item.remove());
        JSON.parse(element.value).forEach(object => {
            const clone = template.cloneNode(true);
            const key = Object.keys(object).shift();
            list.appendChild(clone);
            clone.removeAttribute('style');
            clone.setAttribute('data-keyvalue-item', clone.getAttribute('data-keyvalue-template') || '');
            clone.removeAttribute('data-keyvalue-template');
            clone.removeAttribute('data-keyvalue-nosort');
            clone.querySelector('[data-keyvalue-key]').value = key;
            clone.querySelector('[data-keyvalue-value]').value = object[key];
        });
    });
});

module.exports = {};
