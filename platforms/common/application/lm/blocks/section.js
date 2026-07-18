"use strict";

var Base               = require('./base'),
    Grid               = require('./grid'),
    getAjaxURL         = require('../../utils/get-ajax-url').config,
    getOutlineNameById = require('../../utils/get-outline').getOutlineNameById,
    translate          = require('../../utils/translate');

var forOwn = function(object, callback) {
    Object.keys(object || {}).forEach(function(key) {
        callback(object[key], key);
    });
};

var elementFromHTML = function(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
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
        var node = child && child.nodeType ? child : child && child[0],
            grid = this.block[0].querySelector('.g-grid');
        if (node && grid) { grid.appendChild(node); }
    }

    renderInheritanceLabel(outline) {
        var content = translate('GANTRY5_PLATFORM_INHERITING_FROM_X', '<strong>' + outline + '</strong>');
        if (this.block && this.getParent()) { content = ''; }
        return '<div class="g-inherit g-section-inherit"><div class="g-inherit-content" ' + this.addInheritanceTip(true) + '><i class="fa fa-lock" aria-hidden="true"></i> ' + content + '</div></div>';
    }

    enableInheritance() {
        if (!this.hasInheritance()) { return; }
        var block = this.block[0];
        block.className = this.cleanKlass(block.className);
        block.classList.add('g-inheriting');
        if (this.inherit.include.length) {
            this.inherit.include.forEach(function(name) { block.classList.add('g-inheriting-' + name); });
        }

        if (!block.querySelector(':scope > .g-inherit')) {
            var header = block.querySelector(':scope > .section-header'),
                inherit = elementFromHTML(this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline)));
            if (header && inherit) { header.after(inherit); }
        }
    }

    disableInheritance() {
        var block = this.block[0],
            inherit = block.querySelector(':scope > .g-inherit.g-section-inherit');
        if (inherit) { inherit.remove(); }
        block.className = this.cleanKlass(block.className);
        block.classList.remove('g-inheriting');
    }

    refreshInheritance() {
        var block = this.block[0];
        block.className = this.cleanKlass(block.className);
        if (!this.hasInheritance()) { return; }

        this.enableInheritance();
        var overlay = block.querySelector(':scope > .g-inherit'),
            content = elementFromHTML(this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline)));
        if (overlay && content) { overlay.innerHTML = content.innerHTML; }
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
        var block = this.block[0],
            heading = block.querySelector('h4'),
            icon = heading && heading.querySelector(':scope > i:first-child');
        if (icon && child && !child.changeState) { return; }
        block.classList.toggle('block-has-changes', Boolean(state));
        if (!state && icon) { icon.remove(); }
        if (state && !icon && heading) {
            icon = document.createElement('i');
            icon.className = 'far fa-circle changes-indicator';
            heading.insertBefore(icon, heading.firstChild);
        }
    }

    onDone() {
        var block = this.block[0];
        if (!block.querySelector('[data-lm-id]')) {
            this.grid.insert(this.block, 'bottom');
            this.options.builder.add(this.grid);
        }

        var plus = block.querySelector('.fa-plus');
        if (plus && !plus.gSectionAddAttached) {
            plus.gSectionAddAttached = true;
            plus.addEventListener('click', function(event) {
                if (event) { event.preventDefault(); }
                if (block.querySelector('.g-grid:last-child:empty')) { return false; }

                this.grid = new Grid();
                var container = block.querySelector('[data-lm-blocktype="container"]');
                this.grid.insert(container || this.block, 'bottom');
                this.options.builder.add(this.grid);
            }.bind(this));
        }
        this.refreshInheritance();
    }

    getParent() {
        var parent = this.block[0].parentElement && this.block[0].parentElement.closest('[data-lm-id]');
        return parent ? this.options.builder.get(parent.getAttribute('data-lm-id')) : null;
    }

    getLimits(parent) {
        if (!parent) { return false; }
        var parentBlock = parent.block[0],
            sibling = parentBlock.nextElementSibling || parentBlock.previousElementSibling || false;
        if (!sibling) { return [100, 100]; }

        var siblingBlock = this.options.builder.get(sibling.getAttribute('data-lm-id'));
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
