import Menu from './menu/index.js';
import Offcanvas from './offcanvas/index.js';
import './totop/index.js';

const ready = callback => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
        callback();
    }
};

const query = (selector, context = document) => context.querySelector(selector);
const queryAll = (selector, context = document) => Array.from(context.querySelectorAll(selector));
const delegate = (element, eventName, selector, handler, options) => {
    const listener = event => {
        const target = event.target instanceof Element ? event.target.closest(selector) : null;
        if (target && element.contains(target)) handler.call(target, event, target);
    };

    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
};

const instances = { ready, query, queryAll, delegate };

// Genesis is the canonical browser API. Keep Genesis as the same object for
// compatibility with existing themes and third-party integrations.
window.Genesis = instances;

ready(() => {
    try {
        instances.offcanvas = new Offcanvas();
    } catch (error) {
        console.error('Genesis off-canvas initialization failed:', error);
    }

    try {
        instances.menu = new Menu();
    } catch (error) {
        console.error('Genesis menu initialization failed:', error);
    }
});

export { delegate, query, queryAll, ready };
export default instances;
