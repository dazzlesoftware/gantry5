import __module0 from './section.js';

"use strict";

let Section = __module0;

class Wrapper extends Section {
    layout() {
        return '<div class="wrapper-section" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" data-lm-blocksubtype="' + this.getSubType() + '"></div>';
    }

    hasChanged() {}

    getWidthPercent() {
        return false;
    }

    getId() {
        return this.id || (this.id = this.options.type);
    }
}

Wrapper.prototype.options = {
    type: 'wrapper',
    attributes: {name: 'Wrapper'}
};

export default Wrapper;
