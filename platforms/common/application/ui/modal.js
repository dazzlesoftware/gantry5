import __module0 from '../utils/dom-effects.js';
import __module1 from '../utils/create-element.js';
import __module2 from '../utils/dom.js';
import __module3 from '../utils/request.js';

"use strict";
// Based on Vex (https://github.com/hubspot/vex)

var dom        = __module0,
    zen      = __module1,
    domready = __module2.ready,

    request  = __module3;

var stored = new WeakMap(),
    storage = {
        get: function(key) { return stored.get(key && key[0] ? key[0] : key); },
        set: function(key, value) { stored.set(key && key[0] ? key[0] : key, value); return this; },
        delete: function(key) { return stored.delete(key && key[0] ? key[0] : key); }
    },
    animationEndEvents = ['animationend', 'webkitAnimationEnd', 'mozAnimationEnd', 'MSAnimationEnd', 'oanimationend'],
    animationEndSupport = (function() {
        var style = document.documentElement.style,
            names = ['animation', 'WebkitAnimation', 'MozAnimation', 'MsAnimation', 'OAnimation'];

        for (var index = 0; index < names.length; index++) {
            if (style[names[index]] !== undefined) {
                return animationEndEvents[index];
            }
        }
        return false;
    }()),
    defaults = {
        baseClassNames: {
            container: 'genesis-dialog',
            content: 'genesis-content',
            overlay: 'genesis-overlay',
            close: 'genesis-close',
            closing: 'genesis-closing',
            open: 'genesis-dialog-open'
        },

        content: '',
        remote: '',
        showCloseButton: true,
        escapeToClose: true,
        overlayClickToClose: true,
        appendNode: '[data-genesis-container]',
        className: 'genesis-dialog-theme-default',
        css: {},
        overlayClassName: '',
        overlayCSS: '',
        contentClassName: '',
        contentCSS: '',
        closeClassName: 'genesis-dialog-close',
        closeCSS: '',

        afterOpen: null,
        afterClose: null
    };

class Modal {
    constructor(options) {
        this.options = Object.assign({}, defaults, options || {});
        this.defaults = this.options;
        this.globalID = 1;
        this.animationEndEvent = animationEndSupport;
        this._bound = Object.create(null);
        this._events = new Map();

        var self = this;
        domready(function() {
            dom(window).on('keydown', function(event) {
                if (event.keyCode === 27) {
                    return self.closeByEscape();
                }
            });
        });

        this
            .on('dialogOpen', function(options) {
                dom('body').addClass(options.baseClassNames.open);
                dom('html').addClass(options.baseClassNames.open);
            })
            .on('dialogAfterClose', function(options) {
                var all = this.getAll();
                if (!all || !all.length) {
                    dom('body').removeClass(options.baseClassNames.open);
                    dom('html').removeClass(options.baseClassNames.open);
                }
            }.bind(this));
    }

    bound(method) {
        if (!this._bound[method]) {
            this._bound[method] = this[method].bind(this);
        }
        return this._bound[method];
    }

    on(name, callback) {
        var listeners = this._events.get(name) || [];
        listeners.push(callback);
        this._events.set(name, listeners);
        return this;
    }

    emit(name, value) {
        (this._events.get(name) || []).slice().forEach(function(callback) {
            callback.call(this, value);
        }, this);
        return this;
    }

    storage() {
        return storage;
    }

    element(value) {
        return value && value.nodeType ? value : value && value[0] ? value[0] : null;
    }

    open(options) {
        options = Object.assign({}, this.options, options || {});
        options.id = this.globalID++;

        var elements = {};

        // container
        elements.container = zen('div')
            .addClass(options.baseClassNames.container)
            .addClass(options.className)
            .style(options.css)
            .attribute('tabindex', '0')
            .attribute('role', 'dialog')
            .attribute('aria-hidden', 'true')
            .attribute('aria-labelledby', 'g-modal-labelledby')
            .attribute('aria-describedby', 'g-modal-describedby');

        storage.set(elements.container, { dialog: options });

        // overlay
        elements.overlay = zen('div')
            .addClass(options.baseClassNames.overlay)
            .addClass(options.overlayClassName)
            .style(options.overlayCSS);

        storage.set(elements.overlay, { dialog: options });

        if (options.overlayClickToClose) {
            elements.container.on('click', this._overlayClick.bind(this, elements.container[0]));
            elements.overlay.on('click', this._overlayClick.bind(this, elements.overlay[0]));
        }

        elements.container.appendChild(elements.overlay);

        // content
        elements.content = zen('div')
            .addClass(options.baseClassNames.content)
            .addClass(options.contentClassName)
            .style(options.contentCSS)
            .attribute('aria-live', 'assertive')
            .attribute('tabindex', '0')
            .html(options.content);

        storage.set(elements.content, { dialog: options });
        elements.container.appendChild(elements.content);

        if (options.overlayClickToClose) {
            elements.content.on('click', function(/*e*/){
                return true;
            });
        }

        // remote
        if (options.remote && options.remote.length > 1) {
            this.showLoading();

            options.method = options.method || 'get';
            var agent = request();
            agent.method(options.method);
            agent.url(options.remote);
            if (options.data) { agent.data(options.data); }

            agent.send(function(error, response) {
                if (elements.container.hasClass(options.baseClassNames.closing)) {
                    this.hideLoading();
                    return;
                }

                elements.content.html(response.body.html || response.body);

                if (!response.body.success) {
                    if (!response.body.html && !response.body.message) { elements.content.style({ width: '90%' }); }
                }

                this.hideLoading();
                if (options.remoteLoaded && !elements.container.hasClass(options.baseClassNames.closing)) {
                    options.remoteLoaded(response, options);
                }

                elements.container.attribute('aria-hidden', 'false');
                setTimeout(function(){ elements.content[0].focus(); }, 0);

                var selects = dom('[data-selectize]');
                if (selects) { selects.selectize(); }
            }.bind(this));
        } else {
            elements.container.attribute('aria-hidden', 'false');
            setTimeout(function(){ elements.content[0].focus(); }, 0);
        }

        // close button
        if (options.showCloseButton) {
            elements.closeButton = zen('div')
                .addClass(options.baseClassNames.close)
                .addClass(options.closeClassName)
                .attribute('role', 'button').attribute('aria-label', 'Close')
                .style(options.closeCSS);

            storage.set(elements.closeButton, { dialog: options });
            elements.content.appendChild(elements.closeButton);
        }

        // delegate container to pick genesis-close clicks
        elements.container.delegate('click', '.genesis-dialog-close', function(event){
            event.preventDefault();
            this._closeButtonClick(elements.container);
        }.bind(this));

        // inject the dialog in the DOM
        var container = dom(options.appendNode);

        // wordpress workaround for out-of-scope cases
        if (GENESIS_PLATFORM == 'wordpress') {
            container = dom('#widgets-editor') || dom('#customize-preview') || dom('#widgets-right') || dom(options.appendNode);
            if ('#' + container.id() != options.appendNode) {
                var wpwrap = dom('#wpwrap') || dom('.wp-customizer'), sibling, workaround;
                if (wpwrap.id() == 'wpwrap') {
                    sibling = wpwrap.nextSibling(options.appendNode);
                    workaround =  sibling ? sibling : zen('div.g5wp-out-of-scope' + options.appendNode).after(wpwrap);
                } else {
                    sibling = wpwrap.find('> ' + options.appendNode);
                    workaround =  sibling ? sibling : zen('div.g5wp-out-of-scope' + options.appendNode).top(wpwrap);
                }
                container = workaround;
            }
        }

        container.appendChild(elements.container);

        options.elements = elements;

        if (options.afterOpen) {
            options.afterOpen(elements.content, options);
        }

        setTimeout(function() {
            return this.emit('dialogOpen', options);
        }.bind(this), 0);

        return elements.content;
    }

