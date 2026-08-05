import __module0 from '../utils/dom.js';
import __module1 from '../ui/index.js';
import __module2 from '../utils/request.js';
import __module3 from '../utils/indicator.js';
import __module4 from '../utils/get-ajax-suffix.js';
import __module5 from '../utils/get-ajax-url.js';
import __module6 from '../utils/flags-state.js';
import './dropdown-edit.js';

"use strict";

let dom = __module0,
    modal = __module1.modal,
    toastr = __module1.toastr,
    request = __module2,
    indicator = __module3,
    getAjaxSuffix = __module4,
    parseAjaxURI = __module5.parse,
    getAjaxURL = __module5.global,
    flags = __module6;


let asElement = function(element) {
    return element && element.nodeType ? element : element && element[0];
};

let elementFromHTML = function(html) {
    let template = document.createElement('template');
    template.innerHTML = String(html || '').trim();
    return template.content.firstElementChild;
};

dom.ready(function() {
    let body = document.body;

    let attachEditables = function(editables) {
        editables.forEach(function(editable) {
            if (editable.confWasAttached) { return; }
            editable.confWasAttached = true;
            editable.addEventListener('genesis:title-edit-start', function() {
                editable.style.textOverflow = 'inherit';
            });
            editable.addEventListener('genesis:title-edit-end', function(event) {
                let detail = event.detail || {},
                    title = detail.title,
                    original = detail.original;

                editable.style.textOverflow = 'ellipsis';
                if (detail.canceled || title === original) { return; }

                let href = editable.getAttribute('data-g-config-href'),
                    method = (editable.getAttribute('data-g-config-method') || 'post').toLowerCase(),
                    parent = editable.parentElement,
                    editButton = parent && parent.querySelector('[data-title-edit]');

                indicator.show(parent);
                if (editButton) { editButton.classList.add('disabled'); }

                request(method, parseAjaxURI(href + getAjaxSuffix()), { title: String(title).trim() }, function(error, response) {
                    let result = response && response.body;
                    if (!result || !result.success) {
                        modal.open({
                            content: result ? (result.html || result.message || result) : (error ? error.message : 'Unable to rename outline.'),
                            afterOpen: function(container) {
                                container = modal.element(container);
                                if (result && !result.html && !result.message && container) { container.style.width = '90%'; }
                            }
                        });
                        editable.setAttribute('data-title-editable', original);
                        editable.textContent = original;
                    } else {
                        editable.setAttribute('data-title', title);
                        editable.setAttribute('data-tip', title);

                        let dummy = elementFromHTML(result.outline),
                            card = editable.closest('.card'),
                            id = dummy && dummy.querySelector('h4 span:last-child'),
                            actions = dummy && dummy.querySelector('.outline-actions'),
                            cardId = card && card.querySelector('h4 span:last-child'),
                            cardActions = card && card.querySelector('.outline-actions');
                        if (id && cardId) { cardId.innerHTML = id.innerHTML; }
                        if (actions && cardActions) { cardActions.innerHTML = actions.innerHTML; }
                    }

                    indicator.hide(parent);
                    if (editButton) { editButton.classList.remove('disabled'); }
                });
            });
        });
    };

    dom.delegate(body, 'click', '[data-genesis-outline-create], [data-genesis-outline-duplicate]', function(event, trigger) {
        event.preventDefault();
        modal.open({
            content: 'Loading',
            method: 'post',
            overlayClickToClose: false,
            remote: parseAjaxURI(trigger.href + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) { modal.enableCloseByOverlay(); return; }

                let container = modal.element(content.elements.content),
                    title = container.querySelector('[name="title"]'),
                    confirm = container.querySelector('[data-g-outline-create-confirm]');
                if (!title || !confirm) { return; }

                title.addEventListener('keyup', function(keyEvent) {
                    if (keyEvent.key === 'Enter') { confirm.click(); }
                });

                confirm.addEventListener('click', function(confirmEvent) {
                    confirmEvent.preventDefault();
                    indicator.hide(confirm);
                    indicator.show(confirm);

                    let checkedFrom = container.querySelector('[name="from"]:checked'),
                        preset = container.querySelector('[name="preset"]'),
                        outline = container.querySelector('[name="outline"]'),
                        inherit = container.querySelector('[name="inherit"]'),
                        data = {
                            title: title.value,
                            from: checkedFrom ? checkedFrom.value : null,
                            preset: preset ? preset.value : null,
                            outline: outline ? outline.value : null,
                            inherit: inherit && inherit.checked ? 1 : 0
                        };

                    Object.keys(data).forEach(function(key) { if (!data[key]) { delete data[key]; } });
                    let uri = parseAjaxURI(confirm.getAttribute('data-g-outline-create-confirm') + getAjaxSuffix());

                    request('post', uri, data, function(error, resultResponse) {
                        indicator.hide(confirm);
                        let result = resultResponse && resultResponse.body;
                        if (!result || !result.success) {
                            modal.open({ content: result ? (result.html || result.message || result) : error.message });
                            return;
                        }

                        let base = document.querySelector('#configurations ul li'),
                            created = document.createElement('li');
                        if (base) {
                            created.className = base.className;
                            created.innerHTML = result.outline;
                            base.after(created);
                            attachEditables(created.querySelectorAll('[data-title-editable]'));
                        }
                        toastr.success(result.html || 'Action successfully completed.', result.title || '');
                        modal.close();
                    });
                });
                setTimeout(function() { title.focus(); }, 5);
            }
        });
    });

    dom.delegate(body, 'change', 'input[type="radio"]#from-preset, input[type="radio"]#from-outline', function(event, element) {
        let card = element.closest('.card');
        if (!card) { return; }
        card.querySelectorAll('.g-create-from').forEach(function(block) {
            block.style.display = block.classList.contains('g-create-from-' + element.value) ? 'block' : 'none';
        });
    });

    dom.delegate(body, 'click', '#configurations [data-g-config]', function(event, element) {
        event.preventDefault();
        let mode = element.getAttribute('data-g-config'),
            href = element.getAttribute('data-g-config-href'),
            hrefConfirm = element.getAttribute('data-g-config-href-confirm'),
            encoded = window.btoa(href),
            method = (element.getAttribute('data-g-config-method') || 'post').toLowerCase();

        if (mode === 'delete' && !flags.get('free:to:delete:' + encoded, false)) {
            flags.warning({
                url: parseAjaxURI(href + getAjaxSuffix()),
                callback: function(response, content) {
                    let container = asElement(content),
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
        request(method, parseAjaxURI((hrefConfirm || href) + getAjaxSuffix()), {}, function(error, response) {
            let result = response && response.body;
            if (!result || !result.success) {
                modal.open({ content: result ? (result.html || result.message || result) : error.message });
            } else {
                let selector = document.querySelector('#configuration-selector'),
                    currentOutline = selector ? selector.value : null,
                    outlineDeleted = result.outline,
                    reload = Array.from(document.querySelectorAll('[href]')).find(function(link) {
                        return link.getAttribute('href') === getAjaxURL('configurations');
                    });

                if (outlineDeleted && currentOutline === outlineDeleted && selector && selector.selectizeInstance && reload) {
                    let ids = Object.keys(selector.selectizeInstance.Options);
                    if (ids.length) { reload.href = reload.href.replace('style=' + outlineDeleted, 'style=' + ids.shift()); }
                }
                if (reload) { reload.click(); }
                else { window.location.reload(); }

                toastr.success(result.html || 'Action successfully completed.', result.title || '');
                if (outlineDeleted) { body.outlineDeleted = outlineDeleted; }
            }
            indicator.hide(element);
        });
    });

    body.addEventListener('statechangeEnd', function() {
        attachEditables(document.querySelectorAll('#configurations [data-title-editable]'));
    });
    attachEditables(document.querySelectorAll('#configurations [data-title-editable]'));
});

export default {};
