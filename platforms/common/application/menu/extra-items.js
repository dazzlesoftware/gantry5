import __module0 from '../utils/dom.js';
import __module1 from '../fields/submit.js';
import __module2 from '../ui/index.js';
import __module3 from '../ui/selectize.js';
import __module4 from '../utils/request.js';
import __module5 from '../utils/indicator.js';
import __module6 from '../utils/get-ajax-url.js';
import __module7 from '../utils/get-ajax-suffix.js';
import __module8 from '../utils/flags-state.js';
import __module9 from '../utils/deep-equals.js';
import __module10 from '../utils/translate.js';
import __module11 from '../positions/cards.js';
import __module12 from '../utils/wp-widgets-customizer.js';

"use strict";

let dom           = __module0,
    Submit        = __module1,
    modal         = __module2.modal,
    toastr        = __module2.toastr,
    Selectize     = __module3,
    request       = __module4,
    indicator     = __module5,
    parseAjaxURI  = __module6.parse,
    getAjaxURL    = __module6.global,
    getAjaxSuffix = __module7,
    flags         = __module8,
    deepEquals    = __module9,
    translate     = __module10,
    Cards         = __module11;

let WordpressWidgetsCustomizer = __module12;
let menumanager = null;

let asElement = function(element) {
    return element && element.nodeType ? element : element && element[0];
};

let fragmentFromHTML = function(html) {
    let template = document.createElement('template');
    template.innerHTML = String(html || '').trim();
    return template.content;
};

let fieldByName = function(name) {
    return Array.from(document.querySelectorAll('[name]')).find(function(field) {
        return field.name === name;
    }) || null;
};

let directChildren = function(parent, selector) {
    return Array.from(parent ? parent.children : []).filter(function(child) {
        return child.matches(selector);
    });
};

let randomID = function randomString(len, an) {
    an = an && an.toLowerCase();
    let str = '', i = 0, min = an === 'a' ? 10 : 0, max = an === 'n' ? 10 : 62;
    for (; i++ < len;) {
        let r = Math.random() * (max - min) + min << 0;
        str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
    }
    return str;
};

let StepOne = function(map, mode) {
    if (this.isNewParticle && mode !== 'reorder') { return; }
    this.resizer.updateItemSizes();
    menumanager = this;

    let save = document.querySelector('[data-save]'),
        current = {
            settings: this.settings,
            ordering: this.ordering,
            items: this.items
        };

    if (!this.isNewParticle && save) {
        if (!deepEquals(map, current)) {
            indicator.show(save, 'far fa-fw changes-indicator fa-circle');
            flags.set('pending', true);
        } else {
            indicator.hide(save);
            flags.set('pending', false);
        }
    }

    if (this.isParticle && this.isNewParticle) {
        let block = asElement(this.block),
            blocktype = block && block.getAttribute('data-mm-blocktype'),
            title = block && block.querySelector('.menu-item .title');
        if (!block) { return; }

        block.removeAttribute('data-mm-blocktype');
        block.classList.add('g-menu-item-' + blocktype);
        block.setAttribute('data-mm-original-type', blocktype);

        let badge = document.createElement('span');
        badge.className = 'menu-item-type badge';
        badge.textContent = blocktype;
        if (title) { title.after(badge); }

        let config = block.querySelector('.config-cog');
        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            method: 'post',
            remote: parseAjaxURI((config ? config.getAttribute('href') : '') + getAjaxSuffix()),
            remoteLoaded: function(response, modalInstance) {
                let content = modal.element(modalInstance.elements.content),
                    search = content && content.querySelector('.search input'),
                    blocks = content ? content.querySelectorAll('[data-mm-type]') : [],
                    filters = content ? content.querySelectorAll('[data-mm-filter]') : [];

                if (!search || !filters.length || !blocks.length) { return; }
                search.addEventListener('input', function() {
                    let value = search.value.toLowerCase();
                    blocks.forEach(function(item) { item.classList.toggle('hidden', Boolean(value)); });
                    if (!value) { return; }

                    filters.forEach(function(filter) {
                        let text = String(filter.getAttribute('data-mm-filter') || '').trim().toLowerCase(),
                            match = text.startsWith(value) || text.includes(' ' + value),
                            item = filter.matches('[data-mm-type]') ? filter : filter.closest('[data-mm-type]');
                        if (match && item) { item.classList.remove('hidden'); }
                    });
                });
                setTimeout(function() { search.focus(); }, 5);
            }
        });
    }

    this.type = undefined;
};

