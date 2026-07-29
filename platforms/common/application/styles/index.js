'use strict';

const modal = require('../ui').modal;
const fields = require('../fields');
const { ready, delegate } = require('../utils/dom');

require('../ui/popover');

const escapeSelector = (value) => window.CSS && CSS.escape
    ? CSS.escape(value)
    : String(value).replace(/["\\]/g, '\\$&');

const emitFieldEvent = (input, type) => {
    const event = new Event(type, { bubbles: true });
    event.forceOverride = true;
    input.dispatchEvent(event);
};

ready(() => {
    delegate(document.body, 'click', '[data-g-styles]', (event, presetElement) => {
        event.preventDefault();
        if (event.target.closest('.swatch-preview')) return;

        const data = JSON.parse(presetElement.dataset.gStyles || '{}');
        Object.entries(data).forEach(([name, preset]) => {
            const input = document.querySelector(`[name="${escapeSelector(name)}"]`);
            if (!input || input.value === String(preset)) return;

            if (input.selectizeInstance) input.selectizeInstance.setValue(preset);
            else input.value = preset;

            const type = input.tagName === 'SELECT' || ['hidden', 'checkbox'].includes(input.type)
                ? 'change'
                : 'input';
            emitFieldEvent(input, type);
            emitFieldEvent(input, 'keyup');
        });

        // Re-evaluate once after every preset value, including the hidden
        // styles[preset] field, has been applied.
        fields.compare.presets();
    });

    delegate(document.body, 'click', '[data-g-styles] .swatch-preview', (event, swatch) => {
        event.preventDefault();
        const preset = swatch.closest('[data-g-styles]');
        const image = preset ? preset.querySelector('img') : null;
        if (!image) return;

        modal.open({
            content: image.outerHTML,
            afterOpen(container) {
                const element = container && container[0] ? container[0] : container;
                const styles = getComputedStyle(element);
                const padding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
                element.style.maxWidth = '80%';
                element.style.width = `${padding + (image.naturalWidth || image.width)}px`;
            }
        });
    });
});

module.exports = {};
