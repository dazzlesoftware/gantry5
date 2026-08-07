import __module0 from '../../utils/dom.js';
import __module1 from '../../utils/request.js';
import __module2 from '../../ui/index.js';
import __module3 from '../../ui/popover.js';
import __module4 from '../../ui/progresser.js';
import __module5 from '../../utils/indicator.js';
import __module6 from '../../utils/get-ajax-suffix.js';
import __module7 from '../../utils/get-ajax-url.js';
import __module8 from '../../utils/translate.js';
import __module9 from '../../utils/cookie.js';

"use strict";

let dom           = __module0,
    request       = __module1,
    modal         = __module2.modal,
    popovers      = __module3,
    Progresser    = __module4,
    indicator     = __module5,
    getAjaxSuffix = __module6,
    parseAjaxURI  = __module7.parse,
    getAjaxURL    = __module7.global,
    translate     = __module8,
    Cookie        = __module9;

let clone = function(value) {
    return JSON.parse(JSON.stringify(value));
};

let parseElement = function(html) {
    let template = document.createElement('template');
    template.innerHTML = String(html || '').trim();
    return template.content;
};

let animateOpacity = function(element, opacity, duration, callback) {
    if (!element) {
        if (callback) { callback(); }
        return;
    }

    let from = getComputedStyle(element).opacity,
        animation = element.animate([{ opacity: from }, { opacity: opacity }], {
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        });

    animation.finished.catch(function(error) {
        if (error.name !== 'AbortError') console.warn('File picker animation failed.', error);
    }).then(function() {
        element.style.opacity = opacity;
        animation.cancel();
        if (callback) { callback(); }
    });
};

let updateProgress = function(element, options) {
    if (!element) { return null; }
    if (!element.genesisProgresser) {
        element.genesisProgresser = new Progresser(element, options);
    } else {
        element.genesisProgresser.update(options);
    }
    return element.genesisProgresser;
};

let fileExtension = function(file) {
    let parts = file.name.split('.');
    return (!parts.length || parts.length === 1) ? '-' : parts.pop().toLowerCase();
};

let formatBytes = function(bytes) {
    let units = ['B', 'KB', 'MB', 'GB', 'TB'],
        value = Number(bytes) || 0,
        unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }

    return (unit ? value.toFixed(2) : value) + ' ' + units[unit];
};

class NativeUploader {
    constructor(filePicker, files, previewsContainer) {
        this.filePicker = filePicker;
        this.files = files;
        this.previewsContainer = previewsContainer;
        this.requests = new Set();
        this.refreshTimer = null;

        this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.multiple = true;
        this.input.hidden = true;
        this.input.accept = filePicker.acceptedFiles(filePicker.data.filter);
        filePicker.content.appendChild(this.input);

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDrop = this.handleDrop.bind(this);

        filePicker.content.addEventListener('click', this.handleClick);
        filePicker.content.addEventListener('dragenter', this.handleDrag);
        filePicker.content.addEventListener('dragover', this.handleDrag);
        filePicker.content.addEventListener('dragleave', this.handleDrag);
        filePicker.content.addEventListener('drop', this.handleDrop);
        this.input.addEventListener('change', this.handleChange);
    }

    setPreviewsContainer(container) {
        this.previewsContainer = container;
    }

    handleClick(event) {
        if (!event.target.closest('[data-upload]')) return;
        event.preventDefault();
        this.input.click();
    }

    handleChange() {
        this.addFiles(this.input.files);
        this.input.value = '';
    }

    handleDrag(event) {
        if (!event.dataTransfer || !Array.from(event.dataTransfer.types || []).includes('Files')) return;
        event.preventDefault();
        if (event.type === 'dragenter' || event.type === 'dragover') {
            this.files.classList.add('g-file-dragover');
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        } else {
            this.files.classList.remove('g-file-dragover');
        }
    }

    handleDrop(event) {
        this.handleDrag(event);
        this.files.classList.remove('g-file-dragover');
        if (event.dataTransfer) this.addFiles(event.dataTransfer.files);
    }

    addFiles(fileList) {
        Array.from(fileList || []).forEach(file => this.upload(file));
    }

