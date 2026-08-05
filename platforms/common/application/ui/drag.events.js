"use strict";
const getSupportedEvent = function(events) {
    events = events.split(' ');

    let element = document.createElement('div'), event;
    let isSupported = false;

    for (let i = events.length - 1; i >= 0; i--) {
        event = 'on' + events[i];
        isSupported = (event in element);

        if (!isSupported) {
            element.setAttribute(event, 'return;');
            isSupported = typeof element[event] === 'function';
        }

        if (isSupported) {
            isSupported = events[i];
            break;
        }
    }

    element = null;
    return isSupported;
};

const getSupportedEvents = function(events) {
    events = events.split(' ');

    let isSupported = false, supported = [];
    for (let i = events.length - 1; i >= 0; i--) {
        isSupported = getSupportedEvent(events[i]);
        if (isSupported) { supported.push(isSupported); }
    }

    return supported;
};

const EVENT = {
        START: getSupportedEvent('mousedown touchstart pointerdown'),
        MOVE: getSupportedEvent('mousemove touchmove pointermove'),
        STOP: getSupportedEvent('mouseup touchend pointerup')
    },
    EVENTS = {
        START: getSupportedEvents('mousedown touchstart pointerdown'),
        MOVE: getSupportedEvents('mousemove touchmove pointermove'),
        STOP: getSupportedEvents('mouseup touchend pointerup')
    };


export default {
    EVENT: EVENT,
    EVENTS: EVENTS
};
