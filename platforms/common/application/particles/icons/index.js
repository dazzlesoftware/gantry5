import __module0 from '../../utils/dom.js';
import __module1 from '../../ui/index.js';
import __module2 from '../../ui/popover.js';
import __module3 from '../../utils/get-ajax-suffix.js';
import __module4 from '../../utils/get-ajax-url.js';
import __module5 from '../../utils/translate.js';

"use strict";

let dom = __module0,
    modal = __module1.modal,
    popovers = __module2,
    getAjaxSuffix = __module3,
    parseAjaxURI = __module4.parse,
    getAjaxURL = __module4.global,
    translate = __module5;

let escapeHTML = function(value) {
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

let findPreview = function(input) {
    let parent = input.parentElement;
    return parent ? parent.querySelector('[data-genesis-iconpicker]') : null;
};

dom.ready(function() {
    let body = document.body;

    dom.delegate(body, 'keyup', '.g-icons input[type="text"]', function(event, input) {
        let preview = findPreview(input),
            icon = preview && preview.querySelector('i');
        if (!icon) { return; }

        icon.className = input.value || 'far fa-hand-point-up picker';
        if (!preview.offsetWidth) { icon.className = 'far fa-hand-point-up picker'; }
    });

    dom.delegate(body, 'click', '[data-genesis-iconpicker]', function(event, realPreview) {
        event.preventDefault();

        let fieldSelector = realPreview.getAttribute('data-genesis-iconpicker'),
            field = fieldSelector ? document.querySelector(fieldSelector) : null,
            value = String(field ? field.value : '').trim().replace(/\s{2,}/g, ' ').split(' ').filter(Boolean);

        if (!field) { return; }

        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            className: 'genesis-dialog-theme-default genesis-modal-icons',
            remote: parseAjaxURI(getAjaxURL('icons') + getAjaxSuffix()),
            afterClose: function() {
                document.querySelectorAll('.genesis-popover').forEach(function(popover) { popover.remove(); });
            },
            remoteLoaded: function(response, content) {
                let container = modal.element(content.elements.content),
                    icons = container.querySelectorAll('[data-g-icon]');

                if (!icons.length || !response.body.success) {
                    container.innerHTML = response.body.html || response.body;
                    return false;
                }

                let selectButton = container.querySelector('[data-g-select]'),
                    updatePreview = function() {
                        let data = [],
                            active = container.querySelector('[data-g-icon].active'),
                            activeLibrary = active ? active.getAttribute('data-g-icon-library') : '',
                            options = activeLibrary === 'font-awesome' ? container.querySelectorAll('[data-g-icon-modifiers] input:checked, [data-g-icon-modifiers] select') : [];

                        if (active) { data.push(active.getAttribute('data-g-icon')); }
                        options.forEach(function(option) {
                            if (option.value && option.value !== 'fa-') { data.push(option.value); }
                        });

                        let preview = container.querySelector('.g-icon-preview');
                        if (preview) {
                            preview.innerHTML = '<i class="' + escapeHTML(data.join(' ')) + '" aria-hidden="true"></i> <span>' + escapeHTML(data[0] || '') + '</span>';
                        }
                        if (selectButton) { selectButton.disabled = !active; }
                    },
                    updateTotal = function() {
                        let total = container.querySelectorAll('[data-g-icon]:not(.hide-icon)').length,
                            label = container.querySelector('.particle-search-total');
                        if (label) { label.textContent = total; }
                    },
                    applyFilters = function() {
                        let searchField = container.querySelector('.particle-search-wrapper input[type="text"]'),
                            libraryField = container.querySelector('[data-g-icon-library]'),
                            styleField = container.querySelector('[data-g-icon-style]'),
                            search = searchField ? searchField.value.toLowerCase().trim() : '',
                            library = libraryField ? libraryField.value : '',
                            style = styleField ? styleField.value : '';

                        icons.forEach(function(icon) {
                            let matchesSearch = !search || icon.getAttribute('data-g-icon').toLowerCase().includes(search),
                                matchesLibrary = !library || icon.getAttribute('data-g-icon-library') === library,
                                matchesStyle = !style || icon.getAttribute('data-g-icon-style') === style;
                            icon.classList.toggle('hide-icon', !(matchesSearch && matchesLibrary && matchesStyle));
                        });
                        let modifiers = container.querySelector('[data-g-icon-modifiers]');
                        if (modifiers) { modifiers.classList.toggle('hide-options', Boolean(library) && library !== 'font-awesome'); }
                        updateTotal();
                    };

                if (selectButton) { selectButton.disabled = !container.querySelector('[data-g-icon].active'); }

                dom.delegate(container, 'click', '[data-g-icon]', function(iconEvent, icon) {
                    iconEvent.preventDefault();
                    let active = container.querySelector('[data-g-icon].active');
                    if (active) { active.classList.remove('active'); }
                    icon.classList.add('active');
                    updatePreview();
                });

                dom.delegate(container, 'click', '[data-g-select]', function(selectEvent) {
                    selectEvent.preventDefault();
                    if (!container.querySelector('[data-g-icon].active')) { return; }

                    let output = container.querySelector('.g-icon-preview i'),
                        outputClass = output ? output.getAttribute('class') : '';
                    field.value = outputClass;

                    let previewIcon = realPreview.querySelector('i');
                    if (previewIcon) { previewIcon.className = outputClass; }
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    modal.close();
                });

                dom.delegate(container, 'change', '[data-g-icon-modifiers] input[type="checkbox"], [data-g-icon-modifiers] select', updatePreview);
                dom.delegate(container, 'change', '[data-g-icon-library], [data-g-icon-style]', applyFilters);

                dom.delegate(container, 'keyup', '.particle-search-wrapper input[type="text"]', function(searchEvent, input) {
                    applyFilters();
                });

                dom.delegate(container, 'mouseover', '[data-g-icon]', function(popoverEvent, icon) {
                    if (icon.hasAttribute('data-g-icon-popover')) { return; }
                    icon.setAttribute('data-g-icon-popover', '');

                    let iconName = icon.getAttribute('data-g-icon'),
                        html = '';

                    for (let size = 5; size > 0; size--) {
                        html += '<i class="' + escapeHTML(iconName) + ' g-icon-preview-' + size + 'x" aria-hidden="true"></i> ';
                    }
                    html += '<h3>' + escapeHTML(iconName) + '</h3>';

                    let popover = popovers.create(icon, {
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
                });

                icons.forEach(function(icon) {
                    let iconName = icon.getAttribute('data-g-icon');

                    if (!value.includes(iconName)) { return; }

                    icon.classList.add('active');
                    value.forEach(function(name) {
                        let optionField = container.querySelector('[name="' + CSS.escape(name) + '"]');
                        if (optionField) { optionField.checked = true; return; }

                        let option = container.querySelector('option[value="' + CSS.escape(name) + '"]');
                        if (option) { option.parentElement.value = name; }
                    });

                    let wrap = icon.closest('.icons-wrapper');
                    if (wrap) { wrap.scrollTop = icon.offsetTop - (wrap.offsetHeight / 2); }
                    updatePreview();
                });

                let searchInput = container.querySelector('.particle-search-wrapper input');
                if (searchInput) { setTimeout(function() { searchInput.focus(); }, 5); }
            }
        });
    });
});

export default {};
