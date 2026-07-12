'use strict';

const modal = require('../ui').modal;
const getAjaxURL = require('./get-ajax-url').global;
const parseAjaxURI = require('./get-ajax-url').parse;
const getAjaxSuffix = require('./get-ajax-suffix');

class FlagsState {
    constructor() {
        this.flags = new Map();
        this.listeners = new Map();
    }

    set(key, value) {
        this.flags.set(key, value);
        return value;
    }

    get(key, defaultValue) {
        return this.flags.has(key) ? this.flags.get(key) : this.set(key, defaultValue);
    }

    keys() { return [...this.flags.keys()]; }
    values() { return [...this.flags.values()]; }

    on(event, callback) {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event).add(callback);
        return this;
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) callbacks.delete(callback);
        return this;
    }

    emit(event, ...args) {
        const callbacks = this.listeners.get(event);
        if (callbacks) [...callbacks].forEach((callback) => callback.apply(this, args));
        return this;
    }

    warning(options) {
        const callback = options.callback || (() => {});
        const afterClose = options.afterclose || (() => {});
        const warningURL = parseAjaxURI(options.url || `${getAjaxURL('unsaved')}${getAjaxSuffix()}`);

        if (!options.url && !options.message) options.url = true;
        if (options.url) {
            modal.open({
                content: 'Loading...',
                remote: warningURL,
                data: options.data || false,
                remoteLoaded(response, modalInstance) {
                    callback.call(this, response, modalInstance.elements.content, modalInstance);
                },
                afterClose
            });
            return;
        }

        modal.open({
            content: options.message,
            afterOpen(response, modalInstance) {
                callback.call(this, response, modalInstance.elements.content, modalInstance);
            },
            afterClose
        });
    }
}

module.exports = new FlagsState();
