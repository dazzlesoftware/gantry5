import __module0 from '../../utils/dom.js';
import __module1 from '../../utils/indicator.js';
import __module2 from '../../utils/request.js';
import __module3 from '../../ui/index.js';
import __module4 from '../../ui/selectize.js';
import __module5 from '../../utils/get-ajax-suffix.js';
import __module6 from '../../utils/get-ajax-url.js';
import __module7 from '../../utils/get-outline.js';

"use strict";

var dom                = __module0,
    ready              = dom.ready,
    delegate           = dom.delegate,
    indicator          = __module1,
    request            = __module2,
    modal              = __module3.modal,
    Selectize          = __module4,

    getAjaxSuffix      = __module5,
    parseAjaxURI       = __module6.parse,
    getAjaxURL         = __module6.global,
    getCurrentOutline  = __module7.getCurrentOutline;


var IDsMap = {
    attributes: ['g-settings-particle', 'g-settings-atom'],
    block: { panel: 'g-settings-block-attributes', tab: 'g-settings-block' },
    particles: 'g-inherit-particle',
    atoms: 'g-inherit-atom'
};

var asElement = function(element) {
        return element && element.nodeType ? element : element && element[0];
    },
    collectionContains = function(collection, value) {
        if (Array.isArray(collection) || typeof collection === 'string') {
            return collection.includes(value);
        }

        return collection && typeof collection === 'object' ? Object.values(collection).includes(value) : false;
    },
    emitChange = function(element, options) {
        element = asElement(element);
        if (!element) { return; }

        var event = new Event('change', {bubbles: true});
        Object.assign(event, options || {});
        element.dispatchEvent(event);
    },
    getModalContainer = function() {
        return asElement(modal.getByID(modal.getLast()));
    },
    getMode = function(root) {
        return (root || document).querySelector('[name="inherit[mode]"]:checked');
    },
    getSelectedItem = function(root) {
        return (root || document).querySelector(
            '[name="inherit[particle]"]:checked, [name="inherit[atom]"]:checked'
        );
    };