    getAll() {
        var options = this.options;
        return dom("." + options.baseClassNames.container + ":not(." + options.baseClassNames.closing + ") ." + options.baseClassNames.content);
    }

    getByID(id) {
        var all = this.getAll();
        if (!all) { return []; }

        return dom(all.filter(function(element) {
            element = dom(element);
            return storage.get(element).dialog.id === id;
        }));
    }

    getLast() {
        var ids, id;

        ids = Array.prototype.map.call(this.getAll() || [], function(element) {
            element = dom(element);

            return storage.get(element).dialog.id;
        });

        if (!ids.length) {
            return false;
        }

        return Math.max.apply(Math, ids);
    }

    close(id) {
        if (!id) {
            var all = this.getAll(),
                element;
            if (!all || !all.length) {
                return false;
            }
            element = dom(all[all.length - 1]);

            id = storage.get(element).dialog.id;
        }

        return this.closeByID(id);
    }

    closeAll() {
        var ids;

        ids = Array.prototype.map.call(this.getAll() || [], function(element) {
            element = dom(element);

            return storage.get(element).dialog.id;
        });

        if (!ids.length) {
            return false;
        }

        ids.reverse().forEach(function(id) {
            return this.closeByID(id);
        }, this);

        return true;
    }

    closeByID(id) {
        var content = this.getByID(id);
        if (!content || !content.length) {
            return false;
        }

        var container, options;

        container = storage.get(content).dialog.elements.container;
        options = Object.assign({}, storage.get(content).dialog);

        var beforeClose = function() {
                if (options.beforeClose) {
                    return options.beforeClose(content, options);
                }
            },
            close = function() {
                if (options.remoteLoaded) { options.remoteLoaded = function(){}; }
                content.emit('dialogClose', options);
                container.remove();
                this.emit('dialogAfterClose', options);
                if (options.afterClose) {
                    return options.afterClose(content, options);
                }

            }.bind(this);

        if (animationEndSupport) {
            beforeClose();
            container.off(this.animationEndEvent).on(this.animationEndEvent, function() {
                return close();
            }).addClass(options.baseClassNames.closing);
        } else {
            beforeClose();
            close();
        }

        return true;
    }

    closeByEscape() {
        var id = this.getLast();

        if (id === false) {
            return false;
        }

        var element = this.getByID(id);

        if (!storage.get(element).dialog.escapeToClose) {
            return false;
        }

        return this.closeByID(id);

    }

    enableCloseByOverlay() {
        var id = this.getLast();

        if (id === false) {
            return false;
        }

        var elements = storage.get(this.getByID(id)).dialog.elements;

        elements.container.on('click', this._overlayClick.bind(this, elements.container[0]));
        elements.overlay.on('click', this._overlayClick.bind(this, elements.overlay[0]));

        elements.content.on('click', function(/*e*/){
            return true;
        });
    }

    showLoading() {
        this.hideLoading();
        return dom('[data-genesis-container]').appendChild(zen('div.genesis-dialog-loading-spinner.' + this.options.className));
    }

    hideLoading() {
        var spinner = dom('.genesis-dialog-loading-spinner');
        return spinner ? spinner.remove() : false;
    }

    // private
    _overlayClick(element, event) {
        if (event.target !== element) {
            return;
        }

        return this.close(storage.get(dom(element)).dialog.id);
    }

    _closeButtonClick(element) {
        return this.close(storage.get(dom(element)).dialog.id);
    }
}

var modal = new Modal();

export default modal;
