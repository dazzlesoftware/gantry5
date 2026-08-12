import __module0 from './base.js';
import __module1 from './grid.js';
import __module2 from '../../utils/get-ajax-url.js';
import __module3 from '../../utils/get-outline.js';
import __module4 from '../../utils/translate.js';

"use strict";

let Base               = __module0,
    Grid               = __module1,
    getAjaxURL         = __module2.config,
    getOutlineNameById = __module3.getOutlineNameById,
    translate          = __module4;

let forOwn = function(object, callback) {
    Object.keys(object || {}).forEach(function(key) {
        callback(object[key], key);
    });
};

let elementFromHTML = function(html) {
    let template = document.createElement('template');
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
        let settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            inheritanceLabel = '',
            klass = '';

        if (this.hasInheritance()) {
            inheritanceLabel = this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline));
            klass = ' g-inheriting';
            if (this.inherit.include.length) {
                klass += ' g-inheriting-' + this.inherit.include.join(' g-inheriting-');
            }
        }

        return '<div class="section' + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" data-lm-blocksubtype="' + this.getSubType() + '"><div class="section-header clearfix"><h4 class="float-left" title="' + this.getTitle() + '">' + this.getTitle() + '</h4><div class="section-actions float-right"><span class="section-addrow" data-tip="' + translate('GENESIS_PLATFORM_JS_LM_ADD_ROW', 'Section') + '" data-tip-place="top-right"><i aria-label="' + translate('GENESIS_PLATFORM_JS_LM_ADD_ROW', 'Section') + '" class="fa fa-plus" aria-hidden="true"></i></span> <span class="section-settings" data-tip="' + translate('GENESIS_PLATFORM_JS_LM_SETTINGS', 'Section') + '" data-tip-place="top-right"><i aria-label="' + translate('GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Section') + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span></div></div>' + inheritanceLabel + '</div>';
    }

    adopt(child) {
        let node = child && child.nodeType ? child : child && child[0],
            grid = this.block[0].querySelector('.g-grid');
        if (node && grid) { grid.appendChild(node); }
    }

    renderInheritanceLabel(outline) {
        let content = translate('GENESIS_PLATFORM_INHERITING_FROM_X', '<strong>' + outline + '</strong>');
        if (this.block && this.getParent()) { content = ''; }
        return '<div class="g-inherit g-section-inherit"><div class="g-inherit-content" ' + this.addInheritanceTip(true) + '><i class="fa fa-lock" aria-hidden="true"></i> ' + content + '</div></div>';
    }

    enableInheritance() {
        if (!this.hasInheritance()) { return; }
        let block = this.block[0];
        block.className = this.cleanKlass(block.className);
        block.classList.add('g-inheriting');
        if (this.inherit.include.length) {
            this.inherit.include.forEach(function(name) { block.classList.add('g-inheriting-' + name); });
        }

        if (!block.querySelector(':scope > .g-inherit')) {
            let header = block.querySelector(':scope > .section-header'),
                inherit = elementFromHTML(this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline)));
            if (header && inherit) { header.after(inherit); }
        }
    }

    disableInheritance() {
        let block = this.block[0],
            inherit = block.querySelector(':scope > .g-inherit.g-section-inherit');
        if (inherit) { inherit.remove(); }
        block.className = this.cleanKlass(block.className);
        block.classList.remove('g-inheriting');
    }

    refreshInheritance() {
        let block = this.block[0];
        block.className = this.cleanKlass(block.className);
        if (!this.hasInheritance()) { return; }

        this.enableInheritance();
        let overlay = block.querySelector(':scope > .g-inherit'),
            content = elementFromHTML(this.renderInheritanceLabel(getOutlineNameById(this.inherit.outline)));
        if (overlay && content) { overlay.innerHTML = content.innerHTML; }
    }

    addInheritanceTip(html) {
        let tooltip = this.getInheritanceTip();
        if (html) {
            let tooltipHTML = '';
            forOwn(tooltip, function(value, key) { tooltipHTML += 'data-' + key + '="' + value + '" '; });
            tooltip = tooltipHTML;
        }
        return this.hasInheritance() ? tooltip : '';
    }

    getInheritanceTip() {
        let outline = this.inherit ? this.inherit.outline : null,
            name = getOutlineNameById(outline),
            include = (this.inherit.include || []).join(', ');
        return {
            tip: translate('GENESIS_PLATFORM_INHERITING_FROM_X', '<strong>' + name + '</strong>') + '<br />Outline ID: ' + outline + '<br />Replace: ' + include,
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
        let block = this.block[0],
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
        let block = this.block[0];
        if (!block.querySelector('[data-lm-id]')) {
            this.grid.insert(this.block, 'bottom');
            this.options.builder.add(this.grid);
        }

        // The ".section-addrow" plus icon (rendered in layout() above) opens
        // the row/column picker instead - wired via a single delegated click
        // handler in index.js, since building the picker's rows needs
        // access to the shared history instance that block classes don't
        // otherwise have. See NUCLEUS_BOOTSTRAP_MIGRATION.md M3.
        this.refreshInheritance();
    }

    getParent() {
        let parent = this.block[0].parentElement && this.block[0].parentElement.closest('[data-lm-id]');
        return parent ? this.options.builder.get(parent.getAttribute('data-lm-id')) : null;
    }

    getLimits(parent) {
        if (!parent) { return false; }
        let parentBlock = parent.block[0],
            sibling = parentBlock.nextElementSibling || parentBlock.previousElementSibling || false;
        if (!sibling) { return [100, 100]; }

        let siblingBlock = this.options.builder.get(sibling.getAttribute('data-lm-id'));
        if (siblingBlock.getType() !== 'block') { return false; }
        let sizes = {
            current: this.getParent().getWidthPercent(),
            sibling: siblingBlock.getWidthPercent()
        };
        return [5, (sizes.current + sizes.sibling) - 5];
    }
}

Section.prototype.options = {};

export default Section;
