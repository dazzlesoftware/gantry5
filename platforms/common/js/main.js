(() => {
  // platforms/common/application/utils/dom-collection.js
  var eventListeners = /* @__PURE__ */ new WeakMap();
  var delegatedListeners = /* @__PURE__ */ new WeakMap();
  var elementMethods = /* @__PURE__ */ Object.create(null);
  var elementNode = (value) => value && value[0] ? value[0] : value;
  var targetNode = (value) => typeof value === "string" ? document.querySelector(value) : elementNode(value);
  var unique = (nodes) => Array.from(new Set(nodes));
  function Elements(nodes) {
    nodes.forEach((node, index) => {
      this[index] = node;
    });
    this.length = nodes.length;
    Object.assign(this, elementMethods);
  }
  function dom(value, context) {
    if (value === null || value === void 0) return null;
    if (value instanceof Elements) return value;
    let nodes = [];
    if (typeof value === "string") {
      const expression = value.trim();
      if (expression.startsWith("<") && expression.endsWith(">")) {
        const template = document.createElement("template");
        template.innerHTML = expression;
        nodes = Array.from(template.content.children);
      } else {
        const root = elementNode(context) || document;
        nodes = Array.from(root.querySelectorAll(selectorGroups(expression)));
      }
    } else if (value.nodeType || value === window) {
      nodes = [value];
    } else if (typeof value.length === "number") {
      Array.from(value).forEach((item) => {
        const wrapped = dom(item, context);
        if (wrapped) nodes.push(...Array.from(wrapped));
      });
    }
    nodes = unique(nodes.filter(Boolean));
    if (!nodes.length) return null;
    if (nodes.length === 1) {
      return new Elements(nodes);
    }
    return new Elements(nodes);
  }
  dom.implement = (methods2) => {
    Object.keys(methods2).forEach((name) => {
      elementMethods[name] = methods2[name];
    });
    return dom;
  };
  elementMethods.forEach = function(callback, context) {
    Array.from(this).forEach(callback, context);
    return this;
  };
  elementMethods.map = function(callback, context) {
    return Array.from(this).map(callback, context);
  };
  elementMethods.filter = function(callback, context) {
    return Array.from(this).filter(callback, context);
  };
  elementMethods.every = function(callback, context) {
    return Array.from(this).every(callback, context);
  };
  elementMethods.some = function(callback, context) {
    return Array.from(this).some(callback, context);
  };
  elementMethods.unlink = function() {
    return this.map((node) => node);
  };
  var selectorGroups = (expression) => String(expression || "*").split(",").map((selector) => {
    selector = selector.trim();
    return /^[>+~]/.test(selector) ? ":scope ".concat(selector) : selector;
  }).join(", ");
  var matches = (element, expression) => {
    if (expression === false) return false;
    const candidate = elementNode(expression);
    if (candidate && candidate.nodeType) return element === candidate;
    const selector = expression === void 0 || expression === null || expression === "" ? "*" : String(expression);
    return Boolean(element && element.nodeType === 1 && element.matches(selector));
  };
  var documentOrder = (nodes) => unique(nodes).sort((left, right) => {
    if (left === right) return 0;
    return left.compareDocumentPosition(right) & 2 ? 1 : -1;
  });
  var descendants = (context, expression) => {
    const candidate = elementNode(expression);
    if (candidate && candidate.nodeType) {
      return context !== candidate && context.contains(candidate) ? [candidate] : [];
    }
    return Array.from(context.querySelectorAll(selectorGroups(expression)));
  };
  var closestDelegated = (target, selector, root) => {
    if (!(target instanceof Element)) target = target && target.parentElement;
    if (!target) return null;
    const direct = String(selector || "").trim().match(/^>\s*(.+)$/);
    const match = target.closest(direct ? direct[1] : selector);
    if (!match) return null;
    if (direct) return match.parentElement === root ? match : null;
    return root === document || root === window || root === match || root.contains(match) ? match : null;
  };
  var accessors = {};
  ["type", "value", "name", "href", "title", "id", "className"].forEach((name) => {
    accessors[name] = function(value) {
      if (value === void 0) return this[0][name];
      return this.forEach((node) => {
        node[name] = value;
      });
    };
  });
  ["checked", "disabled", "selected"].forEach((name) => {
    accessors[name] = function(value) {
      if (value === void 0) return Boolean(this[0][name]);
      return this.forEach((node) => {
        node[name] = Boolean(value);
      });
    };
  });
  dom.implement(accessors);
  dom.implement({
    setAttribute: function(name, value) {
      return this.forEach((node) => node.setAttribute(name, value));
    },
    getAttribute: function(name) {
      return this[0].hasAttribute(name) ? this[0].getAttribute(name) : null;
    },
    hasAttribute: function(name) {
      return this[0].hasAttribute(name);
    },
    removeAttribute: function(name) {
      return this.forEach((node) => node.removeAttribute(name));
    },
    attribute: function(name, value) {
      if (name && typeof name === "object") {
        Object.keys(name).forEach((key) => this.attribute(key, name[key]));
        return this;
      }
      const properties = ["type", "value", "name", "href", "title", "id"];
      const booleans = ["checked", "disabled", "selected"];
      if (value === void 0) {
        if (properties.includes(name)) return this[0][name];
        if (booleans.includes(name)) return Boolean(this[0][name]);
        return this.getAttribute(name);
      }
      if (value === null) return this.removeAttribute(name);
      if (properties.includes(name)) return this.forEach((node) => {
        node[name] = value;
      });
      if (booleans.includes(name)) return this.forEach((node) => {
        node[name] = Boolean(value);
      });
      return this.setAttribute(name, value);
    },
    classNames: function() {
      return Array.from(this[0].classList || []).sort();
    },
    hasClass: function(className) {
      return this[0].classList.contains(className);
    },
    addClass: function(className) {
      const classes = String(className || "").trim().split(/\s+/).filter(Boolean);
      return this.forEach((node) => node.classList.add(...classes));
    },
    removeClass: function(className) {
      const classes = String(className || "").trim().split(/\s+/).filter(Boolean);
      return this.forEach((node) => node.classList.remove(...classes));
    },
    toggleClass: function(className, force) {
      const add = force !== void 0 ? force : !this.hasClass(className);
      this.forEach((node) => node.classList.toggle(className, Boolean(add)));
      return Boolean(add);
    },
    tag: function() {
      return this[0].tagName.toLowerCase();
    },
    html: function(value) {
      if (value === void 0) return this[0].innerHTML;
      return this.forEach((node) => {
        node.innerHTML = value;
      });
    },
    text: function(value) {
      if (value === void 0) return this[0].textContent;
      return this.forEach((node) => {
        node.textContent = value;
      });
    },
    data: function(key, value) {
      if (value === void 0) return this.getAttribute("data-".concat(key));
      if (value === null) return this.removeAttribute("data-".concat(key));
      return this.setAttribute("data-".concat(key), value);
    },
    check: function() {
      return this.checked(true);
    },
    uncheck: function() {
      return this.checked(false);
    },
    disable: function() {
      return this.disabled(true);
    },
    enable: function() {
      return this.disabled(false);
    },
    select: function() {
      return this.selected(true);
    },
    deselect: function() {
      return this.selected(false);
    },
    on: function(event, handle, useCapture) {
      return this.forEach((node) => {
        let listeners = eventListeners.get(node);
        if (!listeners) {
          listeners = [];
          eventListeners.set(node, listeners);
        }
        if (listeners.some((item) => item.event === event && item.handle === handle && item.useCapture === Boolean(useCapture))) return;
        const listener = (nativeEvent) => handle.call(dom(node), nativeEvent);
        const registration = {
          event,
          handle,
          useCapture: Boolean(useCapture),
          listener
        };
        listeners.push(registration);
        node.addEventListener(event, listener, registration.useCapture);
      });
    },
    off: function(event, handle, useCapture) {
      return this.forEach((node) => {
        const listeners = eventListeners.get(node);
        if (!listeners) return;
        for (let index = listeners.length - 1; index >= 0; index--) {
          const item = listeners[index];
          if (item.event !== event || handle && item.handle !== handle || item.useCapture !== Boolean(useCapture)) continue;
          node.removeEventListener(event, item.listener, item.useCapture);
          listeners.splice(index, 1);
        }
        if (!listeners.length) eventListeners.delete(node);
      });
    },
    emit: function(event, ...args) {
      return this.forEach((node) => {
        const listeners = eventListeners.get(node) || [];
        listeners.filter((item) => item.event === event).slice().forEach((item) => item.handle.apply(dom(node), args));
      });
    },
    appendChild: function(child) {
      this[0].appendChild(elementNode(child));
      return this;
    },
    insertBefore: function(child, reference) {
      this[0].insertBefore(elementNode(child), elementNode(reference));
      return this;
    },
    removeChild: function(child) {
      this[0].removeChild(elementNode(child));
      return this;
    },
    replaceChild: function(child, reference) {
      this[0].replaceChild(elementNode(child), elementNode(reference));
      return this;
    },
    before: function(element) {
      element = elementNode(element);
      if (!element || !element.parentNode) return this;
      return this.forEach((node) => element.parentNode.insertBefore(node, element));
    },
    after: function(element) {
      element = elementNode(element);
      if (!element || !element.parentNode) return this;
      return this.forEach((node) => element.parentNode.insertBefore(node, element.nextSibling));
    },
    bottom: function(element) {
      element = targetNode(element);
      if (!element || typeof element.appendChild !== "function") return this;
      return this.forEach((node) => element.appendChild(node));
    },
    top: function(element) {
      element = targetNode(element);
      if (!element || typeof element.insertBefore !== "function") return this;
      return this.forEach((node) => element.insertBefore(node, element.firstChild));
    },
    insert: function(element) {
      return this.bottom(element);
    },
    remove: function() {
      return this.forEach((node) => node.remove());
    },
    replace: function(element) {
      element = elementNode(element);
      if (element && element.parentNode) element.parentNode.replaceChild(this[0], element);
      return this;
    },
    search: function(expression) {
      const found = [];
      this.forEach((context) => found.push(...descendants(context, expression)));
      return dom(documentOrder(found));
    },
    find: function(expression) {
      for (let index = 0; index < this.length; index++) {
        const found = descendants(this[index], expression)[0];
        if (found) return dom(found);
      }
      return null;
    },
    sort: function() {
      return dom(documentOrder(Array.from(this)));
    },
    matches: function(expression) {
      return matches(this[0], expression);
    },
    contains: function(node) {
      node = elementNode(node);
      return Boolean(this[0] && node && this[0].contains(node));
    },
    nextSiblings: function(expression) {
      const found = [];
      this.forEach((element) => {
        for (let sibling = element.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
          if (matches(sibling, expression)) found.push(sibling);
        }
      });
      return dom(documentOrder(found));
    },
    nextSibling: function(expression) {
      for (let index = 0; index < this.length; index++) {
        let sibling = this[index].nextElementSibling;
        while (sibling && !matches(sibling, expression)) sibling = sibling.nextElementSibling;
        if (sibling) return dom(sibling);
      }
      return null;
    },
    previousSiblings: function(expression) {
      const found = [];
      this.forEach((element) => {
        for (let sibling = element.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
          if (matches(sibling, expression)) found.push(sibling);
        }
      });
      return dom(documentOrder(found));
    },
    previousSibling: function(expression) {
      for (let index = 0; index < this.length; index++) {
        let sibling = this[index].previousElementSibling;
        while (sibling && !matches(sibling, expression)) sibling = sibling.previousElementSibling;
        if (sibling) return dom(sibling);
      }
      return null;
    },
    children: function(expression) {
      const found = [];
      this.forEach((element) => {
        Array.from(element.children || []).forEach((child) => {
          if (matches(child, expression)) found.push(child);
        });
      });
      return dom(documentOrder(found));
    },
    firstChild: function(expression) {
      for (let index = 0; index < this.length; index++) {
        const found = Array.from(this[index].children || []).find((child) => matches(child, expression));
        if (found) return dom(found);
      }
      return null;
    },
    lastChild: function(expression) {
      for (let index = 0; index < this.length; index++) {
        const children = Array.from(this[index].children || []);
        const found = children.reverse().find((child) => matches(child, expression));
        if (found) return dom(found);
      }
      return null;
    },
    parent: function(expression) {
      for (let index = 0; index < this.length; index++) {
        for (let parent = this[index].parentElement; parent; parent = parent.parentElement) {
          if (matches(parent, expression)) return dom(parent);
        }
      }
      return null;
    },
    parents: function(expression) {
      let selector = expression;
      let first = false;
      if (typeof selector === "string" && /:first$/.test(selector)) {
        selector = selector.replace(/:first$/, "");
        first = true;
      }
      const found = [];
      this.forEach((element) => {
        for (let parent = element.parentElement; parent; parent = parent.parentElement) {
          if (!matches(parent, selector)) continue;
          found.push(parent);
          if (first) break;
        }
      });
      return dom(first ? unique(found) : documentOrder(found));
    },
    delegate: function(event, selector, handle, useCapture) {
      return this.forEach((node) => {
        let registrations = delegatedListeners.get(node);
        if (!registrations) {
          registrations = [];
          delegatedListeners.set(node, registrations);
        }
        if (registrations.some((item) => item.event === event && item.selector === selector && item.handle === handle && item.useCapture === Boolean(useCapture))) return;
        const listener = (originalEvent) => {
          const match = closestDelegated(originalEvent.target || originalEvent.srcElement, selector, node);
          if (match) return handle.call(dom(node), originalEvent, dom(match));
        };
        const registration = { event, selector, handle, useCapture: Boolean(useCapture), listener };
        registrations.push(registration);
        dom(node).on(event, listener, registration.useCapture);
      });
    },
    undelegate: function(event, selector, handle, useCapture) {
      return this.forEach((node) => {
        const registrations = delegatedListeners.get(node);
        if (!registrations) return;
        for (let index = registrations.length - 1; index >= 0; index--) {
          const item = registrations[index];
          if (item.event !== event || item.selector !== selector || item.handle !== handle || item.useCapture !== Boolean(useCapture)) continue;
          dom(node).off(event, item.listener, item.useCapture);
          registrations.splice(index, 1);
        }
        if (!registrations.length) delegatedListeners.delete(node);
      });
    }
  });
  var dom_collection_default = dom;

  // platforms/common/application/utils/create-element.js
  var dom2 = dom_collection_default;
  var attributePattern = /\[\s*([^\s~|^$*=\]]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*\]/g;
  var classPattern = /\.([a-zA-Z_][\w-]*)/g;
  var idPattern = /#([a-zA-Z_][\w-]*)/;
  var tagPattern = /^\s*([a-zA-Z][\w-]*)/;
  function createElement(expression, ownerDocument) {
    const definition = String(expression || "div");
    const tag = (definition.match(tagPattern) || [null, "div"])[1];
    const element = (ownerDocument || document).createElement(tag);
    const id2 = definition.match(idPattern);
    const classes = [];
    let match;
    while (match = classPattern.exec(definition)) {
      classes.push(match[1]);
    }
    if (id2) element.id = id2[1];
    if (classes.length) element.className = classes.join(" ");
    while (match = attributePattern.exec(definition)) {
      const value = match[2] !== void 0 ? match[2] : match[3] !== void 0 ? match[3] : match[4] !== void 0 ? match[4] : "";
      element.setAttribute(match[1], value);
    }
    return dom2(element);
  }

  // platforms/common/application/utils/dom.js
  var ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };
  var delegate = (element, type, selector, callback, options) => {
    const listener = (event) => {
      const target = event.target instanceof Element ? event.target.closest(selector) : null;
      if (target && element.contains(target)) callback(event, target);
    };
    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
  };
  var dom_default = { ready, delegate };

  // platforms/common/application/utils/request.js
  var methods = /^(get|post|put|delete|head|patch|options)$/i;
  var encodeForm = (value, prefix) => {
    if (value == null) return [];
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => encodeForm(item, "".concat(prefix, "[").concat(index, "]")));
    }
    if (typeof value === "object") {
      return Object.entries(value).flatMap(([key, item]) => encodeForm(item, prefix ? "".concat(prefix, "[").concat(key, "]") : key));
    }
    return [[prefix, String(value)]];
  };
  var parseHeaders = (headers) => {
    const parsed = {};
    headers.forEach((value, key) => {
      parsed[key.replace(/(^|-)([a-z])/g, (match) => match.toUpperCase())] = value;
    });
    return parsed;
  };
  var Response = class {
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
      const contentType = headers.get("content-type") || "";
      if (!this.noContent && contentType.includes("application/json")) {
        try {
          this.body = JSON.parse(text);
        } catch (error) {
          this.body = text;
        }
      } else {
        this.body = text;
      }
    }
  };
  var Request = class {
    constructor() {
      this._headers = { "Content-Type": "application/x-www-form-urlencoded" };
      this._listeners = /* @__PURE__ */ new Map();
    }
    header(name, value) {
      if (typeof name === "object") {
        Object.entries(name).forEach(([key, item]) => this.header(key, item));
      } else if (arguments.length === 0) return this._headers;
      else if (arguments.length === 1) return this._headers[name];
      else if (value == null) delete this._headers[name];
      else this._headers[name] = value;
      return this;
    }
    running() {
      return Boolean(this._running);
    }
    method(value) {
      if (!arguments.length) return this._method;
      this._method = value.toUpperCase();
      return this;
    }
    data(value) {
      if (!arguments.length) return this._data;
      this._data = value;
      return this;
    }
    url(value) {
      if (!arguments.length) return this._url;
      this._url = value;
      return this;
    }
    user(value) {
      if (!arguments.length) return this._user;
      this._user = value;
      return this;
    }
    password(value) {
      if (!arguments.length) return this._password;
      this._password = value;
      return this;
    }
    on(event, callback) {
      if (!this._listeners.has(event)) this._listeners.set(event, /* @__PURE__ */ new Set());
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
    send(callback = () => {
    }) {
      if (this._running) this.abort();
      this._running = true;
      this._controller = new AbortController();
      const method = this._method || "POST";
      let url = this._url;
      let data = this._data == null ? null : this._data;
      const contentType = (this._headers["Content-Type"] || "").split(";")[0];
      if (data != null && typeof data !== "string") {
        data = contentType === "application/json" ? JSON.stringify(data) : new URLSearchParams(encodeForm(data, "")).toString();
      }
      if (/GET|HEAD/.test(method) && data) {
        url += "".concat(url.includes("?") ? "&" : "?").concat(data);
        data = null;
      }
      const options = {
        method,
        headers: this._headers,
        body: data,
        credentials: this._user != null ? "include" : "same-origin",
        signal: this._controller.signal
      };
      if (/GET|HEAD/.test(method)) delete options.body;
      const responsePromise = fetch(url, options).then(async (nativeResponse) => {
        const response = new Response(await nativeResponse.text(), nativeResponse.status, nativeResponse.headers);
        const error = response.error ? new Error("".concat(method, " ").concat(url, " ").concat(response.status)) : null;
        return { error, response };
      });
      responsePromise.then(({ error, response }) => {
        this._running = false;
        this._controller = null;
        this.emit("load", response);
        callback(error, response);
      }, (error) => {
        this._running = false;
        this._controller = null;
        if (error.name === "AbortError") this.emit("abort", error);
        else this.emit("error", error);
        callback(error, {
          body: {
            success: false,
            message: error.message || String(error)
          },
          error: true,
          ok: false,
          status: 0
        });
      }).finally(() => {
        this.emit("loadend");
      });
      return this;
    }
  };
  function request(method, url, data, callback) {
    const instance2 = new Request();
    if (!arguments.length) return instance2;
    if (!methods.test(method)) {
      callback = data;
      data = url;
      url = method;
      method = "post";
    }
    if (typeof data === "function") {
      callback = data;
      data = null;
    }
    instance2.method(method);
    if (url) instance2.url(url);
    if (data) instance2.data(data);
    if (callback) instance2.send(callback);
    return instance2;
  }
  request.Request = Request;
  request.Response = Response;
  ["get", "post", "put", "delete", "head", "patch", "options"].forEach((method) => {
    request[method] = (url, data, callback) => request(method, url, data, callback);
  });
  var request_default = request;

  // platforms/common/application/utils/event-emitter.js
  var EventEmitter = class {
    constructor() {
      this.listeners = /* @__PURE__ */ new Map();
    }
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, /* @__PURE__ */ new Set());
      }
      this.listeners.get(event).add(callback);
      return this;
    }
    once(event, callback) {
      let listener = (function() {
        this.off(event, listener);
        callback.apply(this, arguments);
      }).bind(this);
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
      let args = Array.prototype.slice.call(arguments, 1), callbacks = this.listeners.get(event);
      if (callbacks) {
        Array.from(callbacks).forEach(function(callback) {
          callback.apply(this, args);
        }, this);
      }
      return this;
    }
  };
  var event_emitter_default = EventEmitter;

  // platforms/common/application/utils/search-index.js
  var normalizeText = (value, diacritics) => {
    const normalized = String(value == null ? "" : value).toLowerCase();
    return diacritics ? normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : normalized;
  };
  var getValue = (item, field, nesting) => {
    if (!nesting) return item == null ? void 0 : item[field];
    return String(field).split(".").reduce(
      (value, key) => value == null ? void 0 : value[key],
      item
    );
  };
  var compareValues = (left, right, diacritics) => {
    if (typeof left === "number" && typeof right === "number") {
      return left > right ? 1 : left < right ? -1 : 0;
    }
    const normalizedLeft = normalizeText(left, diacritics);
    const normalizedRight = normalizeText(right, diacritics);
    return normalizedLeft > normalizedRight ? 1 : normalizedLeft < normalizedRight ? -1 : 0;
  };
  var SearchIndex = class {
    constructor(items, settings) {
      this.items = items;
      this.settings = settings || { diacritics: true };
    }
    tokenize(query) {
      const normalized = normalizeText(query, this.settings.diacritics).trim();
      return normalized ? normalized.split(/\s+/) : [];
    }
    getScoreFunction(query, options) {
      const tokens = this.tokenize(query);
      const fields2 = Array.isArray(options.fields) ? options.fields : [options.fields].filter(Boolean);
      const conjunction = options.conjunction || "and";
      const diacritics = this.settings.diacritics;
      const nesting = options.nesting;
      if (!tokens.length || !fields2.length) return () => 0;
      const scoreValue = (value, token) => {
        if (value == null || value === "") return 0;
        const normalized = normalizeText(value, diacritics);
        const position = normalized.indexOf(token);
        if (position === -1) return 0;
        return token.length / normalized.length + (position === 0 ? 0.5 : 0);
      };
      const scoreToken = (item, token) => fields2.reduce(
        (sum, field) => sum + scoreValue(getValue(item, field, nesting), token),
        0
      ) / fields2.length;
      return (item) => {
        const scores = tokens.map((token) => scoreToken(item, token));
        if (conjunction === "and" && scores.some((score) => score <= 0)) return 0;
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
      };
    }
    getSortFunction(query, options) {
      let fields2 = Array.isArray(options.sort) ? options.sort.slice() : [];
      const hasScore = fields2.some((sort) => sort.field === "$score");
      const diacritics = this.settings.diacritics;
      if (query && !hasScore) fields2.unshift({ field: "$score", direction: "desc" });
      if (!query) fields2 = fields2.filter((sort) => sort.field !== "$score");
      if (!fields2.length) return null;
      return (left, right) => {
        for (const sort of fields2) {
          const multiplier = sort.direction === "desc" ? -1 : 1;
          const leftValue = sort.field === "$score" ? left.score : getValue(this.items[left.id], sort.field, options.nesting);
          const rightValue = sort.field === "$score" ? right.score : getValue(this.items[right.id], sort.field, options.nesting);
          const result = multiplier * compareValues(leftValue, rightValue, diacritics);
          if (result) return result;
        }
        return 0;
      };
    }
    search(query, options) {
      const normalizedQuery = normalizeText(query, this.settings.diacritics).trim();
      const score = options.score || this.getScoreFunction(normalizedQuery, options);
      const results = [];
      Object.keys(this.items).forEach((id2) => {
        const itemScore = normalizedQuery ? score(this.items[id2]) : 1;
        if (!normalizedQuery || options.filter === false || itemScore > 0) {
          results.push({ score: itemScore, id: id2 });
        }
      });
      const sort = this.getSortFunction(normalizedQuery, options);
      if (sort) results.sort(sort);
      return {
        options,
        query: normalizedQuery,
        tokens: this.tokenize(normalizedQuery),
        total: results.length,
        items: typeof options.limit === "number" ? results.slice(0, options.limit) : results
      };
    }
  };
  var search_index_default = SearchIndex;

  // platforms/common/application/ui/progresser.js
  var defaults = {
    value: 0,
    size: 50,
    startAngle: -Math.PI / 2,
    thickness: "auto",
    fill: {
      gradient: ["#9e38eb", "#4e68fc"]
    },
    emptyFill: "rgba(0, 0, 0, .1)",
    animation: {
      duration: 1200,
      equation: "cubic-bezier(0.645, 0.045, 0.355, 1)"
    },
    animationStartValue: 0,
    reverse: false,
    lineCap: "butt",
    insertElement: null,
    insertLocation: "before"
  };
  var asElement = function(element) {
    if (element && element.nodeType) {
      return element;
    }
    if (element && element[0] && element[0].nodeType) {
      return element[0];
    }
    return null;
  };
  var insertCanvas = function(canvas, target, location) {
    if (!target) {
      throw new Error("The progress indicator needs a target element.");
    }
    switch (location) {
      case "top":
        target.insertBefore(canvas, target.firstChild);
        break;
      case "bottom":
        target.appendChild(canvas);
        break;
      case "after":
        target.parentNode.insertBefore(canvas, target.nextSibling);
        break;
      case "before":
      default:
        target.parentNode.insertBefore(canvas, target);
        break;
    }
  };
  var Progresser = function(element, options) {
    this.element = asElement(element);
    this.options = Object.assign({}, defaults, options || {});
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.arcFill = null;
    this.lastFrameValue = 0;
    this.animationFrame = null;
    let target = asElement(this.options.insertElement) || this.element;
    insertCanvas(this.canvas, target, this.options.insertLocation || "before");
    this.update(options);
  };
  Progresser.prototype.update = function(options) {
    this.options = Object.assign({}, this.options, options || {});
    this.radius = this.options.size / 2;
    this.canvas.width = this.options.size;
    this.canvas.height = this.options.size;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.initFill();
    this.draw();
    return this;
  };
  Progresser.prototype.initFill = function() {
    let fill = this.options.fill, size3 = this.options.size, ctx = this.ctx;
    if (!fill) {
      throw new Error("The fill is not specified.");
    }
    this.arcFill = fill.color || null;
    if (fill.gradient) {
      let colors = fill.gradient;
      if (colors.length === 1) {
        this.arcFill = colors[0];
      } else {
        let angle = fill.gradientAngle || 0, direction = fill.gradientDirection || [
          size3 / 2 * (1 - Math.cos(angle)),
          size3 / 2 * (1 + Math.sin(angle)),
          size3 / 2 * (1 + Math.cos(angle)),
          size3 / 2 * (1 - Math.sin(angle))
        ], gradient = ctx.createLinearGradient.apply(ctx, direction);
        colors.forEach(function(entry, index) {
          let color = entry, position = index / (colors.length - 1);
          if (Array.isArray(entry)) {
            color = entry[0];
            position = entry[1];
          }
          gradient.addColorStop(position, color);
        });
        this.arcFill = gradient;
      }
    }
  };
  Progresser.prototype.emit = function(name, detail) {
    this.element.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail
    }));
  };
  Progresser.prototype.draw = function() {
    if (this.options.animation) {
      this.drawAnimated(this.options.value);
    } else {
      this.drawFrame(this.options.value);
    }
  };
  Progresser.prototype.drawFrame = function(value) {
    this.lastFrameValue = value;
    this.ctx.clearRect(0, 0, this.options.size, this.options.size);
    this.drawEmptyArc(value);
    this.drawArc(value);
  };
  Progresser.prototype.drawArc = function(value) {
    let ctx = this.ctx, radius = this.radius, thickness = this.getThickness(), angle = this.options.startAngle;
    ctx.save();
    ctx.beginPath();
    if (!this.options.reverse) {
      ctx.arc(radius, radius, radius - thickness / 2, angle, angle + Math.PI * 2 * value);
    } else {
      ctx.arc(radius, radius, radius - thickness / 2, angle - Math.PI * 2 * value, angle);
    }
    ctx.lineWidth = thickness;
    ctx.lineCap = this.options.lineCap;
    ctx.strokeStyle = this.arcFill;
    ctx.stroke();
    ctx.restore();
  };
  Progresser.prototype.drawEmptyArc = function(value) {
    let ctx = this.ctx, radius = this.radius, thickness = this.getThickness(), angle = this.options.startAngle;
    if (value >= 1) {
      return;
    }
    ctx.save();
    ctx.beginPath();
    if (value <= 0) {
      ctx.arc(radius, radius, radius - thickness / 2, 0, Math.PI * 2);
    } else if (!this.options.reverse) {
      ctx.arc(radius, radius, radius - thickness / 2, angle + Math.PI * 2 * value, angle);
    } else {
      ctx.arc(radius, radius, radius - thickness / 2, angle, angle - Math.PI * 2 * value);
    }
    ctx.lineWidth = thickness;
    ctx.strokeStyle = this.options.emptyFill;
    ctx.stroke();
    ctx.restore();
  };
  Progresser.prototype.drawAnimated = function(value) {
    this.emit("progress-animation-start", { value });
    let start = performance.now(), duration = parseFloat(this.options.animation.duration) || 1200, initial = this.lastFrameValue, frame = (function(timestamp) {
      let progress = Math.min(1, (timestamp - start) / duration), stepValue = initial * (1 - progress) + value * progress;
      this.drawFrame(stepValue);
      this.emit("progress-animation-change", {
        progress,
        value: stepValue
      });
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(frame);
        return;
      }
      this.animationFrame = null;
      if (this.options.animation.callback) {
        this.options.animation.callback();
      }
      this.emit("progress-animation-end", { value });
    }).bind(this);
    this.animationFrame = requestAnimationFrame(frame);
  };
  Progresser.prototype.getThickness = function() {
    return typeof this.options.thickness === "number" ? this.options.thickness : this.options.size / 14;
  };
  Progresser.prototype.destroy = function() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.animationFrame = null;
  };
  var progresser_default = Progresser;

  // platforms/common/application/utils/indicator.js
  var asElement2 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var show = function(element, className, keepIcon) {
    element = asElement2(element);
    if (!element) {
      return;
    }
    if (typeof className === "boolean") {
      keepIcon = className;
      className = null;
    }
    let icon = keepIcon ? null : element.querySelector("i");
    element.gHadIcon = Boolean(icon);
    if (!icon) {
      if (!element.querySelector("span") && element.children.length === 0) {
        let label = document.createElement("span");
        label.textContent = element.textContent;
        element.textContent = "";
        element.appendChild(label);
      }
      icon = document.createElement("i");
      element.insertBefore(icon, element.firstChild);
    }
    if (!element.gIndicator) {
      element.gIndicator = icon.getAttribute("class") || true;
    }
    icon.setAttribute("class", className || "fa fa-fw fa-spin-fast fa-spinner");
  };
  var hide = function(element) {
    element = asElement2(element);
    if (!element || !element.gIndicator) {
      return;
    }
    let icon = element.querySelector("i");
    if (!icon) {
      return;
    }
    if (!element.gHadIcon) {
      icon.remove();
    } else {
      icon.setAttribute("class", element.gIndicator);
    }
    element.gIndicator = null;
  };
  var indicator_default = { show, hide };

  // platforms/common/application/utils/dom-effects.js
  var dom3 = dom_collection_default;
  var progresser = progresser_default;
  var indicator = indicator_default;
  var unitless = ["opacity", "zIndex", "fontWeight", "lineHeight", "zoom", "order", "flexGrow", "flexShrink"];
  var durationMs = function(value) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return 0;
    }
    if (typeof value === "number") {
      return value;
    }
    value = String(value || "250ms").trim();
    return value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1e3;
  };
  var styleValue = function(property, value) {
    return typeof value === "number" && unitless.indexOf(property) === -1 ? value + "px" : String(value);
  };
  var sequence = function() {
    let callbacks = Array.prototype.slice.call(arguments);
    return function() {
      let args = arguments, context = this;
      callbacks.forEach(function(callback) {
        callback.apply(context, args);
      });
    };
  };
  var matches2 = function(element, expression) {
    return element && element.nodeType === Node.ELEMENT_NODE && element.matches(expression || "*");
  };
  var adjacentSiblings = function(expression) {
    let siblings2 = [];
    this.forEach(function(element) {
      let previous = element.previousElementSibling, next = element.nextElementSibling;
      if (matches2(previous, expression) && siblings2.indexOf(previous) === -1) {
        siblings2.push(previous);
      }
      if (matches2(next, expression) && siblings2.indexOf(next) === -1) {
        siblings2.push(next);
      }
    });
    return dom3(siblings2);
  };
  var matchingSiblings = function(expression) {
    let siblings2 = [];
    this.forEach(function(element) {
      if (!element.parentElement) {
        return;
      }
      Array.prototype.forEach.call(element.parentElement.children, function(sibling) {
        if (sibling !== element && matches2(sibling, expression) && siblings2.indexOf(sibling) === -1) {
          siblings2.push(sibling);
        }
      });
    });
    return dom3(siblings2);
  };
  dom3.implement({
    style: function() {
      let property = arguments[0], value = arguments[1];
      this.forEach(function(element) {
        if (typeof property === "string") {
          element.style[property] = styleValue(property, value);
          return;
        }
        Object.keys(property || {}).forEach(function(key) {
          element.style[key] = styleValue(key, property[key]);
        });
      });
      return this;
    },
    animate: function(properties, options) {
      options = typeof options === "string" ? { duration: options } : options || {};
      let duration = durationMs(options.duration), easing = options.equation || options.easing || "ease", callback = options.callback || function() {
      }, remaining = this.length;
      if (!remaining) {
        callback.call(this);
        return this;
      }
      this.forEach(function(element) {
        let from = {}, to = {};
        Object.keys(properties).forEach(function(property) {
          from[property] = getComputedStyle(element)[property];
          to[property] = styleValue(property, properties[property]);
        });
        if (!element.animate || duration <= 0) {
          Object.assign(element.style, to);
          if (!--remaining) {
            callback.call(this);
          }
          return;
        }
        let animation = element.animate([from, to], { duration, easing, fill: "forwards" });
        animation.addEventListener("finish", (function() {
          Object.assign(element.style, to);
          animation.cancel();
          if (!--remaining) {
            callback.call(this);
          }
        }).bind(this), { once: true });
      }, this);
      return this;
    },
    hide: function() {
      return this.style("display", "none");
    },
    show: function(mode) {
      return this.style("display", mode || "inherit");
    },
    progresser: function(options) {
      let instance2;
      this.forEach(function(node) {
        instance2 = node.ProgresserInstance;
        if (!instance2) {
          instance2 = new progresser(node, options);
        } else {
          instance2.update(options);
        }
        node.ProgresserInstance = instance2;
        return instance2;
      });
    },
    compute: function() {
      if (!this[0]) {
        return null;
      }
      let computed = getComputedStyle(this[0]), property = arguments[0];
      return property ? computed[property] || computed.getPropertyValue(property) : computed;
    },
    showIndicator: function(klass, keepIcon) {
      this.forEach(function(node) {
        indicator.show(node, klass, keepIcon);
      });
    },
    hideIndicator: function() {
      this.forEach(function(node) {
        indicator.hide(node);
      });
    },
    slideDown: function(animation, callback) {
      let element = this, size3 = this.getRealSize(), callbackStart = function() {
        element.gSlideCollapsed = false;
      }, callbackEnd = function() {
        element.attribute("style", element.gSlideStyle);
      };
      callback = typeof animation === "function" ? animation : callback || function() {
      };
      if (this.gSlideCollapsed === false) {
        return callback();
      }
      callback = sequence(callbackStart, callback, callbackEnd);
      animation = typeof animation === "string" ? animation : {
        duration: "250ms",
        callback
      };
      this.style("visibility", "visible").attribute("aria-hidden", false);
      this.animate({ height: size3.height }, animation);
    },
    slideUp: function(animation, callback) {
      if (typeof this.gSlideCollapsed === "undefined") {
        this.gSlideStyle = this.attribute("style");
      }
      let element = this, callbackStart = function() {
        element.gSlideCollapsed = true;
      }, callbackEnd = function() {
        element.style("visibility", "hidden").attribute("aria-hidden", true);
      };
      callback = typeof animation === "function" ? animation : callback || function() {
      };
      if (this.gSlideCollapsed === true) {
        return callback();
      }
      callback = sequence(callbackStart, callback, callbackEnd);
      animation = typeof animation === "string" ? animation : {
        duration: "250ms",
        callback
      };
      this.style({ overflow: "hidden" }).animate({ height: 0 }, animation);
    },
    slideToggle: function(animation, callback) {
      let size3 = this.getRealSize();
      return this[size3.height && !this.gSlideCollapsed ? "slideUp" : "slideDown"](animation, callback);
    },
    getRealSize: function() {
      let style = this.attribute("style"), size3;
      this.style({
        position: "relative",
        overflow: "inherit",
        top: -5e4,
        height: "auto",
        width: "auto"
      });
      size3 = {
        width: parseInt(this.compute("width"), 10),
        height: parseInt(this.compute("height"), 10)
      };
      this[0].style = style;
      return size3;
    },
    sibling: adjacentSiblings,
    siblings: matchingSiblings
  });
  var dom_effects_default = dom3;

  // platforms/common/application/ui/selectize.js
  var EventEmitter2 = event_emitter_default;
  var ready2 = dom_default.ready;
  var zen = createElement;
  var NativeSearchIndex = search_index_default;
  var dom4 = dom_effects_default;
  var bind = function(fn, context) {
    let args = Array.prototype.slice.call(arguments, 2);
    return fn.bind.apply(fn, [context].concat(args));
  };
  var forEach = function(collection, callback, context) {
    if (!collection) {
      return collection;
    }
    Array.prototype.forEach.call(collection, callback, context);
    return collection;
  };
  var indexOf = function(collection, value) {
    return Array.prototype.indexOf.call(collection || [], value);
  };
  var last = function(collection) {
    return collection && collection.length ? collection[collection.length - 1] : void 0;
  };
  var debounce = function(callback, delay) {
    let timer;
    return function() {
      let context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        callback.apply(context, args);
      }, delay);
    };
  };
  var isArray = Array.isArray;
  var isBoolean = function(value) {
    return typeof value === "boolean";
  };
  var isPlainObject = function(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") {
      return false;
    }
    let prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
  };
  var cloneValue = function(value, seen) {
    if (!value || typeof value !== "object") {
      return value;
    }
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
      return new RegExp(value.source, value.flags);
    }
    if (!Array.isArray(value) && !isPlainObject(value)) {
      return value;
    }
    if (seen.has(value)) {
      return seen.get(value);
    }
    let clone3 = Array.isArray(value) ? [] : {};
    seen.set(value, clone3);
    Object.keys(value).forEach(function(key) {
      clone3[key] = cloneValue(value[key], seen);
    });
    return clone3;
  };
  var mergeInto = function(target, source, seen) {
    if (!isPlainObject(source)) {
      return target;
    }
    if (seen.has(source)) {
      return seen.get(source);
    }
    seen.set(source, target);
    Object.keys(source).forEach(function(key) {
      let value = source[key];
      if (isPlainObject(value)) {
        if (seen.has(value)) {
          target[key] = seen.get(value);
        } else {
          target[key] = mergeInto(isPlainObject(target[key]) ? target[key] : {}, value, seen);
        }
      } else {
        target[key] = cloneValue(value, seen);
      }
    });
    return target;
  };
  var merge = function() {
    let sources = Array.prototype.slice.call(arguments), target = {}, seen = /* @__PURE__ */ new WeakMap();
    sources.forEach(function(source) {
      if (isPlainObject(source)) {
        mergeInto(target, source, seen);
      }
    });
    return target;
  };
  var size = function(object) {
    return object ? Object.keys(object).length : 0;
  };
  var escapeHTML = function(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  };
  var trim = function(value) {
    return String(value == null ? "" : value).trim();
  };
  var slugify = function(value) {
    return String(value == null ? "" : value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, " ").trim().replace(/\s+/g, "-").toLowerCase();
  };
  var KEY_A = 65;
  var KEY_RETURN = 13;
  var KEY_ESC = 27;
  var KEY_LEFT = 37;
  var KEY_UP = 38;
  var KEY_P = 80;
  var KEY_RIGHT = 39;
  var KEY_DOWN = 40;
  var KEY_N = 78;
  var KEY_BACKSPACE = 8;
  var KEY_DELETE = 46;
  var KEY_SHIFT = 16;
  var KEY_CMD = 91;
  var KEY_CTRL = 17;
  var KEY_TAB = 9;
  var TAG_SELECT = 1;
  var TAG_INPUT = 2;
  var SUPPORTS_VALIDITY_API = "validity" in document.createElement("input");
  var hash_key = function(value) {
    if (typeof value === "undefined" || value === null) return null;
    if (typeof value === "boolean") return value ? "1" : "0";
    return value + "";
  };
  var isset = function(object) {
    return typeof object !== "undefined";
  };
  var escape_replace = function(str) {
    return (str + "").replace(/\$/g, "$$$$");
  };
  var once = function(fn) {
    let called = false;
    return function() {
      if (called) return;
      called = true;
      fn.apply(this, arguments);
    };
  };
  var debounce_events = function(self2, types, fn) {
    let type;
    let trigger = self2.emit;
    let event_args = {};
    self2.emit = function() {
      let type2 = arguments[0];
      if (types.indexOf(type2) !== -1) {
        event_args[type2] = arguments;
      } else {
        return trigger.apply(self2, arguments);
      }
    };
    fn.apply(self2, []);
    self2.emit = trigger;
    for (type in event_args) {
      if (event_args.hasOwnProperty(type)) {
        trigger.apply(self2, event_args[type]);
      }
    }
  };
  var domToString = function(d) {
    let tmp = document.createElement("div");
    tmp.appendChild(d.cloneNode(true));
    return tmp.innerHTML;
  };
  var getSelection = function(input) {
    let result = {};
    if ("selectionStart" in input) {
      result.start = input.selectionStart;
      result.length = input.selectionEnd - result.start;
    } else if (document.selection) {
      input.focus();
      let sel = document.selection.createRange();
      let selLen = document.selection.createRange().text.length;
      sel.moveStart("character", -input.value.length);
      result.start = sel.text.length - selLen;
      result.length = selLen;
    }
    return result;
  };
  var transferStyles = function($from, $to, properties) {
    let i, n, styles = {};
    if (properties) {
      for (i = 0, n = properties.length; i < n; i++) {
        styles[properties[i]] = $from.compute(properties[i]);
      }
    } else {
      styles = $from.compute();
    }
    $to.style(styles);
  };
  var measured = null;
  var measureString = function(str, $parent) {
    if (!str) {
      return 0;
    }
    let $test;
    if (!measured) {
      $test = zen("test").style({
        position: "absolute",
        top: -99999,
        left: -99999,
        width: "auto",
        padding: 0,
        whiteSpace: "pre"
      }).text(str).bottom("body");
      transferStyles($parent, $test, [
        "letterSpacing",
        "fontSize",
        "fontFamily",
        "fontWeight",
        "textTransform"
      ]);
      measured = $test;
    } else {
      $test = measured;
      $test.text(str);
    }
    return $test[0].offsetWidth;
  };
  var highlight = function($element, pattern) {
    if (typeof pattern === "string" && !pattern.length) return;
    let regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
    let highlight2 = function(node) {
      let skip = 0;
      if (node.nodeType === 3) {
        let pos = node.data.search(regex);
        if (pos >= 0 && node.data.length > 0) {
          let match = node.data.match(regex);
          let spannode = document.createElement("span");
          spannode.className = "g-highlight";
          let middlebit = node.splitText(pos);
          let endbit = middlebit.splitText(match[0].length);
          let middleclone = middlebit.cloneNode(true);
          spannode.appendChild(middleclone);
          middlebit.parentNode.replaceChild(spannode, middlebit);
          skip = 1;
        }
      } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
        for (let i = 0; i < node.childNodes.length; ++i) {
          i += highlight2(node.childNodes[i]);
        }
      }
      return skip;
    };
    return forEach($element, function(el) {
      highlight2(el);
    });
  };
  var autoGrow = function(input) {
    input = dom4(input);
    let currentWidth = null;
    let update = function(options, e) {
      let value, keyCode, printable, placeholder, width;
      let shift, character, selection;
      e = e || window.event || {};
      options = options || {};
      if (e.metaKey || e.altKey) return;
      if (!options.force && input.selectizeGrow === false) return;
      value = input.value();
      if (e.type && e.type.toLowerCase() === "keydown") {
        keyCode = e.keyCode;
        printable = keyCode >= 97 && keyCode <= 122 || // a-z
        keyCode >= 65 && keyCode <= 90 || // A-Z
        keyCode >= 48 && keyCode <= 57 || // 0-9
        keyCode === 32;
        if (keyCode === KEY_DELETE || keyCode === KEY_BACKSPACE) {
          selection = getSelection(input[0]);
          if (selection.length) {
            value = value.substring(0, selection.start) + value.substring(selection.start + selection.length);
          } else if (keyCode === KEY_BACKSPACE && selection.start) {
            value = value.substring(0, selection.start - 1) + value.substring(selection.start + 1);
          } else if (keyCode === KEY_DELETE && typeof selection.start !== "undefined") {
            value = value.substring(0, selection.start) + value.substring(selection.start + 1);
          }
        } else if (printable) {
          shift = e.shiftKey;
          character = String.fromCharCode(e.keyCode);
          if (shift) character = character.toUpperCase();
          else character = character.toLowerCase();
          value += character;
        }
      }
      placeholder = input.attribute("placeholder");
      if (!value && placeholder) {
        value = placeholder;
      }
      width = measureString(value, input) + 4;
      if (width !== currentWidth) {
        currentWidth = width;
        input[0].style.width = width + "px";
        input.emit("resize");
      }
    };
    input.on("keydown", update);
    input.on("keyup", update);
    input.on("update", update);
    input.on("blur", update);
    update();
  };
  var SelectizeDefinition = {
    options: {
      delimiter: " ",
      splitOn: null,
      // regexp or string for splitting up values from a paste command
      persist: true,
      diacritics: true,
      create: false,
      createOnBlur: true,
      createFilter: null,
      highlight: true,
      openOnFocus: true,
      maxOptions: 1e3,
      maxItems: null,
      hideSelected: null,
      addPrecedence: false,
      selectOnTab: false,
      preload: false,
      allowEmptyOption: false,
      closeAfterSelect: false,
      searchOnKeypress: true,
      scrollDuration: 60,
      loadThrottle: 300,
      loadingClass: "g-loading",
      dataAttr: "data-data",
      optgroupField: "optgroup",
      valueField: "value",
      labelField: "text",
      optgroupLabelField: "label",
      optgroupValueField: "value",
      lockOptgroupOrder: false,
      sortField: "$order",
      searchField: ["text"],
      searchConjunction: "and",
      mode: null,
      wrapperClass: "g-selectize-control",
      inputClass: "g-selectize-input",
      dropdownClass: "g-selectize-dropdown",
      dropdownContentClass: "g-selectize-dropdown-content",
      dropdownParent: null,
      copyClassesToDropdown: true,
      /*
       load            : null, // function(query, callback) { ... }
       score           : null, // function(search) { ... }
       onInitialize    : null, // function() { ... }
       onChange        : null, // function(value) { ... }
       onItemAdd       : null, // function(value, $item) { ... }
       onItemRemove    : null, // function(value) { ... }
       onClear         : null, // function() { ... }
       onOptionAdd     : null, // function(value, data) { ... }
       onOptionRemove  : null, // function(value) { ... }
       onOptionClear   : null, // function() { ... }
       onOptionGroupAdd     : null, // function(id, data) { ... }
       onOptionGroupRemove  : null, // function(id) { ... }
       onOptionGroupClear   : null, // function() { ... }
       onDropdownOpen  : null, // function($dropdown) { ... }
       onDropdownClose : null, // function($dropdown) { ... }
       onType          : null, // function(str) { ... }
       onDelete        : null, // function(values) { ... }
       */
      render: {
        /*
         item: null,
         optgroup: null,
         optgroup_header: null,
         option: null,
         option_create: null
         */
      }
    },
    initialize: function(input, options) {
      input = dom4(input);
      this.setOptions(options);
      let computedStyle = window.getComputedStyle && window.getComputedStyle(input[0], null);
      let dir = computedStyle ? computedStyle.getPropertyValue("direction") : input[0].currentStyle && input[0].currentStyle.direction;
      dir = dir || input.parents("[dir]:first").attr("dir") || "";
      this.rand = "selectize-id-" + (Math.random() + 1).toString(36).substring(5);
      this.input = input;
      this.input.selectizeInstance = this;
      this.input[0].selectizeInstance = this;
      this.input[0].selectize = this;
      this.order = 0;
      this.tabIndex = input.attribute("tabindex") || "";
      this.tagType = input.tag() == "select" ? TAG_SELECT : TAG_INPUT;
      this.rtl = /rtl/i.test(dir);
      this.highlightedValue = null;
      this.isRequired = input.attribute("required");
      forEach(["isOpen", "isDisabled", "isInvalid", "isLocked", "isFocused", "isInputHidden", "isSetup", "isShiftDown", "isCmdDown", "isCtrlDown", "ignoreFocus", "ignoreBlur", "ignoreHover", "hasOptions"], function(option) {
        this[option] = false;
      }, this);
      this.currentResults = null;
      this.lastValue = "";
      this.caretPos = 0;
      this.loading = 0;
      this.loadedSearches = {};
      this.$activeOption = null;
      this.$activeItems = [];
      this.Optgroups = {};
      this.Options = {};
      this.UserOptions = {};
      this.items = [];
      this.renderCache = {};
      this.onSearchChange = this.options.loadThrottle === null ? this.onSearchChange : debounce(this.onSearchChange, this.options.loadThrottle);
      this.searchIndex = new NativeSearchIndex(this.Options, { diacritics: this.options.diacritics });
      let i, n;
      if (this.options.Options) {
        for (i = 0, n = this.options.Options.length; i < n; i++) {
          this.registerOption(this.options.Options[i]);
        }
        delete this.options.Options;
      }
      if (this.options.Optgroups) {
        for (i = 0, n = this.options.Optgroups.length; i < n; i++) {
          this.registerOptionGroup(this.options.Optgroups[i]);
        }
        delete this.options.Optgroups;
      }
      this.options.mode = this.options.mode || (this.options.maxItems === 1 ? "single" : "multi");
      if (!isBoolean(this.options.hideSelected)) {
        this.options.hideSelected = this.options.mode === "multi";
      }
      this.setupCallbacks();
      this.setupTemplates();
      this.setup();
    },
    setup: function() {
      let $input = this.input, $wrapper, $control, $control_input, $dropdown, $dropdown_content, $dropdown_parent, inputMode, timeout_blur, timeout_focus, classes;
      inputMode = this.options.mode;
      classes = $input.attribute("class") || "";
      $wrapper = zen("div").addClass(this.options.wrapperClass).addClass(classes).addClass("g-" + inputMode).after(this.input);
      $control = zen("div").addClass(this.options.inputClass).addClass("g-items").bottom($wrapper);
      $control_input = zen('input[type="text"][autocomplete="off"][role="textbox"]').bottom($control).attribute("tabindex", $input.disabled() ? "-1" : this.tabIndex);
      $dropdown_parent = dom4(this.options.dropdownParent || $wrapper);
      $dropdown = zen("div").addClass(this.options.dropdownClass).addClass("g-" + inputMode).hide().bottom($dropdown_parent);
      $dropdown_content = zen('div[id="' + this.rand + '"]').addClass(this.options.dropdownContentClass).bottom($dropdown);
      if (this.options.copyClassesToDropdown) {
        $dropdown.addClass(classes);
      }
      if (inputMode == "single") {
        $wrapper.style("width", parseInt($input[0].offsetWidth) + 12 + 24);
      }
      if ((this.options.maxItems === null || this.options.maxItems > 1) && this.tagType === TAG_SELECT) {
        $input.attribute("multiple", "multiple");
      }
      if (this.options.placeholder) {
        $control_input.attribute("placeholder", this.options.placeholder);
      }
      if (!this.options.splitOn && this.options.delimiter) {
        let delimiterEscaped = this.options.delimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        this.options.splitOn = new RegExp("\\s*" + delimiterEscaped + "+\\s*");
      }
      if ($input.attribute("autocorrect")) {
        $control_input.attribute("autocorrect", $input.attribute("autocorrect"));
      }
      if ($input.attribute("autocapitalize")) {
        $control_input.attribute("autocapitalize", $input.attribute("autocapitalize"));
      }
      this.$wrapper = $wrapper;
      this.$control = $control;
      this.$control_input = $control_input;
      this.$dropdown = $dropdown;
      this.$dropdown_content = $dropdown_content;
      $dropdown.delegate("mouseover", "[data-selectable]", bind(function() {
        return this.onOptionHover.apply(this, arguments);
      }, this));
      $dropdown.delegate("mousedown", "[data-selectable]", bind(function() {
        return this.onOptionSelect.apply(this, arguments);
      }, this));
      $dropdown.delegate("click", "[data-selectable]", bind(function() {
        return this.onOptionSelect.apply(this, arguments);
      }, this));
      autoGrow($control_input);
      $control.delegate("mousedown", "*:not(input)", bind(function(event, element) {
        if (element == $control) {
          return true;
        }
        return this.onItemSelect.apply(this, arguments);
      }, this));
      $control.on("mousedown", bind(function() {
        return this.onMouseDown.apply(this, arguments);
      }, this));
      $control.on("click", bind(function() {
        return this.onClick.apply(this, arguments);
      }, this));
      $control.delegate("click", ".g-remove-single-item", bind(function() {
        return this.onItemRemoveViaX.apply(this, arguments);
      }, this));
      $control_input.on("mousedown", function(e) {
        e.stopPropagation();
      });
      $control_input.on("keydown", bind(function() {
        return this.onKeyDown.apply(this, arguments);
      }, this));
      $control_input.on("keyup", bind(function() {
        return this.onKeyUp.apply(this, arguments);
      }, this));
      $control_input.on("keypress", bind(function() {
        return this.onKeyPress.apply(this, arguments);
      }, this));
      $control_input.on("resize", bind(function() {
        this.positionDropdown.apply(this, []);
      }, this));
      $control_input.on("blur", bind(function() {
        return this.onBlur.apply(this, arguments);
      }, this));
      $control_input.on("focus", bind(function() {
        this.ignoreBlur = false;
        return this.onFocus.apply(this, arguments);
      }, this));
      $control_input.on("paste", bind(function() {
        return this.onPaste.apply(this, arguments);
      }, this));
      dom4(document).on("keydown", bind(function(e) {
        this.isCmdDown = e.metaKey || e.ctrlKey;
        this.isCtrlDown = e.ctrlKey || e.altKey;
        this.isShiftDown = e.shiftKey;
      }, this));
      dom4(document).on("keyup", bind(function(e) {
        if (e.keyCode === KEY_CTRL) this.isCtrlDown = false;
        if (e.keyCode === KEY_SHIFT) this.isShiftDown = false;
        if (e.keyCode === KEY_CMD) this.isCmdDown = false;
      }, this));
      dom4(document).on("mousedown", bind(function(e) {
        if (this.isFocused) {
          if (e.target === this.$dropdown[0] || e.target.parentNode === this.$dropdown[0]) {
            e.preventDefault();
            return false;
          }
          if (!this.$control.find(dom4(e.target)) && e.target !== this.$control[0]) {
            this.blur(e.target);
          }
        }
      }, this));
      dom4(window).on("scroll", bind(function() {
        if (this.isOpen) {
          this.positionDropdown.apply(this, arguments);
        }
      }, this));
      dom4(window).on("resize", bind(function() {
        if (this.isOpen) {
          this.positionDropdown.apply(this, arguments);
        }
      }, this));
      dom4(window).on("mousemove", bind(function() {
        this.ignoreHover = false;
      }, this));
      this.revertSettings = {
        $children: this.input.children(),
        //.detach(),
        tabindex: this.input.attribute("tabindex")
      };
      this.input.attribute("tabindex", -1).attribute("aria-hidden", true).hide().after($wrapper);
      if (isArray(this.options.items)) {
        this.setValue(this.options.items);
        delete this.options.items;
      }
      if (SUPPORTS_VALIDITY_API) {
        this.input.on("invalid", bind(function(e) {
          e.preventDefault();
          this.isInvalid = true;
          this.refreshState();
        }, this));
      }
      this.updateOriginalInput();
      this.refreshItems();
      this.refreshState();
      this.updatePlaceholder();
      this.isSetup = true;
      if (this.input.disabled()) {
        this.disable();
      }
      this.on("change", this.onChange);
      this.input.selectizeInstance = this;
      this.input[0].selectizeInstance = this;
      this.input[0].selectize = this;
      this.input.addClass("selectized");
      this.emit("initialize");
      if (this.options.preload === true) {
        this.onSearchChange("");
      }
      $wrapper.attribute("role", "combobox").attribute("aria-autocomplete", "list").attribute("aria-haspopup", true).attribute("aria-expanded", false).attribute("aria-labelledby", this.rand + "-" + slugify(this.getValue()));
      $dropdown_content.attribute("role", "tree").attribute("aria-expanded", false).attribute("aria-hidden", true);
    },
    setupTemplates: function() {
      let field_label = this.options.labelField, field_value = this.options.valueField, field_optgroup = this.options.optgroupLabelField, mode = this.options.mode;
      let templates = {
        "optgroup": function(data) {
          return '<div class="g-optgroup">' + data.html + "</div>";
        },
        "optgroup_header": function(data, escape) {
          return '<div class="g-optgroup-header">' + escape(data[field_optgroup]) + "</div>";
        },
        "option": function(data, escape) {
          let label = '<div class="g-option">' + escape(data[field_label]) + "</div>";
          if (this.options.Subtitles) {
            label = '<div class="g-option"><span>' + escape(data[field_label]) + '</span> <div class="g-option-subtitle"><small>' + escape(data[field_value]) + "</small></div></div>";
          }
          return label;
        },
        "item": function(data, escape) {
          let removeButton = "", title = escape(data[field_value]);
          if (mode !== "single") {
            removeButton = '<span  class="g-remove-single-item" tabindex="-1" title="Remove">&times;</span></div>';
          }
          if (this.options.Subtitles) {
            title = "class name: " + title;
          }
          return '<div class="g-item" title="' + title + '">' + escape(data[field_label]) + removeButton;
        },
        "option_create": function(data, escape) {
          return '<div class="g-create">Add <strong>' + escape(data.input) + "</strong>&hellip;</div>";
        }
      };
      this.options.render = merge({}, templates, this.options.render);
    },
    setupCallbacks: function() {
      let key, fn, callbacks = {
        "initialize": "onInitialize",
        "change": "onChange",
        "item_add": "onItemAdd",
        "item_remove": "onItemRemove",
        "clear": "onClear",
        "option_add": "onOptionAdd",
        "option_remove": "onOptionRemove",
        "option_clear": "onOptionClear",
        "optgroup_add": "onOptionGroupAdd",
        "optgroup_remove": "onOptionGroupRemove",
        "optgroup_clear": "onOptionGroupClear",
        "dropdown_open": "onDropdownOpen",
        "dropdown_close": "onDropdownClose",
        "type": "onType",
        "load": "onLoad",
        "focus": "onFocus",
        "blur": "onBlur"
      };
      for (key in callbacks) {
        if (callbacks.hasOwnProperty(key)) {
          fn = this.options[callbacks[key]];
          if (fn) {
            this.on(key, fn);
          }
        }
      }
    },
    onClick: function(e) {
      if (!this.isFocused) {
        this.focus();
        e.preventDefault();
      }
    },
    onMouseDown: function(e) {
      let defaultPrevented = e.defaultPrevented || typeof e.defaultPrevented === "undefined";
      let $target = dom4(e.target);
      if (this.isFocused) {
        if (e.target !== this.$control_input[0]) {
          if (this.options.mode === "single") {
            this.isOpen ? this.close() : this.open();
          } else if (!defaultPrevented) {
            this.setActiveItem(null);
          }
          return false;
        }
      } else {
        if (!defaultPrevented) {
          window.setTimeout(bind(function() {
            this.focus();
          }, this), 0);
        }
      }
    },
    onChange: function() {
      this.input.emit("change", this.input.value(), this);
      dom4("body").emit("change", { target: this.input });
    },
    onPaste: function(e) {
      if (this.isFull() || this.isInputHidden || this.isLocked) {
        e.preventDefault();
      } else {
        if (this.options.splitOn) {
          setTimeout(bind(function() {
            let splitInput = trim(this.$control_input.value() || "").split(this.options.splitOn);
            for (let i = 0, n = splitInput.length; i < n; i++) {
              this.createItem(splitInput[i]);
            }
          }, this), 0);
        }
      }
    },
    onKeyPress: function(e) {
      if (this.isLocked) return e && e.preventDefault();
      let character = String.fromCharCode(e.keyCode || e.which);
      if (this.options.create && this.options.mode === "multi" && character === this.options.delimiter) {
        this.createItem();
        e.preventDefault();
        return false;
      }
    },
    onKeyDown: function(e) {
      let isInput = e.target === this.$control_input[0];
      if (this.isLocked) {
        if (e.keyCode !== KEY_TAB) {
          e.preventDefault();
        }
        return;
      }
      switch (e.keyCode) {
        case KEY_A:
          if (this.isCmdDown) {
            this.selectAll();
            return;
          }
          break;
        case KEY_ESC:
          if (this.isOpen) {
            e.preventDefault();
            e.stopPropagation();
            this.close();
          }
          return;
        case KEY_N:
          if (!e.ctrlKey || e.altKey) break;
        case KEY_DOWN:
          if (!this.isOpen && this.hasOptions) {
            this.open();
          } else if (this.$activeOption) {
            this.ignoreHover = true;
            let $next = this.getAdjacentOption(this.$activeOption, 1);
            if ($next) {
              this.setActiveOption($next, true, true);
            }
          }
          e.preventDefault();
          return;
        case KEY_P:
          if (!e.ctrlKey || e.altKey) break;
        case KEY_UP:
          if (this.$activeOption) {
            this.ignoreHover = true;
            let $prev = this.getAdjacentOption(this.$activeOption, -1);
            if ($prev) {
              this.setActiveOption($prev, true, true);
            }
          }
          e.preventDefault();
          return;
        case KEY_RETURN:
          if (this.isOpen && this.$activeOption) {
            this.onOptionSelect({ currentTarget: this.$activeOption });
            e.preventDefault();
          }
          return;
        case KEY_LEFT:
          this.advanceSelection(-1, e);
          return;
        case KEY_RIGHT:
          this.advanceSelection(1, e);
          return;
        case KEY_TAB:
          if (this.options.selectOnTab && this.isOpen && this.$activeOption) {
            this.onOptionSelect({ currentTarget: this.$activeOption });
            if (!self.isFull()) {
              e.preventDefault();
            }
          }
          if (this.options.create && this.createItem()) {
            e.preventDefault();
          }
          return;
        case KEY_BACKSPACE:
        case KEY_DELETE:
          this.deleteSelection(e);
          return;
      }
      if ((this.isFull() || this.isInputHidden) && !(e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        return;
      }
    },
    onKeyUp: function(e) {
      if (this.isLocked) return e && e.preventDefault();
      let value = this.$control_input.value() || "";
      if (this.lastValue !== value) {
        this.lastValue = value;
        this.onSearchChange(value);
        this.refreshOptions();
        this.emit("type", value);
      }
    },
    onSearchChange: function(value) {
      let fn = this.options.load;
      if (!fn) return;
      if (this.loadedSearches.hasOwnProperty(value)) return;
      this.loadedSearches[value] = true;
      this.load(bind(function(callback) {
        fn.apply(this, [value, callback]);
      }, this));
    },
    onFocus: function(e) {
      let wasFocused = this.isFocused;
      if (this.isDisabled) {
        this.blur();
        e && e.preventDefault();
        return false;
      }
      if (this.ignoreFocus) return;
      this.isFocused = true;
      if (this.options.preload === "focus") this.onSearchChange("");
      if (!wasFocused) this.emit("focus");
      if (!this.$activeItems.length) {
        this.showInput();
        this.setActiveItem(null);
        this.refreshOptions(!!this.options.openOnFocus);
      }
      this.refreshState();
    },
    onBlur: function(e, dest) {
      if (!this.isFocused) return;
      this.isFocused = false;
      if (this.ignoreFocus) {
        return;
      } else if (!this.ignoreBlur && document.activeElement === this.$dropdown_content[0]) {
        this.ignoreBlur = true;
        this.onFocus(e);
        return;
      }
      let deactivate = bind(function() {
        this.close();
        this.setTextboxValue("");
        this.setActiveItem(null);
        this.setActiveOption(null);
        this.setCaret(this.items.length);
        this.refreshState();
        dest && dest.focus();
        this.ignoreFocus = false;
        this.emit("blur");
      }, this);
      this.ignoreFocus = true;
      if (this.options.create && this.options.createOnBlur) {
        this.createItem(null, false, deactivate);
      } else {
        deactivate();
      }
    },
    onOptionHover: function(e, element) {
      element = dom4(element);
      if (this.ignoreHover) return;
      this.setActiveOption(element || e.currentTarget, false);
    },
    onOptionSelect: function(e, element) {
      let value, $target, $option, self2 = this;
      if (e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      $target = dom4(element || e.currentTarget);
      if ($target.hasClass("g-create")) {
        this.createItem(null, bind(function() {
          if (this.options.closeAfterSelect) {
            this.close();
          }
        }, this));
      } else {
        value = $target.attribute("data-value");
        if (typeof value !== "undefined") {
          this.lastQuery = null;
          this.setTextboxValue("");
          this.addItem(value);
          if (this.options.closeAfterSelect) {
            this.close();
          } else if (!this.options.hideSelected && e.type && /mouse/.test(e.type)) {
            this.setActiveOption(this.getOption(value));
          }
        }
      }
    },
    onItemSelect: function(e, element) {
      if (this.isLocked) return;
      if (this.options.mode === "multi") {
        e.preventDefault();
        this.setActiveItem(element || e.currentTarget, e);
      }
    },
    onItemRemoveViaX: function(e, element) {
      e.preventDefault();
      if (this.isLocked || this.options.mode == "single") return;
      let $item = element.parent();
      this.setActiveItem($item);
      if (this.deleteSelection()) {
        this.setCaret(this.items.length);
      }
    },
    load: function(fn) {
      let $wrapper = this.$wrapper.addClass(this.options.loadingClass);
      this.loading++;
      fn.apply(this, [bind(function(results) {
        this.loading = Math.max(this.loading - 1, 0);
        if (results && results.length) {
          this.addOption(results);
          this.refreshOptions(this.isFocused && !this.isInputHidden);
        }
        if (!this.loading) {
          $wrapper.removeClass(this.options.loadingClass);
        }
        this.emit("load", results);
      }, this)]);
    },
    setTextboxValue: function(value) {
      let $input = this.$control_input;
      let changed = $input.value() !== value;
      if (changed) {
        $input.value(value).emit("update");
        this.lastValue = value;
      }
    },
    getValue: function(value) {
      if (this.tagType === TAG_SELECT && this.input.attribute("multiple")) {
        return value || this.items;
      } else {
        return (value || this.items).join(this.options.delimiter);
      }
    },
    setValue: function(value, silent) {
      let events = silent ? [] : ["change"];
      debounce_events(this, events, function() {
        this.clear(silent);
        this.previousValue = this.getValue() || value;
        this.addItems(value, silent);
      });
    },
    setActiveItem: function(item, e) {
      let eventName, idx, begin, end, $item, swap, $last;
      if (this.options.mode === "single") {
        return;
      }
      item = dom4(item);
      if (!item) {
        if (this.$activeItems.length) {
          dom4(this.$activeItems).removeClass("g-active");
        }
        this.$activeItems = [];
        if (this.isFocused) {
          this.showInput();
        }
        return;
      }
      eventName = e && e.type.toLowerCase();
      if (eventName === "mousedown" && this.isShiftDown && this.$activeItems.length) {
        $last = dom4(last(this.$control.children(".g-active")));
        begin = Array.prototype.indexOf.apply(this.$control[0].childNodes, [$last[0]]);
        end = Array.prototype.indexOf.apply(this.$control[0].childNodes, [item[0]]);
        if (begin > end) {
          swap = begin;
          begin = end;
          end = swap;
        }
        for (let i = begin; i <= end; i++) {
          $item = this.$control[0].childNodes[i];
          if (this.$activeItems.indexOf($item) === -1) {
            dom4($item).addClass("g-active");
            this.$wrapper.attribute("aria-activedescendant", slugify(this.rand + "-" + dom4($item).attribute("data-value")));
            this.$activeItems.push($item);
          }
        }
        e.preventDefault();
      } else if (eventName === "mousedown" && this.isCtrlDown || eventName === "keydown" && this.isShiftDown) {
        if (item.hasClass("g-active")) {
          idx = this.$activeItems.indexOf(item[0]);
          this.$activeItems.splice(idx, 1);
          item.removeClass("g-active");
        } else {
          this.$activeItems.push(item.addClass("g-active")[0]);
          this.$wrapper.attribute("aria-activedescendant", slugify(this.rand + "-" + item.attribute("data-value")));
        }
      } else {
        if (dom4(this.$activeItems)) dom4(this.$activeItems).removeClass("g-active");
        this.$activeItems = [item.addClass("g-active")[0]];
        this.$wrapper.attribute("aria-activedescendant", slugify(this.rand + "-" + item.attribute("data-value")));
      }
      this.hideInput();
      if (!this.isFocused) {
        this.focus();
      }
    },
    setActiveOption: function($option, scroll, animate) {
      let height_menu, height_item, y;
      let scroll_top, scroll_bottom;
      if (this.$activeOption) this.$activeOption.removeClass("g-active");
      this.$activeOption = null;
      $option = dom4($option);
      if (!$option) return;
      this.$activeOption = $option.addClass("g-active");
      this.$wrapper.attribute("aria-activedescendant", slugify(this.rand + "-" + $option.attribute("data-value")));
      if (scroll || !isset(scroll)) {
        height_menu = this.$dropdown_content[0].offsetHeight;
        height_item = this.$activeOption[0].offsetHeight;
        scroll = this.$dropdown_content[0].scrollTop || 0;
        y = this.$activeOption.position().top - this.$dropdown_content.position().top + scroll;
        scroll_top = y;
        scroll_bottom = y - height_menu + height_item;
        if (y + height_item > height_menu + scroll) {
          this.$dropdown_content[0].scrollTop = scroll_bottom;
        } else if (y < scroll) {
          this.$dropdown_content[0].scrollTop = scroll_top;
        }
      }
    },
    selectAll: function() {
      if (this.options.mode === "single") return;
      let items = this.$control.children(":not(input)");
      if (items) {
        items.addClass("g-active");
        this.$wrapper.attribute("aria-activedescendant", slugify(this.rand + "-" + items.attribute("data-value")));
      }
      this.$activeItems = Array.prototype.slice.apply(items || []);
      if (this.$activeItems.length) {
        this.hideInput();
        this.close();
      }
      this.focus();
    },
    hideInput: function() {
      this.setTextboxValue("");
      this.$control_input.style({
        opacity: 0,
        position: "absolute",
        left: this.rtl ? 1e4 : -1e4
      });
      this.isInputHidden = true;
    },
    showInput: function() {
      this.$control_input.style({
        opacity: 1,
        position: "relative",
        left: 0
      });
      this.isInputHidden = false;
    },
    focus: function() {
      if (this.isDisabled) {
        return;
      }
      this.ignoreFocus = true;
      this.$control_input[0].focus();
      setTimeout(bind(function() {
        this.ignoreFocus = false;
        this.onFocus();
      }, this), 0);
    },
    blur: function(dest) {
      this.$control_input[0].blur();
      this.onBlur(null, dest);
    },
    getScoreFunction: function(query) {
      return this.searchIndex.getScoreFunction(query, this.getSearchOptions());
    },
    getSearchOptions: function() {
      let sort = this.options.sortField;
      if (typeof sort === "string") {
        sort = [{ field: sort }];
      }
      return {
        fields: this.options.searchField,
        conjunction: this.options.searchConjunction,
        sort
      };
    },
    search: function(query) {
      let i, value, score, result, calculateScore;
      let options = this.getSearchOptions();
      if (this.options.score) {
        calculateScore = this.options.score.apply(this, [query]);
        if (typeof calculateScore !== "function") {
          throw new Error('Selectize "score" setting must be a function that returns a function');
        }
      }
      if (query !== this.lastQuery) {
        this.lastQuery = query;
        result = this.searchIndex.search(query, merge(options, { score: calculateScore }));
        this.currentResults = result;
      } else {
        result = merge({}, this.currentResults);
      }
      if (this.options.hideSelected) {
        for (i = result.items.length - 1; i >= 0; i--) {
          if (this.items.indexOf(hash_key(result.items[i].id)) !== -1) {
            result.items.splice(i, 1);
          }
        }
      }
      return result;
    },
    refreshOptions: function(triggerDropdown) {
      let i, j, k, n, groups, groups_order, option, option_html, optgroup, optgroups, html, html_children, has_create_option;
      let $active, $active_before, $create;
      if (typeof triggerDropdown === "undefined") {
        triggerDropdown = true;
      }
      let query = trim(this.$control_input.value());
      let results = this.search(query);
      let $dropdown_content = this.$dropdown_content;
      let active_before = this.$activeOption && hash_key(this.$activeOption.attribute("data-value"));
      n = results.items.length;
      if (typeof this.options.maxOptions === "number") {
        n = Math.min(n, this.options.maxOptions);
      }
      groups = {};
      groups_order = [];
      for (i = 0; i < n; i++) {
        option = this.Options[results.items[i].id];
        option_html = this.render("option", option);
        optgroup = option[this.options.optgroupField] || "";
        optgroups = isArray(optgroup) ? optgroup : [optgroup];
        for (j = 0, k = optgroups && optgroups.length; j < k; j++) {
          optgroup = optgroups[j];
          if (!this.Optgroups.hasOwnProperty(optgroup)) {
            optgroup = "";
          }
          if (!groups.hasOwnProperty(optgroup)) {
            groups[optgroup] = document.createDocumentFragment();
            groups_order.push(optgroup);
          }
          groups[optgroup].appendChild(option_html);
        }
      }
      if (this.options.lockOptgroupOrder) {
        groups_order.sort(function(a, b) {
          let a_order = this.Optgroups[a].$order || 0;
          let b_order = this.Optgroups[b].$order || 0;
          return a_order - b_order;
        });
      }
      html = document.createDocumentFragment();
      for (i = 0, n = groups_order.length; i < n; i++) {
        optgroup = groups_order[i];
        if (this.Optgroups.hasOwnProperty(optgroup) && groups[optgroup].childNodes.length) {
          html_children = document.createDocumentFragment();
          html_children.appendChild(this.render("optgroup_header", this.Optgroups[optgroup]));
          html_children.appendChild(groups[optgroup]);
          html.appendChild(this.render("optgroup", merge({}, this.Optgroups[optgroup], {
            html: domToString(html_children),
            dom: html_children
          })));
        } else {
          html.appendChild(groups[optgroup]);
        }
      }
      $dropdown_content.html(domToString(html));
      if (this.options.highlight && results.query.length && results.tokens.length) {
        for (i = 0, n = results.tokens.length; i < n; i++) {
          highlight($dropdown_content, results.tokens[i].regex);
        }
      }
      if (!this.options.hideSelected) {
        for (i = 0, n = this.items.length; i < n; i++) {
          this.getOption(this.items[i]).addClass("g-selected").attribute("aria-selected", true);
        }
      }
      has_create_option = this.canCreate(query);
      if (has_create_option) {
        dom4(this.render("option_create", { input: query })).top($dropdown_content);
        $create = dom4($dropdown_content[0].childNodes[0]);
      }
      this.hasOptions = results.items.length > 0 || has_create_option;
      if (this.hasOptions) {
        if (results.items.length > 0) {
          $active_before = active_before && this.getOption(active_before);
          if ($active_before && $active_before.length) {
            $active = $active_before;
          } else if (this.options.mode === "single" && this.items.length) {
            $active = this.getOption(this.items[0]);
          }
          if (!$active || !$active.length) {
            if ($create && !this.options.addPrecedence) {
              $active = this.getAdjacentOption($create, 1);
            } else {
              $active = $dropdown_content.find("[data-selectable]:first-child");
            }
          }
        } else {
          $active = $create;
        }
        this.setActiveOption($active);
        if (triggerDropdown && !this.isOpen) {
          this.open();
        }
      } else {
        this.setActiveOption(null);
        if (triggerDropdown && this.isOpen) {
          this.close();
        }
      }
    },
    addOption: function(data) {
      let value;
      if (isArray(data)) {
        for (let i = 0, n = data.length; i < n; i++) {
          this.addOption(data[i]);
        }
        return;
      }
      if (value = this.registerOption(data)) {
        this.UserOptions[value] = true;
        this.lastQuery = null;
        this.emit("option_add", value, data);
      }
    },
    registerOption: function(data) {
      let key = hash_key(data[this.options.valueField]);
      if (!key && !this.options.allowEmptyOption || this.options.hasOwnProperty(key)) return false;
      data.$order = data.$order || ++this.order;
      this.Options[key] = data;
      return key;
    },
    registerOptionGroup: function(data) {
      let key = hash_key(data[this.options.optgroupValueField]);
      if (!key) return false;
      data.$order = data.$order || ++this.order;
      this.Optgroups[key] = data;
      return key;
    },
    addOptionGroup: function(id2, data) {
      data[this.options.optgroupValueField] = id2;
      if (id2 = this.registerOptionGroup(data)) {
        this.emit("optgroup_add", id2, data);
      }
    },
    removeOptionGroup: function(id2) {
      if (this.Optgroups.hasOwnProperty(id2)) {
        delete this.Optgroups[id2];
        this.renderCache = {};
        this.emit("optgroup_remove", id2);
      }
    },
    clearOptionGroups: function() {
      this.Optgroups = {};
      this.renderCache = {};
      this.emit("optgroup_clear");
    },
    updateOption: function(value, data) {
      let self2 = this;
      let $item, $item_new, dummy;
      let value_new, index_item, cache_items, cache_options, order_old;
      value = hash_key(value);
      value_new = hash_key(data[this.options.valueField]);
      if (value === null) return;
      if (!this.Options.hasOwnProperty(value)) return;
      if (typeof value_new !== "string") throw new Error("Value must be set in option data");
      order_old = this.Options[value].$order;
      if (value_new !== value) {
        delete this.Options[value];
        index_item = this.items.indexOf(value);
        if (index_item !== -1) {
          this.items.splice(index_item, 1, value_new);
        }
      }
      data.$order = data.$order || order_old;
      this.Options[value_new] = data;
      cache_items = this.renderCache["item"];
      cache_options = this.renderCache["option"];
      if (cache_items) {
        delete cache_items[value];
        delete cache_items[value_new];
      }
      if (cache_options) {
        delete cache_options[value];
        delete cache_options[value_new];
      }
      if (this.items.indexOf(value_new) !== -1) {
        $item = this.getItem(value);
        $item_new = dom4(this.render("item", data));
        if ($item.hasClass("g-active")) {
          $item_new.addClass("g-active");
          this.$wrapper.attribute("aria-activedescendant", slugify(this.rand + "-" + $item_new.attribute("data-value")));
        }
        $item_new.after($item);
        $item.remove();
      }
      this.lastQuery = null;
      if (this.isOpen) {
        this.refreshOptions(false);
      }
    },
    removeOption: function(value, silent) {
      value = hash_key(value);
      let cache_items = this.renderCache["item"];
      let cache_options = this.renderCache["option"];
      if (cache_items) delete cache_items[value];
      if (cache_options) delete cache_options[value];
      delete this.UserOptions[value];
      delete this.Options[value];
      this.lastQuery = null;
      this.emit("option_remove", value);
      this.removeItem(value, silent);
    },
    clearOptions: function() {
      this.loadedSearches = {};
      this.UserOptions = {};
      this.renderCache = {};
      this.Options = this.searchIndex.items = {};
      this.lastQuery = null;
      this.emit("option_clear");
      this.clear();
    },
    getOption: function(value) {
      return this.getElementWithValue(value, this.$dropdown_content.search("[data-selectable]"));
    },
    getAdjacentOption: function($option, direction) {
      let $options = this.$dropdown.search("[data-selectable]");
      let index = indexOf($options, $option ? $option[0] : null) + direction;
      return index >= 0 && index < ($options ? $options.length : 0) ? dom4($options[index]) : dom4();
    },
    getElementWithValue: function(value, $els) {
      value = hash_key(value);
      if (typeof value !== "undefined" && value !== null) {
        for (let i = 0, n = $els ? $els.length : 0; i < n; i++) {
          if ($els[i].getAttribute("data-value") === value) {
            return dom4($els[i]);
          }
        }
      }
      return dom4();
    },
    getItem: function(value) {
      return this.getElementWithValue(value, this.$control.children());
    },
    addItems: function(values, silent) {
      let items = isArray(values) ? values : [values];
      for (let i = 0, n = items.length; i < n; i++) {
        this.isPending = i < n - 1;
        this.addItem(items[i], silent);
      }
    },
    addItem: function(value, silent) {
      let events = silent ? [] : ["change"];
      debounce_events(this, events, function() {
        let $item, $option, $options;
        let inputMode = this.options.mode;
        let i, active, value_next, wasFull;
        value = hash_key(value);
        if (this.items.indexOf(value) !== -1) {
          if (inputMode === "single") this.close();
          return;
        }
        if (!this.Options.hasOwnProperty(value)) return;
        if (inputMode === "single") this.clear(silent);
        if (inputMode === "multi" && this.isFull()) return;
        $item = dom4(this.render("item", this.Options[value]));
        $item.attribute("id", this.rand + "-" + slugify($item.attribute("data-value")));
        if (inputMode === "multi") $item.attribute("aria-selected", true);
        wasFull = this.isFull();
        this.items.splice(this.caretPos, 0, value);
        this.insertAtCaret($item);
        if (!this.isPending || !wasFull && this.isFull()) {
          this.refreshState();
        }
        if (this.isSetup) {
          $options = this.$dropdown_content.search("[data-selectable]");
          if (!this.isPending) {
            $option = this.getOption(value);
            let adj = this.getAdjacentOption($option, 1);
            value_next = adj ? adj.attribute("data-value") : null;
            this.refreshOptions(this.isFocused && inputMode !== "single");
            if (value_next) {
              this.setActiveOption(this.getOption(value_next));
            }
          }
          if (!$options || this.isFull()) {
            this.close();
          } else {
            this.positionDropdown();
          }
          this.updatePlaceholder();
          this.emit("item_add", value, $item);
          this.updateOriginalInput({ silent });
        }
      });
    },
    removeItem: function(value, silent) {
      let $item, i, idx;
      $item = value && value[0] && typeof value.attribute === "function" ? value : this.getItem(value);
      value = hash_key($item.attribute("data-value"));
      i = this.items.indexOf(value);
      if (i !== -1) {
        $item.remove();
        if ($item.hasClass("g-active")) {
          idx = this.$activeItems.indexOf($item[0]);
          this.$activeItems.splice(idx, 1);
        }
        this.items.splice(i, 1);
        this.lastQuery = null;
        if (!this.options.persist && this.UserOptions.hasOwnProperty(value)) {
          this.removeOption(value, silent);
        }
        if (i < this.caretPos) {
          this.setCaret(this.caretPos - 1);
        }
        this.refreshState();
        this.updatePlaceholder();
        this.updateOriginalInput({ silent });
        this.positionDropdown();
        this.emit("item_remove", value, $item);
      }
    },
    createItem: function(input, triggerDropdown) {
      let caret = this.caretPos;
      input = input || trim(this.$control_input.value() || "");
      let callback = arguments[arguments.length - 1];
      if (typeof callback !== "function") callback = function() {
      };
      if (!isBoolean(triggerDropdown)) {
        triggerDropdown = true;
      }
      if (!this.canCreate(input)) {
        callback();
        return false;
      }
      this.lock();
      let setup = typeof this.options.create === "function" ? this.options.create : bind(function(input2) {
        let data = {};
        data[this.options.labelField] = input2;
        data[this.options.valueField] = input2;
        return data;
      }, this);
      let create = once(bind(function(data) {
        this.unlock();
        if (!data || typeof data !== "object") return callback();
        let value = hash_key(data[this.options.valueField]);
        if (typeof value !== "string") return callback();
        this.setTextboxValue("");
        this.addOption(data);
        this.setCaret(caret);
        this.addItem(value);
        this.refreshOptions(triggerDropdown && this.options.mode !== "single");
        callback(data);
      }, this));
      let output = setup.apply(this, [input, create]);
      if (typeof output !== "undefined") {
        create(output);
      }
      return true;
    },
    refreshItems: function() {
      this.lastQuery = null;
      if (this.isSetup) {
        this.addItem(this.items);
      }
      this.refreshState();
      this.updateOriginalInput();
    },
    refreshState: function() {
      let invalid;
      if (this.isRequired) {
        if (this.items.length) this.isInvalid = false;
        this.$control_input.attribute("required", this.isInvalid || null);
      }
      this.refreshClasses();
    },
    refreshClasses: function() {
      let isFull = this.isFull(), isLocked = this.isLocked;
      this.$wrapper.toggleClass("g-rtl", this.rtl);
      this.$control.toggleClass("g-focus", this.isFocused);
      this.$control.toggleClass("g-disabled", this.isDisabled);
      this.$control.toggleClass("g-required", this.isRequired);
      this.$control.toggleClass("g-invalid", this.isInvalid);
      this.$control.toggleClass("g-locked", isLocked);
      this.$control.toggleClass("g-full", isFull);
      this.$control.toggleClass("g-not-full", !isFull);
      this.$control.toggleClass("g-input-active", this.isFocused && !this.isInputHidden);
      this.$control.toggleClass("g-dropdown-active", this.isOpen);
      this.$control.toggleClass("g-has-options", !size(this.options.Options));
      this.$control.toggleClass("g-has-items", this.items.length > 0);
      if (this.isOpen) {
        this.$wrapper.attribute("aria-owns", this.rand).attribute("aria-activedescendant", slugify(this.rand + "-" + this.getValue())).attribute("aria-expanded", true);
        this.$dropdown_content.attribute("aria-expanded", true).attribute("aria-hidden", false);
      } else {
        this.$wrapper.attribute("aria-owns", null).attribute("aria-activedescendant", null).attribute("aria-expanded", false);
        this.$dropdown_content.attribute("aria-expanded", false).attribute("aria-hidden", true);
      }
      this.$control_input.selectizeGrow = !isFull && !isLocked;
    },
    isFull: function() {
      return this.options.maxItems !== null && this.items.length >= this.options.maxItems;
    },
    updateOriginalInput: function(opts) {
      let options, label;
      opts = opts || {};
      if (this.tagType === TAG_SELECT) {
        options = [];
        for (let i = 0, n = this.items.length; i < n; i++) {
          label = this.Options[this.items[i]][this.options.labelField] || "";
          options.push('<option value="' + escapeHTML(this.items[i]) + '" selected="selected">' + escapeHTML(label) + "</option>");
        }
        if (!options.length && !this.input.attribute("multiple")) {
          options.push('<option value="" selected="selected"></option>');
        }
        this.input.html(options.join(""));
      } else {
        this.input.value(this.getValue());
        this.input.attribute("value", this.input.value());
      }
      if (this.isSetup && !opts.silent) {
        this.emit("change", this.input.value());
      }
    },
    updatePlaceholder: function() {
      if (!this.options.placeholder) return;
      let control_input = this.$control_input;
      if (this.items.length) {
        control_input.attribute("placeholder", null);
      } else {
        control_input.attribute("placeholder", this.options.placeholder);
      }
      control_input.emit("update", { force: true });
    },
    open: function() {
      if (this.isLocked || this.isOpen || this.options.mode === "multi" && this.isFull()) return;
      this.focus();
      this.isOpen = true;
      this.refreshState();
      this.$dropdown.style({
        visibility: "hidden",
        display: "block"
      });
      this.positionDropdown();
      this.$dropdown.style({ visibility: "visible" });
      this.emit("dropdown_open", this.$dropdown);
    },
    close: function() {
      let trigger = this.isOpen;
      if (this.options.mode === "single" && this.items.length) {
        this.hideInput();
      }
      this.isOpen = false;
      this.$dropdown.hide();
      this.setActiveOption(null);
      this.refreshState();
      if (trigger) this.emit("dropdown_close", this.$dropdown);
    },
    positionDropdown: function() {
      let control = this.$control, offset = control.position();
      offset.top += control[0].offsetHeight;
      this.$dropdown.style({
        width: control[0].offsetWidth,
        top: control[0].offsetTop + control[0].offsetHeight,
        left: control[0].offsetLeft
      });
    },
    clear: function(silent) {
      if (!this.items.length) return;
      let non_input = this.$control.children(":not(input)");
      if (non_input) non_input.remove();
      this.items = [];
      this.lastQuery = null;
      this.setCaret(0);
      this.setActiveItem(null);
      this.updatePlaceholder();
      this.updateOriginalInput({ silent });
      this.refreshState();
      this.showInput();
      this.emit("clear");
    },
    insertAtCaret: function($el) {
      let caret = Math.min(this.caretPos, this.items.length);
      if (caret === 0) {
        $el.top(this.$control);
      } else {
        $el.after(this.$control.find(":nth-child(" + caret + ")"));
      }
      this.setCaret(caret + 1);
    },
    deleteSelection: function(e) {
      let i, n, direction, selection, values, caret, option_select, $option_select, $tail;
      direction = e && e.keyCode === KEY_BACKSPACE ? -1 : 1;
      selection = getSelection(this.$control_input[0]);
      if (this.$activeOption && !this.options.hideSelected) {
        option_select = this.getAdjacentOption(this.$activeOption, -1);
        if (option_select) {
          option_select = option_select.attribute("data-value");
        }
      }
      values = [];
      if (this.$activeItems.length) {
        let children = this.$control.children(":not(input)");
        $tail = this.$control.children(".g-active");
        if ($tail) {
          $tail = dom4(direction > 0 ? last($tail) : $tail[0]);
        }
        caret = !children ? -1 : indexOf(children, $tail[0]);
        if (direction > 0) {
          caret++;
        }
        for (i = 0, n = this.$activeItems.length; i < n; i++) {
          values.push(dom4(this.$activeItems[i]).attribute("data-value"));
        }
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
      } else if ((this.isFocused || this.options.mode === "single") && this.items.length) {
        if (direction < 0 && selection.start === 0 && selection.length === 0) {
          values.push(this.items[this.caretPos - 1]);
        } else if (direction > 0 && selection.start === this.$control_input.value().length) {
          values.push(this.items[this.caretPos]);
        }
      }
      if (!values.length || typeof this.options.onDelete === "function" && this.options.onDelete.apply(this, [values]) === false) {
        return false;
      }
      if (typeof caret !== "undefined") {
        this.setCaret(caret);
      }
      while (values.length) {
        this.removeItem(values.pop());
      }
      this.showInput();
      this.positionDropdown();
      this.refreshOptions(true);
      if (option_select) {
        $option_select = this.getOption(option_select);
        if ($option_select.length) {
          this.setActiveOption($option_select);
        }
      }
      return true;
    },
    advanceSelection: function(direction, e) {
      let tail, selection, idx, valueLength, cursorAtEdge, $tail;
      if (direction === 0) return;
      if (this.rtl) direction *= -1;
      tail = direction > 0 ? "last-child" : "first-child";
      selection = getSelection(this.$control_input[0]);
      if (this.isFocused && !this.isInputHidden) {
        valueLength = this.$control_input.value().length;
        cursorAtEdge = direction < 0 ? selection.start === 0 && selection.length === 0 : selection.start === valueLength;
        if (cursorAtEdge && !valueLength) {
          this.advanceCaret(direction, e);
        }
      } else {
        $tail = this.$control.children(".g-active:" + tail);
        if ($tail) {
          idx = indexOf(this.$control.children(":not(input)"), $tail);
          this.setActiveItem(null);
          this.setCaret(direction > 0 ? idx + 1 : idx);
        }
      }
    },
    advanceCaret: function(direction, e) {
      let fn, $adj;
      if (direction === 0) return;
      fn = direction > 0 ? "nextSibling" : "previousSibling";
      if (this.isShiftDown) {
        $adj = this.$control_input[fn]();
        if ($adj) {
          this.hideInput();
          this.setActiveItem($adj);
          e && e.preventDefault();
        }
      } else {
        this.setCaret(this.caretPos + direction);
      }
    },
    setCaret: function(i) {
      if (this.options.mode === "single") {
        i = this.items.length;
      } else {
        i = Math.max(0, Math.min(this.items.length, i));
      }
      if (!this.isPending) {
        let j, n, fn, $children, $child;
        $children = this.$control.children(":not(input)");
        for (j = 0, n = $children ? $children.length : 0; j < n; j++) {
          $child = dom4($children[j]);
          if (j < i) {
            $child.before(this.$control_input);
          } else {
            this.$control.appendChild($child);
          }
        }
      }
      this.caretPos = i;
    },
    lock: function() {
      this.close();
      this.isLocked = true;
      this.refreshState();
    },
    unlock: function() {
      this.isLocked = false;
      this.refreshState();
    },
    disable: function() {
      this.input.disabled(true);
      this.$control_input.attribute("disabled", true).attribute("tabindex", -1);
      this.isDisabled = true;
      this.lock();
    },
    enable: function() {
      this.input.attribute("disabled", null);
      this.$control_input.attribute("disabled", null).attribute("tabindex", this.tabIndex);
      this.isDisabled = false;
      this.unlock();
    },
    destroy: function() {
      let revertSettings = this.revertSettings;
      this.emit("destroy");
      this.off();
      this.$wrapper.remove();
      this.$dropdown.remove();
      this.input.html("").appendChild(revertSettings.$children).attribute("tabindex", null).removeClass("selectized").attribute({ tabindex: revertSettings.tabindex }).show();
      delete this.$control_input.selectizeGrow;
      delete this.input.selectizeInstance;
      delete this.input[0].selectizeInstance;
      delete this.input[0].selectize;
    },
    render: function(templateName, data) {
      let value, id2, label;
      let name = "";
      let cache2 = false;
      let regex_tag = /^[\t \r\n]*<([a-z][a-z0-9\-_]*(?:\:[a-z][a-z0-9\-_]*)?)/i;
      if (templateName === "option" || templateName === "item") {
        value = hash_key(data[this.options.valueField]);
        cache2 = !!value;
      }
      if (cache2) {
        if (!isset(this.renderCache[templateName])) {
          this.renderCache[templateName] = {};
        }
        if (this.renderCache[templateName].hasOwnProperty(value)) {
          return this.renderCache[templateName][value];
        }
      }
      let html = zen("div").html(this.options.render[templateName].apply(this, [data, escapeHTML]));
      html = html.firstChild();
      if (templateName === "option" || templateName === "option_create") {
        html = html.data("selectable", "");
      }
      if (templateName === "optgroup") {
        id2 = data[this.options.optgroupValueField] || "";
        name = escape_replace(escapeHTML(id2));
        html = html.data("group", name).attribute("role", "group").attribute("aria-label", name);
      }
      if (templateName === "option" || templateName === "item") {
        name = escape_replace(escapeHTML(value || ""));
        html = html.data("value", name).attribute("id", slugify(this.rand + "-" + name)).attribute("role", "treeitem").attribute("aria-label", trim(data.text)).attribute("aria-selected", "false");
      }
      if (cache2) {
        this.renderCache[templateName][value] = html[0];
      }
      return html[0];
    },
    clearCache: function(templateName) {
      if (typeof templateName === "undefined") {
        this.renderCache = {};
      } else {
        delete this.renderCache[templateName];
      }
    },
    canCreate: function(input) {
      if (!this.options.create) return false;
      let filter = this.options.createFilter;
      return input.length && (typeof filter !== "function" || filter.apply(self, [input])) && (typeof filter !== "string" || new RegExp(filter).test(input)) && (!(filter instanceof RegExp) || filter.test(input));
    },
    getPreviousValue: function() {
      return this.previousValue;
    }
  };
  var Selectize = class extends EventEmitter2 {
    constructor(input, options) {
      super();
      this.setOptions(options);
      SelectizeDefinition.initialize.call(this, input, options);
    }
    setOptions(options) {
      this.options = merge({}, SelectizeDefinition.options, options || {});
      return this;
    }
  };
  Object.keys(SelectizeDefinition).forEach(function(method) {
    if (method !== "options" && method !== "initialize") {
      Selectize.prototype[method] = SelectizeDefinition[method];
    }
  });
  Selectize.prototype.options = SelectizeDefinition.options;
  dom4.implement({
    selectize: function(settings_user) {
      settings_user = settings_user || {};
      let defaults6 = Selectize.prototype.options, settings = merge({}, defaults6, settings_user), attr_data = settings.dataAttr, field_label = settings.labelField, field_value = settings.valueField, field_optgroup = settings.optgroupField, field_optgroup_label = settings.optgroupLabelField, field_optgroup_value = settings.optgroupValueField;
      let init_textbox = function(input, settings_element) {
        input = dom4(input);
        let i, n, values, option;
        let data_raw = input.attribute(attr_data);
        if (!data_raw) {
          let value = trim(input.value() || "");
          if (!settings.allowEmptyOption && !value.length) return;
          values = value.split(settings.delimiter);
          for (i = 0, n = values.length; i < n; i++) {
            option = {};
            option[field_label] = values[i];
            option[field_value] = values[i];
            settings_element.Options.push(option);
          }
          settings_element.items = values;
        } else {
          settings_element.Options = JSON.parse(data_raw);
          for (i = 0, n = settings_element.Options.length; i < n; i++) {
            settings_element.items.push(settings_element.Options[i][field_value]);
          }
        }
      };
      let init_select = function(input, settings_element) {
        let i, n, tagName, children, order = 0;
        let options = settings_element.Options;
        let optionsMap = {};
        let readData2 = function(el) {
          let data = attr_data && el.attribute(attr_data);
          if (typeof data === "string" && data.length) {
            return JSON.parse(data);
          }
          return null;
        };
        let addOption = function(option, group) {
          let value, opt;
          option = dom4(option);
          value = hash_key(option.value());
          if (!value.length && !settings.allowEmptyOption) return;
          if (optionsMap.hasOwnProperty(value)) {
            if (group) {
              let arr = optionsMap[value][field_optgroup];
              if (!arr) {
                optionsMap[value][field_optgroup] = group;
              } else if (!isArray(arr)) {
                optionsMap[value][field_optgroup] = [arr, group];
              } else {
                arr.push(group);
              }
            }
            return;
          }
          opt = readData2(option) || {};
          opt[field_label] = opt[field_label] || option.text();
          opt[field_value] = opt[field_value] || value;
          opt[field_optgroup] = opt[field_optgroup] || group;
          optionsMap[value] = opt;
          options.push(opt);
          if (option[0].selected) {
            settings_element.items.push(value);
          }
        };
        let addGroup = function(optgroup) {
          let i2, n2, id2, optgrp, options2;
          optgroup = dom4(optgroup);
          id2 = optgroup.attribute("label");
          if (id2) {
            optgrp = readData2(optgroup) || {};
            optgrp[field_optgroup_label] = id2;
            optgrp[field_optgroup_value] = id2;
            settings_element.Optgroups.push(optgrp);
          }
          options2 = optgroup.search("option") || [];
          for (i2 = 0, n2 = options2.length; i2 < n2; i2++) {
            addOption(options2[i2], id2);
          }
        };
        settings_element.maxItems = input.attribute("multiple") ? null : 1;
        children = input.children() || 0;
        for (i = 0, n = children.length; i < n; i++) {
          tagName = children[i].tagName.toLowerCase();
          if (tagName === "optgroup") {
            addGroup(children[i]);
          } else if (tagName === "option") {
            addOption(children[i]);
          }
        }
      };
      return this.forEach(function($input, i) {
        settings = merge({}, defaults6, settings_user), $input = dom4($input);
        if ($input[0].selectizeInstance || $input[0].selectize) return;
        let instance2, dataOptions = $input.data("selectize"), tag_name = $input.tag().toLowerCase(), placeholder = $input.attribute("placeholder") || $input.attribute("data-placeholder");
        if (dataOptions) {
          dataOptions = JSON.parse(dataOptions);
        }
        settings = merge({}, settings, dataOptions);
        if (!placeholder && !settings.allowEmptyOption) {
          let chlds = $input.children('option[value=""]');
          placeholder = chlds ? $input.children('option[value=""]').text() : "";
        }
        let settings_element = {
          "placeholder": placeholder,
          "Options": [],
          "Optgroups": [],
          "items": []
        };
        if (tag_name === "select") {
          init_select($input, settings_element);
        } else {
          init_textbox($input, settings_element);
        }
        instance2 = new Selectize($input, merge({}, defaults6, settings_element, settings_user, dataOptions));
        $input.selectizeInstance = instance2;
      });
    }
  });
  Selectize.initialize = function(elements, settings) {
    let collection = dom4(elements);
    if (collection) {
      collection.selectize(settings);
    }
    return collection;
  };
  Selectize.getInstance = function(element) {
    element = element && element.nodeType ? element : element && element[0];
    if (element && (element.selectizeInstance || element.selectize)) {
      return element.selectizeInstance || element.selectize;
    }
    let collection = dom4(element);
    return collection ? collection.selectizeInstance : null;
  };
  ready2(function() {
    let selects = dom4("[data-selectize]");
    if (!selects) {
      return;
    }
    Selectize.initialize(selects);
  });
  var selectize_default = Selectize;

  // platforms/common/application/ui/modal.js
  var dom5 = dom_effects_default;
  var zen2 = createElement;
  var domready = dom_default.ready;
  var request2 = request_default;
  var stored = /* @__PURE__ */ new WeakMap();
  var storage = {
    get: function(key) {
      return stored.get(key && key[0] ? key[0] : key);
    },
    set: function(key, value) {
      stored.set(key && key[0] ? key[0] : key, value);
      return this;
    },
    delete: function(key) {
      return stored.delete(key && key[0] ? key[0] : key);
    }
  };
  var animationEndEvents = ["animationend", "webkitAnimationEnd", "mozAnimationEnd", "MSAnimationEnd", "oanimationend"];
  var animationEndSupport = (function() {
    let style = document.documentElement.style, names = ["animation", "WebkitAnimation", "MozAnimation", "MsAnimation", "OAnimation"];
    for (let index = 0; index < names.length; index++) {
      if (style[names[index]] !== void 0) {
        return animationEndEvents[index];
      }
    }
    return false;
  })();
  var defaults2 = {
    baseClassNames: {
      container: "genesis-dialog",
      content: "genesis-content",
      overlay: "genesis-overlay",
      close: "genesis-close",
      closing: "genesis-closing",
      open: "genesis-dialog-open"
    },
    content: "",
    remote: "",
    showCloseButton: true,
    escapeToClose: true,
    overlayClickToClose: true,
    appendNode: "[data-genesis-container]",
    className: "genesis-dialog-theme-default",
    css: {},
    overlayClassName: "",
    overlayCSS: "",
    contentClassName: "",
    contentCSS: "",
    closeClassName: "genesis-dialog-close",
    closeCSS: "",
    afterOpen: null,
    afterClose: null
  };
  var Modal = class {
    constructor(options) {
      this.options = Object.assign({}, defaults2, options || {});
      this.defaults = this.options;
      this.globalID = 1;
      this.animationEndEvent = animationEndSupport;
      this._bound = /* @__PURE__ */ Object.create(null);
      this._events = /* @__PURE__ */ new Map();
      let self2 = this;
      domready(function() {
        dom5(window).on("keydown", function(event) {
          if (event.keyCode === 27) {
            return self2.closeByEscape();
          }
        });
      });
      this.on("dialogOpen", function(options2) {
        dom5("body").addClass(options2.baseClassNames.open);
        dom5("html").addClass(options2.baseClassNames.open);
      }).on("dialogAfterClose", (function(options2) {
        let all = this.getAll();
        if (!all || !all.length) {
          dom5("body").removeClass(options2.baseClassNames.open);
          dom5("html").removeClass(options2.baseClassNames.open);
        }
      }).bind(this));
    }
    bound(method) {
      if (!this._bound[method]) {
        this._bound[method] = this[method].bind(this);
      }
      return this._bound[method];
    }
    on(name, callback) {
      let listeners = this._events.get(name) || [];
      listeners.push(callback);
      this._events.set(name, listeners);
      return this;
    }
    emit(name, value) {
      (this._events.get(name) || []).slice().forEach(function(callback) {
        callback.call(this, value);
      }, this);
      return this;
    }
    storage() {
      return storage;
    }
    element(value) {
      return value && value.nodeType ? value : value && value[0] ? value[0] : null;
    }
    open(options) {
      options = Object.assign({}, this.options, options || {});
      options.id = this.globalID++;
      let elements = {};
      elements.container = zen2("div").addClass(options.baseClassNames.container).addClass(options.className).style(options.css).attribute("tabindex", "0").attribute("role", "dialog").attribute("aria-hidden", "true").attribute("aria-labelledby", "g-modal-labelledby").attribute("aria-describedby", "g-modal-describedby");
      storage.set(elements.container, { dialog: options });
      elements.overlay = zen2("div").addClass(options.baseClassNames.overlay).addClass(options.overlayClassName).style(options.overlayCSS);
      storage.set(elements.overlay, { dialog: options });
      if (options.overlayClickToClose) {
        elements.container.on("click", this._overlayClick.bind(this, elements.container[0]));
        elements.overlay.on("click", this._overlayClick.bind(this, elements.overlay[0]));
      }
      elements.container.appendChild(elements.overlay);
      elements.content = zen2("div").addClass(options.baseClassNames.content).addClass(options.contentClassName).style(options.contentCSS).attribute("aria-live", "assertive").attribute("tabindex", "0").html(options.content);
      storage.set(elements.content, { dialog: options });
      elements.container.appendChild(elements.content);
      if (options.overlayClickToClose) {
        elements.content.on("click", function() {
          return true;
        });
      }
      if (options.remote && options.remote.length > 1) {
        this.showLoading();
        options.method = options.method || "get";
        let agent = request2();
        agent.method(options.method);
        agent.url(options.remote);
        if (options.data) {
          agent.data(options.data);
        }
        agent.send((function(error, response) {
          if (elements.container.hasClass(options.baseClassNames.closing)) {
            this.hideLoading();
            return;
          }
          elements.content.html(response.body.html || response.body);
          if (!response.body.success) {
            if (!response.body.html && !response.body.message) {
              elements.content.style({ width: "90%" });
            }
          }
          this.hideLoading();
          if (options.remoteLoaded && !elements.container.hasClass(options.baseClassNames.closing)) {
            options.remoteLoaded(response, options);
          }
          elements.container.attribute("aria-hidden", "false");
          setTimeout(function() {
            elements.content[0].focus();
          }, 0);
          let selects = dom5("[data-selectize]");
          if (selects) {
            selects.selectize();
          }
        }).bind(this));
      } else {
        elements.container.attribute("aria-hidden", "false");
        setTimeout(function() {
          elements.content[0].focus();
        }, 0);
      }
      if (options.showCloseButton) {
        elements.closeButton = zen2("div").addClass(options.baseClassNames.close).addClass(options.closeClassName).attribute("role", "button").attribute("aria-label", "Close").style(options.closeCSS);
        storage.set(elements.closeButton, { dialog: options });
        elements.content.appendChild(elements.closeButton);
      }
      elements.container.delegate("click", ".genesis-dialog-close", (function(event) {
        event.preventDefault();
        this._closeButtonClick(elements.container);
      }).bind(this));
      let container2 = dom5(options.appendNode);
      if (GENESIS_PLATFORM == "wordpress") {
        container2 = dom5("#widgets-editor") || dom5("#customize-preview") || dom5("#widgets-right") || dom5(options.appendNode);
        if ("#" + container2.id() != options.appendNode) {
          let wpwrap = dom5("#wpwrap") || dom5(".wp-customizer"), sibling, workaround;
          if (wpwrap.id() == "wpwrap") {
            sibling = wpwrap.nextSibling(options.appendNode);
            workaround = sibling ? sibling : zen2("div.g5wp-out-of-scope" + options.appendNode).after(wpwrap);
          } else {
            sibling = wpwrap.find("> " + options.appendNode);
            workaround = sibling ? sibling : zen2("div.g5wp-out-of-scope" + options.appendNode).top(wpwrap);
          }
          container2 = workaround;
        }
      }
      container2.appendChild(elements.container);
      options.elements = elements;
      if (options.afterOpen) {
        options.afterOpen(elements.content, options);
      }
      setTimeout((function() {
        return this.emit("dialogOpen", options);
      }).bind(this), 0);
      return elements.content;
    }
    getAll() {
      let options = this.options;
      return dom5("." + options.baseClassNames.container + ":not(." + options.baseClassNames.closing + ") ." + options.baseClassNames.content);
    }
    getByID(id2) {
      let all = this.getAll();
      if (!all) {
        return [];
      }
      return dom5(all.filter(function(element) {
        element = dom5(element);
        return storage.get(element).dialog.id === id2;
      }));
    }
    getLast() {
      let ids, id2;
      ids = Array.prototype.map.call(this.getAll() || [], function(element) {
        element = dom5(element);
        return storage.get(element).dialog.id;
      });
      if (!ids.length) {
        return false;
      }
      return Math.max.apply(Math, ids);
    }
    close(id2) {
      if (!id2) {
        let all = this.getAll(), element;
        if (!all || !all.length) {
          return false;
        }
        element = dom5(all[all.length - 1]);
        id2 = storage.get(element).dialog.id;
      }
      return this.closeByID(id2);
    }
    closeAll() {
      let ids;
      ids = Array.prototype.map.call(this.getAll() || [], function(element) {
        element = dom5(element);
        return storage.get(element).dialog.id;
      });
      if (!ids.length) {
        return false;
      }
      ids.reverse().forEach(function(id2) {
        return this.closeByID(id2);
      }, this);
      return true;
    }
    closeByID(id2) {
      let content = this.getByID(id2);
      if (!content || !content.length) {
        return false;
      }
      let container2, options;
      container2 = storage.get(content).dialog.elements.container;
      options = Object.assign({}, storage.get(content).dialog);
      let beforeClose = function() {
        if (options.beforeClose) {
          return options.beforeClose(content, options);
        }
      }, close = (function() {
        if (options.remoteLoaded) {
          options.remoteLoaded = function() {
          };
        }
        content.emit("dialogClose", options);
        container2.remove();
        this.emit("dialogAfterClose", options);
        if (options.afterClose) {
          return options.afterClose(content, options);
        }
      }).bind(this);
      if (animationEndSupport) {
        beforeClose();
        container2.off(this.animationEndEvent).on(this.animationEndEvent, function() {
          return close();
        }).addClass(options.baseClassNames.closing);
      } else {
        beforeClose();
        close();
      }
      return true;
    }
    closeByEscape() {
      let id2 = this.getLast();
      if (id2 === false) {
        return false;
      }
      let element = this.getByID(id2);
      if (!storage.get(element).dialog.escapeToClose) {
        return false;
      }
      return this.closeByID(id2);
    }
    enableCloseByOverlay() {
      let id2 = this.getLast();
      if (id2 === false) {
        return false;
      }
      let elements = storage.get(this.getByID(id2)).dialog.elements;
      elements.container.on("click", this._overlayClick.bind(this, elements.container[0]));
      elements.overlay.on("click", this._overlayClick.bind(this, elements.overlay[0]));
      elements.content.on("click", function() {
        return true;
      });
    }
    showLoading() {
      this.hideLoading();
      return dom5("[data-genesis-container]").appendChild(zen2("div.genesis-dialog-loading-spinner." + this.options.className));
    }
    hideLoading() {
      let spinner = dom5(".genesis-dialog-loading-spinner");
      return spinner ? spinner.remove() : false;
    }
    // private
    _overlayClick(element, event) {
      if (event.target !== element) {
        return;
      }
      return this.close(storage.get(dom5(element)).dialog.id);
    }
    _closeButtonClick(element) {
      return this.close(storage.get(dom5(element)).dialog.id);
    }
  };
  var modal = new Modal();
  var modal_default = modal;

  // platforms/common/application/ui/toastr.js
  var merge2 = function(target) {
    target = target || {};
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      Object.keys(source || {}).forEach(function(key) {
        let value = source[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
          target[key] = merge2(
            target[key] && typeof target[key] === "object" ? target[key] : {},
            value
          );
        } else {
          target[key] = value;
        }
      });
    });
    return target;
  };
  var defaults3 = {
    tapToDismiss: true,
    noticeClass: "g-notifications",
    containerID: "g-notifications-container",
    types: {
      base: "",
      error: "fa-minus-circle",
      info: "fa-info-circle",
      success: "fa-check-circle",
      warning: "fa-exclamation-triangle"
    },
    showDuration: 300,
    showEquation: "cubic-bezier(0.02, 0.01, 0.47, 1)",
    hideDuration: 500,
    hideEquation: "cubic-bezier(0.02, 0.01, 0.47, 1)",
    timeOut: 2500,
    extendedTimeout: 2500,
    location: "bottom-right",
    titleClass: "g-notifications-title",
    messageClass: "g-notifications-message",
    closeButton: true,
    target: "[data-genesis-container]",
    targetLocation: "bottom",
    newestOnTop: true,
    preventDuplicates: false,
    progressBar: true
  };
  var createElement2 = function(tag, className, attributes) {
    let node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    Object.keys(attributes || {}).forEach(function(name) {
      node.setAttribute(name, attributes[name]);
    });
    return node;
  };
  var prepend = function(child, parent) {
    parent.insertBefore(child, parent.firstChild);
  };
  var setHTML = function(element, content) {
    element.innerHTML = content == null ? "" : String(content);
    return element;
  };
  var animateOpacity = function(element, opacity, duration, easing, callback) {
    if (element.gNotificationAnimation) {
      element.gNotificationAnimation.cancel();
      element.gNotificationAnimation = null;
    }
    let finish = function() {
      element.style.opacity = opacity;
      element.gNotificationAnimation = null;
      if (typeof callback === "function") {
        callback();
      }
    };
    if (typeof element.animate === "function") {
      let animation = element.animate(
        [{ opacity: getComputedStyle(element).opacity }, { opacity }],
        { duration: Number(duration) || 0, easing: easing || "ease" }
      );
      element.gNotificationAnimation = animation;
      animation.addEventListener("finish", finish, { once: true });
      return animation;
    }
    element.style.transition = "opacity " + (Number(duration) || 0) + "ms " + (easing || "ease");
    element.style.opacity = opacity;
    setTimeout(finish, Number(duration) || 0);
    return null;
  };
  var Toaster = class {
    constructor(options) {
      this.options = merge2({}, defaults3, options || {});
      this.id = 0;
      this.previousNotice = null;
      this.map = /* @__PURE__ */ new Map();
    }
    mergeOptions(options) {
      return merge2(this.options, options || {});
    }
    base(message, title, options) {
      options = this.mergeOptions(options);
      return this.notify(merge2(options, { title: title || "", type: options.type || "base", message }));
    }
    success(message, title, options) {
      options = this.mergeOptions(options);
      return this.notify(merge2(options, { title: title || "Success!", type: "success", message }));
    }
    info(message, title, options) {
      options = this.mergeOptions(options);
      return this.notify(merge2(options, { title: title || "Info", type: "info", message }));
    }
    warning(message, title, options) {
      options = this.mergeOptions(options);
      return this.notify(merge2(options, { title: title || "Warning!", type: "warning", message }));
    }
    error(message, title, options) {
      options = this.mergeOptions(options);
      return this.notify(merge2(options, { title: title || "Error!", type: "error", message }));
    }
    notify(options) {
      options = this.mergeOptions(options);
      if (options.preventDuplicates && this.previousNotice === options.message) {
        return null;
      }
      this.id++;
      this.previousNotice = options.message;
      let container2 = this.getContainer(options, true), element = createElement2("div"), title = createElement2("div"), message = createElement2("div"), icon = createElement2("i", "fa"), progress = createElement2("div", "g-notifications-progress"), close = createElement2("a", "fa fa-close", { href: "#" });
      if (!container2) {
        return null;
      }
      this.map.set(element, {
        container: container2,
        interval: null,
        progressBar: { interval: null, hideETA: null, maxHideTime: null },
        response: { id: this.id, state: "visible", start: /* @__PURE__ */ new Date(), options },
        options
      });
      if (options.title) {
        title.classList.add(options.titleClass);
        element.appendChild(setHTML(title, options.title));
      }
      if (options.message) {
        message.classList.add(options.messageClass);
        element.appendChild(setHTML(message, options.message));
      }
      if (options.closeButton) {
        prepend(close, element);
      }
      if (options.progressBar) {
        prepend(progress, element);
      }
      if (options.type && options.title && options.types[options.type]) {
        element.classList.add("g-notifications-theme-" + options.type);
        icon.classList.add(options.types[options.type]);
        prepend(icon, title);
      }
      element.style.opacity = 0;
      if (options.newestOnTop) {
        prepend(element, container2);
      } else {
        container2.appendChild(element);
      }
      animateOpacity(element, 1, options.showDuration, options.showEquation, options.onShow);
      if (options.timeOut > 0) {
        let map = this.map.get(element);
        map.interval = setTimeout((function() {
          this.hide(element);
        }).bind(this), options.timeOut);
        map.progressBar.maxHideTime = parseFloat(options.timeOut);
        map.progressBar.hideETA = Date.now() + map.progressBar.maxHideTime;
        if (options.progressBar) {
          map.progressBar.interval = setInterval((function() {
            this.updateProgress(element, progress);
          }).bind(this), 10);
        }
      }
      let stick = (function() {
        this.stickAround(element);
      }).bind(this), delay = (function() {
        this.delayedHide(element);
      }).bind(this);
      element.addEventListener("mouseover", stick);
      element.addEventListener("mouseout", delay);
      if (!options.onClick && options.tapToDismiss) {
        element.addEventListener("click", (function() {
          element.removeEventListener("mouseover", stick);
          element.removeEventListener("mouseout", delay);
          this.hide(element);
        }).bind(this));
      } else if (options.onClick) {
        element.addEventListener("click", options.onClick);
      }
      if (options.closeButton) {
        close.addEventListener("click", (function(event) {
          event.stopPropagation();
          event.preventDefault();
          element.removeEventListener("mouseover", stick);
          element.removeEventListener("mouseout", delay);
          this.hide(element, true);
        }).bind(this));
      }
      return element;
    }
    stickAround(element) {
      let map = this.map.get(element);
      if (!map) {
        return;
      }
      clearTimeout(map.interval);
      map.progressBar.hideETA = 0;
      animateOpacity(element, 1, map.options.showDuration, map.options.showEquation, map.options.onShow);
    }
    hide(element, override) {
      if (!element || !this.map.has(element)) {
        return false;
      }
      if (element.querySelector(":focus") && !override) {
        return false;
      }
      let map = this.map.get(element);
      clearTimeout(map.interval);
      clearInterval(map.progressBar.interval);
      return animateOpacity(
        element,
        0,
        map.options.hideDuration,
        map.options.hideEquation,
        (function() {
          this.remove(element);
          if (map.options.onHidden && map.response.state !== "hidden") {
            map.options.onHidden();
          }
          map.response.state = "hidden";
          map.response.endTime = /* @__PURE__ */ new Date();
        }).bind(this)
      );
    }
    delayedHide(element) {
      let map = this.map.get(element);
      if (!map) {
        return;
      }
      if (map.options.timeOut > 0 || map.options.extendedTimeout > 0) {
        map.interval = setTimeout((function() {
          this.hide(element);
        }).bind(this), map.options.extendedTimeout);
        map.progressBar.maxHideTime = parseFloat(map.options.extendedTimeout);
        map.progressBar.hideETA = Date.now() + map.progressBar.maxHideTime;
      }
    }
    updateProgress(element, progress) {
      let map = this.map.get(element);
      if (!map || !map.progressBar.maxHideTime) {
        return;
      }
      let percentage = (map.progressBar.hideETA - Date.now()) / map.progressBar.maxHideTime * 100;
      progress.style.width = Math.max(0, percentage) + "%";
    }
    getContainer(options, create) {
      options = this.mergeOptions(options);
      let container2 = document.getElementById(options.containerID);
      if (container2) {
        return container2;
      }
      return create ? this.createContainer(options) : null;
    }
    createContainer(options) {
      options = this.mergeOptions(options);
      let container2 = createElement2("div", options.location, {
        id: options.containerID,
        "aria-live": "polite",
        role: "alert"
      }), target = document.querySelector(options.target);
      if (!target) {
        return null;
      }
      if (options.targetLocation === "top") {
        prepend(container2, target);
      } else {
        target.appendChild(container2);
      }
      return container2;
    }
    remove(element) {
      if (!element) {
        return;
      }
      let map = this.map.get(element);
      if (!map) {
        return;
      }
      if (!map.container) {
        map.container = this.getContainer(map.options);
      }
      element.remove();
      if (map.container && !map.container.children.length) {
        map.container.remove();
        this.previousNotice = null;
      }
      this.map.delete(element);
    }
  };
  var toastr_default = new Toaster();

  // platforms/common/application/utils/get-ajax-suffix.js
  var get_ajax_suffix_default = () => window.GENESIS_AJAX_SUFFIX || "";

  // platforms/common/application/utils/get-ajax-url.js
  var getAjaxSuffix = get_ajax_suffix_default;
  var decodeHtml = (value) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  };
  var replaceView = (template, view, search2 = "%ajax%") => decodeHtml(String(template || "").split(search2).join(view));
  var getAjaxURL = (view, search2) => replaceView(window.GENESIS_AJAX_URL, view, search2);
  var getConfAjaxURL = (view, search2) => replaceView(window.GENESIS_AJAX_CONF_URL, view, search2);
  var parseAjaxURI = (uri) => {
    let result = String(uri || "");
    if (window.GENESIS_PLATFORM === "wordpress") {
      return result.replace(/themes\.php/ig, "admin-ajax.php");
    }
    if (window.GENESIS_PLATFORM === "grav") {
      const suffix = getAjaxSuffix();
      const queryIndex = result.indexOf("?");
      if (suffix && queryIndex !== -1 && result.endsWith(suffix)) {
        const path = result.slice(0, queryIndex);
        const params = new URLSearchParams(result.slice(queryIndex + 1));
        const nonce = params.get("nonce");
        if (nonce && nonce.endsWith(suffix)) params.set("nonce", nonce.slice(0, -suffix.length));
        result = "".concat(path).concat(suffix, "?").concat(params.toString());
      }
    }
    return result;
  };
  var get_ajax_url_default = { global: getAjaxURL, config: getConfAjaxURL, parse: parseAjaxURI };

  // platforms/common/application/ui/togglers.js
  var modal2 = modal_default;
  var toastr = toastr_default;
  var request3 = request_default;
  var getAjaxSuffix2 = get_ajax_suffix_default;
  var parseAjaxURI2 = get_ajax_url_default.parse;
  var getAjaxURL2 = get_ajax_url_default.global;
  var { ready: ready3, delegate: delegate2 } = dom_default;
  var setIndicator = (element, active) => {
    let icon = element.querySelector(":scope > i");
    if (active) {
      if (!icon) {
        icon = document.createElement("i");
        element.prepend(icon);
        icon.dataset.gCreatedIndicator = "true";
      }
      if (!icon.dataset.gOriginalClass) icon.dataset.gOriginalClass = icon.className;
      icon.className = "fa fa-fw fa-spin-fast fa-spinner";
      return;
    }
    if (!icon) return;
    if (icon.dataset.gCreatedIndicator === "true") icon.remove();
    else icon.className = icon.dataset.gOriginalClass || "";
  };
  var toggle = (control) => {
    const enabler = control.closest(".enabler");
    if (!enabler || enabler.hasAttribute("disabled")) return;
    const hidden = enabler.querySelector('input[type="hidden"]');
    if (!hidden) return;
    hidden.value = hidden.value === "0" ? "1" : "0";
    enabler.setAttribute("aria-checked", hidden.value === "1" ? "true" : "false");
    hidden.dispatchEvent(new Event("change", { bubbles: true }));
  };
  ready3(() => {
    delegate2(document.body, "keydown", ".enabler", (event, enabler) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      const control = enabler.querySelector(".toggle");
      if (control) toggle(control);
    });
    delegate2(document.body, "pointerup", ".enabler .toggle", (event, control) => {
      event.preventDefault();
      toggle(control);
    });
    delegate2(document.body, "click", ".enabler .toggle", (event) => {
      event.preventDefault();
    });
    const uri = parseAjaxURI2("".concat(getAjaxURL2("devprod")).concat(getAjaxSuffix2()));
    delegate2(document.body, "change", '[data-g-devprod] input[type="hidden"]', (event, input) => {
      const parent = input.closest("[data-g-devprod]");
      const labels = JSON.parse(parent.dataset.gDevprod || "{}");
      setIndicator(parent, true);
      request3("post", uri, { mode: input.value }, (error, response) => {
        if (error || !response || !response.body.success) {
          const body = response ? response.body : { message: error ? error.message : "Request failed" };
          modal2.open({
            content: body.html || body.message || body,
            afterOpen(container2) {
              if (!body.html && !body.message) container2.style({ width: "90%" });
            }
          });
          input.value = input.value === "1" ? "0" : "1";
        } else {
          const label = parent.querySelector(".devprod-mode");
          if (label) label.textContent = labels[response.body.mode] || "Unknown";
          toastr.success(response.body.html, response.body.title);
        }
        setIndicator(parent, false);
      });
    });
  });
  var togglers_default = {};

  // platforms/common/application/utils/cookie.js
  var Cookie = {
    write: function(name, value) {
      let date = /* @__PURE__ */ new Date();
      date.setTime(date.getTime() + 3600 * 1e3 * 24 * 365 * 1);
      let host = window.location.host.toString(), domain = host.substring(host.lastIndexOf(".", host.lastIndexOf(".") - 1) + 1);
      if (host.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
        domain = host;
      }
      let cookie = [name, "=", JSON.stringify(value), "; expires=", date.toGMTString(), "; domain=.", domain, "; path=/;"];
      document.cookie = cookie.join("");
    },
    read: function(name) {
      name = name.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
      let value = document.cookie.match("(?:^|;)\\s*" + name + "=([^;]*)");
      return value ? JSON.parse(decodeURIComponent(value[1])) : null;
    }
  };
  var cookie_default = Cookie;

  // platforms/common/application/ui/collapse.js
  var Cookie2 = cookie_default;
  var { ready: ready4, delegate: delegate3 } = dom_default;
  var readStorage = () => Cookie2.read("genesis-collapsed") || Cookie2.read("genesis-collapsed") || {};
  var writeStorage = (storage5) => {
    Cookie2.write("genesis-collapsed", storage5);
    Cookie2.write("genesis-collapsed", storage5);
  };
  var config = (element) => JSON.parse(element.getAttribute("data-g-collapse") || "{}");
  var panelFor = (element, data) => data.target ? element.querySelector(data.target) : element;
  var cardFor = (panel) => panel.closest(".card") || panel;
  var handleFor = (element, data) => data.handle ? element.querySelector(data.handle) : element.querySelector(".g-collapse");
  var setTooltip = (handle, text) => {
    if (!handle) return;
    handle.dataset.title = text || "";
    handle.dataset.tip = text || "";
  };
  var applyState = (element, data, collapsed) => {
    const panel = panelFor(element, data);
    const card = cardFor(panel);
    panel.removeAttribute("style");
    card.classList.toggle("g-collapsed", collapsed);
    panel.classList.toggle("g-collapsed", collapsed);
    element.classList.toggle("g-collapsed-main", collapsed);
    data.collapsed = collapsed;
    element.setAttribute("data-g-collapse", JSON.stringify(data));
    setTooltip(handleFor(element, data), collapsed ? data.expand : data.collapse);
  };
  var loadFromStorage = () => {
    const storage5 = readStorage();
    Object.entries(storage5).forEach(([id2, collapsed]) => {
      const element = document.querySelector('[data-g-collapse-id="'.concat(CSS.escape(id2), '"]'));
      if (element) applyState(element, config(element), Boolean(collapsed));
    });
  };
  ready4(() => {
    delegate3(document.body, "click", "[data-g-collapse]", (event, element) => {
      const data = config(element);
      const handle = handleFor(element, data);
      if (handle && !event.target.closest(data.handle || ".g-collapse")) return;
      event.preventDefault();
      const storage5 = data.store === false ? {} : readStorage();
      const collapsed = storage5[data.id] === void 0 ? Boolean(data.collapsed) : Boolean(storage5[data.id]);
      const next = !collapsed;
      applyState(element, data, next);
      if (data.store !== false) {
        storage5[data.id] = next;
        writeStorage(storage5);
      }
    });
    delegate3(document.body, "click", "[data-g-collapse-all]", (event, toggle2) => {
      event.preventDefault();
      const collapsed = toggle2.dataset.gCollapseAll === "true";
      const actions = toggle2.closest(".g-filter-actions");
      const container2 = actions && actions.nextElementSibling;
      if (!container2) return;
      const storage5 = readStorage();
      container2.querySelectorAll("[data-g-collapse]").forEach((element) => {
        const data = config(element);
        applyState(element, data, collapsed);
        if (data.store !== false) storage5[data.id] = collapsed;
      });
      writeStorage(storage5);
    });
    delegate3(document.body, "input", "[data-g-collapse-filter]", (event, input) => {
      const filter = JSON.parse(input.dataset.gCollapseFilter || "{}");
      const actions = input.closest(".g-filter-actions");
      const container2 = actions && actions.nextElementSibling;
      if (!container2) return;
      const value = input.value.trim().toLowerCase();
      container2.querySelectorAll(filter.element || ".card").forEach((card) => {
        const title = card.querySelector(filter.title || "h4 .g-title");
        const text = title ? title.textContent.trim().toLowerCase() : "";
        card.style.display = !value || text.startsWith(value) || text.includes(" ".concat(value)) ? "" : "none";
      });
    });
  });
  var collapse_default = loadFromStorage;

  // platforms/common/application/ui/index.js
  var Selectize2 = selectize_default;
  var ui_default = {
    modal: modal_default,
    togglers: togglers_default,
    collapse: collapse_default,
    selectize: Selectize2,
    toastr: toastr_default
  };

  // platforms/common/application/utils/flags-state.js
  var modal3 = ui_default.modal;
  var getAjaxURL3 = get_ajax_url_default.global;
  var parseAjaxURI3 = get_ajax_url_default.parse;
  var getAjaxSuffix3 = get_ajax_suffix_default;
  var FlagsState = class {
    constructor() {
      this.flags = /* @__PURE__ */ new Map();
      this.listeners = /* @__PURE__ */ new Map();
    }
    set(key, value) {
      this.flags.set(key, value);
      return value;
    }
    get(key, defaultValue) {
      return this.flags.has(key) ? this.flags.get(key) : this.set(key, defaultValue);
    }
    keys() {
      return [...this.flags.keys()];
    }
    values() {
      return [...this.flags.values()];
    }
    on(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
      this.listeners.get(event).add(callback);
      return this;
    }
    off(event, callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) callbacks.delete(callback);
      return this;
    }
    emit(event, ...args) {
      const callbacks = this.listeners.get(event);
      if (callbacks) [...callbacks].forEach((callback) => callback.apply(this, args));
      return this;
    }
    warning(options) {
      const callback = options.callback || (() => {
      });
      const afterClose = options.afterclose || (() => {
      });
      const warningURL = parseAjaxURI3(options.url || "".concat(getAjaxURL3("unsaved")).concat(getAjaxSuffix3()));
      if (!options.url && !options.message) options.url = true;
      if (options.url) {
        modal3.open({
          content: "Loading...",
          remote: warningURL,
          data: options.data || false,
          remoteLoaded(response, modalInstance) {
            callback.call(this, response, modalInstance.elements.content, modalInstance);
          },
          afterClose
        });
        return;
      }
      modal3.open({
        content: options.message,
        afterOpen(response, modalInstance) {
          callback.call(this, response, modalInstance.elements.content, modalInstance);
        },
        afterClose
      });
    }
  };
  var flags_state_default = new FlagsState();

  // platforms/common/application/utils/field-validation.js
  var fallbackValidate = (field) => {
    if (field.disabled) return true;
    const value = field.value || "";
    const checkbox = field.type === "checkbox" || field.type === "radio";
    if (field.required && (checkbox ? !field.checked : !value)) return false;
    if (!checkbox && field.minLength >= 0 && value.length < field.minLength) return false;
    if (!checkbox && field.maxLength >= 0 && value.length > field.maxLength) return false;
    if (field.pattern && !new RegExp(field.pattern).test(value)) return false;
    const numeric = Number.parseFloat(value);
    if (field.min !== "" && numeric < Number.parseFloat(field.min)) return false;
    if (field.max !== "" && numeric > Number.parseFloat(field.max)) return false;
    return true;
  };
  var field_validation_default = (input) => {
    const field = input && input[0] ? input[0] : input;
    if (!field || !["INPUT", "TEXTAREA", "SELECT"].includes(field.tagName)) return true;
    if (typeof field.checkValidity === "function") {
      if (field.classList.contains("custom-validation-field")) {
        field.setCustomValidity(fallbackValidate(field) ? "" : "The field value is invalid");
      }
      return field.checkValidity();
    }
    return fallbackValidate(field);
  };

  // platforms/common/application/fields/submit.js
  var validateField = field_validation_default;
  var elementFrom = (value) => {
    if (value instanceof Element || value instanceof Document || value instanceof DocumentFragment) return value;
    return value && value[0] instanceof Element ? value[0] : null;
  };
  var elementsFrom = (value) => {
    if (!value) return [];
    if (value instanceof Element) return [value];
    if (typeof value === "string") return Array.from(document.querySelectorAll(value));
    return Array.from(value).map(elementFrom).filter(Boolean);
  };
  var fieldsNamed = (container2, name) => Array.from(container2.querySelectorAll("[name]")).filter((field) => field.name === name);
  function submit(elements, container2, options = {}) {
    const valid = [];
    const invalid = [];
    const root = elementFrom(container2);
    if (!root) return { valid, invalid };
    elementsFrom(elements).forEach((original) => {
      const name = original.name;
      const originalType = original.type;
      if (!name || original.disabled || originalType === "radio" && !original.checked) return;
      const matches3 = fieldsNamed(root, name);
      let input = originalType === "radio" ? matches3.find((field) => field.checked) : matches3[0];
      if (originalType === "checkbox" && matches3.some((field) => field.type === "hidden")) {
        input = matches3.find((field) => field.type === "checkbox");
      }
      if (!input) return;
      let value = input.type === "checkbox" ? Number(input.checked) : input.value;
      const parent = input.closest(".settings-param");
      let override = parent ? parent.querySelector(':scope > input[type="checkbox"]') : null;
      const overrideTarget = input.getAttribute("data-override-target");
      if (!override && overrideTarget) override = document.querySelector(overrideTarget);
      if (input.tagName === "SELECT" && input.multiple) {
        value = Array.from(input.options).filter((option) => option.selected).map((option) => option.value);
      }
      if (override && !override.checked) return;
      const skipValidation = name.includes("block-size") && (!value || value === "");
      if (!skipValidation && !validateField(input)) invalid.push(input);
      if (Array.isArray(value)) {
        value.forEach((selection) => {
          valid.push("".concat(name, "[]=").concat(encodeURIComponent(selection)));
        });
      } else if (!options.submitUnchecked || input.type !== "checkbox" || Boolean(value)) {
        valid.push("".concat(name, "=").concat(encodeURIComponent(value)));
      }
    });
    root.querySelectorAll("h4 [data-title-editable]").forEach((title) => {
      if (title.closest("[data-collection-template]")) return;
      const key = title.getAttribute("data-collection-key") || (options.isRoot ? "settings[title]" : "title");
      const editableTitle = title.getAttribute("data-title-editable");
      valid.push("".concat(key, "=").concat(encodeURIComponent(editableTitle == null ? "" : editableTitle.trim())));
    });
    return { valid, invalid };
  }

  // platforms/common/application/utils/frame-listener.js
  function frameListener(element, eventName, callback, options = {}) {
    const target = element && element[0] ? element[0] : element;
    let frame = 0;
    let latestEvent;
    const listener = (event) => {
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
  }

  // platforms/common/application/utils/get-scrollbar-width.js
  var cached = null;
  var get_scrollbar_width_default = () => {
    if (cached !== null) return cached;
    const container2 = document.querySelector("[data-genesis-container]") || document.body;
    const dummy = document.createElement("div");
    Object.assign(dummy.style, {
      width: "100px",
      height: "100px",
      overflow: "scroll",
      position: "absolute",
      zIndex: "-9999"
    });
    container2.appendChild(dummy);
    cached = dummy.offsetWidth - dummy.clientWidth;
    dummy.remove();
    return cached;
  };

  // platforms/common/application/lm/particles-sidebar.js
  var ready5 = dom_default.ready;
  var frameListener2 = frameListener;
  var scrollbarWidth = get_scrollbar_width_default;
  var container;
  var sidebar;
  var search;
  var particles;
  var heightTop = 0;
  var heightBottom = 0;
  var initialSidebarCoords;
  var realSidebarTop = 0;
  var paddingBottom = (element) => Number.parseInt(getComputedStyle(element).paddingBottom, 10) || 0;
  var resizeParticles = (bottom) => {
    if (!particles || !search) return;
    const viewportBottom = window.innerHeight - heightBottom;
    const availableBottom = typeof bottom === "number" ? Math.min(viewportBottom, bottom) : viewportBottom;
    const maxHeight = Math.max(0, availableBottom - heightTop - search.offsetHeight - 30);
    particles.style.maxHeight = "".concat(maxHeight, "px");
    particles.style.overflow = "auto";
    const hasScrollbar = particles.scrollHeight > particles.clientHeight;
    particles.classList.toggle("has-scrollbar", hasScrollbar);
    particles.style.marginRight = hasScrollbar ? "".concat(-scrollbarWidth(), "px") : "";
  };
  var initSizes = () => {
    container = document.querySelector(".sidebar-block");
    if (!container) return;
    sidebar = container.querySelector(".genesis-lm-particles-picker");
    if (!sidebar) return;
    search = sidebar.querySelector(":scope > .search");
    particles = sidebar.querySelector(":scope > .particles-container");
    if (!search || !particles) return;
    heightTop = 0;
    heightBottom = 0;
    initialSidebarCoords = sidebar.getBoundingClientRect();
    realSidebarTop = sidebar.offsetTop;
    document.querySelectorAll("body.admin.com_genesis nav.navbar-fixed-top, #wpadminbar, #admin-main #titlebar, #admin-main .grav-update.grav").forEach((element) => {
      heightTop += element.offsetHeight;
    });
    document.querySelectorAll("body.admin.com_genesis #status").forEach((element) => {
      heightBottom += element.offsetHeight;
    });
    resizeParticles();
  };
  ready5(() => {
    initSizes();
    const scrollElement = window.GENESIS_PLATFORM === "grav" ? document.querySelector("#admin-main .content-padding") || window : window;
    const scroll = function() {
      if (!container || !sidebar) return;
      const scrollTop = scrollElement === window ? window.scrollY : scrollElement.scrollTop;
      const containerBounds = container.getBoundingClientRect();
      const limit = containerBounds.top + containerBounds.height;
      resizeParticles(limit - paddingBottom(container));
      const sidebarCoords = sidebar.getBoundingClientRect();
      const shouldBeFixed = scrollTop > initialSidebarCoords.top - heightTop - 10 && scrollTop >= realSidebarTop - 10;
      const reachedTheLimit = sidebarCoords.height + 10 + heightTop + paddingBottom(container) >= limit;
      const sidebarTallerThanContainer = containerBounds.height <= sidebarCoords.height;
      sidebar.style.width = "".concat(sidebarCoords.width, "px");
      if (shouldBeFixed && !reachedTheLimit) {
        sidebar.classList.remove("particles-absolute");
        sidebar.classList.add("particles-fixed");
        sidebar.style.top = "".concat(heightTop + 10, "px");
        sidebar.style.bottom = "inherit";
      } else if (shouldBeFixed && reachedTheLimit && (sidebarTallerThanContainer || window.GENESIS_PLATFORM === "grav" && containerBounds.bottom < sidebarCoords.bottom)) {
        sidebar.classList.remove("particles-fixed");
        sidebar.classList.add("particles-absolute");
        sidebar.style.top = "inherit";
        sidebar.style.bottom = "".concat(paddingBottom(container), "px");
      } else {
        sidebar.classList.remove("particles-fixed", "particles-absolute");
        sidebar.style.top = "inherit";
        sidebar.style.bottom = "inherit";
      }
    };
    frameListener2(scrollElement, "scroll", scroll);
    frameListener2(window, "resize", () => {
      if (!particles || !search) return;
      scroll();
    });
    document.body.addEventListener("statechangeEnd", initSizes);
  });

  // platforms/common/application/lm/id.js
  var randomId = () => {
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return 1e3 + value[0] % 9e3;
    }
    return Math.floor(Math.random() * 9e3) + 1e3;
  };
  var id_default = (options) => {
    const existing = new Set(options.builder ? Object.keys(options.builder.map || {}) : []);
    const parts = [];
    if (options.type !== "particle") parts.push(options.type);
    if (options.subtype) parts.push(options.subtype);
    const key = parts.join("-");
    let id2;
    do {
      id2 = randomId();
    } while (existing.has("".concat(key, "-").concat(id2)));
    return "".concat(key, "-").concat(id2);
  };

  // platforms/common/application/utils/translate.js
  var translate_default = (key, replacement = "") => {
    const translate21 = window.GenesisTranslate || window.GenesisT || ((value) => value);
    return String(translate21(key)).split("%s").join(replacement);
  };

  // platforms/common/application/utils/get-outline.js
  var selectize = () => {
    const selector = document.querySelector("#configuration-selector");
    return selector ? selector.selectizeInstance : null;
  };
  var getOutlineNameById = (outline) => {
    if (outline == null) return "";
    const instance2 = selectize();
    const option = instance2 && instance2.Options ? instance2.Options[outline] : null;
    return option && option.text ? String(option.text).trim() : "";
  };
  var getCurrentOutline = () => {
    const instance2 = selectize();
    const selected = instance2 ? String(instance2.getValue() || "").trim() : "";
    if (selected) return selected;
    const selector = document.querySelector("#configuration-selector");
    const nativeValue = selector ? String(selector.value || "").trim() : "";
    if (nativeValue) return nativeValue;
    const urls = [window.location.href, window.GENESIS_AJAX_CONF_URL];
    for (const value of urls) {
      if (!value) continue;
      try {
        const url = new URL(value, window.location.href);
        const outline = url.searchParams.get("style");
        if (outline) return outline.trim();
      } catch (error) {
      }
    }
    return "";
  };
  var get_outline_default = { getOutlineNameById, getCurrentOutline };

  // platforms/common/application/lm/blocks/base.js
  var EventEmitter3 = event_emitter_default;
  var zen3 = createElement;
  var dom6 = dom_collection_default;
  var ID = id_default;
  var translate = translate_default;
  var getCurrentOutline2 = get_outline_default.getCurrentOutline;
  var isPlainObject2 = function(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") {
      return false;
    }
    let prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
  };
  var mergeOptions = function(target) {
    target = isPlainObject2(target) ? Object.assign({}, target) : {};
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      if (!isPlainObject2(source)) {
        return;
      }
      Object.keys(source).forEach(function(key) {
        target[key] = isPlainObject2(source[key]) && isPlainObject2(target[key]) ? mergeOptions(target[key], source[key]) : source[key];
      });
    });
    return target;
  };
  var getPath = function(object, path) {
    return String(path || "").split(".").reduce(function(value, key) {
      return value == null ? void 0 : value[key];
    }, object);
  };
  var setPath = function(object, path, value) {
    let parts = String(path || "").split("."), last3 = parts.pop(), target = object;
    parts.forEach(function(key) {
      if (!isPlainObject2(target[key])) {
        target[key] = {};
      }
      target = target[key];
    });
    target[last3] = value;
    return object;
  };
  function Base(options) {
    this.listeners = /* @__PURE__ */ new Map();
    this._boundMethods = /* @__PURE__ */ Object.create(null);
    this.setOptions(options);
    this.fresh = !this.options.id;
    this.id = this.options.id || ID(this.options);
    this.attributes = this.options.attributes || {};
    this.inherit = this.options.inherit || {};
    this.block = zen3("div").html(this.layout()).firstChild();
    this.on("rendered", this.bound("onRendered"));
    return this;
  }
  Base.prototype = Object.create(EventEmitter3.prototype);
  Base.prototype.constructor = Base;
  Base.prototype.options = {
    subtype: false,
    attributes: {},
    inherit: {}
  };
  Object.assign(Base.prototype, {
    setOptions: function(options) {
      this.options = mergeOptions({}, this.options || Base.prototype.options, options || {});
      return this;
    },
    bound: function(method) {
      return this._boundMethods[method] || (this._boundMethods[method] = this[method].bind(this));
    },
    guid: function() {
      return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    },
    getId: function() {
      return this.id || (this.id = ID(this.options));
    },
    getType: function() {
      return this.options.type || "";
    },
    getSubType: function() {
      return this.options.subtype || "";
    },
    getTitle: function() {
      return String(this.options.title || "Untitled").trim();
    },
    setTitle: function(title) {
      this.options.title = String(title || "Untitled").trim();
      return this;
    },
    getKey: function() {
      return "";
    },
    getPageId: function() {
      let root = dom6("[data-lm-root]");
      if (!root) {
        return "data-root-not-found";
      }
      return root.data("lm-page");
    },
    getAttribute: function(key) {
      return getPath(this.attributes, key);
    },
    getAttributes: function() {
      return this.attributes || {};
    },
    getInheritance: function() {
      return this.inherit || {};
    },
    updateTitle: function() {
      return this;
    },
    setAttribute: function(key, value) {
      setPath(this.attributes, key, value);
      return this;
    },
    setAttributes: function(attributes) {
      this.attributes = attributes;
      return this;
    },
    setInheritance: function(inheritance) {
      this.inherit = inheritance;
      return this;
    },
    hasAttribute: function(key) {
      return typeof getPath(this.attributes, key) !== "undefined";
    },
    enableInheritance: function() {
    },
    disableInheritance: function() {
    },
    refreshInheritance: function() {
    },
    hasInheritance: function() {
      return Object.keys(this.inherit || {}).length && this.inherit.outline != getCurrentOutline2();
    },
    disable: function() {
      this.block.title(translate("GENESIS_PLATFORM_JS_LM_DISABLED_PARTICLE", "particle"));
      this.block.addClass("particle-disabled");
    },
    enable: function() {
      this.block.removeAttribute("title");
      this.block.removeClass("particle-disabled");
    },
    insert: function(target, location) {
      this.block[location || "after"](target);
      return this;
    },
    adopt: function(element) {
      element.insert(this.block);
      return this;
    },
    isNew: function(fresh) {
      if (typeof fresh !== "undefined") {
        this.fresh = !!fresh;
      }
      return this.fresh;
    },
    dropzone: function() {
      return "data-lm-dropzone";
    },
    addDropzone: function() {
      this.block.data("lm-dropzone", true);
    },
    removeDropzone: function() {
      this.block.data("lm-dropzone", null);
    },
    layout: function() {
    },
    onRendered: function() {
    },
    setLayout: function(layout) {
      this.block = layout;
      return this;
    },
    getLimits: function() {
      return false;
    }
  });
  var base_default = Base;

  // platforms/common/application/lm/blocks/atom.js
  var Base2 = base_default;
  var getAjaxURL4 = get_ajax_url_default.config;
  var Atom = class extends Base2 {
    constructor(options) {
      super(options);
      this.on("changed", this.hasChanged);
    }
    updateTitle(title) {
      let titleElement = this.block[0].querySelector(".title");
      if (titleElement) {
        titleElement.textContent = title;
      }
      this.setTitle(title);
      return this;
    }
    layout() {
      let settingsUri = getAjaxURL4(this.getPageId() + "/layout/" + this.getType() + "/" + this.getId()), subtype = this.getSubType() ? 'data-lm-blocksubtype="' + this.getSubType() + '"' : "";
      return '<div class="' + this.getType() + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" ' + subtype + '><span><span class="title">' + this.getTitle() + '</span><span class="font-small">' + (this.getSubType() || this.getKey() || this.getType()) + '</span></span><div class="float-right"><i aria-label="Configure Atom Settings" class="fa fa-cog" aria-hidden="true" data-lm-nodrag data-lm-settings="' + settingsUri + '"></i></div></div>';
    }
    hasChanged(state, parent) {
      let block = this.block[0], icon = block.querySelector("span > i.changes-indicator:first-child");
      if (icon && parent && !parent.changeState) {
        return;
      }
      block.classList.toggle("block-has-changes", Boolean(state));
      if (!state && icon) {
        icon.remove();
      }
      if (state && !icon) {
        icon = document.createElement("i");
        icon.className = "far fa-circle changes-indicator";
        let reference = block.querySelector(".icon"), container2 = reference ? reference.parentNode : block.querySelector("span");
        if (container2) {
          container2.insertBefore(icon, reference || container2.firstChild);
        }
      }
    }
    onRendered() {
      let globallyDisabled = document.querySelector('[data-lm-disabled][data-lm-subtype="' + CSS.escape(this.getSubType() || "") + '"]');
      if (globallyDisabled || this.getAttribute("enabled") === 0) {
        this.disable();
      }
    }
  };
  Atom.prototype.options = {
    type: "atom"
  };
  var atom_default = Atom;

  // platforms/common/application/lm/blocks/grid.js
  var Base3 = base_default;
  var translate2 = translate_default;
  var Grid = class extends Base3 {
    constructor(options) {
      super(options);
      this.on("changed", this.hasChanged);
    }
    layout() {
      let isPreset = this.getAttribute("layoutPreset") === "bootstrap", preset = isPreset ? ' data-lm-preset-grid="bootstrap"' : "";
      return '<div class="g-grid nowrap no-gear" data-lm-id="' + this.getId() + '" ' + this.dropzone() + ' data-lm-blocktype="grid"' + preset + '><button type="button" class="grid-structure-menu" data-lm-nodrag data-lm-structure-menu aria-label="' + translate2("GENESIS_PLATFORM_JS_LM_MORE_ACTIONS") + '"><span>' + translate2("GENESIS_PLATFORM_JS_LM_ROW") + '</span><i class="fa fa-cog" aria-hidden="true"></i></button></div>';
    }
    onRendered() {
      let parent = this.block.parent();
      if (parent && parent.data("lm-blocktype") == "atoms") {
        this.block.removeClass("nowrap");
      }
      if (parent && (parent.data("lm-root") || parent.data("lm-blocktype") == "container" && parent.parent().data("lm-root"))) {
        this.removeDropzone();
      }
    }
    hasChanged(state) {
      let parent = this.block.parent('[data-lm-blocktype="section"]'), id2 = parent ? parent.data("lm-id") : false;
      this.changeState = state;
      if (!parent || !id2) {
        return;
      }
      if (this.options.builder) {
        this.options.builder.get(id2).emit("changed", state, this);
      }
    }
  };
  Grid.prototype.options = {
    type: "grid"
  };
  var grid_default = Grid;

  // platforms/common/application/lm/blocks/section.js
  var Base4 = base_default;
  var Grid2 = grid_default;
  var getAjaxURL5 = get_ajax_url_default.config;
  var getOutlineNameById2 = get_outline_default.getOutlineNameById;
  var translate3 = translate_default;
  var forOwn = function(object, callback) {
    Object.keys(object || {}).forEach(function(key) {
      callback(object[key], key);
    });
  };
  var elementFromHTML = function(html) {
    let template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  };
  var Section = class extends Base4 {
    constructor(options) {
      super(options);
      this.grid = new Grid2();
      this.on("done", this.bound("onDone"));
      this.on("changed", this.hasChanged);
    }
    layout() {
      let settingsUri = getAjaxURL5(this.getPageId() + "/layout/" + this.getType() + "/" + this.getId()), inheritanceLabel = "", klass = "";
      if (this.hasInheritance()) {
        inheritanceLabel = this.renderInheritanceLabel(getOutlineNameById2(this.inherit.outline));
        klass = " g-inheriting";
        if (this.inherit.include.length) {
          klass += " g-inheriting-" + this.inherit.include.join(" g-inheriting-");
        }
      }
      return '<div class="section' + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" data-lm-blocksubtype="' + this.getSubType() + '"><div class="section-header clearfix"><h4 class="float-left" title="' + this.getTitle() + '">' + this.getTitle() + '</h4><div class="section-actions float-right"><span class="section-addrow" data-tip="' + translate3("GENESIS_PLATFORM_JS_LM_ADD_ROW", "Section") + '" data-tip-place="top-right"><i aria-label="' + translate3("GENESIS_PLATFORM_JS_LM_ADD_ROW", "Section") + '" class="fa fa-plus" aria-hidden="true"></i></span> <span class="section-settings" data-tip="' + translate3("GENESIS_PLATFORM_JS_LM_SETTINGS", "Section") + '" data-tip-place="top-right"><i aria-label="' + translate3("GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS", "Section") + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span></div></div>' + inheritanceLabel + "</div>";
    }
    adopt(child) {
      let node = child && child.nodeType ? child : child && child[0], grid = this.block[0].querySelector(".g-grid");
      if (node && grid) {
        grid.appendChild(node);
      }
    }
    renderInheritanceLabel(outline) {
      let content = translate3("GENESIS_PLATFORM_INHERITING_FROM_X", "<strong>" + outline + "</strong>");
      if (this.block && this.getParent()) {
        content = "";
      }
      return '<div class="g-inherit g-section-inherit"><div class="g-inherit-content" ' + this.addInheritanceTip(true) + '><i class="fa fa-lock" aria-hidden="true"></i> ' + content + "</div></div>";
    }
    enableInheritance() {
      if (!this.hasInheritance()) {
        return;
      }
      let block = this.block[0];
      block.className = this.cleanKlass(block.className);
      block.classList.add("g-inheriting");
      if (this.inherit.include.length) {
        this.inherit.include.forEach(function(name) {
          block.classList.add("g-inheriting-" + name);
        });
      }
      if (!block.querySelector(":scope > .g-inherit")) {
        let header = block.querySelector(":scope > .section-header"), inherit = elementFromHTML(this.renderInheritanceLabel(getOutlineNameById2(this.inherit.outline)));
        if (header && inherit) {
          header.after(inherit);
        }
      }
    }
    disableInheritance() {
      let block = this.block[0], inherit = block.querySelector(":scope > .g-inherit.g-section-inherit");
      if (inherit) {
        inherit.remove();
      }
      block.className = this.cleanKlass(block.className);
      block.classList.remove("g-inheriting");
    }
    refreshInheritance() {
      let block = this.block[0];
      block.className = this.cleanKlass(block.className);
      if (!this.hasInheritance()) {
        return;
      }
      this.enableInheritance();
      let overlay = block.querySelector(":scope > .g-inherit"), content = elementFromHTML(this.renderInheritanceLabel(getOutlineNameById2(this.inherit.outline)));
      if (overlay && content) {
        overlay.innerHTML = content.innerHTML;
      }
    }
    addInheritanceTip(html) {
      let tooltip = this.getInheritanceTip();
      if (html) {
        let tooltipHTML = "";
        forOwn(tooltip, function(value, key) {
          tooltipHTML += "data-" + key + '="' + value + '" ';
        });
        tooltip = tooltipHTML;
      }
      return this.hasInheritance() ? tooltip : "";
    }
    getInheritanceTip() {
      let outline = this.inherit ? this.inherit.outline : null, name = getOutlineNameById2(outline), include = (this.inherit.include || []).join(", ");
      return {
        tip: translate3("GENESIS_PLATFORM_INHERITING_FROM_X", "<strong>" + name + "</strong>") + "<br />Outline ID: " + outline + "<br />Replace: " + include,
        "tip-offset": -2,
        "tip-place": "top-right"
      };
    }
    cleanKlass(klass) {
      return (klass || "").split(" ").filter(function(item) {
        return !item.match(/^g-inheriting-/);
      }).join(" ");
    }
    hasChanged(state, child) {
      let block = this.block[0], heading = block.querySelector("h4"), icon = heading && heading.querySelector(":scope > i:first-child");
      if (icon && child && !child.changeState) {
        return;
      }
      block.classList.toggle("block-has-changes", Boolean(state));
      if (!state && icon) {
        icon.remove();
      }
      if (state && !icon && heading) {
        icon = document.createElement("i");
        icon.className = "far fa-circle changes-indicator";
        heading.insertBefore(icon, heading.firstChild);
      }
    }
    onDone() {
      let block = this.block[0];
      if (!block.querySelector("[data-lm-id]")) {
        this.grid.insert(this.block, "bottom");
        this.options.builder.add(this.grid);
      }
      this.refreshInheritance();
    }
    getParent() {
      let parent = this.block[0].parentElement && this.block[0].parentElement.closest("[data-lm-id]");
      return parent ? this.options.builder.get(parent.getAttribute("data-lm-id")) : null;
    }
    getLimits(parent) {
      if (!parent) {
        return false;
      }
      let parentBlock = parent.block[0], sibling = parentBlock.nextElementSibling || parentBlock.previousElementSibling || false;
      if (!sibling) {
        return [100, 100];
      }
      let siblingBlock = this.options.builder.get(sibling.getAttribute("data-lm-id"));
      if (siblingBlock.getType() !== "block") {
        return false;
      }
      let sizes = {
        current: this.getParent().getSize(),
        sibling: siblingBlock.getSize()
      };
      return [5, sizes.current + sizes.sibling - 5];
    }
  };
  Section.prototype.options = {};
  var section_default = Section;

  // platforms/common/application/lm/blocks/offcanvas.js
  var Section2 = section_default;
  var getAjaxURL6 = get_ajax_url_default.config;
  var getOutlineNameById3 = get_outline_default.getOutlineNameById;
  var translate4 = translate_default;
  var Offcanvas = class extends Section2 {
    layout() {
      let settingsUri = getAjaxURL6(this.getPageId() + "/layout/" + this.getType() + "/" + this.getId()), inheritance = "", klass = "";
      if (this.hasInheritance()) {
        let outline = getOutlineNameById3(this.inherit.outline);
        inheritance = '<div class="g-inherit g-section-inherit"><div class="g-inherit-content">' + translate4("GENESIS_PLATFORM_INHERITING_FROM_X", "<strong>" + outline + "</strong>") + "</div></div>";
        klass = " g-inheriting g-inheriting-" + this.inherit.include.join(" g-inheriting-");
      }
      return '<div class="offcanvas-section' + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '"><div class="section-header clearfix"><h4 class="float-left" title="' + this.getAttribute("name") + '">' + this.getAttribute("name") + '</h4><div class="section-actions float-right"><span class="section-addrow" data-tip="' + translate4("GENESIS_PLATFORM_JS_LM_ADD_ROW", "Offcanvas") + '" data-tip-place="top-right"><i aria-label="' + translate4("GENESIS_PLATFORM_JS_LM_ADD_ROW", "Offcanvas") + '" class="fa fa-plus" aria-hidden="true"></i></span> <span class="section-settings" data-tip="' + translate4("GENESIS_PLATFORM_JS_LM_SETTINGS", "Offcanvas") + '" data-tip-place="top-right"><i aria-label="' + translate4("GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS", "Offcanvas") + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span></div></div>' + inheritance + "</div>";
    }
    getId() {
      return this.id || (this.id = this.options.type);
    }
  };
  Offcanvas.prototype.options = {
    type: "offcanvas",
    attributes: { name: "Offcanvas Section" }
  };
  var offcanvas_default = Offcanvas;

  // platforms/common/application/lm/blocks/wrapper.js
  var Section3 = section_default;
  var Wrapper = class extends Section3 {
    layout() {
      return '<div class="wrapper-section" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" data-lm-blocksubtype="' + this.getSubType() + '"></div>';
    }
    hasChanged() {
    }
    getSize() {
      return false;
    }
    getId() {
      return this.id || (this.id = this.options.type);
    }
  };
  Wrapper.prototype.options = {
    type: "wrapper",
    attributes: { name: "Wrapper" }
  };
  var wrapper_default = Wrapper;

  // platforms/common/application/lm/blocks/atoms.js
  var Section4 = section_default;
  var elementFromHTML2 = function(html) {
    let template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  };
  var Atoms = class extends Section4 {
    layout() {
      this.deprecated = '<div class="atoms-notice">Looking for Atoms? To make it easier we moved them in the <a href="#"><i class="fa fa-fw fa-list-alt" aria-hidden="true"></i> Page Settings</a>.</div>';
      return '<div class="atoms-section" style="display: none;" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '"><div class="section-header clearfix"><h4 class="float-left">' + this.getAttribute("name") + "</h4></div></div>";
    }
    getId() {
      return this.id || (this.id = this.options.type);
    }
    onDone() {
      let block = this.block[0];
      if (!block.querySelector('[data-lm-blocktype="atom"]')) {
        let ids = [this.getId()], segments = block.querySelectorAll("[data-lm-id]");
        segments.forEach(function(element) {
          ids.push(element.getAttribute("data-lm-id"));
        });
        ids.reverse().forEach(function(id2) {
          this.options.builder.remove(id2);
        }, this);
        block.replaceWith(elementFromHTML2(this.deprecated));
        this._attachRedirect();
        return;
      }
      if (!block.querySelector("[data-lm-id]")) {
        this.grid.insert(this.block, "bottom");
        this.options.builder.add(this.grid);
      }
      block.after(elementFromHTML2(this.deprecated));
      this._attachRedirect();
    }
    _attachRedirect() {
      let item = document.querySelector('[data-genesis-nav="page"]');
      if (!item) {
        return;
      }
      let link = document.querySelector(".atoms-notice a");
      if (!link) {
        return;
      }
      link.addEventListener("click", function(event) {
        event.preventDefault();
        item.click();
      });
    }
  };
  Atoms.prototype.options = {
    type: "atoms",
    attributes: { name: "Atoms Section" }
  };
  var atoms_default = Atoms;

  // platforms/common/application/lm/blocks/container.js
  var Base5 = base_default;
  var getAjaxURL7 = get_ajax_url_default.config;
  var translate5 = translate_default;
  var Container = class extends Base5 {
    constructor(options) {
      super(options);
      this.on("changed", this.hasChanged);
    }
    layout() {
      return '<div class="g-lm-container" data-lm-id="' + this.getId() + '" data-lm-blocktype="container"></div>';
    }
    onRendered(element, parent) {
      if (!parent) {
        this.addSettings(element);
      }
    }
    hasChanged(state, child) {
      let block = this.block[0], title = block.querySelector("span.title"), icon = title && title.querySelector(":scope > i:first-child");
      if (icon && child && !child.changeState) {
        return;
      }
      block.classList.toggle("block-has-changes", Boolean(state));
      if (!state && icon) {
        icon.remove();
      }
      if (state && !icon && title) {
        icon = document.createElement("i");
        icon.className = "far fa-circle changes-indicator";
        title.insertBefore(icon, title.firstChild);
      }
    }
    addSettings(container2) {
      let settingsUri = getAjaxURL7(this.getPageId() + "/layout/" + this.getType() + "/" + this.getId()), block = container2.block[0], wrapper = document.createElement("div");
      wrapper.className = "container-wrapper clearfix";
      wrapper.innerHTML = '<div class="container-title"><span class="title">' + this.getType() + '</span></div><div class="container-actions"><span data-tip="' + translate5("GENESIS_PLATFORM_JS_LM_SETTINGS", "Container") + '" data-tip-place="top-left"><i aria-label="' + translate5("GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS", "Container") + '" class="fa fa-cog" aria-hidden="true" data-lm-settings="' + settingsUri + '"></i></span></div>';
      block.insertBefore(wrapper, block.firstChild);
    }
  };
  Container.prototype.options = {
    type: "container"
  };
  var container_default = Container;

  // platforms/common/application/lm/blocks/block.js
  var Base6 = base_default;
  var precision = function(value, decimals) {
    let multiplier = Math.pow(10, decimals);
    return Math.round(Number(value) * multiplier) / multiplier;
  };
  var Block = class extends Base6 {
    constructor(options) {
      super(options);
      if (options && options.attributes && options.attributes.size) {
        this.setAttribute("size", precision(options.attributes.size, 1));
      }
      this.applyColumnClasses();
      this.on("changed", this.hasChanged);
    }
    getColumnSpan(breakpoint) {
      let stored2 = parseInt(this.getAttribute("columns." + breakpoint), 10);
      if (stored2) {
        return Math.max(1, Math.min(12, stored2));
      }
      if (breakpoint !== "xs") {
        return null;
      }
      return Math.max(1, Math.min(12, Math.round((this.getSize() || 100) / 100 * 12)));
    }
    applyColumnClasses() {
      if (!this.block || !this.block[0]) {
        return this;
      }
      let element = this.block[0];
      Array.from(element.classList).forEach(function(klass) {
        if (/^col-(?:(?:sm|md|lg|xl)-)?\d+$/.test(klass)) {
          element.classList.remove(klass);
        }
      });
      let xs = this.getColumnSpan("xs");
      element.classList.add("col-" + xs);
      ["sm", "md", "lg", "xl"].forEach(function(breakpoint) {
        let span = this.getColumnSpan(breakpoint);
        if (span) {
          element.classList.add("col-" + breakpoint + "-" + span);
        }
      }, this);
      return this;
    }
    getSize() {
      return precision(this.getAttribute("size"), 1);
    }
    setSize(size3, store) {
      size3 = typeof size3 === "undefined" ? this.getSize() : Math.max(0, Math.min(100, parseFloat(size3)));
      size3 = precision(size3, 1);
      if (store) {
        this.setAttribute("size", size3);
      }
      let style = this.block[0].style;
      style.flex = "0 1 " + size3 + "%";
      style.webkitFlex = "0 1 " + size3 + "%";
      style.msFlex = "0 1 " + size3 + "%";
      this.applyColumnClasses();
      this.emit("resized", size3, this);
    }
    setAnimatedSize(size3, store) {
      size3 = typeof size3 === "undefined" ? this.getSize() : Math.max(0, Math.min(100, parseFloat(size3)));
      size3 = precision(size3, 1);
      if (store) {
        this.setAttribute("size", size3);
      }
      let block = this.block[0], target = "0 1 " + size3 + "%";
      if (this.sizeAnimation) {
        this.sizeAnimation.cancel();
      }
      if (typeof block.animate === "function") {
        this.sizeAnimation = block.animate([
          { flex: getComputedStyle(block).flex },
          { flex: target }
        ], {
          duration: 250,
          easing: "ease",
          fill: "forwards"
        });
        this.sizeAnimation.addEventListener("finish", (function() {
          let animation = this.sizeAnimation;
          this.sizeAnimation = null;
          block.removeAttribute("style");
          this.setSize(size3);
          animation.cancel();
        }).bind(this), { once: true });
      } else {
        block.removeAttribute("style");
        this.setSize(size3);
      }
      this.emit("resized", size3, this);
    }
    setLabelSize(size3) {
      let label = this.block[0].querySelector(":scope > .particle-size");
      if (!label) {
        return false;
      }
      label.textContent = precision(size3, 1) + "%";
    }
    layout() {
      return '<div class="g-block" data-lm-id="' + this.getId() + '"' + this.dropzone() + ' data-lm-blocktype="block"><button type="button" class="lm-column-add" data-lm-nodrag data-lm-column-add aria-label="Add content"><span aria-hidden="true">+</span></button></div>';
    }
    onRendered(element, parent) {
      let elementBlock = element.block[0];
      if (elementBlock.querySelector(':scope > [data-lm-blocktype="section"]')) {
        this.removeDropzone();
      }
      if (!parent) {
        return;
      }
      let grandpa = parent.block[0].parentElement, greatGrandpa = grandpa && grandpa.parentElement, isRoot = grandpa && grandpa.hasAttribute("data-lm-root"), isRootContainer = grandpa && grandpa.getAttribute("data-lm-blocktype") === "container" && greatGrandpa && (greatGrandpa.hasAttribute("data-lm-root") || greatGrandpa.getAttribute("data-lm-blocktype") === "wrapper");
      if (isRoot || isRootContainer) {
        let label = document.createElement("span");
        label.className = "particle-size";
        label.textContent = this.getSize() + "%";
        elementBlock.insertBefore(label, elementBlock.firstChild);
        element.on("resized", this.bound("onResize"));
      }
    }
    onResize(resize) {
      this.setLabelSize(resize);
    }
    hasChanged(state) {
      let icon, block = this.block[0], child = block.querySelector(':scope > [data-lm-id]:not([data-lm-blocktype="section"]):not([data-lm-blocktype="container"])');
      this.changeState = state;
      if (!child) {
        child = block.querySelector(":scope > .particle-size");
        if (!child) {
          let parentBlock = block.parentElement && block.parentElement.closest('[data-lm-blocktype="block"]');
          child = parentBlock && parentBlock.querySelector(":scope > .particle-size");
        }
        if (!child) {
          return;
        }
        icon = child.querySelector("i:first-child");
        if (!state && icon) {
          icon.remove();
        }
        if (state && !icon) {
          icon = document.createElement("i");
          icon.className = "far fa-circle changes-indicator";
          child.insertBefore(icon, child.firstChild);
        }
        return;
      }
      let mapped = this.options.builder.get(child.getAttribute("data-lm-id"));
      if (mapped) {
        mapped.emit("changed", state, this);
      }
    }
  };
  Block.prototype.options = {
    type: "block",
    attributes: {
      size: 100
    }
  };
  var block_default = Block;

  // platforms/common/application/lm/blocks/particle.js
  var Atom2 = atom_default;
  var getAjaxURL8 = get_ajax_url_default.config;
  var getOutlineNameById4 = get_outline_default.getOutlineNameById;
  var translate6 = translate_default;
  var precision2 = function(value, decimals) {
    let multiplier = Math.pow(10, decimals);
    return Math.round(Number(value) * multiplier) / multiplier;
  };
  var forOwn2 = function(object, callback) {
    Object.keys(object || {}).forEach(function(key) {
      callback(object[key], key);
    });
  };
  var Particle = class extends Atom2 {
    layout() {
      let settingsUri = getAjaxURL8(this.getPageId() + "/layout/" + this.getType() + "/" + this.getId()), subtype = this.getSubType() ? 'data-lm-blocksubtype="' + this.getSubType() + '"' : "", klass = this.getCategoryClass();
      if (this.hasInheritance()) {
        klass = " g-inheriting";
        if (this.inherit.include.length) {
          klass += " g-inheriting-" + this.inherit.include.join(" g-inheriting-");
        }
      }
      return '<div class="' + this.getType() + klass + '" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '" ' + subtype + '><span><span class="icon" ' + this.addInheritanceTip(true) + '><i class="fa ' + this.getIcon() + '" aria-hidden="true"></i></span><span class="title">' + this.getTitle() + '</span><span class="font-small">' + (this.getKey() || this.getSubType() || this.getType()) + '</span></span><div class="float-right"><span class="particle-size"></span><span class="particle-actions"><i class="fa fa-times particle-remove" aria-hidden="true" data-lm-nodrag data-lm-particle-remove aria-label="' + translate6("GENESIS_PLATFORM_JS_LM_REMOVE") + '"></i><i aria-label="' + translate6("GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS", "Particle") + '" class="fa fa-cog" aria-hidden="true" data-lm-nodrag data-lm-settings="' + settingsUri + '"></i></span></div></div>';
    }
    enableInheritance() {
      let block = this.block[0];
      block.className = this.cleanKlass(block.className);
      if (!this.hasInheritance()) {
        return;
      }
      let icon = block.querySelector(".icon");
      block.classList.add("g-inheriting");
      if (this.inherit.include.length) {
        this.inherit.include.forEach(function(name) {
          block.classList.add("g-inheriting-" + name);
        });
      }
      let iconGlyph = block.querySelector(".icon .fa");
      if (iconGlyph) {
        iconGlyph.className = "fa " + this.getIcon();
      }
      forOwn2(this.getInheritanceTip(), function(value, key) {
        icon.setAttribute("data-" + key, value);
      });
      window.Genesis.tips.reload();
    }
    disableInheritance() {
      let block = this.block[0], icon = block.querySelector(".icon"), iconGlyph = block.querySelector(".icon .fa");
      block.className = this.cleanKlass(block.className);
      block.classList.remove("g-inheriting");
      if (iconGlyph) {
        iconGlyph.className = "fa " + this.getIcon();
      }
      forOwn2(this.getInheritanceTip(), function(value, key) {
        icon.removeAttribute("data-" + key);
      });
      window.Genesis.tips.reload();
    }
    refreshInheritance() {
      let block = this.block[0];
      block.classList.toggle("g-inheritance", !this.hasInheritance());
      if (this.hasInheritance()) {
        block.className = this.cleanKlass(block.className);
      }
    }
    addInheritanceTip(html) {
      let tooltip = this.getInheritanceTip();
      if (html) {
        let tooltipHTML = "";
        forOwn2(tooltip, function(value, key) {
          tooltipHTML += "data-" + key + '="' + value + '" ';
        });
        tooltip = tooltipHTML;
      }
      return this.hasInheritance() ? tooltip : "";
    }
    getInheritanceTip() {
      let outline = getOutlineNameById4(this.inherit ? this.inherit.outline : null), particle = this.inherit.particle || "", include = (this.inherit.include || []).join(", ");
      return {
        tip: translate6("GENESIS_PLATFORM_INHERITING_FROM_X", "<strong>" + outline + "</strong>") + "<br />ID: " + particle + "<br />Replace: " + include,
        "tip-offset": -10,
        "tip-place": "top-right"
      };
    }
    cleanKlass(klass) {
      return (klass || "").split(" ").filter(function(item) {
        return !item.match(/^g-inheriting-/);
      }).join(" ");
    }
    setLabelSize(size3) {
      let label = this.block[0].querySelector(".particle-size");
      if (!label) {
        return false;
      }
      label.textContent = precision2(size3, 1) + "%";
    }
    onRendered(element, parent) {
      let size3 = parent.getSize() || 100, globallyDisabled = document.querySelector('[data-lm-disabled][data-lm-subtype="' + CSS.escape(this.getSubType() || "") + '"]');
      if (globallyDisabled || this.getAttribute("enabled") === 0) {
        this.disable();
      }
      this.setLabelSize(size3);
      parent.on("resized", this.bound("onParentResize"));
    }
    getParent() {
      let parent = this.block[0].parentElement && this.block[0].parentElement.closest("[data-lm-id]");
      return parent ? this.options.builder.get(parent.getAttribute("data-lm-id")) : null;
    }
    onParentResize(resize) {
      this.setLabelSize(resize);
    }
    getIcon() {
      if (this.hasInheritance()) {
        return "fa-lock";
      }
      let type = this.getType(), subtype = this.getSubType(), template = document.querySelector('.particles-container [data-lm-blocktype="' + CSS.escape(type) + '"][data-lm-subtype="' + CSS.escape(subtype || "") + '"]');
      return template ? template.getAttribute("data-lm-icon") : "fa-cube";
    }
    getCategoryClass() {
      let type = this.getType(), subtype = this.getSubType(), template = document.querySelector('.particles-container [data-lm-blocktype="' + CSS.escape(type) + '"][data-lm-subtype="' + CSS.escape(subtype || "") + '"]');
      return template ? " particle-category-" + (template.getAttribute("data-lm-category") || "general") : "";
    }
    getLimits(parent) {
      if (!parent) {
        return false;
      }
      let parentBlock = parent.block[0], sibling = parentBlock.nextElementSibling || parentBlock.previousElementSibling || false;
      if (!sibling) {
        return [100, 100];
      }
      let siblingBlock = this.options.builder.get(sibling.getAttribute("data-lm-id")), sizes = {
        current: this.getParent().getSize(),
        sibling: siblingBlock.getSize()
      };
      return [5, sizes.current + sizes.sibling - 5];
    }
  };
  Particle.prototype.options = {
    type: "particle"
  };
  var particle_default = Particle;

  // platforms/common/application/lm/blocks/position.js
  var Particle2 = particle_default;
  var UID = 0;
  var Position = class extends Particle2 {
    constructor(options) {
      ++UID;
      super(options);
      this.setAttribute("title", this.getTitle());
      this.setAttribute("key", this.getKey());
      if (this.isNew()) {
        --UID;
      }
    }
    getTitle() {
      return String(this.options.title || "Position " + UID).trim();
    }
    getKey() {
      return this.getAttribute("key") || this.getTitle().trim().replace(/\s/g, "-").toLowerCase();
    }
    updateKey(key) {
      this.options.key = key || this.getKey();
      this.block.find(".font-small").text(this.getKey());
      return this;
    }
  };
  Position.prototype.options = {
    type: "position"
  };
  var position_default = Position;

  // platforms/common/application/lm/blocks/system.js
  var Particle3 = particle_default;
  var System = class extends Particle3 {
  };
  System.prototype.options = {
    type: "system",
    attributes: {}
  };
  var system_default = System;

  // platforms/common/application/lm/blocks/spacer.js
  var Particle4 = particle_default;
  var Spacer = class extends Particle4 {
  };
  Spacer.prototype.options = {
    type: "spacer",
    title: "Spacer",
    attributes: {}
  };
  var spacer_default = Spacer;

  // platforms/common/application/lm/blocks/div.js
  var Base7 = base_default;
  var getAjaxURL9 = get_ajax_url_default.config;
  var translate7 = translate_default;
  var Div = class extends Base7 {
    layout() {
      let settingsUri = getAjaxURL9(this.getPageId() + "/layout/div/" + this.getId());
      return '<div class="g-lm-div" data-lm-id="' + this.getId() + '" data-lm-blocktype="div" data-lm-nodrag><div class="g-lm-div-header"><span class="g-lm-div-title"><i class="fa fa-vector-square" aria-hidden="true"></i> ' + translate7("GENESIS_PLATFORM_JS_LM_DIV") + '</span><span class="g-lm-div-actions"><button type="button" data-lm-nodrag data-lm-div-addrow aria-label="' + translate7("GENESIS_PLATFORM_JS_LM_ADD_NESTED_ROW") + '"><i class="fa fa-plus" aria-hidden="true"></i></button><i class="fa fa-cog" data-lm-nodrag data-lm-settings="' + settingsUri + '" aria-label="' + translate7("GENESIS_PLATFORM_JS_LM_CONFIGURE_SETTINGS", "Div") + '"></i><button type="button" data-lm-nodrag data-lm-structure-menu aria-label="' + translate7("GENESIS_PLATFORM_JS_LM_MORE_ACTIONS") + '"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></button></span></div></div>';
    }
  };
  Div.prototype.options = {
    type: "div",
    subtype: "div",
    attributes: { tag: "div" }
  };
  var div_default = Div;

  // platforms/common/application/lm/blocks/index.js
  var blocks_default = {
    base: base_default,
    atom: atom_default,
    section: section_default,
    offcanvas: offcanvas_default,
    wrapper: wrapper_default,
    atoms: atoms_default,
    grid: grid_default,
    container: container_default,
    block: block_default,
    particle: particle_default,
    position: position_default,
    system: system_default,
    spacer: spacer_default,
    div: div_default
  };

  // platforms/common/application/lm/normalize-grid-sizes.js
  var normalizeGridSizes = (root, getBlock) => {
    if (!root || typeof getBlock !== "function") return;
    root.querySelectorAll('[data-lm-blocktype="grid"]').forEach((grid) => {
      const blocks = Array.from(grid.children).filter((child) => child.getAttribute("data-lm-blocktype") === "block").map((element) => getBlock(element.getAttribute("data-lm-id"))).filter((block) => block && typeof block.getSize === "function" && typeof block.setSize === "function");
      if (!blocks.length) return;
      const total = blocks.reduce((sum, block) => {
        const size3 = Number(block.getSize());
        return sum + (Number.isFinite(size3) ? size3 : 0);
      }, 0);
      let sizes;
      if (blocks.length === 1) {
        sizes = [100];
      } else if (total <= 0) {
        sizes = blocks.map(() => 100 / blocks.length);
      } else if (Math.abs(total - 100) > 0.05) {
        sizes = blocks.map((block) => block.getSize() / total * 100);
      } else {
        return;
      }
      let applied = 0;
      blocks.forEach((block, index) => {
        const size3 = index === blocks.length - 1 ? 100 - applied : Math.round(sizes[index] * 10) / 10;
        applied += size3;
        block.setSize(size3, true);
      });
    });
  };
  var normalize_grid_sizes_default = normalizeGridSizes;

  // platforms/common/application/lm/builder.js
  var EventEmitter4 = event_emitter_default;
  var Blocks = blocks_default;
  var ID2 = id_default;
  var normalizeGridSizes2 = normalize_grid_sizes_default;
  var DEBUG = false;
  var collectionSize = function(value) {
    if (!value) {
      return 0;
    }
    return Array.isArray(value) ? value.length : Object.keys(value).length;
  };
  var forEachCollection = function(collection, callback, context) {
    if (!collection) {
      return;
    }
    if (Array.isArray(collection) || typeof collection.length === "number") {
      Array.prototype.forEach.call(collection, callback, context);
      return;
    }
    Object.keys(collection).forEach(function(key) {
      callback.call(context, collection[key], key, collection);
    });
  };
  var fillMissing = function(target, source) {
    Object.keys(source || {}).forEach(function(key) {
      let sourceValue = source[key], targetValue = target[key];
      if (typeof targetValue === "undefined") {
        target[key] = sourceValue;
      } else if (targetValue && sourceValue && typeof targetValue === "object" && typeof sourceValue === "object" && !Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
        fillMissing(targetValue, sourceValue);
      }
    });
    return target;
  };
  var withoutChildren = function(value) {
    let output = {};
    Object.keys(value || {}).forEach(function(key) {
      if (key !== "children") {
        output[key] = value[key];
      }
    });
    return output;
  };
  var Builder = class extends EventEmitter4 {
    constructor(structure) {
      super();
      if (structure) {
        this.setStructure(structure);
      }
      this.map = {};
    }
    setStructure(structure) {
      try {
        this.structure = typeof structure === "object" ? structure : JSON.parse(structure);
      } catch (error) {
        console.error("Parsing error:", error);
      }
    }
    add(block) {
      let id2 = typeof block === "string" ? block : block.id;
      this.map[id2] = block;
      if (block && typeof block.isNew === "function") {
        block.isNew(false);
      }
    }
    remove(block) {
      let id2 = typeof block === "string" ? block : block.id;
      delete this.map[id2];
    }
    get(block) {
      let id2 = typeof block === "string" ? block : block.id;
      return Object.prototype.hasOwnProperty.call(this.map, id2) ? this.map[id2] : block;
    }
    load(data) {
      this.recursiveLoad(data);
      this.normalizeGridSizes();
      this.emit("loaded", data);
      return this;
    }
    normalizeGridSizes(root) {
      root = root || document.querySelector("[data-lm-root]");
      normalizeGridSizes2(root, this.get.bind(this));
      return this;
    }
    serialize(root, flat) {
      let serializedChildren = [];
      root = root ? root.nodeType ? root : root[0] : document.querySelector("[data-lm-root]");
      if (!root) {
        return;
      }
      let blocks = flat ? root.querySelectorAll("[data-lm-id]") : Array.from(root.children).filter(function(child) {
        return child.hasAttribute("data-lm-id");
      });
      forEachCollection(blocks, function(node) {
        let id2 = node.getAttribute("data-lm-id"), type = node.getAttribute("data-lm-blocktype"), subtype = node.getAttribute("data-lm-blocksubtype") || false, hasChildren = Array.from(node.children).filter(function(child) {
          return child.hasAttribute("data-lm-id");
        }), mapped = this.map[id2], children;
        if (flat) {
          children = hasChildren.length ? hasChildren.map(function(child) {
            return child.getAttribute("data-lm-id");
          }) : false;
        } else {
          children = hasChildren.length ? this.serialize(node) : [];
        }
        let serial = {
          id: id2,
          type,
          subtype,
          title: mapped ? mapped.getTitle() : "Untitled",
          attributes: mapped ? mapped.getAttributes() : {},
          inherit: mapped ? mapped.getInheritance() : {},
          children
        };
        if (flat) {
          let keyed = {};
          keyed[id2] = serial;
          serial = keyed;
        }
        serializedChildren.push(serial);
      }, this);
      return serializedChildren;
    }
    insert(key, value, parent) {
      let root = document.querySelector("[data-lm-root]");
      if (!root) {
        return;
      }
      if (!Blocks[value.type]) {
        console.error(value.type + " does not exist");
      }
      let settings = fillMissing({
        id: key,
        attributes: {},
        inherit: {},
        subtype: value.subtype || false,
        builder: this
      }, withoutChildren(value)), Element2 = new (Blocks[value.type] || Blocks.section)(settings);
      let block = Element2.block[0], target = parent ? document.querySelector('[data-lm-id="' + CSS.escape(parent) + '"]') : root;
      if (target) {
        target.appendChild(block);
      }
      if (Element2.getType() === "block") {
        Element2.setSize();
      }
      this.add(Element2);
      Element2.emit("rendered", Element2, parent ? this.map[parent] : null);
      return Element2;
    }
    reset(data) {
      this.map = {};
      this.setStructure(data || {});
      let root = document.querySelector("[data-lm-root]");
      if (root) {
        root.replaceChildren();
      }
      this.load();
    }
    cleanupLonely() {
      let ghosts = [], parent, children = document.querySelectorAll("[data-lm-root] > .g-section > .g-grid > .g-block .g-grid > .g-block, [data-lm-root] > .g-section > .g-grid > .g-block > .g-block");
      if (!children.length) {
        return;
      }
      children.forEach(function(child) {
        parent = null;
        let childParent = child.parentElement, isGrid = childParent && childParent.classList.contains("g-grid");
        if (isGrid && childParent.children.length > 1) {
          return;
        }
        if (isGrid) {
          let gridId = childParent.getAttribute("data-lm-id");
          if (gridId) {
            ghosts.push(gridId);
          }
          parent = childParent;
        }
        let childId = child.getAttribute("data-lm-id");
        if (childId) {
          ghosts.push(childId);
        }
        let removalTarget = parent || child;
        Array.from(child.children).forEach(function(grandchild) {
          removalTarget.parentNode.insertBefore(grandchild, removalTarget);
        });
        removalTarget.remove();
      });
      return ghosts;
    }
    recursiveLoad(data, callback, depth, parent) {
      data = data || this.structure;
      depth = depth || 0;
      parent = parent || false;
      callback = callback || this.insert;
      forEachCollection(data, function(value) {
        if (!value.id) {
          value.id = ID2({ builder: { map: this.map }, type: value.type, subtype: value.subtype });
        }
        if (DEBUG) {
          console.log(("    ".repeat(depth) + value.type).padEnd(35) + " (" + String(value.id).padEnd(36) + ") parent: " + parent);
        }
        this.emit("loading", callback.call(this, value.id, value, parent, depth));
        if (value.children && collectionSize(value.children)) {
          depth++;
          forEachCollection(value.children, function(childValue) {
            this.recursiveLoad([childValue], callback, depth, value.id);
          }, this);
        }
        this.get(value.id).emit("done", this.get(value.id));
        depth--;
      }, this);
    }
  };
  var builder_default = Builder;

  // platforms/common/application/utils/history-adapter.js
  var resolveElement = (element) => typeof element === "string" ? document.querySelector(element) : element;
  var History = {
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
        return void 0;
      },
      onDomLoad(callback) {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", callback, { once: true });
        } else {
          callback();
        }
      }
    }
  };
  var history_adapter_default = History;

  // platforms/common/application/utils/history.js
  var absoluteURL = (value) => new URL(value || window.location.href, window.location.href).href;
  var stateFrom = (data, title, url) => ({
    data: data && typeof data === "object" ? data : {},
    title: title || document.title,
    url: absoluteURL(url)
  });
  var currentState = stateFrom(window.history.state, document.title, window.location.href);
  var dispatchStateChange = () => {
    window.dispatchEvent(new CustomEvent("statechange", {
      detail: { state: currentState }
    }));
  };
  history_adapter_default.getState = () => ({
    data: currentState.data,
    title: currentState.title,
    url: currentState.url
  });
  history_adapter_default.getPageUrl = () => absoluteURL(window.location.href).replace(/#.*$/, "");
  history_adapter_default.pushState = (data, title, url) => {
    currentState = stateFrom(data, title, url);
    window.history.pushState(currentState.data, currentState.title, currentState.url);
    if (currentState.title) document.title = currentState.title;
    dispatchStateChange();
    return true;
  };
  history_adapter_default.replaceState = (data, title, url) => {
    currentState = stateFrom(data, title, url);
    window.history.replaceState(currentState.data, currentState.title, currentState.url);
    if (currentState.title) document.title = currentState.title;
    dispatchStateChange();
    return true;
  };
  history_adapter_default.back = () => window.history.back();
  history_adapter_default.forward = () => window.history.forward();
  history_adapter_default.go = (distance) => window.history.go(distance);
  window.addEventListener("popstate", (event) => {
    currentState = stateFrom(event.state, document.title, window.location.href);
    dispatchStateChange();
  });
  window.History = history_adapter_default;
  var history_default = history_adapter_default;

  // platforms/common/application/lm/history.js
  var cloneSnapshot = (value) => {
    if (value == null) return value;
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  };
  var isObject = (value) => value !== null && typeof value === "object";
  var snapshotsEqual = (left, right, seen = /* @__PURE__ */ new WeakMap()) => {
    if (left === right || Number.isNaN(left) && Number.isNaN(right)) return true;
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
    return leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && snapshotsEqual(left[key], right[key], seen));
  };
  var collectDifferences = (left, right, path = [], differences = []) => {
    if (snapshotsEqual(left, right)) return differences;
    if (isObject(left) && isObject(right) && left.constructor === right.constructor) {
      const keys2 = /* @__PURE__ */ new Set([...Object.keys(left), ...Object.keys(right)]);
      keys2.forEach((key) => {
        const currentPath = [...path, Array.isArray(left) ? Number(key) : key];
        const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
        const hasRight = Object.prototype.hasOwnProperty.call(right, key);
        if (!hasLeft) {
          differences.push({ kind: "N", path: currentPath, rhs: right[key] });
        } else if (!hasRight) {
          differences.push({ kind: "D", path: currentPath, lhs: left[key] });
        } else {
          collectDifferences(left[key], right[key], currentPath, differences);
        }
      });
      return differences;
    }
    differences.push({
      kind: "E",
      path: path.length ? path : void 0,
      lhs: left,
      rhs: right
    });
    return differences;
  };
  var diffSnapshots = (left, right) => {
    const differences = collectDifferences(left, right);
    return differences.length ? differences : void 0;
  };
  var History2 = class {
    constructor(session, preset) {
      this.index = 0;
      this.listeners = /* @__PURE__ */ new Map();
      this.setSession(session, preset);
    }
    on(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
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
      if (!this.index) return void 0;
      this.index--;
      const session = this.get();
      this.emit("undo", session, this.index);
      return session;
    }
    redo() {
      if (this.index === this.session.length - 1) return void 0;
      this.index++;
      const session = this.get();
      this.emit("redo", session, this.index);
      return session;
    }
    reset() {
      this.index = 0;
      const session = this.get();
      this.emit("reset", session, this.index);
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
      this.emit("push", session, this.index, sliced);
      return session;
    }
    get(index = this.index) {
      const session = this.session[index];
      return session ? cloneSnapshot(session) : false;
    }
    equals(session, compare2) {
      if (compare2 === void 0) {
        const current = this.get();
        compare2 = current ? current.data : void 0;
      }
      return snapshotsEqual(session, compare2);
    }
    diff(obj1, obj2) {
      if (!obj1 && !obj2 && this.session.length <= 1) return "Not enough sessions to diff";
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
    import() {
    }
    export() {
    }
  };
  var history_default2 = History2;

  // platforms/common/application/ui/drag.events.js
  var getSupportedEvent = function(events) {
    events = events.split(" ");
    let element = document.createElement("div"), event;
    let isSupported = false;
    for (let i = events.length - 1; i >= 0; i--) {
      event = "on" + events[i];
      isSupported = event in element;
      if (!isSupported) {
        element.setAttribute(event, "return;");
        isSupported = typeof element[event] === "function";
      }
      if (isSupported) {
        isSupported = events[i];
        break;
      }
    }
    element = null;
    return isSupported;
  };
  var getSupportedEvents = function(events) {
    events = events.split(" ");
    let isSupported = false, supported = [];
    for (let i = events.length - 1; i >= 0; i--) {
      isSupported = getSupportedEvent(events[i]);
      if (isSupported) {
        supported.push(isSupported);
      }
    }
    return supported;
  };
  var EVENT = {
    START: getSupportedEvent("mousedown touchstart pointerdown"),
    MOVE: getSupportedEvent("mousemove touchmove pointermove"),
    STOP: getSupportedEvent("mouseup touchend pointerup")
  };
  var EVENTS = {
    START: getSupportedEvents("mousedown touchstart pointerdown"),
    MOVE: getSupportedEvents("mousemove touchmove pointermove"),
    STOP: getSupportedEvents("mouseup touchend pointerup")
  };
  var drag_events_default = {
    EVENT,
    EVENTS
  };

  // platforms/common/application/ui/drag.drop.js
  var EventEmitter5 = event_emitter_default;
  var DragEvents = drag_events_default;
  var dom7 = dom_effects_default;
  var isIE = navigator.appName === "Microsoft Internet Explorer";
  var DragDrop = class extends EventEmitter5 {
    constructor(container2, options) {
      super();
      this.container = dom7(container2);
      if (!this.container) {
        return;
      }
      this.options = Object.assign({
        delegate: null,
        droppables: false,
        catchClick: false
      }, options || {});
      this.DRAG_EVENTS = DragEvents;
      this.moveHandler = this.move.bind(this);
      this.deferStopHandler = this.deferStop.bind(this);
      this.element = null;
      this.origin = {
        x: 0,
        y: 0,
        transform: null,
        offset: {
          x: 0,
          y: 0
        }
      };
      this.matched = false;
      this.lastMatched = false;
      this.lastOvered = null;
      this.attach();
    }
    attach() {
      if (this.attached) {
        return this;
      }
      this.startListeners = [];
      this.DRAG_EVENTS.EVENTS.START.forEach(function(eventName) {
        this.container.forEach(function(node) {
          let listener = (function(event) {
            let target = dom7(event.target || event.srcElement), match = target.matches(this.options.delegate) ? target : target.parent(this.options.delegate);
            if (match) {
              return this.start(event, match);
            }
          }).bind(this);
          node.addEventListener(eventName, listener, false);
          this.startListeners.push({ node, event: eventName, listener });
        }, this);
      }, this);
      this.attached = true;
      return this;
    }
    detach() {
      if (!this.attached) {
        return this;
      }
      (this.startListeners || []).forEach(function(binding) {
        binding.node.removeEventListener(binding.event, binding.listener, false);
      });
      this.detachDragEvents();
      this.startListeners = [];
      this.attached = false;
      return this;
    }
    start(event, element) {
      clearTimeout(this.scrollInterval);
      this.detachDragEvents();
      if (element.LMTooltip) {
        element.LMTooltip.remove();
      }
      dom7("html").attribute("style", "height: 100% !important");
      this.scrollHeight = document.body.scrollHeight;
      let target = dom7(event.target);
      if (!element.parent("[data-lm-root]") && element.hasClass("g-block") && (!target.matches(".submenu-reorder") && !target.parent(".submenu-reorder"))) {
        return true;
      }
      if (event.which && event.which !== 1 || dom7(event.target).matches(this.options.exclude)) {
        return true;
      }
      if (event.__genesisDragStarted) {
        return true;
      }
      event.__genesisDragStarted = true;
      this.element = dom7(element);
      this.original = this.element;
      this.matched = false;
      if (this.options.catchClick) {
        this.moved = false;
      }
      if (target.matches(".submenu-reorder") || target.parent(".submenu-reorder")) {
        this.element = target.parent("[data-mm-id]");
      }
      this.emit("dragdrop:beforestart", event, this.element);
      if (isIE) {
        this.element.style({
          "-ms-touch-action": "none",
          "touch-action": "none"
        });
      }
      event.preventDefault();
      this.origin = {
        x: event.changedTouches ? event.changedTouches[0].pageX : event.pageX,
        y: event.changedTouches ? event.changedTouches[0].pageY : event.pageY,
        transform: this.element.compute("transform")
      };
      let clientRect = this.element[0].getBoundingClientRect();
      this.origin.offset = {
        clientRect,
        scroll: {
          x: window.scrollX,
          y: window.scrollY
        },
        x: this.origin.x - clientRect.right,
        y: clientRect.top - this.origin.y
      };
      if (this.element.data("lm-blocktype") === "grid" && Math.abs(this.origin.offset.x) < clientRect.width) {
        return false;
      }
      let offset = Math.abs(this.origin.offset.x), columns = this.element.parent().data("lm-blocktype") === "grid" && this.element.parent().parent().data("lm-root") || this.element.parent().parent().data("lm-blocktype") == "container" && (this.element.parent().parent().parent().data("lm-root") || this.element.parent().parent().parent().data("lm-blocktype") == "wrapper");
      if (this.element.data("lm-blocktype") == "grid" && (this.element.parent().data("lm-blocktype") === "container" && this.element.parent().parent().parent().data("lm-root")) || this.element.parent().data("lm-blocktype") === "section" && this.element.parent().parent().parent().data("lm-root")) {
        columns = false;
      }
      if (offset < 6 && this.element.parent().find(":last-child") !== this.element || columns && offset > 3 && offset < 10) {
        if (this.element.parent('[data-lm-blocktype="atoms"]')) {
          return false;
        }
        this.emit("dragdrop:resize", event, this.element, (this.element.parent("[data-mm-id]") || this.element).siblings(":not(.placeholder)"), this.origin.offset.x);
        return false;
      }
      if (columns || element.hasClass("submenu-column") && (!target.matches(".submenu-reorder") && !target.parent(".submenu-reorder"))) {
        return true;
      }
      this.element.style({
        "pointer-events": "none",
        zIndex: 100
      });
      this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
        document.body.addEventListener(eventName, this.moveHandler, { passive: false });
      }, this);
      this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
        document.body.addEventListener(eventName, this.deferStopHandler, { passive: false });
      }, this);
      this.emit("dragdrop:start", event, this.element);
      return this.element;
    }
    deferStop(event) {
      this.detachDragEvents();
      setTimeout((function() {
        if (this.element) {
          this.stop(event);
        }
      }).bind(this), 0);
    }
    stop(event) {
      clearTimeout(this.scrollInterval);
      dom7("html").attribute("style", null);
      if (!this.moved && this.options.catchClick) {
        this.element.style({ transform: this.origin.transform || "translate(0, 0)" });
        this.emit("dragdrop:stop", event, this.matched, this.element);
        this._removeStyleAttribute(this.element);
        this.emit("dragdrop:stop:animation", this.element);
        this.emit("dragdrop:click", event, this.element);
        this.detachDragEvents();
        this.element = null;
        return;
      }
      let settings = { duration: "250ms" };
      if (this.removeElement) {
        this.detachDragEvents();
        return this.emit("dragdrop:stop:erase", event, this.element);
      }
      if (this.element) {
        this.emit("dragdrop:stop", event, this.matched, this.element);
        if (this.matched) {
          this.element.style({
            opacity: 0,
            transform: "translate(0, 0)"
          }).removeClass("active");
        }
        if (!this.matched) {
          settings.callback = (function(element) {
            this._removeStyleAttribute(element);
            setTimeout((function() {
              this.emit("dragdrop:stop:animation", element);
            }).bind(this), 1);
          }).bind(this, this.element);
          this.element.animate({
            transform: this.origin.transform || "translate(0, 0)",
            opacity: 1
          }, settings);
        } else {
          this.element.style({
            transform: this.origin.transform || "translate(0, 0)",
            opacity: 1
          });
          this._removeStyleAttribute(this.element);
          this.emit("dragdrop:stop:animation", this.element);
        }
      }
      this.detachDragEvents();
      this.element = null;
    }
    detachDragEvents() {
      this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
        document.body.removeEventListener(eventName, this.moveHandler, { passive: false });
      }, this);
      this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
        document.body.removeEventListener(eventName, this.deferStopHandler, { passive: false });
      }, this);
    }
    bound(method) {
      if (method === "move") {
        return this.moveHandler;
      }
      if (method === "deferStop") {
        return this.deferStopHandler;
      }
      return this[method].bind(this);
    }
    move(event) {
      if (this.options.catchClick) {
        let didItMove = {
          x: event.changedTouches ? event.changedTouches[0].pageX : event.pageX,
          y: event.changedTouches ? event.changedTouches[0].pageY : event.pageY
        };
        if (Math.abs(didItMove.x - this.origin.x) <= 3 && Math.abs(didItMove.y - this.origin.y) <= 3) {
          return;
        }
        if (!this.moved) {
          this.element.style({ opacity: 0.5 });
          this.emit("dragdrop:move:once", this.element);
        }
        this.moved = true;
      }
      let clientX = event.clientX || event.touches && event.touches[0].clientX || 0, clientY = event.clientY || event.touches && event.touches[0].clientY || 0, overing = document.elementFromPoint(clientX, clientY), isGrid = this.element.data("lm-blocktype") === "grid";
      let scrollHeight = this.scrollHeight, Height = document.body.clientHeight, Scroll = window.pageYOffset;
      clearTimeout(this.scrollInterval);
      if (!overing) {
        return;
      }
      if (!dom7(overing).matches("#trash") && !dom7(overing).parent("#trash")) {
        let st, sl, trash = dom7("[data-genesis-container] #trash");
        if (clientY + 50 >= Height && Scroll + Height < scrollHeight) {
          this.scrollInterval = setInterval(function() {
            sl = (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0);
            st = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
            window.scrollTo(sl, Math.min(scrollHeight, st + 4));
          }, 8);
        } else if (clientY - 50 <= (trash ? trash[0].offsetHeight : 0) && scrollHeight > 0) {
          this.scrollInterval = setInterval(function() {
            sl = (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0);
            st = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
            window.scrollTo(sl, Math.max(0, st - 4));
          }, 8);
        }
      }
      if (isGrid) {
        overing = document.elementFromPoint(clientX + 30, clientY);
      }
      if (!overing) {
        return false;
      }
      this.matched = dom7(overing).matches(this.options.droppables) ? overing : (dom7(overing).parent(this.options.droppables) || [false])[0];
      this.isPlaceHolder = dom7(overing).matches("[data-lm-placeholder]") ? true : dom7(overing).parent("[data-lm-placeholder]") ? true : false;
      let deltaX = this.lastX - clientX, deltaY = this.lastY - clientY, direction = Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0 && "left" || Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0 && "right" || Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0 && "up" || "down";
      deltaX = (event.changedTouches ? event.changedTouches[0].pageX : event.pageX) - this.origin.x;
      deltaY = (event.changedTouches ? event.changedTouches[0].pageY : event.pageY) - this.origin.y;
      let isNew = this.element.parent(".particles-container");
      if (isNew) {
        deltaY += this.origin.offset.scroll.y - window.scrollY;
      }
      this.direction = direction;
      this.element.style({ transform: "translate3d(" + deltaX + "px, " + deltaY + "px, 0)" });
      if (!this.isPlaceHolder) {
        if (this.lastMatched && this.matched !== this.lastMatched) {
          this.emit("dragdrop:leave", event, this.lastMatched, this.element);
          this.lastMatched = false;
        }
        if (this.matched && this.matched !== this.lastMatched && overing !== this.lastOvered) {
          this.emit("dragdrop:enter", event, this.matched, this.element);
          this.lastMatched = this.matched;
        }
        if (this.matched && this.lastMatched) {
          let rect = this.matched.getBoundingClientRect();
          let location = {
            x: Math.abs(clientX - rect.left) < rect.width / 2 && "before" || Math.abs(clientX - rect.left) >= rect.width - rect.width / 2 && "after" || "other",
            y: Math.abs(clientY - rect.top) < rect.height / 2 && "above" || Math.abs(clientY - rect.top) >= rect.height / 2 && "below" || "other"
          };
          this.emit("dragdrop:location", event, location, this.matched, this.element);
        } else {
          this.emit("dragdrop:nolocation", event);
        }
      }
      this.lastOvered = overing;
      this.lastX = clientX;
      this.lastY = clientY;
      this.emit("dragdrop:move", event, this.element);
    }
    _removeStyleAttribute(element) {
      element = dom7(element || this.element);
      if (element.data("mm-id")) {
        return;
      }
      element.attribute("style", null);
    }
  };
  var drag_drop_default = DragDrop;

  // platforms/common/application/ui/eraser.js
  var toPixels = (value) => typeof value === "number" ? "".concat(value, "px") : value;
  var applyStyles = (element, styles) => {
    Object.keys(styles).forEach((property) => {
      element.style[property] = toPixels(styles[property]);
    });
  };
  var animateStyles = (element, styles, fast, easing = "ease") => {
    const finalStyles = Object.keys(styles).reduce((result, property) => {
      result[property] = toPixels(styles[property]);
      return result;
    }, {});
    if (fast || typeof element.animate !== "function") {
      applyStyles(element, finalStyles);
      return;
    }
    const animation = element.animate([{}, finalStyles], {
      duration: 150,
      easing,
      fill: "forwards"
    });
    animation.addEventListener("finish", () => {
      applyStyles(element, finalStyles);
      animation.cancel();
    }, { once: true });
  };
  var Eraser = class {
    constructor(element, options = {}) {
      this.options = { ...options };
      this.setElement(element);
      if (this.element) this.hide(true);
    }
    setElement(element) {
      const next = typeof element === "string" ? document.querySelector(element) : element && element.nodeType ? element : element && element[0];
      if (next !== this.element) {
        this.element = next || null;
        this.top = void 0;
        this.left = void 0;
      }
      return this;
    }
    setTop() {
      if (this.top !== void 0 || !this.element) return;
      this.top = Number.parseInt(getComputedStyle(this.element).top, 10) || 0;
      const container2 = document.querySelector("[data-genesis-container]");
      this.left = container2 ? container2.getBoundingClientRect().left : 0;
      if (window.GENESIS_PLATFORM === "grav") this.left = 0;
    }
    show(fast) {
      if (!this.element) return;
      this.setTop();
      this.out();
      animateStyles(this.element, { top: this.top, left: this.left }, fast);
    }
    hide(fast) {
      if (!this.element) return;
      this.setTop();
      this.element.style.display = "block";
      this.out();
      animateStyles(this.element, { top: -this.element.offsetHeight }, fast);
    }
    over() {
      const zone = this.element && this.element.querySelector(".trash-zone");
      if (zone) animateStyles(zone, { transform: "scale(1.2)" }, false, "cubic-bezier(0.5,0,0.5,1)");
    }
    out() {
      const zone = this.element && this.element.querySelector(".trash-zone");
      if (zone) animateStyles(zone, { transform: "scale(1)" }, false, "cubic-bezier(0.5,0,0.5,1)");
    }
  };
  var eraser_default = Eraser;

  // platforms/common/application/lm/drag.resizer.js
  var DragEvents2 = drag_events_default;
  var asElement3 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var asElements = function(elements) {
    if (!elements) {
      return [];
    }
    if (elements.nodeType) {
      return [elements];
    }
    return Array.from(elements).map(asElement3).filter(Boolean);
  };
  var clamp = function(value, min, max) {
    return Math.min(max, Math.max(min, value));
  };
  var mapRange = function(value, min1, max1, min2, max2) {
    return min2 + (value - min1) / (max1 - min1) * (max2 - min2);
  };
  var precision3 = function(value, decimals) {
    let multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  };
  var Resizer = class {
    constructor(container2, options) {
      this.DRAG_EVENTS = DragEvents2;
      this.options = Object.assign({ minSize: 5 }, options || {});
      this.history = this.options.history || {};
      this.builder = this.options.builder || {};
      this.moveHandler = this.move.bind(this);
      this.stopHandler = this.stop.bind(this);
      this.listenerOptions = { passive: false };
      this.origin = {
        x: 0,
        y: 0,
        transform: null,
        offset: {
          x: 0,
          y: 0
        }
      };
    }
    getBlock(element) {
      element = typeof element === "string" ? element : asElement3(element);
      let id2 = typeof element === "string" ? element : element && element.getAttribute("data-lm-id") || "";
      return this.builder.map ? this.builder.map[id2] : void 0;
    }
    getAttribute(element, prop) {
      let block = this.getBlock(element);
      return block ? block.getAttribute(prop) : void 0;
    }
    getSize(element) {
      return this.getAttribute(element, "size");
    }
    start(event, element, siblings2, offset) {
      if (event && event.type.match(/^touch/i)) {
        event.preventDefault();
      }
      element = asElement3(element);
      siblings2 = asElements(siblings2);
      if (!element) {
        return;
      }
      window.Genesis.tips.hide(element);
      if (event.which && event.which !== 1) {
        return true;
      }
      event.preventDefault();
      this.element = element;
      this.siblings = {
        occupied: 0,
        elements: siblings2,
        next: this.element.nextElementSibling,
        prevs: [],
        sizeBefore: 0
      };
      let previous = this.element.previousElementSibling;
      while (previous) {
        this.siblings.prevs.unshift(previous);
        previous = previous.previousElementSibling;
      }
      if (this.siblings.elements.length > 1) {
        this.siblings.occupied -= this.getSize(this.siblings.next);
        this.siblings.elements.forEach(function(sibling) {
          this.siblings.occupied += this.getSize(sibling);
        }, this);
      }
      this.siblings.prevs.forEach(function(sibling) {
        this.siblings.sizeBefore += this.getSize(sibling);
      }, this);
      this.origin = {
        size: this.getSize(this.element),
        maxSize: this.getSize(this.element) + this.getSize(this.siblings.next),
        x: event.changedTouches ? event.changedTouches[0].pageX : event.pageX + 6,
        y: event.changedTouches ? event.changedTouches[0].pageY : event.pageY
      };
      let parent = this.element.parentElement, clientRect = this.element.getBoundingClientRect(), parentRect = parent.getBoundingClientRect();
      this.origin.offset = {
        clientRect,
        parentRect: { left: parentRect.left, right: parentRect.right },
        x: this.origin.x - clientRect.right,
        y: clientRect.top - this.origin.y,
        down: offset || 0
      };
      let blocks = Array.from(parent.children).filter(function(child) {
        return child.hasAttribute("data-lm-id");
      });
      if (blocks.length) {
        this.origin.offset.parentRect.left = blocks[0].getBoundingClientRect().left;
        this.origin.offset.parentRect.right = blocks[blocks.length - 1].getBoundingClientRect().right;
      }
      this.detachDocumentEvents();
      this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
        document.addEventListener(eventName, this.moveHandler, this.listenerOptions);
      }, this);
      this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
        document.addEventListener(eventName, this.stopHandler, this.listenerOptions);
      }, this);
    }
    move(event) {
      if (event && event.type.match(/^touch/i)) {
        event.preventDefault();
      }
      let point = event.touches && event.touches.length ? event.touches[0] : event, clientX = point.clientX || 0, clientY = point.clientY || 0, parentRect = this.origin.offset.parentRect;
      let deltaX = (this.lastX || clientX) - clientX, deltaY = (this.lastY || clientY) - clientY;
      this.direction = Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0 && "left" || Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0 && "right" || Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0 && "up" || "down";
      let size3, diff = 100 - this.siblings.occupied, value = clientX + (!this.siblings.prevs.length ? this.origin.offset.x - this.origin.offset.down : this.siblings.prevs.length), normalized = clamp(value, parentRect.left, parentRect.right);
      size3 = mapRange(normalized, parentRect.left, parentRect.right, 0, 100);
      size3 = size3 - this.siblings.sizeBefore;
      size3 = precision3(clamp(size3, this.options.minSize, this.origin.maxSize - this.options.minSize), 0);
      diff = precision3(diff - size3, 0);
      this.getBlock(this.element).setSize(size3, true);
      this.getBlock(this.siblings.next).setSize(diff, true);
      let siblings2 = Array.from(this.element.parentElement.children).filter(function(sibling) {
        return sibling !== this.element && sibling.hasAttribute("data-lm-id");
      }, this), amount = siblings2.length + 1;
      if (amount == 3 || amount == 6 || amount == 7 || amount == 8 || amount == 9 || amount == 11 || amount == 12) {
        let total = 0, blocks;
        blocks = siblings2.concat(this.element);
        blocks.forEach(function(block, index) {
          block = this.getBlock(block);
          if (!block) {
            return;
          }
          size3 = block.getSize();
          if (size3 % 1) {
            size3 = precision3(100 / amount, 0);
            block.setSize(size3, true);
          }
          total += size3;
          if (blocks.length == index + 1 && total != 100) {
            diff = 100 - total;
            block.setSize(size3 + diff, true);
          }
        }, this);
      }
      this.lastX = clientX;
      this.lastY = clientY;
    }
    stop(event) {
      if (event && event.type.match(/^touch/i)) {
        event.preventDefault();
      }
      this.detachDocumentEvents();
      if (event.target instanceof Element && event.target.matches("[data-lm-back], [data-lm-forward]")) {
        return;
      }
      if (this.origin.size !== this.getSize(this.element)) {
        this.history.push(this.builder.serialize(), this.history.get().preset);
      }
    }
    detachDocumentEvents() {
      this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
        document.removeEventListener(eventName, this.moveHandler, this.listenerOptions);
      }, this);
      this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
        document.removeEventListener(eventName, this.stopHandler, this.listenerOptions);
      }, this);
    }
    evenResize(elements, animated) {
      let total = elements.length, size3 = precision3(100 / total, 4), block;
      if (typeof animated === "undefined") {
        animated = true;
      }
      asElements(elements).forEach(function(element) {
        block = this.getBlock(element);
        if (block && block.hasAttribute("size") && typeof block.getSize === "function") {
          block[animated ? "setAnimatedSize" : "setSize"](size3, size3 !== block.getSize());
        } else {
          if (!element) {
            return;
          }
          let flex = "0 1 " + size3 + "%";
          if (animated && typeof element.animate === "function") {
            let animation = element.animate([{ flex: getComputedStyle(element).flex }, { flex }], {
              duration: 250,
              easing: "ease"
            });
            animation.addEventListener("finish", function() {
              element.style.flex = flex;
            }, { once: true });
          } else {
            element.style.flex = flex;
          }
        }
      }, this);
    }
  };
  var drag_resizer_default = Resizer;

  // platforms/common/application/utils/deep-equals.js
  var deepEquals = function(first, second) {
    if (Object.is(first, second)) {
      return true;
    }
    if (typeof first !== typeof second || first === null || second === null) {
      return false;
    }
    if (typeof first !== "object") {
      return false;
    }
    if (Array.isArray(first) || Array.isArray(second)) {
      if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length) {
        return false;
      }
      return first.every(function(value, index) {
        return deepEquals(value, second[index]);
      });
    }
    let firstKeys = Object.keys(first), secondKeys = Object.keys(second);
    if (firstKeys.length !== secondKeys.length) {
      return false;
    }
    return firstKeys.every(function(key) {
      return Object.prototype.hasOwnProperty.call(second, key) && deepEquals(first[key], second[key]);
    });
  };
  var deep_equals_default = deepEquals;

  // platforms/common/application/lm/layoutmanager.js
  var EventEmitter6 = event_emitter_default;
  var dom8 = dom_effects_default;
  var zen4 = createElement;
  var Blocks2 = blocks_default;
  var DragDrop2 = drag_drop_default;
  var Eraser2 = eraser_default;
  var flags = flags_state_default;
  var Resizer2 = drag_resizer_default;
  var deepEquals2 = deep_equals_default;
  var get = function(object, key) {
    return object ? object[key] : void 0;
  };
  var keys = function(object) {
    return Object.keys(object || {});
  };
  var precision4 = function(value, decimals) {
    let multiplier = Math.pow(10, decimals);
    return Math.round(Number(value) * multiplier) / multiplier;
  };
  var find = function(collection, callback) {
    return Array.prototype.find.call(collection || [], callback);
  };
  var contains = function(collection, value) {
    return Array.prototype.indexOf.call(collection || [], value) !== -1;
  };
  var forEach2 = function(collection, callback, context) {
    if (Array.isArray(collection) || collection && typeof collection.length === "number") {
      Array.prototype.forEach.call(collection, callback, context);
    } else {
      Object.keys(collection || {}).forEach(function(key) {
        callback.call(context, collection[key], key, collection);
      });
    }
  };
  var singles = {
    disable: function() {
      let grids = dom8('[data-lm-root] [data-lm-blocktype="grid"]');
      if (grids) {
        grids.removeClass("no-hover");
      }
    },
    enable: function() {
      let grids = dom8('[data-lm-root] [data-lm-blocktype="grid"]');
      if (grids) {
        grids.addClass("no-hover");
      }
    },
    cleanup: function(builder2, dropLast, start) {
      let emptyGrids = start ? start.search("> .g-grid:empty") : dom8('[data-lm-blocktype="section"] > .g-grid:empty, [data-lm-blocktype="container"] > .g-grid:empty, [data-lm-blocktype="offcanvas"] > .g-grid:empty');
      if (emptyGrids) {
        emptyGrids.forEach(function(grid) {
          grid = dom8(grid);
          if (grid.nextSibling("[data-lm-id]") || dropLast) {
            builder2.remove(grid.data("lm-id"));
            grid.remove();
          }
        });
      }
    }
  };
  var LayoutManagerDefinition = {
    options: {},
    initialize: function(element, options) {
      this.setOptions(options);
      this.refElement = element;
      if (!element || !dom8(element)) {
        return;
      }
      this.init(element);
    },
    init: function() {
      if (this.dragdrop) {
        this.dragdrop.detach();
      }
      this.dragdrop = new DragDrop2(this.refElement, this.options);
      this.resizer = new Resizer2(this.refElement, this.options);
      this.eraser = new Eraser2("[data-lm-eraseblock]", this.options);
      this.dragdrop.on("dragdrop:start", this.bound("start")).on("dragdrop:location", this.bound("location")).on("dragdrop:nolocation", this.bound("nolocation")).on("dragdrop:resize", this.bound("resize")).on("dragdrop:stop", this.bound("stop")).on("dragdrop:stop:animation", this.bound("stopAnimation"));
      this.builder = this.options.builder;
      this.history = this.options.history;
      this.savestate = this.options.savestate || null;
      singles.disable();
    },
    refresh: function() {
      if (!this.refElement || !dom8(this.refElement)) {
        return;
      }
      this.init();
    },
    singles: function(mode, builder2, dropLast, start) {
      singles[mode](builder2, dropLast, start);
    },
    clear: function(parent, options) {
      let type, child, filter = !parent ? [] : (parent.search("[data-lm-id]") || []).map(function(element) {
        return dom8(element).data("lm-id");
      });
      options = options || { save: true, dropLastGrid: false, emptyInherits: false };
      forEach2(this.builder.map, function(obj, id2) {
        if (filter.length && !contains(filter, id2)) {
          return;
        }
        if (!options.emptyInherits && obj.block.parent(".g-inheriting")) {
          return;
        }
        type = obj.getType();
        child = obj.block.find("> [data-lm-id]");
        if (child) {
          child = child.data("lm-blocktype");
        }
        if (contains(["particle", "spacer", "position", "widget", "system", "block"], type) && (type == "block" && (child && (child !== "section" && child !== "container")))) {
          this.builder.remove(id2);
          obj.block.remove();
        } else if (options.emptyInherits && (type == "section" || type == "offcanvas" || type == "container")) {
          if (obj.hasInheritance) {
            obj.inherit = {};
            obj.disableInheritance();
          }
        }
      }, this);
      this.singles("cleanup", this.builder, options.dropLastGrid, parent);
      if (options.save) {
        this.history.push(this.builder.serialize(), this.history.get().preset);
      }
    },
    updatePendingChanges: function() {
      let saveData = this.savestate.getData(), serialData = this.builder.serialize(null, true), different = false, equals = deepEquals2(saveData, serialData), save = dom8('[data-save="Layout"]'), icon = save.find("i"), indicator12 = save.find(".changes-indicator");
      if (equals && indicator12) {
        save.hideIndicator();
      }
      if (!equals && !indicator12) {
        save.showIndicator("changes-indicator far fa-fw fa-circle");
      }
      flags.set("pending", !equals);
      let saved, current, id2;
      serialData.forEach(function(block) {
        id2 = keys(block)[0];
        saved = find(saveData, function(data) {
          return data[id2];
        });
        current = find(serialData, function(data) {
          return data[id2];
        });
        different = !deepEquals2(saved, current);
        id2 = this.builder.get(id2);
        if (id2) {
          id2.emit("changed", different);
        }
      }, this);
    },
    start: function(event, element) {
      let root = dom8("[data-lm-root]"), size3 = dom8(element).position(), coords = dom8(element)[0].getBoundingClientRect();
      let stalePlaceholders = root.search(".original-placeholder");
      if (stalePlaceholders) {
        stalePlaceholders.remove();
      }
      this.block = null;
      this.mode = root.data("lm-root") || "page";
      root.addClass("moving");
      let type = dom8(element).data("lm-blocktype"), clone3 = element[0].cloneNode(true);
      if (!this.placeholder) {
        this.placeholder = zen4("div.block.placeholder[data-lm-placeholder]");
      }
      this.placeholder.style({ display: "none" });
      clone3 = dom8(clone3);
      this.original = clone3.after(element).style({
        display: clone3.hasClass("g-grid") ? "flex" : "block",
        opacity: 0.5
      }).addClass("original-placeholder").data("lm-dropzone", null);
      if (type === "grid") {
        this.original.style({ display: "flex" });
      }
      this.originalType = type;
      this.block = get(this.builder.map, element.data("lm-id") || "") || new Blocks2[type]({
        builder: this.builder,
        subtype: element.data("lm-subtype"),
        title: element.text()
      });
      if (!this.block.isNew()) {
        this.original.style({
          visibility: "visible",
          opacity: 1,
          pointerEvents: "none",
          background: "repeating-linear-gradient(135deg, #f4f4f4, #f4f4f4 10px, #e9e9e9 10px, #e9e9e9 20px)",
          boxShadow: "inset 0 0 0 2px #c8c8c8"
        });
        let placeholderContents = this.original.search("*");
        if (placeholderContents) {
          placeholderContents.style({ visibility: "hidden" });
        }
        element.style({
          position: "fixed",
          zIndex: 2500,
          opacity: 0.75,
          margin: 0,
          width: Math.ceil(size3.width),
          height: Math.ceil(size3.height),
          left: coords.left,
          top: coords.top,
          willChange: "transform, opacity",
          backfaceVisibility: "hidden"
        }).find("[data-lm-blocktype]");
        if (this.block.getType() === "grid") {
          let siblings2 = this.block.block.siblings(":not(.original-placeholder):not(.section-header):not(.g-inherit):not(:empty)");
          if (siblings2) {
            siblings2.search("[data-lm-id]").style({ "pointer-events": "none" });
          }
        }
        this.placeholder.before(element);
      } else {
        let position = element.position();
        this.original.style({
          position: "fixed",
          opacity: 0.75,
          willChange: "transform, opacity",
          backfaceVisibility: "hidden"
        }).style({
          left: coords.left,
          top: coords.top,
          width: position.width,
          height: position.height
        });
        this.element = this.dragdrop.element;
        this.dragdrop.element = this.original;
      }
      let blocks;
      if (type === "grid" && (blocks = root.search('[data-lm-dropzone]:not([data-lm-blocktype="grid"])'))) {
        blocks.style({ "pointer-events": "none" });
      }
      singles.enable();
    },
    location: function(event, location, target) {
      target = dom8(target);
      (!this.block.isNew() ? this.original : this.element).style({ transform: "translate(0, 0)" });
      if (!this.placeholder) {
        this.placeholder = zen4("div.block.placeholder[data-lm-placeholder]").style({ display: "none" });
      }
      let position, dataType = target.data("lm-blocktype"), originalType = this.block.getType();
      if (!dataType && target.data("lm-root")) {
        dataType = "root";
      }
      if (this.mode !== "page" && dataType === "section") {
        return;
      }
      if (dataType === "grid" && (target.parent().data("lm-root") || target.parent().data("lm-blocktype") === "container" && target.parent().parent().data("lm-root"))) {
        return;
      }
      let exclude = ':not(.placeholder):not([data-lm-id="' + this.original.data("lm-id") + '"])', adjacents = {
        before: this.original.previousSiblings(exclude),
        after: this.original.nextSiblings(exclude)
      };
      if (adjacents.before) {
        adjacents.before = dom8(adjacents.before[0]);
      }
      if (adjacents.after) {
        adjacents.after = dom8(adjacents.after[0]);
      }
      if (dataType === "block" && (adjacents.before === target && location.x === "after" || adjacents.after === target && location.x === "before")) {
        return;
      }
      if (dataType === "grid" && (adjacents.before === target && location.y === "below" || adjacents.after === target && location.y === "above")) {
        return;
      }
      let nonVisible = target.parent('[data-lm-blocktype="atoms"]'), child = this.block.block.find("[data-lm-id]");
      if ((child ? child.data("lm-blocktype") : originalType) == "atom") {
        if (!nonVisible) {
          return;
        }
      } else {
        if (nonVisible) {
          return;
        }
      }
      let grid, block, method;
      switch (dataType) {
        case "root":
        case "section":
          break;
        case "grid":
          let gridBlocks = Array.from(target[0].children).filter(function(child2) {
            return child2.getAttribute("data-lm-blocktype") === "block";
          });
          let presetGrid = target.data("lm-preset-grid") === "bootstrap" || gridBlocks.some(function(child2) {
            let mapped = get(this.builder.map, child2.getAttribute("data-lm-id") || "");
            return mapped && mapped.getAttribute("columns.xs");
          }, this);
          let empty = !gridBlocks.length;
          if (originalType !== "grid" && presetGrid) {
            this.placeholder.remove();
            this.dragdrop.matched = false;
            return;
          }
          if (originalType !== "grid" && !empty) {
            this.placeholder.remove();
            this.dragdrop.matched = false;
            return;
          }
          if (empty) {
            if (originalType === "grid") {
              this.placeholder.before(target);
            } else {
              this.placeholder.bottom(target);
            }
          } else {
            method = location.y === "above" ? "before" : "after";
            this.placeholder[method](target);
          }
          break;
        case "block":
          let hasDirectContent = target[0].querySelector(":scope > [data-lm-id]:not([data-lm-placeholder]):not(.original-placeholder)");
          let targetBlock = get(this.builder.map, target.data("lm-id") || "");
          let isPresetColumn = targetBlock && targetBlock.getAttribute("columns.xs");
          let isNewContent = this.block.isNew() && originalType !== "block" && originalType !== "grid";
          let isMovableContent = originalType !== "block" && originalType !== "grid";
          let fillsPresetColumn = isMovableContent && isPresetColumn && !hasDirectContent;
          if (fillsPresetColumn) {
            this.placeholder.bottom(target);
          } else if (isMovableContent && isPresetColumn && hasDirectContent) {
            this.placeholder.remove();
            this.dragdrop.matched = false;
            return;
          } else {
            method = location.y === "above" ? "top" : "bottom";
            position = location.x === "other" ? method : location.x;
            this.placeholder[position](target);
          }
          break;
      }
      this.placeholder.removeClass("in-between").removeClass("in-between-grids").removeClass("in-between-grids-first").removeClass("in-between-grids-last");
      this.placeholder.style({ display: "block" })[dataType !== "block" ? "removeClass" : "addClass"]("in-between");
      if (originalType === "grid" && dataType === "grid") {
        let next = this.placeholder.nextSibling(), previous = this.placeholder.previousSibling();
        this.placeholder.addClass("in-between-grids");
        if (previous && !previous.data("lm-blocktype")) {
          this.placeholder.addClass("in-between-grids-first");
        }
        if (!next || !next.data("lm-blocktype")) {
          this.placeholder.addClass("in-between-grids-last");
        }
      }
    },
    nolocation: function(event) {
      (!this.block.isNew() ? this.original : this.element).style({ transform: "translate(0, 0)" });
      if (this.placeholder) {
        this.placeholder.remove();
      }
      if (!this.block) {
        return;
      }
      let target = event.type.match(/^touch/i) ? document.elementFromPoint(event.touches.item(0).clientX, event.touches.item(0).clientY) : event.target;
      if (!this.block.isNew()) {
        target = dom8(target);
        let targetNode2 = target[0];
        if (targetNode2 === this.eraser.element || this.eraser.element.contains(targetNode2)) {
          this.dragdrop.removeElement = true;
          this.eraser.over();
        } else {
          this.dragdrop.removeElement = false;
          this.eraser.out();
        }
      }
    },
    // Drag-to-resize is retired in favor of the row/column picker (see
    // row-picker.js, grid.js's per-row layout icon, and
    // NUCLEUS_BOOTSTRAP_MIGRATION.md M3). `this.resizer` itself stays
    // constructed - `evenResize()` is still used elsewhere to auto-balance
    // sizes when blocks are added/removed/moved - only the interactive
    // drag-resize gesture (dragdrop:resize -> resizer.start()) is disabled.
    // This is scoped to the Layout Manager only: the mega-menu editor
    // (menumanager.js) has its own, entirely separate DragDrop/Resizer
    // instance pair and is unaffected.
    resize: function() {
    },
    removeElement: function(event, element) {
      this.dragdrop.removeElement = false;
      let transition = {
        opacity: 0
      };
      element.animate(transition, {
        duration: "150ms"
      });
      let root = dom8("[data-lm-root]"), blocks;
      if (this.block.getType() === "grid" && (blocks = root.search('[data-lm-dropzone]:not([data-lm-blocktype="grid"])'))) {
        blocks.style({ "pointer-events": "inherit" });
      }
      let siblings2 = this.block.block.siblings('[data-lm-blocktype="block"]:not(.original-placeholder)');
      if (siblings2 && this.block.getType() == "block") {
        let size3 = this.block.getSize(), diff = size3 / siblings2.length, newSize, block, total = 0, last3;
        siblings2.forEach(function(sibling, index) {
          sibling = dom8(sibling);
          block = get(this.builder.map, sibling.data("lm-id"));
          if (index + 1 == siblings2.length) {
            last3 = block;
          }
          newSize = precision4(block.getSize() + diff, 0);
          total += newSize;
          block.setSize(newSize, true);
        }, this);
        if (total != 100 && last3) {
          size3 = last3.getSize();
          diff = 100 - total;
          last3.setSize(size3 + diff, true);
        }
      }
      this.eraser.hide();
      this.dragdrop.detachDragEvents();
      this.builder.remove(this.block.getId());
      let children = this.block.block.search("[data-lm-id]");
      if (children && children.length) {
        children.forEach(function(child) {
          this.builder.remove(dom8(child).data("lm-id"));
        }, this);
      }
      this.block.block.remove();
      if (this.placeholder) {
        this.placeholder.remove();
      }
      if (this.original) {
        this.original.remove();
      }
      this.element = this.block = null;
      singles.disable();
      singles.cleanup(this.builder);
      this.history.push(this.builder.serialize(), this.history.get().preset);
      root.removeClass("moving");
    },
    stop: function(event, target) {
      let lastOvered = dom8(this.dragdrop.lastOvered);
      let trashZone = this.eraser.element.querySelector(".trash-zone");
      if (lastOvered && trashZone && trashZone.contains(lastOvered[0])) {
        this.eraser.hide();
        return;
      }
      if (this.block.getType() === "grid") {
        let siblings2 = this.block.block.siblings(":not(.original-placeholder):not(.section-header):not(.g-inherit):not(:empty)");
        if (siblings2) {
          siblings2.search("[data-lm-id]").style({ "pointer-events": "inherit" });
        }
      }
      if (!this.block.isNew()) {
        this.eraser.hide();
      }
      if (!this.dragdrop.matched) {
        if (this.placeholder) {
          this.placeholder.remove();
        }
        return;
      }
      target = dom8(target);
      let wrapper, insider, multiLocationResize = false, blockWasNew = this.block.isNew(), type = this.block.getType(), targetId = target.data("lm-id"), targetType = !targetId ? false : get(this.builder.map, targetId) ? get(this.builder.map, targetId).getType() : target.data("lm-blocktype"), placeholderParent = this.placeholder.parent();
      if (!placeholderParent) {
        return;
      }
      let parentId = placeholderParent.data("lm-id"), parentType = get(this.builder.map, parentId || "") ? get(this.builder.map, parentId).getType() : false, resizeCase = false;
      this.original.remove();
      if (blockWasNew && type !== "block" && type !== "grid" && targetType === "block" && parentType === "block") {
        insider = new Blocks2[type]({
          id: this.block.block.data("lm-id"),
          type,
          subtype: this.element.data("lm-blocksubtype"),
          title: this.element.text(),
          builder: this.builder
        }).setLayout(this.block.block);
        this.block = insider;
        this.builder.add(insider);
        insider.emit("rendered", insider, get(this.builder.map, parentId));
      }
      if (type !== "block" && type !== "grid" && (targetType === "section" || targetType === "grid" || targetType === "block" && parentType !== "block")) {
        wrapper = new Blocks2.block({
          builder: this.builder
        }).adopt(this.block.block);
        insider = new Blocks2[type]({
          id: this.block.block.data("lm-id"),
          type,
          subtype: this.element.data("lm-blocksubtype"),
          title: this.element.text(),
          builder: this.builder
        }).setLayout(this.block.block);
        wrapper.setSize();
        this.block = wrapper;
        this.builder.add(wrapper);
        this.builder.add(insider);
        insider.emit("rendered", insider, wrapper);
        wrapper.emit("rendered", wrapper, null);
        resizeCase = { case: 1 };
      }
      if (this.originalType === "block" && this.block.getType() === "block") {
        resizeCase = { case: 3 };
        let previous = this.block.block.parent('[data-lm-blocktype="grid"]'), placeholderPrevious = this.placeholder.parent('[data-lm-blocktype="grid"]');
        if (placeholderPrevious !== previous) {
          multiLocationResize = {
            from: this.block.block.siblings('[data-lm-blocktype="block"]:not(.placeholder)'),
            to: this.placeholder.siblings('[data-lm-blocktype="block"]:not(.placeholder)')
          };
        }
        if (previous.parent('[data-lm-blocktype="container"]')) {
          previous = previous.parent();
        }
        previous = previous.siblings(":not(.original-placeholder)");
        if (!this.block.isNew() && previous.length) {
          this.resizer.evenResize(previous);
        }
        this.block.block.attribute("style", null);
        this.block.setSize();
      }
      if (type === "grid" && !siblings) {
        let plus = this.block.block.parent('[data-lm-blocktype="section"]').find(".fa-plus");
        if (plus) {
          plus.emit("click");
        }
      }
      if (this.block.hasAttribute("size") && typeof this.block.getSize === "function") {
        this.block.setSize(this.placeholder.compute("flex"));
      }
      this.block.insert(this.placeholder);
      this.placeholder.remove();
      if (blockWasNew) {
        if (resizeCase) {
          this.resizer.evenResize(dom8([
            this.block.block,
            this.block.block.siblings('[data-lm-blocktype="block"]')
          ]));
        }
        this.element.attribute("style", null);
      }
      if (multiLocationResize.from || multiLocationResize.to && multiLocationResize.to != this.block.block) {
        let size3 = this.block.getSize(), diff, block;
        if (!multiLocationResize.to) {
          this.block.setSize(100, true);
        }
        if (multiLocationResize.from) {
          diff = size3 / multiLocationResize.from.length;
          let total = 0, curSize;
          multiLocationResize.from.forEach(function(sibling) {
            sibling = dom8(sibling);
            block = get(this.builder.map, sibling.data("lm-id"));
            if (!block || typeof block.getSize !== "function") {
              return;
            }
            curSize = block.getSize() + diff;
            block.setSize(curSize, true);
            total += curSize;
          }, this);
          if (total !== 100) {
            diff = (100 - total) / multiLocationResize.from.length;
            multiLocationResize.from.forEach(function(sibling) {
              sibling = dom8(sibling);
              block = get(this.builder.map, sibling.data("lm-id"));
              if (!block || typeof block.getSize !== "function") {
                return;
              }
              curSize = block.getSize() + diff;
              block.setSize(curSize, true);
            }, this);
          }
        }
        if (multiLocationResize.to) {
          size3 = 100 / (multiLocationResize.to.length + 1);
          multiLocationResize.to.forEach(function(sibling) {
            sibling = dom8(sibling);
            block = get(this.builder.map, sibling.data("lm-id"));
            if (block && typeof block.setSize === "function") {
              block.setSize(size3, true);
            }
          }, this);
          this.block.setSize(size3, true);
        }
      }
      singles.disable();
      singles.cleanup(this.builder);
      this.builder.normalizeGridSizes();
      this.history.push(this.builder.serialize(), this.history.get().preset);
    },
    stopAnimation: function(element) {
      let root = dom8("[data-lm-root]");
      root.removeClass("moving");
      if (this.original) {
        this.original.remove();
      }
      singles.disable();
      if (!this.block) {
        this.block = get(this.builder.map, element.data("lm-id"));
      }
      if (this.block && this.block.getType() === "block") {
        this.block.setSize();
      }
      if (this.block && this.block.isNew() && this.element) {
        this.element.attribute("style", null);
      }
      if (this.originalType === "grid") {
        let blocks, block;
        if (blocks = root.search('[data-lm-dropzone]:not([data-lm-blocktype="grid"])')) {
          blocks.forEach(function(element2) {
            element2 = dom8(element2);
            block = get(this.builder.map, element2.data("lm-id"));
            element2.attribute("style", null);
            block.setSize();
          }, this);
        }
      }
    }
  };
  var LayoutManager = class extends EventEmitter6 {
    constructor(element, options) {
      super();
      this._boundMethods = /* @__PURE__ */ Object.create(null);
      LayoutManagerDefinition.initialize.call(this, element, options);
    }
    setOptions(options) {
      this.options = Object.assign({}, LayoutManagerDefinition.options, options || {});
      return this;
    }
    bound(method) {
      return this._boundMethods[method] || (this._boundMethods[method] = this[method].bind(this));
    }
  };
  Object.keys(LayoutManagerDefinition).forEach(function(method) {
    if (method !== "options" && method !== "initialize") {
      LayoutManager.prototype[method] = LayoutManagerDefinition[method];
    }
  });
  LayoutManager.prototype.options = LayoutManagerDefinition.options;
  var layoutmanager_default = LayoutManager;

  // platforms/common/application/utils/save-state.js
  var clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  var SaveState = class {
    constructor(session) {
      this.setSession(clone(session));
    }
    setSession(session) {
      this.session = session ? { time: Date.now(), data: clone(session) } : {};
      return this.session;
    }
    getTime() {
      return this.session.time;
    }
    getData() {
      return this.session.data;
    }
    getSession() {
      return this.session;
    }
    getDiff(data) {
      return data;
    }
  };
  var save_state_default = SaveState;

  // platforms/common/application/lm/row-picker.js
  var modal4 = ui_default.modal;
  var translate8 = translate_default;
  var PRESETS = [
    [12],
    [6, 6],
    [4, 4, 4],
    [3, 3, 3, 3],
    [4, 8],
    [3, 9],
    [3, 6, 3],
    [2, 6, 4],
    [2, 10],
    [2, 3, 7]
  ];
  var presetLabel = (columns) => columns.join("+");
  var presetPreview = (columns) => {
    return '<span class="lm-row-preset-bars">' + columns.map((count) => {
      let width = (count / 12 * 100).toFixed(4);
      return '<span class="lm-row-preset-bar" style="width:' + width + '%"></span>';
    }).join("") + "</span>";
  };
  var presetButton = (columns, index) => {
    return '<button type="button" class="lm-row-preset" data-lm-row-preset="' + index + '" aria-label="' + translate8("GENESIS_PLATFORM_JS_LM_ROW_LAYOUT_X", presetLabel(columns)) + '">' + presetPreview(columns) + '<span class="lm-row-preset-label">' + presetLabel(columns) + "</span></button>";
  };
  var buildContent = () => {
    return '<div class="lm-row-picker"><h3 class="lm-row-picker-title">' + translate8("GENESIS_PLATFORM_JS_LM_ROW_PICKER_TITLE") + '</h3><div class="lm-row-picker-presets">' + PRESETS.map(presetButton).join("") + '</div><div class="lm-row-picker-custom"><span class="lm-row-picker-custom-label">' + translate8("GENESIS_PLATFORM_JS_LM_ROW_PICKER_CUSTOM") + '</span><input type="text" class="lm-row-picker-custom-input" data-lm-nodrag placeholder="' + translate8("GENESIS_PLATFORM_JS_LM_ROW_PICKER_CUSTOM_PLACEHOLDER") + '" /><button type="button" class="button lm-row-picker-generate" data-lm-nodrag data-lm-row-generate>' + translate8("GENESIS_PLATFORM_JS_LM_ROW_PICKER_GENERATE") + '</button></div><p class="lm-row-picker-error" hidden></p></div>';
  };
  var parseCustomSplit = (text) => {
    let parts = String(text || "").split(/[+,\s]+/).map((part) => part.trim()).filter(Boolean).map(Number);
    if (!parts.length || parts.some((value) => !Number.isInteger(value) || value < 1 || value > 12)) {
      return null;
    }
    let total = parts.reduce((sum, value) => sum + value, 0);
    if (total > 12) {
      return null;
    }
    return parts;
  };
  var openRowPicker = (options) => {
    options = options || {};
    let content = modal4.open({
      content: buildContent(),
      className: "genesis-dialog-theme-default lm-row-picker-dialog",
      afterOpen: (contentElement) => {
        let element = contentElement && contentElement[0] ? contentElement[0] : contentElement;
        if (!element) {
          return;
        }
        let errorNode = element.querySelector(".lm-row-picker-error"), input = element.querySelector(".lm-row-picker-custom-input");
        if (input && options.current && options.current.length) {
          input.value = options.current.join("+");
        }
        let showError2 = (message) => {
          if (!errorNode) {
            return;
          }
          errorNode.textContent = message;
          errorNode.hidden = false;
        };
        let finish = (columns) => {
          modal4.close();
          if (typeof options.onSelect === "function") {
            options.onSelect(columns);
          }
        };
        element.querySelectorAll("[data-lm-row-preset]").forEach((button) => {
          button.addEventListener("click", (event) => {
            event.preventDefault();
            let index = parseInt(button.getAttribute("data-lm-row-preset"), 10);
            finish(PRESETS[index].slice());
          });
        });
        let generate = element.querySelector("[data-lm-row-generate]");
        if (generate) {
          generate.addEventListener("click", (event) => {
            event.preventDefault();
            let columns = parseCustomSplit(input ? input.value : "");
            if (!columns) {
              showError2(translate8("GENESIS_PLATFORM_JS_LM_ROW_PICKER_INVALID"));
              return;
            }
            finish(columns);
          });
        }
        if (input) {
          input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (generate) {
                generate.click();
              }
            }
          });
        }
      }
    });
    return content;
  };
  var row_picker_default = openRowPicker;

  // platforms/common/application/ui/popover.js
  var dom9 = dom_effects_default;
  var zen5 = createElement;
  var storage2 = /* @__PURE__ */ new WeakMap();
  var instances = /* @__PURE__ */ new Set();
  var request4 = request_default;
  var defaults4 = {
    mainClass: "genesis-popover",
    placement: "auto",
    width: "auto",
    height: "auto",
    trigger: "click",
    style: "",
    delay: 300,
    cache: true,
    multi: false,
    arrow: true,
    title: "",
    content: "",
    closeable: false,
    padding: true,
    targetEvents: true,
    allowElementsClick: false,
    url: "",
    type: "html",
    where: "[data-genesis-container]",
    template: '<div class="genesis-popover"><div class="g-arrow"></div><div class="genesis-popover-inner"><a href="#" class="close">x</a><h3 class="genesis-popover-title"></h3><div class="genesis-popover-content"><i class="icon-refresh"></i> <p>&nbsp;</p></div></div></div>'
  };
  var Popover = class {
    constructor(element, options) {
      this.options = Object.assign({}, defaults4, options || {});
      this._bound = /* @__PURE__ */ Object.create(null);
      this.element = dom9(element);
      if (this.options.trigger === "click") {
        this.element.off("click", this.bound("toggle")).on("click", this.bound("toggle"));
      } else {
        this.element.off("mouseenter", this.bound("mouseenterHandler")).off("mouseleave", this.bound("mouseleaveHandler")).on("mouseenter", this.bound("mouseenterHandler")).on("mouseleave", this.bound("mouseleaveHandler"));
      }
      this._poped = false;
      instances.add(this);
    }
    bound(method) {
      if (!this._bound[method]) {
        this._bound[method] = this[method].bind(this);
      }
      return this._bound[method];
    }
    destroy() {
      this.hide(null, false);
      instances.delete(this);
      storage2.delete(this.element[0]);
      this.element.off("click", this.bound("toggle")).off("mouseenter", this.bound("mouseenterHandler")).off("mouseleave", this.bound("mouseleaveHandler"));
      if (this.$target) {
        this.$target.remove();
      }
    }
    hide(event, restore = true) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.element.emit("hide.popover", this);
      if (this.$target) {
        this.$target.removeClass("in").style({ display: "none" });
        this.$target.remove();
      }
      this.element.emit("hidden.popover", this);
      if (this._focusAttached) {
        dom9("body").off("focus", this.bound("focus"), true);
        this._focusAttached = false;
        if (restore) this.restoreFocus();
      }
      dom9("body").off("keyup", this.bound("escapeHandler")).off("click", this.bound("bodyClickHandler"));
    }
    toggle(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this[this.getTarget().hasClass("in") ? "hide" : "show"]();
    }
    focus(e) {
      if (!this.getTarget().hasClass("in")) {
        return;
      }
      let self2 = this, target = dom9(e.target || e);
      if (this.$target[0] === target[0] || target.parent(this.$target) || this.element[0] === target[0] || target.parent(this.element)) {
        return;
      }
      this.hide(null, false);
    }
    restoreFocus(element) {
      element = dom9(element || this.element);
      let tag = element.tag();
      setTimeout(function() {
        if (tag != "a" && tag != "input" && tag != "button") {
          let items = element.find("a, button, input");
          if (items) items[0].focus();
        } else {
          element[0].focus();
        }
      }, 0);
    }
    hideAll(force, restore = false) {
      const restoreTarget = restore && this._focusAttached ? this.element : null;
      instances.forEach((instance2) => {
        const target = instance2.$target;
        if (!target || !force && target.hasClass(instance2.options.mainClass + "-fixed")) return;
        instance2.hide(null, false);
      });
      if (restoreTarget) this.restoreFocus(restoreTarget);
      return this;
    }
    show() {
      let target = this.getTarget().attribute("class", null).addClass(this.options.mainClass).attribute("tabindex", "0");
      if (!this.options.multi) {
        this.hideAll();
      }
      this.element.emit("beforeshow.popover", this);
      if (!this.options.cache || !this._poped) {
        this.setTitle(this.getTitle());
        if (!this.options.closeable) {
          target.find(".close").off("click").remove();
        }
        if (!this.isAsync()) {
          this.setContent(this.getContent());
        } else {
          this.setContentASync(this.options.content);
          this.displayContent();
          return;
        }
        target.style({ display: "block" });
      }
      this.displayContent();
      this.bindBodyEvents();
      setTimeout(function() {
        target[0].focus();
      }, 0);
      if (!this._focusAttached) {
        dom9("body").on("focus", this.bound("focus"), true);
        this._focusAttached = true;
      }
    }
    displayContent() {
      let elementPos, target = this.getTarget().attribute("class", null).addClass(this.options.mainClass), targetContent = this.getContentElement(), targetWidth, targetHeight, placement;
      this.element.emit("show.popover", this);
      if (this.options.width !== "auto") {
        target.style({ width: this.options.width });
      }
      if (this.options.height !== "auto") {
        targetContent.style({ height: this.options.height });
      }
      if (!this.options.arrow && target.find(".g-arrow")) {
        target.find(".g-arrow").remove();
      }
      let container2 = dom9(this.options.where);
      if (GENESIS_PLATFORM == "wordpress") {
        container2 = dom9("#widgets-editor") || dom9("#customize-preview") || dom9("#widgets-right") || dom9(this.options.where);
        if ("#" + container2.id() != this.options.where) {
          let wpwrap = dom9("#wpwrap") || dom9(".wp-customizer"), sibling, workaround;
          if (wpwrap.id() == "wpwrap") {
            sibling = wpwrap.nextSibling(this.options.where);
            workaround = sibling ? sibling : zen5("div.g5wp-out-of-scope" + this.options.where).after(wpwrap);
          } else {
            sibling = wpwrap.find("> " + this.options.where);
            workaround = sibling ? sibling : zen5("div.g5wp-out-of-scope" + this.options.where).top(wpwrap);
          }
          container2 = workaround;
        }
      }
      target.remove().style({
        top: -1e3,
        left: -1e3,
        display: "block"
      }).bottom(container2);
      const anchorRect = this.element[0].getBoundingClientRect();
      const offsetParent = target[0].offsetParent || document.documentElement;
      const parentRect = offsetParent.getBoundingClientRect();
      elementPos = {
        left: anchorRect.left - parentRect.left + offsetParent.scrollLeft,
        top: anchorRect.top - parentRect.top + offsetParent.scrollTop,
        width: anchorRect.width,
        height: anchorRect.height
      };
      if (this.options.style) {
        if (typeof this.options.style === "string") {
          this.options.style = this.options.style.split(",").map(Function.prototype.call, String.prototype.trim);
        }
        this.options.style.forEach(function(style) {
          this.$target.addClass(this.options.mainClass + "-" + style);
        }, this);
      }
      if (!this.options.padding) {
        targetContent.css("height", targetContent.position().height);
        this.$target.addClass("genesis-popover-no-padding");
      }
      targetWidth = target[0].offsetWidth;
      targetHeight = target[0].offsetHeight;
      placement = this.getPlacement(elementPos, targetHeight);
      if (this.options.targetEvents) {
        this.initTargetEvents();
      }
      let positionInfo = this.getTargetPosition(elementPos, placement, targetWidth, targetHeight);
      this.$target.style(positionInfo.position).addClass(placement).addClass("in");
      if (this.options.type === "iframe") {
        let iframe = target.find("iframe");
        iframe.style({
          width: target.position().width,
          height: iframe.parent().position.height
        });
      }
      if (!this.options.arrow) {
        this.$target.style({ "margin": 0 });
      }
      if (this.options.arrow) {
        let arrow = this.$target.find(".g-arrow");
        arrow.attribute("style", null);
        if (positionInfo.arrowOffset) {
          arrow.style(positionInfo.arrowOffset);
        }
      }
      this._poped = true;
      this.element[0].focus();
      this.element.emit("shown.popover", this);
    }
    /*getter setters */
    getTarget() {
      if (!this.$target) {
        this.$target = dom9(zen5("div").html(this.options.template).children()[0]);
      }
      return this.$target;
    }
    getTitleElement() {
      return this.getTarget().find("." + this.options.mainClass + "-title");
    }
    getContentElement() {
      return this.getTarget().find("." + this.options.mainClass + "-content");
    }
    getTitle() {
      return this.options.title || this.element.data("genesis-popover-title") || this.element.attribute("title");
    }
    setTitle(title) {
      let element = this.getTitleElement();
      if (title) {
        element.html(title);
      } else {
        element.remove();
      }
    }
    hasContent() {
      return this.getContent();
    }
    getContent() {
      if (this.options.url) {
        if (this.options.type === "iframe") {
          this.content = dom9('<iframe frameborder="0"></iframe>').attribute("src", this.options.url);
        }
      } else if (!this.content) {
        let content = "";
        if (typeof this.options.content === "function") {
          content = this.options.content.apply(this.element[0], arguments);
        } else {
          content = this.options.content;
        }
        this.content = this.element.data("genesis-popover-content") || content;
      }
      return this.content;
    }
    setContent(content) {
      let target = this.getTarget();
      this.getContentElement().html(content);
      this.$target = target;
    }
    isAsync() {
      return this.options.type === "async";
    }
    setContentASync(content) {
      request4("get", this.options.url, (function(error, response) {
        if (content && typeof content === "function") {
          this.content = content.apply(this.element[0], [response]);
        } else {
          this.content = response.body.html;
        }
        this.setContent(this.content);
        let target = this.getContentElement();
        target.attribute("style", null);
        setTimeout((function() {
          target.parent("." + this.options.mainClass)[0].focus();
        }).bind(this), 0);
        this.displayContent();
        this.bindBodyEvents();
        let selects = dom9("[data-selectize]");
        if (selects) {
          selects.selectize();
        }
      }).bind(this));
    }
    bindBodyEvents() {
      let body = dom9("body");
      body.off("keyup", this.bound("escapeHandler")).on("keyup", this.bound("escapeHandler"));
      body.off("click", this.bound("bodyClickHandler")).on("click", this.bound("bodyClickHandler"));
    }
    /* event handlers */
    mouseenterHandler() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!(this.getTarget()[0].offsetWidth > 0 || this.getTarget()[0].offsetHeight > 0)) {
        this.show();
      }
    }
    mouseleaveHandler() {
      this._timeout = setTimeout((function() {
        this.hide();
      }).bind(this), this.options.delay);
    }
    escapeHandler(e) {
      if (e.keyCode === 27) {
        this.hideAll(false, true);
      }
    }
    bodyClickHandler() {
      this.hideAll();
    }
    targetClickHandler(e) {
      let target = dom9(e.target);
      if (target.matches(this.options.allowElementsClick)) {
        e.preventDefault();
      }
      if (!target.parent("[data-g-popover-follow]") && target.data("g-popover-follow") === null) {
        e.stopPropagation();
      }
    }
    initTargetEvents() {
      if (this.options.trigger !== "click") {
        this.$target.off("mouseenter", this.bound("mouseenterHandler")).off("mouseleave", this.bound("mouseleaveHandler")).on("mouseenter", this.bound("mouseenterHandler")).on("mouseleave", this.bound("mouseleaveHandler"));
      }
      let close = this.$target.find(".close");
      if (close) {
        close.off("click", this.bound("hide")).on("click", this.bound("hide"));
      }
      this.$target.off("click", this.bound("targetClickHandler")).on("click", this.bound("targetClickHandler"));
    }
    /* utils methods */
    getPlacement(pos, targetHeight) {
      let placement, de = document.documentElement, clientWidth = de.clientWidth, clientHeight = de.clientHeight, anchorRect = this.element[0].getBoundingClientRect(), pageX = Math.max(0, anchorRect.left), pageY = Math.max(0, anchorRect.top), arrowSize = 20;
      if (typeof this.options.placement === "function") {
        placement = this.options.placement.call(this, this.getTarget()[0], this.element[0]);
      } else {
        placement = this.element.data("genesis-popover-placement") || this.options.placement;
      }
      if (placement === "auto") {
        if (pageX < clientWidth / 3) {
          if (pageY < clientHeight / 3) {
            placement = "bottom-right";
          } else if (pageY < clientHeight * 2 / 3) {
            placement = "right";
          } else {
            placement = "top-right";
          }
        } else if (pageX < clientWidth * 2 / 3) {
          if (pageY < clientHeight / 3) {
            placement = "bottom";
          } else if (pageY < clientHeight * 2 / 3) {
            placement = "bottom";
          } else {
            placement = "top";
          }
        } else {
          placement = pageY > targetHeight + arrowSize ? "top-left" : "bottom-left";
          if (pageY < clientHeight / 3) {
            placement = "bottom-left";
          } else if (pageY < clientHeight * 2 / 3) {
            placement = "left";
          } else {
            placement = "top-left";
          }
        }
      }
      return placement;
    }
    getTargetPosition(elementPos, placement, targetWidth, targetHeight) {
      let pos = elementPos, elementW = this.element[0].offsetWidth, elementH = this.element[0].offsetHeight, position = {}, arrowOffset = null, arrowSize = this.options.arrow ? 28 : 0, fixedW = elementW < arrowSize + 10 ? arrowSize : 0, fixedH = elementH < arrowSize + 10 ? arrowSize : 0;
      switch (placement) {
        case "bottom":
          position = {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - targetWidth / 2
          };
          break;
        case "top":
          position = {
            top: pos.top - targetHeight,
            left: pos.left + pos.width / 2 - targetWidth / 2
          };
          break;
        case "left":
          position = {
            top: pos.top + pos.height / 2 - targetHeight / 2,
            left: pos.left - targetWidth
          };
          break;
        case "right":
          position = {
            top: pos.top + pos.height / 2 - targetHeight / 2,
            left: pos.left + pos.width
          };
          break;
        case "top-right":
          position = {
            top: pos.top - targetHeight,
            left: pos.left - fixedW
          };
          arrowOffset = { left: elementW / 2 + fixedW };
          break;
        case "top-left":
          position = {
            top: pos.top - targetHeight,
            left: pos.left - targetWidth + pos.width + fixedW
          };
          arrowOffset = { left: targetWidth - elementW / 2 - fixedW };
          break;
        case "bottom-right":
          position = {
            top: pos.top + pos.height,
            left: pos.left - fixedW
          };
          arrowOffset = { left: elementW / 2 + fixedW };
          break;
        case "bottom-left":
          position = {
            top: pos.top + pos.height,
            left: pos.left - targetWidth + pos.width + fixedW
          };
          arrowOffset = { left: targetWidth - elementW / 2 - fixedW };
          break;
        case "right-top":
          position = {
            top: pos.top - targetHeight + pos.height + fixedH,
            left: pos.left + pos.width
          };
          arrowOffset = { top: targetHeight - elementH / 2 - fixedH };
          break;
        case "right-bottom":
          position = {
            top: pos.top - fixedH,
            left: pos.left + pos.width
          };
          arrowOffset = { top: elementH / 2 + fixedH };
          break;
        case "left-top":
          position = {
            top: pos.top - targetHeight + pos.height + fixedH,
            left: pos.left - targetWidth
          };
          arrowOffset = { top: targetHeight - elementH / 2 - fixedH };
          break;
        case "left-bottom":
          position = {
            top: pos.top,
            left: pos.left - targetWidth
          };
          arrowOffset = { top: elementH / 2 };
          break;
      }
      return {
        position,
        arrowOffset
      };
    }
  };
  dom9.implement({
    getPopover: function(options) {
      let element = this[0], popover = storage2.get(element);
      if (!popover && options !== "destroy") {
        options = options || {};
        popover = new Popover(element, options);
        storage2.set(element, popover);
        this.PopoverDefined = true;
        element.PopoverDefined = true;
      }
      return popover;
    },
    popover: function(options) {
      return this.forEach(function(element) {
        let popover = storage2.get(element);
        if (!popover && options !== "destroy") {
          options = options || {};
          popover = new Popover(element, options);
          storage2.set(element, popover);
        }
      });
    },
    position: function() {
      let node = this[0], ct = dom9("[data-genesis-container]")[0].getBoundingClientRect(), box = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
      if (typeof node.getBoundingClientRect !== "undefined") {
        box = node.getBoundingClientRect();
      }
      return {
        x: box.left - ct.left,
        left: box.left - ct.left,
        y: box.top - ct.top,
        top: box.top - ct.top,
        right: box.right - ct.right,
        bottom: box.bottom - ct.bottom,
        width: box.right - box.left,
        height: box.bottom - box.top
      };
    }
  });
  dom9.create = function(element, options) {
    let popover = storage2.get(element);
    if (!popover) {
      popover = new Popover(element, options || {});
      storage2.set(element, popover);
      element.PopoverDefined = true;
    }
    return popover;
  };
  document.addEventListener("genesis:content-replacing", () => {
    instances.forEach((instance2) => instance2.hide(null, false));
  });
  var popover_default = dom9;

  // platforms/common/application/lm/inheritance/index.js
  var dom10 = dom_default;
  var ready6 = dom10.ready;
  var delegate4 = dom10.delegate;
  var indicator2 = indicator_default;
  var request5 = request_default;
  var modal5 = ui_default.modal;
  var Selectize3 = selectize_default;
  var getAjaxSuffix4 = get_ajax_suffix_default;
  var parseAjaxURI4 = get_ajax_url_default.parse;
  var getAjaxURL10 = get_ajax_url_default.global;
  var getCurrentOutline3 = get_outline_default.getCurrentOutline;
  var IDsMap = {
    attributes: ["g-settings-particle", "g-settings-atom"],
    block: { panel: "g-settings-block-attributes", tab: "g-settings-block" },
    particles: "g-inherit-particle",
    atoms: "g-inherit-atom"
  };
  var asElement4 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var collectionContains = function(collection, value) {
    if (Array.isArray(collection) || typeof collection === "string") {
      return collection.includes(value);
    }
    return collection && typeof collection === "object" ? Object.values(collection).includes(value) : false;
  };
  var emitChange = function(element, options) {
    element = asElement4(element);
    if (!element) {
      return;
    }
    let event = new Event("change", { bubbles: true });
    Object.assign(event, options || {});
    element.dispatchEvent(event);
  };
  var getModalContainer = function() {
    return asElement4(modal5.getByID(modal5.getLast()));
  };
  var getMode = function(root) {
    return (root || document).querySelector('[name="inherit[mode]"]:checked');
  };
  var getSelectedItem = function(root) {
    return (root || document).querySelector(
      '[name="inherit[particle]"]:checked, [name="inherit[atom]"]:checked'
    );
  };
  ready6(function() {
    let body = document.body, currentSelection = {}, currentMode = {};
    delegate4(body, "change", '[name="inherit[outline]"]', function(event, element) {
      let settingsParam = element.closest(".settings-param"), label = settingsParam && settingsParam.querySelector(".settings-param-title"), text = settingsParam && settingsParam.querySelector(".g-item"), value = element.value, section = document.querySelector('[name="inherit[section]"]'), name = section ? section.value : "", form = element.closest("[data-g-inheritance-settings]"), includesFields = Array.from(document.querySelectorAll(
        '[data-multicheckbox-field="inherit[include]"]:checked'
      )), mode = getMode(form), checked2 = getSelectedItem(form), particle = {
        list: document.querySelector("#g-inherit-particle, #g-inherit-atom"),
        mode,
        radios: form && form.querySelector(
          '[name="inherit[particle]"], [name="inherit[atom]"]'
        ),
        checked: checked2
      };
      if (!text || !form || !mode) {
        return true;
      }
      let hasChanged = currentSelection[name] !== value || currentMode[name] !== mode.value;
      if (hasChanged && !value) {
        includesFields.forEach(function(include) {
          include.checked = false;
          emitChange(include);
        });
      }
      let formData = JSON.parse(form.dataset.gInheritanceSettings || "{}"), data = {
        outline: value || getCurrentOutline3(),
        type: formData.type || "",
        subtype: formData.subtype || "",
        mode: mode.value,
        inherit: !!value && mode.value === "inherit" ? "1" : "0"
      };
      data.id = formData.id;
      indicator2.show(label);
      let selectize2 = Selectize3.getInstance(element);
      if (selectize2) {
        selectize2.blur();
      }
      if (particle.radios && checked2 && !hasChanged) {
        data.selected = checked2.value;
        data.id = checked2.value;
        particle.list = false;
      }
      let URI_mode = data.type === "atom" ? "atoms" : "layouts", URI = particle.list ? URI_mode + "/list" : URI_mode;
      request5("POST", parseAjaxURI4(getAjaxURL10(URI) + getAjaxSuffix4()), data, function(error, response) {
        indicator2.hide(label);
        if (!response.body.success) {
          modal5.open({
            content: response.body.html || response.body.message || response.body,
            afterOpen: function(container3) {
              container3 = asElement4(container3);
              if (container3 && !response.body.html && !response.body.message) {
                container3.style.width = "90%";
              }
            }
          });
          return;
        }
        let responseData = response.body, includeField = form.querySelector('[name="inherit[include]"]'), includes = includeField && includeField.value ? includeField.value.split(",") : [], available = Array.from(form.querySelectorAll(
          '[data-multicheckbox-field="inherit[include]"]'
        )).map(function(item) {
          return item.value;
        }), container2 = getModalContainer(), refreshed;
        if (!container2) {
          return;
        }
        Object.keys(IDsMap).forEach(function(option) {
          let id2 = IDsMap[option];
          id2 = id2.panel || id2;
          id2 = !Array.isArray(id2) ? [id2] : id2;
          id2.forEach(function(currentID) {
            let shouldRefresh = includes.includes(option), isAvailable = available.includes(option);
            if ((shouldRefresh || !isAvailable) && responseData.html && responseData.html[currentID] && (refreshed = container2.querySelector("#" + currentID))) {
              refreshed.innerHTML = responseData.html[currentID];
              Selectize3.initialize(refreshed.querySelectorAll("[data-selectize]"));
            }
          });
        });
        if (hasChanged && includesFields.length && currentSelection[name] === "") {
          includesFields.forEach(function(include) {
            emitChange(include);
          });
        }
        currentSelection[name] = value;
        currentMode[name] = mode.value;
      });
    });
    delegate4(body, "change", "#g-settings-inheritance [data-multicheckbox-field]", function(event, element) {
      let root = element.closest("[data-g-inheritance-settings]") || document, outlineElement = root.querySelector('[name="inherit[outline]"]');
      if (!outlineElement) {
        return true;
      }
      let outline = outlineElement.value, value = element.value, isChecked = element.checked, noRefresh = event.noRefresh, mode = getMode(root);
      if (!mode) {
        return true;
      }
      let IDs = {
        panel: IDsMap[value] && IDsMap[value].panel || IDsMap[value],
        tab: IDsMap[value] && IDsMap[value].tab || IDsMap[value]
      };
      if (!Array.isArray(IDs.panel)) {
        IDs.panel = [IDs.panel];
        IDs.tab = [IDs.tab];
      }
      IDs.panel.forEach(function(currentPanel, index) {
        let panel = document.getElementById(currentPanel), tab = document.getElementById(IDs.tab[index] + "-tab");
        if (!panel || !tab) {
          return;
        }
        let inherit = panel.querySelector(".g-inherit"), isClone = mode.value === "clone", refresh = function(skipRefresh) {
          if (skipRefresh) {
            return;
          }
          let settingsBlock = element.closest(".settings-block"), selector = settingsBlock && settingsBlock.querySelector('[name="inherit[outline]"]');
          emitChange(selector);
        };
        if (!isChecked || !outline || isClone) {
          let lock = tab.querySelector(".fa-lock");
          if (lock) {
            lock.classList.remove("fa-lock");
            lock.classList.add("fa-unlock");
          }
          if (inherit) {
            inherit.style.display = "none";
          }
          if (isClone) {
            refresh(noRefresh);
          }
        } else {
          let unlock = tab.querySelector(".fa-unlock");
          if (unlock) {
            unlock.classList.remove("fa-unlock");
            unlock.classList.add("fa-lock");
          }
          if (inherit) {
            inherit.style.removeProperty("display");
          }
          refresh(noRefresh);
        }
      });
    });
    delegate4(
      body,
      "change",
      '[name="inherit[mode]"], [name="inherit[particle]"], [name="inherit[atom]"]',
      function(event, element) {
        let container2 = getModalContainer();
        if (!container2) {
          return;
        }
        let outline = container2.querySelector('[name="inherit[outline]"]'), checkboxes = container2.querySelectorAll("[data-multicheckbox-field]"), noRefresh = element.name === "inherit[mode]";
        emitChange(outline, { noRefresh });
        checkboxes.forEach(function(checkbox) {
          emitChange(checkbox, { noRefresh });
        });
      }
    );
    delegate4(
      body,
      "click",
      "#g-inherit-particle .fa-info-circle, #g-inherit-atom .fa-info-circle",
      function(event, element) {
        event.preventDefault();
        let container2 = getModalContainer(), outline = container2 && container2.querySelector('[name="inherit[outline]"]'), parent = element.parentElement, id2 = parent && parent.querySelector(
          'input[name="inherit[particle]"], input[name="inherit[atom]"]'
        );
        if (!id2 || !outline) {
          return false;
        }
        let URI = id2.name === "inherit[atom]" ? "atoms/instance" : "layouts/particle";
        modal5.open({
          content: "Loading",
          method: "post",
          data: { id: id2.value, outline: outline.value || getCurrentOutline3() },
          remote: parseAjaxURI4(getAjaxURL10(URI) + getAjaxSuffix4()),
          remoteLoaded: function(response) {
            if (!response.body.success) {
              modal5.enableCloseByOverlay();
            }
          }
        });
        return false;
      }
    );
    delegate4(body, "mouseup", ".g-tabs .fa-lock, .g-tabs .fa-unlock", function(event, element) {
      let listItem = element.closest("li");
      if (!listItem || !listItem.classList.contains("active")) {
        return false;
      }
      let container2 = getModalContainer(), anchor = element.closest("a"), isLocked = element.classList.contains("fa-lock"), id2 = anchor ? anchor.id.replace(/\-tab$/, "") : "", prop = Object.keys(IDsMap).find(function(key) {
        let value = IDsMap[key];
        return value === id2 || value.tab === id2 || collectionContains(value, id2);
      }), input = container2 && container2.querySelector(
        '[data-multicheckbox-field][value="' + prop + '"]'
      ), mode = container2 && getMode(container2), radios = container2 && container2.querySelector(
        '[name="inherit[particle]"], [name="inherit[atom]"]'
      ), checked2 = container2 && getSelectedItem(container2);
      if (input) {
        if (mode && mode.value === "clone" || radios && !checked2) {
          return false;
        }
        input.checked = !isLocked;
        emitChange(input);
      }
    });
  });

  // platforms/common/application/lm/index.js
  var ready7 = dom_default.ready;
  var dom11 = dom_collection_default;
  var Submit = submit;
  var modal6 = ui_default.modal;
  var toastr2 = ui_default.toastr;
  var request6 = request_default;
  var indicator3 = indicator_default;
  var getAjaxSuffix5 = get_ajax_suffix_default;
  var parseAjaxURI5 = get_ajax_url_default.parse;
  var getAjaxURL11 = get_ajax_url_default.global;
  var flags2 = flags_state_default;
  var Builder2 = builder_default;
  var LMHistory = history_default2;
  var LayoutManager2 = layoutmanager_default;
  var SaveState2 = save_state_default;
  var translate9 = translate_default;
  var openRowPicker2 = row_picker_default;
  var reportInvalidFields = function(invalid) {
    let fields2 = invalid.map(function(input) {
      let element = input && input[0] ? input[0] : input, container2 = element ? element.closest(".settings-param, .card-overrideable") : null, label = container2 ? container2.querySelector(".settings-param-title, label") : null;
      if (element) {
        element.classList.add("field-invalid");
        element.setAttribute("aria-invalid", "true");
      }
      return label && label.textContent.trim() ? label.textContent.trim() : element && (element.getAttribute("aria-label") || element.name || element.id) || "Unknown field";
    }).filter(function(value, index, values) {
      return values.indexOf(value) === index;
    });
    let first = invalid[0] && (invalid[0][0] || invalid[0]);
    if (first) {
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      first.focus({ preventScroll: true });
    }
    let message = translate9("GENESIS_PLATFORM_JS_REVIEW_FIELDS");
    if (fields2.length) {
      message += "<br><strong>" + fields2.join(", ") + "</strong>";
    }
    toastr2.error(message, translate9("GENESIS_PLATFORM_JS_INVALID_FIELDS"));
  };
  var builder;
  var layoutmanager;
  var lmhistory;
  var savestate;
  var size2 = function(value) {
    if (!value) {
      return 0;
    }
    return Array.isArray(value) ? value.length : Object.keys(value).length;
  };
  var trim2 = function(value) {
    return value == null ? "" : String(value).trim();
  };
  var formatPresetName = function(value) {
    return trim2(value).replace(/_/g, " ").replace(/\//g, " / ").toLowerCase().replace(/^\w|\s\w/g, function(character) {
      return character.toUpperCase();
    });
  };
  var precision5 = function(value, decimalPlaces) {
    let number2 = Number(value), multiplier = Math.pow(10, decimalPlaces);
    return Number((Math.round(number2 * multiplier) / multiplier).toFixed(decimalPlaces));
  };
  builder = new Builder2();
  lmhistory = new LMHistory();
  savestate = new SaveState2();
  ready7(function() {
    let body = dom11("body");
    body.delegate("click", "[data-lm-back]", function(e, element) {
      if (e) {
        e.preventDefault();
      }
      if (dom11(element).hasClass("disabled")) return false;
      lmhistory.undo();
    });
    body.delegate("click", "[data-lm-forward]", function(e, element) {
      if (e) {
        e.preventDefault();
      }
      if (dom11(element).hasClass("disabled")) return false;
      lmhistory.redo();
    });
    lmhistory.on("push", function(session, index, reset) {
      let HM = {
        back: dom11("[data-lm-back]"),
        forward: dom11("[data-lm-forward]")
      };
      if (index && HM.back && HM.back.hasClass("disabled")) HM.back.removeClass("disabled");
      if (reset && HM.forward && !HM.forward.hasClass("disabled")) HM.forward.addClass("disabled");
      layoutmanager.updatePendingChanges();
    });
    lmhistory.on("undo", function(session, index) {
      let notice = dom11("#lm-no-layout"), title = dom11(".layout-title .title small"), preset_name = session.preset.name || "Default", HM = {
        back: dom11("[data-lm-back]"),
        forward: dom11("[data-lm-forward]")
      };
      if (notice) {
        notice.style({ display: !size2(session.data) ? "block" : "none" });
      }
      if (title) {
        title.text("(" + formatPresetName(preset_name) + ")");
      }
      builder.reset(session.data);
      HM.forward.removeClass("disabled");
      if (!index) HM.back.addClass("disabled");
      layoutmanager.singles("disable");
      layoutmanager.updatePendingChanges();
    });
    lmhistory.on("redo", function(session, index) {
      let notice = dom11("#lm-no-layout"), title = dom11(".layout-title .title small"), preset_name = session.preset.name || "Default", HM = {
        back: dom11("[data-lm-back]"),
        forward: dom11("[data-lm-forward]")
      };
      if (notice) {
        notice.style({ display: !size2(session.data) ? "block" : "none" });
      }
      if (title) {
        title.text("(" + formatPresetName(preset_name) + ")");
      }
      builder.reset(session.data);
      HM.back.removeClass("disabled");
      if (index == this.session.length - 1) HM.forward.addClass("disabled");
      layoutmanager.singles("disable");
      layoutmanager.updatePendingChanges();
    });
  });
  ready7(function() {
    let body = dom11("body"), root = dom11("[data-lm-root]"), data;
    layoutmanager = new LayoutManager2("[data-lm-container]", {
      delegate: '[data-lm-root] .g-grid:not([data-lm-preset-grid="bootstrap"]) > .g-block:has(> [data-lm-blocktype]:not([data-lm-nodrag])), [data-lm-root] [data-lm-preset-grid="bootstrap"] > .g-block > [data-lm-blocktype]:not([data-lm-nodrag]), .genesis-lm-particles-picker [data-lm-blocktype], [data-lm-root] [data-lm-blocktype="section"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag]), [data-lm-root] [data-lm-blocktype="section"] > [data-lm-blocktype="container"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag]), [data-lm-root] [data-lm-blocktype="offcanvas"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag]), [data-lm-root] [data-lm-blocktype="offcanvas"] > [data-lm-blocktype="container"] > [data-lm-blocktype="grid"]:not(:empty):not(.no-move):not([data-lm-nodrag])',
      droppables: "[data-lm-dropzone]",
      exclude: ".section-header .button, .section-header .fa, .lm-newblocks .float-right .button, [data-lm-nodrag], [data-lm-disabled]",
      resize_handles: "[data-lm-root] .g-grid > .g-block:not(:last-child)",
      builder,
      history: lmhistory,
      savestate
    });
    if (root) {
      data = JSON.parse(root.data("lm-root"));
      if (data.name) {
        data = data.layout;
      }
      builder.setStructure(data);
      builder.load();
      layoutmanager.history.setSession(builder.serialize(), JSON.parse(root.data("lm-preset")));
      layoutmanager.savestate.setSession(builder.serialize(null, true));
    }
    body.delegate("click", ".g-tabs a", function(event, element) {
      event.preventDefault();
      return false;
    });
    body.delegate("keydown", ".g-tabs a", function(event, element) {
      let key = event.which ? event.which : event.keyCode;
      if (key == 32 || key == 13) {
        event.preventDefault();
        body.emit("mouseup", event);
        return false;
      }
    });
    body.delegate("mouseup", ".g-tabs a", function(event, element) {
      element = dom11(element);
      event.preventDefault();
      let index = 0, parent = element.parent(".g-tabs"), panes = parent.siblings(".g-panes"), links = parent.search("a");
      links.forEach(function(link, i) {
        if (link == element[0]) {
          index = i + 1;
        }
      });
      panes.find("> .active").removeClass("active");
      parent.find("> ul > .active").removeClass("active");
      panes.find("> .g-pane:nth-child(" + index + ")").addClass("active");
      parent.find("> ul > li:nth-child(" + index + ")").addClass("active");
      if (panes.search("> [aria-expanded]")) {
        panes.search("> [aria-expanded]").attribute("aria-expanded", "false");
      }
      if (parent.search("> [aria-expanded]")) {
        parent.search("> [aria-expanded]").attribute("aria-expanded", "false");
      }
      panes.find("> .g-pane:nth-child(" + index + ")").attribute("aria-expanded", "true");
      if (parent.find("> ul >li:nth-child(" + index + ") [aria-expanded]")) {
        parent.find("> ul > li:nth-child(" + index + ") > [aria-expanded]").attribute("aria-expanded", "true");
      }
    });
    body.delegate("statechangeBefore", "[data-genesis-lm-picker]", function() {
      modal6.close();
    });
    body.on("statechangeAfter", function(event, element) {
      root = dom11("[data-lm-root]");
      if (!root) {
        return true;
      }
      data = JSON.parse(root.data("lm-root"));
      builder.setStructure(data);
      builder.load();
      layoutmanager.refresh();
      layoutmanager.history.setSession(builder.serialize(), JSON.parse(root.data("lm-preset")));
      layoutmanager.savestate.setSession(builder.serialize(null, true));
      layoutmanager.eraser.setElement(document.querySelector("[data-lm-eraseblock]"));
      layoutmanager.eraser.hide(true);
    });
    body.delegate("input", ".sidebar-block .search input", function(event, element) {
      let value = dom11(element).value().toLowerCase(), list = dom11(".sidebar-block [data-lm-blocktype]"), text, type;
      if (!list) {
        return false;
      }
      list.style({ display: "none" }).forEach(function(blocktype) {
        blocktype = dom11(blocktype);
        type = blocktype.data("lm-blocktype").toLowerCase();
        text = trim2(blocktype.text()).toLowerCase();
        if (type.substr(0, value.length) == value || text.match(value)) {
          blocktype.style({ display: "block" });
        }
      }, this);
    });
    ["click", "touchend"].forEach(function(evt) {
      body.delegate(evt, "[data-lm-samewidth]:not(:empty)", function(event, element) {
        window.Genesis.tips.hide(element[0]);
        let clientRect = element[0].getBoundingClientRect();
        if ((event.clientX || event.pageX || event.changedTouches[0].pageX || 0) < clientRect.width + clientRect.left) {
          return;
        }
        let blocks = element.search('> [data-lm-blocktype="block"]'), id2;
        if (!blocks || blocks.length == 1) {
          return;
        }
        blocks.forEach(function(block) {
          id2 = dom11(block).data("lm-id");
          builder.get(id2).setSize(100 / blocks.length, true);
        });
        lmhistory.push(builder.serialize(), lmhistory.get().preset);
      });
    });
    body.delegate("mouseover", "[data-lm-samewidth]:not(:empty)", function(event, element) {
      let clientRect = element[0].getBoundingClientRect(), clientX = event.clientX || event.touches && event.touches[0].clientX || 0, tooltips = {
        equalize: clientX + 5 > clientRect.width + clientRect.left,
        move: clientX - 5 < clientRect.left
      };
      if (!tooltips.equalize && !tooltips.move) {
        return;
      }
      let msg = tooltips.equalize ? translate9("GENESIS_PLATFORM_JS_LM_GRID_EQUALIZE") : translate9("GENESIS_PLATFORM_JS_LM_GRID_SORT_MOVE");
      element.data("tip", msg).data("tip-offset", -30);
      window.Genesis.tips.get(element[0]).content(msg).place(tooltips.equalize ? "top-left" : "top-right").show();
    });
    body.delegate("mouseout", "[data-lm-samewidth]:not(:empty)", function(event, element) {
      window.Genesis.tips.hide(element[0]);
    });
    body.delegate("click", "[data-lm-clear]", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      let mode = element.data("lm-clear"), options = {};
      switch (mode) {
        case "keep-inheritance":
          options = { save: true, dropLastGrid: false, emptyInherits: false };
          break;
        case "full":
        default:
          options = { save: true, dropLastGrid: false, emptyInherits: true };
      }
      layoutmanager.clear(null, options);
    });
    let SWITCHER_HIT = false;
    body.delegate("mouseover", "[data-lm-switcher]", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      SWITCHER_HIT = element;
      if (!element.PopoverDefined) {
        element.getPopover({
          type: "async",
          width: "500",
          url: parseAjaxURI5(element.data("lm-switcher") + getAjaxSuffix5()),
          allowElementsClick: ".g-tabs a"
        });
      }
    });
    body.delegate("keydown", "[data-switch]", function(event, element) {
      let key = event.which ? event.which : event.keyCode;
      if (key == 32 || key == 13) {
        event.preventDefault();
        body.emit("mousedown", event);
      }
    });
    body.delegate("change", '[data-g-inherit="outline"]', function(event, element) {
      let keeper = element.parent(".g-pane").find('input[type="checkbox"][data-g-preserve="outline"]');
      if (keeper) {
        keeper.checked(false);
      }
    });
    body.delegate("change", '[data-g-preserve="outline"]', function(event, element) {
      let inherit = element.parent(".g-pane").find('input[type="checkbox"][data-g-inherit="outline"]');
      if (inherit) {
        inherit.checked(false);
      }
    });
    body.delegate("mousedown", "[data-switch]", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      if (element.parent(".genesis-popover-content").find("[data-switch] i")) {
        return false;
      }
      element.showIndicator();
      let preset = dom11("[data-lm-preset]"), preserve = element.parent(".g-pane").find('input[type="checkbox"][data-g-preserve]'), inherit = element.parent(".g-pane").find('input[type="checkbox"][data-g-inherit]'), method = !preserve ? "get" : "post", data2 = {};
      preserve = preserve && preserve.checked();
      inherit = inherit && inherit.checked();
      if (preserve) {
        let lm2 = layoutmanager;
        lm2.singles("cleanup", lm2.builder, true);
        lm2.savestate.setSession(lm2.builder.serialize(null, true));
        data2.preset = preset && preset.data("lm-preset") ? preset.data("lm-preset") : "default";
        data2.layout = JSON.stringify(lm2.builder.serialize());
      }
      if (inherit) {
        data2.inherit = 1;
      }
      let uri = parseAjaxURI5(element.data("switch") + getAjaxSuffix5());
      request6(method, uri, data2, function(error, response) {
        element.hideIndicator();
        if (!response.body.success) {
          modal6.open({
            content: response.body.html || response.body.message || response.body,
            afterOpen: function(container2) {
              container2 = modal6.element(container2);
              if (container2 && !response.body.html && !response.body.message) {
                container2.style.width = "90%";
              }
            }
          });
          return;
        }
        if (response.body.message && !flags2.get("lm:switcher:" + window.btoa(uri), false)) {
          flags2.warning({
            message: response.body.message,
            callback: function(response2, content) {
              let confirm = content.find("[data-g-delete-confirm]"), cancel = content.find("[data-g-delete-cancel]");
              if (!confirm) {
                return;
              }
              confirm.on("click", function(e) {
                e.preventDefault();
                if (this.attribute("disabled")) {
                  return false;
                }
                flags2.set("lm:switcher:" + window.btoa(uri), true);
                dom11([confirm, cancel]).attribute("disabled");
                body.emit("mousedown", { target: element });
                modal6.close();
              });
              cancel.on("click", function(e) {
                e.preventDefault();
                if (this.attribute("disabled")) {
                  return false;
                }
                dom11([confirm, cancel]).attribute("disabled");
                flags2.set("lm:switcher:" + window.btoa(uri), false);
                modal6.close();
                if (SWITCHER_HIT) {
                  setTimeout(function() {
                    SWITCHER_HIT.getPopover().show();
                  }, 5);
                }
              });
            }
          });
          return false;
        }
        let preset2 = response.body.preset || { name: "default" }, preset_name = response.body.title || "Default", structure = response.body.data, notice = dom11("#lm-no-layout"), title = dom11(".layout-title .title small");
        root.data("lm-root", JSON.stringify(structure));
        root[0].replaceChildren();
        root.data("lm-preset", preset2);
        if (notice) {
          notice.style({ display: "none" });
        }
        if (title) {
          title.text("(" + preset_name + ")");
        }
        builder.setStructure(structure);
        builder.load();
        lmhistory.push(builder.serialize(), JSON.parse(preset2));
        dom11("[data-lm-switcher]").getPopover().hideAll().destroy();
      });
    });
    body.delegate("click", "[data-lm-settings]", function(event, element) {
      element = dom11(element);
      let blocktype = element.data("lm-blocktype"), settingsURL = element.data("lm-settings"), data2 = null, parent, section;
      if (blocktype === "grid") {
        let clientX = event.clientX || event.touches && event.touches[0].clientX || 0, boundings = element[0].getBoundingClientRect();
        if (clientX + 4 - boundings.left < boundings.width) {
          return false;
        }
      }
      element = element.parent("[data-lm-blocktype]");
      parent = element.parent("[data-lm-blocktype]");
      section = element.parent('[data-lm-blocktype="section"]');
      blocktype = element.data("lm-blocktype");
      let ID3 = element.data("lm-id"), parentID = parent ? parent.data("lm-id") : false, parentType = parent ? parent.data("lm-blocktype") : false;
      if (!["block", "grid"].includes(blocktype)) {
        data2 = {};
        data2.id = builder.get(element.data("lm-id")).getId() || null;
        data2.type = builder.get(element.data("lm-id")).getType() || element.data("lm-blocktype") || false;
        data2.subtype = builder.get(element.data("lm-id")).getSubType() || element.data("lm-blocksubtype") || false;
        data2.title = (element.find("h4") || element.find(".title")).text() || data2.type || "Untitled";
        data2.options = builder.get(element.data("lm-id")).getAttributes() || {};
        data2.inherit = builder.get(element.data("lm-id")).getInheritance() || {};
        data2.block = parent && parentType !== "wrapper" ? builder.get(parent.data("lm-id")).getAttributes() || {} : {};
        data2.size_limits = builder.get(element.data("lm-id")).getLimits(!parent ? false : builder.get(parent.data("lm-id")));
        data2.parent = section ? section.data("lm-id") : null;
        if (!data2.type) {
          delete data2.type;
        }
        if (!data2.subtype) {
          delete data2.subtype;
        }
        if (!size2(data2.options)) {
          delete data2.options;
        }
        if (!size2(data2.inherit)) {
          delete data2.inherit;
        }
        if (!size2(data2.block)) {
          delete data2.block;
        }
      }
      modal6.open({
        content: "Loading",
        method: "post",
        data: data2,
        overlayClickToClose: false,
        remote: parseAjaxURI5(settingsURL + getAjaxSuffix5()),
        remoteLoaded: function(response, content) {
          if (!response.body.success) {
            modal6.enableCloseByOverlay();
            return;
          }
          let container2 = modal6.element(content.elements.content), form = container2 && container2.querySelector("form"), submit3 = container2 ? container2.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]') : [], actionForm = form;
          if (!container2 || !form || !actionForm || !submit3.length) {
            return true;
          }
          let urlTemplate = container2.querySelector(".g-urltemplate");
          if (urlTemplate) {
            urlTemplate.dispatchEvent(new Event("input", { bubbles: true }));
          }
          let blockSize = container2.querySelector('[name="block[size]"]');
          if (blockSize && data2.size_limits) {
            let note = container2.querySelector(".blocksize-note"), min = precision5(data2.size_limits[0], 1), max = precision5(data2.size_limits[1], 1);
            blockSize.setAttribute("min", min);
            blockSize.setAttribute("max", max);
            if (note) {
              let noteHTML = note.innerHTML;
              noteHTML = noteHTML.replace(/#min#/g, min);
              noteHTML = noteHTML.replace(/#max#/g, max);
              note.innerHTML = noteHTML;
              let noteVariant = note.querySelector(".blocksize-" + (min == max ? "range" : "fixed"));
              if (noteVariant) {
                noteVariant.classList.add("hidden");
              }
            }
            let isValid = function() {
              return parseFloat(blockSize.value) >= min && parseFloat(blockSize.value) <= max ? "" : translate9("GENESIS_PLATFORM_JS_LM_SIZE_LIMITS_RANGE");
            };
            blockSize.addEventListener("input", function() {
              blockSize.setCustomValidity(isValid());
            });
          }
          submit3.forEach(function(target) {
            target.addEventListener("click", function(e) {
              e.preventDefault();
              target.disabled = true;
              indicator3.hide(target);
              indicator3.show(target);
              let currentForm = container2.querySelector("form"), formElements = currentForm ? currentForm.elements : [], post = Submit(formElements, container2);
              if (post.invalid.length) {
                target.disabled = false;
                indicator3.hide(target);
                indicator3.show(target, "fa fa-fw fa-exclamation-triangle");
                reportInvalidFields(post.invalid);
                return;
              }
              request6(
                actionForm.getAttribute("method") || "post",
                parseAjaxURI5((actionForm.getAttribute("action") || "") + getAjaxSuffix5()),
                post.valid.join("&") || {},
                function(error, response2) {
                  if (!response2.body.success) {
                    modal6.open({
                      content: response2.body.html || response2.body.message || response2.body,
                      afterOpen: function(container3) {
                        container3 = modal6.element(container3);
                        if (container3 && !response2.body.html && !response2.body.message) {
                          container3.style.width = "90%";
                        }
                      }
                    });
                  } else {
                    let particle = builder.get(ID3), block = null;
                    particle.setAttributes(response2.body.data.options);
                    if (particle.hasAttribute("enabled")) {
                      particle[particle.getAttribute("enabled") ? "enable" : "disable"]();
                    }
                    if (particle.getType() !== "section") {
                      particle.setTitle(response2.body.data.title || "Untitled");
                      particle.updateTitle(particle.getTitle());
                    }
                    if (particle.getType() === "position") {
                      particle.updateKey();
                    }
                    if (response2.body.data.block && size2(response2.body.data.block)) {
                      block = builder.get(parentID);
                      let sibling = block.block.nextSibling() || block.block.previousSibling(), currentSize = block.getSize(), diffSize;
                      block.setAttributes(response2.body.data.block);
                      diffSize = currentSize - block.getSize();
                      block.setAnimatedSize(block.getSize());
                      if (sibling) {
                        sibling = builder.get(sibling.data("lm-id"));
                        sibling.setAnimatedSize(parseFloat(sibling.getSize()) + diffSize, true);
                      }
                    }
                    if (response2.body.data.inherit) {
                      delete response2.body.data.inherit.section;
                      particle.setInheritance(response2.body.data.inherit);
                      particle.enableInheritance();
                      particle.refreshInheritance();
                    }
                    if (response2.body.data.children) {
                      layoutmanager.clear(particle.block, { save: false, dropLastGrid: !!response2.body.data.children.length, emptyInherits: true });
                      builder.recursiveLoad(response2.body.data.children, builder.insert, 0, particle.getId());
                    }
                    if (particle.hasInheritance() && !response2.body.data.inherit) {
                      particle.setInheritance({});
                      particle.disableInheritance();
                    }
                    lmhistory.push(builder.serialize(), lmhistory.get().preset);
                    if (target.hasAttribute("data-apply-and-save")) {
                      let save = document.querySelector(".button-save");
                      if (save) {
                        save.click();
                      }
                    }
                    modal6.close();
                    toastr2.success(translate9("GENESIS_PLATFORM_JS_PARTICLE_SETTINGS_APPLIED", particle.getTitle()), translate9("GENESIS_PLATFORM_JS_SETTINGS_APPLIED"));
                  }
                  indicator3.hide(target);
                  target.disabled = false;
                }
              );
            });
          });
        }
      });
    });
    let insertPresetRow = function(parentId, columns) {
      let grid = builder.insert(void 0, {
        type: "grid",
        subtype: "grid",
        attributes: { layoutPreset: "bootstrap" }
      }, parentId);
      columns.forEach(function(count) {
        builder.insert(void 0, {
          type: "block",
          subtype: "block",
          attributes: { size: count / 12 * 100, columns: { xs: count } }
        }, grid.getId());
      });
      return grid;
    };
    let openNestedRowPicker = function(parentId) {
      openRowPicker2({
        onSelect: function(columns) {
          insertPresetRow(parentId, columns);
          lmhistory.push(builder.serialize(), lmhistory.get().preset);
        }
      });
    };
    let escapeHTML3 = function(value) {
      let node = document.createElement("div");
      node.textContent = value == null ? "" : value;
      return node.innerHTML;
    };
    let openParticlePicker = function(columnId) {
      let templates = Array.from(document.querySelectorAll(".genesis-lm-particles-picker .particles-container [data-lm-blocktype]")).filter(function(item) {
        return !item.hasAttribute("data-lm-disabled");
      });
      let items = templates.map(function(item, index) {
        let title = (item.querySelector(".particle-title") || item).textContent.trim();
        let icon = item.getAttribute("data-lm-icon") || "fa-cube";
        return '<button type="button" class="lm-particle-picker-item" data-lm-particle-index="' + index + '" data-search="' + escapeHTML3((title + " " + (item.getAttribute("data-lm-subtype") || "")).toLowerCase()) + '"><i class="fa fa-fw ' + escapeHTML3(icon) + '" aria-hidden="true"></i><span>' + escapeHTML3(title) + "</span></button>";
      }).join("");
      modal6.open({
        content: '<div class="lm-particle-picker-dialog"><h3>' + translate9("GENESIS_PLATFORM_JS_LM_PARTICLE_PICKER_TITLE") + '</h3><label class="lm-particle-picker-search"><i class="fa fa-search" aria-hidden="true"></i><input type="search" data-lm-particle-search placeholder="' + translate9("GENESIS_PLATFORM_JS_LM_PARTICLE_SEARCH") + '"></label><div class="lm-particle-picker-results">' + items + '</div><p class="lm-particle-picker-empty" hidden>' + translate9("GENESIS_PLATFORM_JS_LM_PARTICLE_EMPTY") + "</p></div>",
        className: "genesis-dialog-theme-default lm-particle-picker-modal",
        afterOpen: function(content) {
          let root2 = content[0], search2 = root2.querySelector("[data-lm-particle-search]"), buttons = Array.from(root2.querySelectorAll("[data-lm-particle-index]")), empty = root2.querySelector(".lm-particle-picker-empty");
          search2.addEventListener("input", function() {
            let query = search2.value.trim().toLowerCase(), visible2 = 0;
            buttons.forEach(function(button) {
              let show2 = !query || button.getAttribute("data-search").indexOf(query) !== -1;
              button.hidden = !show2;
              if (show2) {
                visible2++;
              }
            });
            empty.hidden = visible2 !== 0;
          });
          buttons.forEach(function(button) {
            button.addEventListener("click", function() {
              let template = templates[parseInt(button.getAttribute("data-lm-particle-index"), 10)], title = (template.querySelector(".particle-title") || template).textContent.trim();
              builder.insert(void 0, {
                type: template.getAttribute("data-lm-blocktype"),
                subtype: template.getAttribute("data-lm-subtype") || false,
                title,
                attributes: {}
              }, columnId);
              lmhistory.push(builder.serialize(), lmhistory.get().preset);
              modal6.close();
            });
          });
          search2.focus();
        }
      });
    };
    let serializedElement = function(element) {
      return builder.serialize(element.parentElement).filter(function(item) {
        return item.id === element.getAttribute("data-lm-id");
      })[0];
    };
    let clearIds = function(item) {
      delete item.id;
      (item.children || []).forEach(clearIds);
      return item;
    };
    let removeStructure = function(element) {
      Array.from(element.querySelectorAll("[data-lm-id]")).reverse().forEach(function(child) {
        builder.remove(child.getAttribute("data-lm-id"));
      });
      builder.remove(element.getAttribute("data-lm-id"));
      element.remove();
      lmhistory.push(builder.serialize(), lmhistory.get().preset);
    };
    body.delegate("click", "[data-lm-particle-remove]", function(event, element) {
      event.preventDefault();
      event.stopPropagation();
      let particle = element.parent("[data-lm-id]");
      if (particle) {
        removeStructure(particle[0]);
      }
    });
    let changeRowLayout = function(grid) {
      let gridId = grid.data("lm-id"), mappedGrid = builder.get(gridId), blocks = Array.from(grid[0].children).filter(function(child) {
        return child.getAttribute("data-lm-blocktype") === "block";
      }), current = blocks.map(function(child) {
        let mapped = builder.get(child.getAttribute("data-lm-id"));
        if (!mapped) {
          return 1;
        }
        return Math.max(1, Math.min(12, parseInt(mapped.getAttribute("columns.xs"), 10) || Math.round((mapped.getSize() || 0) / 100 * 12)));
      });
      openRowPicker2({
        current,
        onSelect: function(columns) {
          if (mappedGrid) {
            mappedGrid.setAttribute("layoutPreset", "bootstrap");
            mappedGrid.block.attribute("data-lm-preset-grid", "bootstrap").attribute("data-lm-samewidth", null);
          }
          let hasContent = blocks.some(function(child) {
            return child.querySelector("[data-lm-id]");
          });
          if (columns.length !== blocks.length && hasContent && !window.confirm(translate9("GENESIS_PLATFORM_JS_LM_ROW_CHANGE_LAYOUT_CONFIRM"))) {
            return;
          }
          blocks.slice(0, columns.length).forEach(function(child, index) {
            let mapped = builder.get(child.getAttribute("data-lm-id"));
            if (mapped) {
              mapped.setAttribute("columns.xs", columns[index]);
              mapped.setSize(columns[index] / 12 * 100, true);
            }
          });
          if (columns.length > blocks.length) {
            columns.slice(blocks.length).forEach(function(count) {
              builder.insert(void 0, {
                type: "block",
                subtype: "block",
                attributes: { size: count / 12 * 100, columns: { xs: count } }
              }, gridId);
            });
          } else if (columns.length < blocks.length) {
            blocks.slice(columns.length).forEach(function(child) {
              child.querySelectorAll("[data-lm-id]").forEach(function(descendant) {
                builder.remove(descendant.getAttribute("data-lm-id"));
              });
              let mapped = builder.get(child.getAttribute("data-lm-id"));
              if (mapped) {
                builder.remove(mapped);
              }
              child.remove();
            });
          }
          lmhistory.push(builder.serialize(), lmhistory.get().preset);
        }
      });
    };
    body.delegate("click", "[data-lm-column-add]", function(event, element) {
      event.preventDefault();
      let column = element.parent('[data-lm-blocktype="block"]');
      if (!column || column[0].querySelector(":scope > [data-lm-id]")) {
        return false;
      }
      let columnId = column.data("lm-id");
      modal6.open({
        content: '<div class="lm-column-chooser"><h3>' + translate9("GENESIS_PLATFORM_JS_LM_COLUMN_ADD_TITLE") + '</h3><div class="lm-column-chooser-actions"><button type="button" class="lm-column-choice" data-lm-column-choice="particle"><i class="fa fa-cube" aria-hidden="true"></i><span>' + translate9("GENESIS_PLATFORM_JS_LM_COLUMN_ADD_PARTICLE") + '</span></button><button type="button" class="lm-column-choice" data-lm-column-choice="row"><i class="fa fa-columns" aria-hidden="true"></i><span>' + translate9("GENESIS_PLATFORM_JS_LM_COLUMN_ADD_ROW") + '</span></button><button type="button" class="lm-column-choice" data-lm-column-choice="div"><i class="fa fa-vector-square" aria-hidden="true"></i><span>' + translate9("GENESIS_PLATFORM_JS_LM_COLUMN_ADD_DIV") + "</span></button></div></div>",
        className: "genesis-dialog-theme-default lm-column-chooser-dialog",
        afterOpen: function(content) {
          let root2 = content[0];
          root2.querySelector('[data-lm-column-choice="particle"]').addEventListener("click", function() {
            modal6.close();
            setTimeout(function() {
              openParticlePicker(columnId);
            }, 0);
          });
          root2.querySelector('[data-lm-column-choice="row"]').addEventListener("click", function() {
            modal6.close();
            setTimeout(function() {
              openNestedRowPicker(columnId);
            }, 0);
          });
          root2.querySelector('[data-lm-column-choice="div"]').addEventListener("click", function() {
            modal6.close();
            let div = builder.insert(void 0, {
              type: "div",
              subtype: "div",
              title: "Div",
              attributes: { tag: "div" }
            }, columnId);
            insertPresetRow(div.getId(), [12]);
            lmhistory.push(builder.serialize(), lmhistory.get().preset);
          });
        }
      });
    });
    body.delegate("click", "[data-lm-div-addrow]", function(event, element) {
      event.preventDefault();
      let div = element.parent('[data-lm-blocktype="div"]');
      if (div) {
        openNestedRowPicker(div.data("lm-id"));
      }
    });
    body.delegate("click", "[data-lm-structure-menu]", function(event, element) {
      event.preventDefault();
      event.stopPropagation();
      let structure = element.parent('[data-lm-blocktype="grid"], [data-lm-blocktype="div"]');
      if (!structure) {
        return false;
      }
      let node = structure[0], type = structure.data("lm-blocktype"), settings = node.querySelector(":scope > .g-lm-div-header [data-lm-settings]");
      modal6.open({
        content: '<div class="lm-structure-actions"><h3>' + translate9(type === "div" ? "GENESIS_PLATFORM_JS_LM_DIV" : "GENESIS_PLATFORM_JS_LM_ROW") + "</h3>" + (settings ? '<button type="button" data-lm-structure-action="settings"><i class="fa fa-cog"></i>' + translate9("GENESIS_PLATFORM_JS_LM_SETTINGS", type === "div" ? "Div" : "Row") + "</button>" : "") + (type === "grid" ? '<button type="button" data-lm-structure-action="layout"><i class="fa fa-columns"></i>' + translate9("GENESIS_PLATFORM_JS_LM_ROW_CHANGE_LAYOUT") + "</button>" : "") + '<button type="button" data-lm-structure-action="duplicate"><i class="fa fa-copy"></i>' + translate9("GENESIS_PLATFORM_JS_LM_DUPLICATE") + '</button><button type="button" class="danger" data-lm-structure-action="remove"><i class="fa fa-trash"></i>' + translate9("GENESIS_PLATFORM_JS_LM_REMOVE") + "</button></div>",
        className: "genesis-dialog-theme-default lm-structure-actions-modal",
        afterOpen: function(content) {
          let root2 = content[0], settingsButton = root2.querySelector('[data-lm-structure-action="settings"]');
          if (settingsButton) {
            settingsButton.addEventListener("click", function() {
              modal6.close();
              settings.click();
            });
          }
          let layoutButton = root2.querySelector('[data-lm-structure-action="layout"]');
          if (layoutButton) {
            layoutButton.addEventListener("click", function() {
              modal6.close();
              setTimeout(function() {
                changeRowLayout(structure);
              }, 0);
            });
          }
          root2.querySelector('[data-lm-structure-action="duplicate"]').addEventListener("click", function() {
            let data2 = clearIds(JSON.parse(JSON.stringify(serializedElement(node)))), parent = node.parentElement.closest("[data-lm-id]");
            modal6.close();
            builder.recursiveLoad([data2], builder.insert, 0, parent ? parent.getAttribute("data-lm-id") : false);
            let duplicate = parent ? parent.lastElementChild : document.querySelector("[data-lm-root]").lastElementChild;
            if (duplicate && duplicate !== node) {
              node.after(duplicate);
            }
            lmhistory.push(builder.serialize(), lmhistory.get().preset);
          });
          root2.querySelector('[data-lm-structure-action="remove"]').addEventListener("click", function() {
            modal6.close();
            removeStructure(node);
          });
        }
      });
    });
    body.delegate("click", ".section-addrow", function(event, element) {
      event.preventDefault();
      let section = element.parent("[data-lm-blocktype]");
      if (!section) {
        return false;
      }
      let sectionBlock = section[0];
      let lastGrid = sectionBlock.querySelector(':scope > .g-grid:last-child, :scope > [data-lm-blocktype="container"] > .g-grid:last-child');
      if (lastGrid && !lastGrid.querySelector(':scope > [data-lm-blocktype="block"]')) {
        return false;
      }
      let container2 = dom11(sectionBlock.querySelector(':scope > [data-lm-blocktype="container"]')), parentId = (container2 || section).data("lm-id");
      openRowPicker2({
        onSelect: function(columns) {
          insertPresetRow(parentId, columns);
          lmhistory.push(builder.serialize(), lmhistory.get().preset);
        }
      });
    });
    body.delegate("click", "[data-lm-row-layout]", function(event, element) {
      event.preventDefault();
      let grid = element.parent('[data-lm-blocktype="grid"]');
      if (!grid) {
        return false;
      }
      changeRowLayout(grid);
    });
  });
  var lm_default = {
    dom: dom11,
    builder,
    // LayoutManager is created in the DOM-ready callback above. Expose it
    // through a getter so default-import consumers receive the live instance
    // instead of the undefined value captured while this module is evaluated.
    get layoutmanager() {
      return layoutmanager;
    },
    history: lmhistory,
    savestate
  };

  // platforms/common/application/menu/drag.resizer.js
  var DragEvents3 = drag_events_default;
  var asElement5 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var asElements2 = function(elements) {
    if (!elements) {
      return [];
    }
    if (elements.nodeType) {
      return [elements];
    }
    return Array.from(elements).map(asElement5).filter(Boolean);
  };
  var directChildren = function(element, selector) {
    return element ? Array.from(element.children).filter(function(child) {
      return child.matches(selector);
    }) : [];
  };
  var previousSiblings = function(element) {
    let siblings2 = [], previous = element ? element.previousElementSibling : null;
    while (previous) {
      siblings2.unshift(previous);
      previous = previous.previousElementSibling;
    }
    return siblings2;
  };
  var clamp2 = function(value, min, max) {
    return Math.min(max, Math.max(min, value));
  };
  var mapRange2 = function(value, min1, max1, min2, max2) {
    return min2 + (value - min1) / (max1 - min1) * (max2 - min2);
  };
  var precision6 = function(value, decimals) {
    let multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  };
  var Resizer3 = class {
    constructor(container2, options, menumanager3) {
      this.DRAG_EVENTS = DragEvents3;
      this.options = Object.assign({ minSize: 5 }, options || {});
      this.history = this.options.history || {};
      this.builder = this.options.builder || {};
      this.map = this.builder.map;
      this.menumanager = menumanager3;
      this.moveHandler = this.move.bind(this);
      this.stopHandler = this.stop.bind(this);
      this.listenerOptions = { passive: false };
      this.origin = {
        x: 0,
        y: 0,
        transform: null,
        offset: {
          x: 0,
          y: 0
        }
      };
    }
    getBlock(element) {
      element = typeof element === "string" ? element : asElement5(element);
      let id2 = typeof element === "string" ? element : element && element.dataset.lmId || "";
      return this.map ? this.map[id2] : void 0;
    }
    getAttribute(element, prop) {
      return this.getBlock(element).getAttribute(prop);
    }
    getSize(element) {
      element = asElement5(element);
      let parent = element && (element.matches("[data-mm-id]") ? element : element.closest("[data-mm-id]")), size3 = parent && parent.querySelector(".percentage input");
      return size3 ? Number(size3.value) : 0;
    }
    setSize(element, size3, animated) {
      element = asElement5(element);
      if (!element) {
        return;
      }
      animated = typeof animated === "undefined" ? false : animated;
      let parent = element.matches("[data-mm-id]") ? element : element.closest("[data-mm-id]"), pc = parent && parent.querySelector(".percentage input"), flex = "0 1 " + size3 + "%";
      if (!parent) {
        return;
      }
      if (animated && typeof parent.animate === "function") {
        let animation = parent.animate([
          { flex: getComputedStyle(parent).flex },
          { flex }
        ], { duration: 250, easing: "ease" });
        animation.addEventListener("finish", function() {
          parent.style.flex = flex;
        }, { once: true });
      } else {
        parent.style.flex = flex;
      }
      if (pc) {
        pc.value = precision6(size3, 1);
      }
    }
    start(event, element, siblings2, offset) {
      if (event && event.type.match(/^touch/i)) {
        event.preventDefault();
      }
      if (event.which && event.which !== 1) {
        return true;
      }
      event.preventDefault();
      this.element = asElement5(element);
      if (!this.element) {
        return false;
      }
      let parent = this.element.closest(".submenu-selector");
      if (!parent) {
        return false;
      }
      let current = this.element.closest("[data-mm-id]"), next = current && current.nextElementSibling, nextColumn = next && next.querySelector(":scope > .submenu-column");
      if (!current || !nextColumn) {
        return false;
      }
      parent.classList.add("moving");
      this.siblings = {
        occupied: 0,
        elements: asElements2(siblings2),
        next: nextColumn,
        prevs: previousSiblings(current),
        sizeBefore: 0
      };
      if (this.siblings.elements.length > 1) {
        this.siblings.occupied -= this.getSize(this.siblings.next);
        this.siblings.elements.forEach(function(sibling) {
          this.siblings.occupied += this.getSize(sibling);
        }, this);
      }
      if (this.siblings.prevs) {
        this.siblings.prevs.forEach(function(sibling) {
          this.siblings.sizeBefore += this.getSize(sibling);
        }, this);
      }
      this.origin = {
        size: this.getSize(this.element),
        maxSize: this.getSize(this.element) + this.getSize(this.siblings.next),
        x: event.changedTouches ? event.changedTouches[0].pageX : event.pageX + 6,
        y: event.changedTouches ? event.changedTouches[0].pageY : event.pageY
      };
      let clientRect = this.element.getBoundingClientRect(), parentRect = this.element.parentElement.getBoundingClientRect();
      this.origin.offset = {
        clientRect,
        parentRect: { left: parentRect.left, right: parentRect.right },
        x: this.origin.x - clientRect.right,
        y: clientRect.top - this.origin.y,
        down: offset || 0
      };
      let blocks = directChildren(parent, "[data-mm-id]");
      if (blocks.length) {
        this.origin.offset.parentRect.left = blocks[0].getBoundingClientRect().left;
        this.origin.offset.parentRect.right = blocks[blocks.length - 1].getBoundingClientRect().right;
      }
      this.detachDocumentEvents();
      this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
        document.addEventListener(eventName, this.moveHandler, this.listenerOptions);
      }, this);
      this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
        document.addEventListener(eventName, this.stopHandler, this.listenerOptions);
      }, this);
    }
    move(event) {
      if (event && event.type.match(/^touch/i)) {
        event.preventDefault();
      }
      let point = event.touches && event.touches.length ? event.touches[0] : event, clientX = point.clientX || 0, clientY = point.clientY || 0, parentRect = this.origin.offset.parentRect;
      let deltaX = (this.lastX || clientX) - clientX, deltaY = (this.lastY || clientY) - clientY;
      this.direction = Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0 && "left" || Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0 && "right" || Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0 && "up" || "down";
      let size3, diff = 100 - this.siblings.occupied, value = clientX + (!this.siblings.prevs ? this.origin.offset.x - this.origin.offset.down : this.siblings.prevs.length), normalized = clamp2(value, parentRect.left, parentRect.right);
      size3 = mapRange2(normalized, parentRect.left, parentRect.right, 0, 100);
      size3 = size3 - this.siblings.sizeBefore;
      size3 = precision6(clamp2(size3, this.options.minSize, this.origin.maxSize - this.options.minSize), 0);
      diff = precision6(diff - size3, 0);
      this.setSize(this.element, size3);
      this.setSize(this.siblings.next, diff);
      let siblings2 = this.siblings.elements, amount = siblings2 ? siblings2.length + 1 : 1;
      if (amount == 3 || amount == 6 || amount == 7 || amount == 8 || amount == 9 || amount == 11 || amount == 12) {
        let total = 0, blocks;
        blocks = asElements2(siblings2).concat(this.element.closest("[data-mm-id]"));
        blocks.forEach(function(block, index) {
          size3 = this.getSize(block);
          if (size3 % 1) {
            size3 = precision6(100 / amount, 0);
            this.setSize(block, size3);
          }
          total += size3;
          if (blocks.length == index + 1 && total != 100) {
            diff = 100 - total;
            this.setSize(block, size3 + diff);
          }
        }, this);
      }
      this.lastX = clientX;
      this.lastY = clientY;
    }
    stop(event) {
      if (event && event.type.match(/^touch/i)) {
        event.preventDefault();
      }
      this.detachDocumentEvents();
      let parent = this.element && this.element.closest(".submenu-selector");
      if (parent) {
        parent.classList.remove("moving");
      }
      this.menumanager.emit("dragEnd", this.menumanager.map, "resize");
    }
    detachDocumentEvents() {
      this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
        document.removeEventListener(eventName, this.moveHandler, this.listenerOptions);
      }, this);
      this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
        document.removeEventListener(eventName, this.stopHandler, this.listenerOptions);
      }, this);
    }
    updateItemSizes(elements) {
      let parent = this.element ? this.element.closest(".submenu-selector") : null;
      if (!parent && !elements) {
        return false;
      }
      let blocks = elements ? asElements2(elements) : directChildren(parent, "[data-mm-id]"), sizes = [], active = document.querySelector(".menu-selector .active"), path = active ? active.dataset.mmId : null;
      blocks.forEach(function(block) {
        sizes.push(this.getSize(block));
      }, this);
      if (path && this.menumanager.items[path]) {
        this.menumanager.items[path].columns = sizes;
      }
      this.updateMaxValues(elements);
      return sizes;
    }
    updateMaxValues(elements) {
      let parent = this.element ? this.element.closest(".submenu-selector") : null;
      if (!parent && !elements) {
        return false;
      }
      let blocks = elements ? asElements2(elements) : directChildren(parent, "[data-mm-id]"), sizes, inputs;
      blocks.forEach(function(block) {
        let sibling = block.nextElementSibling || block.previousElementSibling;
        if (!sibling) {
          return;
        }
        inputs = {
          block: block.querySelector("input.column-pc"),
          sibling: sibling.querySelector("input.column-pc")
        };
        if (!inputs.block || !inputs.sibling) {
          return;
        }
        sizes = {
          current: this.getSize(block),
          sibling: this.getSize(sibling)
        };
        sizes.total = sizes.current + sizes.sibling;
        inputs.block.max = sizes.total - Number(inputs.block.min);
        inputs.sibling.max = sizes.total - Number(inputs.sibling.min);
      }, this);
    }
    evenResize(elements, animated) {
      elements = asElements2(elements);
      let total = elements.length, size3 = precision6(100 / total, 4);
      elements.forEach(function(element) {
        this.setSize(element, size3, typeof animated == "undefined" ? false : animated);
      }, this);
      this.updateItemSizes(elements);
      this.menumanager.emit("dragEnd", this.menumanager.map, "evenResize");
    }
  };
  var drag_resizer_default2 = Resizer3;

  // platforms/common/application/menu/menumanager.js
  var EventEmitter7 = event_emitter_default;
  var dom12 = dom_effects_default;
  var zen6 = createElement;
  var DragDrop3 = drag_drop_default;
  var Eraser3 = eraser_default;
  var Resizer4 = drag_resizer_default2;
  var ltrim = function(value) {
    return String(value == null ? "" : value).replace(/^\/+/, "");
  };
  var last2 = function(collection) {
    return collection && collection.length ? collection[collection.length - 1] : void 0;
  };
  var indexOf2 = function(collection, value) {
    return Array.prototype.indexOf.call(collection || [], value);
  };
  var isPlainObject3 = function(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") {
      return false;
    }
    let prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
  };
  var cloneValue2 = function(value, seen) {
    if (!value || typeof value !== "object") {
      return value;
    }
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
      return new RegExp(value.source, value.flags);
    }
    if (!Array.isArray(value) && !isPlainObject3(value)) {
      return value;
    }
    if (seen.has(value)) {
      return seen.get(value);
    }
    let clone3 = Array.isArray(value) ? [] : {};
    seen.set(value, clone3);
    Object.keys(value).forEach(function(key) {
      clone3[key] = cloneValue2(value[key], seen);
    });
    return clone3;
  };
  var deepClone = function(value) {
    return cloneValue2(value, /* @__PURE__ */ new WeakMap());
  };
  var MenuManagerDefinition = {
    options: {},
    initialize: function(element, options) {
      this.setOptions(options);
      this.refElement = element;
      this.map = {};
      if (!element || !dom12(element)) {
        return;
      }
      this.init(element);
    },
    init: function() {
      if (this.dragdrop) {
        this.dragdrop.detach();
      }
      this.setRoot();
      this.dragdrop = new DragDrop3(this.refElement, this.options, this);
      this.resizer = new Resizer4(this.refElement, this.options, this);
      this.eraser = new Eraser3("[data-mm-eraseparticle]", this.options);
      this.dragdrop.on("dragdrop:click", this.bound("click")).on("dragdrop:start", this.bound("start")).on("dragdrop:move:once", this.bound("moveOnce")).on("dragdrop:location", this.bound("location")).on("dragdrop:nolocation", this.bound("nolocation")).on("dragdrop:resize", this.bound("resize")).on("dragdrop:stop:erase", this.bound("removeElement")).on("dragdrop:stop", this.bound("stop")).on("dragdrop:stop:animation", this.bound("stopAnimation"));
    },
    refresh: function() {
      if (!this.refElement || !dom12(this.refElement)) {
        return;
      }
      this.init();
    },
    setRoot: function() {
      this.root = dom12("#menu-editor");
      if (this.root) {
        this.settings = JSON.parse(this.root.data("menu-settings"));
        this.ordering = JSON.parse(this.root.data("menu-ordering"));
        this.items = JSON.parse(this.root.data("menu-items"));
        this.map = {
          settings: deepClone(this.settings),
          ordering: deepClone(this.ordering),
          items: deepClone(this.items)
        };
        let submenus = dom12("[data-genesis-menu-columns] .submenu-selector"), columns;
        if (this.resizer && submenus && (columns = submenus.search("> [data-mm-id]"))) {
          this.resizer.updateMaxValues(columns);
        }
      }
    },
    click: function(event, element) {
      let target = dom12(event.target);
      if (target.matches(".g-menu-addblock") || target.parent(".g-menu-addblock")) {
        return false;
      }
      if (element.hasClass("g-block")) {
        this.stopAnimation();
        return true;
      }
      if (element.find("[data-genesis-ajaxify]")) {
        let siblings2 = element.siblings();
        element.addClass("active");
        if (siblings2) {
          siblings2.removeClass("active");
        }
      }
      element.emit("click");
      let link = element.find("a");
      if (link) {
        link[0].click();
      }
    },
    resize: function(event, element, siblings2, offset) {
      this.resizer.start(event, element, siblings2, offset);
    },
    start: function(event, element) {
      let root = element.parent(".menu-selector") || element.parent(".submenu-column") || element.parent(".submenu-selector") || element.parent(".genesis-mm-particles-picker"), size3 = dom12(element).position(), coords = dom12(element)[0].getBoundingClientRect();
      this.block = null;
      this.targetLevel = void 0;
      this.addNewItem = false;
      this.type = element.parent(".g-toplevel") || element.matches(".g-toplevel") ? "main" : element.matches(".g-block") ? "column" : "columns_items";
      this.isParticle = element.matches("[data-mm-blocktype]") || element.matches("[data-mm-original-type]");
      this.wasActive = element.hasClass("active");
      this.isNewParticle = element.parent(".genesis-mm-particles-picker");
      this.ParticleIndex = -1;
      this.root = root;
      this.Element = element;
      this.itemID = element.data("mm-id");
      this.itemLevel = element.data("mm-level");
      this.itemFrom = element.parent("[data-mm-id]");
      this.itemTo = null;
      if (this.isParticle && !this.isNewParticle) {
        let children = element.parent().children("[data-mm-id]");
        this.ParticleIndex = indexOf2(children, element[0]);
      }
      root.addClass("moving");
      let type = dom12(element).data("mm-id"), clone3 = element[0].cloneNode(true);
      if (!this.placeholder) {
        this.placeholder = zen6((this.type == "column" ? "div" : "li") + ".block.placeholder[data-mm-placeholder]");
      }
      this.placeholder.style({ display: "none" });
      this.original = dom12(clone3).after(element).style({
        display: "inline-block",
        opacity: 1
      }).addClass("original-placeholder").data("lm-dropzone", null);
      this.originalType = type;
      this.block = element;
      if (!this.isNewParticle) {
        element.style({
          position: "fixed",
          zIndex: 1500,
          width: Math.ceil(size3.width),
          height: Math.ceil(size3.height),
          left: coords.left,
          top: coords.top
        }).addClass("active");
        this.placeholder.before(element);
      } else {
        let position = element.position();
        this.original.style({
          position: "fixed",
          opacity: 0.5
        }).style({
          left: coords.left,
          top: coords.top,
          width: position.width,
          height: position.height
        });
        this.element = this.dragdrop.element;
        this.block = this.dragdrop.element;
        this.dragdrop.element = this.original;
      }
      if (this.type == "column") {
        root.search(".g-block > *").style({ "pointer-events": "none" });
      }
    },
    moveOnce: function(element) {
      element = dom12(element);
      if (this.original) {
        this.original.style({ opacity: 0.5 });
      }
      if (!this.isNewParticle && (element.hasClass("g-menu-removable") || this.isParticle)) {
        this.eraser.show();
      }
    },
    location: function(event, location, target) {
      target = dom12(target);
      (!this.isNewParticle ? this.original : this.block).style({ transform: "translate(0, 0)" });
      if (!this.placeholder) {
        this.placeholder = zen6((this.type == "column" ? "div" : "li") + ".block.placeholder[data-mm-placeholder]").style({ display: "none" });
      }
      let targetType = target.parent(".g-toplevel") || target.matches(".g-toplevel") ? "main" : target.matches(".g-block") ? "column" : "columns_items", dataLevel = target.data("mm-level"), originalLevel = this.block.data("mm-level");
      if (this.isParticle && (targetType === "main" && !dataLevel)) {
        this.dragdrop.matched = false;
        return;
      }
      if (dataLevel === null && this.type === "columns_items" && this.isParticle && this.isNewParticle) {
        let submenu_items = target.find(".submenu-items");
        if (!submenu_items) {
          this.dragdrop.matched = false;
          return;
        }
        this.placeholder.style({ display: "block" }).bottom(submenu_items);
        this.addNewItem = submenu_items;
        this.targetLevel = 2;
        this.dragdrop.matched = false;
        return;
      }
      if (dataLevel === null && (this.type === "columns_items" || this.isParticle)) {
        let submenu_items = target.find(".submenu-items"), submenu_items_level = submenu_items.data("mm-base-level");
        if (!target.hasClass("g-block") || target.find(this.block) || !this.isParticle && originalLevel != submenu_items_level && (!submenu_items || submenu_items.children() || originalLevel > 2)) {
          this.dragdrop.matched = false;
          return;
        }
        this.placeholder.style({ display: "block" }).bottom(submenu_items);
        this.addNewItem = submenu_items;
        this.targetLevel = 2;
        this.dragdrop.matched = false;
        return;
      }
      if (!this.isParticle) {
        if (this.type !== "column" && originalLevel !== dataLevel) {
          this.dragdrop.matched = false;
          return;
        }
        if (this.type == "column" && dataLevel) {
          this.dragdrop.matched = false;
          return;
        }
        if (dataLevel > 2 && target.parent("ul") != this.block.parent("ul")) {
          this.dragdrop.matched = false;
          return;
        }
      }
      let exclude = ':not(.placeholder):not([data-mm-id="' + this.original.data("mm-id") + '"])', adjacents = {
        before: this.original.previousSiblings(exclude),
        after: this.original.nextSiblings(exclude)
      };
      if (adjacents.before) {
        adjacents.before = dom12(adjacents.before[0]);
      }
      if (adjacents.after) {
        adjacents.after = dom12(adjacents.after[0]);
      }
      if (targetType === "main" && (adjacents.before === target && location.x === "after" || adjacents.after === target && location.x === "before")) {
        return;
      }
      if (targetType === "column" && (adjacents.before === target && location.x === "after" || adjacents.after === target && location.x === "before")) {
        return;
      }
      if (targetType === "columns_items" && (adjacents.before === target && location.y === "below" || adjacents.after === target && location.y === "above")) {
        return;
      }
      switch (targetType) {
        case "main":
        case "column":
          this.placeholder[location.x](target);
          break;
        case "columns_items":
          this.placeholder[location.y === "above" ? "before" : "after"](target);
          break;
      }
      this.targetLevel = dataLevel;
      this.placeholder.style({ display: "block" })[targetType !== "main" ? "removeClass" : "addClass"]("in-between");
    },
    nolocation: function(event) {
      (!this.isNewParticle ? this.original : this.block).style({ transform: "translate(0, 0)" });
      if (this.placeholder) {
        this.placeholder.remove();
      }
      this.targetLevel = void 0;
      let target = event.type.match(/^touch/i) ? document.elementFromPoint(event.touches.item(0).clientX, event.touches.item(0).clientY) : event.target;
      if (!this.isNewParticle && (this.Element.hasClass("g-menu-removable") || this.isParticle)) {
        target = dom12(target);
        let targetNode2 = target[0];
        if (targetNode2 === this.eraser.element || this.eraser.element.contains(targetNode2)) {
          this.dragdrop.removeElement = true;
          this.eraser.over();
        } else {
          this.dragdrop.removeElement = false;
          this.eraser.out();
        }
      }
    },
    removeElement: function(event, element) {
      this.dragdrop.removeElement = false;
      let transition = {
        opacity: 0
      };
      element.animate(transition, {
        duration: "150ms"
      });
      if (this.type == "column") {
        this.root.search(".g-block > *").style({ "pointer-events": "none" });
      }
      this.eraser.hide();
      this.dragdrop.detachDragEvents();
      let particle = this.block, base2 = particle.parent("[data-mm-base]").data("mm-base"), col = (particle.parent("[data-mm-id]").data("mm-id").match(/\d+$/) || [0])[0], index = indexOf2(particle.parent().children("[data-mm-id]:not(.original-placeholder)"), particle[0]);
      delete this.items[this.itemID];
      this.ordering[base2][col].splice(index, 1);
      this.block.remove();
      this.original.remove();
      this.root.removeClass("moving");
      if (this.root.find(".submenu-items")) {
        if (!this.root.find(".submenu-items").children()) {
          this.root.find(".submenu-items").text("");
        }
      }
      this.emit("dragEnd", this.map, "reorder");
    },
    stop: function(event, target, element) {
      target = dom12(target);
      let lastOvered = dom12(this.dragdrop.lastOvered);
      let trashZone = this.eraser.element.querySelector(".trash-zone");
      if (lastOvered && trashZone && trashZone.contains(lastOvered[0])) {
        this.eraser.hide();
        return;
      }
      if (target) {
        element.removeClass("active");
      }
      if (this.type == "column") {
        this.root.search(".g-block > *").attribute("style", null);
      }
      if (!this.dragdrop.matched && !this.addNewItem) {
        if (this.placeholder) {
          this.placeholder.remove();
        }
        this.type = void 0;
        this.targetLevel = false;
        this.isParticle = void 0;
        this.eraser.hide();
        return;
      }
      let placeholderParent = this.placeholder.parent();
      if (!placeholderParent) {
        this.type = void 0;
        this.targetLevel = false;
        this.isParticle = void 0;
        return;
      }
      if (this.addNewItem) {
        this.block.attribute("style", null).removeClass("active");
      }
      let parent = this.block.parent();
      this.eraser.hide();
      if (this.original) {
        if (!this.isNewParticle) {
          this.original.remove();
        } else {
          this.original.attribute("style", null).removeClass("original-placeholder");
        }
      }
      this.block.after(this.placeholder);
      this.placeholder.remove();
      this.itemTo = this.block.parent("[data-mm-id]");
      this.currentLevel = this.itemLevel;
      if (this.wasActive) {
        element.addClass("active");
      }
      if (this.isParticle) {
        let id2 = last2(this.itemID.split("/")), targetItem = target || this.itemTo, base2 = targetItem[target && !target.hasClass("g-block") ? "parent" : "find"]("[data-mm-base]").data("mm-base");
        this.itemID = base2 ? base2 + "/" + id2 : id2;
        this.itemLevel = this.targetLevel;
        this.block.data("mm-id", this.itemID).data("mm-level", this.targetLevel);
      }
      let path = this.itemID.split("/"), items, column;
      path.splice(this.itemLevel - 1);
      path = path.join("/");
      if (this.itemFrom || this.itemTo) {
        let sources = this.itemFrom == this.itemTo ? [this.itemFrom] : [this.itemFrom, this.itemTo];
        sources.forEach(function(source) {
          if (!source) {
            return;
          }
          items = source.search("[data-mm-id]");
          column = Number(this.block.data("mm-level") > 2 ? 0 : (source.data("mm-id").match(/\d+$/) || [0])[0]);
          if (!items) {
            this.ordering[path][column] = [];
            return;
          }
          items = items.map(function(element2) {
            return dom12(element2).data("mm-id");
          });
          if (!this.ordering[path]) {
            this.ordering[path] = [];
          }
          this.ordering[path][column] = items;
        }, this);
        base = this.itemFrom ? this.itemFrom.attribute("data-mm-base") !== null ? this.itemFrom : this.itemFrom.find("[data-mm-base]") : null;
        if (this.isParticle && base && this.targetLevel != this.currentLevel) {
          let list = (this.itemFrom.data("mm-id").match(/\d+$/) || [0])[0], location = base.data("mm-base") || "", currentLocation = ltrim([location, id].join("/"), ["/"]);
          this.ordering[location][list].splice(this.ParticleIndex, 1);
          this.items[this.itemID] = this.items[currentLocation];
          delete this.items[currentLocation];
        }
      }
      if (!this.itemFrom && !this.itemTo && !this.isParticle) {
        let colsOrder = [], active = dom12(".g-toplevel [data-mm-id].active").data("mm-id");
        items = parent.search("> [data-mm-id]");
        items.forEach(function(element2, index) {
          element2 = dom12(element2);
          let id2 = element2.data("mm-id"), column2 = Number((id2.match(/\d+$/) || [0])[0]);
          element2.data("mm-id", id2.replace(/\d+$/, "" + index));
          colsOrder.push(this.ordering[active][column2]);
        }, this);
        this.ordering[active] = colsOrder;
      }
      let selector = this.block.parent(".submenu-selector");
      if (selector) {
        this.resizer.updateItemSizes(selector.search("> [data-mm-id]"));
      }
      this.emit("dragEnd", this.map, "reorder");
    },
    stopAnimation: function() {
      let flex = null;
      if (this.type == "column") {
        flex = this.resizer.getSize(this.block);
      }
      if (this.root) {
        this.root.removeClass("moving");
      }
      if (this.block) {
        this.block.attribute("style", null);
        if (flex) {
          this.block.style("flex", "0 1 " + flex + " %");
        }
      }
      if (this.original) {
        if (!this.isNewParticle || !this.dragdrop.matched && !this.targetLevel) {
          this.original.remove();
        } else {
          this.original.attribute("style", null).removeClass("original-placeholder");
        }
      }
      if (!this.wasActive && this.block) {
        this.block.removeClass("active");
      }
    }
  };
  var MenuManager = class extends EventEmitter7 {
    constructor(element, options) {
      super();
      this._boundMethods = /* @__PURE__ */ Object.create(null);
      MenuManagerDefinition.initialize.call(this, element, options);
    }
    setOptions(options) {
      this.options = Object.assign({}, MenuManagerDefinition.options, options || {});
      return this;
    }
    bound(method) {
      return this._boundMethods[method] || (this._boundMethods[method] = this[method].bind(this));
    }
  };
  Object.keys(MenuManagerDefinition).forEach(function(method) {
    if (method !== "options" && method !== "initialize") {
      MenuManager.prototype[method] = MenuManagerDefinition[method];
    }
  });
  MenuManager.prototype.options = MenuManagerDefinition.options;
  var menumanager_default = MenuManager;

  // platforms/common/application/utils/draggable-group.js
  var directItems = (list, selector, excluded) => Array.from(list.children).filter((item) => item !== excluded && item.matches(selector));
  var previewStyleProperties = [
    "display",
    "boxSizing",
    "width",
    "height",
    "minWidth",
    "maxWidth",
    "color",
    "background",
    "border",
    "borderRadius",
    "padding",
    "margin",
    "boxShadow",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "textDecoration",
    "textTransform",
    "verticalAlign",
    "whiteSpace"
  ];
  var copyPreviewStyles = (source, preview) => {
    const sourceNodes = [source, ...source.querySelectorAll("*")];
    const previewNodes = [preview, ...preview.querySelectorAll("*")];
    sourceNodes.forEach((node, index) => {
      const target = previewNodes[index];
      if (!target) return;
      const computed = getComputedStyle(node);
      previewStyleProperties.forEach((property) => {
        target.style[property] = computed[property];
      });
      target.style.transition = "none";
      target.style.animation = "none";
    });
  };
  var DraggableGroup = class {
    constructor(root, options = {}) {
      this.root = root;
      this.options = Object.assign({
        lists: "ul",
        items: ":scope > *",
        handle: null,
        filter: null,
        cloneFrom: null,
        trash: null,
        draggingClass: "native-dragging",
        direction: "vertical",
        preview: false,
        previewClass: "native-drag-preview",
        scrollContainer: null,
        canReceive: null,
        canDelete: null,
        onClone: null,
        onPreview: null,
        onStart: null,
        onTrashOver: null,
        onEnd: null
      }, options);
      this.drag = null;
      this.trashOver = false;
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onClick = this.onClick.bind(this);
      this.root.addEventListener("pointerdown", this.onPointerDown);
      this.root.addEventListener("click", this.onClick, true);
      this.observer = new MutationObserver(() => this.refresh());
      this.observer.observe(this.root, { childList: true, subtree: true });
      this.refresh();
    }
    refresh() {
      this.lists = Array.from(this.root.querySelectorAll(this.options.lists));
      this.trash = typeof this.options.trash === "string" ? this.root.querySelector(this.options.trash) : this.options.trash;
    }
    getList(element) {
      const list = element && element.closest(this.options.lists);
      return list && this.lists.includes(list) ? list : null;
    }
    getItem(target) {
      const handle = this.options.handle ? target.closest(this.options.handle) : target;
      if (!handle || !this.root.contains(handle)) return null;
      const item = handle.closest(this.options.items);
      const list = item && this.getList(item);
      if (!item || !list || item.parentElement !== list) return null;
      if (this.options.filter && item.matches(this.options.filter)) return null;
      return item;
    }
    indexOf(list, item) {
      return directItems(list, this.options.items).indexOf(item);
    }
    markStarted() {
      if (!this.drag || this.drag.started) return;
      if (this.options.cloneFrom && this.drag.from.matches(this.options.cloneFrom)) {
        this.drag.sourceItem = this.drag.item;
        this.drag.item = this.drag.item.cloneNode(true);
        this.drag.cloned = true;
        if (typeof this.options.onClone === "function") {
          this.options.onClone(this.drag.item, this.drag.sourceItem);
        }
      }
      this.drag.started = true;
      this.drag.previousUserSelect = document.documentElement.style.userSelect;
      document.documentElement.style.userSelect = "none";
      if (this.options.draggingClass) this.drag.item.classList.add(this.options.draggingClass);
      if (this.drag.sourceItem && this.options.draggingClass) {
        this.drag.sourceItem.classList.add(this.options.draggingClass);
      }
      if (this.options.preview) this.createPreview();
      if (typeof this.options.onStart === "function") {
        this.options.onStart({
          item: this.drag.item,
          sourceItem: this.drag.sourceItem || this.drag.item,
          oldIndex: this.drag.oldIndex,
          from: this.drag.from,
          cloned: Boolean(this.drag.cloned)
        });
      }
    }
    createPreview() {
      const source = this.drag.sourceItem || this.drag.item;
      const bounds = source.getBoundingClientRect();
      const preview = this.drag.item.cloneNode(true);
      preview.classList.add(this.options.previewClass);
      if (this.options.draggingClass) preview.classList.add(this.options.draggingClass);
      copyPreviewStyles(source, preview);
      preview.setAttribute("aria-hidden", "true");
      Object.assign(preview.style, {
        position: "fixed",
        zIndex: "3000",
        pointerEvents: "none",
        left: "".concat(bounds.left, "px"),
        top: "".concat(bounds.top, "px"),
        width: "".concat(bounds.width, "px"),
        height: "".concat(bounds.height, "px"),
        margin: "0",
        opacity: "1",
        transform: "translate3d(0, 0, 0)",
        transition: "none"
      });
      document.body.appendChild(preview);
      if (typeof this.options.onPreview === "function") {
        this.options.onPreview(preview, source);
      }
      this.drag.preview = preview;
    }
    movePreview(event) {
      if (!this.drag || !this.drag.preview) return;
      const x = event.clientX - this.drag.clientX;
      const y = event.clientY - this.drag.clientY;
      this.drag.preview.style.transform = "translate3d(".concat(x, "px, ").concat(y, "px, 0)");
    }
    canReceive(list) {
      return typeof this.options.canReceive !== "function" || this.options.canReceive(list, this.drag);
    }
    canDelete() {
      return !this.drag.cloned && (typeof this.options.canDelete !== "function" || this.options.canDelete(this.drag));
    }
    setTrashOver(over) {
      if (over === this.trashOver) return;
      this.trashOver = over;
      if (typeof this.options.onTrashOver === "function") this.options.onTrashOver(over);
    }
    moveTo(list, clientX, clientY) {
      const candidates = directItems(list, this.options.items, this.drag.item);
      const before = candidates.find((item) => {
        const bounds = item.getBoundingClientRect();
        if (this.options.direction === "grid") {
          return clientY < bounds.top || clientY <= bounds.bottom && clientX < bounds.left + bounds.width / 2;
        }
        return clientY < bounds.top + bounds.height / 2;
      });
      if (before) list.insertBefore(this.drag.item, before);
      else list.appendChild(this.drag.item);
    }
    scrollAt(clientY, list) {
      const container2 = this.options.scrollContainer ? list.closest(this.options.scrollContainer) : null;
      if (container2) {
        const bounds = container2.getBoundingClientRect();
        if (clientY < bounds.top + 36) container2.scrollTop -= 12;
        else if (clientY > bounds.bottom - 36) container2.scrollTop += 12;
      }
      if (clientY < 50) window.scrollBy(0, -12);
      else if (clientY > window.innerHeight - 50) window.scrollBy(0, 12);
    }
    onPointerDown(event) {
      if (event.button !== 0 || this.drag) return;
      const item = this.getItem(event.target);
      if (!item) return;
      const from = item.parentElement;
      this.drag = {
        item,
        from,
        oldIndex: this.indexOf(from, item),
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        started: false,
        previousUserSelect: ""
      };
      window.addEventListener("pointermove", this.onPointerMove, { passive: false });
      window.addEventListener("pointerup", this.onPointerUp);
      window.addEventListener("pointercancel", this.onPointerUp);
    }
    onPointerMove(event) {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const distance = Math.abs(event.clientX - this.drag.clientX) + Math.abs(event.clientY - this.drag.clientY);
      if (!this.drag.started && distance < 5) return;
      event.preventDefault();
      this.markStarted();
      this.movePreview(event);
      const over = document.elementFromPoint(event.clientX, event.clientY);
      const overTrash = Boolean(this.canDelete() && this.trash && over && (over === this.trash || this.trash.contains(over)));
      this.setTrashOver(overTrash);
      if (overTrash) return;
      const list = this.getList(over);
      if (!list || !this.canReceive(list)) return;
      this.moveTo(list, event.clientX, event.clientY);
      this.scrollAt(event.clientY, list);
    }
    onPointerUp(event) {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const state = this.drag;
      this.drag = null;
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("pointerup", this.onPointerUp);
      window.removeEventListener("pointercancel", this.onPointerUp);
      if (!state.started) return;
      const over = document.elementFromPoint(event.clientX, event.clientY);
      const deleted = !state.cloned && event.type !== "pointercancel" && (typeof this.options.canDelete !== "function" || this.options.canDelete(state)) && Boolean(this.trash && over && (over === this.trash || this.trash.contains(over)));
      const to = state.item.parentElement;
      if (this.options.draggingClass) state.item.classList.remove(this.options.draggingClass);
      if (state.sourceItem && this.options.draggingClass) {
        state.sourceItem.classList.remove(this.options.draggingClass);
      }
      if (state.preview) state.preview.remove();
      document.documentElement.style.userSelect = state.previousUserSelect;
      this.setTrashOver(false);
      if (deleted) state.item.remove();
      this.suppressClick = event.type !== "pointercancel";
      setTimeout(() => {
        this.suppressClick = false;
      }, 0);
      const newIndex = deleted || !to ? -1 : this.indexOf(to, state.item);
      if (typeof this.options.onEnd === "function") {
        this.options.onEnd({
          item: state.item,
          sourceItem: state.sourceItem || state.item,
          oldIndex: state.oldIndex,
          newIndex,
          from: state.from,
          to,
          deleted,
          cloned: Boolean(state.cloned),
          changed: deleted || Boolean(to && (state.cloned || state.from !== to || state.oldIndex !== newIndex)),
          originalEvent: event
        });
      }
    }
    onClick(event) {
      if (!this.suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.suppressClick = false;
    }
    destroy() {
      this.root.removeEventListener("pointerdown", this.onPointerDown);
      this.root.removeEventListener("click", this.onClick, true);
      this.observer.disconnect();
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("pointerup", this.onPointerUp);
      window.removeEventListener("pointercancel", this.onPointerUp);
      if (this.drag) document.documentElement.style.userSelect = this.drag.previousUserSelect;
      if (this.drag && this.drag.preview) this.drag.preview.remove();
      this.drag = null;
      this.setTrashOver(false);
    }
  };
  var draggable_group_default = DraggableGroup;

  // platforms/common/application/positions/cards.js
  var { ready: ready8, delegate: delegate5 } = dom_default;
  var Eraser4 = eraser_default;
  var DraggableGroup2 = draggable_group_default;
  var flags3 = flags_state_default;
  var elementsFrom2 = (value) => {
    if (!value) return [];
    if (value instanceof Element) return [value];
    return Array.from(value).map((item) => item instanceof Element ? item : item && item[0]).filter(Boolean);
  };
  var updateSaveIndicator = (changed) => {
    const save = document.querySelector('[data-save="Positions"]');
    if (!save) return;
    const indicator12 = save.querySelector(".changes-indicator");
    if (!changed && indicator12) indicator12.remove();
    if (changed && !indicator12) {
      const icon = document.createElement("i");
      icon.className = "changes-indicator far fa-fw fa-circle";
      save.prepend(icon);
    }
  };
  var Positions = {
    eraser: null,
    lists: [],
    state: [],
    init(position) {
      Positions.state = Positions.serialize(position);
      return Positions.state;
    },
    equals() {
      return Positions.state === Positions.serialize();
    },
    updatePendingChanges() {
      const equal = Positions.equals();
      updateSaveIndicator(!equal);
      flags3.set("pending", !equal);
    },
    serialize(position) {
      const output = [];
      const positions = position ? elementsFrom2(position) : Array.from(document.querySelectorAll("[data-genesis-position]"));
      if (!positions.length) return "[]";
      positions.forEach((positionElement) => {
        const data = JSON.parse(positionElement.getAttribute("data-genesis-position"));
        data.modules = [];
        positionElement.querySelectorAll("[data-pm-data]").forEach((item) => {
          data.modules.push(JSON.parse(item.getAttribute("data-pm-data") || "{}"));
        });
        output.push(data);
        positionElement.setAttribute("data-genesis-position", JSON.stringify(data));
      });
      return JSON.stringify(output).replace(/\//g, "\\/");
    },
    attachEraser() {
      const element = document.querySelector("[data-genesis-positions-erase]");
      if (Positions.eraser) {
        Positions.eraser.setElement(element);
        Positions.eraser.hide(true);
        return;
      }
      Positions.eraser = new Eraser4(element);
    },
    createSortables(element) {
      Positions.attachEraser();
      const root = element || document.querySelector("#positions");
      if (!root || root.SimpleSort) return;
      const group = new DraggableGroup2(root, {
        lists: "[data-genesis-position] ul",
        items: "[data-pm-data]",
        filter: "[data-genesis-position-ignore]",
        trash: "#trash",
        draggingClass: "position-dragging",
        scrollContainer: ".position-container",
        onStart() {
          Positions.attachEraser();
          Positions.eraser.show();
        },
        onTrashOver(over) {
          if (over) Positions.eraser.over();
          else Positions.eraser.out();
        },
        onEnd() {
          Positions.eraser.hide();
          Positions.serialize();
          Positions.updatePendingChanges();
        }
      });
      Positions.lists = group.lists;
      root.SimpleSort = group;
    }
  };
  var attachSortablePositions = (positions) => {
    if (positions && !positions.SimpleSort) Positions.createSortables(positions);
  };
  ready8(() => {
    const positions = document.querySelector("#positions");
    delegate5(document.body, "mouseover", "#positions", (event, element) => attachSortablePositions(element));
    attachSortablePositions(positions);
  });
  var cards_default = Positions;

  // platforms/common/application/utils/wp-widgets-customizer.js
  var wp_widgets_customizer_default = (field) => {
    const input = field && field[0] ? field[0] : field;
    if (!(input instanceof Element)) return false;
    if (!document.body.classList.contains("wp-customizer") && !document.body.classList.contains("widgets-php")) return false;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    const parent = input.parentElement;
    const title = parent ? parent.querySelector(".g-instancepicker-title") : null;
    if (title) {
      setTimeout(() => {
        const indicator12 = title.querySelector(".fa-spinner");
        if (indicator12) indicator12.remove();
      }, 5);
    }
    return true;
  };

  // platforms/common/application/menu/extra-items.js
  var dom13 = dom_default;
  var Submit2 = submit;
  var modal7 = ui_default.modal;
  var toastr3 = ui_default.toastr;
  var Selectize4 = selectize_default;
  var request7 = request_default;
  var indicator4 = indicator_default;
  var parseAjaxURI6 = get_ajax_url_default.parse;
  var getAjaxURL12 = get_ajax_url_default.global;
  var getAjaxSuffix6 = get_ajax_suffix_default;
  var flags4 = flags_state_default;
  var deepEquals3 = deep_equals_default;
  var translate10 = translate_default;
  var Cards = cards_default;
  var WordpressWidgetsCustomizer = wp_widgets_customizer_default;
  var menumanager = null;
  var asElement6 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var fragmentFromHTML = function(html) {
    let template = document.createElement("template");
    template.innerHTML = String(html || "").trim();
    return template.content;
  };
  var fieldByName = function(name) {
    return Array.from(document.querySelectorAll("[name]")).find(function(field) {
      return field.name === name;
    }) || null;
  };
  var directChildren2 = function(parent, selector) {
    return Array.from(parent ? parent.children : []).filter(function(child) {
      return child.matches(selector);
    });
  };
  var randomID = function randomString(len, an) {
    an = an && an.toLowerCase();
    let str = "", i = 0, min = an === "a" ? 10 : 0, max = an === "n" ? 10 : 62;
    for (; i++ < len; ) {
      let r = Math.random() * (max - min) + min << 0;
      str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
    }
    return str;
  };
  var StepOne = function(map, mode) {
    if (this.isNewParticle && mode !== "reorder") {
      return;
    }
    this.resizer.updateItemSizes();
    menumanager = this;
    let save = document.querySelector("[data-save]"), current = {
      settings: this.settings,
      ordering: this.ordering,
      items: this.items
    };
    if (!this.isNewParticle && save) {
      if (!deepEquals3(map, current)) {
        indicator4.show(save, "far fa-fw changes-indicator fa-circle");
        flags4.set("pending", true);
      } else {
        indicator4.hide(save);
        flags4.set("pending", false);
      }
    }
    if (this.isParticle && this.isNewParticle) {
      let block = asElement6(this.block), blocktype = block && block.getAttribute("data-mm-blocktype"), title = block && block.querySelector(".menu-item .title");
      if (!block) {
        return;
      }
      block.removeAttribute("data-mm-blocktype");
      block.classList.add("g-menu-item-" + blocktype);
      block.setAttribute("data-mm-original-type", blocktype);
      let badge = document.createElement("span");
      badge.className = "menu-item-type badge";
      badge.textContent = blocktype;
      if (title) {
        title.after(badge);
      }
      let config2 = block.querySelector(".config-cog");
      modal7.open({
        content: translate10("GENESIS_PLATFORM_JS_LOADING"),
        method: "post",
        remote: parseAjaxURI6((config2 ? config2.getAttribute("href") : "") + getAjaxSuffix6()),
        remoteLoaded: function(response, modalInstance) {
          let content = modal7.element(modalInstance.elements.content), search2 = content && content.querySelector(".search input"), blocks = content ? content.querySelectorAll("[data-mm-type]") : [], filters = content ? content.querySelectorAll("[data-mm-filter]") : [];
          if (!search2 || !filters.length || !blocks.length) {
            return;
          }
          search2.addEventListener("input", function() {
            let value = search2.value.toLowerCase();
            blocks.forEach(function(item) {
              item.classList.toggle("hidden", Boolean(value));
            });
            if (!value) {
              return;
            }
            filters.forEach(function(filter) {
              let text = String(filter.getAttribute("data-mm-filter") || "").trim().toLowerCase(), match = text.startsWith(value) || text.includes(" " + value), item = filter.matches("[data-mm-type]") ? filter : filter.closest("[data-mm-type]");
              if (match && item) {
                item.classList.remove("hidden");
              }
            });
          });
          setTimeout(function() {
            search2.focus();
          }, 5);
        }
      });
    }
    this.type = void 0;
  };
  var StepTwo = function(data, content, button) {
    content = asElement6(content);
    button = asElement6(button);
    if (!content || !button) {
      return;
    }
    let route = content.querySelector("[data-mm-particle-stepone]"), uri = route && route.getAttribute("data-mm-particle-stepone"), picker = data.instancepicker, item;
    if (picker) {
      item = JSON.parse(data.item);
      picker = JSON.parse(picker);
      delete data.instancepicker;
      uri = getAjaxURL12(item.type + "/" + item[item.type]);
    }
    request7("post", parseAjaxURI6(uri + getAjaxSuffix6()), data, function(error, stepResponse) {
      let result = stepResponse && stepResponse.body;
      if (!result || !result.success) {
        modal7.open({ content: result ? result.html || result.message || result : error ? error.message : "Request failed." });
        indicator4.hide(button);
        return;
      }
      content.innerHTML = result.html;
      Selectize4.initialize(content.querySelectorAll("[data-selectize]"));
      let urlTemplate = content.querySelector(".g-urltemplate");
      if (urlTemplate) {
        urlTemplate.dispatchEvent(new Event("input", { bubbles: true }));
      }
      let form = content.querySelector("form"), submits = content.querySelectorAll('input[type="submit"], button[type="submit"]');
      if (!form || !submits.length) {
        return true;
      }
      content.querySelectorAll("[data-apply-and-save]").forEach(function(applyAndSave) {
        applyAndSave.remove();
      });
      submits = content.querySelectorAll('input[type="submit"], button[type="submit"]');
      submits.forEach(function(submit3) {
        submit3.addEventListener("click", function(event) {
          event.preventDefault();
          indicator4.show(submit3);
          let post = Submit2(form.elements, content, { submitUnchecked: true }), method = form.getAttribute("method") || "post", action = form.getAttribute("action") || "";
          request7(method, parseAjaxURI6(action + getAjaxSuffix6()), post.valid.join("&") || {}, function(submitError, submitResponse) {
            let submitResult = submitResponse && submitResponse.body, field = null;
            if (!submitResult || !submitResult.success) {
              modal7.open({
                content: submitResult ? submitResult.html || submitResult.message || submitResult : submitError ? submitError.message : "Request failed."
              });
            } else if (!picker) {
              if (menumanager) {
                let element = asElement6(menumanager.element), path = element.getAttribute("data-mm-id") + "-", id2 = randomID(5), baseParent = element.closest("[data-mm-base]"), columnParent = element.closest("[data-mm-id]"), base2 = baseParent && baseParent.getAttribute("data-mm-base"), col = ((columnParent && columnParent.getAttribute("data-mm-id") || "").match(/\d+$/) || [0])[0], index = directChildren2(element.parentElement, "[data-mm-id]").indexOf(element);
                while (menumanager.items[path + id2]) {
                  id2 = randomID(5);
                }
                menumanager.items[path + id2] = submitResult.item;
                if (!menumanager.ordering[base2]) {
                  menumanager.ordering[base2] = [];
                }
                if (!menumanager.ordering[base2][col]) {
                  menumanager.ordering[base2][col] = [];
                }
                menumanager.ordering[base2][col].splice(index, 1, path + id2);
                element.setAttribute("data-mm-id", path + id2);
                if (submitResult.html) {
                  element.innerHTML = submitResult.html;
                }
                menumanager.isNewParticle = false;
                menumanager.emit("dragEnd", menumanager.map);
                toastr3.success(translate10("GENESIS_PLATFORM_JS_MENU_SETTINGS_APPLIED"), translate10("GENESIS_PLATFORM_JS_SETTINGS_APPLIED"));
              } else {
                let position = document.querySelector('[data-genesis-position-name="' + CSS.escape(submitResult.position) + '"]'), list = position && position.querySelector(":scope > ul");
                if (list) {
                  list.appendChild(fragmentFromHTML(submitResult.html));
                }
                Cards.serialize(position);
                Cards.updatePendingChanges();
                toastr3.success(translate10("GENESIS_PLATFORM_JS_POSITIONS_SETTINGS_APPLIED"), translate10("GENESIS_PLATFORM_JS_SETTINGS_APPLIED"));
              }
            } else {
              field = fieldByName(picker.field);
              let parent = field && field.parentElement, btnPicker = parent && parent.querySelector("[data-g-instancepicker]"), label = parent && parent.querySelector(".g-instancepicker-title");
              if (field) {
                field.value = JSON.stringify(submitResult.item);
                field.dispatchEvent(new Event("change", { bubbles: true }));
              }
              if (label) {
                label.textContent = submitResult.item.title;
              }
              if (item.type === "particle" && btnPicker) {
                btnPicker.textContent = btnPicker.getAttribute("data-g-instancepicker-alttext") || "";
              }
            }
            modal7.close();
            indicator4.hide(submit3);
            WordpressWidgetsCustomizer(field);
          });
        });
      });
    });
  };
  dom13.ready(function() {
    let body = document.body;
    dom13.delegate(body, "click", ".menu-editor-extras [data-lm-blocktype], .menu-editor-extras [data-mm-module]", function(event, element) {
      let container2 = element.closest(".menu-editor-extras"), selectButton = container2 && container2.querySelector("[data-mm-select]");
      if (!container2 || !selectButton) {
        return;
      }
      container2.querySelectorAll("[data-lm-blocktype], [data-mm-module]").forEach(function(item) {
        item.classList.remove("selected");
      });
      element.classList.add("selected");
      selectButton.disabled = false;
      selectButton.classList.remove("disabled");
    });
    dom13.delegate(body, "click", ".menu-editor-extras [data-mm-select]", function(event, element) {
      event.preventDefault();
      if (element.classList.contains("disabled") || element.disabled) {
        return;
      }
      let container2 = element.closest(".menu-editor-extras"), selected = container2 && container2.querySelector("[data-lm-blocktype].selected, [data-mm-module].selected");
      if (!container2 || !selected) {
        return;
      }
      let type = selected.getAttribute("data-mm-type"), data = { type }, instancepicker = element.getAttribute("data-g-instancepicker");
      switch (type) {
        case "particle":
          data.particle = selected.getAttribute("data-lm-subtype");
          break;
        case "widget":
          data.widget = selected.getAttribute("data-lm-subtype");
          break;
        case "module":
          data.particle = type;
          let moduleTitle = selected.querySelector("[data-mm-title]");
          data.title = moduleTitle && moduleTitle.getAttribute("data-mm-title");
          data.options = { particle: { module_id: selected.getAttribute("data-mm-module") } };
          break;
      }
      indicator4.show(element);
      if (instancepicker && type === "module") {
        let pickerData = JSON.parse(instancepicker), field = fieldByName(pickerData.field);
        if (field) {
          field.value = selected.getAttribute("data-mm-module");
          field.dispatchEvent(new Event("input", { bubbles: true }));
        }
        indicator4.hide(element);
        modal7.close();
        return;
      }
      element.removeAttribute("data-g-instancepicker");
      StepTwo({
        item: JSON.stringify(data),
        instancepicker: instancepicker || null
      }, element.closest(".genesis-content"), element);
    });
  });
  var extra_items_default = StepOne;

  // platforms/common/application/menu/index.js
  var dom14 = dom_default;
  var MenuManager2 = menumanager_default;
  var Submit3 = submit;
  var modal8 = ui_default.modal;
  var toastr4 = ui_default.toastr;
  var extraItems = extra_items_default;
  var request8 = request_default;
  var indicator5 = indicator_default;
  var parseAjaxURI7 = get_ajax_url_default.parse;
  var getAjaxSuffix7 = get_ajax_suffix_default;
  var translate11 = translate_default;
  var menumanager2;
  var trim3 = function(value) {
    return value == null ? "" : String(value).trim();
  };
  var clamp3 = function(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  };
  dom14.ready(function() {
    let body = document.body;
    menumanager2 = new MenuManager2("[data-mm-container]", {
      delegate: ".genesis-mm-particles-picker ul li, #menu-editor > section ul li, .submenu-column, .submenu-column li[data-mm-id], .column-container .g-block",
      droppables: "#menu-editor [data-mm-id]",
      exclude: "[data-lm-nodrag], .menu-item-back, .fa-cog, .config-cog",
      resize_handles: ".submenu-column:not(:last-child)",
      catchClick: true
    });
    menumanager2.on("dragEnd", extraItems);
    menumanager2.setRoot();
    body.addEventListener("statechangeAfter", function() {
      if (!document.querySelector("#menu-editor")) {
        return;
      }
      menumanager2.setRoot();
      menumanager2.refresh();
      if (menumanager2.eraser) {
        menumanager2.eraser.setElement(document.querySelector("[data-mm-eraseparticle]"));
        menumanager2.eraser.hide();
      }
    });
    dom14.delegate(body, "focusin", ".percentage input", function(event, element) {
      element.currentSize = Number(element.value);
      element.select();
    });
    dom14.delegate(body, "keydown", ".percentage input", function(event) {
      if ([46, 8, 9, 27, 13, 110, 190].includes(event.keyCode) || // Allow: [Ctrl|Cmd]+A | [Ctrl|Cmd]+R
      event.keyCode == 65 && (event.ctrlKey === true || event.ctrlKey === true) || event.keyCode == 82 && (event.ctrlKey === true || event.metaKey === true) || // Allow: home, end, left, right, down, up
      event.keyCode >= 35 && event.keyCode <= 40) {
        return;
      }
      if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
      }
    });
    dom14.delegate(body, "keydown", ".percentage input", function(event, element) {
      let value = Number(element.value), min = Number(element.min), max = Number(element.max), upDown = event.keyCode == 38 || event.keyCode == 40;
      if (upDown) {
        event.preventDefault();
        value += event.keyCode == 38 ? 1 : -1;
        value = clamp3(value, min, max);
        element.value = value;
        element.dispatchEvent(new Event("keyup", { bubbles: true }));
      }
    });
    dom14.delegate(body, "keyup", ".percentage input", function(event, element) {
      let value = Number(element.value), min = Number(element.min), max = Number(element.max);
      let resizer = menumanager2.resizer, parent = element.closest("[data-mm-id]"), sibling = parent && (parent.nextElementSibling || parent.previousElementSibling);
      if (!parent || !sibling || !value || value < min || value > max) {
        return;
      }
      let sizes = {
        current: Number(element.currentSize),
        sibling: Number(resizer.getSize(sibling))
      };
      element.currentSize = value;
      sizes.total = sizes.current + sizes.sibling;
      sizes.diff = sizes.total - value;
      resizer.setSize(parent, value);
      resizer.setSize(sibling, sizes.diff);
      menumanager2.resizer.updateItemSizes(Array.from(parent.parentElement.children).filter(function(child) {
        return child.matches("[data-mm-id]");
      }));
      menumanager2.emit("dragEnd", menumanager2.map, "inputChange");
    });
    dom14.delegate(body, "focusout", ".percentage input", function(event, element) {
      let value = Number(element.value);
      if (value < Number(element.min) || value > Number(element.max)) {
        element.value = element.currentSize;
      }
    });
    dom14.delegate(body, "click", ".add-column", function(event, element) {
      event.preventDefault();
      let columns = element.closest("[data-genesis-menu-columns]"), container2 = columns && columns.querySelector(".submenu-selector"), children = container2 ? Array.from(container2.children) : [], last3 = children[children.length - 1], count = children.length, active = document.querySelector(".menu-selector .active"), path = active ? active.getAttribute("data-mm-id") : null;
      if (!container2 || !last3) {
        return;
      }
      if (count === 1 && !container2.querySelector(".submenu-items > [data-mm-id]")) {
        return;
      }
      let block = last3.cloneNode(true), items = block.querySelector(".submenu-items"), baseLevel = block.querySelector("[data-mm-base-level]"), level = block.querySelector(".submenu-level");
      block.setAttribute("data-mm-id", "list-" + count);
      if (items) {
        items.replaceChildren();
      }
      if (baseLevel) {
        baseLevel.setAttribute("data-mm-base-level", "1");
      }
      if (level) {
        level.textContent = "Level 1";
      }
      last3.after(block);
      if (!menumanager2.ordering[path]) {
        menumanager2.ordering[path] = [[]];
      }
      menumanager2.ordering[path].push([]);
      menumanager2.resizer.evenResize(container2.querySelectorAll(":scope > [data-mm-id]"));
    });
    ["click", "touchend"].forEach(function(evt) {
      dom14.delegate(body, evt, "[data-genesis-menu-columns] .submenu-items:empty", function(event, element) {
        let point = event.changedTouches && event.changedTouches[0], bounding = element.getBoundingClientRect(), x = event.pageX || point && point.pageX || 0, y = event.pageY || point && point.pageY || 0, selector = element.closest(".submenu-selector"), siblings2 = selector ? selector.querySelectorAll(":scope > [data-mm-id]") : [], deleter = {
          width: 36,
          height: 36
        };
        if (siblings2.length <= 1) {
          return false;
        }
        if (x >= bounding.left + bounding.width - deleter.width && x <= bounding.left + bounding.width && Math.abs(window.scrollY - y) - bounding.top < deleter.height) {
          let parent = element.closest("[data-mm-id]"), container2 = parent && parent.parentElement, columns = container2 ? Array.from(container2.children).filter(function(child) {
            return child.matches("[data-mm-id]");
          }) : [], index = columns.indexOf(parent), active = document.querySelector(".menu-selector .active"), path = active ? active.getAttribute("data-mm-id") : null;
          if (!parent || !path || index < 0) {
            return;
          }
          parent.remove();
          siblings2 = container2.querySelectorAll(":scope > [data-mm-id]");
          menumanager2.ordering[path].splice(index, 1);
          menumanager2.resizer.evenResize(siblings2);
        }
      });
    });
    dom14.delegate(body, "click", "#menu-editor .config-cog, #menu-editor .global-menu-settings", function(event, element) {
      event.preventDefault();
      let data = {}, isRoot = element.classList.contains("global-menu-settings"), itemElement = element.closest("[data-mm-id]");
      if (isRoot) {
        data.settings = JSON.stringify(menumanager2.settings);
      } else {
        let itemId = itemElement && itemElement.getAttribute("data-mm-id");
        if (!menumanager2.items || typeof menumanager2.items[itemId] === "undefined") {
          menumanager2.setRoot();
        }
        if (!itemId || !menumanager2.items || typeof menumanager2.items[itemId] === "undefined") {
          toastr4.error("Unable to find the selected menu item. Please reload the Menu Manager.", "Menu item unavailable");
          return;
        }
        data.item = JSON.stringify(menumanager2.items[itemId]);
      }
      modal8.open({
        content: translate11("GENESIS_PLATFORM_JS_LOADING"),
        method: "post",
        data,
        overlayClickToClose: false,
        remote: parseAjaxURI7(element.getAttribute("href") + getAjaxSuffix7()),
        remoteLoaded: function(response, content) {
          if (!response.body.success) {
            modal8.enableCloseByOverlay();
            return;
          }
          let container2 = modal8.element(content.elements.content), form = container2 && container2.querySelector("form"), submit3 = container2 ? container2.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]') : [], actionForm = form, path;
          let search2 = container2.querySelector(".search input"), blocks = container2.querySelectorAll("[data-mm-type]"), filters = container2.querySelectorAll("[data-mm-filter]"), urlTemplate = container2.querySelector(".g-urltemplate");
          if (urlTemplate) {
            urlTemplate.dispatchEvent(new Event("input", { bubbles: true }));
          }
          let editable = container2.querySelector("[data-title-editable]");
          if (editable) {
            editable.addEventListener("genesis:title-edit-end", function(titleEvent) {
              let detail = titleEvent.detail || {}, title = trim3(detail.title), original = detail.original;
              if (!title) {
                title = trim3(original) || "Title";
                editable.textContent = title;
                editable.setAttribute("data-title-editable", title);
              }
            });
          }
          if (search2 && filters.length && blocks.length) {
            search2.addEventListener("input", function() {
              if (!search2.value) {
                blocks.forEach(function(block) {
                  block.classList.remove("hidden");
                });
                return;
              }
              blocks.forEach(function(block) {
                block.classList.add("hidden");
              });
              let value = search2.value.toLowerCase();
              filters.forEach(function(filter) {
                let text = trim3(filter.getAttribute("data-mm-filter")).toLowerCase(), found = text.startsWith(value) || text.includes(" " + value), block = filter.matches("[data-mm-type]") ? filter : filter.closest("[data-mm-type]");
                if (found && block) {
                  block.classList.remove("hidden");
                }
              });
            });
          }
          if (search2) {
            setTimeout(function() {
              search2.focus();
            }, 5);
          }
          if (!container2 || !form || !actionForm || !submit3.length) {
            return true;
          }
          submit3.forEach(function(target) {
            target.addEventListener("click", function(e) {
              e.preventDefault();
              target.disabled = true;
              indicator5.hide(target);
              indicator5.show(target);
              let post = Submit3(actionForm.elements, container2, { isRoot });
              if (post.invalid.length) {
                target.disabled = false;
                indicator5.hide(target);
                indicator5.show(target, "fa fa-fw fa-exclamation-triangle");
                toastr4.error(translate11("GENESIS_PLATFORM_JS_REVIEW_FIELDS"), translate11("GENESIS_PLATFORM_JS_INVALID_FIELDS"));
                return;
              }
              request8(
                actionForm.getAttribute("method") || "post",
                parseAjaxURI7((actionForm.getAttribute("action") || "") + getAjaxSuffix7()),
                post.valid.join("&"),
                function(error, response2) {
                  if (!response2.body.success) {
                    modal8.open({
                      content: response2.body.html || response2.body.message || response2.body,
                      afterOpen: function(container3) {
                        container3 = modal8.element(container3);
                        if (container3 && !response2.body.html && !response2.body.message) {
                          container3.style.width = "90%";
                        }
                      }
                    });
                  } else {
                    if (response2.body.path || response2.body.item && response2.body.item.type == "particle") {
                      path = response2.body.path || itemElement.getAttribute("data-mm-id");
                      menumanager2.items[path] = response2.body.item;
                    } else if (response2.body.item && response2.body.item.type == "particle") {
                    } else {
                      menumanager2.settings = response2.body.settings;
                    }
                    if (response2.body.html) {
                      let parent = itemElement;
                      if (parent) {
                        let status = response2.body.item.enabled || response2.body.item.options.particle.enabled;
                        parent.innerHTML = response2.body.html;
                        parent.classList.toggle("g-menu-item-disabled", status == "0");
                      }
                    }
                    menumanager2.emit("dragEnd", menumanager2.map);
                    if (target.hasAttribute("data-apply-and-save")) {
                      let save = document.querySelector(".button-save");
                      if (save) {
                        save.click();
                      }
                    }
                    modal8.close();
                    toastr4.success(translate11("GENESIS_PLATFORM_JS_MENU_SETTINGS_APPLIED"), translate11("GENESIS_PLATFORM_JS_SETTINGS_APPLIED"));
                  }
                  indicator5.hide(target);
                  target.disabled = false;
                }
              );
            });
          });
        }
      });
    });
  });
  var menu_default = {
    menumanager: menumanager2
  };

  // platforms/common/application/configurations/dropdown-edit.js
  var dom15 = dom_default;
  var request9 = request_default;
  var modal9 = ui_default.modal;
  var getAjaxSuffix8 = get_ajax_suffix_default;
  var parseAjaxURI8 = get_ajax_url_default.parse;
  var History3 = history_default;
  var guid = function() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };
  var refreshWordpressLinks = function(title, value) {
    if (window.GENESIS_PLATFORM !== "wordpress") {
      return;
    }
    let replacement = title.replace(/[^a-z\d_-\s]/i, "_").toLowerCase(), currentURI = History3.getPageUrl(), parsedURI = new URL(currentURI, window.location.href), currentView = parsedURI.searchParams.get("view") || "";
    document.querySelectorAll('[href*="/' + CSS.escape(value) + '/"]').forEach(function(link) {
      link.href = link.href.replace("/" + value + "/", "/" + replacement + "/");
    });
    currentView = currentView.replace("/" + value + "/", "/" + replacement + "/");
    parsedURI.searchParams.set("view", currentView);
    History3.replaceState({ uuid: guid(), doNothing: true }, document.title, parsedURI.toString());
  };
  dom15.ready(function() {
    let body = document.body;
    dom15.delegate(body, "keydown", ".config-select-wrap [data-title-edit]", function(event, editButton) {
      if (event.keyCode !== 32 && event.keyCode !== 13) {
        return;
      }
      event.preventDefault();
      editButton.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    dom15.delegate(body, "mousedown", ".config-select-wrap [data-title-edit]", function(event, editButton) {
      let wrapper = editButton.parentElement, selectized = wrapper && wrapper.querySelector(".g-selectize-control"), select = wrapper && wrapper.querySelector("select"), editable = wrapper && wrapper.querySelector("[data-title-editable]");
      if (!selectized || !select || !editable) {
        return;
      }
      if (!editable.gConfEditAttached) {
        editable.gConfEditAttached = true;
        editable.addEventListener("genesis:title-edit-end", function(titleEvent) {
          let detail = titleEvent.detail || {}, title = String(detail.title || "").trim(), original = detail.original, canceled = detail.canceled;
          let finish = function() {
            selectized.style.display = "inline-block";
            editable.style.display = "none";
            editable.removeAttribute("contenteditable");
          };
          if (canceled || title === original) {
            finish();
            return;
          }
          editButton.classList.add("disabled", "fa-spin-fast", "fa-spinner");
          editButton.classList.remove("fa-pencil");
          let href = editable.getAttribute("data-g-config-href"), value = select.value;
          request9("post", parseAjaxURI8(href + getAjaxSuffix8()), { title }, function(error, response) {
            let bodyResponse = response && response.body;
            if (!bodyResponse || !bodyResponse.success) {
              modal9.open({
                content: bodyResponse ? bodyResponse.html || bodyResponse.message || bodyResponse : error ? error.message : "Unable to rename outline.",
                afterOpen: function(container2) {
                  container2 = modal9.element(container2);
                  if (bodyResponse && !bodyResponse.html && !bodyResponse.message && container2) {
                    container2.style.width = "90%";
                  }
                }
              });
              editable.setAttribute("data-title-editable", original);
              editable.textContent = original;
            } else {
              let selectize2 = select.selectizeInstance, data = selectize2 && selectize2.Options[value];
              if (selectize2 && data) {
                data[selectize2.options.labelField] = title;
                selectize2.updateOption(value, data);
              }
              refreshWordpressLinks(title, value);
            }
            finish();
            editButton.classList.remove("disabled", "fa-spin-fast", "fa-spinner");
            editButton.classList.add("fa-pencil");
          });
        });
      }
      editable.style.width = selectized.getBoundingClientRect().width + "px";
      editable.style.display = "inline-block";
      selectized.style.display = "none";
    });
  });

  // platforms/common/application/configurations/index.js
  var dom16 = dom_default;
  var modal10 = ui_default.modal;
  var toastr5 = ui_default.toastr;
  var request10 = request_default;
  var indicator6 = indicator_default;
  var getAjaxSuffix9 = get_ajax_suffix_default;
  var parseAjaxURI9 = get_ajax_url_default.parse;
  var getAjaxURL13 = get_ajax_url_default.global;
  var flags5 = flags_state_default;
  var asElement7 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var elementFromHTML3 = function(html) {
    let template = document.createElement("template");
    template.innerHTML = String(html || "").trim();
    return template.content.firstElementChild;
  };
  dom16.ready(function() {
    let body = document.body;
    let attachEditables = function(editables) {
      editables.forEach(function(editable) {
        if (editable.confWasAttached) {
          return;
        }
        editable.confWasAttached = true;
        editable.addEventListener("genesis:title-edit-start", function() {
          editable.style.textOverflow = "inherit";
        });
        editable.addEventListener("genesis:title-edit-end", function(event) {
          let detail = event.detail || {}, title = detail.title, original = detail.original;
          editable.style.textOverflow = "ellipsis";
          if (detail.canceled || title === original) {
            return;
          }
          let href = editable.getAttribute("data-g-config-href"), method = (editable.getAttribute("data-g-config-method") || "post").toLowerCase(), parent = editable.parentElement, editButton = parent && parent.querySelector("[data-title-edit]");
          indicator6.show(parent);
          if (editButton) {
            editButton.classList.add("disabled");
          }
          request10(method, parseAjaxURI9(href + getAjaxSuffix9()), { title: String(title).trim() }, function(error, response) {
            let result = response && response.body;
            if (!result || !result.success) {
              modal10.open({
                content: result ? result.html || result.message || result : error ? error.message : "Unable to rename outline.",
                afterOpen: function(container2) {
                  container2 = modal10.element(container2);
                  if (result && !result.html && !result.message && container2) {
                    container2.style.width = "90%";
                  }
                }
              });
              editable.setAttribute("data-title-editable", original);
              editable.textContent = original;
            } else {
              editable.setAttribute("data-title", title);
              editable.setAttribute("data-tip", title);
              let dummy = elementFromHTML3(result.outline), card = editable.closest(".card"), id2 = dummy && dummy.querySelector("h4 span:last-child"), actions = dummy && dummy.querySelector(".outline-actions"), cardId = card && card.querySelector("h4 span:last-child"), cardActions = card && card.querySelector(".outline-actions");
              if (id2 && cardId) {
                cardId.innerHTML = id2.innerHTML;
              }
              if (actions && cardActions) {
                cardActions.innerHTML = actions.innerHTML;
              }
            }
            indicator6.hide(parent);
            if (editButton) {
              editButton.classList.remove("disabled");
            }
          });
        });
      });
    };
    dom16.delegate(body, "click", "[data-genesis-outline-create], [data-genesis-outline-duplicate]", function(event, trigger) {
      event.preventDefault();
      modal10.open({
        content: "Loading",
        method: "post",
        overlayClickToClose: false,
        remote: parseAjaxURI9(trigger.href + getAjaxSuffix9()),
        remoteLoaded: function(response, content) {
          if (!response.body.success) {
            modal10.enableCloseByOverlay();
            return;
          }
          let container2 = modal10.element(content.elements.content), title = container2.querySelector('[name="title"]'), confirm = container2.querySelector("[data-g-outline-create-confirm]");
          if (!title || !confirm) {
            return;
          }
          title.addEventListener("keyup", function(keyEvent) {
            if (keyEvent.key === "Enter") {
              confirm.click();
            }
          });
          confirm.addEventListener("click", function(confirmEvent) {
            confirmEvent.preventDefault();
            indicator6.hide(confirm);
            indicator6.show(confirm);
            let checkedFrom = container2.querySelector('[name="from"]:checked'), preset = container2.querySelector('[name="preset"]'), outline = container2.querySelector('[name="outline"]'), inherit = container2.querySelector('[name="inherit"]'), data = {
              title: title.value,
              from: checkedFrom ? checkedFrom.value : null,
              preset: preset ? preset.value : null,
              outline: outline ? outline.value : null,
              inherit: inherit && inherit.checked ? 1 : 0
            };
            Object.keys(data).forEach(function(key) {
              if (!data[key]) {
                delete data[key];
              }
            });
            let uri = parseAjaxURI9(confirm.getAttribute("data-g-outline-create-confirm") + getAjaxSuffix9());
            request10("post", uri, data, function(error, resultResponse) {
              indicator6.hide(confirm);
              let result = resultResponse && resultResponse.body;
              if (!result || !result.success) {
                modal10.open({ content: result ? result.html || result.message || result : error.message });
                return;
              }
              let base2 = document.querySelector("#configurations ul li"), created = document.createElement("li");
              if (base2) {
                created.className = base2.className;
                created.innerHTML = result.outline;
                base2.after(created);
                attachEditables(created.querySelectorAll("[data-title-editable]"));
              }
              toastr5.success(result.html || "Action successfully completed.", result.title || "");
              modal10.close();
            });
          });
          setTimeout(function() {
            title.focus();
          }, 5);
        }
      });
    });
    dom16.delegate(body, "change", 'input[type="radio"]#from-preset, input[type="radio"]#from-outline', function(event, element) {
      let card = element.closest(".card");
      if (!card) {
        return;
      }
      card.querySelectorAll(".g-create-from").forEach(function(block) {
        block.style.display = block.classList.contains("g-create-from-" + element.value) ? "block" : "none";
      });
    });
    dom16.delegate(body, "click", "#configurations [data-g-config]", function(event, element) {
      event.preventDefault();
      let mode = element.getAttribute("data-g-config"), href = element.getAttribute("data-g-config-href"), hrefConfirm = element.getAttribute("data-g-config-href-confirm"), encoded = window.btoa(href), method = (element.getAttribute("data-g-config-method") || "post").toLowerCase();
      if (mode === "delete" && !flags5.get("free:to:delete:" + encoded, false)) {
        flags5.warning({
          url: parseAjaxURI9(href + getAjaxSuffix9()),
          callback: function(response, content) {
            let container2 = asElement7(content), confirm = container2 && container2.querySelector("[data-g-delete-confirm]"), cancel = container2 && container2.querySelector("[data-g-delete-cancel]");
            if (!confirm) {
              return;
            }
            confirm.addEventListener("click", function(confirmEvent) {
              confirmEvent.preventDefault();
              if (confirm.disabled) {
                return;
              }
              flags5.set("free:to:delete:" + encoded, true);
              confirm.disabled = true;
              if (cancel) {
                cancel.disabled = true;
              }
              element.click();
              modal10.close();
            });
            if (cancel) {
              cancel.addEventListener("click", function(cancelEvent) {
                cancelEvent.preventDefault();
                if (cancel.disabled) {
                  return;
                }
                confirm.disabled = true;
                cancel.disabled = true;
                flags5.set("free:to:delete:" + encoded, false);
                modal10.close();
              });
            }
          }
        });
        return;
      }
      indicator6.hide(element);
      indicator6.show(element);
      request10(method, parseAjaxURI9((hrefConfirm || href) + getAjaxSuffix9()), {}, function(error, response) {
        let result = response && response.body;
        if (!result || !result.success) {
          modal10.open({ content: result ? result.html || result.message || result : error.message });
        } else {
          let selector = document.querySelector("#configuration-selector"), currentOutline = selector ? selector.value : null, outlineDeleted = result.outline, reload = Array.from(document.querySelectorAll("[href]")).find(function(link) {
            return link.getAttribute("href") === getAjaxURL13("configurations");
          });
          if (outlineDeleted && currentOutline === outlineDeleted && selector && selector.selectizeInstance && reload) {
            let ids = Object.keys(selector.selectizeInstance.Options);
            if (ids.length) {
              reload.href = reload.href.replace("style=" + outlineDeleted, "style=" + ids.shift());
            }
          }
          if (reload) {
            reload.click();
          } else {
            window.location.reload();
          }
          toastr5.success(result.html || "Action successfully completed.", result.title || "");
          if (outlineDeleted) {
            body.outlineDeleted = outlineDeleted;
          }
        }
        indicator6.hide(element);
      });
    });
    body.addEventListener("statechangeEnd", function() {
      attachEditables(document.querySelectorAll("#configurations [data-title-editable]"));
    });
    attachEditables(document.querySelectorAll("#configurations [data-title-editable]"));
  });

  // platforms/common/application/positions/index.js
  var dom17 = dom_default;
  var modal11 = ui_default.modal;
  var toastr6 = ui_default.toastr;
  var request11 = request_default;
  var indicator7 = indicator_default;
  var getAjaxSuffix10 = get_ajax_suffix_default;
  var parseAjaxURI10 = get_ajax_url_default.parse;
  var getAjaxURL14 = get_ajax_url_default.global;
  var Submit4 = submit;
  var flags6 = flags_state_default;
  var translate12 = translate_default;
  var Cards2 = cards_default;
  var trim4 = function(value) {
    return value == null ? "" : String(value).trim();
  };
  var asElement8 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var elementFromHTML4 = function(html) {
    let template = document.createElement("template");
    template.innerHTML = String(html || "").trim();
    return template.content.firstElementChild;
  };
  var showError = function(error, response) {
    let result = response && response.body;
    modal11.open({
      content: result ? result.html || result.message || result : error ? error.message : "Request failed.",
      afterOpen: function(container2) {
        container2 = modal11.element(container2);
        if (result && !result.html && !result.message && container2) {
          container2.style.width = "90%";
        }
      }
    });
  };
  dom17.ready(function() {
    let body = document.body, warningURL = parseAjaxURI10(getAjaxURL14("confirmdeletion") + getAjaxSuffix10());
    Cards2.init();
    let attachEditableValidation = function(container2) {
      let editable = container2.querySelector("[data-title-editable]");
      if (!editable || editable.gPositionModalTitleAttached) {
        return;
      }
      editable.gPositionModalTitleAttached = true;
      editable.addEventListener("genesis:title-edit-end", function(event) {
        let title = trim4(event.detail && event.detail.title);
        if (!title) {
          title = trim4(event.detail && event.detail.original) || "Title";
          editable.textContent = title;
          editable.setAttribute("data-title-editable", title);
        }
      });
    };
    let attachEditables = function(editables) {
      editables.forEach(function(editable) {
        if (editable.confWasAttached) {
          return;
        }
        editable.confWasAttached = true;
        editable.addEventListener("genesis:title-edit-start", function() {
          editable.style.textOverflow = "inherit";
        });
        editable.addEventListener("genesis:title-edit-end", function(event) {
          let detail = event.detail || {};
          editable.style.textOverflow = "ellipsis";
          if (detail.canceled || detail.title === detail.original) {
            return;
          }
          let href = editable.getAttribute("data-g-config-href"), type = editable.getAttribute("data-title-editable-type"), method = (editable.getAttribute("data-g-config-method") || "post").toLowerCase(), parent = editable.closest("[id]"), editButton = parent && parent.querySelector("[data-title-edit]"), data = type === "title" ? { title: trim4(detail.title) } : { key: trim4(detail.title) }, position = parent && parent.querySelector("[data-genesis-position]");
          if (!parent || !position) {
            return;
          }
          data.data = position.getAttribute("data-genesis-position");
          indicator7.show(parent);
          if (editButton) {
            editButton.classList.add("disabled");
          }
          request11(method, parseAjaxURI10(href + getAjaxSuffix10()), data, function(error, response) {
            let result = response && response.body;
            if (!result || !result.success) {
              showError(error, response);
              editable.setAttribute("data-title-editable", detail.original);
              editable.textContent = detail.original;
            } else {
              let replacement = elementFromHTML4(result.position), replacementPosition = replacement && (replacement.matches("[id]") ? replacement : replacement.querySelector("[id]"));
              if (replacementPosition) {
                parent.innerHTML = replacementPosition.innerHTML;
                attachEditables(parent.querySelectorAll("[data-title-editable]"));
              }
            }
            indicator7.hide(parent);
            if (editButton) {
              editButton.classList.remove("disabled");
            }
          });
        });
      });
    };
    dom17.delegate(body, "click", '#positions [data-g-config], [data-g-create="position"]', function(event, element) {
      event.preventDefault();
      let mode = element.getAttribute("data-g-config"), href = element.getAttribute("data-g-config-href"), encoded = window.btoa(href), method = (element.getAttribute("data-g-config-method") || "post").toLowerCase();
      if (mode === "delete" && !flags6.get("free:to:delete:" + encoded, false)) {
        flags6.warning({
          url: warningURL,
          data: { page_type: "POSITION" },
          callback: function(response, content) {
            let container2 = asElement8(content), confirm = container2 && container2.querySelector("[data-g-delete-confirm]"), cancel = container2 && container2.querySelector("[data-g-delete-cancel]");
            if (!confirm) {
              return;
            }
            confirm.addEventListener("click", function(confirmEvent) {
              confirmEvent.preventDefault();
              if (confirm.disabled) {
                return;
              }
              flags6.set("free:to:delete:" + encoded, true);
              confirm.disabled = true;
              if (cancel) {
                cancel.disabled = true;
              }
              element.click();
              modal11.close();
            });
            if (cancel) {
              cancel.addEventListener("click", function(cancelEvent) {
                cancelEvent.preventDefault();
                if (cancel.disabled) {
                  return;
                }
                confirm.disabled = true;
                cancel.disabled = true;
                flags6.set("free:to:delete:" + encoded, false);
                modal11.close();
              });
            }
          }
        });
        return;
      }
      indicator7.hide(element);
      indicator7.show(element);
      request11(method, parseAjaxURI10(href + getAjaxSuffix10()), {}, function(error, response) {
        let result = response && response.body;
        if (!result || !result.success) {
          showError(error, response);
        } else {
          let reload = Array.from(document.querySelectorAll("[href]")).find(function(link) {
            return link.getAttribute("href") === getAjaxURL14("positions");
          });
          if (reload) {
            reload.click();
          } else {
            window.location.reload();
          }
          toastr6.success(result.html || "Action successfully completed.", result.title || "");
          if (result.position) {
            body.positionDeleted = result.position;
          }
        }
        indicator7.hide(element);
      });
    });
    dom17.delegate(body, "click", "#positions .position-add", function(event, element) {
      event.preventDefault();
      modal11.open({
        content: translate12("GENESIS_PLATFORM_JS_LOADING"),
        method: "get",
        overlayClickToClose: false,
        remote: parseAjaxURI10(element.href + getAjaxSuffix10()),
        remoteLoaded: function(response, content) {
          if (!response.body.success) {
            modal11.enableCloseByOverlay();
            return;
          }
          let container2 = modal11.element(content.elements.content), search2 = container2.querySelector(".search input"), blocks = container2.querySelectorAll("[data-mm-type]"), filters = container2.querySelectorAll("[data-mm-filter]"), urlTemplate = container2.querySelector(".g-urltemplate");
          if (urlTemplate) {
            urlTemplate.dispatchEvent(new Event("input", { bubbles: true }));
          }
          attachEditableValidation(container2);
          if (search2 && filters.length && blocks.length) {
            search2.addEventListener("input", function() {
              let value = search2.value.toLowerCase();
              blocks.forEach(function(block) {
                block.classList.toggle("hidden", Boolean(value));
              });
              if (!value) {
                return;
              }
              filters.forEach(function(filter) {
                let text = trim4(filter.getAttribute("data-mm-filter")).toLowerCase(), match = text.startsWith(value) || text.includes(" " + value), block = filter.matches("[data-mm-type]") ? filter : filter.closest("[data-mm-type]");
                if (match && block) {
                  block.classList.remove("hidden");
                }
              });
            });
          }
          if (search2) {
            setTimeout(function() {
              search2.focus();
            }, 5);
          }
        }
      });
    });
    dom17.delegate(body, "click", "#positions .item-settings", function(event, element) {
      event.preventDefault();
      let item = element.closest("[data-pm-data]"), positionElement = element.closest("[data-genesis-position]");
      if (!item || !positionElement) {
        return;
      }
      let position = JSON.parse(positionElement.getAttribute("data-genesis-position"));
      modal11.open({
        content: translate12("GENESIS_PLATFORM_JS_LOADING"),
        method: "post",
        data: { position: position.name, item: item.getAttribute("data-pm-data") },
        overlayClickToClose: false,
        remote: parseAjaxURI10(getAjaxURL14("positions/edit/" + item.getAttribute("data-pm-blocktype")) + getAjaxSuffix10()),
        remoteLoaded: function(response, content) {
          if (!response.body.success) {
            modal11.enableCloseByOverlay();
            return;
          }
          let container2 = modal11.element(content.elements.content), form = container2.querySelector("form"), submits = container2.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');
          attachEditableValidation(container2);
          if (!form || !submits.length) {
            return true;
          }
          submits.forEach(function(target) {
            target.addEventListener("click", function(submitEvent) {
              submitEvent.preventDefault();
              target.disabled = true;
              indicator7.hide(target);
              indicator7.show(target);
              form = container2.querySelector("form");
              let post = Submit4(form.elements, container2);
              if (post.invalid.length) {
                target.disabled = false;
                indicator7.hide(target);
                indicator7.show(target, "fa fa-fw fa-exclamation-triangle");
                toastr6.error(translate12("GENESIS_PLATFORM_JS_REVIEW_FIELDS"), translate12("GENESIS_PLATFORM_JS_INVALID_FIELDS"));
                return;
              }
              request11(form.method, parseAjaxURI10(form.action + getAjaxSuffix10()), post.valid.join("&"), function(error, resultResponse) {
                let result = resultResponse && resultResponse.body;
                if (!result || !result.success) {
                  showError(error, resultResponse);
                } else {
                  item.setAttribute("data-pm-data", JSON.stringify(result.item));
                  let enabled = result.item.enabled || result.item.options.attributes.enabled, replacement = elementFromHTML4(result.html);
                  if (replacement) {
                    item.innerHTML = replacement.innerHTML;
                  }
                  item.classList.toggle("g-menu-item-disabled", String(enabled) === "0");
                  if (target.hasAttribute("data-apply-and-save")) {
                    let save = document.querySelector(".button-save");
                    if (save) {
                      save.click();
                    }
                  }
                  Cards2.serialize(positionElement);
                  Cards2.updatePendingChanges();
                  modal11.close();
                  toastr6.success(translate12("GENESIS_PLATFORM_JS_POSITIONS_SETTINGS_APPLIED"), translate12("GENESIS_PLATFORM_JS_SETTINGS_APPLIED"));
                }
                target.disabled = false;
                indicator7.hide(target);
              });
            });
          });
        }
      });
    });
    dom17.delegate(body, "change", '[data-genesis-positions-assignments] input[type="hidden"]', function(event, element) {
      let card = element.closest(".card"), wrapper = card && card.querySelector(".settings-param-wrapper");
      if (!wrapper) {
        return;
      }
      wrapper.classList.toggle("hide", element.value !== "1");
      wrapper.querySelectorAll('input[type="hidden"]').forEach(function(input) {
        input.value = "0";
        input.disabled = true;
      });
    });
    body.addEventListener("statechangeEnd", function() {
      attachEditables(document.querySelectorAll("#positions [data-title-editable]"));
    });
    attachEditables(document.querySelectorAll("#positions [data-title-editable]"));
  });

  // platforms/common/application/changelog/index.js
  var modal12 = ui_default.modal;
  var parseAjaxURI11 = get_ajax_url_default.parse;
  var getAjaxURL15 = get_ajax_url_default.global;
  var getAjaxSuffix11 = get_ajax_suffix_default;
  var { ready: ready9, delegate: delegate6 } = dom_default;
  var setCollapsed = (section, collapsed) => {
    const icon = section.querySelector(".g-changelog-toggle");
    const details = section.nextElementSibling;
    if (icon) {
      icon.classList.toggle("fa-chevron-down", collapsed);
      icon.classList.toggle("fa-chevron-up", !collapsed);
    }
    if (details) {
      details.hidden = collapsed;
      details.style.overflow = collapsed ? "hidden" : "";
      details.style.height = collapsed ? "0" : "";
    }
  };
  ready9(() => {
    delegate6(document.body, "click", "[data-changelog]", (event, link) => {
      event.preventDefault();
      modal12.open({
        content: "Loading",
        method: "post",
        className: "genesis-dialog-theme-default genesis-modal-changelog",
        data: { version: link.dataset.changelog },
        remote: parseAjaxURI11("".concat(getAjaxURL15("changelog")).concat(getAjaxSuffix11())),
        remoteLoaded(response, content) {
          if (!response.body.success) return;
          const wrapper = content.elements.content[0] || content.elements.content;
          wrapper.querySelectorAll("#g-changelog > ol > li > a").forEach((section) => {
            if (!section.textContent.trim()) return;
            const current = new RegExp("#(common|".concat(window.GENESIS_PLATFORM, ")$"), "i").test(section.href);
            const icon = document.createElement("i");
            icon.className = "fa g-changelog-toggle fa-fw fa-chevron-".concat(current ? "up" : "down");
            icon.setAttribute("aria-hidden", "true");
            section.append(icon);
            setCollapsed(section, !current);
            section.addEventListener("click", (clickEvent) => {
              clickEvent.preventDefault();
              const details = section.nextElementSibling;
              if (details) setCollapsed(section, !details.hidden);
            });
          });
        }
      });
    });
  });

  // platforms/common/application/fields/multicheckbox.js
  var { ready: ready10, delegate: delegate7 } = dom_default;
  var parseValues = (value) => new Set(String(value || "").split(",").filter(Boolean));
  var serializeValues = (values) => [...values].join(",");
  var escapeSelector = (value) => window.CSS && CSS.escape ? CSS.escape(value) : String(value).replace(/["\\]/g, "\\$&");
  ready10(() => {
    delegate7(document.body, "change", '.input-multicheckbox .input-group input[name][type="hidden"]', (event, input) => {
      const values = parseValues(input.value);
      const name = escapeSelector(input.name);
      document.querySelectorAll('[data-multicheckbox-field="'.concat(name, '"]')).forEach((field) => {
        if (field.checked) values.add(field.value);
        else values.delete(field.value);
      });
      input.value = serializeValues(values);
    });
    delegate7(document.body, "change", '.input-multicheckbox .input-group input[data-multicheckbox-field][type="checkbox"]', (event, checkbox) => {
      const fieldName = checkbox.dataset.multicheckboxField;
      const hidden = document.querySelector('[name="'.concat(escapeSelector(fieldName), '"]'));
      if (!hidden) return;
      const values = parseValues(hidden.value);
      if (checkbox.checked) values.add(checkbox.value);
      else values.delete(checkbox.value);
      hidden.value = serializeValues(values);
      hidden.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  // platforms/common/application/fields/index.js
  var dom18 = dom_default;
  var flags7 = flags_state_default;
  var submit2 = submit;
  var mapsEqual = function(first, second, comparator) {
    if (!(first instanceof Map) || !(second instanceof Map) || first.size !== second.size) {
      return false;
    }
    for (let entry of first) {
      if (!second.has(entry[0]) || !comparator(entry[1], second.get(entry[0]))) {
        return false;
      }
    }
    return true;
  };
  var readData = function(element, name) {
    return element.getAttribute("data-" + name);
  };
  var fieldValue = function(field, value) {
    if (arguments.length > 1) {
      field.value = value;
      return value;
    }
    if (field instanceof HTMLSelectElement && field.multiple) {
      return Array.from(field.selectedOptions, function(option) {
        return option.value;
      });
    }
    return field.value == null ? "" : field.value;
  };
  var findIndicator = function(element) {
    return element ? element.querySelector("i") : null;
  };
  var showIndicator = function(element, className) {
    if (!element) {
      return;
    }
    let icon = findIndicator(element);
    element.gHadIcon = Boolean(icon);
    if (!icon) {
      if (!element.querySelector("span") && element.children.length === 0) {
        let label = document.createElement("span");
        label.textContent = element.textContent;
        element.textContent = "";
        element.appendChild(label);
      }
      icon = document.createElement("i");
      element.insertBefore(icon, element.firstChild);
    }
    if (!element.gIndicator) {
      element.gIndicator = icon.getAttribute("class") || true;
    }
    icon.setAttribute("class", className || "fa fa-fw fa-spin-fast fa-spinner");
  };
  var hideIndicator = function(element) {
    if (!element || !element.gIndicator) {
      return;
    }
    let icon = findIndicator(element);
    if (!icon) {
      return;
    }
    if (!element.gHadIcon) {
      icon.remove();
    } else {
      icon.setAttribute("class", element.gIndicator);
    }
    element.gIndicator = null;
  };
  var originals;
  var presetsCache;
  var collectFieldsValues = function(keys2) {
    let map = /* @__PURE__ */ new Map(), defaultsElement = document.querySelector("[data-g-styles-defaults]"), defaults6 = defaultsElement ? JSON.parse(readData(defaultsElement, "g-styles-defaults")) : {}, overrides = document.querySelectorAll('input[type="checkbox"].settings-param-toggle');
    if (overrides.length) {
      let states = {};
      overrides.forEach(function(override) {
        states[override.id] = override.checked;
      });
      map.set("__js__overrides", JSON.stringify(states));
    }
    if (keys2) {
      keys2.forEach(function(key) {
        let field = document.querySelector('[name="' + CSS.escape(key) + '"]');
        if (field) {
          map.set(key, fieldValue(field));
        }
      });
      return map;
    }
    let fields2 = document.querySelectorAll(".settings-block [name]");
    if (!fields2.length) {
      return false;
    }
    fields2.forEach(function(field) {
      let key = field.getAttribute("name"), isInput = !Object.prototype.hasOwnProperty.call(defaults6, key);
      if (field.type === "checkbox" && !fieldValue(field).length) {
        fieldValue(field, "0");
      }
      map.set(key, isInput ? fieldValue(field) : defaults6[key]);
    });
    return map;
  };
  var createMapFrom = function(data) {
    return new Map(Object.keys(data).map(function(key) {
      return [key, data[key]];
    }));
  };
  var compare = {
    single: function() {
    },
    whole: function() {
    },
    blanks: function() {
    },
    presets: function() {
    }
  };
  dom18.ready(function() {
    let body = document.body;
    originals = collectFieldsValues();
    compare.single = function(event, element) {
      let parent = element.closest(".settings-param, h4, .input-group"), target = parent ? parent.matches("h4") ? parent : parent.querySelector(".settings-param-title, .g-instancepicker-title") : null, override = parent ? parent.querySelector(".settings-param-toggle") : null, isNewWidget = false, isOverrideToggle = element.classList.contains("settings-param-toggle");
      if (!parent) {
        return;
      }
      if (isOverrideToggle) {
        compare.whole("force");
        return;
      }
      if (element.type === "checkbox") {
        fieldValue(element, Number(element.checked).toString());
      }
      let name = element.getAttribute("name");
      if (originals && originals.get(name) == null) {
        originals.set(name, fieldValue(element));
        isNewWidget = true;
      }
      if (!target || !originals || originals.get(name) == null) {
        return;
      }
      if (originals.get(name) !== fieldValue(element) || isNewWidget) {
        if (override && event.forceOverride && !override.checked) {
          override.click();
        }
        showIndicator(target, "changes-indicator font-small far fa-circle fa-fw");
      } else {
        if (override && event.forceOverride && override.checked) {
          override.click();
        }
        hideIndicator(target);
      }
      compare.blanks(event, parent.querySelector(".settings-param-field"));
      compare.whole("force");
      compare.presets();
    };
    compare.whole = function(force) {
      if (!originals) {
        return;
      }
      let current = collectFieldsValues(force ? Array.from(originals.keys()) : null), equals = mapsEqual(originals, current, function(a, b) {
        if (typeof a === "string" && typeof b === "string" && a[0] === "#" && b[0] === "#") {
          return a.toLowerCase() === b.toLowerCase();
        }
        return Object.is(a, b);
      }), saves = document.querySelectorAll("[data-save]");
      flags7.set("pending", !equals);
      saves.forEach(function(save) {
        if (equals) {
          hideIndicator(save);
        } else {
          showIndicator(save, "changes-indicator far fa-circle fa-fw");
        }
      });
    };
    compare.blanks = function(event, element) {
      if (!element) {
        return;
      }
      let field = element.querySelector("[name]"), reset = element.querySelector(".g-reset-field");
      if (!field || !reset) {
        return true;
      }
      reset.style.display = !fieldValue(field) || field.disabled ? "none" : "";
    };
    compare.presets = function(preserveServerSelection) {
      let presets = document.querySelectorAll("[data-g-styles]");
      if (!presets.length) {
        return;
      }
      if (!presetsCache) {
        presetsCache = /* @__PURE__ */ new Map();
        presets.forEach(function(preset) {
          presetsCache.set(preset, createMapFrom(JSON.parse(readData(preset, "g-styles"))));
        });
      }
      if (preserveServerSelection) {
        return;
      }
      presetsCache.forEach(function(presetMap, preset) {
        let fields2 = collectFieldsValues(Array.from(presetMap.keys()));
        fields2.delete("__js__overrides");
        preset.parentElement.classList.toggle("g-preset-match", mapsEqual(fields2, presetMap, function(a, b) {
          return a == b;
        }));
      });
    };
    dom18.delegate(body, "input", '.settings-block input[name][type="text"], .settings-block textarea[name]', compare.single);
    dom18.delegate(body, "change", '.settings-block input[name][type="hidden"], .settings-block input[name][type="checkbox"], .settings-block select[name], .settings-block .selectized[name], .settings-block input[id][type="checkbox"].settings-param-toggle', compare.single);
    dom18.delegate(body, "input", ".g-urltemplate", function(event, element) {
      let parent = element.closest(".settings-param");
      if (!parent || !parent.parentElement) {
        return;
      }
      let link = Array.from(parent.parentElement.children).filter(function(sibling) {
        return sibling !== parent;
      }).map(function(sibling) {
        return sibling.querySelector("[data-g-urltemplate]");
      }).find(Boolean);
      if (link) {
        link.href = readData(link, "g-urltemplate").replace(/#ID#/g, fieldValue(element));
      }
    });
    dom18.delegate(body, "mouseover", ".settings-param-field", compare.blanks);
    dom18.delegate(body, "click", ".g-reset-field", function(event, element) {
      let parent = element.closest(".settings-param-field"), field = parent ? parent.querySelector("[name]") : null;
      if (!field || field.disabled) {
        return;
      }
      if (field.selectizeInstance) {
        field.selectizeInstance.setValue("");
      } else {
        fieldValue(field, "");
      }
      field.dispatchEvent(new Event("change", { bubbles: true }));
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("keyup", { bubbles: true }));
    });
    body.addEventListener("statechangeEnd", function() {
      originals = collectFieldsValues();
      presetsCache = null;
      compare.presets(true);
    });
    body.addEventListener("updateOriginalFields", function() {
      originals = collectFieldsValues();
      presetsCache = null;
      compare.presets();
    });
    compare.presets(true);
  });
  var fields_default = {
    compare,
    collect: collectFieldsValues,
    submit: submit2
  };

  // platforms/common/application/utils/ajaxify-links.js
  var dom19 = dom_default;
  var storage3 = /* @__PURE__ */ new Map();
  var modal13 = ui_default.modal;
  var Selectize5 = selectize_default;
  var indicator8 = indicator_default;
  var request12 = request_default();
  var History4 = history_default;
  var flags8 = flags_state_default;
  var parseAjaxURI12 = get_ajax_url_default.parse;
  var getAjaxSuffix12 = get_ajax_suffix_default;
  var mm = menu_default;
  var ERROR = false;
  var TMP_SELECTIZE_DISABLE = false;
  var ConfNavIndex = -1;
  var asElement9 = function(element) {
    return element && element.nodeType ? element : element && element[0];
  };
  var guid2 = function() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(character) {
      let random = Math.floor(Math.random() * 16), value = character === "x" ? random : random & 3 | 8;
      return value.toString(16);
    });
  };
  var getParam = function(uri, name) {
    return new URL(uri, window.location.href).searchParams.get(name);
  };
  var setParam = function(uri, name, value) {
    let url = new URL(uri, window.location.href), isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(uri);
    url.searchParams.set(name, value);
    return isAbsolute ? url.href : url.pathname + url.search + url.hash;
  };
  var toQueryString = function(parameters) {
    let query = new URLSearchParams();
    Object.keys(parameters || {}).forEach(function(key) {
      let values = Array.isArray(parameters[key]) ? parameters[key] : [parameters[key]];
      values.forEach(function(value) {
        query.append(key, value);
      });
    });
    return query.toString() ? "?" + query.toString() : "";
  };
  var dispatchState = function(type, element, data) {
    let source = asElement9(element), target = type === "statechangeAfter" ? document.body : source || document.body;
    target.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      detail: { target: source || target, Data: data }
    }));
  };
  var showNavbar = function(navbar, visible2) {
    if (!navbar) {
      return;
    }
    navbar.hidden = false;
    navbar.style.display = "";
    let from = getComputedStyle(navbar).opacity;
    let reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animation = navbar.animate(
      [{ opacity: from }, { opacity: visible2 ? 1 : 0 }],
      { duration: reducedMotion ? 0 : 180, easing: "ease", fill: "forwards" }
    );
    animation.finished.catch(function(error) {
      if (error.name !== "AbortError") console.warn("Navbar animation failed.", error);
    }).then(function() {
      animation.cancel();
      navbar.style.opacity = "";
      navbar.hidden = !visible2;
    });
  };
  var setButtonsDisabled = function(buttons, disabled) {
    buttons.filter(Boolean).forEach(function(button) {
      button.disabled = disabled;
    });
  };
  var warningButtons = function(content) {
    content = modal13.element(content);
    return {
      save: content && content.querySelector("[data-g-unsaved-save]"),
      discard: content && content.querySelector("[data-g-unsaved-discard]")
    };
  };
  var clickWithSpinner = function(element, spinner) {
    element = asElement9(element);
    if (!element) {
      return;
    }
    let event = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
    event.activeSpinner = asElement9(spinner);
    element.dispatchEvent(event);
  };
  var selectorChangeEvent = function() {
    document.querySelectorAll("[data-selectize-ajaxify]").forEach(function(selector) {
      Selectize5.initialize([selector]);
      let selectize2 = Selectize5.getInstance(selector);
      if (!selectize2 || selectize2.HasChangeEvent) {
        return;
      }
      selectize2.on("change", function() {
        if (TMP_SELECTIZE_DISABLE) {
          TMP_SELECTIZE_DISABLE = false;
          return;
        }
        let value = selectize2.getValue(), options = selectize2.Options;
        if (!options[value]) {
          return;
        }
        let flagCallback = function() {
          flags8.off("update:pending", flagCallback);
          modal13.close();
          let input = asElement9(selectize2.input);
          input.setAttribute("data-genesis-ajaxify", "");
          input.setAttribute("data-genesis-ajaxify-target", selector.getAttribute("data-genesis-ajaxify-target") || "[data-genesis-content-wrapper]");
          let targetParent = selector.getAttribute("data-genesis-ajaxify-target-parent");
          if (targetParent) {
            input.setAttribute("data-genesis-ajaxify-target-parent", targetParent);
          } else {
            input.removeAttribute("data-genesis-ajaxify-target-parent");
          }
          input.setAttribute("data-genesis-ajaxify-href", options[value].url);
          if (options[value].params) {
            input.setAttribute("data-genesis-ajaxify-params", JSON.stringify(options[value].params));
          } else {
            input.removeAttribute("data-genesis-ajaxify-params");
          }
          let active = document.querySelector("#navbar li.active, #main-header li.active, #navbar li:nth-child(2)");
          if (active) {
            indicator8.show(active);
          }
          clickWithSpinner(input, active);
        };
        if (flags8.get("pending")) {
          flags8.warning({
            callback: function(response, content) {
              let buttons = warningButtons(content);
              if (!buttons.save) {
                return;
              }
              buttons.save.addEventListener("click", function(event) {
                event.preventDefault();
                if (buttons.save.disabled) {
                  return;
                }
                setButtonsDisabled([buttons.save, buttons.discard], true);
                flags8.on("update:pending", flagCallback);
                let save = document.querySelector(".button-save");
                if (save) {
                  save.click();
                }
              });
              if (buttons.discard) {
                buttons.discard.addEventListener("click", function(event) {
                  event.preventDefault();
                  if (buttons.discard.disabled) {
                    return;
                  }
                  setButtonsDisabled([buttons.save, buttons.discard], true);
                  flags8.set("pending", false);
                  flagCallback();
                });
              }
            },
            afterclose: function() {
              TMP_SELECTIZE_DISABLE = true;
              selectize2.setValue(selectize2.getPreviousValue());
            }
          });
          return;
        }
        flagCallback();
      });
      selectize2.HasChangeEvent = true;
    });
  };
  History4.Adapter.bind(window, "statechange", function() {
    if (request12.running()) {
      return false;
    }
    let body = document.body, State = History4.getState(), URI = State.url, Data = State.data || {}, sidebar2 = document.querySelector("#navbar"), mainheader = document.querySelector("#main-header"), params = "";
    if (Data.doNothing) {
      return true;
    }
    if (Object.keys(Data).length && Data.parsed !== false && storage3.has(Data.uuid)) {
      Data = storage3.get(Data.uuid);
    }
    Data.element = asElement9(Data.element);
    let isTopNavOrMenu = false;
    if (Data.element) {
      isTopNavOrMenu = Boolean(Data.element.closest("#main-header") || Data.element.matches(".menu-select-wrap"));
      dispatchState("statechangeBefore", Data.element, Data);
    } else {
      let url = URI.replace(window.location.origin, "");
      Data.element = Array.from(document.querySelectorAll("[href]")).find(function(link) {
        return link.getAttribute("href") === url;
      }) || null;
    }
    URI = parseAjaxURI12(URI + getAjaxSuffix12());
    if (sidebar2 && Data.element) {
      sidebar2.querySelectorAll("li.active").forEach(function(item) {
        item.classList.remove("active");
      });
      if (Data.element.closest("#navbar")) {
        let sideItem = Data.element.closest("li");
        if (sideItem) {
          sideItem.classList.add("active");
        }
      }
    }
    if (mainheader && Data.element && !Data.element.matches("a.menu-item, select.menu-select-wrap")) {
      mainheader.querySelectorAll(".float-right li").forEach(function(item) {
        item.classList.remove("active");
      });
      if (Data.element.closest("#main-header")) {
        let headerItem = Data.element.closest("li");
        if (headerItem) {
          headerItem.classList.add("active");
        }
      }
    }
    if (Data.params) {
      params = toQueryString(JSON.parse(Data.params));
      if (URI.includes("?")) {
        params = params.replace(/^\?/, "&");
      }
    }
    if (!ERROR) {
      modal13.closeAll();
    }
    request12.url(URI + params).data(Data.extras || {}).method(Data.extras ? "post" : "get").send(function(error, response) {
      let result = response && response.body;
      if (!result || !result.success) {
        if (!ERROR) {
          ERROR = true;
          modal13.open({ content: result ? result.html || result.message || result : error ? error.message : "Request failed." });
          History4.back();
        } else {
          ERROR = false;
        }
        if (Data.element) {
          indicator8.hide(Data.element);
        }
        return false;
      }
      let target = Data.parent && Data.element ? Data.element.closest(Data.parent) : Data.target ? document.querySelector(Data.target) : null, destination = target || document.querySelector("[data-genesis-content]") || body;
      document.dispatchEvent(new CustomEvent("genesis:content-replacing"));
      destination.innerHTML = result.html || result;
      let fader = destination.matches("[data-genesis-content]") ? destination : destination.querySelector("[data-genesis-content]");
      if (fader) {
        fader.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease" });
        if (isTopNavOrMenu && sidebar2) {
          sidebar2.setAttribute("tabindex", "-1");
          sidebar2.setAttribute("aria-hidden", "true");
        }
        showNavbar(sidebar2, !isTopNavOrMenu);
      }
      if (Data.element) {
        dispatchState("statechangeAfter", Data.element, Data);
      }
      let spinner = Data.event && Data.event.activeSpinner || Data.element;
      if (spinner) {
        indicator8.hide(spinner);
      }
      Selectize5.initialize(document.querySelectorAll("[data-selectize]"));
      selectorChangeEvent();
      body.dispatchEvent(new CustomEvent("statechangeEnd", { bubbles: true }));
    });
  });
  dom19.ready(function() {
    let body = document.body;
    if (window.GENESIS_AJAX_NONCE) {
      let currentURI = History4.getPageUrl(), currentNonce;
      if (window.GENESIS_PLATFORM === "wordpress") {
        currentNonce = getParam(currentURI, "_wpnonce");
        if (currentNonce !== window.GENESIS_AJAX_NONCE) {
          currentURI = setParam(currentURI, "_wpnonce", window.GENESIS_AJAX_NONCE);
          History4.replaceState({ uuid: guid2(), doNothing: true }, document.title, currentURI);
        }
      } else if (window.GENESIS_PLATFORM === "grav") {
        currentNonce = getParam(currentURI, "nonce");
        if (currentNonce !== window.GENESIS_AJAX_NONCE) {
          currentURI = setParam(currentURI, "nonce", window.GENESIS_AJAX_NONCE);
          History4.replaceState({ uuid: guid2(), doNothing: true }, document.title, currentURI);
        }
      }
    }
    dom19.delegate(body, "click", ".button-back-to-conf", function(event, element) {
      event.preventDefault();
      let confSelector = document.querySelector("#configuration-selector"), outlineDeleted = body.outlineDeleted, currentOutline = confSelector && confSelector.value, navbar = document.querySelector("#navbar");
      if (!confSelector || !navbar) {
        return;
      }
      ConfNavIndex = ConfNavIndex === -1 ? 1 : ConfNavIndex;
      let item = navbar.querySelector("li:nth-child(" + (ConfNavIndex + 1) + ") [data-genesis-ajaxify]");
      if (!item) {
        return;
      }
      let continueBack = function() {
        flags8.off("update:pending", continueBack);
        modal13.close();
        item.click();
        navbar.removeAttribute("tabindex");
        navbar.setAttribute("aria-hidden", "false");
        showNavbar(navbar, true);
      };
      if (flags8.get("pending")) {
        flags8.warning({
          callback: function(response, content) {
            let buttons = warningButtons(content);
            if (!buttons.save) {
              return;
            }
            buttons.save.addEventListener("click", function(saveEvent) {
              saveEvent.preventDefault();
              if (buttons.save.disabled) {
                return;
              }
              setButtonsDisabled([buttons.save, buttons.discard], true);
              flags8.on("update:pending", continueBack);
              let save = document.querySelector(".button-save");
              if (save) {
                save.click();
              }
            });
            if (buttons.discard) {
              buttons.discard.addEventListener("click", function(discardEvent) {
                discardEvent.preventDefault();
                if (buttons.discard.disabled) {
                  return;
                }
                setButtonsDisabled([buttons.save, buttons.discard], true);
                flags8.set("pending", false);
                continueBack();
              });
            }
          }
        });
        return;
      }
      indicator8.show(element);
      if (outlineDeleted == currentOutline) {
        let selectize2 = Selectize5.getInstance(confSelector), ids = selectize2 ? Object.keys(selectize2.Options) : [], id2 = ids.shift();
        body.outlineDeleted = null;
        if (id2) {
          item.href = item.href.replace("/" + outlineDeleted + "/", "/" + id2 + "/").replace("style=" + outlineDeleted, "style=" + id2);
        }
      }
      item.click();
      navbar.removeAttribute("tabindex");
      showNavbar(navbar, true);
    });
    dom19.delegate(body, "click", "#navbar a[data-genesis-ajaxify]", function(event, element) {
      let links = document.querySelectorAll("#navbar li a[data-genesis-ajaxify]");
      ConfNavIndex = Array.from(links).indexOf(element) + 1;
    });
    dom19.delegate(body, "click", "[data-genesis-ajaxify]", function(event, element) {
      if (event.which === 2 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
      let replay = function() {
        flags8.off("update:pending", replay);
        modal13.close();
        element.click();
      };
      if (flags8.get("pending") && !element.matches("a.menu-item") && !element.closest("[data-menu-items]")) {
        flags8.warning({
          callback: function(response, content) {
            let buttons = warningButtons(content);
            if (!buttons.save) {
              return;
            }
            buttons.save.addEventListener("click", function(saveEvent) {
              saveEvent.preventDefault();
              if (buttons.save.disabled) {
                return;
              }
              setButtonsDisabled([buttons.save, buttons.discard], true);
              flags8.on("update:pending", replay);
              let save = document.querySelector(".button-save");
              if (save) {
                save.click();
              }
            });
            if (buttons.discard) {
              buttons.discard.addEventListener("click", function(discardEvent) {
                discardEvent.preventDefault();
                if (buttons.discard.disabled) {
                  return;
                }
                setButtonsDisabled([buttons.save, buttons.discard], true);
                flags8.set("pending", false);
                replay();
              });
            }
          }
        });
        return;
      }
      indicator8.show(element);
      let rawData = element.getAttribute("data-genesis-ajaxify"), target = element.getAttribute("data-genesis-ajaxify-target"), parent = element.getAttribute("data-genesis-ajaxify-target-parent"), url = element.getAttribute("href") || element.getAttribute("data-genesis-ajaxify-href"), params = element.getAttribute("data-genesis-ajaxify-params") || false, title = element.getAttribute("title") || document.title, data = rawData ? JSON.parse(rawData) : { parsed: false };
      if (data) {
        let uuid = guid2(), extras;
        if (element.hasAttribute("data-mm-id") || element.closest("[data-mm-id]")) {
          let menuSelect = document.querySelector("select.menu-select-wrap"), manager = mm.menumanager;
          if (manager) {
            extras = {
              menutype: menuSelect ? menuSelect.value : "",
              settings: JSON.stringify(manager.settings),
              ordering: JSON.stringify(manager.ordering),
              items: JSON.stringify(manager.items)
            };
          }
        }
        storage3.set(uuid, Object.assign({}, data, {
          target,
          parent,
          element,
          params,
          extras,
          event
        }));
        data = { uuid };
      }
      History4.pushState(data, title, url);
      let navbar = element.closest("#navbar, #main-header");
      if (navbar) {
        document.querySelectorAll("#navbar .active, #main-header .active").forEach(function(active) {
          active.classList.remove("active");
        });
        let item = element.closest("li");
        if (item) {
          item.classList.add("active");
        }
      }
    });
    selectorChangeEvent();
  });

  // platforms/common/application/utils/async-foreach.js
  var asyncForEach = function(arr, eachFn, doneFn) {
    arr = arr || [];
    let i = -1;
    let len = arr.length >>> 0;
    (function next(result) {
      let async;
      let abort = result === false;
      do {
        ++i;
      } while (!(i in arr) && i !== len);
      if (abort || i === len) {
        if (doneFn) {
          doneFn(!abort, arr);
        }
        return;
      }
      result = eachFn.call({
        // If `this.async` is called inside the `eachFn` callback, set the async
        // flag and return a function that can be used to continue iterating.
        async: function() {
          async = true;
          return next;
        }
      }, arr[i], i, arr);
      if (!async) {
        next(result);
      }
    })();
  };
  var async_foreach_default = asyncForEach;

  // platforms/common/application/assignments/index.js
  var { ready: ready11, delegate: delegate8 } = dom_default;
  var asyncForEach2 = async_foreach_default;
  var cache = /* @__PURE__ */ new WeakMap();
  var visible = (element) => getComputedStyle(element).display !== "none";
  var checked = (element) => Boolean(element && element.checked);
  var hasGlobalFilter = (element) => {
    if (element.closest("[data-g-global-filter]")) return true;
    return element.parentElement ? Array.from(element.parentElement.children).some((sibling) => sibling.matches("[data-g-global-filter]")) : false;
  };
  var emitChange2 = (input) => input.dispatchEvent(new Event("change", { bubbles: true }));
  var Assignments = {
    toggleSection(event, element, index, array) {
      if (event.type.startsWith("touch")) event.preventDefault();
      if (hasGlobalFilter(element)) return Assignments.globalToggleSection(event, element);
      if (element.matches("label")) return Assignments.treatLabel(event, element);
      const card = element.closest(".card");
      const save = document.querySelector("[data-save]");
      const mode = element.getAttribute("data-g-assignments-check") == null ? 0 : 1;
      if (!card) return;
      let stored2 = cache.get(card);
      if (!stored2 || !stored2.inputs) {
        stored2 = Object.assign({}, stored2, {
          inputs: Array.from(card.querySelectorAll('.enabler input[type="hidden"]'))
        });
        cache.set(card, stored2);
      }
      asyncForEach2(stored2.inputs, (item) => {
        const row = item.closest("label, h4");
        if (!row || !visible(row)) return;
        item.value = mode;
        emitChange2(item);
      }, () => {
        if (save && typeof index !== "undefined" && array && index + 1 === array.length) {
          save.disabled = false;
        }
      });
    },
    filterSection(event, element, value, global) {
      if (hasGlobalFilter(element)) return Assignments.globalFilterSection(event, element);
      const card = element.closest(".card");
      const onlyEnabled = document.querySelector("[data-assignments-enabledonly]");
      if (!card) return;
      let stored2 = cache.get(card);
      if (!stored2 || !stored2.labels) {
        stored2 = Object.assign({}, stored2, {
          labels: Array.from(card.querySelectorAll("label .settings-param-title"))
        });
        cache.set(card, stored2);
      }
      const labels = stored2.labels;
      value = value || element.value;
      if (!value && !checked(onlyEnabled)) {
        card.style.display = "inline-block";
        labels.forEach((label) => {
          const row = label.closest("label");
          if (row) row.style.display = "block";
        });
        return;
      }
      let completed = 0;
      let shown = 0;
      const needle = String(value || "").trim().toLowerCase();
      if (!labels.length) card.style.display = checked(onlyEnabled) || value ? "none" : "inline-block";
      asyncForEach2(labels, (item) => {
        const text = item.textContent.trim().toLowerCase();
        const row = item.closest("label, h4");
        let matches3 = !needle || text.startsWith(needle) || text.includes(" ".concat(needle));
        if (checked(onlyEnabled)) {
          const enabled = row && row.querySelector('.enabler input[type="hidden"]');
          matches3 = matches3 && Boolean(Number(enabled ? enabled.value : 0));
        }
        if (matches3) {
          const groupHolder = item.closest("[data-g-assignments-parent]");
          const group = groupHolder && groupHolder.getAttribute("data-g-assignments-parent");
          if (group) {
            const parentGroup = card.querySelector('[data-g-assignments-group="'.concat(CSS.escape(group), '"]'));
            if (parentGroup) parentGroup.style.display = "block";
          }
          if (row) row.style.display = "block";
          shown++;
        } else if (row) {
          row.style.display = "none";
        }
        completed++;
        if (completed === labels.length && global) {
          card.style.display = shown ? "inline-block" : "none";
        }
      });
    },
    filterEnabledOnly(event) {
      const global = document.querySelector('[data-g-global-filter] input[type="text"]');
      Assignments.globalFilterSection(event, global);
    },
    treatLabel(event, element) {
      event.stopPropagation();
      event.preventDefault();
      if (event.target instanceof Element && event.target.closest(".knob, .toggle")) return;
      const input = element.querySelector('input[type="hidden"]:not([disabled])');
      if (!input) return;
      input.value = Number(!Boolean(Number(input.value)));
      emitChange2(input);
      return false;
    },
    globalToggleSection(event, element) {
      const selector = element.getAttribute("data-g-assignments-check") == null ? "[data-g-assignments-uncheck]" : "[data-g-assignments-check]";
      const save = document.querySelector("[data-save]");
      const controls = Array.from(document.querySelectorAll("#assignments .card ".concat(selector, ", .settings-assignments .card ").concat(selector)));
      if (!controls.length) return;
      if (save) save.disabled = true;
      asyncForEach2(controls, (item, index, array) => {
        Assignments.toggleSection(event, item, index, array);
      });
    },
    globalFilterSection(event, element) {
      const value = element ? element.value : "";
      const onlyEnabled = document.querySelector("[data-assignments-enabledonly]");
      const searches = Array.from(document.querySelectorAll('#assignments .card .search input[type="text"], .settings-assignments .card .search input[type="text"]'));
      if (!searches.length && !checked(onlyEnabled)) return;
      asyncForEach2(searches, (item) => {
        Assignments.filterSection(event, item, value, "global");
      });
    },
    toggleStateDelegation(event, element) {
      element.disabled = element.value !== "1";
    }
  };
  ready11(() => {
    const body = document.body;
    delegate8(body, "input", '#assignments .search input[type="text"], .settings-assignments .search input[type="text"]', Assignments.filterSection);
    const toggleSelector = "#assignments .card label, #assignments [data-g-assignments-check], #assignments [data-g-assignments-uncheck], .settings-assignments .card label, .settings-assignments [data-g-assignments-check], .settings-assignments [data-g-assignments-uncheck]";
    delegate8(body, "click", toggleSelector, Assignments.toggleSection);
    delegate8(body, "touchend", toggleSelector, Assignments.toggleSection);
    delegate8(body, "change", "[data-assignments-enabledonly]", Assignments.filterEnabledOnly);
    delegate8(body, "change", '#assignments input[type="hidden"][name], .settings-assignments input[type="hidden"][name]', Assignments.toggleStateDelegation);
  });
  var assignments_default = Assignments;

  // platforms/common/application/styles/index.js
  var modal14 = ui_default.modal;
  var fields = fields_default;
  var { ready: ready12, delegate: delegate9 } = dom_default;
  var escapeSelector2 = (value) => window.CSS && CSS.escape ? CSS.escape(value) : String(value).replace(/["\\]/g, "\\$&");
  var emitFieldEvent = (input, type) => {
    const event = new Event(type, { bubbles: true });
    event.forceOverride = true;
    input.dispatchEvent(event);
  };
  ready12(() => {
    delegate9(document.body, "click", "[data-g-styles]", (event, presetElement) => {
      event.preventDefault();
      if (event.target.closest(".swatch-preview")) return;
      const data = JSON.parse(presetElement.dataset.gStyles || "{}");
      Object.entries(data).forEach(([name, preset]) => {
        const input = document.querySelector('[name="'.concat(escapeSelector2(name), '"]'));
        if (!input || input.value === String(preset)) return;
        if (input.selectizeInstance) input.selectizeInstance.setValue(preset);
        else input.value = preset;
        const type = input.tagName === "SELECT" || ["hidden", "checkbox"].includes(input.type) ? "change" : "input";
        emitFieldEvent(input, type);
        emitFieldEvent(input, "keyup");
      });
      fields.compare.presets();
    });
    delegate9(document.body, "click", "[data-g-styles] .swatch-preview", (event, swatch) => {
      event.preventDefault();
      const preset = swatch.closest("[data-g-styles]");
      const image = preset ? preset.querySelector("img") : null;
      if (!image) return;
      modal14.open({
        content: image.outerHTML,
        afterOpen(container2) {
          const element = container2 && container2[0] ? container2[0] : container2;
          const styles = getComputedStyle(element);
          const padding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
          element.style.maxWidth = "80%";
          element.style.width = "".concat(padding + (image.naturalWidth || image.width), "px");
        }
      });
    });
  });
  var styles_default = {};

  // platforms/common/application/particles/colorpicker/index.js
  var dom20 = dom_collection_default;
  var ready13 = dom_default.ready;
  var zen7 = createElement;
  var clamp4 = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  };
  var supportsPointerEvents = typeof window.PointerEvent === "function";
  var MOUSEDOWN = supportsPointerEvents ? ["pointerdown"] : ["mousedown", "touchstart"];
  var MOUSEMOVE = supportsPointerEvents ? ["pointermove"] : ["mousemove", "touchmove"];
  var MOUSEUP = supportsPointerEvents ? ["pointerup", "pointercancel"] : ["mouseup", "touchend", "touchcancel"];
  var FOCUSIN = "focusin";
  var ColorPicker = class {
    constructor(options) {
      this.options = Object.assign({}, options || {});
      this._bound = /* @__PURE__ */ Object.create(null);
      this._events = /* @__PURE__ */ new Map();
      this.built = false;
      this.attach();
    }
    bound(method) {
      if (!this._bound[method]) {
        this._bound[method] = this[method].bind(this);
      }
      return this._bound[method];
    }
    on(name, callback) {
      let listeners = this._events.get(name) || [];
      listeners.push(callback);
      this._events.set(name, listeners);
      return this;
    }
    emit(name) {
      let args = Array.prototype.slice.call(arguments, 1);
      (this._events.get(name) || []).slice().forEach(function(callback) {
        callback.apply(this, args);
      }, this);
      return this;
    }
    attach() {
      let body = dom20("body");
      MOUSEDOWN.forEach(function(mousedown) {
        body.delegate(mousedown, "[data-genesis-container] .g-colorpicker i", this.bound("iconClick"));
      }, this);
      body.delegate(FOCUSIN, "[data-genesis-container] .g-colorpicker input", this.bound("show"), true);
      body.delegate("keydown", "[data-genesis-container] .g-colorpicker input", (function(event, element) {
        switch (event.keyCode) {
          case 9:
            this.hide();
            break;
          case 13:
          // enter
          case 27:
            this.hide();
            element[0].blur();
            break;
        }
        return true;
      }).bind(this));
      body.delegate("keyup", "[data-genesis-container] .g-colorpicker input", (function(event, element) {
        this.updateFromInput(true, element);
        return true;
      }).bind(this));
      body.delegate("paste", "[data-genesis-container] .g-colorpicker input", (function(event, element) {
        setTimeout((function() {
          this.updateFromInput(true, element);
        }).bind(this), 1);
      }).bind(this));
    }
    show(event, element) {
      let body = dom20("body");
      if (!this.built) {
        this.build();
      }
      this.element = element;
      this.reposition();
      this.wrapper.addClass("cp-visible");
      this.updateFromInput();
      MOUSEMOVE.forEach(function(mousemove) {
        body.on(mousemove, this.bound("bodyMove"));
      }, this);
      MOUSEDOWN.forEach(function(mousedown) {
        this.wrapper.delegate(mousedown, ".cp-grid, .cp-slider, .cp-opacity-slider", this.bound("bodyDown"));
        body.on(mousedown, this.bound("bodyClick"));
      }, this);
      MOUSEUP.forEach(function(mouseup) {
        body.on(mouseup, this.bound("targetReset"));
      }, this);
    }
    hide() {
      let body = dom20("body");
      if (!this.built) {
        return;
      }
      this.wrapper.removeClass("cp-visible");
      this.target = null;
      MOUSEMOVE.forEach(function(mousemove) {
        body.off(mousemove, this.bound("bodyMove"));
      }, this);
      MOUSEDOWN.forEach(function(mousedown) {
        this.wrapper.undelegate(mousedown, ".cp-grid, .cp-slider, .cp-opacity-slider", this.bound("bodyDown"));
        body.off(mousedown, this.bound("bodyClick"));
      }, this);
      MOUSEUP.forEach(function(mouseup) {
        body.off(mouseup, this.bound("targetReset"));
      }, this);
    }
    iconClick(event, element) {
      event.preventDefault();
      let input = dom20(element).sibling("input");
      input[0].focus();
      this.show(event, input);
    }
    bodyMove(event) {
      if (!this.target) {
        return;
      }
      event.preventDefault();
      this.move(this.target, event);
    }
    bodyClick(event) {
      let target = event.target instanceof Element ? event.target : null;
      if (!target || !target.closest(".cp-wrapper") && !target.closest(".g-colorpicker")) {
        this.hide();
      }
    }
    bodyDown(event, element) {
      event.preventDefault();
      this.target = element;
      this.move(this.target, event, true);
    }
    targetReset() {
      this.target = null;
    }
    move(target, event) {
      let input = this.element, picker = target.hasClass("cp-grid") ? this.gridPicker : target.hasClass("cp-opacity-slider") ? this.opacityPicker : this.sliderPicker, clientRect = target[0].getBoundingClientRect(), offsetX = clientRect.left + window.scrollX, offsetY = clientRect.top + window.scrollY, x = Math.round((event ? event.pageX : 0) - offsetX), y = Math.round((event ? event.pageY : 0) - offsetY), wx, wy, r, phi;
      if (event && event.changedTouches) {
        x = (event.changedTouches ? event.changedTouches[0].pageX : 0) - offsetX;
        y = (event.changedTouches ? event.changedTouches[0].pageY : 0) - offsetY;
      }
      if (event && event.manualOpacity) {
        y = clientRect.height;
      }
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > clientRect.width) x = clientRect.width;
      if (y > clientRect.height) y = clientRect.height;
      if (target.parent(".cp-mode-wheel") && picker.parent(".cp-grid")) {
        wx = 75 - x;
        wy = 75 - y;
        r = Math.sqrt(wx * wx + wy * wy);
        phi = Math.atan2(wy, wx);
        if (phi < 0) phi += Math.PI * 2;
        if (r > 75) {
          x = 75 - 75 * Math.cos(phi);
          y = 75 - 75 * Math.sin(phi);
        }
        x = Math.round(x);
        y = Math.round(y);
      }
      if (target.hasClass("cp-grid")) {
        picker.style({
          top: y,
          left: x
        });
        this.updateFromPicker(input, target);
      } else {
        picker.style({
          top: y
        });
        this.updateFromPicker(input, target);
      }
    }
    build() {
      this.wrapper = zen7("div.cp-wrapper.cp-with-opacity.cp-mode-hue");
      this.slider = zen7("div.cp-slider.cp-sprite").bottom(this.wrapper);
      this.sliderPicker = zen7("div.cp-picker").bottom(this.slider);
      this.opacitySlider = zen7("div.cp-opacity-slider.cp-sprite").bottom(this.wrapper);
      this.opacityPicker = zen7("div.cp-picker").bottom(this.opacitySlider);
      this.grid = zen7("div.cp-grid.cp-sprite").bottom(this.wrapper);
      this.gridInner = zen7("div.cp-grid-inner").bottom(this.grid);
      this.gridPicker = zen7("div.cp-picker").bottom(this.grid);
      zen7("div").bottom(this.gridPicker);
      let tabs = zen7("div.cp-tabs").bottom(this.wrapper);
      this.tabs = {
        hue: zen7("div.cp-tab-hue.active").text("HUE").bottom(tabs),
        brightness: zen7("div.cp-tab-brightness").text("BRI").bottom(tabs),
        saturation: zen7("div.cp-tab-saturation").text("SAT").bottom(tabs),
        wheel: zen7("div.cp-tab-wheel").text("WHEEL").bottom(tabs),
        transparent: zen7("div.cp-tab-transp").text("TRANSPARENT").bottom(tabs)
      };
      MOUSEDOWN.forEach(function(mousedown) {
        tabs.delegate(mousedown, "> div", (function(event, element) {
          if (element == this.tabs.transparent) {
            this.opacity = 0;
            let sliderHeight = this.opacitySlider.position().height;
            this.opacityPicker.style({ "top": clamp4(sliderHeight - sliderHeight * this.opacity, 0, sliderHeight) });
            this.move(this.opacitySlider, { manualOpacity: true });
            return;
          }
          let active = tabs.find(".active"), mode = active.attribute("class").replace(/\s|active|cp-tab-/g, ""), newMode = element.attribute("class").replace(/\s|active|cp-tab-/g, "");
          this.wrapper.removeClass("cp-mode-" + mode).addClass("cp-mode-" + newMode);
          active.removeClass("active");
          element.addClass("active");
          this.mode = newMode;
          this.updateFromInput();
        }).bind(this));
      }, this);
      this.wrapper.bottom("[data-genesis-container]");
      this.built = true;
      this.mode = "hue";
    }
    updateFromInput(dontFireEvent, element) {
      element = dom20(element) || this.element;
      let value = element.value(), opacity = value.replace(/\s/g, "").match(/^rgba?\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},(.+)\)/), hex, hsb;
      value = rgbstr2hex(value) || value;
      opacity = opacity ? clamp4(opacity[1], 0, 1) : 1;
      if (!(hex = parseHex(value))) {
        hex = "#ffffff";
      }
      hsb = hex2hsb(hex);
      if (this.built) {
        this.opacity = Math.max(opacity, 0);
        let sliderHeight = this.opacitySlider.position().height;
        this.opacityPicker.style({ "top": clamp4(sliderHeight - sliderHeight * this.opacity, 0, sliderHeight) });
        let gridHeight = this.grid.position().height, gridWidth = this.grid.position().width, r, phi, x, y;
        sliderHeight = this.slider.position().height;
        switch (this.mode) {
          case "wheel":
            r = clamp4(Math.ceil(hsb.s * 0.75), 0, gridHeight / 2);
            phi = hsb.h * Math.PI / 180;
            x = clamp4(75 - Math.cos(phi) * r, 0, gridWidth);
            y = clamp4(75 - Math.sin(phi) * r, 0, gridHeight);
            this.grid.style({ backgroundColor: "transparent" });
            this.gridPicker.style({
              top: y,
              left: x
            });
            y = 150 - hsb.b / (100 / gridHeight);
            if (hex === "") y = 0;
            this.sliderPicker.style({ top: y });
            this.slider.style({
              backgroundColor: hsb2hex({
                h: hsb.h,
                s: hsb.s,
                b: 100
              })
            });
            break;
          case "saturation":
            x = clamp4(5 * hsb.h / 12, 0, 150);
            y = clamp4(gridHeight - Math.ceil(hsb.b / (100 / gridHeight)), 0, gridHeight);
            this.gridPicker.style({
              top: y,
              left: x
            });
            y = clamp4(sliderHeight - hsb.s * (sliderHeight / 100), 0, sliderHeight);
            this.sliderPicker.style({ top: y });
            this.slider.style({
              backgroundColor: hsb2hex({
                h: hsb.h,
                s: 100,
                b: hsb.b
              })
            });
            this.gridInner.style({ opacity: hsb.s / 100 });
            break;
          case "brightness":
            x = clamp4(5 * hsb.h / 12, 0, 150);
            y = clamp4(gridHeight - Math.ceil(hsb.s / (100 / gridHeight)), 0, gridHeight);
            this.gridPicker.style({
              top: y,
              left: x
            });
            y = clamp4(sliderHeight - hsb.b * (sliderHeight / 100), 0, sliderHeight);
            this.sliderPicker.style({ top: y });
            this.slider.style({
              backgroundColor: hsb2hex({
                h: hsb.h,
                s: hsb.s,
                b: 100
              })
            });
            this.gridInner.style({ opacity: 1 - hsb.b / 100 });
            break;
          case "hue":
          default:
            x = clamp4(Math.ceil(hsb.s / (100 / gridWidth)), 0, gridWidth);
            y = clamp4(gridHeight - Math.ceil(hsb.b / (100 / gridHeight)), 0, gridHeight);
            this.gridPicker.style({
              top: y,
              left: x
            });
            y = clamp4(sliderHeight - hsb.h / (360 / sliderHeight), 0, sliderHeight);
            this.sliderPicker.style({ top: y });
            this.grid.style({
              backgroundColor: hsb2hex({
                h: hsb.h,
                s: 100,
                b: 100
              })
            });
            break;
        }
      }
      if (!dontFireEvent) {
        element.value(this.getValue(hex));
      }
      this.emit("change", element, hex, opacity);
    }
    updateFromPicker(input, target) {
      let getCoords = function(picker, container2) {
        let left, top;
        if (!picker.length || !container2) return null;
        left = picker[0].getBoundingClientRect().left;
        top = picker[0].getBoundingClientRect().top;
        return {
          x: left - container2[0].getBoundingClientRect().left + picker[0].offsetWidth / 2,
          y: top - container2[0].getBoundingClientRect().top + picker[0].offsetHeight / 2
        };
      };
      let hex, hue, saturation, brightness, x, y, r, phi, grid = this.wrapper.find(".cp-grid"), slider = this.wrapper.find(".cp-slider"), opacitySlider = this.wrapper.find(".cp-opacity-slider"), gridPicker = this.gridPicker, sliderPicker = this.sliderPicker, opacityPicker = this.opacityPicker, gridPos = getCoords(gridPicker, grid), sliderPos = getCoords(sliderPicker, slider), opacityPos = getCoords(opacityPicker, opacitySlider), gridWidth = grid[0].getBoundingClientRect().width, gridHeight = grid[0].getBoundingClientRect().height, sliderHeight = slider[0].getBoundingClientRect().height, opacitySliderHeight = opacitySlider[0].getBoundingClientRect().height;
      let value = this.element.value();
      value = rgbstr2hex(value) || value;
      if (!(hex = parseHex(value))) {
        hex = "#ffffff";
      }
      if (target.hasClass("cp-grid") || target.hasClass("cp-slider")) {
        switch (this.mode) {
          case "wheel":
            x = gridWidth / 2 - gridPos.x;
            y = gridHeight / 2 - gridPos.y;
            r = Math.sqrt(x * x + y * y);
            phi = Math.atan2(y, x);
            if (phi < 0) phi += Math.PI * 2;
            if (r > 75) {
              r = 75;
              gridPos.x = 69 - 75 * Math.cos(phi);
              gridPos.y = 69 - 75 * Math.sin(phi);
            }
            saturation = clamp4(r / 0.75, 0, 100);
            hue = clamp4(phi * 180 / Math.PI, 0, 360);
            brightness = clamp4(100 - Math.floor(sliderPos.y * (100 / sliderHeight)), 0, 100);
            hex = hsb2hex({
              h: hue,
              s: saturation,
              b: brightness
            });
            slider.style({
              backgroundColor: hsb2hex({
                h: hue,
                s: saturation,
                b: 100
              })
            });
            break;
          case "saturation":
            hue = clamp4(parseInt(gridPos.x * (360 / gridWidth), 10), 0, 360);
            saturation = clamp4(100 - Math.floor(sliderPos.y * (100 / sliderHeight)), 0, 100);
            brightness = clamp4(100 - Math.floor(gridPos.y * (100 / gridHeight)), 0, 100);
            hex = hsb2hex({
              h: hue,
              s: saturation,
              b: brightness
            });
            slider.style({
              backgroundColor: hsb2hex({
                h: hue,
                s: 100,
                b: brightness
              })
            });
            this.gridInner.style({ opacity: saturation / 100 });
            break;
          case "brightness":
            hue = clamp4(parseInt(gridPos.x * (360 / gridWidth), 10), 0, 360);
            saturation = clamp4(100 - Math.floor(gridPos.y * (100 / gridHeight)), 0, 100);
            brightness = clamp4(100 - Math.floor(sliderPos.y * (100 / sliderHeight)), 0, 100);
            hex = hsb2hex({
              h: hue,
              s: saturation,
              b: brightness
            });
            slider.style({
              backgroundColor: hsb2hex({
                h: hue,
                s: saturation,
                b: 100
              })
            });
            this.gridInner.style({ opacity: 1 - brightness / 100 });
            break;
          default:
            hue = clamp4(360 - parseInt(sliderPos.y * (360 / sliderHeight), 10), 0, 360);
            saturation = clamp4(Math.floor(gridPos.x * (100 / gridWidth)), 0, 100);
            brightness = clamp4(100 - Math.floor(gridPos.y * (100 / gridHeight)), 0, 100);
            hex = hsb2hex({
              h: hue,
              s: saturation,
              b: brightness
            });
            grid.style({
              backgroundColor: hsb2hex({
                h: hue,
                s: 100,
                b: 100
              })
            });
            break;
        }
      }
      if (target.hasClass("cp-opacity-slider")) {
        this.opacity = Math.max(parseFloat(1 - opacityPos.y / opacitySliderHeight).toFixed(2), 0);
      }
      input.value(this.getValue(hex));
      this.emit("change", this.element, hex, this.opacity);
    }
    reposition() {
      let offset = this.element[0].getBoundingClientRect(), ct = dom20("[data-genesis-container]")[0].getBoundingClientRect();
      this.wrapper.style({
        top: offset.top + offset.height - ct.top,
        left: offset.left - ct.left
      });
    }
    getValue(hex) {
      if (this.opacity == 1) {
        return hex;
      }
      let rgb = hex2rgb(hex);
      return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + this.opacity + ")";
    }
  };
  var parseHex = function(string) {
    string = string.replace(/[^A-F0-9]/ig, "");
    if (string.length !== 3 && string.length !== 6) return "";
    if (string.length === 3) {
      string = string[0] + string[0] + string[1] + string[1] + string[2] + string[2];
    }
    return "#" + string.toLowerCase();
  };
  var hsb2rgb = function(hsb) {
    let rgb = {};
    let h = Math.round(hsb.h);
    let s = Math.round(hsb.s * 255 / 100);
    let v = Math.round(hsb.b * 255 / 100);
    if (s === 0) {
      rgb.r = rgb.g = rgb.b = v;
    } else {
      let t1 = v;
      let t2 = (255 - s) * v / 255;
      let t3 = (t1 - t2) * (h % 60) / 60;
      if (h === 360) h = 0;
      if (h < 60) {
        rgb.r = t1;
        rgb.b = t2;
        rgb.g = t2 + t3;
      } else if (h < 120) {
        rgb.g = t1;
        rgb.b = t2;
        rgb.r = t1 - t3;
      } else if (h < 180) {
        rgb.g = t1;
        rgb.r = t2;
        rgb.b = t2 + t3;
      } else if (h < 240) {
        rgb.b = t1;
        rgb.r = t2;
        rgb.g = t1 - t3;
      } else if (h < 300) {
        rgb.b = t1;
        rgb.g = t2;
        rgb.r = t2 + t3;
      } else if (h < 360) {
        rgb.r = t1;
        rgb.g = t2;
        rgb.b = t1 - t3;
      } else {
        rgb.r = 0;
        rgb.g = 0;
        rgb.b = 0;
      }
    }
    return {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b)
    };
  };
  var rgb2hex = function(rgb) {
    let hex = [
      rgb.r.toString(16),
      rgb.g.toString(16),
      rgb.b.toString(16)
    ];
    hex.forEach(function(val, nr) {
      if (val.length === 1) hex[nr] = "0" + val;
    });
    return "#" + hex.join("");
  };
  var rgbstr2hex = function(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return rgb && rgb.length === 4 ? "#" + ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : "";
  };
  var hsb2hex = function(hsb) {
    return rgb2hex(hsb2rgb(hsb));
  };
  var hex2hsb = function(hex) {
    let hsb = rgb2hsb(hex2rgb(hex));
    if (hsb.s === 0) hsb.h = 360;
    return hsb;
  };
  var rgb2hsb = function(rgb) {
    let hsb = {
      h: 0,
      s: 0,
      b: 0
    };
    let min = Math.min(rgb.r, rgb.g, rgb.b);
    let max = Math.max(rgb.r, rgb.g, rgb.b);
    let delta = max - min;
    hsb.b = max;
    hsb.s = max !== 0 ? 255 * delta / max : 0;
    if (hsb.s !== 0) {
      if (rgb.r === max) {
        hsb.h = (rgb.g - rgb.b) / delta;
      } else if (rgb.g === max) {
        hsb.h = 2 + (rgb.b - rgb.r) / delta;
      } else {
        hsb.h = 4 + (rgb.r - rgb.g) / delta;
      }
    } else {
      hsb.h = -1;
    }
    hsb.h *= 60;
    if (hsb.h < 0) {
      hsb.h += 360;
    }
    hsb.s *= 100 / 255;
    hsb.b *= 100 / 255;
    return hsb;
  };
  var hex2rgb = function(hex) {
    hex = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
    return {
      /* jshint ignore:start */
      r: hex >> 16,
      g: (hex & 65280) >> 8,
      b: hex & 255
      /* jshint ignore:end */
    };
  };
  ready13(function() {
    let x = new ColorPicker(), body = dom20("body");
    x.on("change", function(element, hex, opacity) {
      clearTimeout(this.timer);
      let rgb = hex2rgb(hex), yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1e3 >= 128 ? "dark" : "light", check = yiq == "dark" || (!opacity || opacity < 0.35);
      if (opacity < 1) {
        let str = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity + ")";
        element.style({ backgroundColor: str });
      } else {
        element.style({ backgroundColor: hex });
      }
      let colorpicker = element[0] && element[0].closest(".g-colorpicker");
      if (colorpicker) {
        dom20(colorpicker)[!check ? "addClass" : "removeClass"]("light-text");
      }
      this.timer = setTimeout(function() {
        element.emit("input");
        body.emit("input", { target: element });
      }, 150);
    });
  });
  var colorpicker_default = ColorPicker;

  // platforms/common/application/utils/elements.viewport.js
  var elements_viewport_default = (container2, selector, threshold = 0) => {
    const root = container2 && container2[0] ? container2[0] : container2;
    if (!(root instanceof Element)) return [];
    const scopedSelector = selector.trim().startsWith(">") ? ":scope ".concat(selector.trim()) : selector;
    const top = root.scrollTop;
    const bottom = top + root.getBoundingClientRect().height;
    return [...root.querySelectorAll(scopedSelector)].filter(
      (element) => element.offsetTop + threshold >= top && element.offsetTop - threshold <= bottom
    );
  };

  // platforms/common/application/particles/fonts/index.js
  var dom21 = dom_effects_default;
  var zen8 = createElement;
  var storage4 = /* @__PURE__ */ new WeakMap();
  var ready14 = dom_default.ready;
  var frameListener3 = frameListener;
  var getAjaxSuffix13 = get_ajax_suffix_default;
  var parseAjaxURI13 = get_ajax_url_default.parse;
  var getAjaxURL16 = get_ajax_url_default.global;
  var modal15 = ui_default.modal;
  var asyncForEach3 = async_foreach_default;
  var translate13 = translate_default;
  var inViewport = elements_viewport_default;
  var fontVariantLoads = /* @__PURE__ */ new Map();
  var parseFontRequest = (request18) => {
    const parts = request18.replace(/\+/g, " ").split(":");
    const family = parts.shift().trim();
    const variants = parts.length ? parts.join(":").split(",") : ["regular"];
    return variants.map((variant) => {
      const normalized = variant === "regular" ? "400" : variant === "italic" ? "400italic" : variant;
      const match = normalized.match(/^([1-9]00)(italic)?$/);
      const weight = match ? match[1] : "400";
      const style = match && match[2] ? "italic" : "normal";
      return {
        family,
        fvd: "".concat(style === "italic" ? "i" : "n").concat(Number(weight) / 100),
        key: "".concat(family, ":").concat(weight, ":").concat(style),
        style,
        weight
      };
    });
  };
  var loadStylesheet = (requests) => new Promise((resolve, reject) => {
    const link = document.createElement("link");
    const families = requests.map((request18) => request18.trim().replace(/\s+/g, "+")).join("|");
    const timeout = window.setTimeout(() => {
      link.remove();
      reject(new Error("Google Fonts stylesheet request timed out"));
    }, 1e4);
    const complete = (callback) => {
      window.clearTimeout(timeout);
      callback();
    };
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css?family=".concat(families, "&display=swap");
    link.dataset.genesisFontRequest = families;
    link.addEventListener("load", () => complete(resolve), { once: true });
    link.addEventListener("error", () => complete(() => {
      link.remove();
      reject(new Error("Unable to load Google Fonts stylesheet"));
    }), { once: true });
    document.head.appendChild(link);
  });
  var loadGoogleFonts = (families, fontactive) => {
    const requests = [...new Set(families)];
    const variants = requests.flatMap(parseFontRequest);
    const pending = variants.filter((variant) => !fontVariantLoads.has(variant.key));
    if (pending.length) {
      const stylesheet = loadStylesheet(requests);
      pending.forEach((variant) => {
        const font = "".concat(variant.style, " ").concat(variant.weight, ' 16px "').concat(variant.family, '"');
        const loaded = stylesheet.then(() => document.fonts && document.fonts.load ? document.fonts.load(font) : Promise.resolve()).catch((error) => {
          fontVariantLoads.delete(variant.key);
          throw error;
        });
        fontVariantLoads.set(variant.key, loaded);
      });
    }
    variants.forEach((variant) => {
      const loaded = fontVariantLoads.get(variant.key);
      if (!loaded) return;
      loaded.then(() => fontactive(variant.family, variant.fvd)).catch((error) => console.warn("Unable to load font variant ".concat(variant.family, "."), error));
    });
  };
  var removeValue = function(array, value) {
    let index;
    while ((index = array.indexOf(value)) !== -1) {
      array.splice(index, 1);
    }
    return array;
  };
  var insertUnique = function(array, value) {
    if (!array.includes(value)) {
      array.push(value);
    }
    return array;
  };
  var labelize = function(value) {
    return String(value).replace(/-/g, " ").replace(/\b[a-z]/g, function(letter) {
      return letter.toUpperCase();
    });
  };
  var Fonts = class {
    constructor() {
      this.previewSentence = {
        "latin": "Wizard boy Jack loves the grumpy Queen's fox.",
        "latin-ext": "Wizard boy Jack loves the grumpy Queen's fox.",
        "arabic": "\u0646\u0635 \u062D\u0643\u064A\u0645 \u0644\u0647 \u0633\u0631 \u0642\u0627\u0637\u0639 \u0648\u0630\u0648 \u0634\u0623\u0646 \u0639\u0638\u064A\u0645 \u0645\u0643\u062A\u0648\u0628 \u0639\u0644\u0649 \u062B\u0648\u0628 \u0623\u062E\u0636\u0631 \u0648\u0645\u063A\u0644\u0641 \u0628\u062C\u0644\u062F \u0623\u0632\u0631\u0642",
        "cyrillic": "\u0412 \u0447\u0430\u0449\u0430\u0445 \u044E\u0433\u0430 \u0436\u0438\u043B \u0431\u044B \u0446\u0438\u0442\u0440\u0443\u0441? \u0414\u0430, \u043D\u043E \u0444\u0430\u043B\u044C\u0448\u0438\u0432\u044B\u0439 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440!",
        "cyrillic-ext": "\u0412 \u0447\u0430\u0449\u0430\u0445 \u044E\u0433\u0430 \u0436\u0438\u043B \u0431\u044B \u0446\u0438\u0442\u0440\u0443\u0441? \u0414\u0430, \u043D\u043E \u0444\u0430\u043B\u044C\u0448\u0438\u0432\u044B\u0439 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440!",
        "devanagari": "\u090F\u0915 \u092A\u0932 \u0915\u093E \u0915\u094D\u0930\u094B\u0927 \u0906\u092A\u0915\u093E \u092D\u0935\u093F\u0937\u094D\u092F \u092C\u093F\u0917\u093E\u0921 \u0938\u0915\u0924\u093E \u0939\u0948",
        "greek": "\u03A4\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7 \u03B1\u03BB\u03CE\u03C0\u03B7\u03BE \u03B2\u03B1\u03C6\u03AE\u03C2 \u03C8\u03B7\u03BC\u03AD\u03BD\u03B7 \u03B3\u03B7, \u03B4\u03C1\u03B1\u03C3\u03BA\u03B5\u03BB\u03AF\u03B6\u03B5\u03B9 \u03C5\u03C0\u03AD\u03C1 \u03BD\u03C9\u03B8\u03C1\u03BF\u03CD \u03BA\u03C5\u03BD\u03CC\u03C2",
        "greek-ext": "\u03A4\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7 \u03B1\u03BB\u03CE\u03C0\u03B7\u03BE \u03B2\u03B1\u03C6\u03AE\u03C2 \u03C8\u03B7\u03BC\u03AD\u03BD\u03B7 \u03B3\u03B7, \u03B4\u03C1\u03B1\u03C3\u03BA\u03B5\u03BB\u03AF\u03B6\u03B5\u03B9 \u03C5\u03C0\u03AD\u03C1 \u03BD\u03C9\u03B8\u03C1\u03BF\u03CD \u03BA\u03C5\u03BD\u03CC\u03C2",
        "hebrew": "\u05D3\u05D2 \u05E1\u05E7\u05E8\u05DF \u05E9\u05D8 \u05D1\u05D9\u05DD \u05DE\u05D0\u05D5\u05DB\u05D6\u05D1 \u05D5\u05DC\u05E4\u05EA\u05E2 \u05DE\u05E6\u05D0 \u05D7\u05D1\u05E8\u05D4",
        "khmer": "\u1781\u17D2\u1789\u17BB\u17C6\u17A2\u17B6\u1785\u1789\u17C9\u17B6\u17C6\u1780\u1789\u17D2\u1785\u1780\u17CB\u1794\u17B6\u1793 \u178A\u17C4\u1799\u1782\u17D2\u1798\u17B6\u1793\u1794\u1789\u17D2\u17A0\u17B6",
        "telugu": "\u0C26\u0C47\u0C36 \u0C2D\u0C3E\u0C37\u0C32\u0C02\u0C26\u0C41 \u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 \u0C32\u0C46\u0C38\u0C4D\u0C38",
        "vietnamese": "T\xF4i c\xF3 th\u1EC3 \u0103n th\u1EE7y tinh m\xE0 kh\xF4ng h\u1EA1i g\xEC."
      };
      this.field = null;
      this.element = null;
      this.throttle = false;
      this.selected = null;
      this.loadedFonts = [];
      this.filters = {
        search: "",
        script: "latin",
        categories: []
      };
    }
    open(event, element) {
      let data = element.data("genesis-fontpicker");
      if (!data) {
        throw new Error("No fontpicker data found");
      }
      data = JSON.parse(data);
      this.field = dom21(data.field);
      modal15.open({
        content: translate13("GENESIS_PLATFORM_JS_LOADING"),
        className: "genesis-dialog-theme-default genesis-modal-fonts",
        remote: parseAjaxURI13(getAjaxURL16("fontpicker") + getAjaxSuffix13()),
        remoteLoaded: (function(response, content) {
          let container2 = content.elements.content;
          this.attachEvents(container2);
          this.updateCategories(container2);
          this.search();
          this.scroll(container2.find("ul.g-fonts-list"));
          this.updateTotal();
          this.selectFromValue();
          setTimeout(function() {
            container2.find(".particle-search-wrapper input")[0].focus();
          }, 5);
        }).bind(this)
      });
    }
    scroll(container2) {
      clearTimeout(this.throttle);
      this.throttle = setTimeout((function() {
        if (!container2) {
          clearTimeout(this.throttle);
          return;
        }
        let viewport = container2.find("ul.g-fonts-list") || container2, elements = inViewport(viewport, "> li:not(.g-font-hide)", 550 * 7), list = [];
        if (!elements) {
          return;
        }
        dom21(elements).forEach(function(element) {
          element = dom21(element);
          let dataFont = element.data("font"), variant = element.data("variant");
          if (!this.loadedFonts.includes(dataFont) && variant) {
            list.push(dataFont + (variant != "regular" ? ":" + variant : ""));
          } else {
            if (variant) {
              element.find('[data-variant="' + variant + '"] .preview').style({
                fontFamily: dataFont,
                fontWeight: variant == "regular" ? "normal" : variant
              });
            }
          }
        }, this);
        if (!list || !list.length) {
          return;
        }
        loadGoogleFonts(list, (function(family, fvd) {
          container2.find('li[data-font="' + family + '"]:not(.g-variant-hide) > .preview').style(
            this.fvdToStyle(family, fvd)
          );
          insertUnique(this.loadedFonts, family);
        }).bind(this));
      }).bind(this), 100);
    }
    unselect(selected) {
      selected = selected || this.selected;
      if (!selected) {
        return false;
      }
      let baseVariant = selected.element.data("variant");
      selected.element.removeClass("selected");
      selected.element.search("input[type=checkbox]").checked(false);
      selected.element.search("[data-font]").addClass("g-variant-hide");
      selected.element.find('[data-variant="' + baseVariant + '"]').removeClass("g-variant-hide");
      selected.variants = [selected.baseVariant];
      selected.selected = [];
    }
    selectFromValue() {
      let value = this.field.value(), name, variants, subset, isLocal = false;
      if (!value.match("family=")) {
        let locals = dom21('[data-category="local-fonts"][data-font]') || [], intersect;
        locals = locals.map(function(l) {
          return dom21(l).data("font");
        });
        value = value.replace(/(\s{1,})?,(\s{1,})?/gi, ",").split(",");
        intersect = locals.filter(function(font, index) {
          return value.includes(font) && locals.indexOf(font) === index;
        });
        if (!intersect.length) {
          return false;
        }
        isLocal = true;
        name = intersect.shift();
      } else {
        let split = value.split("&"), family = split[0], split2 = family.split(":");
        name = split2[0].replace("family=", "").replace(/\+/g, " ");
        variants = split2[1] ? split2[1].split(",") : ["regular"];
        subset = split[1] ? split[1].replace("subset=", "").split(",") : ["latin"];
      }
      let noConflict = isLocal ? '[data-category="local-fonts"]' : ':not([data-category="local-fonts"])', element = dom21('ul.g-fonts-list > [data-font="' + name + '"]' + noConflict);
      variants = variants || element.data("variants").split(",") || ["regular"];
      if (variants.includes("400")) {
        removeValue(variants, "400");
        insertUnique(variants, "regular");
      }
      if (variants.includes("400italic")) {
        removeValue(variants, "400italic");
        insertUnique(variants, "italic");
      }
      this.selected = {
        font: name,
        baseVariant: element.data("variant"),
        element,
        variants,
        selected: [],
        local: isLocal,
        charsets: subset,
        availableVariants: element.data("variants").split(","),
        expanded: isLocal,
        loaded: isLocal
      };
      (isLocal ? [name] : variants).forEach(function(variant) {
        this.select(element, variant);
        variant = element.find('> ul > [data-variant="' + variant + '"]');
        if (variant) {
          variant.removeClass("g-variant-hide");
        }
      }, this);
      let charsetSelected = element.find(".font-charsets-selected");
      if (charsetSelected) {
        let subsetsLength = element.data("subsets").split(",").length;
        charsetSelected.html('(<i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i>  <span class="font-charsets-details">' + subset.length + " of " + subsetsLength + "</span> selected)");
      }
      if (!isLocal) {
        dom21("ul.g-fonts-list")[0].scrollTop = element[0].offsetTop;
      }
      this.toggleExpansion();
      setTimeout((function() {
        this.toggleExpansion();
      }).bind(this), 50);
      if (!isLocal) {
        setTimeout((function() {
          dom21("ul.g-fonts-list")[0].scrollTop = element[0].offsetTop;
        }).bind(this), 250);
      }
    }
    select(element, variant) {
      let baseVariant = element.data("variant"), isLocal = !baseVariant;
      if (!this.selected || this.selected.element != element) {
        if (variant && this.selected) {
          let charsetSelected = this.selected.element.find(".font-charsets-selected");
          if (charsetSelected) {
            let subsetsLength = element.data("subsets").split(",").length;
            charsetSelected.html('(<i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i>  <span class="font-charsets-details">1 of ' + subsetsLength + "</span> selected)");
          }
        }
        this.selected = {
          font: element.data("font"),
          baseVariant,
          element,
          variants: [baseVariant],
          selected: [],
          local: isLocal,
          charsets: ["latin"],
          availableVariants: element.data("variants").split(","),
          expanded: isLocal,
          loaded: isLocal
        };
      }
      if (!variant) {
        this.toggleExpansion();
      }
      if (variant || isLocal) {
        let selected = dom21('ul.g-fonts-list > [data-font]:not([data-font="' + this.selected.font + '"]) input[type="checkbox"]:checked');
        if (selected) {
          selected.checked(false);
          selected.parent("[data-variants]").removeClass("font-selected");
        }
        let checkbox = this.selected.element.find('input[type="checkbox"][value="' + (isLocal ? this.selected.font : variant) + '"]'), checked2 = checkbox.checked();
        if (checkbox) {
          checkbox.checked(!checked2);
        }
        if (!checked2) {
          insertUnique(this.selected.variants, variant);
          insertUnique(this.selected.selected, variant);
        } else {
          if (variant != this.selected.baseVariant) {
            removeValue(this.selected.variants, variant);
          }
          removeValue(this.selected.selected, variant);
        }
        this.updateSelection();
      }
    }
    toggleExpansion() {
      if (this.selected.availableVariants.length <= 1) {
        return;
      }
      if (this.selected.local) {
        this.selected.expanded = true;
        return;
      }
      if (!this.selected.expanded) {
        let variants = this.selected.element.data("variants"), variant;
        if (variants.split(",").length > 1) {
          this.selected.element.search("[data-font]").removeClass("g-variant-hide");
          if (!this.selected.loaded) {
            loadGoogleFonts([this.selected.font.replace(/\s/g, "+") + ":" + variants], (function(family, fvd) {
              let style = this.fvdToStyle(family, fvd), search2 = style.fontWeight;
              if (search2 == "400") {
                search2 = style.fontStyle == "normal" ? "regular" : "italic";
              } else if (style.fontStyle == "italic") {
                search2 += "italic";
              }
              this.selected.element.find('li[data-variant="' + search2 + '"] .preview').style(style);
              this.selected.loaded = true;
            }).bind(this));
          }
        }
      } else {
        let exclude = ':not([data-variant="' + this.selected.variants.join('"]):not([data-variant="') + '"])';
        exclude = this.selected.element.search("[data-font]" + exclude);
        if (exclude) {
          exclude.addClass("g-variant-hide");
        }
      }
      this.selected.expanded = !this.selected.expanded;
    }
    toggle(event, element) {
      element = dom21(element);
      let target = dom21(event.target);
      if (target.attribute("type") == "checkbox") {
        target.checked(!target.checked());
      }
      this.select(element.parent("[data-font]") || element, element.parent("[data-font]") ? element.data("variant") : false, element);
      return false;
    }
    updateSelection() {
      let preview = dom21(".g-particles-footer .font-selected"), selected, variants;
      if (!preview) {
        return;
      }
      if (!this.selected.selected.length) {
        preview[0].replaceChildren();
        this.selected.element.removeClass("font-selected");
        return;
      }
      selected = this.selected.selected.sort();
      variants = this.selected.local ? "(<small>local</small>)" : "(<small>" + selected.join(", ").replace("regular", "normal") + "</small>)";
      this.selected.element.addClass("font-selected");
      preview.html("<strong>" + this.selected.font + "</strong> " + variants);
    }
    updateTotal() {
      let totals = dom21(".g-particles-header .particle-search-total"), count = dom21(".g-fonts-list > [data-font]:not(.g-font-hide)");
      totals.text(count ? count.length : 0);
    }
    updateCategories(container2) {
      let categories = container2.find("[data-font-categories]");
      if (!categories) {
        return;
      }
      this.filters.categories = categories.data("font-categories").split(",");
    }
    attachEvents(container2) {
      let header = container2.find(".g-particles-header"), list = container2.find(".g-fonts-list"), search2 = header.find("input.font-search"), preview = header.find("input.font-preview");
      frameListener3(list, "scroll", this.scroll.bind(this, list));
      container2.delegate("click", ".g-fonts-list li[data-font]", this.toggle.bind(this));
      if (search2) {
        search2.on("keyup", this.search.bind(this, search2));
      }
      if (preview) {
        preview.on("keyup", this.updatePreview.bind(this, preview));
      }
      this.attachCharsets(container2);
      this.attachLocalVariants(container2);
      this.attachFooter(container2);
    }
    attachCharsets(container2) {
      container2.delegate("mouseover", ".font-charsets-selected", (function(event, element) {
        if (!element.PopoverDefined) {
          let popover = element.getPopover({
            placement: "auto",
            width: "200",
            trigger: "mouse",
            style: "font-categories, above-modal"
          });
          element.on("beforeshow.popover", (function(popover2) {
            let subsets = element.parent("[data-subsets]").data("subsets").split(","), content = popover2.$target.find(".genesis-popover-content"), checked2;
            content[0].replaceChildren();
            let div, current;
            subsets.forEach(function(cs) {
              current = this.selected.charsets.includes(cs) ? cs == "latin" ? "checked disabled" : "checked" : "";
              zen8("div").html('<label><input type="checkbox" ' + current + ' value="' + cs + '"/> ' + labelize(cs.replace("ext", "extended")) + "</label>").bottom(content);
            }, this);
            content[0].querySelectorAll('input[type="checkbox"]').forEach(function(input) {
              input.addEventListener("change", (function() {
                checked2 = content[0].querySelectorAll('input[type="checkbox"]:checked');
                this.selected.charsets = Array.from(checked2, function(item) {
                  return item.value;
                });
                element.html('(<i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i>  <span class="font-charsets-details">' + this.selected.charsets.length + " of " + subsets.length + "</span> selected)");
              }).bind(this));
            }, this);
            popover2.displayContent();
          }).bind(this));
          element.getPopover().show();
        }
      }).bind(this));
    }
    attachLocalVariants(container2) {
      container2.delegate("mouseover", ".g-font-variants-list", (function(event, element) {
        if (!element.PopoverDefined) {
          let popover = element.getPopover({
            placement: "auto",
            width: "200",
            trigger: "mouse",
            style: "font-categories, above-modal"
          });
          element.on("beforeshow.popover", (function(popover2) {
            let content = popover2.$target.find(".genesis-popover-content"), variants = element.parent("[data-variants]").data("variants").split(",");
            content[0].replaceChildren();
            asyncForEach3(variants, (function(variant) {
              variant = variant == "400" ? "regular" : variant == "400italic" ? "italic" : variant + "";
              zen8("div").text(this.mapVariant(variant)).bottom(content);
            }).bind(this));
            popover2.displayContent();
          }).bind(this));
        }
      }).bind(this));
    }
    attachFooter(container2) {
      let footer = container2.find(".g-particles-footer"), select = footer.find("button.button-primary"), categories = footer.find(".font-category"), subsets = footer.find(".font-subsets"), current;
      select.on("click", (function() {
        if (!dom21('ul.g-fonts-list > [data-font] input[type="checkbox"]:checked')) {
          this.field.value("");
          modal15.close();
          return;
        }
        let name = this.selected.font.replace(/\s/g, "+"), variation = this.selected.selected, charset = this.selected.charsets;
        if (variation && variation.length == 1 && variation[0] == "regular") {
          variation = [];
        }
        if (charset && charset.length == 1 && charset[0] == "latin") {
          charset = [];
        }
        if (variation.includes("regular")) {
          removeValue(variation, "regular");
          insertUnique(variation, "400");
        }
        if (variation.includes("italic")) {
          removeValue(variation, "italic");
          insertUnique(variation, "400italic");
        }
        if (!this.selected.local) {
          this.field.value("family=" + name + (variation.length ? ":" + variation.join(",") : "") + (charset.length ? "&subset=" + charset.join(",") : ""));
        } else {
          this.field.value(name);
        }
        this.field.emit("input");
        dom21("body").emit("input", { target: this.field });
        modal15.close();
      }).bind(this));
      categories.popover({
        placement: "top",
        width: "200",
        trigger: "mouse",
        style: "font-categories, above-modal"
      }).on("beforeshow.popover", (function(popover) {
        let cats = categories.data("font-categories").split(","), content = popover.$target.find(".genesis-popover-content"), checked2;
        content[0].replaceChildren();
        cats.forEach(function(category) {
          if (category == "local-fonts") {
            return;
          }
          current = this.filters.categories.includes(category) ? "checked" : "";
          zen8("div").html('<label><input type="checkbox" ' + current + ' value="' + category + '"/> ' + labelize(category) + "</label>").bottom(content);
        }, this);
        content[0].querySelectorAll('input[type="checkbox"]').forEach(function(input) {
          input.addEventListener("change", (function() {
            checked2 = content[0].querySelectorAll('input[type="checkbox"]:checked');
            this.filters.categories = Array.from(checked2, function(item) {
              return item.value;
            });
            categories.find("small").text(this.filters.categories.length);
            this.search();
          }).bind(this));
        }, this);
        popover.displayContent();
      }).bind(this));
      subsets.popover({
        placement: "top",
        width: "200",
        trigger: "mouse",
        style: "font-subsets, above-modal"
      }).on("beforeshow.popover", (function(popover) {
        let subs = subsets.data("font-subsets").split(","), content = popover.$target.find(".genesis-popover-content");
        content[0].replaceChildren();
        let div;
        subs.forEach(function(sub) {
          current = sub == this.filters.script ? "checked" : "";
          zen8("div").html('<label><input name="font-subset[]" type="radio" ' + current + ' value="' + sub + '"/> ' + labelize(sub.replace("ext", "extended")) + "</label>").bottom(content);
        }, this);
        content[0].querySelectorAll('input[type="radio"]').forEach(function(input) {
          input.addEventListener("change", (function() {
            this.filters.script = input.value;
            dom21(".g-particles-header input.font-preview").value(this.previewSentence[this.filters.script]);
            subsets.find("small").text(labelize(input.value.replace("ext", "extended")));
            this.search();
            this.updatePreview();
          }).bind(this));
        }, this);
        popover.displayContent();
      }).bind(this));
      return container2;
    }
    search(input) {
      input = input || dom21(".g-particles-header input.font-search");
      let list = dom21(".g-fonts-list"), value = input.value(), name, subsets, category, data;
      list.search("> [data-font]").forEach(function(font) {
        font = dom21(font);
        name = font.data("font");
        subsets = font.data("subsets").split(",");
        category = font.data("category");
        font.removeClass("g-font-hide");
        if (this.selected && this.selected.font == name && this.selected.selected.length) {
          return;
        }
        if (!subsets.includes(this.filters.script)) {
          font.addClass("g-font-hide");
          return;
        }
        if (!this.filters.categories.includes(category)) {
          font.addClass("g-font-hide");
          return;
        }
        if (!name.match(new RegExp("^" + value + "|\\s" + value, "gi"))) {
          font.addClass("g-font-hide");
        } else {
          font.removeClass("g-font-hide");
        }
      }, this);
      this.updateTotal();
      clearTimeout(input.refreshTimer);
      input.refreshTimer = setTimeout((function() {
        this.scroll(dom21("ul.g-fonts-list"));
      }).bind(this), 400);
      input.previousValue = value;
    }
    updatePreview(input) {
      input = input || dom21(".g-particles-header input.font-preview");
      clearTimeout(input.refreshTimer);
      let value = input.value(), list = dom21(".g-fonts-list");
      value = String(value || "").trim() || this.previewSentence[this.filters.script];
      if (input.previousValue == value) {
        return true;
      }
      list.search("[data-font] .preview").text(value);
      input.previousValue = value;
    }
    fvdToStyle(family, fvd) {
      let match = fvd.match(/([a-z])([0-9])/);
      if (!match) return "";
      let styleMap = {
        n: "normal",
        i: "italic",
        o: "oblique"
      };
      return {
        fontFamily: family,
        fontStyle: styleMap[match[1]],
        fontWeight: (match[2] * 100).toString()
      };
    }
    mapVariant(variant) {
      switch (variant) {
        case "100":
          return "Thin 100";
          break;
        case "100italic":
          return "Thin 100 Italic";
          break;
        case "200":
          return "Extra-Light 200";
          break;
        case "200italic":
          return "Extra-Light 200 Italic";
          break;
        case "300":
          return "Light 300";
          break;
        case "300italic":
          return "Light 300 Italic";
          break;
        case "400":
        case "regular":
          return "Normal 400";
          break;
        case "400italic":
        case "italic":
          return "Normal 400 Italic";
          break;
        case "500":
          return "Medium 500";
          break;
        case "500italic":
          return "Medium 500 Italic";
          break;
        case "600":
          return "Semi-Bold 600";
          break;
        case "600italic":
          return "Semi-Bold 600 Italic";
          break;
        case "700":
          return "Bold 700";
          break;
        case "700italic":
          return "Bold 700 Italic";
          break;
        case "800":
          return "Extra-Bold 800";
          break;
        case "800italic":
          return "Extra-Bold 800 Italic";
          break;
        case "900":
          return "Ultra-Bold 900";
          break;
        case "900italic":
          return "Ultra-Bold 900 Italic";
          break;
        default:
          return "Unknown Variant";
      }
    }
  };
  ready14(function() {
    let body = dom21("body");
    body.delegate("click", "[data-genesis-fontpicker]", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      let node = element[0], FontPicker = storage4.get(node);
      if (!FontPicker) {
        FontPicker = new Fonts();
        storage4.set(node, FontPicker);
      }
      FontPicker.open(event, element);
    });
  });
  var fonts_default = Fonts;

  // platforms/common/application/particles/menu/index.js
  var { ready: ready15, delegate: delegate10 } = dom_default;
  ready15(() => {
    delegate10(document.body, "click", "[data-genesis-content] .g-main-nav .g-toplevel [data-genesis-ajaxify]", (event, link) => {
      event.preventDefault();
      document.querySelectorAll("[data-genesis-content] .g-main-nav .g-toplevel li.active").forEach((item2) => item2.classList.remove("active"));
      const item = link.closest("li");
      if (item) item.classList.add("active");
    });
  });
  var menu_default2 = {};

  // platforms/common/application/particles/icons/index.js
  var dom22 = dom_default;
  var modal16 = ui_default.modal;
  var popovers = popover_default;
  var getAjaxSuffix14 = get_ajax_suffix_default;
  var parseAjaxURI14 = get_ajax_url_default.parse;
  var getAjaxURL17 = get_ajax_url_default.global;
  var translate14 = translate_default;
  var escapeHTML2 = function(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];
    });
  };
  var findPreview = function(input) {
    let parent = input.parentElement;
    return parent ? parent.querySelector("[data-genesis-iconpicker]") : null;
  };
  dom22.ready(function() {
    let body = document.body;
    dom22.delegate(body, "keyup", '.g-icons input[type="text"]', function(event, input) {
      let preview = findPreview(input), icon = preview && preview.querySelector("i");
      if (!icon) {
        return;
      }
      icon.className = input.value || "far fa-hand-point-up picker";
      if (!preview.offsetWidth) {
        icon.className = "far fa-hand-point-up picker";
      }
    });
    dom22.delegate(body, "click", "[data-genesis-iconpicker]", function(event, realPreview) {
      event.preventDefault();
      let fieldSelector = realPreview.getAttribute("data-genesis-iconpicker"), field = fieldSelector ? document.querySelector(fieldSelector) : null, value = String(field ? field.value : "").trim().replace(/\s{2,}/g, " ").split(" ").filter(Boolean);
      if (!field) {
        return;
      }
      modal16.open({
        content: translate14("GENESIS_PLATFORM_JS_LOADING"),
        className: "genesis-dialog-theme-default genesis-modal-icons",
        remote: parseAjaxURI14(getAjaxURL17("icons") + getAjaxSuffix14()),
        afterClose: function() {
          document.querySelectorAll(".genesis-popover").forEach(function(popover) {
            popover.remove();
          });
        },
        remoteLoaded: function(response, content) {
          let container2 = modal16.element(content.elements.content), icons = container2.querySelectorAll("[data-g-icon]");
          if (!icons.length || !response.body.success) {
            container2.innerHTML = response.body.html || response.body;
            return false;
          }
          let selectButton = container2.querySelector("[data-g-select]"), updatePreview = function() {
            let data = [], active = container2.querySelector("[data-g-icon].active"), options = container2.querySelectorAll(".g-particles-header .float-right input:checked, .g-particles-header .float-right select");
            if (active) {
              data.push(active.getAttribute("data-g-icon"));
            }
            options.forEach(function(option) {
              if (option.value && option.value !== "fa-") {
                data.push(option.value);
              }
            });
            let preview = container2.querySelector(".g-icon-preview");
            if (preview) {
              preview.innerHTML = '<i class="' + escapeHTML2(data.join(" ")) + '" aria-hidden="true"></i> <span>' + escapeHTML2(data[0] || "") + "</span>";
            }
            if (selectButton) {
              selectButton.disabled = !active;
            }
          }, updateTotal = function() {
            let total = container2.querySelectorAll("[data-g-icon]:not(.hide-icon)").length, label = container2.querySelector(".particle-search-total");
            if (label) {
              label.textContent = total;
            }
          };
          if (selectButton) {
            selectButton.disabled = !container2.querySelector("[data-g-icon].active");
          }
          dom22.delegate(container2, "click", "[data-g-icon]", function(iconEvent, icon) {
            iconEvent.preventDefault();
            let active = container2.querySelector("[data-g-icon].active");
            if (active) {
              active.classList.remove("active");
            }
            icon.classList.add("active");
            updatePreview();
          });
          dom22.delegate(container2, "click", "[data-g-select]", function(selectEvent) {
            selectEvent.preventDefault();
            if (!container2.querySelector("[data-g-icon].active")) {
              return;
            }
            let output = container2.querySelector(".g-icon-preview i"), outputClass = output ? output.getAttribute("class") : "";
            field.value = outputClass;
            let previewIcon = realPreview.querySelector("i");
            if (previewIcon) {
              previewIcon.className = outputClass;
            }
            field.dispatchEvent(new Event("input", { bubbles: true }));
            modal16.close();
          });
          dom22.delegate(container2, "change", '.g-particles-header .float-right input[type="checkbox"], .g-particles-header .float-right select', updatePreview);
          dom22.delegate(container2, "keyup", '.particle-search-wrapper input[type="text"]', function(searchEvent, input) {
            let search2 = input.value.toLowerCase();
            icons.forEach(function(icon) {
              icon.classList.toggle("hide-icon", Boolean(search2) && !icon.getAttribute("data-g-icon").toLowerCase().includes(search2));
            });
            updateTotal();
          });
          icons.forEach(function(icon) {
            let iconName = icon.getAttribute("data-g-icon"), html = "";
            for (let size3 = 5; size3 > 0; size3--) {
              html += '<i class="' + escapeHTML2(iconName) + " fa-" + size3 + 'x" aria-hidden="true"></i> ';
            }
            html += "<h3>" + escapeHTML2(iconName) + "</h3>";
            let popover = popovers.create(icon, {
              content: html,
              placement: "auto",
              trigger: "mouse",
              style: "above-modal, icons-preview",
              width: "auto",
              targetEvents: false,
              delay: 1
            });
            popover.on("hidden.popover", function(instance2) {
              if (instance2.$target) {
                instance2.$target.remove();
              }
            });
            if (!value.includes(iconName)) {
              return;
            }
            icon.classList.add("active");
            value.forEach(function(name) {
              let optionField = container2.querySelector('[name="' + CSS.escape(name) + '"]');
              if (optionField) {
                optionField.checked = true;
                return;
              }
              let option = container2.querySelector('option[value="' + CSS.escape(name) + '"]');
              if (option) {
                option.parentElement.value = name;
              }
            });
            let wrap = icon.closest(".icons-wrapper");
            if (wrap) {
              wrap.scrollTop = icon.offsetTop - wrap.offsetHeight / 2;
            }
            updatePreview();
          });
          let searchInput = container2.querySelector(".particle-search-wrapper input");
          if (searchInput) {
            setTimeout(function() {
              searchInput.focus();
            }, 5);
          }
        }
      });
    });
  });
  var icons_default = {};

  // platforms/common/application/particles/filepicker/index.js
  var dom23 = dom_default;
  var request13 = request_default;
  var modal17 = ui_default.modal;
  var popovers2 = popover_default;
  var Progresser2 = progresser_default;
  var indicator9 = indicator_default;
  var getAjaxSuffix15 = get_ajax_suffix_default;
  var parseAjaxURI15 = get_ajax_url_default.parse;
  var getAjaxURL18 = get_ajax_url_default.global;
  var translate15 = translate_default;
  var Cookie3 = cookie_default;
  var clone2 = function(value) {
    return JSON.parse(JSON.stringify(value));
  };
  var parseElement = function(html) {
    let template = document.createElement("template");
    template.innerHTML = String(html || "").trim();
    return template.content;
  };
  var animateOpacity2 = function(element, opacity, duration, callback) {
    if (!element) {
      if (callback) {
        callback();
      }
      return;
    }
    let from = getComputedStyle(element).opacity, animation = element.animate([{ opacity: from }, { opacity }], {
      duration,
      easing: "ease",
      fill: "forwards"
    });
    animation.finished.catch(function(error) {
      if (error.name !== "AbortError") console.warn("File picker animation failed.", error);
    }).then(function() {
      element.style.opacity = opacity;
      animation.cancel();
      if (callback) {
        callback();
      }
    });
  };
  var updateProgress = function(element, options) {
    if (!element) {
      return null;
    }
    if (!element.genesisProgresser) {
      element.genesisProgresser = new Progresser2(element, options);
    } else {
      element.genesisProgresser.update(options);
    }
    return element.genesisProgresser;
  };
  var fileExtension = function(file) {
    let parts = file.name.split(".");
    return !parts.length || parts.length === 1 ? "-" : parts.pop().toLowerCase();
  };
  var formatBytes = function(bytes) {
    let units = ["B", "KB", "MB", "GB", "TB"], value = Number(bytes) || 0, unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit++;
    }
    return (unit ? value.toFixed(2) : value) + " " + units[unit];
  };
  var NativeUploader = class {
    constructor(filePicker, files, previewsContainer) {
      this.filePicker = filePicker;
      this.files = files;
      this.previewsContainer = previewsContainer;
      this.requests = /* @__PURE__ */ new Set();
      this.refreshTimer = null;
      this.input = document.createElement("input");
      this.input.type = "file";
      this.input.multiple = true;
      this.input.hidden = true;
      this.input.accept = filePicker.acceptedFiles(filePicker.data.filter);
      filePicker.content.appendChild(this.input);
      this.handleClick = this.handleClick.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleDrag = this.handleDrag.bind(this);
      this.handleDrop = this.handleDrop.bind(this);
      filePicker.content.addEventListener("click", this.handleClick);
      filePicker.content.addEventListener("dragenter", this.handleDrag);
      filePicker.content.addEventListener("dragover", this.handleDrag);
      filePicker.content.addEventListener("dragleave", this.handleDrag);
      filePicker.content.addEventListener("drop", this.handleDrop);
      this.input.addEventListener("change", this.handleChange);
    }
    setPreviewsContainer(container2) {
      this.previewsContainer = container2;
    }
    handleClick(event) {
      if (!event.target.closest("[data-upload]")) return;
      event.preventDefault();
      this.input.click();
    }
    handleChange() {
      this.addFiles(this.input.files);
      this.input.value = "";
    }
    handleDrag(event) {
      if (!event.dataTransfer || !Array.from(event.dataTransfer.types || []).includes("Files")) return;
      event.preventDefault();
      if (event.type === "dragenter" || event.type === "dragover") {
        this.files.classList.add("g-file-dragover");
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      } else {
        this.files.classList.remove("g-file-dragover");
      }
    }
    handleDrop(event) {
      this.handleDrag(event);
      this.files.classList.remove("g-file-dragover");
      if (event.dataTransfer) this.addFiles(event.dataTransfer.files);
    }
    addFiles(fileList) {
      Array.from(fileList || []).forEach((file) => this.upload(file));
    }
    accepts(file) {
      if (!this.filePicker.data.filter) return true;
      try {
        return new RegExp(this.filePicker.data.filter, "i").test(file.name);
      } catch (error) {
        return true;
      }
    }
    createPreview(file) {
      if (!this.previewsContainer) return null;
      let empty = this.previewsContainer.querySelector(".no-files-found");
      if (empty) empty.remove();
      let fragment = parseElement(this.filePicker.getPreviewTemplate()), element = fragment.firstElementChild, extension = fileExtension(file), thumb = element.querySelector(".g-thumb"), name = element.querySelector(".g-file-name"), size3 = element.querySelector(".g-file-size");
      if (name) name.textContent = file.name;
      if (size3) size3.textContent = formatBytes(file.size);
      element.classList.add("g-file-uploading");
      element.classList.add("g-image-" + extension);
      if (file.type && file.type.indexOf("image/") === 0) {
        if (thumb) thumb.classList.add("g-image", "g-image-" + extension);
        let reader = new FileReader();
        reader.addEventListener("load", function() {
          let thumbnail = element.querySelector("[data-upload-thumbnail] > div");
          if (thumbnail) thumbnail.style.backgroundImage = 'url("' + reader.result + '")';
        }, { once: true });
        reader.readAsDataURL(file);
      } else if (thumb) {
        thumb.textContent = extension;
      }
      this.previewsContainer.appendChild(element);
      return element;
    }
    prepareProgress(element) {
      let uploader = element.querySelector("[data-file-uploadprogress]"), isList = this.files.classList.contains("g-filemode-list"), config2 = {
        value: 0,
        animation: false,
        insertLocation: "bottom"
      };
      Object.assign(config2, isList ? {
        size: 20,
        thickness: 10,
        fill: { color: this.filePicker.colors.small, gradient: false }
      } : {
        size: 50,
        thickness: "auto",
        fill: { gradient: this.filePicker.colors.gradient, color: false }
      });
      updateProgress(uploader, config2);
      uploader.title = translate15("GENESIS_PLATFORM_JS_PROCESSING");
      this.filePicker.setProgressText(element, "0%");
    }
    showError(element, error) {
      let uploader = element.querySelector("[data-file-uploadprogress]"), text = element.querySelector(".g-file-progress-text"), isList = this.files.classList.contains("g-filemode-list"), message = error && error.html ? error.html : error && error.error && error.error.message ? error.error.message : error && error.message ? error.message : error;
      element.classList.add("g-file-error");
      uploader.title = "Error";
      updateProgress(uploader, {
        fill: { color: this.filePicker.colors.error, gradient: false },
        value: 1,
        thickness: isList ? 10 : 25
      });
      if (text) {
        text.title = "Error";
        text.innerHTML = '<i class="fa fa-exclamation" aria-hidden="true"></i>';
        popovers2.create(uploader, {
          content: message || "Upload failed.",
          placement: "auto",
          trigger: "mouse",
          style: "filepicker, above-modal",
          width: "auto",
          targetEvents: false
        });
      }
    }
    showSuccess(element, uploadResponse) {
      let uploader = element.querySelector("[data-file-uploadprogress]"), mtime = element.querySelector(".g-file-mtime"), text = element.querySelector(".g-file-progress-text"), thumb = element.querySelector(".g-thumb"), isList = this.files.classList.contains("g-filemode-list");
      updateProgress(uploader, {
        fill: { color: this.filePicker.colors.success, gradient: false },
        value: 1,
        thickness: isList ? 10 : 25
      });
      if (text) text.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
      window.setTimeout(function() {
        animateOpacity2(uploader, 0, 500);
        animateOpacity2(thumb, 1, 500, function() {
          element.setAttribute("data-file", JSON.stringify(uploadResponse.finfo));
          element.setAttribute("data-file-url", uploadResponse.url);
          element.classList.remove("g-file-uploading");
          if (uploader) uploader.remove();
          if (mtime) mtime.textContent = translate15("GENESIS_PLATFORM_JUST_NOW");
        });
      }, 500);
    }
    parseResponse(xhr) {
      if (xhr.response && typeof xhr.response === "object") return xhr.response;
      let text = "";
      try {
        text = xhr.responseText || "";
      } catch (error) {
        return "Upload failed.";
      }
      try {
        return JSON.parse(text);
      } catch (error) {
        return text || "Upload failed.";
      }
    }
    upload(file) {
      let element = this.createPreview(file);
      if (!element) return;
      this.prepareProgress(element);
      if (!this.accepts(file)) {
        this.showError(
          element,
          file.name + " " + translate15("GENESIS_PLATFORM_JS_FILTER_MISMATCH") + ": " + this.filePicker.data.filter
        );
        return;
      }
      let path = this.filePicker.getPath();
      if (!path) {
        this.showError(element, "Select an upload folder first.");
        return;
      }
      let url = parseAjaxURI15(
        getAjaxURL18("filepicker/upload/" + window.btoa(encodeURIComponent(path + file.name))) + getAjaxSuffix15()
      ), form = new FormData(), xhr = new XMLHttpRequest();
      form.append("file", file, file.name);
      this.requests.add(xhr);
      xhr.open("POST", url, true);
      xhr.responseType = "json";
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.upload.addEventListener("progress", (function(event) {
        if (!event.lengthComputable) return;
        let progress = event.loaded / event.total * 100, uploader = element.querySelector("[data-file-uploadprogress]");
        updateProgress(uploader, { value: progress / 100 });
        this.filePicker.setProgressText(element, Math.round(progress) + "%");
      }).bind(this));
      xhr.addEventListener("load", (function() {
        this.requests.delete(xhr);
        let response = this.parseResponse(xhr);
        if (xhr.status >= 200 && xhr.status < 300 && response && response.finfo) {
          this.showSuccess(element, response);
          window.clearTimeout(this.refreshTimer);
          this.refreshTimer = window.setTimeout(this.filePicker.refreshFiles.bind(this.filePicker), 1100);
        } else {
          this.showError(element, response);
        }
      }).bind(this));
      xhr.addEventListener("error", (function() {
        this.requests.delete(xhr);
        this.showError(element, "Upload failed.");
      }).bind(this));
      xhr.addEventListener("abort", (function() {
        this.requests.delete(xhr);
      }).bind(this));
      xhr.send(form);
    }
    destroy() {
      window.clearTimeout(this.refreshTimer);
      this.requests.forEach((xhr) => xhr.abort());
      this.requests.clear();
      this.filePicker.content.removeEventListener("click", this.handleClick);
      this.filePicker.content.removeEventListener("dragenter", this.handleDrag);
      this.filePicker.content.removeEventListener("dragover", this.handleDrag);
      this.filePicker.content.removeEventListener("dragleave", this.handleDrag);
      this.filePicker.content.removeEventListener("drop", this.handleDrop);
      this.input.removeEventListener("change", this.handleChange);
      this.input.remove();
    }
  };
  var FilePicker = class {
    constructor(element) {
      let data = element.getAttribute("data-genesis-filepicker");
      this.data = data ? JSON.parse(data) : false;
      if (this.data && !this.data.value) {
        let field = this.getField();
        this.data.value = field ? field.value : "";
      }
      this.colors = {
        error: "#D84747",
        success: "#9ADF87",
        small: "#aaaaaa",
        gradient: ["#9e38eb", "#4e68fc"]
      };
    }
    getField() {
      if (!this.data || !this.data.field) {
        return null;
      }
      if (this.data.field.nodeType) {
        return this.data.field;
      }
      return document.querySelector(this.data.field);
    }
    open() {
      if (this.data) {
        let field = this.getField();
        this.data.value = field ? field.value : "";
      }
      modal17.open({
        method: "post",
        data: this.data,
        content: translate15("GENESIS_PLATFORM_JS_LOADING"),
        className: "genesis-dialog-theme-default genesis-modal-filepicker",
        remote: parseAjaxURI15(getAjaxURL18("filepicker") + getAjaxSuffix15()),
        remoteLoaded: this.loaded.bind(this),
        afterClose: (function() {
          if (this.uploader) {
            this.uploader.destroy();
            this.uploader = null;
          }
        }).bind(this)
      });
    }
    getPath() {
      let actives = this.content.querySelectorAll(".g-folders .active");
      if (!actives.length) {
        return null;
      }
      let data = JSON.parse(actives[actives.length - 1].getAttribute("data-folder")), path = data.pathname;
      return path.replace(/\/$/, "") + "/";
    }
    getPreviewTemplate() {
      return '<li data-file><div class="g-thumb" data-upload-thumbnail><div></div></div><span class="g-file-name"></span><span class="g-file-size"></span><span class="g-file-mtime"></span><span class="g-file-progress" data-file-uploadprogress><span class="g-file-progress-text"></span></span></li>';
    }
    loaded(response, modalInstance) {
      let content = modal17.element(modalInstance.elements.content), files = content && content.querySelector(".g-files"), fieldData = clone2(this.data), colors = this.colors, self2 = this;
      if (!content) {
        return false;
      }
      this.content = content;
      if (files) {
        let previews = files.querySelector("ul:not(.g-list-labels)");
        this.uploader = new NativeUploader(this, files, previews);
      }
      dom23.delegate(content, "click", ".g-bookmark-title", function(event, element) {
        event.preventDefault();
        let sibling = element.nextElementSibling, parent = element.closest(".g-bookmark");
        if (!sibling || !sibling.matches(".g-folders")) {
          return;
        }
        sibling.hidden = !sibling.hidden;
        if (parent) {
          parent.classList.toggle("collapsed", sibling.hidden);
        }
      });
      dom23.delegate(content, "click", "[data-folder]", (function(event, element) {
        event.preventDefault();
        let data = JSON.parse(element.getAttribute("data-folder")), selected = files && files.querySelector("[data-file].selected");
        fieldData.root = data.pathname;
        fieldData.value = selected ? selected.getAttribute("data-file-url") : false;
        fieldData.subfolder = true;
        indicator9.show(element, "fa fa-li fa-fw fa-spin-fast fa-spinner");
        request13(parseAjaxURI15(getAjaxURL18("filepicker") + getAjaxSuffix15()), fieldData).send((function(error, folderResponse) {
          indicator9.hide(element);
          this.addActiveState(element);
          let result = folderResponse && folderResponse.body;
          if (!result || !result.success) {
            modal17.open({
              content: result ? result.html || result.message || result : error ? error.message : "Request failed."
            });
            return;
          }
          if (result.subfolder) {
            let next = element.nextElementSibling;
            if (next && !next.hasAttribute("data-folder")) {
              next.remove();
            }
            let fragment = parseElement(result.subfolder), anchor = element;
            Array.from(fragment.children).forEach(function(child) {
              anchor.after(child);
              anchor = child;
            });
          }
          if (files) {
            if (result.files) {
              files.replaceChildren(parseElement(result.files));
            } else {
              let list = files.querySelector("ul:not(.g-list-labels)");
              if (list) {
                list.replaceChildren();
              }
            }
            this.uploader.setPreviewsContainer(files.querySelector("ul:not(.g-list-labels)"));
          }
        }).bind(this));
      }).bind(this));
      dom23.delegate(content, "click", "[data-g-file-preview]", function(event, element) {
        event.preventDefault();
        event.stopPropagation();
        let parent = element.closest("[data-file]"), data = parent && JSON.parse(parent.getAttribute("data-file"));
        if (!parent || !data || !data.isImage) {
          return;
        }
        let thumb = parent.querySelector(".g-thumb > div"), background = thumb && thumb.style.backgroundImage;
        if (background) {
          modal17.open({
            className: "genesis-dialog-theme-default genesis-modal-filepreview center",
            content: '<img src="' + background.slice(4, -1).replace(/"/g, "") + '" />'
          });
        }
      });
      dom23.delegate(content, "click", "[data-g-file-delete]", function(event, element) {
        event.preventDefault();
        let parent = element.closest("[data-file]"), data = parent && JSON.parse(parent.getAttribute("data-file"));
        if (!parent || !data || !data.isInCustom) {
          return;
        }
        let deleteURI = parseAjaxURI15(getAjaxURL18("filepicker/" + window.btoa(encodeURIComponent(data.pathname)) + getAjaxSuffix15()));
        request13("delete", deleteURI, function(error, deleteResponse) {
          let result = deleteResponse && deleteResponse.body;
          if (!result || !result.success) {
            modal17.open({ content: result ? result.html || result.message || result : error ? error.message : "Request failed." });
            return;
          }
          parent.classList.add("g-file-deleted");
          setTimeout(function() {
            parent.remove();
            self2.refreshFiles();
          }, 210);
        });
      });
      dom23.delegate(content, "click", "[data-file]", function(event, element) {
        event.preventDefault();
        let remove = event.target.closest("[data-g-file-delete]"), preview = event.target.closest("[data-g-file-preview]");
        if (element.classList.contains("g-file-error") || element.classList.contains("g-file-uploading") || remove || preview) {
          return;
        }
        files.querySelectorAll("[data-file]").forEach(function(file) {
          file.classList.remove("selected");
        });
        element.classList.add("selected");
      });
      dom23.delegate(content, "click", "[data-select]", (function(event) {
        event.preventDefault();
        let selected = files && files.querySelector("[data-file].selected"), field = this.getField();
        if (field) {
          field.value = selected ? selected.getAttribute("data-file-url") : "";
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
        }
        modal17.close();
      }).bind(this));
      dom23.delegate(content, "click", "[data-files-mode]", function(event, element) {
        event.preventDefault();
        if (element.classList.contains("active")) {
          return;
        }
        content.querySelectorAll("[data-files-mode]").forEach(function(mode2) {
          mode2.classList.remove("active");
        });
        element.classList.add("active");
        const mode = element.getAttribute("data-files-mode");
        Cookie3.write("genesis_files_mode", mode);
        Cookie3.write("genesis_files_mode", mode);
        animateOpacity2(files, 0, 200, function() {
          let mode2 = element.getAttribute("data-files-mode"), progressConf = mode2 === "list" ? {
            size: 20,
            thickness: 10,
            fill: { color: colors.small, gradient: false }
          } : {
            size: 50,
            thickness: "auto",
            fill: { gradient: colors.gradient, color: false }
          };
          files.className = "g-files g-block g-filemode-" + mode2;
          files.querySelectorAll("[data-file-uploadprogress]").forEach(function(progressElement) {
            let config2 = clone2(progressConf);
            if (progressElement.closest(".g-file-error")) {
              config2.fill = { color: colors.error };
              config2.value = 1;
              config2.thickness = mode2 === "list" ? 10 : 25;
            }
            updateProgress(progressElement, config2);
          });
          animateOpacity2(files, 1, 200);
        });
      });
    }
    setProgressText(preview, value) {
      let uploader = preview.querySelector("[data-file-uploadprogress]"), text = preview.querySelector(".g-file-progress-text");
      if (uploader) {
        uploader.title = value;
      }
      if (text) {
        text.textContent = value;
        text.title = value;
      }
    }
    addActiveState(element) {
      this.content.querySelectorAll("[data-folder].active, .g-folders > .active").forEach(function(opened) {
        opened.classList.remove("active");
      });
      element.classList.add("active");
      let parent = element.parentElement;
      while (parent && parent.tagName === "UL" && !parent.classList.contains("g-folders")) {
        if (parent.previousElementSibling) {
          parent.previousElementSibling.classList.add("active");
        }
        parent = parent.parentElement;
      }
    }
    acceptedFiles(filter) {
      switch (filter) {
        case ".(jpe?g|gif|png|svg)$":
          return ".jpg,.jpeg,.gif,.png,.svg,.JPG,.JPEG,.GIF,.PNG,.SVG";
        case ".(mp4|webm|ogv|mov)$":
          return ".mp4,.webm,.ogv,.mov,.MP4,.WEBM,.OGV,.MOV";
        default:
          return "";
      }
    }
    refreshFiles() {
      let active = this.content.querySelectorAll("[data-folder].active"), folder = active[active.length - 1];
      if (folder) {
        folder.click();
      }
    }
  };
  dom23.ready(function() {
    dom23.delegate(document.body, "click", "[data-genesis-filepicker]", function(event, element) {
      event.preventDefault();
      if (!element.GenesisFilePicker) {
        element.GenesisFilePicker = new FilePicker(element);
      }
      element.GenesisFilePicker.open();
    });
  });
  var filepicker_default = FilePicker;

  // platforms/common/application/utils/reorderable-list.js
  var directItems2 = (list, selector, excluded) => Array.from(list.children).filter((item) => item !== excluded && item.matches(selector));
  var ReorderableList = class {
    constructor(list, options = {}) {
      this.list = list;
      this.options = Object.assign({
        item: ":scope > *",
        handle: null,
        filter: null,
        sortingClass: "",
        draggingClass: "native-reorder-dragging",
        onStart: null,
        onEnd: null
      }, options);
      this.drag = null;
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.list.addEventListener("pointerdown", this.onPointerDown);
      this.list.addEventListener("keydown", this.onKeyDown);
      this.observer = new MutationObserver(() => this.prepareHandles());
      this.observer.observe(this.list, { childList: true, subtree: true });
      this.prepareHandles();
    }
    prepareHandles() {
      if (!this.options.handle) return;
      this.list.querySelectorAll(this.options.handle).forEach((handle) => {
        if (!handle.hasAttribute("tabindex")) handle.tabIndex = 0;
        if (!handle.hasAttribute("role")) handle.setAttribute("role", "button");
        handle.style.touchAction = "none";
      });
    }
    getItem(target) {
      const item = target.closest(this.options.item);
      if (!item || item.parentElement !== this.list) return null;
      if (this.options.filter && item.matches(this.options.filter)) return null;
      return item;
    }
    getHandle(target) {
      if (!this.options.handle) return target;
      const handle = target.closest(this.options.handle);
      return handle && this.list.contains(handle) ? handle : null;
    }
    indexOf(item) {
      return directItems2(this.list, this.options.item).indexOf(item);
    }
    start(item, pointerId = null, clientY = null) {
      const oldIndex = this.indexOf(item);
      if (oldIndex < 0) return false;
      this.drag = { item, oldIndex, pointerId, clientY, started: pointerId === null };
      if (this.drag.started) this.markStarted();
      return true;
    }
    markStarted() {
      if (!this.drag || this.drag.marked) return;
      this.drag.marked = true;
      if (this.options.sortingClass) this.list.classList.add(this.options.sortingClass);
      if (this.options.draggingClass) this.drag.item.classList.add(this.options.draggingClass);
      if (typeof this.options.onStart === "function") {
        this.options.onStart({ item: this.drag.item, oldIndex: this.drag.oldIndex, from: this.list });
      }
    }
    moveTo(clientY) {
      if (!this.drag) return;
      const candidates = directItems2(this.list, this.options.item, this.drag.item);
      const before = candidates.find((item) => {
        const bounds = item.getBoundingClientRect();
        return clientY < bounds.top + bounds.height / 2;
      });
      if (before) this.list.insertBefore(this.drag.item, before);
      else this.list.appendChild(this.drag.item);
    }
    finish() {
      if (!this.drag) return;
      const state = this.drag;
      this.drag = null;
      if (!state.marked) return;
      if (this.options.sortingClass) this.list.classList.remove(this.options.sortingClass);
      if (this.options.draggingClass) state.item.classList.remove(this.options.draggingClass);
      const newIndex = this.indexOf(state.item);
      if (typeof this.options.onEnd === "function") {
        this.options.onEnd({
          item: state.item,
          oldIndex: state.oldIndex,
          newIndex,
          from: this.list,
          to: this.list
        });
      }
    }
    onPointerDown(event) {
      if (event.button !== 0 || this.drag) return;
      const handle = this.getHandle(event.target);
      const item = handle && this.getItem(handle);
      if (!item || !this.start(item, event.pointerId, event.clientY)) return;
      event.preventDefault();
      window.addEventListener("pointermove", this.onPointerMove, { passive: false });
      window.addEventListener("pointerup", this.onPointerUp);
      window.addEventListener("pointercancel", this.onPointerUp);
    }
    onPointerMove(event) {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const distance = Math.abs(event.clientY - this.drag.clientY);
      if (!this.drag.started && distance < 4) return;
      event.preventDefault();
      this.drag.started = true;
      this.markStarted();
      this.moveTo(event.clientY);
    }
    onPointerUp(event) {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("pointerup", this.onPointerUp);
      window.removeEventListener("pointercancel", this.onPointerUp);
      this.finish();
    }
    onKeyDown(event) {
      if (!event.altKey || event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const handle = this.getHandle(event.target);
      const item = handle && this.getItem(handle);
      if (!item) return;
      const items = directItems2(this.list, this.options.item);
      const oldIndex = items.indexOf(item);
      const newIndex = oldIndex + (event.key === "ArrowUp" ? -1 : 1);
      if (newIndex < 0 || newIndex >= items.length) return;
      event.preventDefault();
      this.start(item);
      if (newIndex < oldIndex) this.list.insertBefore(item, items[newIndex]);
      else this.list.insertBefore(item, items[newIndex].nextSibling);
      this.finish();
      handle.focus();
    }
    destroy() {
      this.finish();
      this.list.removeEventListener("pointerdown", this.onPointerDown);
      this.list.removeEventListener("keydown", this.onKeyDown);
      this.observer.disconnect();
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("pointerup", this.onPointerUp);
      window.removeEventListener("pointercancel", this.onPointerUp);
    }
  };
  var reorderable_list_default = ReorderableList;

  // platforms/common/application/particles/collections/index.js
  var dom24 = dom_default;
  var Submit5 = submit;
  var modal18 = ui_default.modal;
  var toastr7 = ui_default.toastr;
  var indicator10 = indicator_default;
  var request14 = request_default;
  var ReorderableList2 = reorderable_list_default;
  var parseAjaxURI16 = get_ajax_url_default.parse;
  var getAjaxSuffix16 = get_ajax_suffix_default;
  var translate16 = translate_default;
  var directItems3 = function(list) {
    return Array.from(list.children).filter(function(item) {
      return item.hasAttribute("data-collection-item");
    });
  };
  var fieldFor = function(element) {
    let param = element.closest(".settings-param");
    return param && param.querySelector("[data-collection-data]");
  };
  dom24.ready(function() {
    let body = document.body;
    let addNewByExit = function(event) {
      if (!this.CollectionNew) {
        return;
      }
      this.CollectionNew = false;
      if (event.detail.key === "enter") {
        let add = this.closest(".settings-param").querySelector("[data-collection-addnew]");
        if (add) {
          add.click();
        }
      } else if (event.detail.key === "esc") {
        let remove = this.closest("[data-collection-item]").querySelector("[data-collection-remove]");
        if (remove) {
          remove.click();
        }
      }
    };
    let createSortables = function(value) {
      let lists = value ? [value.nodeType ? value : value[0]] : Array.from(document.querySelectorAll(".collection-list ul"));
      lists.filter(Boolean).forEach(function(list) {
        if (list.SimpleSort) {
          return;
        }
        list.SimpleSort = new ReorderableList2(list, {
          item: "[data-collection-item]",
          handle: ".fa-reorder",
          filter: "[data-collection-nosort]",
          onEnd: function(event) {
            if (event.oldIndex === event.newIndex) {
              return;
            }
            let dataField = fieldFor(list), data = JSON.parse(dataField.value || "[]");
            data.splice(event.newIndex, 0, data.splice(event.oldIndex, 1)[0]);
            dataField.value = JSON.stringify(data);
            dataField.dispatchEvent(new Event("change", { bubbles: true }));
          },
          sortingClass: "collection-sorting"
        });
      });
    };
    createSortables();
    dom24.delegate(body, "mouseover", ".collection-list ul", function(event, list) {
      createSortables(list);
    });
    dom24.delegate(body, "click", "[data-collection-addnew]", function(event, element) {
      event.preventDefault();
      let param = element.closest(".settings-param"), list = param && param.querySelector("ul"), template = param && param.querySelector("[data-collection-template]"), dataField = param && param.querySelector("[data-collection-data]");
      if (!list || !template || !dataField) {
        return;
      }
      let items = directItems3(list), clone3 = template.cloneNode(true), title = clone3.querySelector("a"), editable = title && title.querySelector("[data-title-editable]"), editAll = list.closest("[data-field-name]") && list.closest("[data-field-name]").querySelector("[data-collection-editall]");
      if (items.length) {
        items[items.length - 1].after(clone3);
      } else {
        list.insertBefore(clone3, list.firstChild);
      }
      if (items.length && editAll) {
        editAll.style.display = "inline-block";
      }
      title.href = title.href.replace(/%id%/g, items.length);
      clone3.removeAttribute("style");
      clone3.setAttribute("data-collection-item", clone3.getAttribute("data-collection-template"));
      clone3.removeAttribute("data-collection-template");
      clone3.removeAttribute("data-collection-nosort");
      if (editable) {
        editable.CollectionNew = true;
        editable.addEventListener("genesis:title-edit-exit", addNewByExit);
        let editButton = title.parentElement.querySelector("[data-title-edit]");
        if (editButton) {
          editButton.click();
        }
      }
      dataField.dispatchEvent(new Event("change", { bubbles: true }));
    });
    dom24.delegate(body, "blur", "[data-collection-item] [data-title-editable]", function(event, editable) {
      let item = editable.closest("[data-collection-item]"), list = item && item.parentElement, dataField = fieldFor(editable);
      if (!item || !list || !dataField) {
        return;
      }
      let index = directItems3(list).indexOf(item);
      if (index === -1) {
        return;
      }
      let data = JSON.parse(dataField.value || "[]"), key = item.getAttribute("data-collection-item");
      if (!data[index]) {
        data.splice(index, 0, {});
      }
      data[index][key] = editable.textContent.trim();
      dataField.value = JSON.stringify(data);
      dataField.dispatchEvent(new Event("change", { bubbles: true }));
    }, true);
    dom24.delegate(body, "click", "[data-collection-remove]", function(event, element) {
      event.preventDefault();
      let item = element.closest("[data-collection-item]"), list = item && item.parentElement, dataField = fieldFor(element);
      if (!item || !list || !dataField) {
        return;
      }
      let items = directItems3(list), index = items.indexOf(item), data = JSON.parse(dataField.value || "[]"), editAll = list.closest("[data-field-name]") && list.closest("[data-field-name]").querySelector("[data-collection-editall]");
      data.splice(index, 1);
      dataField.value = JSON.stringify(data);
      item.remove();
      if (items.length <= 2 && editAll) {
        editAll.style.display = "none";
      }
      dataField.dispatchEvent(new Event("change", { bubbles: true }));
    });
    dom24.delegate(body, "click", "[data-collection-duplicate]", function(event, element) {
      event.preventDefault();
      let item = element.closest("[data-collection-item]"), list = item && item.parentElement, param = element.closest(".settings-param"), dataField = fieldFor(element);
      if (!item || !list || !param || !dataField) {
        return;
      }
      let items = directItems3(list), index = items.indexOf(item), templateLink = param.querySelector("[data-collection-template] a"), clone3 = item.cloneNode(true), data = JSON.parse(dataField.value || "[]"), editAll = list.closest("[data-field-name]") && list.closest("[data-field-name]").querySelector("[data-collection-editall]");
      item.after(clone3);
      let cloneLink = clone3.querySelector("a");
      if (cloneLink && templateLink) {
        cloneLink.href = templateLink.href.replace(/%id%/g, items.length + 1);
      }
      data.splice(index, 0, JSON.parse(JSON.stringify(data[index])));
      dataField.value = JSON.stringify(data);
      if (items.length >= 1 && editAll) {
        editAll.style.display = "inline-block";
      }
      dataField.dispatchEvent(new Event("change", { bubbles: true }));
    });
    dom24.delegate(body, "click", "[data-collection-item] a", function(event, link) {
      if (link.querySelector("[contenteditable]")) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    dom24.delegate(body, "click", "[data-collection-item] .config-cog, [data-collection-editall]", function(event, element) {
      event.preventDefault();
      let editable = element.querySelector("[data-title-editable]");
      if (editable && editable.hasAttribute("contenteditable")) {
        event.stopPropagation();
        return;
      }
      let isEditAll = element.hasAttribute("data-collection-editall"), parent = element.closest(".settings-param"), dataField = parent && parent.querySelector("[data-collection-data]"), item = element.closest("[data-collection-item]"), list = parent && parent.querySelector("ul");
      if (!parent || !dataField || !list) {
        return;
      }
      let items = directItems3(list), data = dataField.value || "[]", itemIndex = item ? items.indexOf(item) : -1, dataPost = { data: isEditAll ? data : JSON.stringify(JSON.parse(data)[itemIndex]) };
      modal18.open({
        content: translate16("GENESIS_PLATFORM_JS_LOADING"),
        method: "post",
        className: "genesis-dialog-theme-default genesis-modal-collection genesis-modal-collection-" + (isEditAll ? "editall" : "single"),
        data: dataPost,
        overlayClickToClose: false,
        remote: parseAjaxURI16(element.getAttribute("href") + getAjaxSuffix16()),
        remoteLoaded: function(response, content) {
          if (!response.body.success) {
            modal18.enableCloseByOverlay();
            return;
          }
          let container2 = modal18.element(content.elements.content), form = container2.querySelector("form"), submits = container2.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]'), dataValue = JSON.parse(data);
          if (modal18.getAll().length > 1) {
            container2.querySelectorAll("[data-apply-and-save]").forEach(function(button) {
              button.remove();
            });
            submits = container2.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');
          }
          if (!form || !submits.length) {
            return true;
          }
          submits.forEach(function(target) {
            target.addEventListener("click", function(submitEvent) {
              submitEvent.preventDefault();
              indicator10.hide(target);
              indicator10.show(target);
              form = container2.querySelector("form");
              let post = Submit5(form.elements, container2);
              if (post.invalid.length) {
                indicator10.hide(target);
                indicator10.show(target, "fa fa-fw fa-exclamation-triangle");
                toastr7.error(translate16("GENESIS_PLATFORM_JS_REVIEW_FIELDS"), translate16("GENESIS_PLATFORM_JS_INVALID_FIELDS"));
                return;
              }
              request14(form.method, parseAjaxURI16(form.action + getAjaxSuffix16()), post.valid.join("&") || {}, function(error, resultResponse) {
                let result = resultResponse && resultResponse.body;
                if (!result || !result.success) {
                  modal18.open({ content: result ? result.html || result.message || result : error ? error.message : "Request failed." });
                } else {
                  if (itemIndex !== -1) {
                    dataValue[itemIndex] = result.data;
                  } else {
                    dataValue = result.data;
                  }
                  dataField.value = JSON.stringify(dataValue);
                  dataField.dispatchEvent(new Event("change", { bubbles: true }));
                  directItems3(list).forEach(function(collectionItem, index) {
                    let label = collectionItem.querySelector("[data-title-editable]"), text = dataValue[index][collectionItem.getAttribute("data-collection-item")];
                    if (label) {
                      label.setAttribute("data-title-editable", text);
                      label.textContent = text;
                    }
                  });
                  if (target.hasAttribute("data-apply-and-save")) {
                    let save = document.querySelector(".button-save");
                    if (save) {
                      save.click();
                    }
                  }
                  modal18.close();
                  toastr7.success(translate16("GENESIS_PLATFORM_JS_GENERIC_SETTINGS_APPLIED", "Collection"), translate16("GENESIS_PLATFORM_JS_SETTINGS_APPLIED"));
                }
                indicator10.hide(target);
              });
            });
          });
        }
      });
    });
  });
  var collections_default = {};

  // platforms/common/application/particles/keyvalue/index.js
  var { ready: ready16, delegate: delegate11 } = dom_default;
  var ReorderableList3 = reorderable_list_default;
  var translate17 = translate_default;
  var collectionIndex = (collection, item) => Array.prototype.indexOf.call(collection, item);
  var escapeUnicode = (value) => String(value).replace(/[\s\S]/g, (character) => {
    if (/[\x20-\x7e]/.test(character)) return character;
    return "\\u".concat("000".concat(character.charCodeAt(0).toString(16)).slice(-4));
  });
  var emitChange3 = (element) => element.dispatchEvent(new Event("change", { bubbles: true }));
  ready16(() => {
    const body = document.body;
    const createSortables = (list) => {
      const lists = list instanceof Element ? [list] : Array.from(document.querySelectorAll(".g-keyvalue-field ul"));
      lists.forEach((element) => {
        if (element.SimpleSort) return;
        element.SimpleSort = new ReorderableList3(element, {
          item: "[data-keyvalue-item]",
          handle: ".fa-reorder",
          filter: "[data-keyvalue-nosort]",
          onEnd(event) {
            if (event.oldIndex === event.newIndex) return;
            const param = element.closest(".settings-param");
            const dataField = param && param.querySelector("[data-keyvalue-data]");
            if (!dataField) return;
            const data = JSON.parse(dataField.value);
            data.splice(event.newIndex, 0, data.splice(event.oldIndex, 1)[0]);
            dataField.value = JSON.stringify(data);
            emitChange3(dataField);
          },
          sortingClass: "keyvalue-sorting"
        });
      });
    };
    createSortables();
    delegate11(body, "mouseover", ".g-keyvalue-field ul", (event, element) => {
      if (!element.SimpleSort) createSortables(element);
    });
    delegate11(body, "click", "[data-keyvalue-addnew]", (event, element) => {
      event.preventDefault();
      const param = element.closest(".settings-param");
      const list = param && param.querySelector("ul");
      const template = param && param.querySelector("[data-keyvalue-template]");
      if (!list || !template) return;
      const items = Array.from(list.querySelectorAll(":scope > [data-keyvalue-item]"));
      const clone3 = template.cloneNode(true);
      const last3 = items[items.length - 1];
      if (last3) last3.after(clone3);
      else list.prepend(clone3);
      clone3.removeAttribute("style");
      clone3.setAttribute("data-keyvalue-item", clone3.getAttribute("data-keyvalue-template") || "");
      clone3.removeAttribute("data-keyvalue-template");
      clone3.removeAttribute("data-keyvalue-nosort");
      const keyInput = clone3.querySelector("[data-keyvalue-key]");
      if (keyInput) keyInput.focus();
    });
    delegate11(body, "click", "[data-keyvalue-remove]", (event, element) => {
      event.preventDefault();
      const item = element.closest("[data-keyvalue-item]");
      const param = element.closest(".settings-param");
      const list = element.closest("ul");
      const dataField = param && param.querySelector("[data-keyvalue-data]");
      if (!item || !list || !dataField) return;
      const items = Array.from(list.querySelectorAll(":scope > [data-keyvalue-item]"));
      const index = collectionIndex(items, item);
      const data = JSON.parse(dataField.value);
      data.splice(index, 1);
      dataField.value = escapeUnicode(JSON.stringify(data));
      item.remove();
      emitChange3(dataField);
    });
    const onBlur = (event, element) => {
      const parent = element.closest("[data-keyvalue-item]");
      const param = element.closest(".settings-param");
      if (!parent || !param) return;
      const wrapper = parent.querySelector(".g-keyvalue-wrapper");
      const keyElement = parent.querySelector("[data-keyvalue-key]");
      const valueElement = parent.querySelector("[data-keyvalue-value]");
      const dataField = param.querySelector("[data-keyvalue-data]");
      if (!wrapper || !keyElement || !valueElement || !dataField) return;
      const previousKey = keyElement.getAttribute("data-keyvalue-key");
      const keyValue = String(keyElement.value || "").trim();
      const value = String(valueElement.value || "").trim();
      const list = element.closest("ul");
      const items = Array.from(list.querySelectorAll(":scope > [data-keyvalue-item]:not(.g-keyvalue-warning):not(.g-keyvalue-excluded)"));
      const index = collectionIndex(items, parent);
      const data = JSON.parse(dataField.value);
      const exclude = JSON.parse(dataField.getAttribute("data-keyvalue-exclude") || "null");
      const excluded = Array.isArray(exclude) && exclude.includes(keyValue);
      const duplicate = data.some((object) => Object.prototype.hasOwnProperty.call(object, keyValue)) && previousKey !== keyValue;
      if (keyElement === element) {
        if (previousKey !== keyValue && !duplicate) {
          if (typeof data[index] !== "undefined") delete data[index][previousKey];
          keyElement.setAttribute("data-keyvalue-key", keyValue || "");
        }
        parent.classList.toggle("g-keyvalue-warning", duplicate);
        parent.classList.toggle("g-keyvalue-excluded", excluded);
        const message = duplicate ? translate17("GENESIS_PLATFORM_JS_KEYVALUE_DUPLICATE", keyValue) : excluded ? translate17("GENESIS_PLATFORM_JS_KEYVALUE_EXCLUDED", keyValue) : null;
        if (message) wrapper.setAttribute("data-tip", message);
        else wrapper.removeAttribute("data-tip");
        wrapper.setAttribute("data-tip-place", "top-right");
        wrapper.setAttribute("data-tip-spacing", "2");
        wrapper.setAttribute("data-tip-offset", "8");
        if (excluded || duplicate) {
          const tooltip = window.Genesis.tips.get(wrapper);
          if (tooltip) tooltip.show();
        } else {
          window.Genesis.tips.remove(wrapper);
        }
      }
      if (keyValue && !excluded && !duplicate) {
        if (!data[index]) data.splice(index, 0, {});
        data[index][keyValue] = value;
      }
      dataField.value = escapeUnicode(JSON.stringify(data));
      emitChange3(dataField);
    };
    delegate11(body, "keydown", '[data-keyvalue-item] input[type="text"]', (event, element) => {
      if (event.key === "Enter") onBlur(event, element);
    });
    delegate11(body, "blur", '[data-keyvalue-item] input[type="text"]', onBlur, true);
    delegate11(body, "update", "[data-keyvalue-data]", (event, element) => {
      const parent = element.parentElement;
      const list = parent && parent.querySelector("ul");
      const template = parent && parent.querySelector("[data-keyvalue-template]");
      if (!parent || !list || !template) return;
      parent.querySelectorAll("[data-keyvalue-item]").forEach((item) => item.remove());
      JSON.parse(element.value).forEach((object) => {
        const clone3 = template.cloneNode(true);
        const key = Object.keys(object).shift();
        list.appendChild(clone3);
        clone3.removeAttribute("style");
        clone3.setAttribute("data-keyvalue-item", clone3.getAttribute("data-keyvalue-template") || "");
        clone3.removeAttribute("data-keyvalue-template");
        clone3.removeAttribute("data-keyvalue-nosort");
        clone3.querySelector("[data-keyvalue-key]").value = key;
        clone3.querySelector("[data-keyvalue-value]").value = object[key];
      });
    });
  });
  var keyvalue_default = {};

  // platforms/common/application/particles/instancepicker/index.js
  var Submit6 = submit;
  var modal19 = ui_default.modal;
  var request15 = request_default;
  var { ready: ready17, delegate: delegate12 } = dom_default;
  var parseAjaxURI17 = get_ajax_url_default.parse;
  var getAjaxURL19 = get_ajax_url_default.global;
  var getAjaxSuffix17 = get_ajax_suffix_default;
  var translate18 = translate_default;
  var WordpressWidgetsCustomizer2 = wp_widgets_customizer_default;
  var showIndicator2 = (element) => {
    let icon = element.querySelector("i");
    element.gHadIcon = Boolean(icon);
    if (!icon) {
      icon = document.createElement("i");
      element.prepend(icon);
    }
    if (!element.gIndicator) element.gIndicator = icon.className || true;
    icon.className = "fa fa-fw fa-spin-fast fa-spinner";
  };
  var hideIndicator2 = (element) => {
    if (!element.gIndicator) return;
    const icon = element.querySelector("i");
    if (icon) {
      if (element.gHadIcon) icon.className = element.gIndicator === true ? "" : element.gIndicator;
      else icon.remove();
    }
    element.gIndicator = null;
  };
  var parseForm = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html || "";
    return template.content.querySelector("form");
  };
  ready17(() => {
    const body = document.body;
    const moduleType = { wordpress: "widget", joomla: "module" };
    delegate12(body, "input", '[data-g-instancepicker] ~ input[type="hidden"]', (event, field) => {
      if (field.value) return;
      const parent = field.parentElement;
      const title = parent && parent.querySelector(".g-instancepicker-title");
      const label = parent && parent.querySelector("[data-g-instancepicker]");
      const reset = parent && parent.querySelector(".g-reset-field");
      if (title) title.textContent = "";
      if (label) label.textContent = label.dataset.gInstancepickerText || "";
      if (reset) reset.style.display = "none";
    });
    delegate12(body, "click", "[data-g-instancepicker]", (event, picker) => {
      event.preventDefault();
      const data = JSON.parse(picker.dataset.gInstancepicker || "{}");
      const field = document.getElementsByName(data.field)[0];
      let value;
      let uri;
      if (data.type === moduleType[window.GENESIS_PLATFORM]) {
        uri = (data.type !== "widget" ? "particle/" : "") + moduleType[window.GENESIS_PLATFORM];
      } else {
        uri = "particle";
      }
      if (!field) return;
      value = field.value;
      if ((data.type === "particle" || data.type === "widget") && value) {
        value = JSON.parse(value || "{}");
        uri = "".concat(value.type, "/").concat(value[data.type]);
      }
      if (data.modal_close) return;
      modal19.open({
        content: translate18("GENESIS_PLATFORM_JS_LOADING"),
        method: !value || data.type === "module" ? "get" : "post",
        data: !value || data.type === "module" ? {} : value,
        overlayClickToClose: false,
        remote: parseAjaxURI17(getAjaxURL19(uri) + getAjaxSuffix17()),
        remoteLoaded: (response, modalInstance) => {
          if (!response.body.success) {
            modal19.enableCloseByOverlay();
            return;
          }
          const content = modalInstance.elements.content[0];
          const select = content.querySelector("[data-mm-select]");
          const search2 = content.querySelector(".search input");
          const blocks = [...content.querySelectorAll("[data-mm-type]")];
          const filters = [...content.querySelectorAll("[data-mm-filter]")];
          if (search2 && filters.length && blocks.length) {
            search2.addEventListener("input", () => {
              const value2 = search2.value.trim().toLowerCase();
              blocks.forEach((block) => block.classList.toggle("hidden", Boolean(value2)));
              if (!value2) return;
              filters.forEach((filter) => {
                const text = (filter.dataset.mmFilter || "").trim().toLowerCase();
                if (text.startsWith(value2) || text.includes(" ".concat(value2))) {
                  const block = filter.matches("[data-mm-type]") ? filter : filter.closest("[data-mm-type]");
                  if (block) block.classList.remove("hidden");
                }
              });
            });
            setTimeout(() => search2.focus(), 5);
          }
          const elementData = JSON.parse(picker.dataset.gInstancepicker || "{}");
          if (elementData.type === moduleType[window.GENESIS_PLATFORM]) elementData.modal_close = true;
          if (select) {
            select.dataset.gInstancepicker = JSON.stringify(elementData);
            return;
          }
          const form = content.querySelector("form");
          const fakeForm = parseForm(response.body.html || response.body);
          const submit3 = content.querySelector('input[type="submit"], button[type="submit"]');
          if (!form && !fakeForm || !submit3 || !fakeForm) return;
          content.querySelectorAll("[data-apply-and-save]").forEach((button) => button.remove());
          submit3.addEventListener("click", (submitEvent) => {
            submitEvent.preventDefault();
            showIndicator2(submit3);
            const post = Submit6(fakeForm.elements, content);
            request15(
              fakeForm.getAttribute("method"),
              parseAjaxURI17(fakeForm.getAttribute("action") + getAjaxSuffix17()),
              post.valid.join("&") || {},
              (error, saveResponse) => {
                if (!saveResponse.body.success) {
                  modal19.open({
                    content: saveResponse.body.html || saveResponse.body.message || saveResponse.body,
                    afterOpen: (container2) => {
                      if (!saveResponse.body.html && !saveResponse.body.message) container2.style({ width: "90%" });
                    }
                  });
                } else {
                  const title = field.parentElement && field.parentElement.querySelector(".g-instancepicker-title");
                  field.value = JSON.stringify(saveResponse.body.item);
                  field.dispatchEvent(new Event("change", { bubbles: true }));
                  if (title) title.textContent = saveResponse.body.item.title;
                }
                modal19.close();
                hideIndicator2(submit3);
                WordpressWidgetsCustomizer2(field);
              }
            );
          });
        }
      });
    });
  });
  var instancepicker_default = {};

  // platforms/common/application/particles/index.js
  var particles_default = {
    colorpicker: colorpicker_default,
    fonts: fonts_default,
    menu: menu_default2,
    icons: icons_default,
    filepicker: filepicker_default,
    collections: collections_default,
    keyvalue: keyvalue_default,
    instancepicker: instancepicker_default
  };

  // platforms/common/application/pagesettings/index.js
  var dom25 = dom_default;
  var Submit7 = submit;
  var modal20 = ui_default.modal;
  var toastr8 = ui_default.toastr;
  var Eraser5 = eraser_default;
  var indicator11 = indicator_default;
  var request16 = request_default;
  var DraggableGroup3 = draggable_group_default;
  var parseAjaxURI18 = get_ajax_url_default.parse;
  var getAjaxSuffix18 = get_ajax_suffix_default;
  var getOutlineNameById5 = get_outline_default.getOutlineNameById;
  var translate19 = translate_default;
  var AtomsField = '[name="page[head][atoms][_json]"]';
  var Atoms2 = {
    eraser: null,
    lists: { picker: null, items: null, trash: null },
    serialize: function() {
      let list = document.querySelector(".atoms-list"), output = [];
      if (!list) {
        return "[]";
      }
      list.querySelectorAll("[data-atom-picked]").forEach(function(item) {
        output.push(JSON.parse(item.getAttribute("data-atom-picked")));
      });
      return JSON.stringify(output).replace(/\//g, "\\/");
    },
    attachEraser: function() {
      let element = document.querySelector("[data-atoms-erase]");
      if (Atoms2.eraser) {
        Atoms2.eraser.setElement(element);
        return;
      }
      Atoms2.eraser = new Eraser5(element);
    },
    createSortables: function(element) {
      Atoms2.attachEraser();
      let root = element || document.querySelector("#atoms");
      if (!root || root.SimpleSort) {
        return;
      }
      let controller = new DraggableGroup3(root, {
        lists: ".atoms-picker, .atoms-list",
        items: "[data-atom-picked]",
        filter: "[data-atom-ignore]",
        cloneFrom: ".atoms-picker",
        trash: "#trash",
        draggingClass: "atom-dragging",
        direction: "grid",
        preview: true,
        canReceive: function(list) {
          return list.classList.contains("atoms-list");
        },
        canDelete: function(state) {
          return state.from.classList.contains("atoms-list");
        },
        onPreview: function(preview, source) {
          let color = getComputedStyle(source).borderTopColor;
          preview.style.backgroundColor = color;
          preview.style.borderColor = color;
          preview.style.color = "#fff";
          preview.querySelectorAll(".atom-title, .atom-settings, .drag-indicator, i").forEach(function(element2) {
            element2.style.color = "#fff";
          });
        },
        onStart: function(event) {
          Atoms2.attachEraser();
          if (!event.cloned) {
            Atoms2.eraser.show();
          }
        },
        onTrashOver: function(over) {
          if (over) {
            Atoms2.eraser.over();
          } else {
            Atoms2.eraser.out();
          }
        },
        onEnd: function(event) {
          if (!event.cloned) {
            Atoms2.eraser.hide();
          }
          if (!event.changed) {
            return;
          }
          let field = document.querySelector(AtomsField);
          if (!field) {
            throw new Error('Field "' + AtomsField + '" not found in the DOM.');
          }
          field.value = Atoms2.serialize();
          field.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      Atoms2.lists.picker = controller;
      Atoms2.lists.items = controller;
      Atoms2.lists.trash = controller;
      root.SimpleSort = controller;
    }
  };
  var attachSettings = function() {
    dom25.delegate(document.body, "click", ".atoms-list [data-atom-picked] .config-cog", function(event, trigger) {
      event.preventDefault();
      let item = trigger.closest("[data-atom-picked]"), list = item && item.parentElement, dataField = document.querySelector(AtomsField);
      if (!item || !list || !dataField) {
        return;
      }
      let itemData = item.getAttribute("data-atom-picked"), dataValue = JSON.parse(dataField.value || "[]");
      modal20.open({
        content: translate19("GENESIS_PLATFORM_JS_LOADING"),
        method: "post",
        data: { data: itemData },
        overlayClickToClose: false,
        remote: parseAjaxURI18(trigger.getAttribute("href") + getAjaxSuffix18()),
        remoteLoaded: function(response, content) {
          let container2 = modal20.element(content.elements.content), form = container2.querySelector("form"), submits = container2.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');
          if (modal20.getAll().length > 1) {
            container2.querySelectorAll("[data-apply-and-save]").forEach(function(button) {
              button.remove();
            });
            submits = container2.querySelectorAll('input[type="submit"], button[type="submit"], [data-apply-and-save]');
          }
          if (!form || !submits.length) {
            return true;
          }
          submits.forEach(function(target) {
            target.addEventListener("click", function(submitEvent) {
              submitEvent.preventDefault();
              indicator11.hide(target);
              indicator11.show(target);
              form = container2.querySelector("form");
              let post = Submit7(form.elements, container2);
              if (post.invalid.length) {
                indicator11.hide(target);
                indicator11.show(target, "fa fa-fw fa-exclamation-triangle");
                toastr8.error(translate19("GENESIS_PLATFORM_JS_REVIEW_FIELDS"), translate19("GENESIS_PLATFORM_JS_INVALID_FIELDS"));
                return;
              }
              request16(form.method, parseAjaxURI18(form.action + getAjaxSuffix18()), post.valid.join("&") || {}, function(error, resultResponse) {
                let result = resultResponse && resultResponse.body;
                if (!result || !result.success) {
                  modal20.open({
                    content: result ? result.html || result.message || result : error ? error.message : "Request failed.",
                    afterOpen: function(modalContainer) {
                      modalContainer = modal20.element(modalContainer);
                      if (result && !result.html && !result.message && modalContainer) {
                        modalContainer.style.width = "90%";
                      }
                    }
                  });
                } else {
                  let items = Array.from(list.querySelectorAll(":scope > [data-atom-picked]")), itemIndex = items.indexOf(item);
                  if (itemIndex !== -1) {
                    dataValue[itemIndex] = result.item;
                    dataField.value = JSON.stringify(dataValue).replace(/\//g, "\\/");
                    item.setAttribute("data-atom-picked", JSON.stringify(result.item).replace(/\//g, "\\/"));
                    let title = item.querySelector(".atom-title");
                    if (title) {
                      title.textContent = result.item.title;
                    }
                    let enabled = Number(result.item.attributes.enabled), inheriting = result.item.inherit && Object.keys(result.item.inherit).length;
                    item.classList.toggle("atom-disabled", !enabled);
                    item.classList.toggle("g-inheriting", Boolean(inheriting));
                    item.title = enabled ? "" : translate19("GENESIS_PLATFORM_JS_LM_DISABLED_PARTICLE", "atom");
                    item.removeAttribute("data-tip");
                    if (inheriting) {
                      let inherit = result.item.inherit, outline = getOutlineNameById5(inherit.outline), atom = inherit.atom || "", include = (inherit.include || []).join(", ");
                      item.setAttribute("data-tip", translate19("GENESIS_PLATFORM_INHERITING_FROM_X", "<strong>" + outline + "</strong>") + "<br />ID: " + atom + "<br />Replace: " + include);
                    }
                    dataField.dispatchEvent(new Event("change", { bubbles: true }));
                    window.Genesis.tips.reload();
                  }
                  if (target.hasAttribute("data-apply-and-save")) {
                    let save = document.querySelector(".button-save");
                    if (save) {
                      save.click();
                    }
                  }
                  modal20.close();
                  toastr8.success(translate19("GENESIS_PLATFORM_JS_GENERIC_SETTINGS_APPLIED", "Atom"), translate19("GENESIS_PLATFORM_JS_SETTINGS_APPLIED"));
                }
                indicator11.hide(target);
              });
            });
          });
        }
      });
    });
  };
  var attachSortableAtoms = function(atoms) {
    if (atoms && !atoms.SimpleSort) {
      Atoms2.createSortables(atoms);
    }
  };
  dom25.ready(function() {
    let atoms = document.querySelector("#atoms");
    dom25.delegate(document.body, "mouseover", "#atoms", function(event, element) {
      attachSortableAtoms(element);
    });
    attachSortableAtoms(atoms);
    attachSettings();
  });
  var pagesettings_default = Atoms2;

  // platforms/common/application/ui/tooltips.js
  var defaults5 = {
    baseClass: "g-tips",
    typeClass: null,
    effectClass: "g-fade",
    inClass: "g-tip-in",
    place: "top",
    spacing: 10,
    offset: -3,
    auto: true
  };
  var number = (value, fallback) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  var Tooltip = class {
    constructor(target, options = {}) {
      this.target = target;
      this.options = Object.assign({}, defaults5, options);
      this.element = document.createElement("div");
      this.element.setAttribute("role", "tooltip");
      this.hidden = true;
      this.hideTimer = null;
      this.content(target.dataset.tip || "");
    }
    readOptions() {
      const data = this.target.dataset;
      this.options.place = data.tipPlace || this.options.place;
      this.options.spacing = number(data.tipSpacing, defaults5.spacing);
      this.options.offset = number(data.tipOffset, defaults5.offset);
      this.options.typeClass = data.tipType || null;
      return this;
    }
    content(content) {
      if (content instanceof Node) {
        this.element.replaceChildren(content);
      } else {
        this.element.innerHTML = content == null ? "" : String(content);
      }
      return this;
    }
    place(place) {
      this.options.place = place || defaults5.place;
      if (!this.hidden) {
        this.position();
      }
      return this;
    }
    show() {
      if (!this.target.isConnected || !this.element.innerHTML) {
        return this;
      }
      clearTimeout(this.hideTimer);
      this.readOptions();
      this.element.className = [
        this.options.baseClass,
        this.options.effectClass,
        this.options.typeClass,
        this.options.place
      ].filter(Boolean).join(" ");
      if (!this.element.isConnected) {
        document.body.appendChild(this.element);
      }
      this.element.style.display = "block";
      this.hidden = false;
      this.position();
      requestAnimationFrame(() => {
        if (!this.hidden) {
          this.element.classList.add(this.options.inClass);
        }
      });
      return this;
    }
    hide() {
      if (this.hidden) {
        return this;
      }
      this.hidden = true;
      this.element.classList.remove(this.options.inClass);
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (this.hidden) {
          this.element.style.display = "none";
        }
      }, 200);
      return this;
    }
    toggle() {
      return this.hidden ? this.show() : this.hide();
    }
    position() {
      if (this.hidden || !this.target.isConnected) {
        return this;
      }
      const target = this.target.getBoundingClientRect();
      const tip = this.element.getBoundingClientRect();
      const place = this.options.place;
      const spacing = this.options.spacing;
      const offset = this.options.offset;
      let top;
      let left;
      if (place.startsWith("bottom")) {
        top = target.bottom + spacing;
      } else if (place.startsWith("left") || place.startsWith("right")) {
        top = target.top + (target.height - tip.height) / 2;
      } else {
        top = target.top - tip.height - spacing;
      }
      if (place.startsWith("right")) {
        left = target.right + spacing;
      } else if (place.startsWith("left")) {
        left = target.left - tip.width - spacing;
      } else {
        left = target.left + (target.width - tip.width) / 2;
      }
      if (/-(left|top)$/.test(place)) {
        if (place.startsWith("left") || place.startsWith("right")) {
          top = target.bottom - tip.height - offset;
        } else {
          left = target.right - tip.width - offset;
        }
      } else if (/-(right|bottom)$/.test(place)) {
        if (place.startsWith("left") || place.startsWith("right")) {
          top = target.top + offset;
        } else {
          left = target.left + offset;
        }
      } else if (place.startsWith("left") || place.startsWith("right")) {
        top += offset;
      } else {
        left += offset;
      }
      if (this.options.auto) {
        left = Math.min(Math.max(left, 4), window.innerWidth - tip.width - 4);
        top = Math.min(Math.max(top, 4), window.innerHeight - tip.height - 4);
      }
      this.element.style.left = "".concat(left + window.scrollX, "px");
      this.element.style.top = "".concat(top + window.scrollY, "px");
      return this;
    }
    destroy() {
      clearTimeout(this.hideTimer);
      this.element.remove();
      this.target = null;
    }
  };
  var Tooltips = class {
    constructor(container2 = document) {
      this.container = container2;
      this.instances = /* @__PURE__ */ new WeakMap();
      this.onMouseOver = this.onMouseOver.bind(this);
      this.onMouseOut = this.onMouseOut.bind(this);
      this.onFocusIn = this.onFocusIn.bind(this);
      this.onFocusOut = this.onFocusOut.bind(this);
      container2.addEventListener("mouseover", this.onMouseOver);
      container2.addEventListener("mouseout", this.onMouseOut);
      container2.addEventListener("focusin", this.onFocusIn);
      container2.addEventListener("focusout", this.onFocusOut);
    }
    targetFromEvent(event) {
      return event.target instanceof Element ? event.target.closest("[data-tip]") : null;
    }
    onMouseOver(event) {
      const target = this.targetFromEvent(event);
      if (target && !target.contains(event.relatedTarget)) {
        this.show(target);
      }
    }
    onMouseOut(event) {
      const target = this.targetFromEvent(event);
      if (target && !target.contains(event.relatedTarget)) {
        this.hide(target);
      }
    }
    onFocusIn(event) {
      const target = this.targetFromEvent(event);
      if (target) {
        this.show(target);
      }
    }
    onFocusOut(event) {
      const target = this.targetFromEvent(event);
      if (target) {
        this.hide(target);
      }
    }
    get(element) {
      if (!element || element.nodeType !== 1) {
        return null;
      }
      let tooltip = this.instances.get(element);
      if (!tooltip && element.dataset.tip) {
        tooltip = new Tooltip(element);
        this.instances.set(element, tooltip);
      }
      return tooltip;
    }
    show(element) {
      const tooltip = this.get(element);
      if (tooltip) {
        tooltip.content(element.dataset.tip).show();
      }
      return this;
    }
    hide(element) {
      const tooltip = this.instances.get(element);
      if (tooltip) {
        tooltip.hide();
      }
      return this;
    }
    toggle(element) {
      const tooltip = this.get(element);
      if (tooltip) {
        tooltip.toggle();
      }
      return this;
    }
    remove(element) {
      const tooltip = this.instances.get(element);
      if (tooltip) {
        tooltip.destroy();
        this.instances.delete(element);
      }
      return this;
    }
    add() {
      return this;
    }
    reload() {
      return this;
    }
    destroy() {
      this.container.removeEventListener("mouseover", this.onMouseOver);
      this.container.removeEventListener("mouseout", this.onMouseOut);
      this.container.removeEventListener("focusin", this.onFocusIn);
      this.container.removeEventListener("focusout", this.onFocusOut);
    }
  };
  var instance = new Tooltips(document);
  var tooltips_default = instance;

  // platforms/common/application/main.js
  var dom26 = dom_collection_default;
  var zen9 = createElement;
  var ready18 = dom_default.ready;
  var request17 = request_default;
  var ui = ui_default;
  var modal21 = ui.modal;
  var toastr9 = ui.toastr;
  var parseAjaxURI19 = get_ajax_url_default.parse;
  var getAjaxURL20 = get_ajax_url_default.global;
  var getAjaxSuffix19 = get_ajax_suffix_default;
  var flags9 = flags_state_default;
  var validateField2 = field_validation_default;
  var lm = lm_default;
  var mm2 = menu_default;
  var pm = cards_default;
  var translate20 = translate_default;
  var trim5 = function(value, characters) {
    let string = value == null ? "" : String(value);
    if (!characters) {
      return string.trim();
    }
    let escaped = String(characters).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return string.replace(new RegExp("^[" + escaped + "]+|[" + escaped + "]+$", "g"), "");
  };
  var interpolate = function(template, replacements) {
    return String(template == null ? "" : template).replace(/\{\{([^}]+)}}/g, function(match, path) {
      let value = path.split(".").reduce(function(current, key) {
        return current == null ? void 0 : current[key];
      }, replacements);
      return value == null ? "" : String(value);
    });
  };
  var setParam2 = function(uri, name, value) {
    let url = new URL(uri, window.location.href), isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(uri);
    url.searchParams.set(name, value);
    return isAbsolute ? url.href : url.pathname + url.search + url.hash;
  };
  var createHandler = function(divisor, noun, restOfString) {
    return function(diff) {
      let n = Math.floor(diff / divisor);
      let pluralizedNoun = noun + (n > 1 ? "s" : "");
      return "" + n + " " + pluralizedNoun + " " + restOfString;
    };
  };
  var reportInvalidFields2 = function(invalid) {
    let fields2 = invalid.map(function(input) {
      let element = input && input[0] ? input[0] : input, container2 = element ? element.closest(".settings-param, .card-overrideable") : null, label = container2 ? container2.querySelector(".settings-param-title, label") : null;
      if (element) {
        element.classList.add("field-invalid");
        element.setAttribute("aria-invalid", "true");
      }
      return label && label.textContent.trim() ? label.textContent.trim() : element && (element.getAttribute("aria-label") || element.name || element.id) || "Unknown field";
    }).filter(function(value, index, values) {
      return values.indexOf(value) === index;
    });
    let first = invalid[0] && (invalid[0][0] || invalid[0]);
    if (first) {
      first.addEventListener("input", function clearInvalid() {
        first.classList.remove("field-invalid");
        first.removeAttribute("aria-invalid");
      }, { once: true });
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      first.focus({ preventScroll: true });
    }
    let message = translate20("GENESIS_PLATFORM_JS_REVIEW_FIELDS");
    if (fields2.length) {
      message += "<br><strong>" + fields2.join(", ") + "</strong>";
    }
    toastr9.error(message, translate20("GENESIS_PLATFORM_JS_INVALID_FIELDS"));
  };
  var formatters = [
    { threshold: -31535999, handler: createHandler(-31536e3, "year", "from now") },
    { threshold: -2591999, handler: createHandler(-2592e3, "month", "from now") },
    { threshold: -604799, handler: createHandler(-604800, "week", "from now") },
    { threshold: -172799, handler: createHandler(-86400, "day", "from now") },
    { threshold: -86399, handler: function() {
      return "tomorrow";
    } },
    { threshold: -3599, handler: createHandler(-3600, "hour", "from now") },
    { threshold: -59, handler: createHandler(-60, "minute", "from now") },
    { threshold: -0.9999, handler: createHandler(-1, "second", "from now") },
    { threshold: 1, handler: function() {
      return "just now";
    } },
    { threshold: 60, handler: createHandler(1, "second", "ago") },
    { threshold: 3600, handler: createHandler(60, "minute", "ago") },
    { threshold: 86400, handler: createHandler(3600, "hour", "ago") },
    { threshold: 172800, handler: function() {
      return "yesterday";
    } },
    { threshold: 604800, handler: createHandler(86400, "day", "ago") },
    { threshold: 2592e3, handler: createHandler(604800, "week", "ago") },
    { threshold: 31536e3, handler: createHandler(2592e3, "month", "ago") },
    { threshold: Infinity, handler: createHandler(31536e3, "year", "ago") }
  ];
  var prettyDate = {
    format: function(date) {
      let diff = ((/* @__PURE__ */ new Date()).getTime() - date.getTime()) / 1e3;
      for (let i = 0; i < formatters.length; i++) {
        if (diff < formatters[i].threshold) {
          return formatters[i].handler(diff);
        }
      }
      throw new Error("exhausted all formatter options, none found");
    }
  };
  window.onbeforeunload = function() {
    if (flags9.get("pending")) {
      return translate20("GENESIS_PLATFORM_JS_NO_SAVE_DETECTED");
    }
  };
  ready18(function() {
    let body = dom26("body"), sentence = translate20("GENESIS_PLATFORM_JS_SAVE_SUCCESS");
    let applyAdminTheme = function(mode) {
      let dark = mode === "dark", container2 = document.querySelector("[data-genesis-container]");
      if (container2) {
        container2.classList.toggle("genesis-dark-mode", dark);
      }
      document.body.classList.toggle("genesis-dark-mode", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
      document.querySelectorAll("[data-g-admin-theme]").forEach(function(toggle2) {
        let checkbox = toggle2.querySelector(".enabler"), input = toggle2.querySelector('[name="admin_color_mode"]'), icon = toggle2.querySelector(".fa");
        if (checkbox) {
          checkbox.setAttribute("aria-checked", dark ? "true" : "false");
        }
        if (input) {
          input.value = dark ? "1" : "0";
        }
        if (icon) {
          icon.classList.toggle("fa-moon", !dark);
          icon.classList.toggle("fa-sun", dark);
        }
      });
    };
    let adminTheme = "light";
    try {
      adminTheme = window.localStorage.getItem("genesis-admin-color-mode") || "light";
    } catch (error) {
    }
    applyAdminTheme(adminTheme);
    body.delegate("change", '[data-g-admin-theme] [name="admin_color_mode"]', function(event, element) {
      let input = element[0] || element, mode = input.value === "1" ? "dark" : "light";
      try {
        window.localStorage.setItem("genesis-admin-color-mode", mode);
      } catch (error) {
      }
      applyAdminTheme(mode);
    });
    body.delegate("click", "[data-g-extras]", function() {
      setTimeout(function() {
        let container2 = document.querySelector("[data-genesis-container]");
        applyAdminTheme(container2 && container2.classList.contains("genesis-dark-mode") ? "dark" : "light");
      }, 0);
    });
    body.delegate("click", "[data-g-close]", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      let parent = element.data("g-close");
      parent = parent ? element.parent(parent) : element;
      parent.slideUp(function() {
        parent.remove();
      });
    });
    body.delegate("click", "[data-g-popover]", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      if (!element.PopoverDefined) {
        let content = element.find("[data-popover-content]") || element.siblings("[data-popover-content]"), popover = element.getPopover({
          style: element.data("g-popover-style") || "generic",
          width: element.data("g-popover-width") || 220,
          content: zen9("ul").html(content.html())[0].outerHTML,
          allowElementsClick: element.data("g-popover-elementsclick") || ".toggle"
        });
        element.on("shown.popover", function(popover2) {
          let enabler = element.find(".enabler");
          element.attribute("aria-expanded", true);
          if (enabler) {
            enabler[0].focus();
          }
        });
        element.on("hide.popover", function(popover2) {
          element.attribute("aria-expanded", false);
        });
        element.getPopover().show();
      }
    });
    body.delegate("mousedown", "[data-settings-key]", function(event, element) {
      let key = element.data("settings-key");
      if (!key) {
        return true;
      }
      let redirect = window.location.search, settings = element.attribute("href"), uri = window.location.href.split("?");
      if (uri.length > 1 && uri[0].match(/index.php$/)) {
        redirect = "index.php" + redirect;
      }
      redirect = setParam2(settings, key, btoa(redirect));
      element.href(redirect);
    });
    body.delegate("mouseover", ".button-save", function(event, element) {
      if (!element.lastSaved) {
        return true;
      }
      let feedback = translate20("GENESIS_PLATFORM_LAST_SAVED") + ": " + prettyDate.format(element.lastSaved);
      element.data("tip", feedback).data("title", feedback);
    });
    body.delegate("click", ".button-save", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      let saves = dom26(".button-save");
      if (saves.disabled()) {
        return false;
      }
      saves.disabled(true);
      saves.hideIndicator();
      saves.showIndicator();
      let data = {}, invalid = [], type = element.data("save"), extras = "", page = dom26("[data-lm-root]") ? "layout" : dom26("[data-mm-id]") ? "menu" : dom26("[data-genesis-position]") ? "positions" : "other", saveURL = parseAjaxURI19(trim5(window.location.href, "#") + getAjaxSuffix19());
      switch (page) {
        case "layout":
          let preset = dom26("[data-lm-preset]");
          lm.layoutmanager.singles("cleanup", lm.builder, false);
          lm.savestate.setSession(lm.builder.serialize(null, true));
          data.preset = preset && preset.data("lm-preset") ? preset.data("lm-preset") : "default";
          let layout = JSON.stringify(lm.builder.serialize());
          data.layout = layout;
          break;
        case "menu":
          data.menutype = dom26("select.menu-select-wrap").value();
          data.settings = JSON.stringify(mm2.menumanager.settings);
          data.ordering = JSON.stringify(mm2.menumanager.ordering);
          let items = JSON.stringify(mm2.menumanager.items);
          data.items = items;
          saveURL = parseAjaxURI19(element.parent("form").attribute("action") + getAjaxSuffix19());
          break;
        case "positions":
          data.positions = pm.serialize();
          break;
        case "other":
        default:
          let form = element.parent("form");
          if (form && element.attribute("type") == "submit") {
            dom26(form[0].elements).forEach(function(input) {
              input = dom26(input);
              let name = input.attribute("name"), type2 = input.attribute("type"), value = input.value(), parent = input.parent(".settings-param, .card-overrideable"), override = parent ? parent.find('> input[type="checkbox"]') : null;
              override = override || dom26(input.data("override-target"));
              if (!name || input.disabled() || override && !override.checked() || type2 == "radio" && !input.checked()) {
                return;
              }
              if (!validateField2(input)) {
                invalid.push(input);
              }
              data[name] = value;
            });
          }
      }
      if (invalid.length) {
        saves.disabled(false);
        saves.hideIndicator();
        saves.showIndicator("fa fa-fw fa-exclamation-triangle");
        reportInvalidFields2(invalid);
        return;
      }
      if (page == "other") {
        dom26(".settings-param-title, .card.settings-block > h4").hideIndicator();
      }
      body[0].dispatchEvent(new CustomEvent("updateOriginalFields"));
      request17("post", saveURL, data, function(error, response) {
        if (!response.body.success) {
          modal21.open({
            content: response.body.html || response.body.message || response.body,
            afterOpen: function(container2) {
              container2 = modal21.element(container2);
              if (container2 && !response.body.html && !response.body.message) {
                container2.style.width = "90%";
              }
            }
          });
        } else {
          modal21.close();
          if (dom26("#styles")) {
            extras = "<br />" + (response.body.warning ? "<hr />" + response.body.title + "<br />" + response.body.html : translate20("GENESIS_PLATFORM_JS_CSS_COMPILED"));
          }
          toastr9[response.body.warning ? "warning" : "success"](interpolate(sentence, {
            verb: type.slice(-1) == "s" ? "have" : "has",
            type,
            extras
          }), type + " " + translate20("GENESIS_PLATFORM_SAVED"));
        }
        saves.disabled(false);
        saves.hideIndicator();
        saves.forEach(function(save) {
          dom26(save).lastSaved = /* @__PURE__ */ new Date();
        });
        if (page == "layout") {
          lm.layoutmanager.updatePendingChanges();
        }
        flags9.set("pending", false);
        flags9.emit("update:pending");
      });
    });
    body.delegate("keydown", "[data-title-edit]", function(event, element) {
      let key = event.which ? event.which : event.keyCode;
      if (key == 32 || key == 13) {
        event.preventDefault();
        body.emit("click", event);
      }
    });
    body.delegate("click", "[data-title-edit]", function(event, element) {
      element = dom26(element);
      if (element.hasClass("disabled")) {
        return false;
      }
      let $title = element.siblings("[data-title-editable]") || element.previousSiblings().find("[data-title-editable]") || element.nextSiblings().find("[data-title-editable]"), title;
      if (!$title) {
        return true;
      }
      title = $title[0];
      $title.text(trim5($title.text()));
      $title.attribute("contenteditable", true);
      title.focus();
      let range = document.createRange(), selection;
      range.selectNodeContents(title);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      $title.storedTitle = trim5($title.text());
      $title.titleEditCanceled = false;
      $title.emit("title-edit-start", $title.storedTitle);
      $title[0].dispatchEvent(new CustomEvent("genesis:title-edit-start", {
        bubbles: true,
        detail: { title: $title.storedTitle }
      }));
    });
    body.delegate("keydown", "[data-title-editable]", function(event, element) {
      element = dom26(element);
      switch (event.keyCode) {
        case 13:
        // return
        case 27:
          event.stopPropagation();
          if (event.keyCode == 27) {
            if (typeof element.storedTitle !== "undefined") {
              element.text(element.storedTitle);
              element.titleEditCanceled = true;
            }
          }
          element.attribute("contenteditable", null);
          element[0].blur();
          let exitTitle = element.data("title-editable"), exitKey = event.keyCode == 13 ? "enter" : "esc";
          element.emit("title-edit-exit", exitTitle, exitKey);
          element[0].dispatchEvent(new CustomEvent("genesis:title-edit-exit", {
            bubbles: true,
            detail: { title: exitTitle, key: exitKey }
          }));
          return false;
        default:
          return true;
      }
    });
    body.delegate("blur", "[data-title-editable]", function(event, element) {
      element = dom26(element);
      element[0].scrollLeft = 0;
      element.attribute("contenteditable", null);
      element.data("title-editable", trim5(element.text()));
      window.getSelection().removeAllRanges();
      let title = element.data("title-editable"), original = element.storedTitle, canceled = element.titleEditCanceled;
      element.emit("title-edit-end", title, original, canceled);
      element[0].dispatchEvent(new CustomEvent("genesis:title-edit-end", {
        bubbles: true,
        detail: {
          title,
          original,
          canceled
        }
      }));
    }, true);
    body.delegate("click", "[data-ajax-action]", function(event, element) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      let href = element.attribute("href") || element.data("ajax-action"), method = element.data("ajax-action-method") || "post", indicator12 = dom26(element.data("ajax-action-indicator")) || element;
      if (!href) {
        return false;
      }
      let extras = dom26("[data-g-extras]");
      if (extras && extras[0].PopoverDefined) {
        extras.getPopover().hide();
      }
      indicator12.showIndicator();
      request17(method, parseAjaxURI19(href + getAjaxSuffix19()), function(error, response) {
        if (!response.body.success) {
          modal21.open({
            content: response.body.html || response.body.message || response.body,
            afterOpen: function(container2) {
              container2 = modal21.element(container2);
              if (container2 && !response.body.html && !response.body.message) {
                container2.style.width = "90%";
              }
            }
          });
          indicator12.hideIndicator();
          return false;
        } else {
          toastr9[response.body.warning ? "warning" : "success"](response.body.html || "Action successfully completed.", response.body.title || "");
        }
        indicator12.hideIndicator();
      });
    }, true);
  });
  var modules = {
    lm,
    mm: mm2,
    assingments: assignments_default,
    ui: ui_default,
    styles: styles_default,
    dom: dom26,
    domready: ready18,
    particles: particles_default,
    zen: zen9,
    atoms: pagesettings_default,
    tips: tooltips_default
  };
  window.Genesis = modules;
  var main_default = modules;
})();
//# sourceMappingURL=main.js.map
