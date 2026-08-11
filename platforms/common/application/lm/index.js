import __module0 from '../utils/dom.js';
import __module1 from '../utils/dom-collection.js';
import __module2 from '../fields/submit.js';
import __module3 from '../ui/index.js';
import __module4 from './particles-sidebar.js';
import __module5 from '../utils/request.js';
import __module6 from '../utils/indicator.js';
import __module7 from '../utils/get-ajax-suffix.js';
import __module8 from '../utils/get-ajax-url.js';
import __module9 from '../utils/flags-state.js';
import __module10 from './builder.js';
import __module11 from '../utils/history.js';
import __module12 from '../utils/field-validation.js';
import __module13 from './history.js';
import __module14 from './layoutmanager.js';
import __module15 from '../utils/save-state.js';
import __module16 from '../utils/translate.js';
import __module17 from './row-picker.js';
import '../ui/popover.js';
import './inheritance/index.js';

"use strict";
let ready          = __module0.ready,
    dom              = __module1,
    Submit         = __module2,
    modal          = __module3.modal,
    toastr         = __module3.toastr,
    sidebar        = __module4,
    request        = __module5,
    indicator      = __module6,

    getAjaxSuffix = __module7,
    parseAjaxURI  = __module8.parse,
    getAjaxURL    = __module8.global,

    flags         = __module9,
    Builder        = __module10,
    History        = __module11,
    validateField  = __module12,
    LMHistory      = __module13,
    LayoutManager  = __module14,
    SaveState      = __module15,
    translate      = __module16,
    openRowPicker  = __module17;

let reportInvalidFields = function(invalid) {
    let fields = invalid.map(function(input) {
        let element = input && input[0] ? input[0] : input,
            container = element ? element.closest('.settings-param, .card-overrideable') : null,
            label = container ? container.querySelector('.settings-param-title, label') : null;

        if (element) {
            element.classList.add('field-invalid');
            element.setAttribute('aria-invalid', 'true');
        }

        return label && label.textContent.trim()
            ? label.textContent.trim()
            : (element && (element.getAttribute('aria-label') || element.name || element.id)) || 'Unknown field';
    }).filter(function(value, index, values) { return values.indexOf(value) === index; });

    let first = invalid[0] && (invalid[0][0] || invalid[0]);
    if (first) {
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first.focus({ preventScroll: true });
    }

    let message = translate('GENESIS_PLATFORM_JS_REVIEW_FIELDS');
    if (fields.length) { message += '<br><strong>' + fields.join(', ') + '</strong>'; }
    toastr.error(message, translate('GENESIS_PLATFORM_JS_INVALID_FIELDS'));
};



let builder, layoutmanager, lmhistory, savestate, Tips;

let size = function(value) {
    if (!value) { return 0; }
    return Array.isArray(value) ? value.length : Object.keys(value).length;
};

let trim = function(value) {
    return value == null ? '' : String(value).trim();
};

let formatPresetName = function(value) {
    return trim(value).replace(/_/g, ' ').replace(/\//g, ' / ').toLowerCase().replace(/^\w|\s\w/g, function(character) {
        return character.toUpperCase();
    });
};

let precision = function(value, decimalPlaces) {
    let number = Number(value),
        multiplier = Math.pow(10, decimalPlaces);

    return Number((Math.round(number * multiplier) / multiplier).toFixed(decimalPlaces));
};

builder = new Builder();
lmhistory = new LMHistory();
savestate = new SaveState();

