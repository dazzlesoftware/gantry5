"use strict";

var Base       = require('./base'),
    zen        = require('elements/zen'),
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
        var icon = this.block.find('span.title > i:first-child');

        // A grid event must not clear a changed state owned by another child.
        if (icon && child && !child.changeState) { return; }

        this.block[state ? 'addClass' : 'removeClass']('block-has-changes');
        if (!state && icon) { icon.remove(); }
        if (state && !icon) {
            var title = this.block.find('span.title');
            if (title) { zen('i.far.fa-circle.changes-indicator').top(title); }
        }
    }

    addSettings(container) {
        var settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            wrapper = zen('div.container-wrapper.clearfix').top(container.block),
            title = zen('div.container-title').bottom(wrapper),
            actions = zen('div.container-actions').bottom(wrapper);

        title.html('<span class="title">' + this.getType() + '</span>');
        actions.html('<span data-tip="' + translate('GANTRY5_PLATFORM_JS_LM_SETTINGS', 'Container') + '" data-tip-place="top-left"><i aria-label="' + translate('GANTRY5_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Container') + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span>');
    }
}

Container.prototype.options = {
    type: 'container'
};

module.exports = Container;
