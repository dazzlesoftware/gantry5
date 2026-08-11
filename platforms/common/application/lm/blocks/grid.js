import __module0 from './base.js';
import __module1 from '../../utils/translate.js';

"use strict";

let Base      = __module0,
    translate = __module1;

class Grid extends Base {
    constructor(options) {
        super(options);
        this.on('changed', this.hasChanged);
    }

    layout() {
        return '<div class="g-grid nowrap" data-lm-id="' + this.getId() + '" ' + this.dropzone() + ' data-lm-samewidth data-lm-blocktype="grid">' +
            '<button type="button" class="grid-layout-picker" data-lm-nodrag data-lm-row-layout data-tip="' +
                translate('GENESIS_PLATFORM_JS_LM_ROW_CHANGE_LAYOUT') + '" data-tip-place="top-right">' +
                '<i class="fa fa-columns" aria-hidden="true"></i>' +
                '<span class="sr-only">' + translate('GENESIS_PLATFORM_JS_LM_ROW_CHANGE_LAYOUT') + '</span>' +
            '</button>' +
        '</div>';
    }

    onRendered() {
        let parent = this.block.parent();
        if (parent && parent.data('lm-blocktype') == 'atoms') {
            this.block.removeClass('nowrap');
        }

        if (parent && (parent.data('lm-root') || (parent.data('lm-blocktype') == 'container' && parent.parent().data('lm-root')))) {
            this.removeDropzone();
        }
    }

    hasChanged(state) {
        // Grids forward their indicator to the parent section.
        let parent = this.block.parent('[data-lm-blocktype="section"]'),
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
