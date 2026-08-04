"use strict";

var dom = require('../utils/dom'),
    request = require('../utils/request'),
    modal = require('../ui').modal,
    getAjaxSuffix = require('../utils/get-ajax-suffix'),
    parseAjaxURI = require('../utils/get-ajax-url').parse,
    History = require('../utils/history');

var guid = function() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

var refreshWordpressLinks = function(title, value) {
    if (window.GENESIS_PLATFORM !== 'wordpress') { return; }

    var replacement = title.replace(/[^a-z\d_-\s]/i, '_').toLowerCase(),
        currentURI = History.getPageUrl(),
        parsedURI = new URL(currentURI, window.location.href),
        currentView = parsedURI.searchParams.get('view') || '';

    document.querySelectorAll('[href*="/' + CSS.escape(value) + '/"]').forEach(function(link) {
        link.href = link.href.replace('/' + value + '/', '/' + replacement + '/');
    });

    currentView = currentView.replace('/' + value + '/', '/' + replacement + '/');
    parsedURI.searchParams.set('view', currentView);
    History.replaceState({ uuid: guid(), doNothing: true }, document.title, parsedURI.toString());
};

dom.ready(function() {
    var body = document.body;

    dom.delegate(body, 'keydown', '.config-select-wrap [data-title-edit]', function(event, editButton) {
        if (event.keyCode !== 32 && event.keyCode !== 13) { return; }
        event.preventDefault();
        editButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    dom.delegate(body, 'mousedown', '.config-select-wrap [data-title-edit]', function(event, editButton) {
        var wrapper = editButton.parentElement,
            selectized = wrapper && wrapper.querySelector('.g-selectize-control'),
            select = wrapper && wrapper.querySelector('select'),
            editable = wrapper && wrapper.querySelector('[data-title-editable]');

        if (!selectized || !select || !editable) { return; }

        if (!editable.gConfEditAttached) {
            editable.gConfEditAttached = true;
            editable.addEventListener('g5:title-edit-end', function(titleEvent) {
                var detail = titleEvent.detail || {},
                    title = String(detail.title || '').trim(),
                    original = detail.original,
                    canceled = detail.canceled;

                var finish = function() {
                    selectized.style.display = 'inline-block';
                    editable.style.display = 'none';
                    editable.removeAttribute('contenteditable');
                };

                if (canceled || title === original) {
                    finish();
                    return;
                }

                editButton.classList.add('disabled', 'fa-spin-fast', 'fa-spinner');
                editButton.classList.remove('fa-pencil');

                var href = editable.getAttribute('data-g-config-href'),
                    value = select.value;

                request('post', parseAjaxURI(href + getAjaxSuffix()), { title: title }, function(error, response) {
                    var bodyResponse = response && response.body;
                    if (!bodyResponse || !bodyResponse.success) {
                        modal.open({
                            content: bodyResponse ? (bodyResponse.html || bodyResponse.message || bodyResponse) : (error ? error.message : 'Unable to rename outline.'),
                            afterOpen: function(container) {
                                container = modal.element(container);
                                if (bodyResponse && !bodyResponse.html && !bodyResponse.message && container) {
                                    container.style.width = '90%';
                                }
                            }
                        });
                        editable.setAttribute('data-title-editable', original);
                        editable.textContent = original;
                    } else {
                        var selectize = select.selectizeInstance,
                            data = selectize && selectize.Options[value];

                        if (selectize && data) {
                            data[selectize.options.labelField] = title;
                            selectize.updateOption(value, data);
                        }
                        refreshWordpressLinks(title, value);
                    }

                    finish();
                    editButton.classList.remove('disabled', 'fa-spin-fast', 'fa-spinner');
                    editButton.classList.add('fa-pencil');
                });
            });
        }

        editable.style.width = selectized.getBoundingClientRect().width + 'px';
        editable.style.display = 'inline-block';
        selectized.style.display = 'none';
    });
});

module.exports = {};
