'use strict';

var dom = require('../utils/dom'),
    Submit = require('../fields/submit'),
    modal = require('../ui').modal,
    toastr = require('../ui').toastr,
    Eraser = require('../ui/eraser'),
    indicator = require('../utils/indicator'),
    request = require('../utils/request'),
    simpleSort = require('sortablejs'),
    parseAjaxURI = require('../utils/get-ajax-url').parse,
    getAjaxSuffix = require('../utils/get-ajax-suffix'),
    getOutlineNameById = require('../utils/get-outline').getOutlineNameById,
    translate = require('../utils/translate');

var AtomsField = '[name="page[head][atoms][_json]"]',
    groupOptions = [
        { name: 'atoms', pull: 'clone', put: false },
        { name: 'atoms', pull: true, put: true },
        { name: 'atoms', pull: false, put: false }
    ];

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

        groupOptions.forEach(function(groupOption, index) {
            var selector = index === 0 ? '.atoms-picker' : (index === 1 ? '.atoms-list' : '#trash'),
                list = document.querySelector(selector);
            if (!list) { return; }

            var sort = simpleSort.create(list, {
                sort: index === 1,
                filter: '[data-atom-ignore]',
                group: groupOption,
                scroll: false,
                forceFallback: true,
                animation: 100,

                onStart: function(event) {
                    Atoms.attachEraser();
                    event.item.classList.add('atom-dragging');
                    if (event.from.classList.contains('atoms-list')) { Atoms.eraser.show(); }
                },

                onEnd: function(event) {
                    var item = event.item,
                        trash = document.querySelector('#trash'),
                        originalEvent = this.originalEvent || event.originalEvent,
                        target = originalEvent && originalEvent.target instanceof Element ? originalEvent.target : null,
                        touchTrash = false;

                    if (originalEvent && originalEvent.type === 'touchend' && trash) {
                        var trashSize = trash.getBoundingClientRect(),
                            point = originalEvent.changedTouches && originalEvent.changedTouches[0],
                            pageY = originalEvent.pageY || (point && point.pageY) || 0;
                        touchTrash = pageY - window.scrollY <= trashSize.height;
                    }

                    if (trash && ((target && (target === trash || trash.contains(target))) || touchTrash)) {
                        item.remove();
                        Atoms.eraser.hide();
                        this.options.onSort(event);
                        return;
                    }

                    item.classList.remove('atom-dragging');
                    if (event.from.classList.contains('atoms-list')) { Atoms.eraser.hide(); }
                },

                onSort: function() {
                    var field = document.querySelector(AtomsField);
                    if (!field) { throw new Error('Field "' + AtomsField + '" not found in the DOM.'); }
                    field.value = Atoms.serialize();
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                },

                onOver: function(event) {
                    if (!event.from.classList.contains('atoms-list')) { return; }
                    var trash = document.querySelector('#trash'),
                        over = event.related || (event.originalEvent && event.originalEvent.target);
                    if (trash && over instanceof Node && (over === trash || trash.contains(over))) { Atoms.eraser.over(); }
                    else { Atoms.eraser.out(); }
                }
            });

            if (index === 0) { Atoms.lists.picker = sort; }
            else if (index === 1) { Atoms.lists.items = sort; element.SimpleSort = sort; }
            else { Atoms.lists.trash = sort; }
        });
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
            content: translate('GANTRY5_PLATFORM_JS_LOADING'),
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
                            toastr.error(translate('GANTRY5_PLATFORM_JS_REVIEW_FIELDS'), translate('GANTRY5_PLATFORM_JS_INVALID_FIELDS'));
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
                                    item.title = enabled ? '' : translate('GANTRY5_PLATFORM_JS_LM_DISABLED_PARTICLE', 'atom');
                                    item.removeAttribute('data-tip');

                                    if (inheriting) {
                                        var inherit = result.item.inherit,
                                            outline = getOutlineNameById(inherit.outline),
                                            atom = inherit.atom || '',
                                            include = (inherit.include || []).join(', ');
                                        item.setAttribute('data-tip', translate('GANTRY5_PLATFORM_INHERITING_FROM_X', '<strong>' + outline + '</strong>') + '<br />ID: ' + atom + '<br />Replace: ' + include);
                                    }
                                    dataField.dispatchEvent(new Event('change', { bubbles: true }));
                                    global.G5.tips.reload();
                                }

                                if (target.hasAttribute('data-apply-and-save')) {
                                    var save = document.querySelector('.button-save');
                                    if (save) { save.click(); }
                                }
                                modal.close();
                                toastr.success(translate('GANTRY5_PLATFORM_JS_GENERIC_SETTINGS_APPLIED', 'Atom'), translate('GANTRY5_PLATFORM_JS_SETTINGS_APPLIED'));
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
