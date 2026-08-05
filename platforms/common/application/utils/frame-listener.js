'use strict';

module.exports = function frameListener(element, eventName, callback, options = {}) {
    const target = element && element[0] ? element[0] : element;
    let frame = 0;
    let latestEvent;

    const listener = event => {
        latestEvent = event;
        if (frame) return;

        frame = window.requestAnimationFrame(() => {
            frame = 0;
            callback.call(target, latestEvent);
        });
    };

    target.addEventListener(eventName, listener, {
        capture: Boolean(options.capture),
        passive: options.passive !== false
    });

    return () => {
        target.removeEventListener(eventName, listener, Boolean(options.capture));
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
    };
};
