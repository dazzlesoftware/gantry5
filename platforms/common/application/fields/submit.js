'use strict';

const validateField = require('../utils/field-validation');

const unwrap = (value) => value && value[0] instanceof Element ? value[0] : value;
const asArray = (value) => {
    if (!value) return [];
    if (value instanceof Element) return [value];
    return Array.from(value).map(unwrap).filter(Boolean);
};
const escapeSelector = (value) => window.CSS && CSS.escape
    ? CSS.escape(value)
    : String(value).replace(/["\\]/g, '\\$&');
const query = (container, selector) => {
    try { return container.querySelector(selector); }
    catch (error) { return null; }
};

module.exports = (elements, container, options = {}) => {
    const valid = [];
    const invalid = [];
    const root = unwrap(container);
    if (!root) return { valid, invalid };

    asArray(elements).forEach((original) => {
        const name = original.name;
        const type = original.type;
        if (!name || original.disabled || (type === 'radio' && !original.checked)) return;

        const escapedName = escapeSelector(name);
        let input = query(root, `[name="${escapedName}"]${type === 'radio' ? ':checked' : ''}`);

        // Gantry checkbox fields contain both a hidden fallback and checkbox.
        if (type === 'checkbox' && query(root, `input[type="hidden"][name="${escapedName}"]`)) {
            input = query(root, `[name="${escapedName}"][type="checkbox"]`);
        }
        if (!input) return;

        let value = input.type === 'checkbox' ? Number(input.checked) : input.value;
        const parent = input.closest('.settings-param');
        let override = parent ? query(parent, ':scope > input[type="checkbox"]') : null;
        if (!override && input.dataset.overrideTarget) {
            override = query(document, input.dataset.overrideTarget);
        }

        if (input.multiple && (input.type === 'select-one' || input.type === 'select-multiple')) {
            value = [...input.selectedOptions].map((option) => option.value);
        }
        if (override && !override.checked) return;

        // Empty layout block sizes are allowed and still included in submission.
        const skipValidation = name.includes('block-size') && value === '';
        if (!skipValidation && !validateField(input)) invalid.push(input);

        if (Array.isArray(value)) {
            value.forEach((selection) => valid.push(`${name}[]=${encodeURIComponent(selection)}`));
        } else if (!options.submitUnchecked || input.type !== 'checkbox' || Boolean(value)) {
            valid.push(`${name}=${encodeURIComponent(value)}`);
        }
    });

    root.querySelectorAll('h4 [data-title-editable]').forEach((title) => {
        if (title.closest('[data-collection-template]')) return;
        const key = title.dataset.collectionKey || (options.isRoot ? 'settings[title]' : 'title');
        valid.push(`${key}=${encodeURIComponent(String(title.dataset.titleEditable || '').trim())}`);
    });

    return { valid, invalid };
};
