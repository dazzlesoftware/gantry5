'use strict';

const Submit = require('../../fields/submit');
const modal = require('../../ui').modal;
const request = require('../../utils/request');
const {ready, delegate} = require('../../utils/dom');
const parseAjaxURI = require('../../utils/get-ajax-url').parse;
const getAjaxURL = require('../../utils/get-ajax-url').global;
const getAjaxSuffix = require('../../utils/get-ajax-suffix');
const translate = require('../../utils/translate');
const WordpressWidgetsCustomizer = require('../../utils/wp-widgets-customizer');

const showIndicator = (element) => {
    let icon = element.querySelector('i');
    element.gHadIcon = Boolean(icon);
    if (!icon) {
        icon = document.createElement('i');
        element.prepend(icon);
    }
    if (!element.gIndicator) element.gIndicator = icon.className || true;
    icon.className = 'fa fa-fw fa-spin-fast fa-spinner';
};

const hideIndicator = (element) => {
    if (!element.gIndicator) return;
    const icon = element.querySelector('i');
    if (icon) {
        if (element.gHadIcon) icon.className = element.gIndicator === true ? '' : element.gIndicator;
        else icon.remove();
    }
    element.gIndicator = null;
};

const parseForm = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html || '';
    return template.content.querySelector('form');
};

ready(() => {
    const body = document.body;
    const moduleType = {wordpress: 'widget', joomla: 'module'};

    delegate(body, 'input', '[data-g-instancepicker] ~ input[type="hidden"]', (event, field) => {
        if (field.value) return;
        const parent = field.parentElement;
        const title = parent && parent.querySelector('.g-instancepicker-title');
        const label = parent && parent.querySelector('[data-g-instancepicker]');
        const reset = parent && parent.querySelector('.g-reset-field');

        if (title) title.textContent = '';
        if (label) label.textContent = label.dataset.gInstancepickerText || '';
        if (reset) reset.style.display = 'none';
    });

    delegate(body, 'click', '[data-g-instancepicker]', (event, picker) => {
        event.preventDefault();

        const data = JSON.parse(picker.dataset.gInstancepicker || '{}');
        const field = document.getElementsByName(data.field)[0];
        let value;
        let uri;

        if (data.type === moduleType[window.GENESIS_PLATFORM]) {
            uri = (data.type !== 'widget' ? 'particle/' : '') + moduleType[window.GENESIS_PLATFORM];
        } else {
            uri = 'particle';
        }

        if (!field) return;
        value = field.value;

        if ((data.type === 'particle' || data.type === 'widget') && value) {
            value = JSON.parse(value || '{}');
            uri = `${value.type}/${value[data.type]}`;
        }

        if (data.modal_close) return;

        modal.open({
            content: translate('GANTRY5_PLATFORM_JS_LOADING'),
            method: !value || data.type === 'module' ? 'get' : 'post',
            data: !value || data.type === 'module' ? {} : value,
            overlayClickToClose: false,
            remote: parseAjaxURI(getAjaxURL(uri) + getAjaxSuffix()),
            remoteLoaded: (response, modalInstance) => {
                if (!response.body.success) {
                    modal.enableCloseByOverlay();
                    return;
                }

                const content = modalInstance.elements.content[0];
                const select = content.querySelector('[data-mm-select]');
                const search = content.querySelector('.search input');
                const blocks = [...content.querySelectorAll('[data-mm-type]')];
                const filters = [...content.querySelectorAll('[data-mm-filter]')];

                if (search && filters.length && blocks.length) {
                    search.addEventListener('input', () => {
                        const value = search.value.trim().toLowerCase();
                        blocks.forEach((block) => block.classList.toggle('hidden', Boolean(value)));
                        if (!value) return;

                        filters.forEach((filter) => {
                            const text = (filter.dataset.mmFilter || '').trim().toLowerCase();
                            if (text.startsWith(value) || text.includes(` ${value}`)) {
                                const block = filter.matches('[data-mm-type]') ? filter : filter.closest('[data-mm-type]');
                                if (block) block.classList.remove('hidden');
                            }
                        });
                    });
                    setTimeout(() => search.focus(), 5);
                }

                const elementData = JSON.parse(picker.dataset.gInstancepicker || '{}');
                if (elementData.type === moduleType[window.GENESIS_PLATFORM]) elementData.modal_close = true;

                if (select) {
                    select.dataset.gInstancepicker = JSON.stringify(elementData);
                    return;
                }

                const form = content.querySelector('form');
                const fakeForm = parseForm(response.body.html || response.body);
                const submit = content.querySelector('input[type="submit"], button[type="submit"]');
                if ((!form && !fakeForm) || !submit || !fakeForm) return;

                content.querySelectorAll('[data-apply-and-save]').forEach((button) => button.remove());
                submit.addEventListener('click', (submitEvent) => {
                    submitEvent.preventDefault();
                    showIndicator(submit);

                    const post = Submit(fakeForm.elements, content);
                    request(
                        fakeForm.getAttribute('method'),
                        parseAjaxURI(fakeForm.getAttribute('action') + getAjaxSuffix()),
                        post.valid.join('&') || {},
                        (error, saveResponse) => {
                            if (!saveResponse.body.success) {
                                modal.open({
                                    content: saveResponse.body.html || saveResponse.body.message || saveResponse.body,
                                    afterOpen: (container) => {
                                        if (!saveResponse.body.html && !saveResponse.body.message) container.style({width: '90%'});
                                    }
                                });
                            } else {
                                const title = field.parentElement && field.parentElement.querySelector('.g-instancepicker-title');
                                field.value = JSON.stringify(saveResponse.body.item);
                                field.dispatchEvent(new Event('change', {bubbles: true}));
                                if (title) title.textContent = saveResponse.body.item.title;
                            }

                            modal.close();
                            hideIndicator(submit);
                            WordpressWidgetsCustomizer(field);
                        }
                    );
                });
            }
        });
    });
});

module.exports = {};
