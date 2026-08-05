import __module0 from './particle.js';

"use strict";

let Particle = __module0;

let UID = 0;

class Position extends Particle {
    constructor(options) {
        ++UID;
        super(options);
        this.setAttribute('title', this.getTitle());
        this.setAttribute('key', this.getKey());
        if (this.isNew()) { --UID; }
    }

    getTitle() {
        return String(this.options.title || 'Position ' + UID).trim();
    }

    getKey() {
        return this.getAttribute('key') || this.getTitle().trim().replace(/\s/g, '-').toLowerCase();
    }

    updateKey(key) {
        this.options.key = key || this.getKey();
        this.block.find('.font-small').text(this.getKey());
        return this;
    }
}

Position.prototype.options = {
    type: 'position'
};

export default Position;