ready(function() {
    let body = dom('body');

    body.delegate('click', '[data-lm-back]', function(e, element) {
        if (e) { e.preventDefault(); }
        if (dom(element).hasClass('disabled')) return false;
        lmhistory.undo();
    });

    body.delegate('click', '[data-lm-forward]', function(e, element) {
        if (e) { e.preventDefault(); }
        if (dom(element).hasClass('disabled')) return false;
        lmhistory.redo();
    });

    /* lmhistory events */
    lmhistory.on('push', function(session, index, reset) {
        let HM = {
            back: dom('[data-lm-back]'),
            forward: dom('[data-lm-forward]')
        };

        if (index && HM.back && HM.back.hasClass('disabled')) HM.back.removeClass('disabled');
        if (reset && HM.forward && !HM.forward.hasClass('disabled')) HM.forward.addClass('disabled');
        layoutmanager.updatePendingChanges();
    });

    lmhistory.on('undo', function(session, index) {
        let notice = dom('#lm-no-layout'),
            title = dom('.layout-title .title small'),
            preset_name = session.preset.name || 'Default',
            HM = {
                back: dom('[data-lm-back]'),
                forward: dom('[data-lm-forward]')
            };

        if (notice) { notice.style({ display: !size(session.data) ? 'block' : 'none' }); }
        if (title) { title.text('(' + formatPresetName(preset_name) + ')'); }

        builder.reset(session.data);
        HM.forward.removeClass('disabled');
        if (!index) HM.back.addClass('disabled');
        layoutmanager.singles('disable');
        layoutmanager.updatePendingChanges();
    });
    lmhistory.on('redo', function(session, index) {
        let notice = dom('#lm-no-layout'),
            title = dom('.layout-title .title small'),
            preset_name = session.preset.name || 'Default',
            HM = {
                back: dom('[data-lm-back]'),
                forward: dom('[data-lm-forward]')
            };

        if (notice) { notice.style({ display: !size(session.data) ? 'block' : 'none' }); }
        if (title) { title.text('(' + formatPresetName(preset_name) + ')'); }

        builder.reset(session.data);
        HM.back.removeClass('disabled');
        if (index == this.session.length - 1) HM.forward.addClass('disabled');
        layoutmanager.singles('disable');
        layoutmanager.updatePendingChanges();
    });

});

