"use strict";

var $                  = require('elements'),
    Atom               = require('./atom'),
    getAjaxURL         = require('../../utils/get-ajax-url').config,
    getOutlineNameById = require('../../utils/get-outline').getOutlineNameById,
    translate          = require('../../utils/translate');

var precision = function(value, decimals) {
        var multiplier = Math.pow(10, decimals);
        return Math.round(Number(value) * multiplier) / multiplier;
    },
    forOwn = function(object, callback) {
        Object.keys(object || {}).forEach(function(key) {
            callback(object[key], key);
        });
    };

class Particle extends Atom {
    layout() {
        var settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            subtype = this.getSubType() ? 'data-lm-blocksubtype="' + this.getSubType() + '"' : '',
            klass = '';

        if (this.hasInheritance()) {
            klass = ' g-inheriting';
            if (this.inherit.include.length) {
                klass += ' g-inheriting-' + this.inherit.include.join(' g-inheriting-');
            }
        }

        return '<div class="' + this.getType() + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" ' + subtype + '><span><span class="icon" ' + this.addInheritanceTip(true) + '><i class="fa ' + this.getIcon() + '" aria-hidden="true"></i></span><span class="title">' + this.getTitle() + '</span><span class="font-small">' + (this.getKey() || this.getSubType() || this.getType()) + '</span></span><div class="float-right"><span class="particle-size"></span> <i aria-label="' + translate('GANTRY5_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Particle') + '" class="fa fa-cog" aria-hidden="true" data-lm-nodrag data-lm-settings="' + settingsUri + '"></i></div></div>';
    }

    enableInheritance() {
        this.block.attribute('class', this.cleanKlass(this.block.attribute('class')));
        if (!this.hasInheritance()) { return; }

        var icon = this.block.find('.icon');
        this.block.addClass('g-inheriting');
        if (this.inherit.include.length) {
            this.block.addClass('g-inheriting-' + this.inherit.include.join(' g-inheriting-'));
        }
        this.block.find('.icon .fa').attribute('class', 'fa ' + this.getIcon());
        forOwn(this.getInheritanceTip(), function(value, key) { icon.data(key, value); });
        global.G5.tips.reload();
    }

    disableInheritance() {
        var icon = this.block.find('.icon');
        this.block.attribute('class', this.cleanKlass(this.block.attribute('class')));
        this.block.removeClass('g-inheriting');
        this.block.find('.icon .fa').attribute('class', 'fa ' + this.getIcon());
        forOwn(this.getInheritanceTip(), function(value, key) { icon.data(key, null); });
        global.G5.tips.reload();
    }

    refreshInheritance() {
        this.block[this.hasInheritance() ? 'removeClass' : 'addClass']('g-inheritance');
        if (this.hasInheritance()) {
            this.block.attribute('class', this.cleanKlass(this.block.attribute('class')));
        }
    }

    addInheritanceTip(html) {
        var tooltip = this.getInheritanceTip();
        if (html) {
            var tooltipHTML = '';
            forOwn(tooltip, function(value, key) { tooltipHTML += 'data-' + key + '="' + value + '" '; });
            tooltip = tooltipHTML;
        }
        return this.hasInheritance() ? tooltip : '';
    }

    getInheritanceTip() {
        var outline = getOutlineNameById(this.inherit ? this.inherit.outline : null),
            particle = this.inherit.particle || '',
            include = (this.inherit.include || []).join(', ');

        return {
            tip: translate('GANTRY5_PLATFORM_INHERITING_FROM_X', '<strong>' + outline + '</strong>') + '<br />ID: ' + particle + '<br />Replace: ' + include,
            'tip-offset': -10,
            'tip-place': 'top-right'
        };
    }

    cleanKlass(klass) {
        return (klass || '').split(' ').filter(function(item) {
            return !item.match(/^g-inheriting-/);
        }).join(' ');
    }

    setLabelSize(size) {
        var label = this.block.find('.particle-size');
        if (!label) { return false; }
        label.text(precision(size, 1) + '%');
    }

    onRendered(element, parent) {
        var size = parent.getSize() || 100,
            globallyDisabled = $('[data-lm-disabled][data-lm-subtype="' + this.getSubType() + '"]');

        if (globallyDisabled || this.getAttribute('enabled') === 0) { this.disable(); }
        this.setLabelSize(size);
        parent.on('resized', this.bound('onParentResize'));
    }

    getParent() {
        var parent = this.block.parent('[data-lm-id]');
        return this.options.builder.get(parent.data('lm-id'));
    }

    onParentResize(resize) {
        this.setLabelSize(resize);
    }

    getIcon() {
        if (this.hasInheritance()) { return 'fa-lock'; }

        var type = this.getType(),
            subtype = this.getSubType(),
            template = $('.particles-container [data-lm-blocktype="' + type + '"][data-lm-subtype="' + subtype + '"]');

        return template ? template.data('lm-icon') : 'fa-cube';
    }

    getLimits(parent) {
        if (!parent) { return false; }
        var sibling = parent.block.nextSibling() || parent.block.previousSibling() || false;
        if (!sibling) { return [100, 100]; }

        var siblingBlock = this.options.builder.get(sibling.data('lm-id')),
            sizes = {
                current: this.getParent().getSize(),
                sibling: siblingBlock.getSize()
            };
        return [5, (sizes.current + sizes.sibling) - 5];
    }
}

Particle.prototype.options = {
    type: 'particle'
};

module.exports = Particle;
