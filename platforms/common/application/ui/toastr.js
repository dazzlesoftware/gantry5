"use strict";

let merge = function(target) {
    target = target || {};
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        Object.keys(source || {}).forEach(function(key) {
            let value = source[key];
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

let defaults = {
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
    target: '[data-genesis-container]',
    targetLocation: 'bottom',
    newestOnTop: true,
    preventDuplicates: false,
    progressBar: true
};

let createElement = function(tag, className, attributes) {
        let node = document.createElement(tag);
        if (className) { node.className = className; }
        Object.keys(attributes || {}).forEach(function(name) {
            node.setAttribute(name, attributes[name]);
        });
        return node;
    },
    prepend = function(child, parent) {
        parent.insertBefore(child, parent.firstChild);
    },
    setHTML = function(element, content) {
        element.innerHTML = content == null ? '' : String(content);
        return element;
    },
    animateOpacity = function(element, opacity, duration, easing, callback) {
        if (element.gNotificationAnimation) {
            element.gNotificationAnimation.cancel();
            element.gNotificationAnimation = null;
        }

        let finish = function() {
            element.style.opacity = opacity;
            element.gNotificationAnimation = null;
            if (typeof callback === 'function') { callback(); }
        };

        if (typeof element.animate === 'function') {
            let animation = element.animate(
                [{opacity: getComputedStyle(element).opacity}, {opacity: opacity}],
                {duration: Number(duration) || 0, easing: easing || 'ease'}
            );
            element.gNotificationAnimation = animation;
            animation.addEventListener('finish', finish, {once: true});
            return animation;
        }

        element.style.transition = 'opacity ' + (Number(duration) || 0) + 'ms ' + (easing || 'ease');
        element.style.opacity = opacity;
        setTimeout(finish, Number(duration) || 0);
        return null;
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
        return this.notify(merge(options, {title: title || '', type: options.type || 'base', message: message}));
    }

    success(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, {title: title || 'Success!', type: 'success', message: message}));
    }

    info(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, {title: title || 'Info', type: 'info', message: message}));
    }

    warning(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, {title: title || 'Warning!', type: 'warning', message: message}));
    }

    error(message, title, options) {
        options = this.mergeOptions(options);
        return this.notify(merge(options, {title: title || 'Error!', type: 'error', message: message}));
    }

    notify(options) {
        options = this.mergeOptions(options);
        if (options.preventDuplicates && this.previousNotice === options.message) { return null; }

        this.id++;
        this.previousNotice = options.message;

        let container = this.getContainer(options, true),
            element = createElement('div'),
            title = createElement('div'),
            message = createElement('div'),
            icon = createElement('i', 'fa'),
            progress = createElement('div', 'g-notifications-progress'),
            close = createElement('a', 'fa fa-close', {href: '#'});

        if (!container) { return null; }

        this.map.set(element, {
            container: container,
            interval: null,
            progressBar: {interval: null, hideETA: null, maxHideTime: null},
            response: {id: this.id, state: 'visible', start: new Date(), options: options},
            options: options
        });

        if (options.title) {
            title.classList.add(options.titleClass);
            element.appendChild(setHTML(title, options.title));
        }
        if (options.message) {
            message.classList.add(options.messageClass);
            element.appendChild(setHTML(message, options.message));
        }
        if (options.closeButton) { prepend(close, element); }
        if (options.progressBar) { prepend(progress, element); }

        if (options.type && options.title && options.types[options.type]) {
            element.classList.add('g-notifications-theme-' + options.type);
            icon.classList.add(options.types[options.type]);
            prepend(icon, title);
        }

        element.style.opacity = 0;
        if (options.newestOnTop) { prepend(element, container); }
        else { container.appendChild(element); }

        animateOpacity(element, 1, options.showDuration, options.showEquation, options.onShow);

        if (options.timeOut > 0) {
            let map = this.map.get(element);
            map.interval = setTimeout(function() { this.hide(element); }.bind(this), options.timeOut);
            map.progressBar.maxHideTime = parseFloat(options.timeOut);
            map.progressBar.hideETA = Date.now() + map.progressBar.maxHideTime;

            if (options.progressBar) {
                map.progressBar.interval = setInterval(function() {
                    this.updateProgress(element, progress);
                }.bind(this), 10);
            }
        }

        let stick = function() { this.stickAround(element); }.bind(this),
            delay = function() { this.delayedHide(element); }.bind(this);
        element.addEventListener('mouseover', stick);
        element.addEventListener('mouseout', delay);

        if (!options.onClick && options.tapToDismiss) {
            element.addEventListener('click', function() {
                element.removeEventListener('mouseover', stick);
                element.removeEventListener('mouseout', delay);
                this.hide(element);
            }.bind(this));
        } else if (options.onClick) {
            element.addEventListener('click', options.onClick);
        }

        if (options.closeButton) {
            close.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();
                element.removeEventListener('mouseover', stick);
                element.removeEventListener('mouseout', delay);
                this.hide(element, true);
            }.bind(this));
        }

        return element;
    }

    stickAround(element) {
        let map = this.map.get(element);
        if (!map) { return; }
        clearTimeout(map.interval);
        map.progressBar.hideETA = 0;
        animateOpacity(element, 1, map.options.showDuration, map.options.showEquation, map.options.onShow);
    }

    hide(element, override) {
        if (!element || !this.map.has(element)) { return false; }
        if (element.querySelector(':focus') && !override) { return false; }

        let map = this.map.get(element);
        clearTimeout(map.interval);
        clearInterval(map.progressBar.interval);
        return animateOpacity(
            element,
            0,
            map.options.hideDuration,
            map.options.hideEquation,
            function() {
                this.remove(element);
                if (map.options.onHidden && map.response.state !== 'hidden') { map.options.onHidden(); }
                map.response.state = 'hidden';
                map.response.endTime = new Date();
            }.bind(this)
        );
    }

    delayedHide(element) {
        let map = this.map.get(element);
        if (!map) { return; }
        if (map.options.timeOut > 0 || map.options.extendedTimeout > 0) {
            map.interval = setTimeout(function() { this.hide(element); }.bind(this), map.options.extendedTimeout);
            map.progressBar.maxHideTime = parseFloat(map.options.extendedTimeout);
            map.progressBar.hideETA = Date.now() + map.progressBar.maxHideTime;
        }
    }

    updateProgress(element, progress) {
        let map = this.map.get(element);
        if (!map || !map.progressBar.maxHideTime) { return; }
        let percentage = ((map.progressBar.hideETA - Date.now()) / map.progressBar.maxHideTime) * 100;
        progress.style.width = Math.max(0, percentage) + '%';
    }

    getContainer(options, create) {
        options = this.mergeOptions(options);
        let container = document.getElementById(options.containerID);
        if (container) { return container; }
        return create ? this.createContainer(options) : null;
    }

    createContainer(options) {
        options = this.mergeOptions(options);
        let container = createElement('div', options.location, {
                id: options.containerID,
                'aria-live': 'polite',
                role: 'alert'
            }),
            target = document.querySelector(options.target);

        if (!target) { return null; }
        if (options.targetLocation === 'top') { prepend(container, target); }
        else { target.appendChild(container); }
        return container;
    }

    remove(element) {
        if (!element) { return; }
        let map = this.map.get(element);
        if (!map) { return; }
        if (!map.container) { map.container = this.getContainer(map.options); }

        element.remove();
        if (map.container && !map.container.children.length) {
            map.container.remove();
            this.previousNotice = null;
        }
        this.map.delete(element);
    }
}

export default new Toaster();
