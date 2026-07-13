'use strict';

const {ready} = require('../utils/dom');

const defaults = {
    baseClass: 'g-tips',
    typeClass: null,
    effectClass: 'g-fade',
    inClass: 'g-tip-in',
    place: 'top',
    spacing: 10,
    offset: -3,
    auto: true
};

const number = (value, fallback) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

class Tooltip {
    constructor(target, options = {}) {
        this.target = target;
        this.options = Object.assign({}, defaults, options);
        this.element = document.createElement('div');
        this.element.setAttribute('role', 'tooltip');
        this.hidden = true;
        this.hideTimer = null;
        this.content(target.dataset.tip || '');
    }

    readOptions() {
        const data = this.target.dataset;
        this.options.place = data.tipPlace || this.options.place;
        this.options.spacing = number(data.tipSpacing, defaults.spacing);
        this.options.offset = number(data.tipOffset, defaults.offset);
        this.options.typeClass = data.tipType || null;
        return this;
    }

    content(content) {
        if (content instanceof Node) {
            this.element.replaceChildren(content);
        } else {
            this.element.innerHTML = content == null ? '' : String(content);
        }
        return this;
    }

    place(place) {
        this.options.place = place || defaults.place;
        if (!this.hidden) {
            this.position();
        }
        return this;
    }

    show() {
        if (!this.target.isConnected || !this.element.innerHTML) {
            return this;
        }

        clearTimeout(this.hideTimer);
        this.readOptions();
        this.element.className = [
            this.options.baseClass,
            this.options.effectClass,
            this.options.typeClass,
            this.options.place
        ].filter(Boolean).join(' ');

        if (!this.element.isConnected) {
            document.body.appendChild(this.element);
        }

        this.element.style.display = 'block';
        this.hidden = false;
        this.position();
        requestAnimationFrame(() => {
            if (!this.hidden) {
                this.element.classList.add(this.options.inClass);
            }
        });
        return this;
    }

    hide() {
        if (this.hidden) {
            return this;
        }

        this.hidden = true;
        this.element.classList.remove(this.options.inClass);
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            if (this.hidden) {
                this.element.style.display = 'none';
            }
        }, 200);
        return this;
    }

    toggle() {
        return this.hidden ? this.show() : this.hide();
    }

    position() {
        if (this.hidden || !this.target.isConnected) {
            return this;
        }

        const target = this.target.getBoundingClientRect();
        const tip = this.element.getBoundingClientRect();
        const place = this.options.place;
        const spacing = this.options.spacing;
        const offset = this.options.offset;
        let top;
        let left;

        if (place.startsWith('bottom')) {
            top = target.bottom + spacing;
        } else if (place.startsWith('left') || place.startsWith('right')) {
            top = target.top + (target.height - tip.height) / 2;
        } else {
            top = target.top - tip.height - spacing;
        }

        if (place.startsWith('right')) {
            left = target.right + spacing;
        } else if (place.startsWith('left')) {
            left = target.left - tip.width - spacing;
        } else {
            left = target.left + (target.width - tip.width) / 2;
        }

        if (/-(left|top)$/.test(place)) {
            if (place.startsWith('left') || place.startsWith('right')) {
                top = target.bottom - tip.height - offset;
            } else {
                left = target.right - tip.width - offset;
            }
        } else if (/-(right|bottom)$/.test(place)) {
            if (place.startsWith('left') || place.startsWith('right')) {
                top = target.top + offset;
            } else {
                left = target.left + offset;
            }
        } else if (place.startsWith('left') || place.startsWith('right')) {
            top += offset;
        } else {
            left += offset;
        }

        if (this.options.auto) {
            left = Math.min(Math.max(left, 4), window.innerWidth - tip.width - 4);
            top = Math.min(Math.max(top, 4), window.innerHeight - tip.height - 4);
        }

        this.element.style.left = `${left + window.scrollX}px`;
        this.element.style.top = `${top + window.scrollY}px`;
        return this;
    }

    destroy() {
        clearTimeout(this.hideTimer);
        this.element.remove();
        this.target = null;
    }
}

class Tooltips {
    constructor(container = document) {
        this.container = container;
        this.instances = new WeakMap();
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.onFocusIn = this.onFocusIn.bind(this);
        this.onFocusOut = this.onFocusOut.bind(this);
        container.addEventListener('mouseover', this.onMouseOver);
        container.addEventListener('mouseout', this.onMouseOut);
        container.addEventListener('focusin', this.onFocusIn);
        container.addEventListener('focusout', this.onFocusOut);
    }

    targetFromEvent(event) {
        return event.target instanceof Element ? event.target.closest('[data-tip]') : null;
    }

    onMouseOver(event) {
        const target = this.targetFromEvent(event);
        if (target && !target.contains(event.relatedTarget)) {
            this.show(target);
        }
    }

    onMouseOut(event) {
        const target = this.targetFromEvent(event);
        if (target && !target.contains(event.relatedTarget)) {
            this.hide(target);
        }
    }

    onFocusIn(event) {
        const target = this.targetFromEvent(event);
        if (target) {
            this.show(target);
        }
    }

    onFocusOut(event) {
        const target = this.targetFromEvent(event);
        if (target) {
            this.hide(target);
        }
    }

    get(element) {
        if (!element || element.nodeType !== 1) {
            return null;
        }

        let tooltip = this.instances.get(element);
        if (!tooltip && element.dataset.tip) {
            tooltip = new Tooltip(element);
            this.instances.set(element, tooltip);
        }
        return tooltip;
    }

    show(element) {
        const tooltip = this.get(element);
        if (tooltip) {
            tooltip.content(element.dataset.tip).show();
        }
        return this;
    }

    hide(element) {
        const tooltip = this.instances.get(element);
        if (tooltip) {
            tooltip.hide();
        }
        return this;
    }

    toggle(element) {
        const tooltip = this.get(element);
        if (tooltip) {
            tooltip.toggle();
        }
        return this;
    }

    remove(element) {
        const tooltip = this.instances.get(element);
        if (tooltip) {
            tooltip.destroy();
            this.instances.delete(element);
        }
        return this;
    }

    add() {
        return this;
    }

    reload() {
        return this;
    }

    destroy() {
        this.container.removeEventListener('mouseover', this.onMouseOver);
        this.container.removeEventListener('mouseout', this.onMouseOut);
        this.container.removeEventListener('focusin', this.onFocusIn);
        this.container.removeEventListener('focusout', this.onFocusOut);
    }
}

let instance = null;

ready(() => {
    instance = new Tooltips(document);
    window.G5.tips = instance;
});

module.exports = instance;
