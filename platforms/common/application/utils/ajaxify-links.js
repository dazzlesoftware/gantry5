import __module0 from './dom.js';
import __module1 from '../ui/index.js';
import __module2 from '../ui/selectize.js';
import __module3 from './indicator.js';
import __module4 from './request.js';
import __module5 from './history.js';
import __module6 from './flags-state.js';
import __module7 from './get-ajax-url.js';
import __module8 from './get-ajax-suffix.js';
import __module9 from '../menu/index.js';
import '../lm/index.js';

"use strict";

let dom           = __module0,
    storage       = new Map(),
    modal         = __module1.modal,
    Selectize     = __module2,
    indicator     = __module3,
    request       = __module4(),
    History       = __module5,
    flags         = __module6,
    parseAjaxURI  = __module7.parse,
    getAjaxSuffix = __module8,
    mm            = __module9;


let ERROR = false,
    TMP_SELECTIZE_DISABLE = false,
    ConfNavIndex = -1;

let asElement = function(element) {
    return element && element.nodeType ? element : element && element[0];
};

let guid = function() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(character) {
        let random = Math.floor(Math.random() * 16),
            value = character === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};

let getParam = function(uri, name) {
    return new URL(uri, window.location.href).searchParams.get(name);
};

let setParam = function(uri, name, value) {
    let url = new URL(uri, window.location.href),
        isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(uri);
    url.searchParams.set(name, value);
    return isAbsolute ? url.href : url.pathname + url.search + url.hash;
};

let toQueryString = function(parameters) {
    let query = new URLSearchParams();
    Object.keys(parameters || {}).forEach(function(key) {
        let values = Array.isArray(parameters[key]) ? parameters[key] : [parameters[key]];
        values.forEach(function(value) { query.append(key, value); });
    });
    return query.toString() ? '?' + query.toString() : '';
};

let dispatchState = function(type, element, data) {
    let source = asElement(element),
        target = type === 'statechangeAfter' ? document.body : (source || document.body);
    target.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        detail: { target: source || target, Data: data }
    }));
};

let showNavbar = function(navbar, visible) {
    if (!navbar) { return; }
    navbar.hidden = false;
    navbar.style.display = '';
    let from = getComputedStyle(navbar).opacity;
    let reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animation = navbar.animate(
        [{ opacity: from }, { opacity: visible ? 1 : 0 }],
        { duration: reducedMotion ? 0 : 180, easing: 'ease', fill: 'forwards' }
    );
    animation.finished.catch(function(error) {
        if (error.name !== 'AbortError') console.warn('Navbar animation failed.', error);
    }).then(function() {
        animation.cancel();
        navbar.style.opacity = '';
        navbar.hidden = !visible;
    });
};

let setButtonsDisabled = function(buttons, disabled) {
    buttons.filter(Boolean).forEach(function(button) { button.disabled = disabled; });
};

let warningButtons = function(content) {
    content = modal.element(content);
    return {
        save: content && content.querySelector('[data-g-unsaved-save]'),
        discard: content && content.querySelector('[data-g-unsaved-discard]')
    };
};

let clickWithSpinner = function(element, spinner) {
    element = asElement(element);
    if (!element) { return; }
    let event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    event.activeSpinner = asElement(spinner);
    element.dispatchEvent(event);
};

