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
        if (options && options.attributes && options.attributes.size) {
            this.setAttribute('size', precision(options.attributes.size, 1));
        }
        this.applyColumnClasses();
        this.on('changed', this.hasChanged);
    }

    getColumnSpan(breakpoint) {
        let stored = parseInt(this.getAttribute('columns.' + breakpoint), 10);
        if (stored) { return Math.max(1, Math.min(12, stored)); }
        if (breakpoint !== 'xs') { return null; }
        return Math.max(1, Math.min(12, Math.round((this.getSize() || 100) / 100 * 12)));
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

    getSize() {
        return precision(this.getAttribute('size'), 1);
    }

    setSize(size, store) {
        size = typeof size === 'undefined' ? this.getSize() : Math.max(0, Math.min(100, parseFloat(size)));
        size = precision(size, 1);
        if (store) { this.setAttribute('size', size); }

        let style = this.block[0].style;
        style.flex = '0 1 ' + size + '%';
        style.webkitFlex = '0 1 ' + size + '%';
        style.msFlex = '0 1 ' + size + '%';

        this.applyColumnClasses();

        this.emit('resized', size, this);
    }

    setAnimatedSize(size, store) {
        size = typeof size === 'undefined' ? this.getSize() : Math.max(0, Math.min(100, parseFloat(size)));
        size = precision(size, 1);
        if (store) { this.setAttribute('size', size); }

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
                this.setSize(size);
                animation.cancel();
            }.bind(this), { once: true });
        } else {
            block.removeAttribute('style');
            this.setSize(size);
        }

        this.emit('resized', size, this);
    }

    setLabelSize(size) {
        let label = this.block[0].querySelector(':scope > .particle-size');
        if (!label) { return false; }
        label.textContent = precision(size, 1) + '%';
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
            label.textContent = this.getSize() + '%';
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
        size: 100
    }
};

export default Block;
