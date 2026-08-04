"use strict";

var Base       = require('./base'),
    getAjaxURL = require('../../utils/get-ajax-url').config,
    translate  = require('../../utils/translate');

class Container extends Base {
    constructor(options) {
        super(options);
        this.on('changed', this.hasChanged);
    }

    layout() {
        return '<div class="g-lm-container" data-lm-id="' + this.getId() + '" data-lm-blocktype="container"></div>';
    }

    onRendered(element, parent) {
        if (!parent) { this.addSettings(element); }
    }

    hasChanged(state, child) {
        var block = this.block[0],
            title = block.querySelector('span.title'),
            icon = title && title.querySelector(':scope > i:first-child');

        // A grid event must not clear a changed state owned by another child.
        if (icon && child && !child.changeState) { return; }

        block.classList.toggle('block-has-changes', Boolean(state));
        if (!state && icon) { icon.remove(); }
        if (state && !icon && title) {
            icon = document.createElement('i');
            icon.className = 'far fa-circle changes-indicator';
            title.insertBefore(icon, title.firstChild);
        }
    }

    addSettings(container) {
        var settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            block = container.block[0],
            wrapper = document.createElement('div');

        wrapper.className = 'container-wrapper clearfix';
        wrapper.innerHTML = '<div class="container-title"><span class="title">' + this.getType() + '</span></div>' +
            '<div class="container-actions"><span data-tip="' + translate('GENESIS_PLATFORM_JS_LM_SETTINGS', 'Container') + '" data-tip-place="top-left"><i aria-label="' + translate('GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Container') + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span></div>';
        block.insertBefore(wrapper, block.firstChild);
    }
}

Container.prototype.options = {
    type: 'container'
};

module.exports = Container;
