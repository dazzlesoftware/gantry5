import __module0 from '../utils/dom.js';
import __module1 from '../ui/index.js';
import __module2 from '../utils/request.js';
import __module3 from '../utils/indicator.js';
import __module4 from '../utils/get-ajax-suffix.js';
import __module5 from '../utils/get-ajax-url.js';
import __module6 from '../fields/submit.js';
import __module7 from '../utils/flags-state.js';
import __module8 from '../utils/translate.js';
import __module9 from './cards.js';

"use strict";

var dom = __module0,
    modal = __module1.modal,
    toastr = __module1.toastr,
    request = __module2,
    indicator = __module3,
    getAjaxSuffix = __module4,
    parseAjaxURI = __module5.parse,
    getAjaxURL = __module5.global,
    Submit = __module6,
    flags = __module7,
    translate = __module8,
    Cards = __module9;

var trim = function(value) { return value == null ? '' : String(value).trim(); };
var asElement = function(element) { return element && element.nodeType ? element : element && element[0]; };
var elementFromHTML = function(html) {
    var template = document.createElement('template');
    template.innerHTML = String(html || '').trim();
    return template.content.firstElementChild;
};

var showError = function(error, response) {
    var result = response && response.body;
    modal.open({
        content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.'),
        afterOpen: function(container) {
            container = modal.element(container);
            if (result && !result.html && !result.message && container) { container.style.width = '90%'; }
        }
    });
};