ready(function() {
    let body = dom('body'), root = dom('[data-lm-root]'), data;

    // Layout Manager
    layoutmanager = new LayoutManager('[data-lm-container]', {
        delegate: '[data-lm-root] .g-grid > .g-block:has(> [data-lm-blocktype]:not([data-lm-nodrag])), .genesis-lm-particles-picker [data-lm-blocktype], [data-lm-root] [data-lm-blocktype="section"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag]), [data-lm-root] [data-lm-blocktype="section"] > [data-lm-blocktype="container"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag]), [data-lm-root] [data-lm-blocktype="offcanvas"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag]), [data-lm-root] [data-lm-blocktype="offcanvas"] > [data-lm-blocktype="container"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag])',
        droppables: '[data-lm-dropzone]',
        exclude: '.section-header .button, .section-header .fa, .lm-newblocks .float-right .button, [data-lm-nodrag], [data-lm-disabled]',
        resize_handles: '[data-lm-root] .g-grid > .g-block:not(:last-child)',
        builder: builder,
        history: lmhistory,
        savestate: savestate
    });

    // The live binding is exported below for circular layout consumers.

    // load builder data
    if (root) {
        data = JSON.parse(root.data('lm-root'));
        if (data.name) { data = data.layout; }
        builder.setStructure(data);
        builder.load();

        layoutmanager.history.setSession(builder.serialize(), JSON.parse(root.data('lm-preset')));
        layoutmanager.savestate.setSession(builder.serialize(null, true));
    }

    // attach events
    // Modal Tabs
    body.delegate('click', '.g-tabs a', function(event, element) {
        event.preventDefault();
        return false;
    });
    body.delegate('keydown', '.g-tabs a', function(event, element) {
        let key = (event.which ? event.which : event.keyCode);
        if (key == 32 || key == 13) { // ARIA support: Space / Enter toggle
            event.preventDefault();
            body.emit('mouseup', event);
            return false;
        }
    });
    body.delegate('mouseup', '.g-tabs a', function(event, element) {
        element = dom(element);
        event.preventDefault();

        let index = 0,
            parent = element.parent('.g-tabs'),
            panes = parent.siblings('.g-panes'),
            links = parent.search('a');

        links.forEach(function(link, i) {
            if (link == element[0]) { index = i + 1; }
        });

        panes.find('> .active').removeClass('active');
        parent.find('> ul > .active').removeClass('active');
        panes.find('> .g-pane:nth-child(' + index + ')').addClass('active');
        parent.find('> ul > li:nth-child(' + index + ')').addClass('active');

        // ARIA
        if (panes.search('> [aria-expanded]')) { panes.search('> [aria-expanded]').attribute('aria-expanded', 'false'); }
        if (parent.search('> [aria-expanded]')) { parent.search('> [aria-expanded]').attribute('aria-expanded', 'false'); }

        panes.find('> .g-pane:nth-child(' + index + ')').attribute('aria-expanded', 'true');
        if (parent.find('> ul >li:nth-child(' + index + ') [aria-expanded]')) { parent.find('> ul > li:nth-child(' + index + ') > [aria-expanded]').attribute('aria-expanded', 'true'); }
    });

    // Picker
    body.delegate('statechangeBefore', '[data-genesis-lm-picker]', function() {
        modal.close();
    });

    // Sub-navigation links
    body.on('statechangeAfter', function(event, element) {
        root = dom('[data-lm-root]');
        if (!root) { return true; }
        data = JSON.parse(root.data('lm-root'));
        builder.setStructure(data);
        builder.load();

        layoutmanager.refresh();
        layoutmanager.history.setSession(builder.serialize(), JSON.parse(root.data('lm-preset')));
        layoutmanager.savestate.setSession(builder.serialize(null, true));

        // refresh LM eraser
        layoutmanager.eraser.setElement(document.querySelector('[data-lm-eraseblock]'));
        layoutmanager.eraser.hide(true);
    });

    // Particles filtering
    body.delegate('input', '.sidebar-block .search input', function(event, element) {
        let value = dom(element).value().toLowerCase(),
            list = dom('.sidebar-block [data-lm-blocktype]'),
            text, type;
        if (!list) { return false; }

        list.style({ display: 'none' }).forEach(function(blocktype) {
            blocktype = dom(blocktype);
            type = blocktype.data('lm-blocktype').toLowerCase();
            text = trim(blocktype.text()).toLowerCase();
            if (type.substr(0, value.length) == value || text.match(value)) {
                blocktype.style({ display: 'block' });
            }
        }, this);
    });

    // Grid same widths button (evenize, equalize)
    ['click', 'touchend'].forEach(function(evt){
        body.delegate(evt, '[data-lm-samewidth]:not(:empty)', function(event, element) {
            window.Genesis.tips.hide(element[0]);
            let clientRect = element[0].getBoundingClientRect();
            if ((event.clientX || event.pageX || event.changedTouches[0].pageX || 0) < clientRect.width + clientRect.left) { return; }

            let blocks = element.search('> [data-lm-blocktype="block"]'), id;
            if (!blocks || blocks.length == 1) { return; }

            blocks.forEach(function(block) {
                id = dom(block).data('lm-id');
                builder.get(id).setSize(100 / blocks.length, true);
            });

            lmhistory.push(builder.serialize(), lmhistory.get().preset);
        });
    });

    body.delegate('mouseover', '[data-lm-samewidth]:not(:empty)', function(event, element) {
        let clientRect = element[0].getBoundingClientRect(),
            clientX = event.clientX || (event.touches && event.touches[0].clientX) || 0,
            tooltips = {
                equalize: clientX + 5 > clientRect.width + clientRect.left,
                move: clientX - 5 < clientRect.left
            };

        if (!tooltips.equalize && !tooltips.move) { return; }

        let msg = tooltips.equalize ? translate('GENESIS_PLATFORM_JS_LM_GRID_EQUALIZE') : translate('GENESIS_PLATFORM_JS_LM_GRID_SORT_MOVE');

        element.data('tip', msg).data('tip-offset', -30);

        window.Genesis.tips
            .get(element[0])
            .content(msg)
            .place(tooltips.equalize ? 'top-left' : 'top-right')
            .show();
    });

    body.delegate('mouseout', '[data-lm-samewidth]:not(:empty)', function(event, element) {
        window.Genesis.tips.hide(element[0]);
    });

    // Clear Layout
    body.delegate('click', '[data-lm-clear]', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }

        let mode = element.data('lm-clear'),
            options = {};

        switch (mode) {
            case 'keep-inheritance':
                options = { save: true, dropLastGrid: false, emptyInherits: false };
                break;
            case 'full':
            default:
                options = { save: true, dropLastGrid: false, emptyInherits: true };
        }

        layoutmanager.clear(null, options);
    });

    // Switcher
    let SWITCHER_HIT = false;
    body.delegate('mouseover', '[data-lm-switcher]', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }

        SWITCHER_HIT = element;
        if (!element.PopoverDefined) {
            element.getPopover({
                type: 'async',
                width: '500',
                url: parseAjaxURI(element.data('lm-switcher') + getAjaxSuffix()),
                allowElementsClick: '.g-tabs a'
            });
        }
    });

    // Switch Layout
    body.delegate('keydown', '[data-switch]', function(event, element){
        let key = (event.which ? event.which : event.keyCode);
        if (key == 32 || key == 13) { // ARIA support: Space toggle
            event.preventDefault();
            body.emit('mousedown', event);
        }
    });

    // Disable keeping particles if inherit option is selected
    body.delegate('change', '[data-g-inherit="outline"]', function(event, element) {
        let keeper = element.parent('.g-pane').find('input[type="checkbox"][data-g-preserve="outline"]');
        if (keeper) { keeper.checked(false); }
    });

    // Disable inheriting section/particles if keep option is selected
    body.delegate('change', '[data-g-preserve="outline"]', function(event, element) {
        let inherit = element.parent('.g-pane').find('input[type="checkbox"][data-g-inherit="outline"]');
        if (inherit) { inherit.checked(false); }
    });

    body.delegate('mousedown', '[data-switch]', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }

        // it's already loading something.
        if (element.parent('.genesis-popover-content').find('[data-switch] i')) {
            return false;
        }

        element.showIndicator();

        let preset = dom('[data-lm-preset]'),
            preserve = element.parent('.g-pane').find('input[type="checkbox"][data-g-preserve]'),
            inherit = element.parent('.g-pane').find('input[type="checkbox"][data-g-inherit]'),
            method = !preserve ? 'get' : 'post',
            data = {};

        preserve = preserve && preserve.checked();
        inherit = inherit && inherit.checked();

        if (preserve) {
            let lm = layoutmanager;
            lm.singles('cleanup', lm.builder, true);
            lm.savestate.setSession(lm.builder.serialize(null, true));

            data.preset = preset && preset.data('lm-preset') ? preset.data('lm-preset') : 'default';
            data.layout = JSON.stringify(lm.builder.serialize());
        }

        if (inherit) {
            data.inherit = 1;
        }

        let uri = parseAjaxURI(element.data('switch') + getAjaxSuffix());
        request(method, uri, data, function(error, response) {
            element.hideIndicator();

            if (!response.body.success) {
                modal.open({
                    content: response.body.html || response.body.message || response.body,
                    afterOpen: function(container) {
                        container = modal.element(container);
                        if (container && !response.body.html && !response.body.message) { container.style.width = '90%'; }
                    }
                });
                return;
            }

            if (response.body.message && !flags.get('lm:switcher:' + window.btoa(uri), false)) {
                // confirm before proceeding
                flags.warning({
                    message: response.body.message,
                    callback: function(response, content) {
                        let confirm = content.find('[data-g-delete-confirm]'),
                            cancel  = content.find('[data-g-delete-cancel]');

                        if (!confirm) { return; }

                        confirm.on('click', function(e) {
                            e.preventDefault();
                            if (this.attribute('disabled')) { return false; }

                            flags.set('lm:switcher:' + window.btoa(uri), true);
                            dom([confirm, cancel]).attribute('disabled');
                            body.emit('mousedown', { target: element });

                            modal.close();
                        });

                        cancel.on('click', function(e) {
                            e.preventDefault();
                            if (this.attribute('disabled')) { return false; }

                            dom([confirm, cancel]).attribute('disabled');
                            flags.set('lm:switcher:' + window.btoa(uri), false);

                            modal.close();
                            if (SWITCHER_HIT) {
                                setTimeout(function(){
                                    SWITCHER_HIT.getPopover().show();
                                }, 5);
                            }
                        });
                    }
                });

                return false;
            }

            let preset = response.body.preset || { name: 'default' },
                preset_name = response.body.title || 'Default',
                structure = response.body.data,
                notice = dom('#lm-no-layout'),
                title = dom('.layout-title .title small');

            root.data('lm-root', JSON.stringify(structure));
            root[0].replaceChildren();
            root.data('lm-preset', preset);
            if (notice) { notice.style({ display: 'none' }); }
            if (title) { title.text('(' + preset_name + ')'); }
            builder.setStructure(structure);
            builder.load();

            lmhistory.push(builder.serialize(), JSON.parse(preset));

            dom('[data-lm-switcher]').getPopover().hideAll().destroy();
        });
    });

    // Particles settings
    body.delegate('click', '[data-lm-settings]', function(event, element) {
        element = dom(element);

        let blocktype = element.data('lm-blocktype'),
            settingsURL = element.data('lm-settings'),
            data = null, parent, section;

        // grid is a special case, since relies on pseudo elements for sorting and same width (evenize)
        // we need to check where the user clicked.
        if (blocktype === 'grid') {
            let clientX = event.clientX || (event.touches && event.touches[0].clientX) || 0,
                boundings = element[0].getBoundingClientRect();

            if (clientX + 4 - boundings.left < boundings.width) {
                return false;
            }
        }

        element = element.parent('[data-lm-blocktype]');
        parent = element.parent('[data-lm-blocktype]');
        section = element.parent('[data-lm-blocktype="section"]');
        blocktype = element.data('lm-blocktype');

        let ID = element.data('lm-id'),
            parentID = parent ? parent.data('lm-id') : false,
            parentType = parent ? parent.data('lm-blocktype') : false;

        if (!['block', 'grid'].includes(blocktype)) {
            data = {};
            data.id = builder.get(element.data('lm-id')).getId() || null;
            data.type = builder.get(element.data('lm-id')).getType() || element.data('lm-blocktype') || false;
            data.subtype = builder.get(element.data('lm-id')).getSubType() || element.data('lm-blocksubtype') || false;
            data.title = (element.find('h4') || element.find('.title')).text() || data.type || 'Untitled';
            data.options = builder.get(element.data('lm-id')).getAttributes() || {};
            data.inherit = builder.get(element.data('lm-id')).getInheritance() || {};
            data.block = parent && parentType !== 'wrapper' ? builder.get(parent.data('lm-id')).getAttributes() || {} : {};
            data.size_limits = builder.get(element.data('lm-id')).getLimits(!parent ? false : builder.get(parent.data('lm-id')));
            data.parent = section ? section.data('lm-id') : null;

            if (!data.type) { delete data.type; }
            if (!data.subtype) { delete data.subtype; }
            if (!size(data.options)) { delete data.options; }
            if (!size(data.inherit)) { delete data.inherit; }
            if (!size(data.block)) { delete data.block; }
        }

        modal.open({
            content: 'Loading',
            method: 'post',
            data: data,
            overlayClickToClose: false,
            remote: parseAjaxURI(settingsURL + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) {
                    modal.enableCloseByOverlay();
                    return;
                }

                let container = modal.element(content.elements.content),
                    form = container && container.querySelector('form'),
                    submit = container ? container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]') : [],
                    actionForm = form;

                if (!container || !form || !actionForm || !submit.length) { return true; }

                let urlTemplate = container.querySelector('.g-urltemplate');
                if (urlTemplate) { urlTemplate.dispatchEvent(new Event('input', { bubbles: true })); }

                let blockSize = container.querySelector('[name="block[size]"]');

                // logic for limits
                if (blockSize && data.size_limits) {
                    let note = container.querySelector('.blocksize-note'),
                        min = precision(data.size_limits[0], 1),
                        max = precision(data.size_limits[1], 1);

                    blockSize.setAttribute('min', min);
                    blockSize.setAttribute('max', max);

                    if (note) {
                        let noteHTML = note.innerHTML;
                        noteHTML = noteHTML.replace(/#min#/g, min);
                        noteHTML = noteHTML.replace(/#max#/g, max);

                        note.innerHTML = noteHTML;
                        let noteVariant = note.querySelector('.blocksize-' + (min == max ? 'range' : 'fixed'));
                        if (noteVariant) { noteVariant.classList.add('hidden'); }
                    }

                    let isValid = function() {
                        return parseFloat(blockSize.value) >= min && parseFloat(blockSize.value) <= max ? '' : translate('GENESIS_PLATFORM_JS_LM_SIZE_LIMITS_RANGE');
                    };

                    blockSize.addEventListener('input', function(){
                        blockSize.setCustomValidity(isValid());
                    });
                }

                // Particle Settings apply
                submit.forEach(function(target) {
                    target.addEventListener('click', function(e) {
                        e.preventDefault();
                        target.disabled = true;
                        indicator.hide(target);
                        indicator.show(target);

                        // Refresh the form to collect fresh and dynamic fields.
                        let currentForm = container.querySelector('form'),
                            formElements = currentForm ? currentForm.elements : [],
                            post = Submit(formElements, container);

                        if (post.invalid.length) {
                            target.disabled = false;
                            indicator.hide(target);
                            indicator.show(target, 'fa fa-fw fa-exclamation-triangle');
                            reportInvalidFields(post.invalid);
                            return;
                        }

                        request(
                            actionForm.getAttribute('method') || 'post',
                            parseAjaxURI((actionForm.getAttribute('action') || '') + getAjaxSuffix()),
                            post.valid.join('&') || {},
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
                            let particle = builder.get(ID),
                                block = null;

                            // particle attributes
                            particle.setAttributes(response.body.data.options);

                            if (particle.hasAttribute('enabled')) { particle[particle.getAttribute('enabled') ? 'enable' : 'disable'](); }

                            if (particle.getType() !== 'section') {
                                particle.setTitle(response.body.data.title || 'Untitled');
                                particle.updateTitle(particle.getTitle());
                            }

                            if (particle.getType() === 'position') {
                                particle.updateKey();
                            }

                            // parent block attributes
                            if (response.body.data.block && size(response.body.data.block)) {
                                block = builder.get(parentID);

                                let sibling = block.block.nextSibling() || block.block.previousSibling(),
                                    currentSize = block.getSize(),
                                    diffSize;

                                block.setAttributes(response.body.data.block);

                                diffSize = currentSize - block.getSize();

                                block.setAnimatedSize(block.getSize());

                                if (sibling) {
                                    sibling = builder.get(sibling.data('lm-id'));
                                    sibling.setAnimatedSize(parseFloat(sibling.getSize()) + diffSize, true);
                                }
                            }

                            // particle inheritance
                            if (response.body.data.inherit) {
                                delete response.body.data.inherit.section;
                                particle.setInheritance(response.body.data.inherit);

                                particle.enableInheritance();
                                particle.refreshInheritance();
                            }

                            if (response.body.data.children) {
                                layoutmanager.clear(particle.block, { save: false, dropLastGrid: !!response.body.data.children.length, emptyInherits: true });
                                builder.recursiveLoad(response.body.data.children, builder.insert, 0, particle.getId());
                            }

                            if (particle.hasInheritance() && !response.body.data.inherit) {
                                particle.setInheritance({});
                                particle.disableInheritance();
                            }

                            lmhistory.push(builder.serialize(), lmhistory.get().preset);

                            // if it's apply and save we also save the panel
                            if (target.hasAttribute('data-apply-and-save')) {
                                let save = document.querySelector('.button-save');
                                if (save) { save.click(); }
                            }

                            modal.close();

                            toastr.success(translate('GENESIS_PLATFORM_JS_PARTICLE_SETTINGS_APPLIED', particle.getTitle()), translate('GENESIS_PLATFORM_JS_SETTINGS_APPLIED'));
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

    // Row/column layout picker - "+" on a section/offcanvas adds a new row;
    // the per-grid icon (see grid.js) reopens the picker to change an
    // existing row's split. See NUCLEUS_BOOTSTRAP_MIGRATION.md M3.
    body.delegate('click', '.section-addrow', function(event, element) {
        event.preventDefault();

        let section = element.parent('[data-lm-blocktype]');
        if (!section) { return false; }

        let sectionBlock = section[0];
        let lastGrid = sectionBlock.querySelector(':scope > .g-grid:last-child, :scope > [data-lm-blocktype="container"] > .g-grid:last-child');
        if (lastGrid && !lastGrid.querySelector(':scope > [data-lm-blocktype="block"]')) {
            return false;
        }

        let container = dom(sectionBlock.querySelector(':scope > [data-lm-blocktype="container"]')),
            parentId = (container || section).data('lm-id');

        openRowPicker({
            onSelect: function(columns) {
                let grid = builder.insert(undefined, { type: 'grid', subtype: 'grid' }, parentId);
                columns.forEach(function(count) {
                    builder.insert(undefined, {
                        type: 'block',
                        subtype: 'block',
                        attributes: { size: (count / 12) * 100, columns: { xs: count } }
                    }, grid.getId());
                });
                lmhistory.push(builder.serialize(), lmhistory.get().preset);
            }
        });
    });

    // Change an existing row's column split.
    body.delegate('click', '[data-lm-row-layout]', function(event, element) {
        event.preventDefault();

        let grid = element.parent('[data-lm-blocktype="grid"]');
        if (!grid) { return false; }

        let gridId = grid.data('lm-id'),
            blocks = Array.from(grid[0].children).filter(function(child) { return child.getAttribute('data-lm-blocktype') === 'block'; }),
            current = blocks.map(function(child) {
                let mapped = builder.get(child.getAttribute('data-lm-id'));
                if (!mapped) { return 1; }
                return Math.max(1, Math.min(12, parseInt(mapped.getAttribute('columns.xs'), 10) ||
                    Math.round((mapped.getSize() || 0) / 100 * 12)));
            });

        openRowPicker({
            current: current,
            onSelect: function(columns) {
                let hasContent = blocks.some(function(child) { return child.querySelector('[data-lm-id]'); });

                if (columns.length !== blocks.length && hasContent &&
                    !window.confirm(translate('GENESIS_PLATFORM_JS_LM_ROW_CHANGE_LAYOUT_CONFIRM'))) {
                    return;
                }

                // Update the columns that survive so their content and IDs
                // remain intact. `size` stays during the M3 transition while
                // `columns.xs` becomes the canonical Bootstrap span.
                blocks.slice(0, columns.length).forEach(function(child, index) {
                    let mapped = builder.get(child.getAttribute('data-lm-id'));
                    if (mapped) {
                        mapped.setAttribute('columns.xs', columns[index]);
                        mapped.setSize((columns[index] / 12) * 100, true);
                    }
                });

                if (columns.length > blocks.length) {
                    columns.slice(blocks.length).forEach(function(count) {
                        builder.insert(undefined, {
                            type: 'block',
                            subtype: 'block',
                            attributes: { size: (count / 12) * 100, columns: { xs: count } }
                        }, gridId);
                    });
                } else if (columns.length < blocks.length) {
                    blocks.slice(columns.length).forEach(function(child) {
                        child.querySelectorAll('[data-lm-id]').forEach(function(descendant) {
                            builder.remove(descendant.getAttribute('data-lm-id'));
                        });
                        let mapped = builder.get(child.getAttribute('data-lm-id'));
                        if (mapped) { builder.remove(mapped); }
                        child.remove();
                    });
                }

                lmhistory.push(builder.serialize(), lmhistory.get().preset);
            }
        });
    });

});

export default {
    dom: dom,
    builder: builder,
    // LayoutManager is created in the DOM-ready callback above. Expose it
    // through a getter so default-import consumers receive the live instance
    // instead of the undefined value captured while this module is evaluated.
    get layoutmanager() { return layoutmanager; },
    history: lmhistory,
    savestate: savestate
};

export { layoutmanager };
