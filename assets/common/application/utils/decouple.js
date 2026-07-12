'use strict';

module.exports = (element, type, callback, options = { passive: true }) => {
    const target = element && element[0] ? element[0] : element;
    let latestEvent;
    let frameId = null;

    const capture = (event) => {
        latestEvent = event;
        if (frameId !== null) {
            return;
        }

        frameId = requestAnimationFrame(() => {
            frameId = null;
            callback.call(target, latestEvent);
        });
    };

    target.addEventListener(type, capture, options);
    return capture;
};
