import __module0 from './base.js';
import __module1 from '../../utils/get-ajax-url.js';
import __module2 from '../../utils/translate.js';

"use strict";

let Base       = __module0,
    getAjaxURL = __module1.config,
    translate  = __module2;

class Div extends Base {
    layout() {
        let settingsUri = getAjaxURL(this.getPageId() + '/layout/div/' + this.getId());
        return '<div class="g-lm-div" data-lm-id="' + this.getId() + '" data-lm-blocktype="div">' +
            '<div class="g-lm-div-header">' +
                '<span class="g-lm-div-title" data-lm-div-drag><i class="fa fa-grip-vertical" aria-hidden="true"></i><i class="fa fa-vector-square" aria-hidden="true"></i> ' +
                    translate('GENESIS_PLATFORM_JS_LM_DIV') + '</span>' +
                '<span class="g-lm-div-actions">' +
                    '<button type="button" data-lm-nodrag data-lm-div-addrow aria-label="' +
                        translate('GENESIS_PLATFORM_JS_LM_ADD_NESTED_ROW') + '"><i class="fa fa-plus" aria-hidden="true"></i></button>' +
                    '<i class="fa fa-cog" data-lm-nodrag data-lm-settings="' + settingsUri + '" aria-label="' +
                        translate('GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS', 'Div') + '"></i>' +
                    '<button type="button" data-lm-nodrag data-lm-structure-menu aria-label="' +
                        translate('GENESIS_PLATFORM_JS_LM_MORE_ACTIONS') + '"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></button>' +
                '</span>' +
            '</div>' +
        '</div>';
    }
}

Div.prototype.options = {
    type: 'div',
    subtype: 'div',
    attributes: { tag: 'div' }
};

export default Div;