let selectorChangeEvent = function() {
    document.querySelectorAll('[data-selectize-ajaxify]').forEach(function(selector) {
        Selectize.initialize([selector]);
        let selectize = Selectize.getInstance(selector);
        if (!selectize || selectize.HasChangeEvent) { return; }

        selectize.on('change', function() {
            if (TMP_SELECTIZE_DISABLE) {
                TMP_SELECTIZE_DISABLE = false;
                return;
            }

            let value = selectize.getValue(),
                options = selectize.Options;
            if (!options[value]) { return; }

            let flagCallback = function() {
                flags.off('update:pending', flagCallback);
                modal.close();

                let input = asElement(selectize.input);
                input.setAttribute('data-genesis-ajaxify', '');
                input.setAttribute('data-genesis-ajaxify-target', selector.getAttribute('data-genesis-ajaxify-target') || '[data-genesis-content-wrapper]');
                let targetParent = selector.getAttribute('data-genesis-ajaxify-target-parent');
                if (targetParent) { input.setAttribute('data-genesis-ajaxify-target-parent', targetParent); }
                else { input.removeAttribute('data-genesis-ajaxify-target-parent'); }
                input.setAttribute('data-genesis-ajaxify-href', options[value].url);
                if (options[value].params) {
                    input.setAttribute('data-genesis-ajaxify-params', JSON.stringify(options[value].params));
                } else {
                    input.removeAttribute('data-genesis-ajaxify-params');
                }

                let active = document.querySelector('#navbar li.active, #main-header li.active, #navbar li:nth-child(2)');
                if (active) { indicator.show(active); }
                clickWithSpinner(input, active);
            };

            if (flags.get('pending')) {
                flags.warning({
                    callback: function(response, content) {
                        let buttons = warningButtons(content);
                        if (!buttons.save) { return; }

                        buttons.save.addEventListener('click', function(event) {
                            event.preventDefault();
                            if (buttons.save.disabled) { return; }
                            setButtonsDisabled([buttons.save, buttons.discard], true);
                            flags.on('update:pending', flagCallback);
                            let save = document.querySelector('.button-save');
                            if (save) { save.click(); }
                        });
                        if (buttons.discard) {
                            buttons.discard.addEventListener('click', function(event) {
                                event.preventDefault();
                                if (buttons.discard.disabled) { return; }
                                setButtonsDisabled([buttons.save, buttons.discard], true);
                                flags.set('pending', false);
                                flagCallback();
                            });
                        }
                    },
                    afterclose: function() {
                        TMP_SELECTIZE_DISABLE = true;
                        selectize.setValue(selectize.getPreviousValue());
                    }
                });
                return;
            }
            flagCallback();
        });
        selectize.HasChangeEvent = true;
    });
};

