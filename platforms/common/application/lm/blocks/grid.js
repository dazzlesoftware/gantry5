import __module0 from './base.js';

"use strict";

var Base = __module0;

class Grid extends Base {
    constructor(options) {
        super(options);
        this.on('changed', this.hasChanged);
    }

    layout() {
        return '<div class="g-grid nowrap" data-lm-id="' + this.getId() + '" ' + this.dropzone() + ' data-lm-samewidth data-lm-blocktype="grid"></div>';
    }

    onRendered() {
        var parent = this.block.parent();
        if (parent && parent.data('lm-blocktype') == 'atoms') {
            this.block.removeClass('nowrap');
        }

        if (parent && (parent.data('lm-root') || (parent.data('lm-blocktype') == 'container' && parent.parent().data('lm-root')))) {
            this.removeDropzone();
        }
    }

    hasChanged(state) {
        // Grids forward their indicator to the parent section.
        var parent = this.block.parent('[data-lm-blocktype="section"]'),
            id = parent ? parent.data('lm-id') : false;

        this.changeState = state;
        if (!parent || !id) { return; }
        if (this.options.builder) { this.options.builder.get(id).emit('changed', state, this); }
    }
}

Grid.prototype.options = {
    type: 'grid'
};

export default Grid;
