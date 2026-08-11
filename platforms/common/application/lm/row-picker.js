import __module0 from '../ui/index.js';
import __module1 from '../utils/translate.js';

"use strict";

let modal     = __module0.modal,
    translate = __module1;

// Preset column splits, all in Bootstrap's 12-column vocabulary. Matches
// the row/column picker referenced from Genesis's admin design notes
// (NUCLEUS_BOOTSTRAP_MIGRATION.md M3) - pick a split, get that many empty
// (droppable) blocks pre-sized to it.
const PRESETS = [
    [12],
    [6, 6],
    [4, 4, 4],
    [3, 3, 3, 3],
    [4, 8],
    [3, 9],
    [3, 6, 3],
    [2, 6, 4],
    [2, 10],
    [2, 3, 7]
];
const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl'];

let presetLabel = (columns) => columns.join('+');

// Tiny inline bar-chart preview of a split, e.g. "4+8" -> two bars sized
// 33%/67% of the row width - mirrors the reference picker's iconography
// without needing separate image assets.
let presetPreview = (columns) => {
    return '<span class="lm-row-preset-bars">' + columns.map((count) => {
        let width = (count / 12 * 100).toFixed(4);
        return '<span class="lm-row-preset-bar" style="width:' + width + '%"></span>';
    }).join('') + '</span>';
};

let presetButton = (columns, index) => {
    return '<button type="button" class="lm-row-preset" data-lm-row-preset="' + index + '" aria-label="' +
        translate('GENESIS_PLATFORM_JS_LM_ROW_LAYOUT_X', presetLabel(columns)) + '">' +
        presetPreview(columns) +
        '<span class="lm-row-preset-label">' + presetLabel(columns) + '</span>' +
        '</button>';
};

let buildContent = (responsive) => {
    return '' +
        '<div class="lm-row-picker">' +
            '<h3 class="lm-row-picker-title">' + translate('GENESIS_PLATFORM_JS_LM_ROW_PICKER_TITLE') + '</h3>' +
            (responsive ? '<div class="lm-row-breakpoints" role="tablist">' + BREAKPOINTS.map((breakpoint, index) =>
                '<button type="button" role="tab" data-lm-row-breakpoint="' + breakpoint + '" aria-selected="' + (index === 0 ? 'true' : 'false') + '">' + breakpoint.toUpperCase() + '</button>'
            ).join('') + '</div><p class="lm-row-breakpoint-help" data-lm-row-breakpoint-help></p>' : '') +
            '<div class="lm-row-picker-presets">' +
                PRESETS.map(presetButton).join('') +
            '</div>' +
            '<div class="lm-row-picker-custom">' +
                '<span class="lm-row-picker-custom-label">' + translate('GENESIS_PLATFORM_JS_LM_ROW_PICKER_CUSTOM') + '</span>' +
                '<input type="text" class="lm-row-picker-custom-input" data-lm-nodrag placeholder="' +
                    translate('GENESIS_PLATFORM_JS_LM_ROW_PICKER_CUSTOM_PLACEHOLDER') + '" />' +
                '<button type="button" class="button lm-row-picker-generate" data-lm-nodrag data-lm-row-generate>' +
                    translate('GENESIS_PLATFORM_JS_LM_ROW_PICKER_GENERATE') +
                '</button>' +
                (responsive ? '<button type="button" class="button lm-row-picker-inherit" data-lm-nodrag data-lm-row-inherit hidden>' + translate('GENESIS_PLATFORM_JS_LM_ROW_INHERIT') + '</button>' : '') +
            '</div>' +
            '<p class="lm-row-picker-error" hidden></p>' +
        '</div>';
};

