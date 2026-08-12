import __module0 from './utils/dom-collection.js';
import __module1 from './utils/create-element.js';
import __module2 from './utils/dom.js';
import __module3 from './utils/request.js';
import __module4 from './ui/index.js';
import __module5 from './utils/get-ajax-url.js';
import __module6 from './utils/get-ajax-suffix.js';
import __module7 from './utils/flags-state.js';
import __module8 from './utils/field-validation.js';
import __module9 from './lm/index.js';
import __module10 from './menu/index.js';
import __module11 from './positions/cards.js';
import __module12 from './configurations/index.js';
import __module13 from './positions/index.js';
import __module14 from './changelog/index.js';
import __module15 from './utils/translate.js';
import './fields/index.js';
import './ui/popover.js';
import './utils/ajaxify-links.js';
import __module19 from './assignments/index.js';
import __module20 from './styles/index.js';
import __module21 from './particles/index.js';
import __module22 from './pagesettings/index.js';
import __module23 from './ui/tooltips.js';

"use strict";
let dom              = __module0,
    zen            = __module1,
    ready          = __module2.ready,
    request        = __module3,
    ui             = __module4,
    modal          = ui.modal,
    toastr         = ui.toastr,

    parseAjaxURI   = __module5.parse,
    getAjaxURL     = __module5.global,
    getAjaxSuffix  = __module6,

    flags          = __module7,
    validateField  = __module8,
    lm             = __module9,
    mm             = __module10,
    pm             = __module11,
    configurations = __module12,
    positions      = __module13,
    changelog      = __module14,
    translate      = __module15;




let trim = function(value, characters) {
    let string = value == null ? '' : String(value);
    if (!characters) { return string.trim(); }

    let escaped = String(characters).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return string.replace(new RegExp('^[' + escaped + ']+|[' + escaped + ']+$', 'g'), '');
};

let interpolate = function(template, replacements) {
    return String(template == null ? '' : template).replace(/\{\{([^}]+)}}/g, function(match, path) {
        let value = path.split('.').reduce(function(current, key) {
            return current == null ? undefined : current[key];
        }, replacements);

        return value == null ? '' : String(value);
    });
};

let setParam = function(uri, name, value) {
    let url = new URL(uri, window.location.href),
        isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(uri);

    url.searchParams.set(name, value);

    return isAbsolute ? url.href : url.pathname + url.search + url.hash;
};

let createHandler = function(divisor, noun, restOfString) {
    return function(diff) {
        let n = Math.floor(diff / divisor);
        let pluralizedNoun = noun + ( n > 1 ? 's' : '' );
        return "" + n + " " + pluralizedNoun + " " + restOfString;
    }
};

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
        first.addEventListener('input', function clearInvalid() {
            first.classList.remove('field-invalid');
            first.removeAttribute('aria-invalid');
        }, { once: true });
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first.focus({ preventScroll: true });
    }

    let message = translate('GENESIS_PLATFORM_JS_REVIEW_FIELDS');
    if (fields.length) { message += '<br><strong>' + fields.join(', ') + '</strong>'; }
    toastr.error(message, translate('GENESIS_PLATFORM_JS_INVALID_FIELDS'));
};

let formatters = [
    { threshold: -31535999, handler: createHandler(-31536000,	"year",     "from now" ) },
    { threshold: -2591999, 	handler: createHandler(-2592000,  	"month",    "from now" ) },
    { threshold: -604799,  	handler: createHandler(-604800,   	"week",     "from now" ) },
    { threshold: -172799,   handler: createHandler(-86400,    	"day",      "from now" ) },
    { threshold: -86399,   	handler: function(){ return      	"tomorrow" } },
    { threshold: -3599,    	handler: createHandler(-3600,     	"hour",     "from now" ) },
    { threshold: -59,     	handler: createHandler(-60,       	"minute",   "from now" ) },
    { threshold: -0.9999,   handler: createHandler(-1,			"second",   "from now" ) },
    { threshold: 1,        	handler: function(){ return      	"just now" } },
    { threshold: 60,       	handler: createHandler(1,        	"second",	"ago" ) },
    { threshold: 3600,     	handler: createHandler(60,       	"minute",	"ago" ) },
    { threshold: 86400,    	handler: createHandler(3600,     	"hour",     "ago" ) },
    { threshold: 172800,   	handler: function(){ return      	"yesterday" } },
    { threshold: 604800,   	handler: createHandler(86400,    	"day",      "ago" ) },
    { threshold: 2592000,  	handler: createHandler(604800,   	"week",     "ago" ) },
    { threshold: 31536000, 	handler: createHandler(2592000,  	"month",    "ago" ) },
    { threshold: Infinity, 	handler: createHandler(31536000, 	"year",     "ago" ) }
];

