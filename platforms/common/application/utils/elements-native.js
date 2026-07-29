"use strict";

const wrapperCache = new WeakMap();
const eventListeners = new WeakMap();
const delegatedListeners = new WeakMap();
const elementNode = value => value && value[0] ? value[0] : value;
const targetNode = value => typeof value === 'string' ? document.querySelector(value) : elementNode(value);
const unique = nodes => Array.from(new Set(nodes));

function Elements(nodes) {
    nodes.forEach((node, index) => {
        this[index] = node;
    });
    this.length = nodes.length;
}

function $(value, context) {
    if (value === null || value === undefined) return null;
    if (value instanceof Elements) return value;

    let nodes = [];
    if (typeof value === 'string') {
        const expression = value.trim();
        if (expression.startsWith('<') && expression.endsWith('>')) {
            const template = document.createElement('template');
            template.innerHTML = expression;
            nodes = Array.from(template.content.children);
        } else {
            const root = elementNode(context) || document;
            nodes = Array.from(root.querySelectorAll(selectorGroups(expression)));
        }
    } else if (value.nodeType || value === window) {
        nodes = [value];
    } else if (typeof value.length === 'number') {
        Array.from(value).forEach(item => {
            const wrapped = $(item, context);
            if (wrapped) nodes.push(...Array.from(wrapped));
        });
    }

    nodes = unique(nodes.filter(Boolean));
    if (!nodes.length) return null;
    if (nodes.length === 1) {
        const cached = wrapperCache.get(nodes[0]);
        if (cached) return cached;
        const wrapped = new Elements(nodes);
        wrapperCache.set(nodes[0], wrapped);
        return wrapped;
    }
    return new Elements(nodes);
}

Elements.prototype = Object.create($.prototype);
Elements.prototype.constructor = Elements;

$.implement = methods => {
    Object.keys(methods).forEach(name => {
        $.prototype[name] = methods[name];
    });
    return $;
};

$.prototype.forEach = function(callback, context) {
    Array.from(this).forEach(callback, context);
    return this;
};
$.prototype.map = function(callback, context) {
    return Array.from(this).map(callback, context);
};
$.prototype.filter = function(callback, context) {
    return Array.from(this).filter(callback, context);
};
$.prototype.every = function(callback, context) {
    return Array.from(this).every(callback, context);
};
$.prototype.some = function(callback, context) {
    return Array.from(this).some(callback, context);
};
$.prototype.unlink = function() {
    this.forEach(node => wrapperCache.delete(node));
    return this.map(node => node);
};

const selectorGroups = expression => String(expression || '*').split(',').map(selector => {
    selector = selector.trim();
    return /^[>+~]/.test(selector) ? `:scope ${selector}` : selector;
}).join(', ');
const matches = (element, expression) => {
    if (expression === false) return false;
    const candidate = elementNode(expression);
    if (candidate && candidate.nodeType) return element === candidate;
    const selector = expression === undefined || expression === null || expression === ''
        ? '*'
        : String(expression);
    return Boolean(element && element.nodeType === 1 && element.matches(selector));
};
const documentOrder = nodes => unique(nodes).sort((left, right) => {
    if (left === right) return 0;
    return left.compareDocumentPosition(right) & 2 ? 1 : -1;
});
const descendants = (context, expression) => {
    const candidate = elementNode(expression);
    if (candidate && candidate.nodeType) {
        return context !== candidate && context.contains(candidate) ? [candidate] : [];
    }
    return Array.from(context.querySelectorAll(selectorGroups(expression)));
};
const closestDelegated = (target, selector, root) => {
    if (!(target instanceof Element)) target = target && target.parentElement;
    if (!target) return null;

    const direct = String(selector || '').trim().match(/^>\s*(.+)$/);
    const match = target.closest(direct ? direct[1] : selector);
    if (!match) return null;
    if (direct) return match.parentElement === root ? match : null;
    return root === document || root === window || root === match || root.contains(match) ? match : null;
};

const accessors = {};
['type', 'value', 'name', 'href', 'title', 'id', 'className'].forEach(name => {
    accessors[name] = function(value) {
        if (value === undefined) return this[0][name];
        return this.forEach(node => { node[name] = value; });
    };
});
['checked', 'disabled', 'selected'].forEach(name => {
    accessors[name] = function(value) {
        if (value === undefined) return Boolean(this[0][name]);
        return this.forEach(node => { node[name] = Boolean(value); });
    };
});
$.implement(accessors);