dom.ready(function() {
    var body = document.body,
        warningURL = parseAjaxURI(getAjaxURL('confirmdeletion') + getAjaxSuffix());

    Cards.init();

    var attachEditableValidation = function(container) {
        var editable = container.querySelector('[data-title-editable]');
        if (!editable || editable.gPositionModalTitleAttached) { return; }
        editable.gPositionModalTitleAttached = true;
        editable.addEventListener('genesis:title-edit-end', function(event) {
            var title = trim(event.detail && event.detail.title);
            if (!title) {
                title = trim(event.detail && event.detail.original) || 'Title';
                editable.textContent = title;
                editable.setAttribute('data-title-editable', title);
            }
        });
    };

    var attachEditables = function(editables) {
        editables.forEach(function(editable) {
            if (editable.confWasAttached) { return; }
            editable.confWasAttached = true;
            editable.addEventListener('genesis:title-edit-start', function() { editable.style.textOverflow = 'inherit'; });
            editable.addEventListener('genesis:title-edit-end', function(event) {
                var detail = event.detail || {};
                editable.style.textOverflow = 'ellipsis';
                if (detail.canceled || detail.title === detail.original) { return; }

                var href = editable.getAttribute('data-g-config-href'),
                    type = editable.getAttribute('data-title-editable-type'),
                    method = (editable.getAttribute('data-g-config-method') || 'post').toLowerCase(),
                    parent = editable.closest('[id]'),
                    editButton = parent && parent.querySelector('[data-title-edit]'),
                    data = type === 'title' ? { title: trim(detail.title) } : { key: trim(detail.title) },
                    position = parent && parent.querySelector('[data-genesis-position]');

                if (!parent || !position) { return; }
                data.data = position.getAttribute('data-genesis-position');
                indicator.show(parent);
                if (editButton) { editButton.classList.add('disabled'); }

                request(method, parseAjaxURI(href + getAjaxSuffix()), data, function(error, response) {
                    var result = response && response.body;
                    if (!result || !result.success) {
                        showError(error, response);
                        editable.setAttribute('data-title-editable', detail.original);
                        editable.textContent = detail.original;
                    } else {
                        var replacement = elementFromHTML(result.position),
                            replacementPosition = replacement && (replacement.matches('[id]') ? replacement : replacement.querySelector('[id]'));
                        if (replacementPosition) {
                            parent.innerHTML = replacementPosition.innerHTML;
                            attachEditables(parent.querySelectorAll('[data-title-editable]'));
                        }
                    }
                    indicator.hide(parent);
                    if (editButton) { editButton.classList.remove('disabled'); }
                });
            });
        });
    };

    dom.delegate(body, 'click', '#positions [data-g-config], [data-g-create="position"]', function(event, element) {
        event.preventDefault();
        var mode = element.getAttribute('data-g-config'),
            href = element.getAttribute('data-g-config-href'),
            encoded = window.btoa(href),
            method = (element.getAttribute('data-g-config-method') || 'post').toLowerCase();

        if (mode === 'delete' && !flags.get('free:to:delete:' + encoded, false)) {
            flags.warning({
                url: warningURL,
                data: { page_type: 'POSITION' },
                callback: function(response, content) {
                    var container = asElement(content),
                        confirm = container && container.querySelector('[data-g-delete-confirm]'),
                        cancel = container && container.querySelector('[data-g-delete-cancel]');
                    if (!confirm) { return; }

                    confirm.addEventListener('click', function(confirmEvent) {
                        confirmEvent.preventDefault();
                        if (confirm.disabled) { return; }
                        flags.set('free:to:delete:' + encoded, true);
                        confirm.disabled = true;
                        if (cancel) { cancel.disabled = true; }
                        element.click();
                        modal.close();
                    });
                    if (cancel) {
                        cancel.addEventListener('click', function(cancelEvent) {
                            cancelEvent.preventDefault();
                            if (cancel.disabled) { return; }
                            confirm.disabled = true;
                            cancel.disabled = true;
                            flags.set('free:to:delete:' + encoded, false);
                            modal.close();
                        });
                    }
                }
            });
            return;
        }

        indicator.hide(element);
        indicator.show(element);
        request(method, parseAjaxURI(href + getAjaxSuffix()), {}, function(error, response) {
            var result = response && response.body;
            if (!result || !result.success) {
                showError(error, response);
            } else {
                var reload = Array.from(document.querySelectorAll('[href]')).find(function(link) {
                    return link.getAttribute('href') === getAjaxURL('positions');
                });
                if (reload) { reload.click(); }
                else { window.location.reload(); }
                toastr.success(result.html || 'Action successfully completed.', result.title || '');
                if (result.position) { body.positionDeleted = result.position; }
            }
            indicator.hide(element);
        });
    });

    dom.delegate(body, 'click', '#positions .position-add', function(event, element) {
        event.preventDefault();
        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            method: 'get',
            overlayClickToClose: false,
            remote: parseAjaxURI(element.href + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) { modal.enableCloseByOverlay(); return; }
                var container = modal.element(content.elements.content),
                    search = container.querySelector('.search input'),
                    blocks = container.querySelectorAll('[data-mm-type]'),
                    filters = container.querySelectorAll('[data-mm-filter]'),
                    urlTemplate = container.querySelector('.g-urltemplate');

                if (urlTemplate) { urlTemplate.dispatchEvent(new Event('input', { bubbles: true })); }
                attachEditableValidation(container);

                if (search && filters.length && blocks.length) {
                    search.addEventListener('input', function() {
                        var value = search.value.toLowerCase();
                        blocks.forEach(function(block) { block.classList.toggle('hidden', Boolean(value)); });
                        if (!value) { return; }
                        filters.forEach(function(filter) {
                            var text = trim(filter.getAttribute('data-mm-filter')).toLowerCase(),
                                match = text.startsWith(value) || text.includes(' ' + value),
                                block = filter.matches('[data-mm-type]') ? filter : filter.closest('[data-mm-type]');
                            if (match && block) { block.classList.remove('hidden'); }
                        });
                    });
                }
                if (search) { setTimeout(function() { search.focus(); }, 5); }
            }
        });
    });

    dom.delegate(body, 'click', '#positions .item-settings', function(event, element) {
        event.preventDefault();
        var item = element.closest('[data-pm-data]'),
            positionElement = element.closest('[data-genesis-position]');
        if (!item || !positionElement) { return; }

        var position = JSON.parse(positionElement.getAttribute('data-genesis-position'));
        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            method: 'post',
            data: { position: position.name, item: item.getAttribute('data-pm-data') },
            overlayClickToClose: false,
            remote: parseAjaxURI(getAjaxURL('positions/edit/' + item.getAttribute('data-pm-blocktype')) + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) { modal.enableCloseByOverlay(); return; }
                var container = modal.element(content.elements.content),
                    form = container.querySelector('form'),
                    submits = container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');
                attachEditableValidation(container);
                if (!form || !submits.length) { return true; }

                submits.forEach(function(target) {
                    target.addEventListener('click', function(submitEvent) {
                        submitEvent.preventDefault();
                        target.disabled = true;
                        indicator.hide(target);
                        indicator.show(target);

                        form = container.querySelector('form');
                        var post = Submit(form.elements, container);
                        if (post.invalid.length) {
                            target.disabled = false;
                            indicator.hide(target);
                            indicator.show(target, 'fa fa-fw fa-exclamation-triangle');
                            toastr.error(translate('GENESIS_PLATFORM_JS_REVIEW_FIELDS'), translate('GENESIS_PLATFORM_JS_INVALID_FIELDS'));
                            return;
                        }

                        request(form.method, parseAjaxURI(form.action + getAjaxSuffix()), post.valid.join('&'), function(error, resultResponse) {
                            var result = resultResponse && resultResponse.body;
                            if (!result || !result.success) {
                                showError(error, resultResponse);
                            } else {
                                item.setAttribute('data-pm-data', JSON.stringify(result.item));
                                var enabled = result.item.enabled || result.item.options.attributes.enabled,
                                    replacement = elementFromHTML(result.html);
                                if (replacement) { item.innerHTML = replacement.innerHTML; }
                                item.classList.toggle('g-menu-item-disabled', String(enabled) === '0');

                                if (target.hasAttribute('data-apply-and-save')) {
                                    var save = document.querySelector('.button-save');
                                    if (save) { save.click(); }
                                }
                                Cards.serialize(positionElement);
                                Cards.updatePendingChanges();
                                modal.close();
                                toastr.success(translate('GENESIS_PLATFORM_JS_POSITIONS_SETTINGS_APPLIED'), translate('GENESIS_PLATFORM_JS_SETTINGS_APPLIED'));
                            }
                            target.disabled = false;
                            indicator.hide(target);
                        });
                    });
                });
            }
        });
    });

    dom.delegate(body, 'change', '[data-genesis-positions-assignments] input[type="hidden"]', function(event, element) {
        var card = element.closest('.card'),
            wrapper = card && card.querySelector('.settings-param-wrapper');
        if (!wrapper) { return; }
        wrapper.classList.toggle('hide', element.value !== '1');
        wrapper.querySelectorAll('input[type="hidden"]').forEach(function(input) {
            input.value = '0';
            input.disabled = true;
        });
    });

    body.addEventListener('statechangeEnd', function() {
        attachEditables(document.querySelectorAll('#positions [data-title-editable]'));
    });
    attachEditables(document.querySelectorAll('#positions [data-title-editable]'));
});

export default {};
