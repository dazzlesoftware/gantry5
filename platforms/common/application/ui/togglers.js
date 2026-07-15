'use strict';

const modal = require('./modal');
const toastr = require('./toastr');
const request = require('../utils/request');
const getAjaxSuffix = require('../utils/get-ajax-suffix');
const parseAjaxURI = require('../utils/get-ajax-url').parse;
const getAjaxURL = require('../utils/get-ajax-url').global;
const { ready, delegate } = require('../utils/dom');

const setIndicator = (element, active) => {
    let icon = element.querySelector(':scope > i');
    if (active) {
        if (!icon) {
            icon = document.createElement('i');
            element.prepend(icon);
            icon.dataset.gCreatedIndicator = 'true';
        }
        if (!icon.dataset.gOriginalClass) icon.dataset.gOriginalClass = icon.className;
        icon.className = 'fa fa-fw fa-spin-fast fa-spinner';
        return;
    }
    if (!icon) return;
    if (icon.dataset.gCreatedIndicator === 'true') icon.remove();
    else icon.className = icon.dataset.gOriginalClass || '';
};

const toggle = (control) => {
    const enabler = control.closest('.enabler');
    if (!enabler || enabler.hasAttribute('disabled')) return;
    const hidden = enabler.querySelector('input[type="hidden"]');
    if (!hidden) return;

    hidden.value = hidden.value === '0' ? '1' : '0';
    enabler.setAttribute('aria-checked', hidden.value === '1' ? 'true' : 'false');
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
};

ready(() => {
    delegate(document.body, 'keydown', '.enabler', (event, enabler) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault();
        const control = enabler.querySelector('.toggle');
        if (control) toggle(control);
    });

    // Toggle before surrounding popovers process their click event. The legacy
    // implementation used mouseup/touchend for the same reason; pointerup
    // provides one modern event for mouse, touch, and pen input.
    delegate(document.body, 'pointerup', '.enabler .toggle', (event, control) => {
        event.preventDefault();
        toggle(control);
    });

    delegate(document.body, 'click', '.enabler .toggle', (event) => {
        event.preventDefault();
    });

    const uri = parseAjaxURI(`${getAjaxURL('devprod')}${getAjaxSuffix()}`);
    delegate(document.body, 'change', '[data-g-devprod] input[type="hidden"]', (event, input) => {
        const parent = input.closest('[data-g-devprod]');
        const labels = JSON.parse(parent.dataset.gDevprod || '{}');
        setIndicator(parent, true);

        request('post', uri, { mode: input.value }, (error, response) => {
            if (error || !response || !response.body.success) {
                const body = response ? response.body : { message: error ? error.message : 'Request failed' };
                modal.open({
                    content: body.html || body.message || body,
                    afterOpen(container) {
                        if (!body.html && !body.message) container.style({ width: '90%' });
                    }
                });
                input.value = input.value === '1' ? '0' : '1';
            } else {
                const label = parent.querySelector('.devprod-mode');
                if (label) label.textContent = labels[response.body.mode] || 'Unknown';
                toastr.success(response.body.html, response.body.title);
            }
            setIndicator(parent, false);
        });
    });
});

module.exports = {};
