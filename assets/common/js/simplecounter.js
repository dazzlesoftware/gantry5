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

    const block = (value, word, pad = true) => {
        const wrapper = document.createElement('span');
        const number = document.createElement('span');
        const labelElement = document.createElement('span');

        wrapper.className = 'counter-block';
        number.className = 'number';
        labelElement.className = 'word';
        number.textContent = pad ? String(value).padStart(2, '0') : String(value);
        labelElement.textContent = word;
        wrapper.append(number, labelElement);

        return wrapper;
    };

    class SimpleCounter {
        constructor(element) {
            this.element = element;
            this.target = parseTarget(element.dataset.countdown);
            this.timer = null;

            if (!this.target) {
                element.classList.add('g-simplecounter-invalid');
                return;
            }

            this.update();
            this.timer = window.setInterval(() => this.update(), SECOND);
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

            this.element.replaceChildren(
                block(days, label(this.element, 'day', days), false),
                block(hours, label(this.element, 'hour', hours)),
                block(minutes, label(this.element, 'minute', minutes)),
                block(seconds, label(this.element, 'second', seconds))
            );

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