let StepTwo = function(data, content, button) {
    content = asElement(content);
    button = asElement(button);
    if (!content || !button) { return; }

    let route = content.querySelector('[data-mm-particle-stepone]'),
        uri = route && route.getAttribute('data-mm-particle-stepone'),
        picker = data.instancepicker,
        item;

    if (picker) {
        item = JSON.parse(data.item);
        picker = JSON.parse(picker);
        delete data.instancepicker;
        uri = getAjaxURL(item.type + '/' + item[item.type]);
    }

    request('post', parseAjaxURI(uri + getAjaxSuffix()), data, function(error, stepResponse) {
        let result = stepResponse && stepResponse.body;
        if (!result || !result.success) {
            modal.open({ content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.') });
            indicator.hide(button);
            return;
        }

        content.innerHTML = result.html;
        Selectize.initialize(content.querySelectorAll('[data-selectize]'));

        let urlTemplate = content.querySelector('.g-urltemplate');
        if (urlTemplate) { urlTemplate.dispatchEvent(new Event('input', { bubbles: true })); }

        let form = content.querySelector('form'),
            submits = content.querySelectorAll('input[type="submit"], button[type="submit"]');
        if (!form || !submits.length) { return true; }

        content.querySelectorAll('[data-apply-and-save]').forEach(function(applyAndSave) { applyAndSave.remove(); });
        submits = content.querySelectorAll('input[type="submit"], button[type="submit"]');

        submits.forEach(function(submit) {
            submit.addEventListener('click', function(event) {
                event.preventDefault();
                indicator.show(submit);

                let post = Submit(form.elements, content, { submitUnchecked: true }),
                    method = form.getAttribute('method') || 'post',
                    action = form.getAttribute('action') || '';

                request(method, parseAjaxURI(action + getAjaxSuffix()), post.valid.join('&') || {}, function(submitError, submitResponse) {
                    let submitResult = submitResponse && submitResponse.body,
                        field = null;

                    if (!submitResult || !submitResult.success) {
                        modal.open({
                            content: submitResult ? (submitResult.html || submitResult.message || submitResult) : (submitError ? submitError.message : 'Request failed.')
                        });
                    } else if (!picker) {
                        if (menumanager) {
                            let element = asElement(menumanager.element),
                                path = element.getAttribute('data-mm-id') + '-',
                                id = randomID(5),
                                baseParent = element.closest('[data-mm-base]'),
                                columnParent = element.closest('[data-mm-id]'),
                                base = baseParent && baseParent.getAttribute('data-mm-base'),
                                col = ((columnParent && columnParent.getAttribute('data-mm-id') || '').match(/\d+$/) || [0])[0],
                                index = directChildren(element.parentElement, '[data-mm-id]').indexOf(element);

                            while (menumanager.items[path + id]) { id = randomID(5); }
                            menumanager.items[path + id] = submitResult.item;
                            if (!menumanager.ordering[base]) { menumanager.ordering[base] = []; }
                            if (!menumanager.ordering[base][col]) { menumanager.ordering[base][col] = []; }
                            menumanager.ordering[base][col].splice(index, 1, path + id);
                            element.setAttribute('data-mm-id', path + id);
                            if (submitResult.html) { element.innerHTML = submitResult.html; }

                            menumanager.isNewParticle = false;
                            menumanager.emit('dragEnd', menumanager.map);
                            toastr.success(translate('GENESIS_PLATFORM_JS_MENU_SETTINGS_APPLIED'), translate('GENESIS_PLATFORM_JS_SETTINGS_APPLIED'));
                        } else {
                            let position = document.querySelector('[data-genesis-position-name="' + CSS.escape(submitResult.position) + '"]'),
                                list = position && position.querySelector(':scope > ul');
                            if (list) { list.appendChild(fragmentFromHTML(submitResult.html)); }
                            Cards.serialize(position);
                            Cards.updatePendingChanges();
                            toastr.success(translate('GENESIS_PLATFORM_JS_POSITIONS_SETTINGS_APPLIED'), translate('GENESIS_PLATFORM_JS_SETTINGS_APPLIED'));
                        }
                    } else {
                        field = fieldByName(picker.field);
                        let parent = field && field.parentElement,
                            btnPicker = parent && parent.querySelector('[data-g-instancepicker]'),
                            label = parent && parent.querySelector('.g-instancepicker-title');

                        if (field) {
                            field.value = JSON.stringify(submitResult.item);
                            field.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        if (label) { label.textContent = submitResult.item.title; }
                        if (item.type === 'particle' && btnPicker) {
                            btnPicker.textContent = btnPicker.getAttribute('data-g-instancepicker-alttext') || '';
                        }
                    }

                    modal.close();
                    indicator.hide(submit);
                    WordpressWidgetsCustomizer(field);
                });
            });
        });
    });
};

dom.ready(function() {
    let body = document.body;

    dom.delegate(body, 'click', '.menu-editor-extras [data-lm-blocktype], .menu-editor-extras [data-mm-module]', function(event, element) {
        let container = element.closest('.menu-editor-extras'),
            selectButton = container && container.querySelector('[data-mm-select]');
        if (!container || !selectButton) { return; }

        container.querySelectorAll('[data-lm-blocktype], [data-mm-module]').forEach(function(item) {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        selectButton.disabled = false;
        selectButton.classList.remove('disabled');
    });

    dom.delegate(body, 'click', '.menu-editor-extras [data-mm-select]', function(event, element) {
        event.preventDefault();
        if (element.classList.contains('disabled') || element.disabled) { return; }

        let container = element.closest('.menu-editor-extras'),
            selected = container && container.querySelector('[data-lm-blocktype].selected, [data-mm-module].selected');
        if (!container || !selected) { return; }

        let type = selected.getAttribute('data-mm-type'),
            data = { type: type },
            instancepicker = element.getAttribute('data-g-instancepicker');

        switch (type) {
            case 'particle':
                data.particle = selected.getAttribute('data-lm-subtype');
                break;
            case 'widget':
                data.widget = selected.getAttribute('data-lm-subtype');
                break;
            case 'module':
                data.particle = type;
                let moduleTitle = selected.querySelector('[data-mm-title]');
                data.title = moduleTitle && moduleTitle.getAttribute('data-mm-title');
                data.options = { particle: { module_id: selected.getAttribute('data-mm-module') } };
                break;
        }

        indicator.show(element);
        if (instancepicker && type === 'module') {
            let pickerData = JSON.parse(instancepicker),
                field = fieldByName(pickerData.field);
            if (field) {
                field.value = selected.getAttribute('data-mm-module');
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
            indicator.hide(element);
            modal.close();
            return;
        }

        element.removeAttribute('data-g-instancepicker');
        StepTwo({
            item: JSON.stringify(data),
            instancepicker: instancepicker || null
        }, element.closest('.genesis-content'), element);
    });
});

export default StepOne;
