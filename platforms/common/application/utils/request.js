'use strict';

const methods = /^(get|post|put|delete|head|patch|options)$/i;

const encodeForm = (value, prefix) => {
    if (value == null) return [];
    if (Array.isArray(value)) {
        return value.flatMap((item, index) => encodeForm(item, `${prefix}[${index}]`));
    }
    if (typeof value === 'object') {
        return Object.entries(value).flatMap(([key, item]) =>
            encodeForm(item, prefix ? `${prefix}[${key}]` : key));
    }
    return [[prefix, String(value)]];
};

const parseHeaders = (headers) => {
    const parsed = {};
    headers.forEach((value, key) => {
        parsed[key.replace(/(^|-)([a-z])/g, (match) => match.toUpperCase())] = value;
    });
    return parsed;
};

class Response {
    constructor(text, status, headers) {
        this.text = text;
        this.status = status;
        this.header = parseHeaders(headers);
        const group = Math.floor(status / 100);
        this.info = group === 1;
        this.ok = group === 2;
        this.clientError = group === 4;
        this.serverError = group === 5;
        this.error = this.clientError || this.serverError;
        this.accepted = status === 202;
        this.noContent = status === 204 || status === 1223 || text.length === 0;
        this.badRequest = status === 400;
        this.unauthorized = status === 401;
        this.notAcceptable = status === 406;
        this.notFound = status === 404;

        const contentType = headers.get('content-type') || '';
        if (!this.noContent && contentType.includes('application/json')) {
            try { this.body = JSON.parse(text); }
            catch (error) { this.body = text; }
        } else {
            this.body = text;
        }
    }
}

class Request {
    constructor() {
        this._headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        this._listeners = new Map();
    }

    header(name, value) {
        if (typeof name === 'object') {
            Object.entries(name).forEach(([key, item]) => this.header(key, item));
        } else if (arguments.length === 0) return this._headers;
        else if (arguments.length === 1) return this._headers[name];
        else if (value == null) delete this._headers[name];
        else this._headers[name] = value;
        return this;
    }

    running() { return Boolean(this._running); }
    method(value) { if (!arguments.length) return this._method; this._method = value.toUpperCase(); return this; }
    data(value) { if (!arguments.length) return this._data; this._data = value; return this; }
    url(value) { if (!arguments.length) return this._url; this._url = value; return this; }
    user(value) { if (!arguments.length) return this._user; this._user = value; return this; }
    password(value) { if (!arguments.length) return this._password; this._password = value; return this; }

    on(event, callback) {
        if (!this._listeners.has(event)) this._listeners.set(event, new Set());
        this._listeners.get(event).add(callback);
        return this;
    }

    off(event, callback) {
        const listeners = this._listeners.get(event);
        if (listeners) listeners.delete(callback);
        return this;
    }

    emit(event, ...args) {
        const listeners = this._listeners.get(event);
        if (listeners) [...listeners].forEach((callback) => callback.apply(this, args));
    }

    abort() {
        if (this._controller) this._controller.abort();
        this._running = false;
        return this;
    }

    send(callback = () => {}) {
        if (this._running) this.abort();
        this._running = true;
        this._controller = new AbortController();

        const method = this._method || 'POST';
        let url = this._url;
        let data = this._data == null ? null : this._data;
        const contentType = (this._headers['Content-Type'] || '').split(';')[0];

        if (data != null && typeof data !== 'string') {
            data = contentType === 'application/json'
                ? JSON.stringify(data)
                : new URLSearchParams(encodeForm(data, '')).toString();
        }
        if (/GET|HEAD/.test(method) && data) {
            url += `${url.includes('?') ? '&' : '?'}${data}`;
            data = null;
        }

        const options = {
            method,
            headers: this._headers,
            body: data,
            credentials: this._user != null ? 'include' : 'same-origin',
            signal: this._controller.signal
        };
        if (/GET|HEAD/.test(method)) delete options.body;

        const responsePromise = fetch(url, options)
            .then(async (nativeResponse) => {
                const response = new Response(await nativeResponse.text(), nativeResponse.status, nativeResponse.headers);
                const error = response.error ? new Error(`${method} ${url} ${response.status}`) : null;

                return { error, response };
            });

        responsePromise
            .then(({ error, response }) => {
                this._running = false;
                this._controller = null;
                this.emit('load', response);
                callback(error, response);
            }, (error) => {
                this._running = false;
                this._controller = null;
                if (error.name === 'AbortError') this.emit('abort', error);
                else this.emit('error', error);
                callback(error, {
                    body: {
                        success: false,
                        message: error.message || String(error)
                    },
                    error: true,
                    ok: false,
                    status: 0
                });
            })
            .finally(() => {
                this.emit('loadend');
            });
        return this;
    }
}

function request(method, url, data, callback) {
    const instance = new Request();
    if (!arguments.length) return instance;

    if (!methods.test(method)) {
        callback = data;
        data = url;
        url = method;
        method = 'post';
    }
    if (typeof data === 'function') {
        callback = data;
        data = null;
    }
    instance.method(method);
    if (url) instance.url(url);
    if (data) instance.data(data);
    if (callback) instance.send(callback);
    return instance;
}

request.Request = Request;
request.Response = Response;
['get', 'post', 'put', 'delete', 'head', 'patch', 'options'].forEach((method) => {
    request[method] = (url, data, callback) => request(method, url, data, callback);
});

module.exports = request;