let prettyDate = {
    format: function(date) {
        let diff = (((new Date()).getTime() - date.getTime()) / 1000);
        for (let i = 0; i < formatters.length; i++) {
            if (diff < formatters[i].threshold) {
                return formatters[i].handler(diff);
            }
        }
        throw new Error("exhausted all formatter options, none found"); //should never be reached
    }
};

window.onbeforeunload = function() {
    if (flags.get('pending')) {
        return translate('GENESIS_PLATFORM_JS_NO_SAVE_DETECTED');
    }
};

ready(function() {
    let body     = dom('body'),
        sentence = translate('GENESIS_PLATFORM_JS_SAVE_SUCCESS');

    let applyAdminTheme = function(mode) {
        let dark = mode === 'dark', container = document.querySelector('[data-genesis-container]');
        if (container) { container.classList.toggle('genesis-dark-mode', dark); }
        document.body.classList.toggle('genesis-dark-mode', dark);
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
        document.querySelectorAll('[data-g-admin-theme]').forEach(function(toggle) {
            let checkbox = toggle.querySelector('.enabler'), input = toggle.querySelector('[name="admin_color_mode"]'), icon = toggle.querySelector('.fa');
            if (checkbox) { checkbox.setAttribute('aria-checked', dark ? 'true' : 'false'); }
            if (input) { input.value = dark ? '1' : '0'; }
            if (icon) {
                icon.classList.toggle('fa-moon', !dark);
                icon.classList.toggle('fa-sun', dark);
            }
        });
    };
    let adminTheme = 'light';
    try { adminTheme = window.localStorage.getItem('genesis-admin-color-mode') || 'light'; } catch (error) {}
    applyAdminTheme(adminTheme);

    body.delegate('change', '[data-g-admin-theme] [name="admin_color_mode"]', function(event, element) {
        let input = element[0] || element, mode = input.value === '1' ? 'dark' : 'light';
        try { window.localStorage.setItem('genesis-admin-color-mode', mode); } catch (error) {}
        applyAdminTheme(mode);
    });

    body.delegate('click', '[data-g-extras]', function() {
        setTimeout(function() {
            let container = document.querySelector('[data-genesis-container]');
            applyAdminTheme(container && container.classList.contains('genesis-dark-mode') ? 'dark' : 'light');
        }, 0);
    });

    // Close notification
    body.delegate('click', '[data-g-close]', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }
        let parent = element.data('g-close');
        parent = parent ? element.parent(parent) : element;

        parent.slideUp(function() {
            parent.remove();
        });
    });

    // Generic Popovers
    body.delegate('click', '[data-g-popover]', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }

        if (!element.PopoverDefined) {
            let content = element.find('[data-popover-content]') || element.siblings('[data-popover-content]'),
                popover = element.getPopover({
                    style: element.data('g-popover-style') || 'generic',
                    width: element.data('g-popover-width') || 220,
                    content: zen('ul').html(content.html())[0].outerHTML,
                    allowElementsClick: element.data('g-popover-elementsclick') || '.toggle'
                });
            element.on('shown.popover', function(popover){
                let enabler = element.find('.enabler');
                element.attribute('aria-expanded', true);

                if (enabler) {
                    enabler[0].focus();
                }
            });

            element.on('hide.popover', function(popover){
                element.attribute('aria-expanded', false);
            });

            element.getPopover().show();
        }
    });

    // Platform Settings redirect
    body.delegate('mousedown', '[data-settings-key]', function(event, element) {
        let key = element.data('settings-key');
        if (!key) { return true; }

        let redirect = window.location.search,
            settings = element.attribute('href'),
            uri      = window.location.href.split('?');
        if (uri.length > 1 && uri[0].match(/index.php$/)) { redirect = 'index.php' + redirect; }

        redirect = setParam(settings, key, btoa(redirect));
        element.href(redirect);
    });

    // Save Tooltip
    body.delegate('mouseover', '.button-save', function(event, element) {
        if (!element.lastSaved) { return true; }
        let feedback = translate('GENESIS_PLATFORM_LAST_SAVED') + ': ' + prettyDate.format(element.lastSaved);
        element
            .data('tip', feedback)
            .data('title', feedback);
    });

    // Save
    body.delegate('click', '.button-save', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }
        let saves = dom('.button-save');

        if (saves.disabled()) {
            return false;
        }

        saves.disabled(true);
        saves.hideIndicator();
        saves.showIndicator();

        let data    = {},
            invalid = [],
            type    = element.data('save'),
            extras  = '',
            page    = dom('[data-lm-root]') ? 'layout' : (dom('[data-mm-id]') ? 'menu' : (dom('[data-genesis-position]') ? 'positions' : 'other')),
            saveURL = parseAjaxURI(trim(window.location.href, '#') + getAjaxSuffix());

        switch (page) {
            case 'layout':
                let preset = dom('[data-lm-preset]');
                lm.layoutmanager.singles('cleanup', lm.builder, false);
                lm.savestate.setSession(lm.builder.serialize(null, true));

                data.preset = preset && preset.data('lm-preset') ? preset.data('lm-preset') : 'default';

                let layout = JSON.stringify(lm.builder.serialize());

                // base64 encoding doesn't quite work with mod_security
                // data.layout = btoa ? btoa(encodeURIComponent(layout)) : layout;

                data.layout = layout;
                break;

            case 'menu':
                if (!mm.menumanager) {
                    saves.disabled(false);
                    saves.hideIndicator();
                    toastr.error('The Menu Editor is not ready. Please reload the page and try again.', 'Unable to save menu');
                    return;
                }
                data.menutype = dom('select.menu-select-wrap').value();
                data.settings = JSON.stringify(mm.menumanager.settings);
                data.ordering = JSON.stringify(mm.menumanager.ordering);

                let items = JSON.stringify(mm.menumanager.items);

                // base64 encoding doesn't quite work with mod_security
                // data.items = btoa ? btoa(encodeURIComponent(items)) : items;

                data.items = items;

                saveURL = parseAjaxURI(element.parent('form').attribute('action') + getAjaxSuffix());
                break;

            case 'positions':
                data.positions = pm.serialize();
                break;

            case 'other':
            default:
                let form = element.parent('form');

                if (form && element.attribute('type') == 'submit') {
                    dom(form[0].elements).forEach(function(input) {
                        input = dom(input);
                        let name     = input.attribute('name'),
                            type     = input.attribute('type'),
                            value    = input.value(),
                            parent   = input.parent('.settings-param, .card-overrideable'),
                            override = parent ? parent.find('> input[type="checkbox"]') : null;

                        override = override || dom(input.data('override-target'));

                        if (!name || input.disabled() || (override && !override.checked()) || (type == 'radio' && !input.checked())) { return; }
                        if (!validateField(input)) { invalid.push(input); }
                        data[name] = value;
                    });
                }
        }

        if (invalid.length) {
            saves.disabled(false);
            saves.hideIndicator();
            saves.showIndicator('fa fa-fw fa-exclamation-triangle');
            reportInvalidFields(invalid);
            return;
        }

        if (page == 'other') { dom('.settings-param-title, .card.settings-block > h4').hideIndicator(); }
        body[0].dispatchEvent(new CustomEvent('updateOriginalFields'));

        request('post', saveURL, data, function(error, response) {
            if (!response.body.success) {
                modal.open({
                    content: response.body.html || response.body.message || response.body,
                    afterOpen: function(container) {
                        container = modal.element(container);
                        if (container && !response.body.html && !response.body.message) { container.style.width = '90%'; }
                    }
                });
            } else {
                modal.close();

                if (dom('#styles')) {
                    extras = '<br />' + (response.body.warning ? '<hr />' + response.body.title + '<br />' + response.body.html : translate('GENESIS_PLATFORM_JS_CSS_COMPILED'));
                }

                toastr[response.body.warning ? 'warning' : 'success'](interpolate(sentence, {
                    verb: type.slice(-1) == 's' ? 'have' : 'has',
                    type: type,
                    extras: extras
                }), type + ' ' + translate('GENESIS_PLATFORM_SAVED'));
            }

            saves.disabled(false);
            saves.hideIndicator();
            saves.forEach(function(save) {
                dom(save).lastSaved = new Date();
            });

            if (page == 'layout') { lm.layoutmanager.updatePendingChanges(); }

            // all good, disable 'pending' flag
            flags.set('pending', false);
            flags.emit('update:pending');
        });
    });

    // Editable titles
    body.delegate('keydown', '[data-title-edit]', function(event, element) {
        let key = (event.which ? event.which : event.keyCode);
        if (key == 32 || key == 13) { // ARIA support: Space / Enter toggle
            event.preventDefault();
            body.emit('click', event);
        }
    });

    body.delegate('click', '[data-title-edit]', function(event, element) {
        element = dom(element);
        if (element.hasClass('disabled')) { return false; }

        let $title = element.siblings('[data-title-editable]') || element.previousSiblings().find('[data-title-editable]') || element.nextSiblings().find('[data-title-editable]'), title;
        if (!$title) { return true; }

        title = $title[0];
        $title.text(trim($title.text()));

        $title.attribute('contenteditable', true);
        title.focus();

        let range = document.createRange(), selection;
        range.selectNodeContents(title);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        $title.storedTitle = trim($title.text());
        $title.titleEditCanceled = false;
        $title.emit('title-edit-start', $title.storedTitle);
        $title[0].dispatchEvent(new CustomEvent('genesis:title-edit-start', {
            bubbles: true,
            detail: { title: $title.storedTitle }
        }));
    });

    body.delegate('keydown', '[data-title-editable]', function(event, element) {
        element = dom(element);
        switch (event.keyCode) {
            case 13: // return
            case 27: // esc
                event.stopPropagation();

                if (event.keyCode == 27) {
                    if (typeof element.storedTitle !== 'undefined') {
                        element.text(element.storedTitle);
                        element.titleEditCanceled = true;
                    }
                }

                element.attribute('contenteditable', null);
                element[0].blur();

                let exitTitle = element.data('title-editable'),
                    exitKey = event.keyCode == 13 ? 'enter' : 'esc';
                element.emit('title-edit-exit', exitTitle, exitKey);
                element[0].dispatchEvent(new CustomEvent('genesis:title-edit-exit', {
                    bubbles: true,
                    detail: { title: exitTitle, key: exitKey }
                }));
                return false;
            default:
                return true;
        }
    });

    body.delegate('blur', '[data-title-editable]', function(event, element) {
        element = dom(element);
        element[0].scrollLeft = 0;
        element.attribute('contenteditable', null);
        element.data('title-editable', trim(element.text()));
        window.getSelection().removeAllRanges();
        let title = element.data('title-editable'),
            original = element.storedTitle,
            canceled = element.titleEditCanceled;
        element.emit('title-edit-end', title, original, canceled);
        element[0].dispatchEvent(new CustomEvent('genesis:title-edit-end', {
            bubbles: true,
            detail: {
                title: title,
                original: original,
                canceled: canceled
            }
        }));
    }, true);

    // Quick Ajax Calls [data-ajax-action]
    body.delegate('click', '[data-ajax-action]', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }

        let href      = element.attribute('href') || element.data('ajax-action'),
            method    = element.data('ajax-action-method') || 'post',
            indicator = dom(element.data('ajax-action-indicator')) || element;

        if (!href) { return false; }

        let extras = dom('[data-g-extras]');
        if (extras && extras[0].PopoverDefined) {
            extras.getPopover().hide();
        }

        indicator.showIndicator();
        request(method, parseAjaxURI(href + getAjaxSuffix()), function(error, response) {
            if (!response.body.success) {
                modal.open({
                    content: response.body.html || response.body.message || response.body,
                    afterOpen: function(container) {
                        container = modal.element(container);
                        if (container && !response.body.html && !response.body.message) { container.style.width = '90%'; }
                    }
                });

                indicator.hideIndicator();
                return false;
            } else {
                toastr[response.body.warning ? 'warning' : 'success'](response.body.html || 'Action successfully completed.', response.body.title || '');
            }

            indicator.hideIndicator();
        });
    }, true);
});

let modules = {
    lm: lm,
    mm: mm,
    assingments: __module19,
    ui: __module4,
    styles: __module20,
    dom: dom,
    domready: ready,
    particles: __module21,
    zen: zen,
    atoms: __module22,
    tips: __module23
};

// Genesis is the canonical administrator API. Genesis remains an identity alias
// during the compatibility period.
window.Genesis = modules;
export default modules;
