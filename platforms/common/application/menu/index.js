"use strict";
var ready         = require('../utils/dom').ready,
    MenuManager   = require('./menumanager'),
    Submit        = require('../fields/submit'),
    $             = require('elements'),
    modal         = require('../ui').modal,
    toastr        = require('../ui').toastr,
    extraItems    = require('./extra-items'),
    request       = require('../utils/request'),
    indicator     = require('../utils/indicator'),
    parseAjaxURI  = require('../utils/get-ajax-url').parse,
    getAjaxSuffix = require('../utils/get-ajax-suffix'),
    translate     = require('../utils/translate');

var menumanager;

var trim = function(value) {
    return value == null ? '' : String(value).trim();
};

var clamp = function(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
};

var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

var FOCUSIN  = isFirefox ? 'focus' : 'focusin',
    FOCUSOUT = isFirefox ? 'blur' : 'focusout';

ready(function() {
    var body = $('body');

    menumanager = new MenuManager('[data-mm-container]', {
        delegate: '.g5-mm-particles-picker ul li, #menu-editor > section ul li, .submenu-column, .submenu-column li[data-mm-id], .column-container .g-block',
        droppables: '#menu-editor [data-mm-id]',
        exclude: '[data-lm-nodrag], .menu-item-back, .fa-cog, .config-cog',
        resize_handles: '.submenu-column:not(:last-child)',
        catchClick: true
    });


    // Handles Modules / Particles items in the Menu
    menumanager.on('dragEnd', extraItems);

    module.exports.menumanager = menumanager;

    // Menu Manager
    menumanager.setRoot();

    // Refresh ordering/items on menu type change or Menu navigation link
    body.delegate('statechangeAfter', '#main-header [data-g5-ajaxify], select.menu-select-wrap', function(/*event, element*/) {
        menumanager.setRoot();
        menumanager.refresh();

        // refresh MM eraser
        if (menumanager.eraser) {
            menumanager.eraser.setElement(document.querySelector('[data-mm-eraseparticle]'));
            menumanager.eraser.hide();
        }
    });

    body.delegate(FOCUSIN, '.percentage input', function(event, element) {
        element = $(element);
        element.currentSize = Number(element.value());

        element[0].focus();
        element[0].select();
    }, true);

    body.delegate('keydown', '.percentage input', function(event/*, element*/) {
        if ([46, 8, 9, 27, 13, 110, 190].includes(event.keyCode) ||
                // Allow: [Ctrl|Cmd]+A | [Ctrl|Cmd]+R
            (event.keyCode == 65 && (event.ctrlKey === true || event.ctrlKey === true)) ||
            (event.keyCode == 82 && (event.ctrlKey === true || event.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    });

    body.delegate('keydown', '.percentage input', function(event, element) {
        element = $(element);
        var value  = Number(element.value()),
            min    = Number(element.attribute('min')),
            max    = Number(element.attribute('max')),
            upDown = event.keyCode == 38 || event.keyCode == 40;

        if (upDown) {
            value += event.keyCode == 38 ? +1 : -1;
            value = clamp(value, min, max);
            element.value(value);
            body.emit('keyup', { target: element });
        }
    });

    body.delegate('keyup', '.percentage input', function(event, element) {
        element = $(element);
        var value = Number(element.value()),
            min   = Number(element.attribute('min')),
            max   = Number(element.attribute('max'));

        var resizer = menumanager.resizer,
            parent  = element.parent('[data-mm-id]'),
            sibling = parent.nextSibling('[data-mm-id]') || parent.previousSibling('[data-mm-id]');

        if (!value || value < min || value > max) { return; }

        var sizes = {
            current: Number(element.currentSize),
            sibling: Number(resizer.getSize(sibling))
        };

        element.currentSize = value;

        sizes.total = sizes.current + sizes.sibling;
        sizes.diff = sizes.total - value;

        resizer.setSize(parent, value);
        resizer.setSize(sibling, sizes.diff);

        menumanager.resizer.updateItemSizes(parent.parent('.submenu-selector').search('> [data-mm-id]'));
        menumanager.emit('dragEnd', menumanager.map, 'inputChange');
    });

    body.delegate(FOCUSOUT, '.percentage input', function(event, element) {
        element = $(element);
        var value = Number(element.value());
        if (value < Number(element.attribute('min')) || value > Number(element.attribute('max'))) {
            element.value(element.currentSize);
        }
    }, true);

    // Add new columns
    body.delegate('click', '.add-column', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }
        element = $(element);

        var container = element.parent('[data-g5-menu-columns]').find('.submenu-selector'),
            children  = container.children(),
            last      = container.find('> :last-child'),
            count     = children ? children.length : 0,
            active    = $('.menu-selector .active'),
            path      = active ? active.data('mm-id') : null;

        // do not allow to create a new column if there's already one and it's empty
        if (count == 1 && !children.search('.submenu-items > [data-mm-id]')) { return false; }

        var block = $(last[0].cloneNode(true));
        block.data('mm-id', 'list-' + count);
        block.find('.submenu-items')[0].replaceChildren();
        block.find('[data-mm-base-level]').data('mm-base-level', 1);
        block.find('.submenu-level').text('Level 1');
        block.after(last);

        if (!menumanager.ordering[path]) {
            menumanager.ordering[path] = [[]];
        }

        menumanager.ordering[path].push([]);
        menumanager.resizer.evenResize($('.submenu-selector > [data-mm-id]'));
    });

    // Attach events to pseudo (x) for deleting a column
    ['click', 'touchend'].forEach(function(evt) {
        body.delegate(evt, '[data-g5-menu-columns] .submenu-items:empty', function(event, element) {
            var bounding = element[0].getBoundingClientRect(),
                x        = event.pageX || event.changedTouches[0].pageX || 0, y = event.pageY || event.changedTouches[0].pageY || 0,
                siblings = $('.submenu-selector > [data-mm-id]'),
                deleter  = {
                    width: 36,
                    height: 36
                };

            if (siblings.length <= 1) {
                return false;
            }

            if (x >= bounding.left + bounding.width - deleter.width && x <= bounding.left + bounding.width &&
                Math.abs(window.scrollY - y) - bounding.top < deleter.height) {
                var parent    = element.parent('[data-mm-id]'),
                    container = parent.parent('.submenu-selector').children('[data-mm-id]'),
                    index     = Array.prototype.indexOf.call(container, parent[0] || parent),
                    active    = $('.menu-selector .active'),
                    path      = active ? active.data('mm-id') : null;

                parent.remove();
                siblings = $('.submenu-selector > [data-mm-id]');
                menumanager.ordering[path].splice(index, 1);
                menumanager.resizer.evenResize(siblings);
            }
        });
    });

    // Menu Items settings
    body.delegate('click', '#menu-editor .config-cog, #menu-editor .global-menu-settings', function(event, element) {
        event.preventDefault();

        var data = {}, isRoot = element.hasClass('global-menu-settings');

        if (isRoot) {
            data.settings = JSON.stringify(menumanager.settings);
        } else {
            data.item = JSON.stringify(menumanager.items[element.parent('[data-mm-id]').data('mm-id')]);
        }

        modal.open({
            content: translate('GANTRY5_PLATFORM_JS_LOADING'),
            method: 'post',
            data: data,
            overlayClickToClose: false,
            remote: parseAjaxURI($(element).attribute('href') + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) {
                    modal.enableCloseByOverlay();
                    return;
                }

                var container = modal.element(content.elements.content),
                    template = document.createElement('template');
                template.innerHTML = String(response.body.html || '');

                var form       = container && container.querySelector('form'),
                    fakeDOM    = template.content.querySelector('form'),
                    submit     = container ? container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]') : [],
                    actionForm = fakeDOM || form,
                    path;

                var search      = container.querySelector('.search input'),
                    blocks      = container.querySelectorAll('[data-mm-type]'),
                    filters     = container.querySelectorAll('[data-mm-filter]'),
                    urlTemplate = container.querySelector('.g-urltemplate');

                if (urlTemplate) { urlTemplate.dispatchEvent(new Event('input', { bubbles: true })); }

                var editable = container.querySelector('[data-title-editable]');
                if (editable) {
                    editable.addEventListener('g5:title-edit-end', function(titleEvent) {
                        var detail = titleEvent.detail || {},
                            title = trim(detail.title),
                            original = detail.original;
                        if (!title) {
                            title = trim(original) || 'Title';
                            editable.textContent = title;
                            editable.setAttribute('data-title-editable', title);
                        }
                    });
                }

                if (search && filters.length && blocks.length) {
                    search.addEventListener('input', function() {
                        if (!search.value) {
                            blocks.forEach(function(block) { block.classList.remove('hidden'); });
                            return;
                        }

                        blocks.forEach(function(block) { block.classList.add('hidden'); });
                        var value = search.value.toLowerCase();

                        filters.forEach(function(filter) {
                            var text = trim(filter.getAttribute('data-mm-filter')).toLowerCase(),
                                found = text.startsWith(value) || text.includes(' ' + value),
                                block = filter.matches('[data-mm-type]') ? filter : filter.closest('[data-mm-type]');
                            if (found && block) {
                                block.classList.remove('hidden');
                            }
                        });
                    });
                }

                if (search) {
                    setTimeout(function() {
                        search.focus();
                    }, 5);
                }

                if (!container || !form || !actionForm || !submit.length) { return true; }

                // Menuitems Settings apply
                submit.forEach(function(target) {
                    target.addEventListener('click', function(e) {
                        e.preventDefault();
                        target.disabled = true;
                        indicator.hide(target);
                        indicator.show(target);

                        var post = Submit(actionForm.elements, container, {isRoot: isRoot});

                        if (post.invalid.length) {
                            target.disabled = false;
                            indicator.hide(target);
                            indicator.show(target, 'fa fa-fw fa-exclamation-triangle');
                            toastr.error(translate('GANTRY5_PLATFORM_JS_REVIEW_FIELDS'), translate('GANTRY5_PLATFORM_JS_INVALID_FIELDS'));
                            return;
                        }

                        request(actionForm.method, parseAjaxURI(actionForm.action + getAjaxSuffix()), post.valid.join('&'), function(error, response) {
                        if (!response.body.success) {
                            modal.open({
                                content: response.body.html || response.body.message || response.body,
                                afterOpen: function(container) {
                                    container = modal.element(container);
                                    if (container && !response.body.html && !response.body.message) { container.style.width = '90%'; }
                                }
                            });
                        } else {
                            if (response.body.path || (response.body.item && response.body.item.type == 'particle')) {
                                path = response.body.path || element.parent('[data-mm-id]').data('mm-id');
                                menumanager.items[path] = response.body.item;
                            } else if (response.body.item && response.body.item.type == 'particle') {

                            } else {
                                menumanager.settings = response.body.settings;
                            }

                            if (response.body.html) {
                                var parent = element.parent('[data-mm-id]');
                                if (parent) {
                                    var status = response.body.item.enabled || response.body.item.options.particle.enabled;
                                    parent.html(response.body.html);
                                    parent[status == '0' ? 'addClass' : 'removeClass']('g-menu-item-disabled');
                                }
                            }

                            menumanager.emit('dragEnd', menumanager.map);

                            // if it's apply and save we also save the panel
                            if (target.hasAttribute('data-apply-and-save')) {
                                var save = document.querySelector('.button-save');
                                if (save) { save.click(); }
                            }

                            modal.close();
                            toastr.success(translate('GANTRY5_PLATFORM_JS_MENU_SETTINGS_APPLIED'), translate('GANTRY5_PLATFORM_JS_SETTINGS_APPLIED'));
                        }

                        indicator.hide(target);
                        target.disabled = false;
                        });
                    });
                });
            }
        });
    });
});

module.exports = {
    menumanager: menumanager
};
