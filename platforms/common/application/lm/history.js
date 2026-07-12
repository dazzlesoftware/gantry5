'use strict';

const deepDiff = require('deep-diff').diff;

class History {
    constructor(session, preset) {
        this.index = 0;
        this.listeners = new Map();
        this.setSession(session, preset);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event).add(callback);
        return this;
    }

    off(event, callback) {
        const listeners = this.listeners.get(event);
        if (listeners) listeners.delete(callback);
        return this;
    }

    emit(event, ...args) {
        const listeners = this.listeners.get(event);
        if (listeners) [...listeners].forEach((callback) => callback.apply(this, args));
        return this;
    }

    undo() {
        if (!this.index) return undefined;
        this.index--;
        const session = this.get();
        this.emit('undo', session, this.index);
        return session;
    }

    redo() {
        if (this.index === this.session.length - 1) return undefined;
        this.index++;
        const session = this.get();
        this.emit('redo', session, this.index);
        return session;
    }

    reset() {
        this.index = 0;
        const session = this.get();
        this.emit('reset', session, this.index);
        return session;
    }

    push(data, preset) {
        const sliced = this.index < this.session.length - 1;
        if (sliced) this.session = this.session.slice(0, this.index + 1);

        const session = {
            time: Date.now(),
            data: { ...(data || {}) },
            preset: { ...(preset || {}) }
        };
        if (this.equals(session.data)) return session;

        this.session.push(session);
        this.index = this.session.length - 1;
        this.emit('push', session, this.index, sliced);
        return session;
    }

    get(index = this.index) {
        return this.session[index] || false;
    }

    equals(session, compare) {
        if (compare === undefined) {
            const current = this.get();
            compare = current ? current.data : undefined;
        }
        return deepDiff(session, compare) === undefined;
    }

    diff(obj1, obj2) {
        if (!obj1 && !obj2 && this.session.length <= 1) return 'Not enough sessions to diff';
        return deepDiff(obj1 || this.get(this.index - 1), obj2 || this.get());
    }

    setSession(session, preset) {
        this.session = session ? [{
            time: Date.now(),
            data: { ...session },
            preset
        }] : [];
        this.index = 0;
        return this.session;
    }

    import() {}
    export() {}
}

module.exports = History;
