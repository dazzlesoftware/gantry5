'use strict';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

class SaveState {
    constructor(session) {
        this.setSession(clone(session));
    }

    setSession(session) {
        this.session = session ? { time: Date.now(), data: clone(session) } : {};
        return this.session;
    }

    getTime() { return this.session.time; }
    getData() { return this.session.data; }
    getSession() { return this.session; }

    getDiff(data) {
        return data;
    }
}

module.exports = SaveState;
