'use strict';

const $ = require('../utils/elements.utils');

class Eraser {
    constructor(element, options = {}) {
        this.options = { ...options };
        this.element = $(element);
        if (this.element) this.hide(true);
    }

    setTop() {
        if (this.top !== undefined || !this.element) return;
        this.top = Number.parseInt(this.element.compute('top'), 10);
        const container = document.querySelector('#g5-container');
        this.left = container ? container.getBoundingClientRect().left : 0;
        if (window.GANTRY_PLATFORM === 'grav') this.left = 0;
    }

    show(fast) {
        if (!this.element) return;
        this.setTop();
        this.out();
        this.element[fast ? 'style' : 'animate'](
            { top: this.top, left: this.left },
            { duration: '150ms' }
        );
    }

    hide(fast) {
        if (!this.element) return;
        this.setTop();
        this.element.style('display', 'block');
        this.out();
        this.element[fast ? 'style' : 'animate'](
            { top: -this.element[0].offsetHeight },
            { duration: '150ms' }
        );
    }

    over() {
        const zone = this.element && this.element.find('.trash-zone');
        if (zone) zone.animate(
            { transform: 'scale(1.2)' },
            { duration: '150ms', equation: 'cubic-bezier(0.5,0,0.5,1)' }
        );
    }

    out() {
        const zone = this.element && this.element.find('.trash-zone');
        if (zone) zone.animate(
            { transform: 'scale(1)' },
            { duration: '150ms', equation: 'cubic-bezier(0.5,0,0.5,1)' }
        );
    }
}

module.exports = Eraser;
