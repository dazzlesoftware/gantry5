import __module0 from '../../utils/dom.js';
import __module1 from '../../fields/submit.js';
import __module2 from '../../ui/index.js';
import __module3 from '../../utils/indicator.js';
import __module4 from '../../utils/request.js';
import __module5 from '../../utils/reorderable-list.js';
import __module6 from '../../utils/get-ajax-url.js';
import __module7 from '../../utils/get-ajax-suffix.js';
import __module8 from '../../utils/translate.js';

"use strict";

let dom = __module0,
    Submit = __module1,
    modal = __module2.modal,
    toastr = __module2.toastr,
    indicator = __module3,
    request = __module4,
    ReorderableList = __module5,
    parseAjaxURI = __module6.parse,
    getAjaxSuffix = __module7,
    translate = __module8;

let directItems = function(list) {
    return Array.from(list.children).filter(function(item) { return item.hasAttribute('data-collection-item'); });
};

let fieldFor = function(element) {
    let param = element.closest('.settings-param');
    return param && param.querySelector('[data-collection-data]');
};

dom.ready(function() {
    let body = document.body;

    let addNewByExit = function(event) {
        if (!this.CollectionNew) { return; }
        this.CollectionNew = false;
        if (event.detail.key === 'enter') {
            let add = this.closest('.settings-param').querySelector('[data-collection-addnew]');
            if (add) { add.click(); }
        } else if (event.detail.key === 'esc') {
            let remove = this.closest('[data-collection-item]').querySelector('[data-collection-remove]');
            if (remove) { remove.click(); }
        }
    };

    let createSortables = function(value) {
        let lists = value ? [value.nodeType ? value : value[0]] : Array.from(document.querySelectorAll('.collection-list ul'));
        lists.filter(Boolean).forEach(function(list) {
            if (list.SimpleSort) { return; }
            list.SimpleSort = new ReorderableList(list, {
                item: '[data-collection-item]',
                handle: '.fa-reorder',
                filter: '[data-collection-nosort]',
                onEnd: function(event) {
                    if (event.oldIndex === event.newIndex) { return; }

                    let dataField = fieldFor(list),
                        data = JSON.parse(dataField.value || '[]');
                    data.splice(event.newIndex, 0, data.splice(event.oldIndex, 1)[0]);
                    dataField.value = JSON.stringify(data);
                    dataField.dispatchEvent(new Event('change', { bubbles: true }));
                },
                sortingClass: 'collection-sorting'
            });
        });
    };

    createSortables();
    dom.delegate(body, 'mouseover', '.collection-list ul', function(event, list) { createSortables(list); });

    dom.delegate(body, 'click', '[data-collection-addnew]', function(event, element) {
        event.preventDefault();
        let param = element.closest('.settings-param'),
            list = param && param.querySelector('ul'),
            template = param && param.querySelector('[data-collection-template]'),
            dataField = param && param.querySelector('[data-collection-data]');
        if (!list || !template || !dataField) { return; }

        let items = directItems(list),
            clone = template.cloneNode(true),
            title = clone.querySelector('a'),
            editable = title && title.querySelector('[data-title-editable]'),
            editAll = list.closest('[data-field-name]') && list.closest('[data-field-name]').querySelector('[data-collection-editall]');

        if (items.length) { items[items.length - 1].after(clone); }
        else { list.insertBefore(clone, list.firstChild); }
        if (items.length && editAll) { editAll.style.display = 'inline-block'; }

        title.href = title.href.replace(/%id%/g, items.length);
        clone.removeAttribute('style');
        clone.setAttribute('data-collection-item', clone.getAttribute('data-collection-template'));
        clone.removeAttribute('data-collection-template');
        clone.removeAttribute('data-collection-nosort');

        if (editable) {
            editable.CollectionNew = true;
            editable.addEventListener('genesis:title-edit-exit', addNewByExit);
            let editButton = title.parentElement.querySelector('[data-title-edit]');
            if (editButton) { editButton.click(); }
        }
        dataField.dispatchEvent(new Event('change', { bubbles: true }));
    });

    dom.delegate(body, 'blur', '[data-collection-item] [data-title-editable]', function(event, editable) {
        let item = editable.closest('[data-collection-item]'),
            list = item && item.parentElement,
            dataField = fieldFor(editable);
        if (!item || !list || !dataField) { return; }

        let index = directItems(list).indexOf(item);
        if (index === -1) { return; }
        let data = JSON.parse(dataField.value || '[]'),
            key = item.getAttribute('data-collection-item');
        if (!data[index]) { data.splice(index, 0, {}); }
        data[index][key] = editable.textContent.trim();
        dataField.value = JSON.stringify(data);
        dataField.dispatchEvent(new Event('change', { bubbles: true }));
    }, true);

    dom.delegate(body, 'click', '[data-collection-remove]', function(event, element) {
        event.preventDefault();
        let item = element.closest('[data-collection-item]'),
            list = item && item.parentElement,
            dataField = fieldFor(element);
        if (!item || !list || !dataField) { return; }

        let items = directItems(list),
            index = items.indexOf(item),
            data = JSON.parse(dataField.value || '[]'),
            editAll = list.closest('[data-field-name]') && list.closest('[data-field-name]').querySelector('[data-collection-editall]');
        data.splice(index, 1);
        dataField.value = JSON.stringify(data);
        item.remove();
        if (items.length <= 2 && editAll) { editAll.style.display = 'none'; }
        dataField.dispatchEvent(new Event('change', { bubbles: true }));
    });

    dom.delegate(body, 'click', '[data-collection-duplicate]', function(event, element) {
        event.preventDefault();
        let item = element.closest('[data-collection-item]'),
            list = item && item.parentElement,
            param = element.closest('.settings-param'),
            dataField = fieldFor(element);
        if (!item || !list || !param || !dataField) { return; }

        let items = directItems(list),
            index = items.indexOf(item),
            templateLink = param.querySelector('[data-collection-template] a'),
            clone = item.cloneNode(true),
            data = JSON.parse(dataField.value || '[]'),
            editAll = list.closest('[data-field-name]') && list.closest('[data-field-name]').querySelector('[data-collection-editall]');
        item.after(clone);
        let cloneLink = clone.querySelector('a');
        if (cloneLink && templateLink) { cloneLink.href = templateLink.href.replace(/%id%/g, items.length + 1); }

        data.splice(index, 0, JSON.parse(JSON.stringify(data[index])));
        dataField.value = JSON.stringify(data);
        if (items.length >= 1 && editAll) { editAll.style.display = 'inline-block'; }
        dataField.dispatchEvent(new Event('change', { bubbles: true }));
    });

    dom.delegate(body, 'click', '[data-collection-item] a', function(event, link) {
        if (link.querySelector('[contenteditable]')) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    dom.delegate(body, 'click', '[data-collection-item] .config-cog, [data-collection-editall]', function(event, element) {
        event.preventDefault();
        let editable = element.querySelector('[data-title-editable]');
        if (editable && editable.hasAttribute('contenteditable')) { event.stopPropagation(); return; }

        let isEditAll = element.hasAttribute('data-collection-editall'),
            parent = element.closest('.settings-param'),
            dataField = parent && parent.querySelector('[data-collection-data]'),
            item = element.closest('[data-collection-item]'),
            list = parent && parent.querySelector('ul');
        if (!parent || !dataField || !list) { return; }

        let items = directItems(list),
            data = dataField.value || '[]',
            itemIndex = item ? items.indexOf(item) : -1,
            dataPost = { data: isEditAll ? data : JSON.stringify(JSON.parse(data)[itemIndex]) };

        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            method: 'post',
            className: 'genesis-dialog-theme-default genesis-modal-collection genesis-modal-collection-' + (isEditAll ? 'editall' : 'single'),
            data: dataPost,
            overlayClickToClose: false,
            remote: parseAjaxURI(element.getAttribute('href') + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                if (!response.body.success) { modal.enableCloseByOverlay(); return; }

                let container = modal.element(content.elements.content),
                    form = container.querySelector('form'),
                    submits = container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]'),
                    dataValue = JSON.parse(data);

                if (modal.getAll().length > 1) {
                    container.querySelectorAll('[data-apply-and-save]').forEach(function(button) { button.remove(); });
                    submits = container.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');
                }
                if (!form || !submits.length) { return true; }

                submits.forEach(function(target) {
                    target.addEventListener('click', function(submitEvent) {
                        submitEvent.preventDefault();
                        indicator.hide(target);
                        indicator.show(target);
                        form = container.querySelector('form');
                        let post = Submit(form.elements, container);

                        if (post.invalid.length) {
                            indicator.hide(target);
                            indicator.show(target, 'fa fa-fw fa-exclamation-triangle');
                            toastr.error(translate('GENESIS_PLATFORM_JS_REVIEW_FIELDS'), translate('GENESIS_PLATFORM_JS_INVALID_FIELDS'));
                            return;
                        }

                        request(form.method, parseAjaxURI(form.action + getAjaxSuffix()), post.valid.join('&') || {}, function(error, resultResponse) {
                            let result = resultResponse && resultResponse.body;
                            if (!result || !result.success) {
                                modal.open({ content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.') });
                            } else {
                                if (itemIndex !== -1) { dataValue[itemIndex] = result.data; }
                                else { dataValue = result.data; }

                                dataField.value = JSON.stringify(dataValue);
                                dataField.dispatchEvent(new Event('change', { bubbles: true }));
                                directItems(list).forEach(function(collectionItem, index) {
                                    let label = collectionItem.querySelector('[data-title-editable]'),
                                        text = dataValue[index][collectionItem.getAttribute('data-collection-item')];
                                    if (label) {
                                        label.setAttribute('data-title-editable', text);
                                        label.textContent = text;
                                    }
                                });

                                if (target.hasAttribute('data-apply-and-save')) {
                                    let save = document.querySelector('.button-save');
                                    if (save) { save.click(); }
                                }
                                modal.close();
                                toastr.success(translate('GENESIS_PLATFORM_JS_GENERIC_SETTINGS_APPLIED', 'Collection'), translate('GENESIS_PLATFORM_JS_SETTINGS_APPLIED'));
                            }
                            indicator.hide(target);
                        });
                    });
                });
            }
        });
    });
});

export default {};
