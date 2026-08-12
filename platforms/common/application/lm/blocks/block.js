import __module0 from './base.js';

"use strict";

let Base = __module0;

class Block extends Base {
    constructor(options) {
        super(options);
        this.applyColumnClasses();
        this.on('changed', this.hasChanged);
    }

    getColumnSpan(breakpoint = 'xs') {
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

    setColumnSpan(span, store = true, breakpoint = 'xs') {
        span = typeof span === 'undefined' ? this.getColumnSpan(breakpoint) : parseInt(span, 10);
        span = Math.max(1, Math.min(12, span || 12));
        if (store) { this.setAttribute('columns.' + breakpoint, span); }
        if (this.block && this.block[0]) { this.block[0].removeAttribute('style'); }
        this.applyColumnClasses();
        this.emit('resized', span, this);
        return this;
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
    }

    hasChanged(state) {
        let block = this.block[0],
            child = block.querySelector(':scope > [data-lm-id]:not([data-lm-blocktype="section"]):not([data-lm-blocktype="container"])');

        this.changeState = state;

        if (!child) { return; }

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
