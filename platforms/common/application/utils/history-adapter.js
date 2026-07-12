'use strict';

const resolveElement = (element) => typeof element === 'string'
    ? document.querySelector(element)
    : element;

const History = {
    Adapter: {
        bind(element, event, callback) {
            const target = resolveElement(element);
            if (target) target.addEventListener(event, callback);
        },

        trigger(element, event, extra) {
            const target = resolveElement(element);
            if (!target) return;
            target.dispatchEvent(new CustomEvent(event, {
                bubbles: false,
                cancelable: true,
                detail: extra
            }));
        },

        extractEventData(key, event, extra) {
            if (extra && Object.prototype.hasOwnProperty.call(extra, key)) return extra[key];
            if (event && event.detail && Object.prototype.hasOwnProperty.call(event.detail, key)) return event.detail[key];
            if (event && Object.prototype.hasOwnProperty.call(event, key)) return event[key];
            return undefined;
        },

        onDomLoad(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback, { once: true });
            } else {
                callback();
            }
        }
    }
};

module.exports = History;
