"use strict";
var $          = require('elements'),
    slick      = require('slick'),
    progresser = require('../ui/progresser');

var unitless = ['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'zoom', 'order', 'flexGrow', 'flexShrink'];

var durationMs = function(value) {
    if (typeof value === 'number') { return value; }
    value = String(value || '250ms').trim();
    return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
};

var styleValue = function(property, value) {
    return typeof value === 'number' && unitless.indexOf(property) === -1 ? value + 'px' : String(value);
};

var sequence = function() {
    var callbacks = Array.prototype.slice.call(arguments);

    return function() {
        var args = arguments,
            context = this;

        callbacks.forEach(function(callback) {
            callback.apply(context, args);
        });
    };
};

var walk = function(combinator, method) {

    return function(expression) {
        var parts = slick.parse(expression || "*");

        expression = Array.prototype.map.call(parts, function(part) {
            return combinator + " " + part;
        }).join(', ');

        return this[method](expression);
    };

};


$.implement({
    style: function() {
        var property = arguments[0], value = arguments[1];
        this.forEach(function(element) {
            if (typeof property === 'string') {
                element.style[property] = styleValue(property, value);
                return;
            }
            Object.keys(property || {}).forEach(function(key) {
                element.style[key] = styleValue(key, property[key]);
            });
        });
        return this;
    },

    animate: function(properties, options) {
        options = typeof options === 'string' ? { duration: options } : (options || {});
        var duration = durationMs(options.duration),
            easing = options.equation || options.easing || 'ease',
            callback = options.callback || function() {},
            remaining = this.length;

        if (!remaining) { callback.call(this); return this; }
        this.forEach(function(element) {
            var from = {}, to = {};
            Object.keys(properties).forEach(function(property) {
                from[property] = getComputedStyle(element)[property];
                to[property] = styleValue(property, properties[property]);
            });

            if (!element.animate || duration <= 0) {
                Object.assign(element.style, to);
                if (!--remaining) { callback.call(this); }
                return;
            }

            var animation = element.animate([from, to], { duration: duration, easing: easing, fill: 'forwards' });
            animation.addEventListener('finish', function() {
                Object.assign(element.style, to);
                animation.cancel();
                if (!--remaining) { callback.call(this); }
            }.bind(this), { once: true });
        }, this);
        return this;
    },

    hide: function() {
        return this.style('display', 'none');
    },

    show: function(mode) {
        return this.style('display', mode || 'inherit');
    },

    progresser: function(options) {
        var instance;

        this.forEach(function(node) {
            instance = node.ProgresserInstance;

            if (!instance) { instance = new progresser(node, options); }
            else { instance.constructor(node, options); }

            node.ProgresserInstance = instance;
            return instance;
        });
    },

    compute: function() {
        if (!this[0]) { return null; }
        var computed = getComputedStyle(this[0]), property = arguments[0];
        return property ? computed[property] || computed.getPropertyValue(property) : computed;
    },

    showIndicator: function(klass, keepIcon) {
        this.forEach(function(node) {
            node = $(node);
            if (typeof klass == 'boolean') {
                keepIcon = klass;
                klass = null;
            }

            var icon = keepIcon ? false : node.find('i');
            node.gHadIcon = !!icon;

            if (!icon) {
                if (!node.find('span') && node[0].children.length === 0) {
                    var label = document.createElement('span');
                    label.textContent = node.text();
                    node[0].textContent = '';
                    node[0].appendChild(label);
                }

                var iconElement = document.createElement('i');
                node[0].insertBefore(iconElement, node[0].firstChild);
                icon = $(iconElement);
            }

            if (!node.gIndicator) { node.gIndicator = icon.attribute('class') || true; }
            icon.attribute('class', klass || 'fa fa-fw fa-spin-fast fa-spinner');
        });
    },

    hideIndicator: function() {
        this.forEach(function(node) {
            node = $(node);
            if (!node.gIndicator) { return; }

            var icon = node.find('i');

            if (!icon) { return; }

            if (!node.gHadIcon) { icon.remove(); }
            else { icon.attribute('class', node.gIndicator); }

            node.gIndicator = null;
        });
    },

    slideDown: function(animation, callback) {
        var element       = this,
            size          = this.getRealSize(),
            callbackStart = function() {
                element.gSlideCollapsed = false;
            },
            callbackEnd   = function() {
                element.attribute('style', element.gSlideStyle);
            };

        callback = typeof animation === 'function' ? animation : (callback || function() {});
        if (this.gSlideCollapsed === false) { return callback(); }
        callback = sequence(callbackStart, callback, callbackEnd);

        animation = typeof animation === 'string' ? animation : {
            duration: '250ms',
            callback: callback
        };

        this.style('visibility', 'visible').attribute('aria-hidden', false);
        this.animate({ height: size.height }, animation);
    },

    slideUp: function(animation, callback) {
        if (typeof this.gSlideCollapsed === 'undefined') {
            this.gSlideStyle = this.attribute('style');
        }

        var element       = this,
            callbackStart = function() {
                element.gSlideCollapsed = true;
            },
            callbackEnd = function() {
                element.style('visibility', 'hidden').attribute('aria-hidden', true);
            };

        callback = typeof animation === 'function' ? animation : (callback || function() {});
        if (this.gSlideCollapsed === true) { return callback(); }
        callback = sequence(callbackStart, callback, callbackEnd);

        animation = typeof animation === 'string' ? animation : {
            duration: '250ms',
            callback: callback
        };
        this.style({ overflow: 'hidden' }).animate({ height: 0 }, animation);
    },

    slideToggle: function(animation, callback) {
        var size = this.getRealSize();
        return this[size.height && !this.gSlideCollapsed ? 'slideUp' : 'slideDown'](animation, callback);
    },

    getRealSize: function() {
        var style = this.attribute('style'), size;
        this.style({
            position: 'relative',
            overflow: 'inherit',
            top: -50000,
            height: 'auto',
            width: 'auto'
        });

        size = {
            width: parseInt(this.compute('width'), 10),
            height: parseInt(this.compute('height'), 10)
        };

        this[0].style = style;

        return size;
    },

    sibling: walk('++', 'find'),

    siblings: walk('~~', 'search')
});

module.exports = $;
