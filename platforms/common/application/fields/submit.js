'use strict';

var $             = require('elements'),
    validateField = require('../utils/field-validation');

var submit = function(elements, container, options) {
    var valid   = [],
        invalid = [];

    elements = $(elements);
    container = $(container);
    options = options || {};

    $(elements).forEach(function(input) {
        input = $(input);
        var name = input.attribute('name'),
            type = input.attribute('type');
        if (!name || input.disabled() || (type == 'radio' && !input.checked())) { return; }

        input = container.find('[name="' + name + '"]' + (type == 'radio' ? ':checked' : ''));

        if (type === 'checkbox' && container.find('[type="hidden"][name="' + name + '"]')) {
            input = container.find('[name="' + name + '"][type="checkbox"]');
        }

        if (input) {
            var value    = input.type() == 'checkbox' ? Number(input.checked()) : input.value(),
                parent   = input.parent('.settings-param'),
                override = parent ? parent.find('> input[type="checkbox"]') : null;

            override = override || $(input.data('override-target'));

            if (['select', 'select-multiple'].includes(input.type()) && input.attribute('multiple')) {
                value = (input.search('option[selected]') || []).map(function(selection) {
                    return $(selection).value();
                });
            }

            if (override && !override.checked()) { return; }

            var skipValidation = name && name.indexOf('block-size') !== -1 && (!value || value === '');
            if (!skipValidation && !validateField(input)) {
                invalid.push(input);
            }

            if (Array.isArray(value)) {
                value.forEach(function(selection) {
                    valid.push(name + '[]=' + encodeURIComponent(selection));
                });
            } else if (!options.submitUnchecked || (input.type() != 'checkbox' || (input.type() == 'checkbox' && !!value))) {
                valid.push(name + '=' + encodeURIComponent(value));
            }
        }
    });

    var titles = container.search('h4 [data-title-editable]'), key;
    if (titles) {
        titles.forEach(function(title) {
            title = $(title);
            if (title.parent('[data-collection-template]')) { return; }

            key = title.data('collection-key') || (options.isRoot ? 'settings[title]' : 'title');
            var editableTitle = title.data('title-editable');
            valid.push(key + '=' + encodeURIComponent(editableTitle == null ? '' : String(editableTitle).trim()));
        });
    }

    return { valid: valid, invalid: invalid };
};

module.exports = submit;
