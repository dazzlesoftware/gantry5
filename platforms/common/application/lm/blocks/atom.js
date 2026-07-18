"use strict";

var $          = require('elements'),
    Base       = require('./base'),
    zen        = require('elements/zen'),
    getAjaxURL = require('../../utils/get-ajax-url').config;

class Atom extends Base {
    constructor(options) {
        super(options);
        this.on('changed', this.hasChanged);
    }

    updateTitle(title) {
        this.block.find('.title').text(title);
        this.setTitle(title);
        return this;
    }

    layout() {
        var settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            subtype = this.getSubType() ? 'data-lm-blocksubtype="' + this.getSubType() + '"' : '';

        return '<div class="' + this.getType() + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" ' + subtype + '><span><span class="title">' + this.getTitle() + '</span><span class="font-small">' + (this.getSubType() || this.getKey() || this.getType()) + '</span></span><div class="float-right"><i aria-label="Configure Atom Settings" class="fa fa-cog" aria-hidden="true" data-lm-nodrag data-lm-settings="' + settingsUri + '"></i></div></div>';
    }

    hasChanged(state, parent) {
        var icon = this.block.find('span > i.changes-indicator:first-child');
        if (icon && parent && !parent.changeState) { return; }

        this.block[state ? 'addClass' : 'removeClass']('block-has-changes');
        if (!state && icon) { icon.remove(); }
        if (state && !icon) { zen('i.far.fa-circle.changes-indicator').before(this.block.find('.icon')); }
    }

    onRendered() {
        var globallyDisabled = $('[data-lm-disabled][data-lm-subtype="' + this.getSubType() + '"]');
        if (globallyDisabled || this.getAttribute('enabled') === 0) { this.disable(); }
    }
}

Atom.prototype.options = {
    type: 'atom'
};

module.exports = Atom;
