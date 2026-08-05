"use strict";

const { ready, delegate } = require('../utils/dom');
const frameListener = require('../utils/frame-listener');
const asyncForEach = require('../utils/async-foreach');

const cache = new WeakMap();
const visible = element => getComputedStyle(element).display !== 'none';
const checked = element => Boolean(element && element.checked);

const hasGlobalFilter = element => {
    if (element.closest('[data-g-global-filter]')) return true;
    return element.parentElement
        ? Array.from(element.parentElement.children).some(sibling => sibling.matches('[data-g-global-filter]'))
        : false;
};

const emitChange = input => input.dispatchEvent(new Event('change', { bubbles: true }));

const Assignments = {
    toggleSection(event, element, index, array) {
        if (event.type.startsWith('touch')) event.preventDefault();
        if (hasGlobalFilter(element)) return Assignments.globalToggleSection(event, element);
        if (element.matches('label')) return Assignments.treatLabel(event, element);

        const card = element.closest('.card');
        const save = document.querySelector('[data-save]');
        const mode = element.getAttribute('data-g-assignments-check') == null ? 0 : 1;
        if (!card) return;

        let stored = cache.get(card);
        if (!stored || !stored.inputs) {
            stored = Object.assign({}, stored, {
                inputs: Array.from(card.querySelectorAll('.enabler input[type="hidden"]'))
            });
            cache.set(card, stored);
        }

        asyncForEach(stored.inputs, item => {
            const row = item.closest('label, h4');
            if (!row || !visible(row)) return;
            item.value = mode;
            emitChange(item);
        }, () => {
            if (save && typeof index !== 'undefined' && array && index + 1 === array.length) {
                save.disabled = false;
            }
        });
    },

    filterSection(event, element, value, global) {
        if (hasGlobalFilter(element)) return Assignments.globalFilterSection(event, element);

        const card = element.closest('.card');
        const onlyEnabled = document.querySelector('[data-assignments-enabledonly]');
        if (!card) return;

        let stored = cache.get(card);
        if (!stored || !stored.labels) {
            stored = Object.assign({}, stored, {
                labels: Array.from(card.querySelectorAll('label .settings-param-title'))
            });
            cache.set(card, stored);
        }

        const labels = stored.labels;
        value = value || element.value;
        if (!value && !checked(onlyEnabled)) {
            card.style.display = 'inline-block';
            labels.forEach(label => {
                const row = label.closest('label');
                if (row) row.style.display = 'block';
            });
            return;
        }

        let completed = 0;
        let shown = 0;
        const needle = String(value || '').trim().toLowerCase();

        if (!labels.length) card.style.display = checked(onlyEnabled) || value ? 'none' : 'inline-block';

        asyncForEach(labels, item => {
            const text = item.textContent.trim().toLowerCase();
            const row = item.closest('label, h4');
            let matches = !needle || text.startsWith(needle) || text.includes(` ${needle}`);

            if (checked(onlyEnabled)) {
                const enabled = row && row.querySelector('.enabler input[type="hidden"]');
                matches = matches && Boolean(Number(enabled ? enabled.value : 0));
            }

            if (matches) {
                const groupHolder = item.closest('[data-g-assignments-parent]');
                const group = groupHolder && groupHolder.getAttribute('data-g-assignments-parent');
                if (group) {
                    const parentGroup = card.querySelector(`[data-g-assignments-group="${CSS.escape(group)}"]`);
                    if (parentGroup) parentGroup.style.display = 'block';
                }
                if (row) row.style.display = 'block';
                shown++;
            } else if (row) {
                row.style.display = 'none';
            }

            completed++;
            if (completed === labels.length && global) {
                card.style.display = shown ? 'inline-block' : 'none';
            }
        });
    },

    filterEnabledOnly(event) {
        const global = document.querySelector('[data-g-global-filter] input[type="text"]');
        Assignments.globalFilterSection(event, global);
    },

    treatLabel(event, element) {
        event.stopPropagation();
        event.preventDefault();
        if (event.target instanceof Element && event.target.closest('.knob, .toggle')) return;

        const input = element.querySelector('input[type="hidden"]:not([disabled])');
        if (!input) return;
        input.value = Number(!Boolean(Number(input.value)));
        emitChange(input);
        return false;
    },

    globalToggleSection(event, element) {
        const selector = element.getAttribute('data-g-assignments-check') == null
            ? '[data-g-assignments-uncheck]'
            : '[data-g-assignments-check]';
        const save = document.querySelector('[data-save]');
        const controls = Array.from(document.querySelectorAll(`#assignments .card ${selector}, .settings-assignments .card ${selector}`));
        if (!controls.length) return;

        if (save) save.disabled = true;
        asyncForEach(controls, (item, index, array) => {
            Assignments.toggleSection(event, item, index, array);
        });
    },

    globalFilterSection(event, element) {
        const value = element ? element.value : '';
        const onlyEnabled = document.querySelector('[data-assignments-enabledonly]');
        const searches = Array.from(document.querySelectorAll('#assignments .card .search input[type="text"], .settings-assignments .card .search input[type="text"]'));
        if (!searches.length && !checked(onlyEnabled)) return;

        asyncForEach(searches, item => {
            Assignments.filterSection(event, item, value, 'global');
        });
    },

    toggleStateDelegation(event, element) {
        element.disabled = element.value !== '1';
    },

    chromeFix() {
        if (!Assignments.isChrome()) return;
        document.querySelectorAll('#assignments .settings-param-wrapper, .settings-assignments .settings-param-wrapper')
            .forEach(panel => {
                const maxHeight = Number.parseInt(getComputedStyle(panel).maxHeight, 10);
                const height = panel.getBoundingClientRect().height;
                panel.style.overflow = height >= maxHeight ? 'auto' : 'visible';

                if (height >= maxHeight) {
                    let alternateWidth = 100;
                    frameListener(panel, 'scroll', () => {
                        alternateWidth = alternateWidth === 100 ? 100.01 : 100;
                        const card = panel.closest('.card');
                        if (card) card.style.width = `${alternateWidth}%`;
                    });
                }
            });
    },

    isChrome() {
        return navigator.userAgent.toLowerCase().includes('chrome');
    }
};

ready(() => {
    const body = document.body;
    delegate(body, 'input', '#assignments .search input[type="text"], .settings-assignments .search input[type="text"]', Assignments.filterSection);
    const toggleSelector = '#assignments .card label, #assignments [data-g-assignments-check], #assignments [data-g-assignments-uncheck], .settings-assignments .card label, .settings-assignments [data-g-assignments-check], .settings-assignments [data-g-assignments-uncheck]';
    delegate(body, 'click', toggleSelector, Assignments.toggleSection);
    delegate(body, 'touchend', toggleSelector, Assignments.toggleSection);
    delegate(body, 'change', '[data-assignments-enabledonly]', Assignments.filterEnabledOnly);
    delegate(body, 'change', '#assignments input[type="hidden"][name], .settings-assignments input[type="hidden"][name]', Assignments.toggleStateDelegation);
});

module.exports = Assignments;
