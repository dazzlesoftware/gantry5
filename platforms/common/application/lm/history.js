'use strict';

const cloneSnapshot = value => {
    if (value == null) return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
};

const isObject = value => value !== null && typeof value === 'object';

const snapshotsEqual = (left, right, seen = new WeakMap()) => {
    if (left === right || (Number.isNaN(left) && Number.isNaN(right))) return true;
    if (!isObject(left) || !isObject(right)) return false;
    if (left.constructor !== right.constructor) return false;

    if (left instanceof Date) return left.getTime() === right.getTime();
    if (left instanceof RegExp) return left.source === right.source && left.flags === right.flags;

    const knownMatch = seen.get(left);
    if (knownMatch) return knownMatch === right;
    seen.set(left, right);

    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) return false;

    return leftKeys.every((key) => (
        Object.prototype.hasOwnProperty.call(right, key)
        && snapshotsEqual(left[key], right[key], seen)
    ));
};

const collectDifferences = (left, right, path = [], differences = []) => {
    if (snapshotsEqual(left, right)) return differences;

    if (isObject(left) && isObject(right) && left.constructor === right.constructor) {
        const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

        keys.forEach((key) => {
            const currentPath = [...path, Array.isArray(left) ? Number(key) : key];
            const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
            const hasRight = Object.prototype.hasOwnProperty.call(right, key);

            if (!hasLeft) {
                differences.push({ kind: 'N', path: currentPath, rhs: right[key] });
            } else if (!hasRight) {
                differences.push({ kind: 'D', path: currentPath, lhs: left[key] });
            } else {
                collectDifferences(left[key], right[key], currentPath, differences);
            }
        });

        return differences;
    }

    differences.push({
        kind: 'E',
        path: path.length ? path : undefined,
        lhs: left,
        rhs: right
    });

    return differences;
};

const diffSnapshots = (left, right) => {
    const differences = collectDifferences(left, right);
    return differences.length ? differences : undefined;
};

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
            data: cloneSnapshot(data || []),
            preset: cloneSnapshot(preset || {})
        };
        if (this.equals(session.data)) return session;

        this.session.push(session);
        this.index = this.session.length - 1;
        this.emit('push', session, this.index, sliced);
        return session;
    }

    get(index = this.index) {
        const session = this.session[index];
        return session ? cloneSnapshot(session) : false;
    }

    equals(session, compare) {
        if (compare === undefined) {
            const current = this.get();
            compare = current ? current.data : undefined;
        }
        return snapshotsEqual(session, compare);
    }

    diff(obj1, obj2) {
        if (!obj1 && !obj2 && this.session.length <= 1) return 'Not enough sessions to diff';
        return diffSnapshots(obj1 || this.get(this.index - 1), obj2 || this.get());
    }

    setSession(session, preset) {
        this.session = session ? [{
            time: Date.now(),
            data: cloneSnapshot(session),
            preset: cloneSnapshot(preset)
        }] : [];
        this.index = 0;
        return this.session;
    }

    import() {}
    export() {}
}

export default History;
