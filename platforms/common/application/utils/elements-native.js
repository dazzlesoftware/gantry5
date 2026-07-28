"use strict";

const $ = require('elements/base');

require('elements/attributes');
require('elements/events');
require('elements/insertion');

const delegatedListeners = new WeakMap();
const elementNode = value => value && value[0] ? value[0] : value;
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
const unique = nodes => Array.from(new Set(nodes));
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

$.implement({
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
