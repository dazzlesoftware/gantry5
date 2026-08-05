'use strict';

class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) { this.listeners.set(event, new Set()); }
        this.listeners.get(event).add(callback);
        return this;
    }

    once(event, callback) {
        var listener = function() {
            this.off(event, listener);
            callback.apply(this, arguments);
        }.bind(this);

        return this.on(event, listener);
    }

    off(event, callback) {
        if (!event) {
            this.listeners.clear();
        } else if (!callback) {
            this.listeners.delete(event);
        } else if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
        return this;
    }

    emit(event) {
        var args = Array.prototype.slice.call(arguments, 1),
            callbacks = this.listeners.get(event);

        if (callbacks) {
            Array.from(callbacks).forEach(function(callback) {
                callback.apply(this, args);
            }, this);
        }
        return this;
    }
}

export default EventEmitter;