ready(function() {
    var body             = document.body,
        currentSelection = {},
        currentMode      = {};

    delegate(body, 'change', '[name="inherit[outline]"]', function(event, element) {
        var settingsParam = element.closest('.settings-param'),
            label         = settingsParam && settingsParam.querySelector('.settings-param-title'),
            text          = settingsParam && settingsParam.querySelector('.g-item'),
            value         = element.value,
            section       = document.querySelector('[name="inherit[section]"]'),
            name          = section ? section.value : '',
            form          = element.closest('[data-g-inheritance-settings]'),
            includesFields = Array.from(document.querySelectorAll(
                '[data-multicheckbox-field="inherit[include]"]:checked'
            )),
            mode          = getMode(form),
            checked       = getSelectedItem(form),
            particle      = {
                list: document.querySelector('#g-inherit-particle, #g-inherit-atom'),
                mode: mode,
                radios: form && form.querySelector(
                    '[name="inherit[particle]"], [name="inherit[atom]"]'
                ),
                checked: checked
            };

        if (!text || !form || !mode) { return true; }

        var hasChanged = currentSelection[name] !== value || currentMode[name] !== mode.value;

        if (hasChanged && !value) {
            includesFields.forEach(function(include) {
                include.checked = false;
                emitChange(include);
            });
        }

        var formData = JSON.parse(form.dataset.gInheritanceSettings || '{}'),
            data     = {
                outline: value || getCurrentOutline(),
                type: formData.type || '',
                subtype: formData.subtype || '',
                mode: mode.value,
                inherit: !!value && mode.value === 'inherit' ? '1' : '0'
            };

        data.id = formData.id;

        indicator.show(label);
        var selectize = Selectize.getInstance(element);
        if (selectize) { selectize.blur(); }

        if (particle.radios && checked && !hasChanged) {
            data.selected = checked.value;
            data.id = checked.value;
            particle.list = false;
        }

        var URI_mode = data.type === 'atom' ? 'atoms' : 'layouts',
            URI      = particle.list ? URI_mode + '/list' : URI_mode;

        request('POST', parseAjaxURI(getAjaxURL(URI) + getAjaxSuffix()), data, function(error, response) {
            indicator.hide(label);

            if (!response.body.success) {
                modal.open({
                    content: response.body.html || response.body.message || response.body,
                    afterOpen: function(container) {
                        container = asElement(container);
                        if (container && !response.body.html && !response.body.message) {
                            container.style.width = '90%';
                        }
                    }
                });

                return;
            }

            var responseData = response.body,
                includeField = form.querySelector('[name="inherit[include]"]'),
                includes     = includeField && includeField.value ? includeField.value.split(',') : [],
                available    = Array.from(form.querySelectorAll(
                    '[data-multicheckbox-field="inherit[include]"]'
                )).map(function(item) { return item.value; }),
                container    = getModalContainer(),
                refreshed;

            if (!container) { return; }

            // Refresh field values based on settings and AJAX response.
            Object.keys(IDsMap).forEach(function(option) {
                var id = IDsMap[option];
                id = id.panel || id;
                id = !Array.isArray(id) ? [id] : id;

                id.forEach(function(currentID) {
                    var shouldRefresh = includes.includes(option),
                        isAvailable   = available.includes(option);

                    if ((shouldRefresh || !isAvailable) && responseData.html &&
                        responseData.html[currentID] &&
                        (refreshed = container.querySelector('#' + currentID))) {
                        refreshed.innerHTML = responseData.html[currentID];
                        Selectize.initialize(refreshed.querySelectorAll('[data-selectize]'));
                    }
                });
            });

            if (hasChanged && includesFields.length && currentSelection[name] === '') {
                includesFields.forEach(function(include) { emitChange(include); });
            }

            currentSelection[name] = value;
            currentMode[name] = mode.value;
        });
    });

    delegate(body, 'change', '#g-settings-inheritance [data-multicheckbox-field]', function(event, element) {
        var root = element.closest('[data-g-inheritance-settings]') || document,
            outlineElement = root.querySelector('[name="inherit[outline]"]');
        if (!outlineElement) { return true; }

        var outline   = outlineElement.value,
            value     = element.value,
            isChecked = element.checked,
            noRefresh = event.noRefresh,
            mode      = getMode(root);

        if (!mode) { return true; }

        var IDs = {
            panel: (IDsMap[value] && IDsMap[value].panel || IDsMap[value]),
            tab: (IDsMap[value] && IDsMap[value].tab || IDsMap[value])
        };

        if (!Array.isArray(IDs.panel)) {
            IDs.panel = [IDs.panel];
            IDs.tab = [IDs.tab];
        }

        IDs.panel.forEach(function(currentPanel, index) {
            var panel = document.getElementById(currentPanel),
                tab   = document.getElementById(IDs.tab[index] + '-tab');

            if (!panel || !tab) { return; }

            var inherit = panel.querySelector('.g-inherit'),
                isClone = mode.value === 'clone',
                refresh = function(skipRefresh) {
                    if (skipRefresh) { return; }
                    var settingsBlock = element.closest('.settings-block'),
                        selector = settingsBlock && settingsBlock.querySelector('[name="inherit[outline]"]');
                    emitChange(selector);
                };

            if (!isChecked || !outline || isClone) {
                var lock = tab.querySelector('.fa-lock');

                if (lock) {
                    lock.classList.remove('fa-lock');
                    lock.classList.add('fa-unlock');
                }
                if (inherit) { inherit.style.display = 'none'; }
                if (isClone) { refresh(noRefresh); }
            } else {
                var unlock = tab.querySelector('.fa-unlock');

                if (unlock) {
                    unlock.classList.remove('fa-unlock');
                    unlock.classList.add('fa-lock');
                }
                if (inherit) { inherit.style.removeProperty('display'); }

                refresh(noRefresh);
            }
        });
    });


    delegate(
        body,
        'change',
        '[name="inherit[mode]"], [name="inherit[particle]"], [name="inherit[atom]"]',
        function(event, element) {
            var container = getModalContainer();
            if (!container) { return; }

            var outline    = container.querySelector('[name="inherit[outline]"]'),
                checkboxes = container.querySelectorAll('[data-multicheckbox-field]'),
                noRefresh  = element.name === 'inherit[mode]';

            emitChange(outline, {noRefresh: noRefresh});
            checkboxes.forEach(function(checkbox) {
                emitChange(checkbox, {noRefresh: noRefresh});
            });
        }
    );

    delegate(
        body,
        'click',
        '#g-inherit-particle .fa-info-circle, #g-inherit-atom .fa-info-circle',
        function(event, element) {
            event.preventDefault();

            var container = getModalContainer(),
                outline   = container && container.querySelector('[name="inherit[outline]"]'),
                parent    = element.parentElement,
                id        = parent && parent.querySelector(
                    'input[name="inherit[particle]"], input[name="inherit[atom]"]'
                );

            if (!id || !outline) { return false; }

            var URI = id.name === 'inherit[atom]' ? 'atoms/instance' : 'layouts/particle';
            modal.open({
                content: 'Loading',
                method: 'post',
                data: {id: id.value, outline: outline.value || getCurrentOutline()},
                remote: parseAjaxURI(getAjaxURL(URI) + getAjaxSuffix()),
                remoteLoaded: function(response) {
                    if (!response.body.success) {
                        modal.enableCloseByOverlay();
                    }
                }
            });

            return false;
        }
    );

    delegate(body, 'mouseup', '.g-tabs .fa-lock, .g-tabs .fa-unlock', function(event, element) {
        var listItem = element.closest('li');
        if (!listItem || !listItem.classList.contains('active')) { return false; }

        var container = getModalContainer(),
            anchor    = element.closest('a'),
            isLocked  = element.classList.contains('fa-lock'),
            id        = anchor ? anchor.id.replace(/\-tab$/, '') : '',
            prop      = Object.keys(IDsMap).find(function(key) {
                var value = IDsMap[key];
                return value === id || value.tab === id || collectionContains(value, id);
            }),
            input     = container && container.querySelector(
                '[data-multicheckbox-field][value="' + prop + '"]'
            ),
            mode      = container && getMode(container),
            radios    = container && container.querySelector(
                '[name="inherit[particle]"], [name="inherit[atom]"]'
            ),
            checked   = container && getSelectedItem(container);

        if (input) {
            // Do not refresh particle inheritance without a selected particle,
            // or while the inheritance mode is cloning.
            if ((mode && mode.value === 'clone') || (radios && !checked)) {
                return false;
            }

            input.checked = !isLocked;
            emitChange(input);
        }
    });
});
