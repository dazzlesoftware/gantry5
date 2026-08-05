import __module0 from '../utils/dom.js';
import __module1 from '../utils/history.js';
import __module2 from '../utils/flags-state.js';
import __module3 from './submit.js';
import './multicheckbox.js';

'use strict';

var dom = __module0,
    History = __module1,
    flags = __module2,
    submit = __module3;


var mapsEqual = function(first, second, comparator) {
    if (!(first instanceof Map) || !(second instanceof Map) || first.size !== second.size) { return false; }

    for (var entry of first) {
        if (!second.has(entry[0]) || !comparator(entry[1], second.get(entry[0]))) { return false; }
    }
    return true;
};

var readData = function(element, name) {
    return element.getAttribute('data-' + name);
};

var fieldValue = function(field, value) {
    if (arguments.length > 1) {
        field.value = value;
        return value;
    }

    if (field instanceof HTMLSelectElement && field.multiple) {
        return Array.from(field.selectedOptions, function(option) { return option.value; });
    }
    return field.value == null ? '' : field.value;
};

var findIndicator = function(element) {
    return element ? element.querySelector('i') : null;
};

var showIndicator = function(element, className) {
    if (!element) { return; }

    var icon = findIndicator(element);
    element.gHadIcon = Boolean(icon);

    if (!icon) {
        if (!element.querySelector('span') && element.children.length === 0) {
            var label = document.createElement('span');
            label.textContent = element.textContent;
            element.textContent = '';
            element.appendChild(label);
        }
        icon = document.createElement('i');
        element.insertBefore(icon, element.firstChild);
    }

    if (!element.gIndicator) { element.gIndicator = icon.getAttribute('class') || true; }
    icon.setAttribute('class', className || 'fa fa-fw fa-spin-fast fa-spinner');
};

var hideIndicator = function(element) {
    if (!element || !element.gIndicator) { return; }

    var icon = findIndicator(element);
    if (!icon) { return; }

    if (!element.gHadIcon) { icon.remove(); }
    else { icon.setAttribute('class', element.gIndicator); }
    element.gIndicator = null;
};

var originals,
    presetsCache,
    collectFieldsValues = function(keys) {
        var map = new Map(),
            defaultsElement = document.querySelector('[data-g-styles-defaults]'),
            defaults = defaultsElement ? JSON.parse(readData(defaultsElement, 'g-styles-defaults')) : {},
            overrides = document.querySelectorAll('input[type="checkbox"].settings-param-toggle');

        if (overrides.length) {
            var states = {};
            overrides.forEach(function(override) { states[override.id] = override.checked; });
            map.set('__js__overrides', JSON.stringify(states));
        }

        if (keys) {
            keys.forEach(function(key) {
                var field = document.querySelector('[name="' + CSS.escape(key) + '"]');
                if (field) { map.set(key, fieldValue(field)); }
            });
            return map;
        }

        var fields = document.querySelectorAll('.settings-block [name]');
        if (!fields.length) { return false; }

        fields.forEach(function(field) {
            var key = field.getAttribute('name'),
                isInput = !Object.prototype.hasOwnProperty.call(defaults, key);

            if (field.type === 'checkbox' && !fieldValue(field).length) { fieldValue(field, '0'); }
            map.set(key, isInput ? fieldValue(field) : defaults[key]);
        });
        return map;
    },
    createMapFrom = function(data) {
        return new Map(Object.keys(data).map(function(key) { return [key, data[key]]; }));
    };

var compare = {
    single: function() {},
    whole: function() {},
    blanks: function() {},
    presets: function() {}
};

