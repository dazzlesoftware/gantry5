import __module0 from './dom-collection.js';
import __module1 from '../ui/progresser.js';
import __module2 from './indicator.js';

"use strict";
let dom          = __module0,
    progresser = __module1,
    indicator  = __module2;

let unitless = ['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'zoom', 'order', 'flexGrow', 'flexShrink'];

let durationMs = function(value) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return 0; }
    if (typeof value === 'number') { return value; }
    value = String(value || '250ms').trim();
    return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
};

let styleValue = function(property, value) {
    return typeof value === 'number' && unitless.indexOf(property) === -1 ? value + 'px' : String(value);
};

let sequence = function() {
    let callbacks = Array.prototype.slice.call(arguments);

    return function() {
        let args = arguments,
            context = this;

        callbacks.forEach(function(callback) {
            callback.apply(context, args);
        });
    };
};

let matches = function(element, expression) {
    return element && element.nodeType === Node.ELEMENT_NODE
        && element.matches(expression || '*');
};

let adjacentSiblings = function(expression) {
    let siblings = [];

    this.forEach(function(element) {
        let previous = element.previousElementSibling,
            next = element.nextElementSibling;

        if (matches(previous, expression) && siblings.indexOf(previous) === -1) {
            siblings.push(previous);
        }
        if (matches(next, expression) && siblings.indexOf(next) === -1) {
            siblings.push(next);
        }
    });

    return dom(siblings);
};

let matchingSiblings = function(expression) {
    let siblings = [];

    this.forEach(function(element) {
        if (!element.parentElement) { return; }

        Array.prototype.forEach.call(element.parentElement.children, function(sibling) {
            if (sibling !== element && matches(sibling, expression) && siblings.indexOf(sibling) === -1) {
                siblings.push(sibling);
            }
        });
    });

    return dom(siblings);
};


dom.implement({
    style: function() {
        let property = arguments[0], value = arguments[1];
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
        let duration = durationMs(options.duration),
            easing = options.equation || options.easing || 'ease',
            callback = options.callback || function() {},
            remaining = this.length;

        if (!remaining) { callback.call(this); return this; }
        this.forEach(function(element) {
            let from = {}, to = {};
            Object.keys(properties).forEach(function(property) {
                from[property] = getComputedStyle(element)[property];
                to[property] = styleValue(property, properties[property]);
            });

            if (!element.animate || duration <= 0) {
                Object.assign(element.style, to);
                if (!--remaining) { callback.call(this); }
                return;
            }

            let animation = element.animate([from, to], { duration: duration, easing: easing, fill: 'forwards' });
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
        let instance;

        this.forEach(function(node) {
            instance = node.ProgresserInstance;

            if (!instance) { instance = new progresser(node, options); }
            else { instance.update(options); }

            node.ProgresserInstance = instance;
            return instance;
        });
    },

    compute: function() {
        if (!this[0]) { return null; }
        let computed = getComputedStyle(this[0]), property = arguments[0];
        return property ? computed[property] || computed.getPropertyValue(property) : computed;
    },

    showIndicator: function(klass, keepIcon) {
        this.forEach(function(node) {
            indicator.show(node, klass, keepIcon);
        });
    },

    hideIndicator: function() {
        this.forEach(function(node) {
            indicator.hide(node);
        });
    },

    slideDown: function(animation, callback) {
        let element       = this,
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

        let element       = this,
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
        let size = this.getRealSize();
        return this[size.height && !this.gSlideCollapsed ? 'slideUp' : 'slideDown'](animation, callback);
    },

    getRealSize: function() {
        let style = this.attribute('style'), size;
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

    sibling: adjacentSiblings,

    siblings: matchingSiblings
});

export default dom;