// Parses "4+8", "4 + 8", "4,8" etc. into [4, 8]. Returns null if the split
// isn't usable: parts must be positive integers 1-12 and sum to at most 12
// (leaving a row short of 12 is allowed - it just won't span full width).
let parseCustomSplit = (text) => {
    let parts = String(text || '')
        .split(/[+,\s]+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map(Number);

    if (!parts.length || parts.some((value) => !Number.isInteger(value) || value < 1 || value > 12)) {
        return null;
    }

    let total = parts.reduce((sum, value) => sum + value, 0);
    if (total > 12) {
        return null;
    }

    return parts;
};

/**
 * Open the row/column preset picker. Calls onSelect(columns) with an array
 * of 1-12 integers (one per column, summing to at most 12) when the admin
 * picks a preset or generates a valid custom split; does nothing on cancel.
 *
 * @param {Object} options
 * @param {Function} options.onSelect
 * @param {number[]} [options.current] - pre-fill the custom input with the
 *   row's current split, when reopening the picker for an existing row.
 */
let openRowPicker = (options) => {
    options = options || {};

    let content = modal.open({
        content: buildContent(!!options.responsive),
        className: 'genesis-dialog-theme-default lm-row-picker-dialog',
        afterOpen: (contentElement) => {
            let element = contentElement && contentElement[0] ? contentElement[0] : contentElement;
            if (!element) { return; }

            let errorNode = element.querySelector('.lm-row-picker-error'),
                input = element.querySelector('.lm-row-picker-custom-input'),
                activeBreakpoint = 'xs',
                current = options.currentByBreakpoint || { xs: options.current || [] },
                expectedColumns = options.columnCount || (current.xs || []).length;

            let refreshBreakpoint = () => {
                let split = current[activeBreakpoint];
                if (input) { input.value = split && split.length ? split.join('+') : ''; }
                let inherit = element.querySelector('[data-lm-row-inherit]');
                if (inherit) { inherit.hidden = activeBreakpoint === 'xs'; }
                let help = element.querySelector('[data-lm-row-breakpoint-help]');
                if (help) {
                    help.textContent = activeBreakpoint === 'xs' ? translate('GENESIS_PLATFORM_JS_LM_ROW_XS_HELP') :
                        translate('GENESIS_PLATFORM_JS_LM_ROW_BREAKPOINT_HELP', activeBreakpoint.toUpperCase());
                }
                element.querySelectorAll('[data-lm-row-preset]').forEach((button) => {
                    let preset = PRESETS[parseInt(button.getAttribute('data-lm-row-preset'), 10)];
                    button.hidden = activeBreakpoint !== 'xs' && expectedColumns && preset.length !== expectedColumns;
                });
            };
            refreshBreakpoint();

            let showError = (message) => {
                if (!errorNode) { return; }
                errorNode.textContent = message;
                errorNode.hidden = false;
            };

            let finish = (columns) => {
                modal.close();
                if (typeof options.onSelect === 'function') { options.onSelect(columns, activeBreakpoint); }
            };

            element.querySelectorAll('[data-lm-row-breakpoint]').forEach((button) => {
                button.addEventListener('click', () => {
                    activeBreakpoint = button.getAttribute('data-lm-row-breakpoint');
                    element.querySelectorAll('[data-lm-row-breakpoint]').forEach((tab) => tab.setAttribute('aria-selected', tab === button ? 'true' : 'false'));
                    refreshBreakpoint();
                });
            });

            element.querySelectorAll('[data-lm-row-preset]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    let index = parseInt(button.getAttribute('data-lm-row-preset'), 10);
                    finish(PRESETS[index].slice());
                });
            });

            let generate = element.querySelector('[data-lm-row-generate]');
            if (generate) {
                generate.addEventListener('click', (event) => {
                    event.preventDefault();
                    let columns = parseCustomSplit(input ? input.value : '');
                    if (!columns || (activeBreakpoint !== 'xs' && expectedColumns && columns.length !== expectedColumns)) {
                        showError(translate('GENESIS_PLATFORM_JS_LM_ROW_PICKER_INVALID'));
                        return;
                    }
                    finish(columns);
                });
            }

            let inherit = element.querySelector('[data-lm-row-inherit]');
            if (inherit) { inherit.addEventListener('click', () => finish(null)); }

            if (input) {
                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        if (generate) { generate.click(); }
                    }
                });
            }
        }
    });

    return content;
};

export default openRowPicker;
