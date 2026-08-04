"use strict";

var Atom               = require('./atom'),
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
            klass = this.getCategoryClass();

        if (this.hasInheritance()) {
            klass = ' g-inheriting';
            if (this.inherit.include.length) {
                klass += ' g-inheriting-' + this.inherit.include.join(' g-inheriting-');
            }
        }

        return '<div class="' + this.getType() + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" ' + subtype + '><span><span class="icon" ' + this.addInheritanceTip(true) + '><i class="fa ' + this.getIcon() + '" aria-hidden="true"></i></span><span class="title">' + this.getTitle() + '</span><span class="font-small">' + (this.getKey() || this.getSubType() || this.getType()) + '</span></span><div class="float-right"><span class="particle-size"></span> <i aria-label="' + translate('GANTRY5_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Particle') + '" class="fa fa-cog" aria-hidden="true" data-lm-nodrag data-lm-settings="' + settingsUri + '"></i></div></div>';
    }

    enableInheritance() {
        var block = this.block[0];
        block.className = this.cleanKlass(block.className);
        if (!this.hasInheritance()) { return; }

        var icon = block.querySelector('.icon');
        block.classList.add('g-inheriting');
        if (this.inherit.include.length) {
            this.inherit.include.forEach(function(name) { block.classList.add('g-inheriting-' + name); });
        }
        var iconGlyph = block.querySelector('.icon .fa');
        if (iconGlyph) { iconGlyph.className = 'fa ' + this.getIcon(); }
        forOwn(this.getInheritanceTip(), function(value, key) { icon.setAttribute('data-' + key, value); });
        global.Genesis.tips.reload();
    }

    disableInheritance() {
        var block = this.block[0],
            icon = block.querySelector('.icon'),
            iconGlyph = block.querySelector('.icon .fa');
        block.className = this.cleanKlass(block.className);
        block.classList.remove('g-inheriting');
        if (iconGlyph) { iconGlyph.className = 'fa ' + this.getIcon(); }
        forOwn(this.getInheritanceTip(), function(value, key) { icon.removeAttribute('data-' + key); });
        global.Genesis.tips.reload();
    }

    refreshInheritance() {
        var block = this.block[0];
        block.classList.toggle('g-inheritance', !this.hasInheritance());
        if (this.hasInheritance()) {
            block.className = this.cleanKlass(block.className);
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
        var label = this.block[0].querySelector('.particle-size');
        if (!label) { return false; }
        label.textContent = precision(size, 1) + '%';
    }

    onRendered(element, parent) {
        var size = parent.getSize() || 100,
            globallyDisabled = document.querySelector('[data-lm-disabled][data-lm-subtype="' + CSS.escape(this.getSubType() || '') + '"]');

        if (globallyDisabled || this.getAttribute('enabled') === 0) { this.disable(); }
        this.setLabelSize(size);
        parent.on('resized', this.bound('onParentResize'));
    }

    getParent() {
        var parent = this.block[0].parentElement && this.block[0].parentElement.closest('[data-lm-id]');
        return parent ? this.options.builder.get(parent.getAttribute('data-lm-id')) : null;
    }

    onParentResize(resize) {
        this.setLabelSize(resize);
    }

    getIcon() {
        if (this.hasInheritance()) { return 'fa-lock'; }

        var type = this.getType(),
            subtype = this.getSubType(),
            template = document.querySelector('.particles-container [data-lm-blocktype="' + CSS.escape(type) + '"][data-lm-subtype="' + CSS.escape(subtype || '') + '"]');

        return template ? template.getAttribute('data-lm-icon') : 'fa-cube';
    }

    getCategoryClass() {
        var type = this.getType(),
            subtype = this.getSubType(),
            template = document.querySelector('.particles-container [data-lm-blocktype="' + CSS.escape(type) + '"][data-lm-subtype="' + CSS.escape(subtype || '') + '"]');

        return template ? ' particle-category-' + (template.getAttribute('data-lm-category') || 'general') : '';
    }

    getLimits(parent) {
        if (!parent) { return false; }
        var parentBlock = parent.block[0],
            sibling = parentBlock.nextElementSibling || parentBlock.previousElementSibling || false;
        if (!sibling) { return [100, 100]; }

        var siblingBlock = this.options.builder.get(sibling.getAttribute('data-lm-id')),
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
