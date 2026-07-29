/**
 * Native Simple Counter particle controller.
 *
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
(() => {
    'use strict';

    const SELECTOR = '[data-simplecounter], [data-simplecounter-id]';
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const instances = new WeakMap();
    const loadedFonts = new Set();

    const loadGoogleFont = (query) => {
        const url = `https://fonts.googleapis.com/css?${query}`;

        if (loadedFonts.has(url)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.dataset.simplecounterFont = '';
        document.head.append(link);
        loadedFonts.add(url);
    };

    const parseFont = (value) => {
        const font = String(value || '').trim();

        if (!font) {
            return null;
        }

        if (!font.startsWith('family=')) {
            return font;
        }

        const parameters = new URLSearchParams(font);
        const family = parameters.get('family');

        if (!family) {
            return null;
        }

        loadGoogleFont(parameters.toString());

        const familyName = family.split(':', 1)[0].trim();
        return familyName ? JSON.stringify(familyName) : null;
    };

    const applyFont = (root, elements, property, value) => {
        const font = parseFont(value);

        if (!font || !root) {
            return;
        }

        root.style.setProperty(property, font);
        elements.forEach((element) => {
            element.style.fontFamily = `var(${property})`;
        });
    };

    const parseTarget = (value) => {
        if (!value) {
            return null;
        }

        const match = String(value).trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/);
        if (!match) {
            return null;
        }

        const [, year, month, day, hour = 0, minute = 0, second = 0] = match;
        const target = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        );

        return Number.isNaN(target.getTime()) ? null : target;
    };

    const label = (element, unit, value) => {
        const singular = element.getAttribute(`data-simplecounter-${unit}text`) || unit;
        const plural = element.getAttribute(`data-simplecounter-${unit}stext`) || `${singular}s`;
        return Math.abs(value) === 1 ? singular : plural;
    };

    const createBlock = (unit, pad = true) => {
        const wrapper = document.createElement('span');
        const number = document.createElement('span');
        const labelElement = document.createElement('span');

        wrapper.className = 'counter-block';
        wrapper.dataset.simplecounterUnit = unit;
        number.className = 'number';
        labelElement.className = 'word';
        wrapper.append(number, labelElement);

        return {
            wrapper,
            number,
            label: labelElement,
            pad,
            value: null,
            word: null
        };
    };

    class SimpleCounter {
        constructor(element) {
            this.element = element;
            this.target = parseTarget(element.dataset.countdown);
            this.timer = null;
            this.blocks = {
                day: createBlock('day', false),
                hour: createBlock('hour'),
                minute: createBlock('minute'),
                second: createBlock('second')
            };

            if (!this.target) {
                element.classList.add('g-simplecounter-invalid');
                return;
            }

            element.replaceChildren(
                this.blocks.day.wrapper,
                this.blocks.hour.wrapper,
                this.blocks.minute.wrapper,
                this.blocks.second.wrapper
            );
            this.applyFonts();
            this.update();
            this.timer = window.setInterval(() => this.update(), SECOND);
        }

        applyFonts() {
            const root = this.element.closest('.g-simplecounter');

            applyFont(
                root,
                root?.querySelectorAll('.g-title') || [],
                '--g-simplecounter-title-font',
                this.element.getAttribute('data-simplecounter-titlefont')
            );
            applyFont(
                root,
                root?.querySelectorAll('.g-simplecounter-content') || [],
                '--g-simplecounter-description-font',
                this.element.getAttribute('data-simplecounter-descriptionfont')
            );
            applyFont(
                root,
                Object.values(this.blocks).map(({number}) => number),
                '--g-simplecounter-number-font',
                this.element.getAttribute('data-simplecounter-numberfont')
            );
            applyFont(
                root,
                Object.values(this.blocks).map(({label: labelElement}) => labelElement),
                '--g-simplecounter-label-font',
                this.element.getAttribute('data-simplecounter-labelfont')
            );
        }

        renderUnit(unit, value) {
            const block = this.blocks[unit];
            const word = label(this.element, unit, value);

            if (block.value !== value) {
                block.number.textContent = block.pad
                    ? String(value).padStart(2, '0')
                    : String(value);
                block.value = value;
            }

            if (block.word !== word) {
                block.label.textContent = word;
                block.word = word;
            }
        }

        update() {
            if (!this.element.isConnected) {
                this.destroy();
                return;
            }

            const remaining = Math.max(0, this.target.getTime() - Date.now());
            const days = Math.floor(remaining / DAY);
            const hours = Math.floor((remaining % DAY) / HOUR);
            const minutes = Math.floor((remaining % HOUR) / MINUTE);
            const seconds = Math.floor((remaining % MINUTE) / SECOND);

            this.renderUnit('day', days);
            this.renderUnit('hour', hours);
            this.renderUnit('minute', minutes);
            this.renderUnit('second', seconds);

            if (remaining === 0) {
                this.destroy();
                this.element.dispatchEvent(new CustomEvent('simplecounter:finish', {bubbles: true}));
            }
        }

        destroy() {
            if (this.timer !== null) {
                window.clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    const initialize = (root = document) => {
        const elements = root.matches?.(SELECTOR)
            ? [root]
            : root.querySelectorAll?.(SELECTOR) || [];

        elements.forEach((element) => {
            if (!instances.has(element)) {
                instances.set(element, new SimpleCounter(element));
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initialize(), {once: true});
    } else {
        initialize();
    }

    new MutationObserver((mutations) => {
        mutations.forEach(({addedNodes}) => {
            addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    initialize(node);
                }
            });
        });
    }).observe(document.documentElement, {childList: true, subtree: true});
})();