    accepts(file) {
        if (!this.filePicker.data.filter) return true;
        try {
            return new RegExp(this.filePicker.data.filter, 'i').test(file.name);
        } catch (error) {
            return true;
        }
    }

    createPreview(file) {
        if (!this.previewsContainer) return null;

        let empty = this.previewsContainer.querySelector('.no-files-found');
        if (empty) empty.remove();

        let fragment = parseElement(this.filePicker.getPreviewTemplate()),
            element = fragment.firstElementChild,
            extension = fileExtension(file),
            thumb = element.querySelector('.g-thumb'),
            name = element.querySelector('.g-file-name'),
            size = element.querySelector('.g-file-size');

        if (name) name.textContent = file.name;
        if (size) size.textContent = formatBytes(file.size);

        element.classList.add('g-file-uploading');
        element.classList.add('g-image-' + extension);
        if (file.type && file.type.indexOf('image/') === 0) {
            if (thumb) thumb.classList.add('g-image', 'g-image-' + extension);
            let reader = new FileReader();
            reader.addEventListener('load', function() {
                let thumbnail = element.querySelector('[data-upload-thumbnail] > div');
                if (thumbnail) thumbnail.style.backgroundImage = 'url("' + reader.result + '")';
            }, { once: true });
            reader.readAsDataURL(file);
        } else if (thumb) {
            thumb.textContent = extension;
        }

        this.previewsContainer.appendChild(element);
        return element;
    }

    prepareProgress(element) {
        let uploader = element.querySelector('[data-file-uploadprogress]'),
            isList = this.files.classList.contains('g-filemode-list'),
            config = {
                value: 0,
                animation: false,
                insertLocation: 'bottom'
            };

        Object.assign(config, isList ? {
            size: 20,
            thickness: 10,
            fill: { color: this.filePicker.colors.small, gradient: false }
        } : {
            size: 50,
            thickness: 'auto',
            fill: { gradient: this.filePicker.colors.gradient, color: false }
        });

        updateProgress(uploader, config);
        uploader.title = translate('GENESIS_PLATFORM_JS_PROCESSING');
        this.filePicker.setProgressText(element, '0%');
    }

    showError(element, error) {
        let uploader = element.querySelector('[data-file-uploadprogress]'),
            text = element.querySelector('.g-file-progress-text'),
            isList = this.files.classList.contains('g-filemode-list'),
            message = error && error.html
                ? error.html
                : (error && error.error && error.error.message
                    ? error.error.message
                    : (error && error.message ? error.message : error));

        element.classList.add('g-file-error');
        uploader.title = 'Error';
        updateProgress(uploader, {
            fill: { color: this.filePicker.colors.error, gradient: false },
            value: 1,
            thickness: isList ? 10 : 25
        });

        if (text) {
            text.title = 'Error';
            text.innerHTML = '<i class="fa fa-exclamation" aria-hidden="true"></i>';
            popovers.create(uploader, {
                content: message || 'Upload failed.',
                placement: 'auto',
                trigger: 'mouse',
                style: 'filepicker, above-modal',
                width: 'auto',
                targetEvents: false
            });
        }
    }

    showSuccess(element, uploadResponse) {
        let uploader = element.querySelector('[data-file-uploadprogress]'),
            mtime = element.querySelector('.g-file-mtime'),
            text = element.querySelector('.g-file-progress-text'),
            thumb = element.querySelector('.g-thumb'),
            isList = this.files.classList.contains('g-filemode-list');

        updateProgress(uploader, {
            fill: { color: this.filePicker.colors.success, gradient: false },
            value: 1,
            thickness: isList ? 10 : 25
        });
        if (text) text.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';

        window.setTimeout(function() {
            animateOpacity(uploader, 0, 500);
            animateOpacity(thumb, 1, 500, function() {
                element.setAttribute('data-file', JSON.stringify(uploadResponse.finfo));
                element.setAttribute('data-file-url', uploadResponse.url);
                element.classList.remove('g-file-uploading');
                if (uploader) uploader.remove();
                if (mtime) mtime.textContent = translate('GENESIS_PLATFORM_JUST_NOW');
            });
        }, 500);
    }

