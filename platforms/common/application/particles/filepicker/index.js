"use strict";

var dom           = require('../../utils/dom'),
    request       = require('../../utils/request'),
    modal         = require('../../ui').modal,
    popovers      = require('../../ui/popover'),
    Progresser    = require('../../ui/progresser'),
    indicator     = require('../../utils/indicator'),
    getAjaxSuffix = require('../../utils/get-ajax-suffix'),
    parseAjaxURI  = require('../../utils/get-ajax-url').parse,
    getAjaxURL    = require('../../utils/get-ajax-url').global,
    translate     = require('../../utils/translate'),
    Cookie        = require('../../utils/cookie'),
    dropzone      = require('dropzone').default;

var clone = function(value) {
    return JSON.parse(JSON.stringify(value));
};

var parseElement = function(html) {
    var template = document.createElement('template');
    template.innerHTML = String(html || '').trim();
    return template.content;
};

var animateOpacity = function(element, opacity, duration, callback) {
    if (!element) {
        if (callback) { callback(); }
        return;
    }

    var from = getComputedStyle(element).opacity,
        animation = element.animate([{ opacity: from }, { opacity: opacity }], {
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        });

    animation.finished.catch(function() {}).then(function() {
        element.style.opacity = opacity;
        animation.cancel();
        if (callback) { callback(); }
    });
};

var updateProgress = function(element, options) {
    if (!element) { return null; }
    if (!element.g5Progresser) {
        element.g5Progresser = new Progresser(element, options);
    } else {
        element.g5Progresser.update(options);
    }
    return element.g5Progresser;
};

class FilePicker {
    constructor(element) {
        var data = element.getAttribute('data-g5-filepicker');
        this.data = data ? JSON.parse(data) : false;

        if (this.data && !this.data.value) {
            var field = this.getField();
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
            var field = this.getField();
            this.data.value = field ? field.value : '';
        }

        modal.open({
            method: 'post',
            data: this.data,
            content: translate('GANTRY5_PLATFORM_JS_LOADING'),
            className: 'g5-dialog-theme-default g5-modal-filepicker',
            remote: parseAjaxURI(getAjaxURL('filepicker') + getAjaxSuffix()),
            remoteLoaded: this.loaded.bind(this),
            afterClose: function() {
                if (this.dropzone) {
                    this.dropzone.destroy();
                    this.dropzone = null;
                }
            }.bind(this)
        });
    }

    getPath() {
        var actives = this.content.querySelectorAll('.g-folders .active');
        if (!actives.length) { return null; }

        var data = JSON.parse(actives[actives.length - 1].getAttribute('data-folder')),
            path = data.pathname;
        return path.replace(/\/$/, '') + '/';
    }

    getPreviewTemplate() {
        return '<li data-file>' +
            '<span class="g-file-delete" data-g-file-delete data-dz-remove><i class="fa fa-fw fa-trash-o fa-trash-alt" aria-hidden="true"></i></span>' +
            '<div class="g-thumb" data-dz-thumbnail><div></div></div>' +
            '<span class="g-file-name" data-dz-name></span>' +
            '<span class="g-file-size" data-dz-size></span>' +
            '<span class="g-file-mtime" data-dz-mtime></span>' +
            '<span class="g-file-progress" data-file-uploadprogress><span class="g-file-progress-text"></span></span>' +
            '</li>';
    }

