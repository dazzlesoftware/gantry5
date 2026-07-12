'use strict';

const ready = (callback) => {
    let called = false;
    const run = () => {
        if (called) return;
        called = true;
        callback();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
        setTimeout(run, 0);
        return;
    }

    run();
};

const query = (selector, context = document) => context.querySelector(selector);
const queryAll = (selector, context = document) => [...context.querySelectorAll(selector)];

const delegate = (element, type, selector, callback, options) => {
    const listener = (event) => {
        const target = event.target instanceof Element ? event.target.closest(selector) : null;
        if (target && element.contains(target)) {
            callback.call(target, event, target);
        }
    };

    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
};

module.exports = { ready, query, queryAll, delegate };
