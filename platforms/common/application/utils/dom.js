'use strict';

const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
        callback();
    }
};

const delegate = (element, type, selector, callback, options) => {
    const listener = (event) => {
        const target = event.target instanceof Element ? event.target.closest(selector) : null;
        if (target && element.contains(target)) callback(event, target);
    };
    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
};

export default { ready, delegate };
