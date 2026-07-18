"use strict";

var Base               = require('./base'),
    Grid               = require('./grid'),
    $                  = require('elements'),
    zen                = require('elements/zen'),
    getAjaxURL         = require('../../utils/get-ajax-url').config,
    getOutlineNameById = require('../../utils/get-outline').getOutlineNameById,
    translate          = require('../../utils/translate');

require('elements/insertion');

var forOwn = function(object, callback) {
    Object.keys(object || {}).forEach(function(key) {
        callback(object[key], key);
    });
};

class Section extends Base {
    constructor(options) {
        super(options);
        this.grid = new Grid();
        this.on('done', this.bound('onDone'));
        this.on('changed', this.hasChanged);
    }

    layout() {
        var settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            inheritanceLabel = '',
            klass = '';

        if (this.hasInheritance()) {
            inheritanceLabel = this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline));
            klass = ' g-inheriting';
            if (this.inherit.include.length) {
                klass += ' g-inheriting-' + this.inherit.include.join(' g-inheriting-');
            }
        }

        return '<div class="section' + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" data-lm-blocksubtype="' + this.getSubType() + '"><div class="section-header clearfix"><h4 class="float-left" title="' + this.getTitle() + '">' + this.getTitle() + '</h4><div class="section-actions float-right"><span class="section-addrow" data-tip="' + translate('GANTRY5_PLATFORM_JS_LM_ADD_ROW', 'Section') + '" data-tip-place="top-right"><i aria-label="' + translate('GANTRY5_PLATFORM_JS_LM_ADD_ROW', 'Section') + '" class="fa fa-plus" aria-hidden="true"></i></span> <span class="section-settings" data-tip="' + translate('GANTRY5_PLATFORM_JS_LM_SETTINGS', 'Section') + '" data-tip-place="top-right"><i aria-label="' + translate('GANTRY5_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Section') + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span></div></div>' + inheritanceLabel + '</div>';
    }

    adopt(child) {
        $(child).insert(this.block.find('.g-grid'));
    }

    renderInheritanceLabel(outline) {
        var content = translate('GANTRY5_PLATFORM_INHERITING_FROM_X', '<strong>' + outline + '</strong>');
        if (this.block && this.getParent()) { content = ''; }
        return '<div class="g-inherit g-section-inherit"><div class="g-inherit-content" ' + this.addInheritanceTip(true) + '><i class="fa fa-lock" aria-hidden="true"></i> ' + content + '</div></div>';
    }

    enableInheritance() {
        if (!this.hasInheritance()) { return; }
        this.block.attribute('class', this.cleanKlass(this.block.attribute('class')));
        this.block.addClass('g-inheriting');
        if (this.inherit.include.length) {
            this.block.addClass('g-inheriting-' + this.inherit.include.join(' g-inheriting-'));
        }

        if (!this.block.find('> .g-inherit')) {
            var inherit = zen('div'),
                html = this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline));
            inherit.html(html).children().after(this.block.find('> .section-header'));
        }
    }

    disableInheritance() {
        var inherit = this.block.find('> .g-inherit.g-section-inherit');
        if (inherit) { inherit.remove(); }
        this.block.attribute('class', this.cleanKlass(this.block.attribute('class')));
        this.block.removeClass('g-inheriting');
    }

    refreshInheritance() {
        this.block.attribute('class', this.cleanKlass(this.block.attribute('class')));
        if (!this.hasInheritance()) { return; }

        this.enableInheritance();
        var overlay = this.block.find('> .g-inherit'),
            content = zen('div').html(this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline)));
        if (overlay && content) { overlay.html(content.children().html()); }
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
        var outline = this.inherit ? this.inherit.outline : null,
            name = getOutlineNameById(outline),
            include = (this.inherit.include || []).join(', ');
        return {
            tip: translate('GANTRY5_PLATFORM_INHERITING_FROM_X', '<strong>' + name + '</strong>') + '<br />Outline ID: ' + outline + '<br />Replace: ' + include,
            'tip-offset': -2,
            'tip-place': 'top-right'
        };
    }

    cleanKlass(klass) {
        return (klass || '').split(' ').filter(function(item) {
            return !item.match(/^g-inheriting-/);
        }).join(' ');
    }

    hasChanged(state, child) {
        var icon = this.block.find('h4 > i:first-child');
        if (icon && child && !child.changeState) { return; }
        this.block[state ? 'addClass' : 'removeClass']('block-has-changes');
        if (!state && icon) { icon.remove(); }
        if (state && !icon) { zen('i.far.fa-circle.changes-indicator').top(this.block.find('h4')); }
    }

    onDone() {
        if (!this.block.search('[data-lm-id]')) {
            this.grid.insert(this.block, 'bottom');
            this.options.builder.add(this.grid);
        }

        var plus = this.block.find('.fa-plus');
        if (plus) {
            plus.on('click', function(event) {
                if (event) { event.preventDefault(); }
                if (this.block.find('.g-grid:last-child:empty')) { return false; }

                this.grid = new Grid();
                var container = this.block.find('[data-lm-blocktype="container"]');
                this.grid.insert(container || this.block, 'bottom');
                this.options.builder.add(this.grid);
            }.bind(this));
        }
        this.refreshInheritance();
    }

    getParent() {
        var parent = this.block.parent('[data-lm-id]');
        return parent ? this.options.builder.get(parent.data('lm-id')) : null;
    }

    getLimits(parent) {
        if (!parent) { return false; }
        var sibling = parent.block.nextSibling() || parent.block.previousSibling() || false;
        if (!sibling) { return [100, 100]; }

        var siblingBlock = this.options.builder.get(sibling.data('lm-id'));
        if (siblingBlock.getType() !== 'block') { return false; }
        var sizes = {
            current: this.getParent().getSize(),
            sibling: siblingBlock.getSize()
        };
        return [5, (sizes.current + sizes.sibling) - 5];
    }
}

Section.prototype.options = {};

module.exports = Section;
