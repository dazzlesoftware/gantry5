import __module0 from '../utils/dom.js';

'use strict';

const { ready, delegate } = __module0;

const parseValues = (value) => new Set(String(value || '').split(',').filter(Boolean));
const serializeValues = (values) => [...values].join(',');
const escapeSelector = (value) => window.CSS && CSS.escape
    ? CSS.escape(value)
    : String(value).replace(/["\\]/g, '\\$&');

ready(() => {
    delegate(document.body, 'change', '.input-multicheckbox .input-group input[name][type="hidden"]', (event, input) => {
        const values = parseValues(input.value);
        const name = escapeSelector(input.name);

        document.querySelectorAll(`[data-multicheckbox-field="${name}"]`).forEach((field) => {
            if (field.checked) values.add(field.value);
            else values.delete(field.value);
        });

        input.value = serializeValues(values);
    });

    delegate(document.body, 'change', '.input-multicheckbox .input-group input[data-multicheckbox-field][type="checkbox"]', (event, checkbox) => {
        const fieldName = checkbox.dataset.multicheckboxField;
        const hidden = document.querySelector(`[name="${escapeSelector(fieldName)}"]`);
        if (!hidden) return;

        const values = parseValues(hidden.value);
        if (checkbox.checked) values.add(checkbox.value);
        else values.delete(checkbox.value);

        hidden.value = serializeValues(values);
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
    });
});

export default {};
