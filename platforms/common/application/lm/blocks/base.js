import __module0 from '../../utils/event-emitter.js';
import __module1 from '../../utils/create-element.js';
import __module2 from '../../utils/dom-collection.js';
import __module3 from '../id.js';
import __module4 from '../../utils/translate.js';
import __module5 from '../../utils/get-outline.js';

"use strict";

var EventEmitter = __module0,
    zen          = __module1,
    dom            = __module2,
    ID           = __module3,
    translate    = __module4,
    getCurrentOutline = __module5.getCurrentOutline;

var isPlainObject = function(value) {
        if (!value || Object.prototype.toString.call(value) !== '[object Object]') { return false; }
        var prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    },
    mergeOptions = function(target) {
        target = isPlainObject(target) ? Object.assign({}, target) : {};
        Array.prototype.slice.call(arguments, 1).forEach(function(source) {
            if (!isPlainObject(source)) { return; }
            Object.keys(source).forEach(function(key) {
                target[key] = isPlainObject(source[key]) && isPlainObject(target[key])
                    ? mergeOptions(target[key], source[key])
                    : source[key];
            });
        });
        return target;
    },
    getPath = function(object, path) {
        return String(path || '').split('.').reduce(function(value, key) {
            return value == null ? undefined : value[key];
        }, object);
    },
    setPath = function(object, path, value) {
        var parts = String(path || '').split('.'),
            last = parts.pop(),
            target = object;

        parts.forEach(function(key) {
            if (!isPlainObject(target[key])) { target[key] = {}; }
            target = target[key];
        });
        target[last] = value;
        return object;
    };

function Base(options) {
    this.listeners = new Map();
    this._boundMethods = Object.create(null);
    this.setOptions(options);

    this.fresh = !this.options.id;
    this.id = this.options.id || ID(this.options);
    this.attributes = this.options.attributes || {};
    this.inherit = this.options.inherit || {};

    this.block = zen('div').html(this.layout()).firstChild();
    this.on('rendered', this.bound('onRendered'));

    return this;
}

Base.prototype = Object.create(EventEmitter.prototype);
Base.prototype.constructor = Base;
Base.prototype.options = {
    subtype: false,
    attributes: {},
    inherit: {}
};

Object.assign(Base.prototype, {
    setOptions: function(options) {
        this.options = mergeOptions({}, this.options || Base.prototype.options, options || {});
        return this;
    },

    bound: function(method) {
        return this._boundMethods[method] || (this._boundMethods[method] = this[method].bind(this));
    },

    guid: function() {
        return typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
    },

    getId: function() {
        return this.id || (this.id = ID(this.options));
    },

    getType: function() {
        return this.options.type || '';
    },

    getSubType: function() {
        return this.options.subtype || '';
    },

    getTitle: function() {
        return String(this.options.title || 'Untitled').trim();
    },

    setTitle: function(title) {
        this.options.title = String(title || 'Untitled').trim();
        return this;
    },

    getKey: function() {
        return '';
    },

    getPageId: function() {
        var root = dom('[data-lm-root]');
        if (!root) { return 'data-root-not-found'; }
        return root.data('lm-page');
    },

    getAttribute: function(key) {
        return getPath(this.attributes, key);
    },

    getAttributes: function() {
        return this.attributes || {};
    },

    getInheritance: function() {
        return this.inherit || {};
    },

    updateTitle: function() {
        return this;
    },

    setAttribute: function(key, value) {
        setPath(this.attributes, key, value);
        return this;
    },

    setAttributes: function(attributes) {
        this.attributes = attributes;
        return this;
    },

    setInheritance: function(inheritance) {
        this.inherit = inheritance;
        return this;
    },

    hasAttribute: function(key) {
        return typeof getPath(this.attributes, key) !== 'undefined';
    },

    enableInheritance: function() {},
    disableInheritance: function() {},
    refreshInheritance: function() {},

    hasInheritance: function() {
        return Object.keys(this.inherit || {}).length && this.inherit.outline != getCurrentOutline();
    },

    disable: function() {
        this.block.title(translate('GENESIS_PLATFORM_JS_LM_DISABLED_PARTICLE', 'particle'));
        this.block.addClass('particle-disabled');
    },

    enable: function() {
        this.block.removeAttribute('title');
        this.block.removeClass('particle-disabled');
    },

    insert: function(target, location) {
        this.block[location || 'after'](target);
        return this;
    },

    adopt: function(element) {
        element.insert(this.block);
        return this;
    },

    isNew: function(fresh) {
        if (typeof fresh !== 'undefined') { this.fresh = !!fresh; }
        return this.fresh;
    },

    dropzone: function() {
        return 'data-lm-dropzone';
    },

    addDropzone: function() {
        this.block.data('lm-dropzone', true);
    },

    removeDropzone: function() {
        this.block.data('lm-dropzone', null);
    },

    layout: function() {},
    onRendered: function() {},

    setLayout: function(layout) {
        this.block = layout;
        return this;
    },

    getLimits: function() {
        return false;
    }
});

export default Base;