    parseResponse(xhr) {
        if (xhr.response && typeof xhr.response === 'object') return xhr.response;
        let text = '';
        try {
            text = xhr.responseText || '';
        } catch (error) {
            return 'Upload failed.';
        }
        try {
            return JSON.parse(text);
        } catch (error) {
            return text || 'Upload failed.';
        }
    }

    upload(file) {
        let element = this.createPreview(file);
        if (!element) return;

        this.prepareProgress(element);

        if (!this.accepts(file)) {
            this.showError(
                element,
                file.name + ' ' + translate('GENESIS_PLATFORM_JS_FILTER_MISMATCH') + ': ' + this.filePicker.data.filter
            );
            return;
        }

        let path = this.filePicker.getPath();
        if (!path) {
            this.showError(element, 'Select an upload folder first.');
            return;
        }

        let url = parseAjaxURI(
                getAjaxURL('filepicker/upload/' + window.btoa(encodeURIComponent(path + file.name)))
                + getAjaxSuffix()
            ),
            form = new FormData(),
            xhr = new XMLHttpRequest();

        form.append('file', file, file.name);
        this.requests.add(xhr);

        xhr.open('POST', url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.upload.addEventListener('progress', function(event) {
            if (!event.lengthComputable) return;
            let progress = (event.loaded / event.total) * 100,
                uploader = element.querySelector('[data-file-uploadprogress]');
            updateProgress(uploader, { value: progress / 100 });
            this.filePicker.setProgressText(element, Math.round(progress) + '%');
        }.bind(this));
        xhr.addEventListener('load', function() {
            this.requests.delete(xhr);
            let response = this.parseResponse(xhr);
            if (xhr.status >= 200 && xhr.status < 300 && response && response.finfo) {
                this.showSuccess(element, response);
                window.clearTimeout(this.refreshTimer);
                this.refreshTimer = window.setTimeout(this.filePicker.refreshFiles.bind(this.filePicker), 1100);
            } else {
                this.showError(element, response);
            }
        }.bind(this));
        xhr.addEventListener('error', function() {
            this.requests.delete(xhr);
            this.showError(element, 'Upload failed.');
        }.bind(this));
        xhr.addEventListener('abort', function() {
            this.requests.delete(xhr);
        }.bind(this));
        xhr.send(form);
    }

    destroy() {
        window.clearTimeout(this.refreshTimer);
        this.requests.forEach(xhr => xhr.abort());
        this.requests.clear();
        this.filePicker.content.removeEventListener('click', this.handleClick);
        this.filePicker.content.removeEventListener('dragenter', this.handleDrag);
        this.filePicker.content.removeEventListener('dragover', this.handleDrag);
        this.filePicker.content.removeEventListener('dragleave', this.handleDrag);
        this.filePicker.content.removeEventListener('drop', this.handleDrop);
        this.input.removeEventListener('change', this.handleChange);
        this.input.remove();
    }
}

class FilePicker {
    constructor(element) {
        let data = element.getAttribute('data-genesis-filepicker');
        this.data = data ? JSON.parse(data) : false;

        if (this.data && !this.data.value) {
            let field = this.getField();
            this.data.value = field ? field.value : '';
        }

        this.colors = {
            error: '#D84747',
            success: '#9ADF87',
            small: '#aaaaaa',
            gradient: ['#9e38eb', '#4e68fc']
        };
    }

    getField() {
        if (!this.data || !this.data.field) { return null; }
        if (this.data.field.nodeType) { return this.data.field; }
        return document.querySelector(this.data.field);
    }

    open() {
        if (this.data) {
            let field = this.getField();
            this.data.value = field ? field.value : '';
        }

        modal.open({
            method: 'post',
            data: this.data,
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            className: 'genesis-dialog-theme-default genesis-modal-filepicker',
            remote: parseAjaxURI(getAjaxURL('filepicker') + getAjaxSuffix()),
            remoteLoaded: this.loaded.bind(this),
            afterClose: function() {
                if (this.uploader) {
                    this.uploader.destroy();
                    this.uploader = null;
                }
            }.bind(this)
        });
    }

