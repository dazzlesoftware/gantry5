import __module0 from '../utils/field-validation.js';

'use strict';

const validateField = __module0;

const elementFrom = value => {
    if (value instanceof Element || value instanceof Document || value instanceof DocumentFragment) return value;
    return value && value[0] instanceof Element ? value[0] : null;
};

const elementsFrom = value => {
    if (!value) return [];
    if (value instanceof Element) return [value];
    if (typeof value === 'string') return Array.from(document.querySelectorAll(value));
    return Array.from(value).map(elementFrom).filter(Boolean);
};

const fieldsNamed = (container, name) => Array.from(container.querySelectorAll('[name]'))
    .filter(field => field.name === name);

export default function submit(elements, container, options = {}) {
    const valid = [];
    const invalid = [];
    const root = elementFrom(container);

    if (!root) return { valid, invalid };

    elementsFrom(elements).forEach(original => {
        const name = original.name;
        const originalType = original.type;
        if (!name || original.disabled || (originalType === 'radio' && !original.checked)) return;

        const matches = fieldsNamed(root, name);
        let input = originalType === 'radio'
            ? matches.find(field => field.checked)
            : matches[0];

        if (originalType === 'checkbox' && matches.some(field => field.type === 'hidden')) {
            input = matches.find(field => field.type === 'checkbox');
        }
        if (!input) return;

        let value = input.type === 'checkbox' ? Number(input.checked) : input.value;
        const parent = input.closest('.settings-param');
        let override = parent ? parent.querySelector(':scope > input[type="checkbox"]') : null;
        const overrideTarget = input.getAttribute('data-override-target');
        if (!override && overrideTarget) override = document.querySelector(overrideTarget);

        if (input.tagName === 'SELECT' && input.multiple) {
            value = Array.from(input.options)
                .filter(option => option.selected)
                .map(option => option.value);
        }

        if (override && !override.checked) return;

        const skipValidation = name.includes('block-size') && (!value || value === '');
        if (!skipValidation && !validateField(input)) invalid.push(input);

        if (Array.isArray(value)) {
            value.forEach(selection => {
                valid.push(`${name}[]=${encodeURIComponent(selection)}`);
            });
        } else if (!options.submitUnchecked || input.type !== 'checkbox' || Boolean(value)) {
            valid.push(`${name}=${encodeURIComponent(value)}`);
        }
    });

    root.querySelectorAll('h4 [data-title-editable]').forEach(title => {
        if (title.closest('[data-collection-template]')) return;

        const key = title.getAttribute('data-collection-key') || (options.isRoot ? 'settings[title]' : 'title');
        const editableTitle = title.getAttribute('data-title-editable');
        valid.push(`${key}=${encodeURIComponent(editableTitle == null ? '' : editableTitle.trim())}`);
    });

    return { valid, invalid };
};
