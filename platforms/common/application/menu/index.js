"use strict";
var dom           = require('../utils/dom'),
    MenuManager   = require('./menumanager'),
    Submit        = require('../fields/submit'),
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

dom.ready(function() {
    var body = document.body;

    menumanager = new MenuManager('[data-mm-container]', {
        delegate: '.genesis-mm-particles-picker ul li, #menu-editor > section ul li, .submenu-column, .submenu-column li[data-mm-id], .column-container .g-block',
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
    body.addEventListener('statechangeAfter', function() {
        if (!document.querySelector('#menu-editor')) { return; }
        menumanager.setRoot();
        menumanager.refresh();

        // refresh MM eraser
        if (menumanager.eraser) {
            menumanager.eraser.setElement(document.querySelector('[data-mm-eraseparticle]'));
            menumanager.eraser.hide();
        }
    });

    dom.delegate(body, 'focusin', '.percentage input', function(event, element) {
        element.currentSize = Number(element.value);
        element.select();
    });

    dom.delegate(body, 'keydown', '.percentage input', function(event) {
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

    dom.delegate(body, 'keydown', '.percentage input', function(event, element) {
        var value  = Number(element.value),
            min    = Number(element.min),
            max    = Number(element.max),
            upDown = event.keyCode == 38 || event.keyCode == 40;

        if (upDown) {
            event.preventDefault();
            value += event.keyCode == 38 ? +1 : -1;
            value = clamp(value, min, max);
            element.value = value;
            element.dispatchEvent(new Event('keyup', { bubbles: true }));
        }
    });

    dom.delegate(body, 'keyup', '.percentage input', function(event, element) {
        var value = Number(element.value),
            min   = Number(element.min),
            max   = Number(element.max);

        var resizer = menumanager.resizer,
            parent  = element.closest('[data-mm-id]'),
            sibling = parent && (parent.nextElementSibling || parent.previousElementSibling);

        if (!parent || !sibling || !value || value < min || value > max) { return; }

        var sizes = {
            current: Number(element.currentSize),
            sibling: Number(resizer.getSize(sibling))
        };

        element.currentSize = value;

        sizes.total = sizes.current + sizes.sibling;
        sizes.diff = sizes.total - value;

        resizer.setSize(parent, value);
        resizer.setSize(sibling, sizes.diff);

        menumanager.resizer.updateItemSizes(Array.from(parent.parentElement.children).filter(function(child) {
            return child.matches('[data-mm-id]');
        }));
        menumanager.emit('dragEnd', menumanager.map, 'inputChange');
    });

    dom.delegate(body, 'focusout', '.percentage input', function(event, element) {
        var value = Number(element.value);
        if (value < Number(element.min) || value > Number(element.max)) {
            element.value = element.currentSize;
        }
    });

    // Add new columns
    dom.delegate(body, 'click', '.add-column', function(event, element) {
        event.preventDefault();
        var columns = element.closest('[data-genesis-menu-columns]'),
            container = columns && columns.querySelector('.submenu-selector'),
            children = container ? Array.from(container.children) : [],
            last = children[children.length - 1],
            count = children.length,
            active = document.querySelector('.menu-selector .active'),
            path = active ? active.getAttribute('data-mm-id') : null;
        if (!container || !last) { return; }

        // do not allow to create a new column if there's already one and it's empty
        if (count === 1 && !container.querySelector('.submenu-items > [data-mm-id]')) { return; }

        var block = last.cloneNode(true),
            items = block.querySelector('.submenu-items'),
            baseLevel = block.querySelector('[data-mm-base-level]'),
            level = block.querySelector('.submenu-level');
        block.setAttribute('data-mm-id', 'list-' + count);
        if (items) { items.replaceChildren(); }
        if (baseLevel) { baseLevel.setAttribute('data-mm-base-level', '1'); }
        if (level) { level.textContent = 'Level 1'; }
        last.after(block);

        if (!menumanager.ordering[path]) {
            menumanager.ordering[path] = [[]];
        }

        menumanager.ordering[path].push([]);
        menumanager.resizer.evenResize(container.querySelectorAll(':scope > [data-mm-id]'));
    });

    // Attach events to pseudo (x) for deleting a column
    ['click', 'touchend'].forEach(function(evt) {
        dom.delegate(body, evt, '[data-genesis-menu-columns] .submenu-items:empty', function(event, element) {
            var point = event.changedTouches && event.changedTouches[0],
                bounding = element.getBoundingClientRect(),
                x = event.pageX || (point && point.pageX) || 0,
                y = event.pageY || (point && point.pageY) || 0,
                selector = element.closest('.submenu-selector'),
                siblings = selector ? selector.querySelectorAll(':scope > [data-mm-id]') : [],
                deleter  = {
                    width: 36,
                    height: 36
                };

            if (siblings.length <= 1) {
                return false;
            }

            if (x >= bounding.left + bounding.width - deleter.width && x <= bounding.left + bounding.width &&
                Math.abs(window.scrollY - y) - bounding.top < deleter.height) {
                var parent = element.closest('[data-mm-id]'),
                    container = parent && parent.parentElement,
                    columns = container ? Array.from(container.children).filter(function(child) { return child.matches('[data-mm-id]'); }) : [],
                    index = columns.indexOf(parent),
                    active = document.querySelector('.menu-selector .active'),
                    path = active ? active.getAttribute('data-mm-id') : null;
                if (!parent || !path || index < 0) { return; }

                parent.remove();
                siblings = container.querySelectorAll(':scope > [data-mm-id]');
                menumanager.ordering[path].splice(index, 1);
                menumanager.resizer.evenResize(siblings);
            }
        });
    });

    // Menu Items settings
    dom.delegate(body, 'click', '#menu-editor .config-cog, #menu-editor .global-menu-settings', function(event, element) {
        event.preventDefault();

        var data = {},
            isRoot = element.classList.contains('global-menu-settings'),
            itemElement = element.closest('[data-mm-id]');

        if (isRoot) {
            data.settings = JSON.stringify(menumanager.settings);
        } else {
            var itemId = itemElement && itemElement.getAttribute('data-mm-id');
            if (!menumanager.items || typeof menumanager.items[itemId] === 'undefined') {
                menumanager.setRoot();
            }
            if (!itemId || !menumanager.items || typeof menumanager.items[itemId] === 'undefined') {
                toastr.error('Unable to find the selected menu item. Please reload the Menu Manager.', 'Menu item unavailable');
                return;
            }
            data.item = JSON.stringify(menumanager.items[itemId]);
        }

        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            method: 'post',
            data: data,
            overlayClickToClose: false,
            remote: parseAjaxURI(element.getAttribute('href') + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) {
                    modal.enableCloseByOverlay();
                    return;
                }

                var container  = modal.element(content.elements.content),
                    form       = container && container.querySelector('form'),
                    submit     = container ? container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]') : [],
                    actionForm = form,
                    path;

                var search      = container.querySelector('.search input'),
                    blocks      = container.querySelectorAll('[data-mm-type]'),
                    filters     = container.querySelectorAll('[data-mm-filter]'),
                    urlTemplate = container.querySelector('.g-urltemplate');

                if (urlTemplate) { urlTemplate.dispatchEvent(new Event('input', { bubbles: true })); }

                var editable = container.querySelector('[data-title-editable]');
                if (editable) {
                    editable.addEventListener('genesis:title-edit-end', function(titleEvent) {
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
                            toastr.error(translate('GENESIS_PLATFORM_JS_REVIEW_FIELDS'), translate('GENESIS_PLATFORM_JS_INVALID_FIELDS'));
                            return;
                        }

                        request(
                            actionForm.getAttribute('method') || 'post',
                            parseAjaxURI((actionForm.getAttribute('action') || '') + getAjaxSuffix()),
                            post.valid.join('&'),
                            function(error, response) {
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
                                path = response.body.path || itemElement.getAttribute('data-mm-id');
                                menumanager.items[path] = response.body.item;
                            } else if (response.body.item && response.body.item.type == 'particle') {

                            } else {
                                menumanager.settings = response.body.settings;
                            }

                            if (response.body.html) {
                                var parent = itemElement;
                                if (parent) {
                                    var status = response.body.item.enabled || response.body.item.options.particle.enabled;
                                    parent.innerHTML = response.body.html;
                                    parent.classList.toggle('g-menu-item-disabled', status == '0');
                                }
                            }

                            menumanager.emit('dragEnd', menumanager.map);

                            // if it's apply and save we also save the panel
                            if (target.hasAttribute('data-apply-and-save')) {
                                var save = document.querySelector('.button-save');
                                if (save) { save.click(); }
                            }

                            modal.close();
                            toastr.success(translate('GENESIS_PLATFORM_JS_MENU_SETTINGS_APPLIED'), translate('GENESIS_PLATFORM_JS_SETTINGS_APPLIED'));
                        }

                        indicator.hide(target);
                        target.disabled = false;
                            }
                        );
                    });
                });
            }
        });
    });
});

module.exports = {
    menumanager: menumanager
};
