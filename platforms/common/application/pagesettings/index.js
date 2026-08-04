'use strict';

var dom = require('../utils/dom'),
    Submit = require('../fields/submit'),
    modal = require('../ui').modal,
    toastr = require('../ui').toastr,
    Eraser = require('../ui/eraser'),
    indicator = require('../utils/indicator'),
    request = require('../utils/request'),
    DraggableGroup = require('../utils/draggable-group'),
    parseAjaxURI = require('../utils/get-ajax-url').parse,
    getAjaxSuffix = require('../utils/get-ajax-suffix'),
    getOutlineNameById = require('../utils/get-outline').getOutlineNameById,
    translate = require('../utils/translate');

var AtomsField = '[name="page[head][atoms][_json]"]';

var Atoms = {
    eraser: null,
    lists: { picker: null, items: null, trash: null },

    serialize: function() {
        var list = document.querySelector('.atoms-list'),
            output = [];
        if (!list) { return '[]'; }

        list.querySelectorAll('[data-atom-picked]').forEach(function(item) {
            output.push(JSON.parse(item.getAttribute('data-atom-picked')));
        });
        return JSON.stringify(output).replace(/\//g, '\\/');
    },

    attachEraser: function() {
        var element = document.querySelector('[data-atoms-erase]');
        if (Atoms.eraser) { Atoms.eraser.setElement(element); return; }
        Atoms.eraser = new Eraser(element);
    },

    createSortables: function(element) {
        Atoms.attachEraser();
        var root = element || document.querySelector('#atoms');
        if (!root || root.SimpleSort) { return; }

        var controller = new DraggableGroup(root, {
            lists: '.atoms-picker, .atoms-list',
            items: '[data-atom-picked]',
            filter: '[data-atom-ignore]',
            cloneFrom: '.atoms-picker',
            trash: '#trash',
            draggingClass: 'atom-dragging',
            direction: 'grid',
            preview: true,

            canReceive: function(list) {
                return list.classList.contains('atoms-list');
            },

            canDelete: function(state) {
                return state.from.classList.contains('atoms-list');
            },

            onPreview: function(preview, source) {
                var color = getComputedStyle(source).borderTopColor;
                preview.style.backgroundColor = color;
                preview.style.borderColor = color;
                preview.style.color = '#fff';
                preview.querySelectorAll('.atom-title, .atom-settings, .drag-indicator, i').forEach(function(element) {
                    element.style.color = '#fff';
                });
            },

            onStart: function(event) {
                Atoms.attachEraser();
                if (!event.cloned) { Atoms.eraser.show(); }
            },

            onTrashOver: function(over) {
                if (over) { Atoms.eraser.over(); }
                else { Atoms.eraser.out(); }
            },

            onEnd: function(event) {
                if (!event.cloned) { Atoms.eraser.hide(); }
                if (!event.changed) { return; }

                var field = document.querySelector(AtomsField);
                if (!field) { throw new Error('Field "' + AtomsField + '" not found in the DOM.'); }
                field.value = Atoms.serialize();
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        Atoms.lists.picker = controller;
        Atoms.lists.items = controller;
        Atoms.lists.trash = controller;
        root.SimpleSort = controller;
    }
};

var attachSettings = function() {
    dom.delegate(document.body, 'click', '.atoms-list [data-atom-picked] .config-cog', function(event, trigger) {
        event.preventDefault();
        var item = trigger.closest('[data-atom-picked]'),
            list = item && item.parentElement,
            dataField = document.querySelector(AtomsField);
        if (!item || !list || !dataField) { return; }

        var itemData = item.getAttribute('data-atom-picked'),
            dataValue = JSON.parse(dataField.value || '[]');

        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            method: 'post',
            data: { data: itemData },
            overlayClickToClose: false,
            remote: parseAjaxURI(trigger.getAttribute('href') + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                var container = modal.element(content.elements.content),
                    form = container.querySelector('form'),
                    submits = container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');

                if (modal.getAll().length > 1) {
                    container.querySelectorAll('[data-apply-and-save]').forEach(function(button) { button.remove(); });
                    submits = container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');
                }
                if (!form || !submits.length) { return true; }

                submits.forEach(function(target) {
                    target.addEventListener('click', function(submitEvent) {
                        submitEvent.preventDefault();
                        indicator.hide(target);
                        indicator.show(target);

                        form = container.querySelector('form');
                        var post = Submit(form.elements, container);
                        if (post.invalid.length) {
                            indicator.hide(target);
                            indicator.show(target, 'fa fa-fw fa-exclamation-triangle');
                            toastr.error(translate('GENESIS_PLATFORM_JS_REVIEW_FIELDS'), translate('GENESIS_PLATFORM_JS_INVALID_FIELDS'));
                            return;
                        }

                        request(form.method, parseAjaxURI(form.action + getAjaxSuffix()), post.valid.join('&') || {}, function(error, resultResponse) {
                            var result = resultResponse && resultResponse.body;
                            if (!result || !result.success) {
                                modal.open({
                                    content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.'),
                                    afterOpen: function(modalContainer) {
                                        modalContainer = modal.element(modalContainer);
                                        if (result && !result.html && !result.message && modalContainer) { modalContainer.style.width = '90%'; }
                                    }
                                });
                            } else {
                                var items = Array.from(list.querySelectorAll(':scope > [data-atom-picked]')),
                                    itemIndex = items.indexOf(item);
                                if (itemIndex !== -1) {
                                    dataValue[itemIndex] = result.item;
                                    dataField.value = JSON.stringify(dataValue).replace(/\//g, '\\/');
                                    item.setAttribute('data-atom-picked', JSON.stringify(result.item).replace(/\//g, '\\/'));

                                    var title = item.querySelector('.atom-title');
                                    if (title) { title.textContent = result.item.title; }

                                    var enabled = Number(result.item.attributes.enabled),
                                        inheriting = result.item.inherit && Object.keys(result.item.inherit).length;
                                    item.classList.toggle('atom-disabled', !enabled);
                                    item.classList.toggle('g-inheriting', Boolean(inheriting));
                                    item.title = enabled ? '' : translate('GENESIS_PLATFORM_JS_LM_DISABLED_PARTICLE', 'atom');
                                    item.removeAttribute('data-tip');

                                    if (inheriting) {
                                        var inherit = result.item.inherit,
                                            outline = getOutlineNameById(inherit.outline),
                                            atom = inherit.atom || '',
                                            include = (inherit.include || []).join(', ');
                                        item.setAttribute('data-tip', translate('GENESIS_PLATFORM_INHERITING_FROM_X', '<strong>' + outline + '</strong>') + '<br />ID: ' + atom + '<br />Replace: ' + include);
                                    }
                                    dataField.dispatchEvent(new Event('change', { bubbles: true }));
                                    global.Genesis.tips.reload();
                                }

                                if (target.hasAttribute('data-apply-and-save')) {
                                    var save = document.querySelector('.button-save');
                                    if (save) { save.click(); }
                                }
                                modal.close();
                                toastr.success(translate('GENESIS_PLATFORM_JS_GENERIC_SETTINGS_APPLIED', 'Atom'), translate('GENESIS_PLATFORM_JS_SETTINGS_APPLIED'));
                            }
                            indicator.hide(target);
                        });
                    });
                });
            }
        });
    });
};

var attachSortableAtoms = function(atoms) {
    if (atoms && !atoms.SimpleSort) { Atoms.createSortables(atoms); }
};

dom.ready(function() {
    var atoms = document.querySelector('#atoms');
    dom.delegate(document.body, 'mouseover', '#atoms', function(event, element) { attachSortableAtoms(element); });
    attachSortableAtoms(atoms);
    attachSettings();
});

module.exports = Atoms;