    getPath() {
        let actives = this.content.querySelectorAll('.g-folders .active');
        if (!actives.length) { return null; }

        let data = JSON.parse(actives[actives.length - 1].getAttribute('data-folder')),
            path = data.pathname;
        return path.replace(/\/$/, '') + '/';
    }

    getPreviewTemplate() {
        return '<li data-file>' +
            '<div class="g-thumb" data-upload-thumbnail><div></div></div>' +
            '<span class="g-file-name"></span>' +
            '<span class="g-file-size"></span>' +
            '<span class="g-file-mtime"></span>' +
            '<span class="g-file-progress" data-file-uploadprogress><span class="g-file-progress-text"></span></span>' +
            '</li>';
    }

    loaded(response, modalInstance) {
        let content   = modal.element(modalInstance.elements.content),
            files     = content && content.querySelector('.g-files'),
            fieldData = clone(this.data),
            colors    = this.colors,
            self      = this;

        if (!content) { return false; }
        this.content = content;

        if (files) {
            let previews = files.querySelector('ul:not(.g-list-labels)');
            this.uploader = new NativeUploader(this, files, previews);
        }

        dom.delegate(content, 'click', '.g-bookmark-title', function(event, element) {
            event.preventDefault();
            let sibling = element.nextElementSibling,
                parent = element.closest('.g-bookmark');
            if (!sibling || !sibling.matches('.g-folders')) { return; }
            sibling.hidden = !sibling.hidden;
            if (parent) { parent.classList.toggle('collapsed', sibling.hidden); }
        });

        dom.delegate(content, 'click', '[data-folder]', function(event, element) {
            event.preventDefault();
            let data = JSON.parse(element.getAttribute('data-folder')),
                selected = files && files.querySelector('[data-file].selected');

            fieldData.root = data.pathname;
            fieldData.value = selected ? selected.getAttribute('data-file-url') : false;
            fieldData.subfolder = true;

            indicator.show(element, 'fa fa-li fa-fw fa-spin-fast fa-spinner');
            request(parseAjaxURI(getAjaxURL('filepicker') + getAjaxSuffix()), fieldData).send(function(error, folderResponse) {
                indicator.hide(element);
                this.addActiveState(element);

                let result = folderResponse && folderResponse.body;
                if (!result || !result.success) {
                    modal.open({
                        content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.')
                    });
                    return;
                }

                if (result.subfolder) {
                    let next = element.nextElementSibling;
                    if (next && !next.hasAttribute('data-folder')) { next.remove(); }
                    let fragment = parseElement(result.subfolder),
                        anchor = element;
                    Array.from(fragment.children).forEach(function(child) {
                        anchor.after(child);
                        anchor = child;
                    });
                }

                if (files) {
                    if (result.files) {
                        files.replaceChildren(parseElement(result.files));
                    } else {
                        let list = files.querySelector('ul:not(.g-list-labels)');
                        if (list) { list.replaceChildren(); }
                    }
                    this.uploader.setPreviewsContainer(files.querySelector('ul:not(.g-list-labels)'));
                }
            }.bind(this));
        }.bind(this));

        dom.delegate(content, 'click', '[data-g-file-preview]', function(event, element) {
            event.preventDefault();
            event.stopPropagation();
            let parent = element.closest('[data-file]'),
                data = parent && JSON.parse(parent.getAttribute('data-file'));
            if (!parent || !data || !data.isImage) { return; }

            let thumb = parent.querySelector('.g-thumb > div'),
                background = thumb && thumb.style.backgroundImage;
            if (background) {
                modal.open({
                    className: 'genesis-dialog-theme-default genesis-modal-filepreview center',
                    content: '<img src="' + background.slice(4, -1).replace(/"/g, '') + '" />'
                });
            }
        });

        dom.delegate(content, 'click', '[data-g-file-delete]', function(event, element) {
            event.preventDefault();
            let parent = element.closest('[data-file]'),
                data = parent && JSON.parse(parent.getAttribute('data-file'));
            if (!parent || !data || !data.isInCustom) { return; }

            let deleteURI = parseAjaxURI(getAjaxURL('filepicker/' + window.btoa(encodeURIComponent(data.pathname)) + getAjaxSuffix()));
            request('delete', deleteURI, function(error, deleteResponse) {
                let result = deleteResponse && deleteResponse.body;
                if (!result || !result.success) {
                    modal.open({ content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.') });
                    return;
                }

                parent.classList.add('g-file-deleted');
                setTimeout(function() {
                    parent.remove();
                    self.refreshFiles();
                }, 210);
            });
        });

        dom.delegate(content, 'click', '[data-file]', function(event, element) {
            event.preventDefault();
            let remove = event.target.closest('[data-g-file-delete]'),
                preview = event.target.closest('[data-g-file-preview]');
            if (element.classList.contains('g-file-error') || element.classList.contains('g-file-uploading') || remove || preview) { return; }
            files.querySelectorAll('[data-file]').forEach(function(file) { file.classList.remove('selected'); });
            element.classList.add('selected');
        });

        dom.delegate(content, 'click', '[data-select]', function(event) {
            event.preventDefault();
            let selected = files && files.querySelector('[data-file].selected'),
                field = this.getField();
            if (field) {
                field.value = selected ? selected.getAttribute('data-file-url') : '';
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
            modal.close();
        }.bind(this));

        dom.delegate(content, 'click', '[data-files-mode]', function(event, element) {
            event.preventDefault();
            if (element.classList.contains('active')) { return; }

            content.querySelectorAll('[data-files-mode]').forEach(function(mode) { mode.classList.remove('active'); });
            element.classList.add('active');
            const mode = element.getAttribute('data-files-mode');
            Cookie.write('genesis_files_mode', mode);
            Cookie.write('genesis_files_mode', mode);

            animateOpacity(files, 0, 200, function() {
                let mode = element.getAttribute('data-files-mode'),
                    progressConf = mode === 'list' ? {
                        size: 20,
                        thickness: 10,
                        fill: { color: colors.small, gradient: false }
                    } : {
                        size: 50,
                        thickness: 'auto',
                        fill: { gradient: colors.gradient, color: false }
                    };

                files.className = 'g-files g-block g-filemode-' + mode;
                files.querySelectorAll('[data-file-uploadprogress]').forEach(function(progressElement) {
                    let config = clone(progressConf);
                    if (progressElement.closest('.g-file-error')) {
                        config.fill = { color: colors.error };
                        config.value = 1;
                        config.thickness = mode === 'list' ? 10 : 25;
                    }
                    updateProgress(progressElement, config);
                });
                animateOpacity(files, 1, 200);
            });
        });
    }

    setProgressText(preview, value) {
        let uploader = preview.querySelector('[data-file-uploadprogress]'),
            text = preview.querySelector('.g-file-progress-text');
        if (uploader) { uploader.title = value; }
        if (text) {
            text.textContent = value;
            text.title = value;
        }
    }

    addActiveState(element) {
        this.content.querySelectorAll('[data-folder].active, .g-folders > .active').forEach(function(opened) {
            opened.classList.remove('active');
        });
        element.classList.add('active');

        let parent = element.parentElement;
        while (parent && parent.tagName === 'UL' && !parent.classList.contains('g-folders')) {
            if (parent.previousElementSibling) { parent.previousElementSibling.classList.add('active'); }
            parent = parent.parentElement;
        }
    }

    acceptedFiles(filter) {
        switch (filter) {
            case '.(jpe?g|gif|png|svg)$':
                return '.jpg,.jpeg,.gif,.png,.svg,.JPG,.JPEG,.GIF,.PNG,.SVG';
            case '.(mp4|webm|ogv|mov)$':
                return '.mp4,.webm,.ogv,.mov,.MP4,.WEBM,.OGV,.MOV';
            default:
                return '';
        }
    }

    refreshFiles() {
        let active = this.content.querySelectorAll('[data-folder].active'),
            folder = active[active.length - 1];
        if (folder) { folder.click(); }
    }
}

dom.ready(function() {
    dom.delegate(document.body, 'click', '[data-genesis-filepicker]', function(event, element) {
        event.preventDefault();
        if (!element.GenesisFilePicker) {
            element.GenesisFilePicker = new FilePicker(element);
        }
        element.GenesisFilePicker.open();
    });
});

export default FilePicker;