History.Adapter.bind(window, 'statechange', function() {
    if (request.running()) { return false; }

    let body = document.body,
        State = History.getState(),
        URI = State.url,
        Data = State.data || {},
        sidebar = document.querySelector('#navbar'),
        mainheader = document.querySelector('#main-header'),
        params = '';

    if (Data.doNothing) { return true; }
    if (Object.keys(Data).length && Data.parsed !== false && storage.has(Data.uuid)) {
        Data = storage.get(Data.uuid);
    }

    Data.element = asElement(Data.element);
    let isTopNavOrMenu = false;
    if (Data.element) {
        isTopNavOrMenu = Boolean(Data.element.closest('#main-header') || Data.element.matches('.menu-select-wrap'));
        dispatchState('statechangeBefore', Data.element, Data);
    } else {
        let url = URI.replace(window.location.origin, '');
        Data.element = Array.from(document.querySelectorAll('[href]')).find(function(link) {
            return link.getAttribute('href') === url;
        }) || null;
    }

    URI = parseAjaxURI(URI + getAjaxSuffix());

    if (sidebar && Data.element) {
        sidebar.querySelectorAll('li.active').forEach(function(item) { item.classList.remove('active'); });
        if (Data.element.closest('#navbar')) {
            let sideItem = Data.element.closest('li');
            if (sideItem) { sideItem.classList.add('active'); }
        }
    }

    if (mainheader && Data.element && !Data.element.matches('a.menu-item, select.menu-select-wrap')) {
        mainheader.querySelectorAll('.float-right li').forEach(function(item) { item.classList.remove('active'); });
        if (Data.element.closest('#main-header')) {
            let headerItem = Data.element.closest('li');
            if (headerItem) { headerItem.classList.add('active'); }
        }
    }

    if (Data.params) {
        params = toQueryString(JSON.parse(Data.params));
        if (URI.includes('?')) { params = params.replace(/^\?/, '&'); }
    }

    if (!ERROR) { modal.closeAll(); }
    request.url(URI + params).data(Data.extras || {}).method(Data.extras ? 'post' : 'get').send(function(error, response) {
        let result = response && response.body;
        if (!result || !result.success) {
            if (!ERROR) {
                ERROR = true;
                modal.open({ content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.') });
                History.back();
            } else {
                ERROR = false;
            }
            if (Data.element) { indicator.hide(Data.element); }
            return false;
        }

        let target = Data.parent && Data.element ? Data.element.closest(Data.parent) :
                (Data.target ? document.querySelector(Data.target) : null),
            destination = target || document.querySelector('[data-genesis-content]') || body;

        document.dispatchEvent(new CustomEvent('genesis:content-replacing'));
        destination.innerHTML = result.html || result;
        let fader = destination.matches('[data-genesis-content]') ? destination : destination.querySelector('[data-genesis-content]');
        if (fader) {
            fader.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease' });
            if (isTopNavOrMenu && sidebar) {
                sidebar.setAttribute('tabindex', '-1');
                sidebar.setAttribute('aria-hidden', 'true');
            }
            showNavbar(sidebar, !isTopNavOrMenu);
        }

        if (Data.element) { dispatchState('statechangeAfter', Data.element, Data); }

        let spinner = (Data.event && Data.event.activeSpinner) || Data.element;
        if (spinner) { indicator.hide(spinner); }

        Selectize.initialize(document.querySelectorAll('[data-selectize]'));
        selectorChangeEvent();
        body.dispatchEvent(new CustomEvent('statechangeEnd', { bubbles: true }));
    });
});

dom.ready(function() {
    let body = document.body;

    if (window.GENESIS_AJAX_NONCE) {
        let currentURI = History.getPageUrl(),
            currentNonce;
        if (window.GENESIS_PLATFORM === 'wordpress') {
            currentNonce = getParam(currentURI, '_wpnonce');
            if (currentNonce !== window.GENESIS_AJAX_NONCE) {
                currentURI = setParam(currentURI, '_wpnonce', window.GENESIS_AJAX_NONCE);
                History.replaceState({ uuid: guid(), doNothing: true }, document.title, currentURI);
            }
        } else if (window.GENESIS_PLATFORM === 'grav') {
            currentNonce = getParam(currentURI, 'nonce');
            if (currentNonce !== window.GENESIS_AJAX_NONCE) {
                currentURI = setParam(currentURI, 'nonce', window.GENESIS_AJAX_NONCE);
                History.replaceState({ uuid: guid(), doNothing: true }, document.title, currentURI);
            }
        }
    }

    dom.delegate(body, 'click', '.button-back-to-conf', function(event, element) {
        event.preventDefault();
        let confSelector = document.querySelector('#configuration-selector'),
            outlineDeleted = body.outlineDeleted,
            currentOutline = confSelector && confSelector.value,
            navbar = document.querySelector('#navbar');
        if (!confSelector || !navbar) { return; }

        ConfNavIndex = ConfNavIndex === -1 ? 1 : ConfNavIndex;
        let item = navbar.querySelector('li:nth-child(' + (ConfNavIndex + 1) + ') [data-genesis-ajaxify]');
        if (!item) { return; }

        let continueBack = function() {
            flags.off('update:pending', continueBack);
            modal.close();
            item.click();
            navbar.removeAttribute('tabindex');
            navbar.setAttribute('aria-hidden', 'false');
            showNavbar(navbar, true);
        };

        if (flags.get('pending')) {
            flags.warning({
                callback: function(response, content) {
                    let buttons = warningButtons(content);
                    if (!buttons.save) { return; }
                    buttons.save.addEventListener('click', function(saveEvent) {
                        saveEvent.preventDefault();
                        if (buttons.save.disabled) { return; }
                        setButtonsDisabled([buttons.save, buttons.discard], true);
                        flags.on('update:pending', continueBack);
                        let save = document.querySelector('.button-save');
                        if (save) { save.click(); }
                    });
                    if (buttons.discard) {
                        buttons.discard.addEventListener('click', function(discardEvent) {
                            discardEvent.preventDefault();
                            if (buttons.discard.disabled) { return; }
                            setButtonsDisabled([buttons.save, buttons.discard], true);
                            flags.set('pending', false);
                            continueBack();
                        });
                    }
                }
            });
            return;
        }

        indicator.show(element);
        if (outlineDeleted == currentOutline) {
            let selectize = Selectize.getInstance(confSelector),
                ids = selectize ? Object.keys(selectize.Options) : [],
                id = ids.shift();
            body.outlineDeleted = null;
            if (id) {
                item.href = item.href.replace('/' + outlineDeleted + '/', '/' + id + '/').replace('style=' + outlineDeleted, 'style=' + id);
            }
        }
        item.click();
        navbar.removeAttribute('tabindex');
        showNavbar(navbar, true);
    });

    dom.delegate(body, 'click', '#navbar a[data-genesis-ajaxify]', function(event, element) {
        let links = document.querySelectorAll('#navbar li a[data-genesis-ajaxify]');
        ConfNavIndex = Array.from(links).indexOf(element) + 1;
    });

    dom.delegate(body, 'click', '[data-genesis-ajaxify]', function(event, element) {
        if (event.which === 2 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) { return; }
        event.preventDefault();

        let replay = function() {
            flags.off('update:pending', replay);
            modal.close();
            element.click();
        };

        if (flags.get('pending') && !element.matches('a.menu-item') && !element.closest('[data-menu-items]')) {
            flags.warning({
                callback: function(response, content) {
                    let buttons = warningButtons(content);
                    if (!buttons.save) { return; }
                    buttons.save.addEventListener('click', function(saveEvent) {
                        saveEvent.preventDefault();
                        if (buttons.save.disabled) { return; }
                        setButtonsDisabled([buttons.save, buttons.discard], true);
                        flags.on('update:pending', replay);
                        let save = document.querySelector('.button-save');
                        if (save) { save.click(); }
                    });
                    if (buttons.discard) {
                        buttons.discard.addEventListener('click', function(discardEvent) {
                            discardEvent.preventDefault();
                            if (buttons.discard.disabled) { return; }
                            setButtonsDisabled([buttons.save, buttons.discard], true);
                            flags.set('pending', false);
                            replay();
                        });
                    }
                }
            });
            return;
        }

        indicator.show(element);
        let rawData = element.getAttribute('data-genesis-ajaxify'),
            target = element.getAttribute('data-genesis-ajaxify-target'),
            parent = element.getAttribute('data-genesis-ajaxify-target-parent'),
            url = element.getAttribute('href') || element.getAttribute('data-genesis-ajaxify-href'),
            params = element.getAttribute('data-genesis-ajaxify-params') || false,
            title = element.getAttribute('title') || document.title,
            data = rawData ? JSON.parse(rawData) : { parsed: false };

        if (data) {
            let uuid = guid(),
                extras;
            if (element.hasAttribute('data-mm-id') || element.closest('[data-mm-id]')) {
                let menuSelect = document.querySelector('select.menu-select-wrap'),
                    manager = mm.menumanager;
                if (manager) {
                    extras = {
                        menutype: menuSelect ? menuSelect.value : '',
                        settings: JSON.stringify(manager.settings),
                        ordering: JSON.stringify(manager.ordering),
                        items: JSON.stringify(manager.items)
                    };
                }
            }

            storage.set(uuid, Object.assign({}, data, {
                target: target,
                parent: parent,
                element: element,
                params: params,
                extras: extras,
                event: event
            }));
            data = { uuid: uuid };
        }

        History.pushState(data, title, url);
        let navbar = element.closest('#navbar, #main-header');
        if (navbar) {
            document.querySelectorAll('#navbar .active, #main-header .active').forEach(function(active) {
                active.classList.remove('active');
            });
            let item = element.closest('li');
            if (item) { item.classList.add('active'); }
        }
    });

    selectorChangeEvent();
});

export default {};
