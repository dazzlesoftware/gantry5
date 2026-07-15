"use strict";
var ready         = require('../utils/dom').ready,
    $             = require('elements/attributes'),
    History       = require('../utils/history'),
    flags         = require('../utils/flags-state'),
    submit        = require('./submit');

require('./multicheckbox');

var mapsEqual = function(first, second, comparator) {
    if (!(first instanceof Map) || !(second instanceof Map) || first.size !== second.size) { return false; }

    for (var entry of first) {
        var key = entry[0], value = entry[1];
        if (!second.has(key) || !comparator(value, second.get(key))) { return false; }
    }
    return true;
};

var originals,
    collectFieldsValues = function(keys) {
        var map      = new Map(),
            defaults = $('[data-g-styles-defaults]'),
            overridables = $('input[type="checkbox"].settings-param-toggle');

        defaults = defaults ? JSON.parse(defaults.data('g-styles-defaults')) : {};

        // keep track of overrides getting enabled / disabled
        // in order to detect if has changed
        if (overridables) {
            var overrides = {};

            overridables.forEach(function(override) {
                override = $(override);
                overrides[override.id()] = override.checked();
            });

            map.set('__js__overrides', JSON.stringify(overrides));
        }

        if (keys) {
            var field;
            keys.forEach(function(key) {
                field = $('[name="' + key + '"]');
                if (field) {
                    map.set(key, field.value());
                }
            });

            return map;
        }

        var fields = $('.settings-block [name]');
        if (!fields) { return false; }

        fields.forEach(function(field) {
            field = $(field);
            var key     = field.attribute('name'),
                isInput = !Object.prototype.hasOwnProperty.call(defaults, key);

            if (field.type() == 'checkbox' && !field.value().length) { field.value('0'); }
            map.set(key, isInput ? field.value() : defaults[key]);
        }, this);

        return map;
    },
    createMapFrom       = function(data) {
        var map = new Map();

        Object.keys(data).forEach(function(key) {
            var value = data[key];
            map.set(key, value);
        });

        return map;
    };

var compare = {
    single: function() {},
    whole: function() {},
    blanks: function() {},
    presets: function() {}
};

ready(function() {
    var body = $('body'), presetsCache;

    originals = collectFieldsValues();

    compare.single = function(event, element) {
        var parent      = element.parent('.settings-param') || element.parent('h4') || element.parent('.input-group'),
            target      = parent ? (parent.matches('h4') ? parent : parent.find('.settings-param-title, .g-instancepicker-title')) : null,
            isOverride  = parent ? parent.find('.settings-param-toggle') : false,
            isNewWidget = false,
            isOverrideToggle = element.hasClass('settings-param-toggle');

        if (!parent) { return; }

        if (isOverrideToggle) {
            return compare.whole('force');
        }

        if (element.type() == 'checkbox') {
            element.value(Number(element.checked()).toString());
        }

        if (originals && originals.get(element.attribute('name')) == null) {
            originals.set(element.attribute('name'), element.value());
            isNewWidget = true;
        }

        if (!target || !originals || originals.get(element.attribute('name')) == null) { return; }
        if (originals.get(element.attribute('name')) !== element.value() || isNewWidget) {
            if (isOverride && event.forceOverride && !isOverride.checked()) { isOverride[0].click(); }
            target.showIndicator('changes-indicator font-small far fa-circle fa-fw');
        } else {
            if (isOverride && event.forceOverride && isOverride.checked()) { isOverride[0].click(); }
            target.hideIndicator();
        }

        compare.blanks(event, parent.find('.settings-param-field'));
        compare.whole('force');
        compare.presets();
    };

    compare.whole = function(force) {
        if (!originals) { return; }
        var equals = mapsEqual(originals, collectFieldsValues(force ? Array.from(originals.keys()) : null), function(a, b) {
                if (typeof a === 'string' && typeof b === 'string' && a.substr(0, 1) == '#' && b.substr(0, 1) == '#') {
                    return a.toLowerCase() == b.toLowerCase();
                } else {
                    return Object.is(a, b);
                }
            }),
            save   = $('[data-save]');

        if (!save) { return; }

        flags.set('pending', !equals);
        save[equals ? 'hideIndicator' : 'showIndicator']('changes-indicator far fa-circle fa-fw');
    };

    compare.blanks = function(event, element) {
        if (!element) { return; }
        var field = element.find('[name]'),
            reset = element.find('.g-reset-field');
        if (!field || !reset) { return true; }

        var value = field.value();
        if (!value || field.disabled()) { reset.style('display', 'none'); }
        else { reset.removeAttribute('style'); }
    };

    compare.presets = function() {
        var presets = $('[data-g-styles]'), store;
        if (!presets) { return; }

        if (!presetsCache) {
            presetsCache = new Map();
            presets.forEach(function(preset, index) {
                preset = $(preset);
                store = {
                    index: index,
                    map: createMapFrom(JSON.parse(preset.data('g-styles')))
                };
                presetsCache.set(preset[0], store);
            });
        }

        var fields, equals;
        presetsCache.forEach(function(data, element) {
            fields = collectFieldsValues(Array.from(data.map.keys()));

            // Do not consider __js__overrides when comparing for equality
            fields.delete('__js__overrides');

            equals = mapsEqual(fields, data.map, function(a, b) { return a == b; });
            $($('[data-g-styles]')[data.index]).parent()[equals ? 'addClass' : 'removeClass']('g-preset-match');
        });
    };

    body.delegate('input', '.settings-block input[name][type="text"], .settings-block textarea[name]', compare.single);
    body.delegate('change', '.settings-block input[name][type="hidden"], .settings-block input[name][type="checkbox"], .settings-block select[name], .settings-block .selectized[name], .settings-block input[id][type="checkbox"].settings-param-toggle', compare.single);

    body.delegate('input', '.g-urltemplate', function(event, element) {
        var previous = element.parent('.settings-param').siblings();
        if (!previous) { return; }

        previous = previous.find('[data-g-urltemplate]');

        if (previous) {
            var template = previous.data('g-urltemplate');
            previous.attribute('href', template.replace(/#ID#/g, element.value()));
        }
    });

    // fields resets
    body.delegate('mouseenter', '.settings-param-field', compare.blanks, true);
    body.delegate('click', '.g-reset-field', function(e, element) {
        var parent = element.parent('.settings-param-field'), field;
        if (!parent) { return; }

        field = parent.find('[name]');
        if (field && !field.disabled()) {
            var selectize = field.selectizeInstance;
            if (selectize) { selectize.setValue(''); }
            else { field.value(''); }

            field.emit('change');
            body.emit('input', { target: field });
            body.emit('keyup', { target: field });
        }
    });

    body.on('statechangeEnd', function() {
        var State = History.getState();
        body.emit('updateOriginalFields');
    });

    body.on('updateOriginalFields', function() {
        originals = collectFieldsValues();
        compare.presets();
    });

    // force a presets comparison check
    compare.presets();
});

module.exports = {
    compare: compare,
    collect: collectFieldsValues,
    submit: submit
};
