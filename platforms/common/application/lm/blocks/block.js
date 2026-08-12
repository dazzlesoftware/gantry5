import __module0 from './base.js';

"use strict";

let Base = __module0;

let precision = function(value, decimals) {
    let multiplier = Math.pow(10, decimals);
    return Math.round(Number(value) * multiplier) / multiplier;
};

class Block extends Base {
    constructor(options) {
        super(options);
        let legacyWidth = options && options.attributes && Number(options.attributes.size);
        let hasAuthoredColumn = options && options.attributes && options.attributes.columns && options.attributes.columns.xs;
        if (!hasAuthoredColumn && legacyWidth) {
            this.setAttribute('columns.xs', Math.max(1, Math.min(12, Math.round(legacyWidth / 100 * 12))));
        }
        delete this.attributes.size;
        this.applyColumnClasses();
        this.on('changed', this.hasChanged);
    }

    getColumnSpan(breakpoint) {
        let stored = parseInt(this.getAttribute('columns.' + breakpoint), 10);
        if (stored) { return Math.max(1, Math.min(12, stored)); }
        if (breakpoint !== 'xs') { return null; }
        return 12;
    }

    applyColumnClasses() {
        if (!this.block || !this.block[0]) { return this; }
        let element = this.block[0];
        Array.from(element.classList).forEach(function(klass) {
            if (/^col-(?:(?:sm|md|lg|xl)-)?\d+$/.test(klass)) { element.classList.remove(klass); }
        });

        let xs = this.getColumnSpan('xs');
        element.classList.add('col-' + xs);
        ['sm', 'md', 'lg', 'xl'].forEach(function(breakpoint) {
            let span = this.getColumnSpan(breakpoint);
            if (span) { element.classList.add('col-' + breakpoint + '-' + span); }
        }, this);
        return this;
    }

    getWidthPercent() {
        return precision(this.getColumnSpan('xs') / 12 * 100, 1);
    }

    setWidthPercent(size, store) {
        size = typeof size === 'undefined' ? this.getWidthPercent() : Math.max(0, Math.min(100, parseFloat(size)));
        size = precision(size, 1);
        if (store) {
            this.setAttribute('columns.xs', Math.max(1, Math.min(12, Math.round(size / 100 * 12))));
        }

        let style = this.block[0].style;
        style.flex = '0 1 ' + size + '%';
        style.webkitFlex = '0 1 ' + size + '%';
        style.msFlex = '0 1 ' + size + '%';

        this.applyColumnClasses();

        this.emit('resized', size, this);
    }

    setAnimatedWidthPercent(size, store) {
        size = typeof size === 'undefined' ? this.getWidthPercent() : Math.max(0, Math.min(100, parseFloat(size)));
        size = precision(size, 1);
        if (store) {
            this.setAttribute('columns.xs', Math.max(1, Math.min(12, Math.round(size / 100 * 12))));
        }

        let block = this.block[0],
            target = '0 1 ' + size + '%';

        if (this.sizeAnimation) { this.sizeAnimation.cancel(); }
        if (typeof block.animate === 'function') {
            this.sizeAnimation = block.animate([
                { flex: getComputedStyle(block).flex },
                { flex: target }
            ], {
                duration: 250,
                easing: 'ease',
                fill: 'forwards'
            });
            this.sizeAnimation.addEventListener('finish', function() {
                let animation = this.sizeAnimation;
                this.sizeAnimation = null;
                block.removeAttribute('style');
                this.setWidthPercent(size);
                animation.cancel();
            }.bind(this), { once: true });
        } else {
            block.removeAttribute('style');
            this.setWidthPercent(size);
        }

        this.emit('resized', size, this);
    }

    setLabelSize(size) {
        let label = this.block[0].querySelector(':scope > .particle-size');
        if (!label) { return false; }
        let span = Math.max(1, Math.min(12, Math.round(Number(size) / 100 * 12)));
        label.textContent = 'col-' + span;
    }

    layout() {
        return '<div class="g-block" data-lm-id="' + this.getId() + '"' + this.dropzone() + ' data-lm-blocktype="block">' +
            '<button type="button" class="lm-column-add" data-lm-nodrag data-lm-column-add aria-label="Add content">' +
                '<span aria-hidden="true">+</span>' +
            '</button>' +
        '</div>';
    }

    onRendered(element, parent) {
        let elementBlock = element.block[0];
        if (elementBlock.querySelector(':scope > [data-lm-blocktype="section"]')) { this.removeDropzone(); }
        if (!parent) { return; }

        let grandpa = parent.block[0].parentElement,
            greatGrandpa = grandpa && grandpa.parentElement,
            isRoot = grandpa && grandpa.hasAttribute('data-lm-root'),
            isRootContainer = grandpa && grandpa.getAttribute('data-lm-blocktype') === 'container' && greatGrandpa &&
                (greatGrandpa.hasAttribute('data-lm-root') || greatGrandpa.getAttribute('data-lm-blocktype') === 'wrapper');

        if (isRoot || isRootContainer) {
            let label = document.createElement('span');
            label.className = 'particle-size';
            label.textContent = 'col-' + this.getColumnSpan('xs');
            elementBlock.insertBefore(label, elementBlock.firstChild);
            element.on('resized', this.bound('onResize'));
        }
    }

    onResize(resize) {
        this.setLabelSize(resize);
    }

    hasChanged(state) {
        let icon,
            block = this.block[0],
            child = block.querySelector(':scope > [data-lm-id]:not([data-lm-blocktype="section"]):not([data-lm-blocktype="container"])');

        this.changeState = state;

        if (!child) {
            child = block.querySelector(':scope > .particle-size');
            if (!child) {
                let parentBlock = block.parentElement && block.parentElement.closest('[data-lm-blocktype="block"]');
                child = parentBlock && parentBlock.querySelector(':scope > .particle-size');
            }
            if (!child) { return; }

            icon = child.querySelector('i:first-child');

            if (!state && icon) { icon.remove(); }
            if (state && !icon) {
                icon = document.createElement('i');
                icon.className = 'far fa-circle changes-indicator';
                child.insertBefore(icon, child.firstChild);
            }
            return;
        }

        let mapped = this.options.builder.get(child.getAttribute('data-lm-id'));
        if (mapped) { mapped.emit('changed', state, this); }
    }
}

Block.prototype.options = {
    type: 'block',
    attributes: {
        columns: { xs: 12 }
    }
};

export default Block;