dom.ready(function() {
    var body = document.body;

    originals = collectFieldsValues();

    compare.single = function(event, element) {
        var parent = element.closest('.settings-param, h4, .input-group'),
            target = parent ? (parent.matches('h4') ? parent : parent.querySelector('.settings-param-title, .g-instancepicker-title')) : null,
            override = parent ? parent.querySelector('.settings-param-toggle') : null,
            isNewWidget = false,
            isOverrideToggle = element.classList.contains('settings-param-toggle');

        if (!parent) { return; }
        if (isOverrideToggle) { compare.whole('force'); return; }

        if (element.type === 'checkbox') { fieldValue(element, Number(element.checked).toString()); }

        var name = element.getAttribute('name');
        if (originals && originals.get(name) == null) {
            originals.set(name, fieldValue(element));
            isNewWidget = true;
        }
        if (!target || !originals || originals.get(name) == null) { return; }

        if (originals.get(name) !== fieldValue(element) || isNewWidget) {
            if (override && event.forceOverride && !override.checked) { override.click(); }
            showIndicator(target, 'changes-indicator font-small far fa-circle fa-fw');
        } else {
            if (override && event.forceOverride && override.checked) { override.click(); }
            hideIndicator(target);
        }

        compare.blanks(event, parent.querySelector('.settings-param-field'));
        compare.whole('force');
        compare.presets();
    };

    compare.whole = function(force) {
        if (!originals) { return; }

        var current = collectFieldsValues(force ? Array.from(originals.keys()) : null),
            equals = mapsEqual(originals, current, function(a, b) {
                if (typeof a === 'string' && typeof b === 'string' && a[0] === '#' && b[0] === '#') {
                    return a.toLowerCase() === b.toLowerCase();
                }
                return Object.is(a, b);
            }),
            saves = document.querySelectorAll('[data-save]');

        flags.set('pending', !equals);
        saves.forEach(function(save) {
            if (equals) { hideIndicator(save); }
            else { showIndicator(save, 'changes-indicator far fa-circle fa-fw'); }
        });
    };

    compare.blanks = function(event, element) {
        if (!element) { return; }
        var field = element.querySelector('[name]'),
            reset = element.querySelector('.g-reset-field');
        if (!field || !reset) { return true; }
        reset.style.display = !fieldValue(field) || field.disabled ? 'none' : '';
    };

    compare.presets = function(preserveServerSelection) {
        var presets = document.querySelectorAll('[data-g-styles]');
        if (!presets.length) { return; }

        if (!presetsCache) {
            presetsCache = new Map();
            presets.forEach(function(preset) {
                presetsCache.set(preset, createMapFrom(JSON.parse(readData(preset, 'g-styles'))));
            });
        }

        if (preserveServerSelection) { return; }

        presetsCache.forEach(function(presetMap, preset) {
            var fields = collectFieldsValues(Array.from(presetMap.keys()));
            fields.delete('__js__overrides');
            preset.parentElement.classList.toggle('g-preset-match', mapsEqual(fields, presetMap, function(a, b) { return a == b; }));
        });
    };

    dom.delegate(body, 'input', '.settings-block input[name][type="text"], .settings-block textarea[name]', compare.single);
    dom.delegate(body, 'change', '.settings-block input[name][type="hidden"], .settings-block input[name][type="checkbox"], .settings-block select[name], .settings-block .selectized[name], .settings-block input[id][type="checkbox"].settings-param-toggle', compare.single);

    dom.delegate(body, 'input', '.g-urltemplate', function(event, element) {
        var parent = element.closest('.settings-param');
        if (!parent || !parent.parentElement) { return; }
        var link = Array.from(parent.parentElement.children).filter(function(sibling) { return sibling !== parent; })
            .map(function(sibling) { return sibling.querySelector('[data-g-urltemplate]'); })
            .find(Boolean);
        if (link) { link.href = readData(link, 'g-urltemplate').replace(/#ID#/g, fieldValue(element)); }
    });

    dom.delegate(body, 'mouseover', '.settings-param-field', compare.blanks);
    dom.delegate(body, 'click', '.g-reset-field', function(event, element) {
        var parent = element.closest('.settings-param-field'),
            field = parent ? parent.querySelector('[name]') : null;
        if (!field || field.disabled) { return; }

        if (field.selectizeInstance) { field.selectizeInstance.setValue(''); }
        else { fieldValue(field, ''); }

        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('keyup', { bubbles: true }));
    });

    body.addEventListener('statechangeEnd', function() {
        originals = collectFieldsValues();
        presetsCache = null;
        compare.presets(true);
    });

    body.addEventListener('updateOriginalFields', function() {
        originals = collectFieldsValues();
        presetsCache = null;
        compare.presets();
    });

    compare.presets(true);
});

export default {
    compare: compare,
    collect: collectFieldsValues,
    submit: submit
};
