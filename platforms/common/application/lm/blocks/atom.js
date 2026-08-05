import __module0 from './base.js';
import __module1 from '../../utils/get-ajax-url.js';

"use strict";

let Base       = __module0,
    getAjaxURL = __module1.config;

class Atom extends Base {
    constructor(options) {
        super(options);
        this.on('changed', this.hasChanged);
    }

    updateTitle(title) {
        let titleElement = this.block[0].querySelector('.title');
        if (titleElement) { titleElement.textContent = title; }
        this.setTitle(title);
        return this;
    }

    layout() {
        let settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            subtype = this.getSubType() ? 'data-lm-blocksubtype="' + this.getSubType() + '"' : '';

        return '<div class="' + this.getType() + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" ' + subtype + '><span><span class="title">' + this.getTitle() + '</span><span class="font-small">' + (this.getSubType() || this.getKey() || this.getType()) + '</span></span><div class="float-right"><i aria-label="Configure Atom Settings" class="fa fa-cog" aria-hidden="true" data-lm-nodrag data-lm-settings="' + settingsUri + '"></i></div></div>';
    }

    hasChanged(state, parent) {
        let block = this.block[0],
            icon = block.querySelector('span > i.changes-indicator:first-child');
        if (icon && parent && !parent.changeState) { return; }

        block.classList.toggle('block-has-changes', Boolean(state));
        if (!state && icon) { icon.remove(); }
        if (state && !icon) {
            icon = document.createElement('i');
            icon.className = 'far fa-circle changes-indicator';

            let reference = block.querySelector('.icon'),
                container = reference ? reference.parentNode : block.querySelector('span');
            if (container) { container.insertBefore(icon, reference || container.firstChild); }
        }
    }

    onRendered() {
        let globallyDisabled = document.querySelector('[data-lm-disabled][data-lm-subtype="' + CSS.escape(this.getSubType() || '') + '"]');
        if (globallyDisabled || this.getAttribute('enabled') === 0) { this.disable(); }
    }
}

Atom.prototype.options = {
    type: 'atom'
};

export default Atom;
