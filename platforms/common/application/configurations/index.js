"use strict";

var dom = require('../utils/dom'),
    modal = require('../ui').modal,
    toastr = require('../ui').toastr,
    request = require('../utils/request'),
    indicator = require('../utils/indicator'),
    getAjaxSuffix = require('../utils/get-ajax-suffix'),
    parseAjaxURI = require('../utils/get-ajax-url').parse,
    getAjaxURL = require('../utils/get-ajax-url').global,
    flags = require('../utils/flags-state');

require('./dropdown-edit');

var asElement = function(element) {
    return element && element.nodeType ? element : element && element[0];
};

var elementFromHTML = function(html) {
    var template = document.createElement('template');
    template.innerHTML = String(html || '').trim();
    return template.content.firstElementChild;
};

dom.ready(function() {
    var body = document.body;

    var attachEditables = function(editables) {
        editables.forEach(function(editable) {
            if (editable.confWasAttached) { return; }
            editable.confWasAttached = true;
            editable.addEventListener('g5:title-edit-start', function() {
                editable.style.textOverflow = 'inherit';
            });
            editable.addEventListener('g5:title-edit-end', function(event) {
                var detail = event.detail || {},
                    title = detail.title,
                    original = detail.original;

                editable.style.textOverflow = 'ellipsis';
                if (detail.canceled || title === original) { return; }

                var href = editable.getAttribute('data-g-config-href'),
                    method = (editable.getAttribute('data-g-config-method') || 'post').toLowerCase(),
                    parent = editable.parentElement,
                    editButton = parent && parent.querySelector('[data-title-edit]');

                indicator.show(parent);
                if (editButton) { editButton.classList.add('disabled'); }

                request(method, parseAjaxURI(href + getAjaxSuffix()), { title: String(title).trim() }, function(error, response) {
                    var result = response && response.body;
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

                        var dummy = elementFromHTML(result.outline),
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

    dom.delegate(body, 'click', '[data-g5-outline-create], [data-g5-outline-duplicate]', function(event, trigger) {
        event.preventDefault();
        modal.open({
            content: 'Loading',
            method: 'post',
            overlayClickToClose: false,
            remote: parseAjaxURI(trigger.href + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) { modal.enableCloseByOverlay(); return; }

                var container = modal.element(content.elements.content),
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

                    var checkedFrom = container.querySelector('[name="from"]:checked'),
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
                    var uri = parseAjaxURI(confirm.getAttribute('data-g-outline-create-confirm') + getAjaxSuffix());

                    request('post', uri, data, function(error, resultResponse) {
                        indicator.hide(confirm);
                        var result = resultResponse && resultResponse.body;
                        if (!result || !result.success) {
                            modal.open({ content: result ? (result.html || result.message || result) : error.message });
                            return;
                        }

                        var base = document.querySelector('#configurations ul li'),
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
        var card = element.closest('.card');
        if (!card) { return; }
        card.querySelectorAll('.g-create-from').forEach(function(block) {
            block.style.display = block.classList.contains('g-create-from-' + element.value) ? 'block' : 'none';
        });
    });

    dom.delegate(body, 'click', '#configurations [data-g-config]', function(event, element) {
        event.preventDefault();
        var mode = element.getAttribute('data-g-config'),
            href = element.getAttribute('data-g-config-href'),
            hrefConfirm = element.getAttribute('data-g-config-href-confirm'),
            encoded = window.btoa(href),
            method = (element.getAttribute('data-g-config-method') || 'post').toLowerCase();

        if (mode === 'delete' && !flags.get('free:to:delete:' + encoded, false)) {
            flags.warning({
                url: parseAjaxURI(href + getAjaxSuffix()),
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
        request(method, parseAjaxURI((hrefConfirm || href) + getAjaxSuffix()), {}, function(error, response) {
            var result = response && response.body;
            if (!result || !result.success) {
                modal.open({ content: result ? (result.html || result.message || result) : error.message });
            } else {
                var selector = document.querySelector('#configuration-selector'),
                    currentOutline = selector ? selector.value : null,
                    outlineDeleted = result.outline,
                    reload = Array.from(document.querySelectorAll('[href]')).find(function(link) {
                        return link.getAttribute('href') === getAjaxURL('configurations');
                    });

                if (outlineDeleted && currentOutline === outlineDeleted && selector && selector.selectizeInstance && reload) {
                    var ids = Object.keys(selector.selectizeInstance.Options);
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

module.exports = {};
