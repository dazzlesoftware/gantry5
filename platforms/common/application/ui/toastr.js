"use strict";

var $ = require('../utils/elements.utils.js');

var merge = function(target) {
    target = target || {};
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        Object.keys(source || {}).forEach(function(key) {
            var value = source[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                target[key] = merge(
                    target[key] && typeof target[key] === 'object' ? target[key] : {},
                    value
                );
            } else {
                target[key] = value;
            }
        });
    });
    return target;
};

var defaults = {
    tapToDismiss: true,
    noticeClass: 'g-notifications',
    containerID: 'g-notifications-container',
    types: {
        base: '',
        error: 'fa-minus-circle',
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle'
    },
    showDuration: 300,
    showEquation: 'cubic-bezier(0.02, 0.01, 0.47, 1)',
    hideDuration: 500,
    hideEquation: 'cubic-bezier(0.02, 0.01, 0.47, 1)',
    timeOut: 2500,
    extendedTimeout: 2500,
    location: 'bottom-right',
    titleClass: 'g-notifications-title',
    messageClass: 'g-notifications-message',
    closeButton: true,
    target: '#g5-container',
    targetLocation: 'bottom',
    newestOnTop: true,
    preventDuplicates: false,
    progressBar: true
};

var createElement = function(tag, className, attributes) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    Object.keys(attributes || {}).forEach(function(name) {
        node.setAttribute(name, attributes[name]);
    });
    return $(node);
};

var prepend = function(child, parent) {
    parent[0].insertBefore(child[0], parent[0].firstChild);
};

class Toaster {
    constructor(options) {
        this.options = merge({}, defaults, options || {});
        this.id = 0;
        this.previousNotice = null;
        this.map = new Map();
    }

    mergeOptions(options) {
        return merge(this.options, options || {});
    }

    base(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, { title: title || '', type: options.type || 'base', message: message }));
    }

    success(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, { title: title || 'Success!', type: 'success', message: message }));
    }

    info(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, { title: title || 'Info', type: 'info', message: message }));
    }

    warning(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, { title: title || 'Warning!', type: 'warning', message: message }));
    }

    error(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, { title: title || 'Error!', type: 'error', message: message }));
    }

    notify(options) {
        options = this.mergeOptions(options);
        if (options.preventDuplicates && this.previousNotice === options.message) { return; }

        this.id++;
        this.previousNotice = options.message;

        var container = this.getContainer(options, true),
            element = createElement('div'),
            title = createElement('div'),
            message = createElement('div'),
            icon = createElement('i', 'fa'),
            progress = createElement('div', 'g-notifications-progress'),
            close = createElement('a', 'fa fa-close', { href: '#' });

        this.map.set(element, {
            container: container,
            interval: null,
            progressBar: { interval: null, hideETA: null, maxHideTime: null },
            response: { id: this.id, state: 'visible', start: new Date(), options: options },
            options: options
        });

        if (options.title) { element.appendChild(title.html(options.title).addClass(options.titleClass)); }
        if (options.message) { element.appendChild(message.html(options.message).addClass(options.messageClass)); }
        if (options.closeButton) { prepend(close, element); }
        if (options.progressBar) { prepend(progress, element); }

        if (options.type && options.title && options.types[options.type]) {
            element.addClass('g-notifications-theme-' + options.type);
            prepend(icon.addClass(options.types[options.type]), title);
        }

        element.style({ opacity: 0 });
        if (options.newestOnTop) { prepend(element, container); }
        else { container[0].appendChild(element[0]); }

        element.animate({ opacity: 1 }, {
            duration: options.showDuration,
            equation: options.showEquation,
            callback: options.onShow
        });

        if (options.timeOut > 0) {
            var map = this.map.get(element);
            map.interval = setTimeout(function() { this.hide(element); }.bind(this), options.timeOut);
            map.progressBar.maxHideTime = parseFloat(options.timeOut);
            map.progressBar.hideETA = Date.now() + map.progressBar.maxHideTime;

            if (options.progressBar) {
                map.progressBar.interval = setInterval(function() {
                    this.updateProgress(element, progress);
                }.bind(this), 10);
            }
        }

        var stick = function() { this.stickAround(element); }.bind(this),
            delay = function() { this.delayedHide(element); }.bind(this);
        element.on('mouseover', stick);
        element.on('mouseout', delay);

        if (!options.onClick && options.tapToDismiss) {
            element.on('click', function() {
                element.off('mouseover', stick);
                element.off('mouseout', delay);
                this.hide(element);
            }.bind(this));
        } else if (options.onClick) {
            element.on('click', options.onClick);
        }

        if (options.closeButton) {
            close.on('click', function(event) {
                event.stopPropagation();
                event.preventDefault();
                element.off('mouseover', stick);
                element.off('mouseout', delay);
                this.hide(element, true);
            }.bind(this));
        }
    }

    stickAround(element) {
        var map = this.map.get(element);
        clearTimeout(map.interval);
        map.progressBar.hideETA = 0;
        element.animate({ opacity: 1 }, {
            duration: map.options.showDuration,
            equation: map.options.showEquation,
            callback: map.options.onShow
        });
    }

    hide(element, override) {
        if (element.find(':focus') && !override) { return; }
        var map = this.map.get(element);
        clearTimeout(map.progressBar.interval);
        return element.animate({ opacity: 0 }, {
            duration: map.options.hideDuration,
            equation: map.options.hideEquation,
            callback: function() {
                this.remove(element);
                if (map.options.onHidden && map.response.state !== 'hidden') { map.options.onHidden(); }
                map.response.state = 'hidden';
                map.response.endTime = new Date();
            }.bind(this)
        });
    }

    delayedHide(element) {
        var map = this.map.get(element);
        if (map.options.timeOut > 0 || map.options.extendedTimeout > 0) {
            map.interval = setTimeout(function() { this.hide(element); }.bind(this), map.options.extendedTimeout);
            map.progressBar.maxHideTime = parseFloat(map.options.extendedTimeout);
            map.progressBar.hideETA = Date.now() + map.progressBar.maxHideTime;
        }
    }

    updateProgress(element, progress) {
        var map = this.map.get(element),
            percentage = ((map.progressBar.hideETA - Date.now()) / map.progressBar.maxHideTime) * 100;
        progress.style({ width: percentage + '%' });
    }

    getContainer(options, create) {
        options = this.mergeOptions(options);
        var container = $('#' + options.containerID);
        if (container) { return container; }
        return create ? this.createContainer(options) : container;
    }

    createContainer(options) {
        options = this.mergeOptions(options);
        var container = createElement('div', options.location, {
                id: options.containerID,
                'aria-live': 'polite',
                role: 'alert'
            }),
            target = $(options.target);

        if (options.targetLocation === 'top') { prepend(container, target); }
        else { target[0].appendChild(container[0]); }
        return container;
    }

    remove(element) {
        if (!element) { return; }
        var map = this.map.get(element);
        if (!map.container) { map.container = this.getContainer(map.options); }
        element.remove();
        if (!map.container.children()) {
            map.container.remove();
            this.previousNotice = null;
        }
        this.map.delete(element);
    }
}

module.exports = new Toaster();
