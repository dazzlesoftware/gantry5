"use strict";

var dom = require('../../utils/dom'),
    modal = require('../../ui').modal,
    popovers = require('../../ui/popover'),
    getAjaxSuffix = require('../../utils/get-ajax-suffix'),
    parseAjaxURI = require('../../utils/get-ajax-url').parse,
    getAjaxURL = require('../../utils/get-ajax-url').global,
    translate = require('../../utils/translate');

var escapeHTML = function(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character];
    });
};

var findPreview = function(input) {
    var parent = input.parentElement;
    return parent ? parent.querySelector('[data-g5-iconpicker]') : null;
};

dom.ready(function() {
    var body = document.body;

    dom.delegate(body, 'keyup', '.g-icons input[type="text"]', function(event, input) {
        var preview = findPreview(input),
            icon = preview && preview.querySelector('i');
        if (!icon) { return; }

        icon.className = input.value || 'far fa-hand-point-up picker';
        if (!preview.offsetWidth) { icon.className = 'far fa-hand-point-up picker'; }
    });

    dom.delegate(body, 'click', '[data-g5-iconpicker]', function(event, realPreview) {
        event.preventDefault();

        var fieldSelector = realPreview.getAttribute('data-g5-iconpicker'),
            field = fieldSelector ? document.querySelector(fieldSelector) : null,
            value = String(field ? field.value : '').trim().replace(/\s{2,}/g, ' ').split(' ').filter(Boolean);

        if (!field) { return; }

        modal.open({
            content: translate('GANTRY5_PLATFORM_JS_LOADING'),
            className: 'g5-dialog-theme-default g5-modal-icons',
            remote: parseAjaxURI(getAjaxURL('icons') + getAjaxSuffix()),
            afterClose: function() {
                document.querySelectorAll('.g5-popover').forEach(function(popover) { popover.remove(); });
            },
            remoteLoaded: function(response, content) {
                var container = content.elements.content[0],
                    icons = container.querySelectorAll('[data-g-icon]');

                if (!icons.length || !response.body.success) {
                    container.innerHTML = response.body.html || response.body;
                    return false;
                }

                var selectButton = container.querySelector('[data-g-select]'),
                    updatePreview = function() {
                        var data = [],
                            active = container.querySelector('[data-g-icon].active'),
                            options = container.querySelectorAll('.g-particles-header .float-right input:checked, .g-particles-header .float-right select');

                        if (active) { data.push(active.getAttribute('data-g-icon')); }
                        options.forEach(function(option) {
                            if (option.value && option.value !== 'fa-') { data.push(option.value); }
                        });

                        var preview = container.querySelector('.g-icon-preview');
                        if (preview) {
                            preview.innerHTML = '<i class="' + escapeHTML(data.join(' ')) + '" aria-hidden="true"></i> <span>' + escapeHTML(data[0] || '') + '</span>';
                        }
                        if (selectButton) { selectButton.disabled = !active; }
                    },
                    updateTotal = function() {
                        var total = container.querySelectorAll('[data-g-icon]:not(.hide-icon)').length,
                            label = container.querySelector('.particle-search-total');
                        if (label) { label.textContent = total; }
                    };

                if (selectButton) { selectButton.disabled = !container.querySelector('[data-g-icon].active'); }

                dom.delegate(container, 'click', '[data-g-icon]', function(iconEvent, icon) {
                    iconEvent.preventDefault();
                    var active = container.querySelector('[data-g-icon].active');
                    if (active) { active.classList.remove('active'); }
                    icon.classList.add('active');
                    updatePreview();
                });

                dom.delegate(container, 'click', '[data-g-select]', function(selectEvent) {
                    selectEvent.preventDefault();
                    if (!container.querySelector('[data-g-icon].active')) { return; }

                    var output = container.querySelector('.g-icon-preview i'),
                        outputClass = output ? output.getAttribute('class') : '';
                    field.value = outputClass;

                    var previewIcon = realPreview.querySelector('i');
                    if (previewIcon) { previewIcon.className = outputClass; }
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    modal.close();
                });

                dom.delegate(container, 'change', '.g-particles-header .float-right input[type="checkbox"], .g-particles-header .float-right select', updatePreview);

                dom.delegate(container, 'keyup', '.particle-search-wrapper input[type="text"]', function(searchEvent, input) {
                    var search = input.value.toLowerCase();
                    icons.forEach(function(icon) {
                        icon.classList.toggle('hide-icon', Boolean(search) && !icon.getAttribute('data-g-icon').toLowerCase().includes(search));
                    });
                    updateTotal();
                });

                icons.forEach(function(icon) {
                    var iconName = icon.getAttribute('data-g-icon'),
                        html = '';

                    for (var size = 5; size > 0; size--) {
                        html += '<i class="' + escapeHTML(iconName) + ' fa-' + size + 'x" aria-hidden="true"></i> ';
                    }
                    html += '<h3>' + escapeHTML(iconName) + '</h3>';

                    var popover = popovers.create(icon, {
                        content: html,
                        placement: 'auto',
                        trigger: 'mouse',
                        style: 'above-modal, icons-preview',
                        width: 'auto',
                        targetEvents: false,
                        delay: 1
                    });
                    popover.on('hidden.popover', function(instance) {
                        if (instance.$target) { instance.$target.remove(); }
                    });

                    if (!value.includes(iconName)) { return; }

                    icon.classList.add('active');
                    value.forEach(function(name) {
                        var optionField = container.querySelector('[name="' + CSS.escape(name) + '"]');
                        if (optionField) { optionField.checked = true; return; }

                        var option = container.querySelector('option[value="' + CSS.escape(name) + '"]');
                        if (option) { option.parentElement.value = name; }
                    });

                    var wrap = icon.closest('.icons-wrapper');
                    if (wrap) { wrap.scrollTop = icon.offsetTop - (wrap.offsetHeight / 2); }
                    updatePreview();
                });

                var searchInput = container.querySelector('.particle-search-wrapper input');
                if (searchInput) { setTimeout(function() { searchInput.focus(); }, 5); }
            }
        });
    });
});

module.exports = {};
