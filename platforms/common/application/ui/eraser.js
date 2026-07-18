'use strict';

const toPixels = value => typeof value === 'number' ? `${value}px` : value;

const applyStyles = (element, styles) => {
    Object.keys(styles).forEach(property => {
        element.style[property] = toPixels(styles[property]);
    });
};

const animateStyles = (element, styles, fast, easing = 'ease') => {
    const finalStyles = Object.keys(styles).reduce((result, property) => {
        result[property] = toPixels(styles[property]);
        return result;
    }, {});

    if (fast || typeof element.animate !== 'function') {
        applyStyles(element, finalStyles);
        return;
    }

    const animation = element.animate([{}, finalStyles], {
        duration: 150,
        easing,
        fill: 'forwards'
    });
    animation.addEventListener('finish', () => {
        applyStyles(element, finalStyles);
        animation.cancel();
    }, { once: true });
};

class Eraser {
    constructor(element, options = {}) {
        this.options = { ...options };
        this.setElement(element);
        if (this.element) this.hide(true);
    }

    setElement(element) {
        const next = typeof element === 'string'
            ? document.querySelector(element)
            : (element && element.nodeType ? element : element && element[0]);

        if (next !== this.element) {
            this.element = next || null;
            this.top = undefined;
            this.left = undefined;
        }
        return this;
    }

    setTop() {
        if (this.top !== undefined || !this.element) return;
        this.top = Number.parseInt(getComputedStyle(this.element).top, 10) || 0;
        const container = document.querySelector('#g5-container');
        this.left = container ? container.getBoundingClientRect().left : 0;
        if (window.GANTRY_PLATFORM === 'grav') this.left = 0;
    }

    show(fast) {
        if (!this.element) return;
        this.setTop();
        this.out();
        animateStyles(this.element, { top: this.top, left: this.left }, fast);
    }

    hide(fast) {
        if (!this.element) return;
        this.setTop();
        this.element.style.display = 'block';
        this.out();
        animateStyles(this.element, { top: -this.element.offsetHeight }, fast);
    }

    over() {
        const zone = this.element && this.element.querySelector('.trash-zone');
        if (zone) animateStyles(zone, { transform: 'scale(1.2)' }, false, 'cubic-bezier(0.5,0,0.5,1)');
    }

    out() {
        const zone = this.element && this.element.querySelector('.trash-zone');
        if (zone) animateStyles(zone, { transform: 'scale(1)' }, false, 'cubic-bezier(0.5,0,0.5,1)');
    }
}

module.exports = Eraser;
