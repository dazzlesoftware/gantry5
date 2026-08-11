import __module0 from './section.js';
import __module1 from '../../utils/get-ajax-url.js';
import __module2 from '../../utils/get-outline.js';
import __module3 from '../../utils/translate.js';

"use strict";

let Section            = __module0,
    getAjaxURL         = __module1.config,
    getOutlineNameById = __module2.getOutlineNameById,
    translate          = __module3;

class Offcanvas extends Section {
    layout() {
        let settingsUri = getAjaxURL(this.getPageId() + '/layout/' + this.getType() + '/' + this.getId()),
            inheritance = '',
            klass = '';

        if (this.hasInheritance()) {
            let outline = getOutlineNameById(this.inherit.outline);
            inheritance = '<div class="g-inherit g-section-inherit"><div class="g-inherit-content">' + translate('GENESIS_PLATFORM_INHERITING_FROM_X', '<strong>' + outline + '</strong>') + '</div></div>';
            klass = ' g-inheriting g-inheriting-' + this.inherit.include.join(' g-inheriting-');
        }

        return '<div class="offcanvas-section' + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '"><div class="section-header clearfix"><h4 class="float-left" title="' + this.getAttribute('name') + '">' + this.getAttribute('name') + '</h4><div class="section-actions float-right"><span class="section-addrow" data-tip="' + translate('GENESIS_PLATFORM_JS_LM_ADD_ROW', 'Offcanvas') + '" data-tip-place="top-right"><i aria-label="' + translate('GENESIS_PLATFORM_JS_LM_ADD_ROW', 'Offcanvas') + '" class="fa fa-plus" aria-hidden="true"></i></span> <span class="section-settings" data-tip="' + translate('GENESIS_PLATFORM_JS_LM_SETTINGS', 'Offcanvas') + '" data-tip-place="top-right"><i aria-label="' + translate('GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Offcanvas') + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span></div></div>' + inheritance + '</div>';
    }

    getId() {
        return this.id || (this.id = this.options.type);
    }
}

Offcanvas.prototype.options = {
    type: 'offcanvas',
    attributes: {name: 'Offcanvas Section'}
};

export default Offcanvas;