    loaded(response, modalInstance) {
        var content   = modal.element(modalInstance.elements.content),
            files     = content && content.querySelector('.g-files'),
            fieldData = clone(this.data),
            colors    = this.colors,
            self      = this;

        if (!content) { return false; }
        this.content = content;

        if (files) {
            var previews = files.querySelector('ul:not(.g-list-labels)');
            this.dropzone = new dropzone('body', {
                previewTemplate: this.getPreviewTemplate(),
                previewsContainer: previews,
                thumbnailWidth: 100,
                thumbnailHeight: 100,
                clickable: '[data-upload]',
                acceptedFiles: this.acceptedFiles(this.data.filter) || '',
                accept: function(file, done) {
                    if (!this.data.filter || file.name.toLowerCase().match(this.data.filter)) {
                        done();
                    } else {
                        done('<code>' + file.name + '</code> ' + translate('GANTRY5_PLATFORM_JS_FILTER_MISMATCH') + ': <br />  <code>' + this.data.filter + '</code>');
                    }
                }.bind(this),
                url: function(file) {
                    return parseAjaxURI(getAjaxURL('filepicker/upload/' + global.btoa(encodeURIComponent(this.getPath() + file[0].name))) + getAjaxSuffix());
                }.bind(this)
            });

            this.dropzone.on('thumbnail', function(file, dataUrl) {
                var ext = file.name.split('.');
                ext = (!ext.length || ext.length === 1) ? '-' : ext.reverse()[0];
                var element = file.previewElement,
                    thumbnail = element.querySelector('[data-dz-thumbnail] > div');
                element.classList.add('g-image', 'g-image-' + ext.toLowerCase());
                if (thumbnail) { thumbnail.style.backgroundImage = 'url(' + encodeURI(dataUrl) + ')'; }
            });

            this.dropzone.on('addedfile', function(file) {
                var element      = file.previewElement,
                    uploader     = element.querySelector('[data-file-uploadprogress]'),
                    isList       = files.classList.contains('g-filemode-list'),
                    progressConf = {
                        value: 0,
                        animation: false,
                        insertLocation: 'bottom'
                    },
                    ext = file.name.split('.');

                ext = (!ext.length || ext.length === 1) ? '-' : ext.reverse()[0];
                var thumb = element.querySelector('.g-thumb');
                if (!file.type.match(/image.*/)) {
                    if (thumb) { thumb.textContent = ext; }
                } else if (thumb) {
                    thumb.classList.add('g-image', 'g-image-' + ext.toLowerCase());
                }

                Object.assign(progressConf, isList ? {
                    size: 20,
                    thickness: 10,
                    fill: { color: colors.small, gradient: false }
                } : {
                    size: 50,
                    thickness: 'auto',
                    fill: { gradient: colors.gradient, color: false }
                });

                element.classList.add('g-file-uploading');
                updateProgress(uploader, progressConf);
                uploader.title = translate('GANTRY5_PLATFORM_JS_PROCESSING');
                var progressText = uploader.querySelector('.g-file-progress-text');
                if (progressText) {
                    progressText.innerHTML = '&bull;&bull;&bull;';
                    progressText.title = translate('GANTRY5_PLATFORM_JS_PROCESSING');
                }
            }).on('processing', function(file) {
                self.setProgressText(file.previewElement, '0%');
            }).on('sending', function(file) {
                self.setProgressText(file.previewElement, '0%');
            }).on('uploadprogress', function(file, progress) {
                var uploader = file.previewElement.querySelector('[data-file-uploadprogress]'),
                    label = Math.round(progress) + '%';
                updateProgress(uploader, { value: progress / 100 });
                self.setProgressText(file.previewElement, label);
            }).on('complete', function() {
                self.refreshFiles();
            }).on('error', function(file, error) {
                var element  = file.previewElement,
                    uploader = element.querySelector('[data-file-uploadprogress]'),
                    text     = element.querySelector('.g-file-progress-text'),
                    isList   = files.classList.contains('g-filemode-list');

                element.classList.add('g-file-error');
                uploader.title = 'Error';
                updateProgress(uploader, {
                    fill: { color: colors.error, gradient: false },
                    value: 1,
                    thickness: isList ? 10 : 25
                });

                if (text) {
                    text.title = 'Error';
                    text.innerHTML = '<i class="fa fa-exclamation" aria-hidden="true"></i>';
                    popovers.create(uploader, {
                        content: error && error.html ? error.html : (error && error.error && error.error.message ? error.error.message : error),
                        placement: 'auto',
                        trigger: 'mouse',
                        style: 'filepicker, above-modal',
                        width: 'auto',
                        targetEvents: false
                    });
                }
            }).on('success', function(file, uploadResponse) {
                var element  = file.previewElement,
                    uploader = element.querySelector('[data-file-uploadprogress]'),
                    mtime    = element.querySelector('.g-file-mtime'),
                    text     = element.querySelector('.g-file-progress-text'),
                    thumb    = element.querySelector('.g-thumb'),
                    isList   = files.classList.contains('g-filemode-list');

                updateProgress(uploader, {
                    fill: { color: colors.success, gradient: false },
                    value: 1,
                    thickness: isList ? 10 : 25
                });
                if (text) { text.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>'; }

                setTimeout(function() {
                    animateOpacity(uploader, 0, 500);
                    animateOpacity(thumb, 1, 500, function() {
                        element.setAttribute('data-file', JSON.stringify(uploadResponse.finfo));
                        element.setAttribute('data-file-url', uploadResponse.url);
                        element.classList.remove('g-file-uploading');
                        element.dropzone = file;
                        if (uploader) { uploader.remove(); }
                        if (mtime) { mtime.textContent = translate('GANTRY5_PLATFORM_JUST_NOW'); }
                    });
                }, 500);
            });
        }

        dom.delegate(content, 'click', '.g-bookmark-title', function(event, element) {
            event.preventDefault();
            var sibling = element.nextElementSibling,
                parent = element.closest('.g-bookmark');
            if (!sibling || !sibling.matches('.g-folders')) { return; }
            sibling.hidden = !sibling.hidden;
            if (parent) { parent.classList.toggle('collapsed', sibling.hidden); }
        });

        dom.delegate(content, 'click', '[data-folder]', function(event, element) {
            event.preventDefault();
            var data = JSON.parse(element.getAttribute('data-folder')),
                selected = files && files.querySelector('[data-file].selected');

            fieldData.root = data.pathname;
            fieldData.value = selected ? selected.getAttribute('data-file-url') : false;
            fieldData.subfolder = true;

            indicator.show(element, 'fa fa-li fa-fw fa-spin-fast fa-spinner');
            request(parseAjaxURI(getAjaxURL('filepicker') + getAjaxSuffix()), fieldData).send(function(error, folderResponse) {
                indicator.hide(element);
                this.addActiveState(element);

                var result = folderResponse && folderResponse.body;
                if (!result || !result.success) {
                    modal.open({
                        content: result ? (result.html || result.message || result) : (error ? error.message : 'Request failed.')
                    });
                    return;
                }

                if (result.subfolder) {
                    var next = element.nextElementSibling;
                    if (next && !next.hasAttribute('data-folder')) { next.remove(); }
                    var fragment = parseElement(result.subfolder),
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
                        var list = files.querySelector('ul:not(.g-list-labels)');
                        if (list) { list.replaceChildren(); }
                    }
                    this.dropzone.previewsContainer = files.querySelector('ul:not(.g-list-labels)');
                }
            }.bind(this));
        }.bind(this));

        dom.delegate(content, 'click', '[data-g-file-preview]', function(event, element) {
            event.preventDefault();
            event.stopPropagation();
            var parent = element.closest('[data-file]'),
                data = parent && JSON.parse(parent.getAttribute('data-file'));
            if (!parent || !data || !data.isImage) { return; }

            var thumb = parent.querySelector('.g-thumb > div'),
                background = thumb && thumb.style.backgroundImage;
            if (background) {
                modal.open({
                    className: 'g5-dialog-theme-default g5-modal-filepreview center',
                    content: '<img src="' + background.slice(4, -1).replace(/"/g, '') + '" />'
                });
            }
        });

        dom.delegate(content, 'click', '[data-g-file-delete]', function(event, element) {
            event.preventDefault();
            var parent = element.closest('[data-file]'),
                data = parent && JSON.parse(parent.getAttribute('data-file'));
            if (!parent || !data || !data.isInCustom) { return; }

            var deleteURI = parseAjaxURI(getAjaxURL('filepicker/' + global.btoa(encodeURIComponent(data.pathname)) + getAjaxSuffix()));
            request('delete', deleteURI, function(error, deleteResponse) {
                var result = deleteResponse && deleteResponse.body;
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
            var remove = event.target.closest('[data-g-file-delete]'),
                preview = event.target.closest('[data-g-file-preview]');
            if (element.classList.contains('g-file-error') || element.classList.contains('g-file-uploading') || remove || preview) { return; }
            files.querySelectorAll('[data-file]').forEach(function(file) { file.classList.remove('selected'); });
            element.classList.add('selected');
        });

        dom.delegate(content, 'click', '[data-select]', function(event) {
            event.preventDefault();
            var selected = files && files.querySelector('[data-file].selected'),
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
            Cookie.write('g5_files_mode', element.getAttribute('data-files-mode'));

            animateOpacity(files, 0, 200, function() {
                var mode = element.getAttribute('data-files-mode'),
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
                    var config = clone(progressConf);
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
        var uploader = preview.querySelector('[data-file-uploadprogress]'),
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

        var parent = element.parentElement;
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
        var active = this.content.querySelectorAll('[data-folder].active'),
            folder = active[active.length - 1];
        if (folder) { folder.click(); }
    }
}

dom.ready(function() {
    dom.delegate(document.body, 'click', '[data-g5-filepicker]', function(event, element) {
        event.preventDefault();
        if (!element.GantryFilePicker) {
            element.GantryFilePicker = new FilePicker(element);
        }
        element.GantryFilePicker.open();
    });
});

module.exports = FilePicker;