$.implement({
    setAttribute: function(name, value) {
        return this.forEach(node => node.setAttribute(name, value));
    },

    getAttribute: function(name) {
        return this[0].hasAttribute(name) ? this[0].getAttribute(name) : null;
    },

    hasAttribute: function(name) {
        return this[0].hasAttribute(name);
    },

    removeAttribute: function(name) {
        return this.forEach(node => node.removeAttribute(name));
    },

    attribute: function(name, value) {
        if (name && typeof name === 'object') {
            Object.keys(name).forEach(key => this.attribute(key, name[key]));
            return this;
        }
        const properties = ['type', 'value', 'name', 'href', 'title', 'id'];
        const booleans = ['checked', 'disabled', 'selected'];
        if (value === undefined) {
            if (properties.includes(name)) return this[0][name];
            if (booleans.includes(name)) return Boolean(this[0][name]);
            return this.getAttribute(name);
        }
        if (value === null) return this.removeAttribute(name);
        if (properties.includes(name)) return this.forEach(node => { node[name] = value; });
        if (booleans.includes(name)) return this.forEach(node => { node[name] = Boolean(value); });
        return this.setAttribute(name, value);
    },

    classNames: function() {
        return Array.from(this[0].classList || []).sort();
    },

    hasClass: function(className) {
        return this[0].classList.contains(className);
    },

    addClass: function(className) {
        const classes = String(className || '').trim().split(/\s+/).filter(Boolean);
        return this.forEach(node => node.classList.add(...classes));
    },

    removeClass: function(className) {
        const classes = String(className || '').trim().split(/\s+/).filter(Boolean);
        return this.forEach(node => node.classList.remove(...classes));
    },

    toggleClass: function(className, force) {
        const add = force !== undefined ? force : !this.hasClass(className);
        this.forEach(node => node.classList.toggle(className, Boolean(add)));
        return Boolean(add);
    },

    tag: function() {
        return this[0].tagName.toLowerCase();
    },

    html: function(value) {
        if (value === undefined) return this[0].innerHTML;
        return this.forEach(node => { node.innerHTML = value; });
    },

    text: function(value) {
        if (value === undefined) return this[0].textContent;
        return this.forEach(node => { node.textContent = value; });
    },

    data: function(key, value) {
        if (value === undefined) return this.getAttribute(`data-${key}`);
        if (value === null) return this.removeAttribute(`data-${key}`);
        return this.setAttribute(`data-${key}`, value);
    },

    check: function() {
        return this.checked(true);
    },

    uncheck: function() {
        return this.checked(false);
    },

    disable: function() {
        return this.disabled(true);
    },

    enable: function() {
        return this.disabled(false);
    },

    select: function() {
        return this.selected(true);
    },

    deselect: function() {
        return this.selected(false);
    },

    on: function(event, handle, useCapture) {
        return this.forEach(node => {
            let listeners = eventListeners.get(node);
            if (!listeners) {
                listeners = [];
                eventListeners.set(node, listeners);
            }
            if (listeners.some(item => item.event === event && item.handle === handle
                && item.useCapture === Boolean(useCapture))) return;

            const listener = nativeEvent => handle.call($(node), nativeEvent);
            const registration = {
                event,
                handle,
                useCapture: Boolean(useCapture),
                listener
            };
            listeners.push(registration);
            node.addEventListener(event, listener, registration.useCapture);
        });
    },

    off: function(event, handle, useCapture) {
        return this.forEach(node => {
            const listeners = eventListeners.get(node);
            if (!listeners) return;
            for (let index = listeners.length - 1; index >= 0; index--) {
                const item = listeners[index];
                if (item.event !== event
                    || (handle && item.handle !== handle)
                    || item.useCapture !== Boolean(useCapture)) continue;
                node.removeEventListener(event, item.listener, item.useCapture);
                listeners.splice(index, 1);
            }
            if (!listeners.length) eventListeners.delete(node);
        });
    },

    emit: function(event, ...args) {
        return this.forEach(node => {
            const listeners = eventListeners.get(node) || [];
            listeners.filter(item => item.event === event)
                .slice()
                .forEach(item => item.handle.apply($(node), args));
        });
    },

    appendChild: function(child) {
        this[0].appendChild(elementNode(child));
        return this;
    },

    insertBefore: function(child, reference) {
        this[0].insertBefore(elementNode(child), elementNode(reference));
        return this;
    },

    removeChild: function(child) {
        this[0].removeChild(elementNode(child));
        return this;
    },

    replaceChild: function(child, reference) {
        this[0].replaceChild(elementNode(child), elementNode(reference));
        return this;
    },

    before: function(element) {
        element = elementNode(element);
        if (!element || !element.parentNode) return this;
        return this.forEach(node => element.parentNode.insertBefore(node, element));
    },

    after: function(element) {
        element = elementNode(element);
        if (!element || !element.parentNode) return this;
        return this.forEach(node => element.parentNode.insertBefore(node, element.nextSibling));
    },

    bottom: function(element) {
        element = targetNode(element);
        if (!element || typeof element.appendChild !== 'function') return this;
        return this.forEach(node => element.appendChild(node));
    },

    top: function(element) {
        element = targetNode(element);
        if (!element || typeof element.insertBefore !== 'function') return this;
        return this.forEach(node => element.insertBefore(node, element.firstChild));
    },

    insert: function(element) {
        return this.bottom(element);
    },

    remove: function() {
        return this.forEach(node => node.remove());
    },

    replace: function(element) {
        element = elementNode(element);
        if (element && element.parentNode) element.parentNode.replaceChild(this[0], element);
        return this;
    },

    search: function(expression) {
        const found = [];
        this.forEach(context => found.push(...descendants(context, expression)));
        return $(documentOrder(found));
    },

    find: function(expression) {
        for (let index = 0; index < this.length; index++) {
            const found = descendants(this[index], expression)[0];
            if (found) return $(found);
        }
        return null;
    },

    sort: function() {
        return $(documentOrder(Array.from(this)));
    },

    matches: function(expression) {
        return matches(this[0], expression);
    },

    contains: function(node) {
        node = elementNode(node);
        return Boolean(this[0] && node && this[0].contains(node));
    },

    nextSiblings: function(expression) {
        const found = [];
        this.forEach(element => {
            for (let sibling = element.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
                if (matches(sibling, expression)) found.push(sibling);
            }
        });
        return $(documentOrder(found));
    },

    nextSibling: function(expression) {
        for (let index = 0; index < this.length; index++) {
            let sibling = this[index].nextElementSibling;
            while (sibling && !matches(sibling, expression)) sibling = sibling.nextElementSibling;
            if (sibling) return $(sibling);
        }
        return null;
    },

    previousSiblings: function(expression) {
        const found = [];
        this.forEach(element => {
            for (let sibling = element.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
                if (matches(sibling, expression)) found.push(sibling);
            }
        });
        return $(documentOrder(found));
    },

    previousSibling: function(expression) {
        for (let index = 0; index < this.length; index++) {
            let sibling = this[index].previousElementSibling;
            while (sibling && !matches(sibling, expression)) sibling = sibling.previousElementSibling;
            if (sibling) return $(sibling);
        }
        return null;
    },

    children: function(expression) {
        const found = [];
        this.forEach(element => {
            Array.from(element.children || []).forEach(child => {
                if (matches(child, expression)) found.push(child);
            });
        });
        return $(documentOrder(found));
    },

    firstChild: function(expression) {
        for (let index = 0; index < this.length; index++) {
            const found = Array.from(this[index].children || []).find(child => matches(child, expression));
            if (found) return $(found);
        }
        return null;
    },

    lastChild: function(expression) {
        for (let index = 0; index < this.length; index++) {
            const children = Array.from(this[index].children || []);
            const found = children.reverse().find(child => matches(child, expression));
            if (found) return $(found);
        }
        return null;
    },

    parent: function(expression) {
        for (let index = 0; index < this.length; index++) {
            for (let parent = this[index].parentElement; parent; parent = parent.parentElement) {
                if (matches(parent, expression)) return $(parent);
            }
        }
        return null;
    },

    parents: function(expression) {
        let selector = expression;
        let first = false;
        if (typeof selector === 'string' && /:first$/.test(selector)) {
            selector = selector.replace(/:first$/, '');
            first = true;
        }

        const found = [];
        this.forEach(element => {
            for (let parent = element.parentElement; parent; parent = parent.parentElement) {
                if (!matches(parent, selector)) continue;
                found.push(parent);
                if (first) break;
            }
        });
        return $(first ? unique(found) : documentOrder(found));
    },

    delegate: function(event, selector, handle, useCapture) {
        return this.forEach(node => {
            let registrations = delegatedListeners.get(node);
            if (!registrations) {
                registrations = [];
                delegatedListeners.set(node, registrations);
            }
            if (registrations.some(item => item.event === event && item.selector === selector
                && item.handle === handle && item.useCapture === Boolean(useCapture))) return;

            const listener = originalEvent => {
                const match = closestDelegated(originalEvent.target || originalEvent.srcElement, selector, node);
                if (match) return handle.call($(node), originalEvent, $(match));
            };
            const registration = { event, selector, handle, useCapture: Boolean(useCapture), listener };
            registrations.push(registration);
            $(node).on(event, listener, registration.useCapture);
        });
    },

    undelegate: function(event, selector, handle, useCapture) {
        return this.forEach(node => {
            const registrations = delegatedListeners.get(node);
            if (!registrations) return;

            for (let index = registrations.length - 1; index >= 0; index--) {
                const item = registrations[index];
                if (item.event !== event || item.selector !== selector || item.handle !== handle
                    || item.useCapture !== Boolean(useCapture)) continue;
                $(node).off(event, item.listener, item.useCapture);
                registrations.splice(index, 1);
            }
            if (!registrations.length) delegatedListeners.delete(node);
        });
    }
});

module.exports = $;
