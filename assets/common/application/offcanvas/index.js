// Offcanvas slide with desktop, touch and all-in-one touch device support.
// Based on Slideout.js <https://mango.github.io/slideout/>.

"use strict";

const decouple = require("../utils/decouple");

const hasTouchEvents = "ontouchstart" in window
    || (window.DocumentTouch && document instanceof window.DocumentTouch);
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
const mapNumber = (value, inputMinimum, inputMaximum, outputMinimum, outputMaximum) => {
    if (inputMaximum === inputMinimum) return outputMinimum;
    const ratio = (value - inputMinimum) / (inputMaximum - inputMinimum);
    return outputMinimum + ratio * (outputMaximum - outputMinimum);
};

let isScrolling = false;
let scrollTimeout;

class Offcanvas {
    constructor(options = {}) {
        const defaults = {
            effect: "ease",
            duration: 300,
            tolerance: padding => padding / 3,
            padding: 0,
            touch: true,
            css3: true,
            openClass: "g-offcanvas-open",
            openingClass: "g-offcanvas-opening",
            closingClass: "g-offcanvas-closing",
            overlayClass: "g-nav-overlay"
        };

        this.options = { ...defaults, ...options };
        this.attached = false;
        this.opening = false;
        this.moved = false;
        this.dragging = false;
        this.opened = false;
        this.preventOpen = false;
        this.listeners = [];
        this.offset = {
            x: { start: 0, current: 0 },
            y: { start: 0, current: 0 }
        };

        this.bodyEl = document.body;
        this.htmlEl = document.documentElement;
        this.panel = document.querySelector("#g-page-surround");
        this.offcanvas = document.querySelector("#g-offcanvas");

        if (!this.panel || !this.offcanvas) {
            this.available = false;
            return;
        }
        this.available = true;

        const swipe = this.offcanvas.getAttribute("data-g-offcanvas-swipe");
        const css3 = this.offcanvas.getAttribute("data-g-offcanvas-css3");
        this.options.touch = Boolean(swipe !== null ? parseInt(swipe, 10) : 1);
        this.options.css3 = Boolean(css3 !== null ? parseInt(css3, 10) : 1);

        if (!this.options.padding) {
            this.offcanvas.style.display = "block";
            this.options.padding = this.offcanvas.getBoundingClientRect().width;
            this.offcanvas.style.removeProperty("display");
        }

        this.tolerance = typeof this.options.tolerance === "function"
            ? this.options.tolerance.call(this, this.options.padding)
            : this.options.tolerance;

        this.htmlEl.classList.add(`g-offcanvas-${this.options.css3 ? "css3" : "css2"}`);
        this.attach();
        this._checkTogglers();
    }

    listen(element, type, handler, options) {
        if (!element) return;
        const listener = handler.bind(this);
        element.addEventListener(type, listener, options);
        this.listeners.push({ element, type, listener, options });
    }

    delegate(element, type, selector, handler, options) {
        if (!element) return;
        const listener = event => {
            const target = event.target instanceof Element ? event.target.closest(selector) : null;
            if (target && element.contains(target)) handler.call(this, event, target);
        };
        element.addEventListener(type, listener, options);
        this.listeners.push({ element, type, listener, options });
    }

    attach() {
        if (!this.available || this.attached) return this;
        this.attached = true;

        if (this.options.touch && hasTouchEvents) this.attachTouchEvents();

        ["toggle", "open", "close"].forEach(mode => {
            const selector = `[data-offcanvas-${mode}]`;
            this.delegate(this.bodyEl, "click", selector, this[mode]);
            if (hasTouchEvents) this.delegate(this.bodyEl, "touchend", selector, this[mode]);
        });

        this.attachMutationEvent();

        this.overlay = document.createElement("div");
        this.overlay.className = this.options.overlayClass;
        this.overlay.setAttribute("data-offcanvas-close", "");
        this.panel.prepend(this.overlay);

        return this;
    }

    attachMutationEvent() {
        if (!this.available) return;
        if (this.observer) this.observer.disconnect();
        this.observer = new MutationObserver(() => this._checkTogglers());
        this.observer.observe(this.offcanvas, { childList: true, subtree: true });
    }

    attachTouchEvents() {
        const msPointerSupported = window.navigator.msPointerEnabled;
        this.touchEvents = {
            start: msPointerSupported ? "MSPointerDown" : "touchstart",
            move: msPointerSupported ? "MSPointerMove" : "touchmove",
            end: msPointerSupported ? "MSPointerUp" : "touchend"
        };

        this._scrollBound = decouple(window, "scroll", this._bodyScroll.bind(this));
        this.listen(this.bodyEl, this.touchEvents.move, this._bodyMove, { passive: false });
        this.listen(this.panel, this.touchEvents.start, this._touchStart, { passive: true });
        this.listen(this.panel, "touchcancel", this._touchCancel);
        this.listen(this.panel, this.touchEvents.end, this._touchEnd);
        this.listen(this.panel, this.touchEvents.move, this._touchMove, { passive: true });
    }

    detach() {
        if (!this.attached) return this;
        this.attached = false;

        this.listeners.forEach(({ element, type, listener, options }) => {
            element.removeEventListener(type, listener, options);
        });
        this.listeners = [];

        if (this._scrollBound) {
            window.removeEventListener("scroll", this._scrollBound);
            this._scrollBound = null;
        }

        this.detachMutationEvent();
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        return this;
    }

    detachMutationEvent() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    open(event) {
        if (!this.available) return this;
        if (event && /^touch/i.test(event.type)) event.preventDefault();
        else this.dragging = false;
        if (this.opened) return this;

        this.htmlEl.classList.add(this.options.openClass, this.options.openingClass);
        if (this.overlay) this.overlay.style.opacity = 1;
        if (this.options.css3) this.panel.style[this.getOffcanvasPosition()] = "inherit";

        this._setTransition();
        this._translateXTo(
            (this.bodyEl.classList.contains("g-offcanvas-right") ? -1 : 1) * this.options.padding
        );
        this.opened = true;

        clearTimeout(this.transitionTimer);
        this.transitionTimer = setTimeout(() => {
            this.htmlEl.classList.remove(this.options.openingClass);
            this.offcanvas.setAttribute("aria-expanded", "true");
            document.querySelectorAll("[data-offcanvas-toggle]")
                .forEach(toggle => toggle.setAttribute("aria-expanded", "true"));
            this.panel.style.transition = "";
        }, this.options.duration);

        return this;
    }

    close(event, element) {
        if (!this.available) return this;
        if (event && /^touch/i.test(event.type)) event.preventDefault();
        else this.dragging = false;

        element = element || window;
        if (!this.opened && !this.opening) return this;
        if (this.panel !== element && this.dragging) return false;

        this.htmlEl.classList.add(this.options.closingClass);
        if (this.overlay) this.overlay.style.opacity = 0;

        this._setTransition();
        this._translateXTo(0);
        this.opened = false;
        this.offcanvas.setAttribute("aria-expanded", "false");
        document.querySelectorAll("[data-offcanvas-toggle]")
            .forEach(toggle => toggle.setAttribute("aria-expanded", "false"));

        clearTimeout(this.transitionTimer);
        this.transitionTimer = setTimeout(() => {
            this.htmlEl.classList.remove(this.options.openClass, this.options.closingClass);
            this.panel.style.transition = "";
            this.panel.style.transform = "";
            this.panel.style[this.getOffcanvasPosition()] = "";
        }, this.options.duration);

        return this;
    }

    toggle(event, element) {
        if (event && /^touch/i.test(event.type)) event.preventDefault();
        else this.dragging = false;
        return this[this.opened ? "close" : "open"](event, element);
    }

    getOffcanvasPosition() {
        return this.bodyEl.classList.contains("g-offcanvas-right") ? "right" : "left";
    }

    _setTransition() {
        if (this.options.css3) {
            this.panel.style.transition =
                `transform ${this.options.duration}ms ${this.options.effect}`;
        } else {
            this.panel.style.transition =
                `left ${this.options.duration}ms ${this.options.effect}, `
                + `right ${this.options.duration}ms ${this.options.effect}`;
        }
    }

    _translateXTo(x) {
        const placement = this.getOffcanvasPosition();
        this.offset.x.current = x;
        if (this.options.css3) {
            this.panel.style.transform = `translate3d(${x}px, 0, 0)`;
        } else {
            this.panel.style[placement] = `${Math.abs(x)}px`;
        }
    }

    _bodyScroll() {
        if (this.moved) return;
        clearTimeout(scrollTimeout);
        isScrolling = true;
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 250);
    }

    _bodyMove(event) {
        if (this.moved && event.cancelable) event.preventDefault();
        this.dragging = true;
        return false;
    }

    _touchStart(event) {
        if (!event.touches) return;
        this.moved = false;
        this.opening = false;
        this.dragging = false;
        this.offset.x.start = event.touches[0].pageX;
        this.offset.y.start = event.touches[0].pageY;
        this.preventOpen = !this.opened && this.offcanvas.clientWidth !== 0;
    }

    _touchCancel() {
        this.moved = false;
        this.opening = false;
    }

    _touchMove(event) {
        if (isScrolling || this.preventOpen || !event.touches) return;
        if (this.options.css3) this.panel.style[this.getOffcanvasPosition()] = "inherit";

        const placement = this.getOffcanvasPosition();
        const diffX = clamp(
            event.touches[0].clientX - this.offset.x.start,
            -this.options.padding,
            this.options.padding
        );
        let translateX = this.offset.x.current = diffX;
        const diffY = Math.abs(event.touches[0].pageY - this.offset.y.start);
        const offset = placement === "right" ? -1 : 1;

        if (Math.abs(translateX) > this.options.padding) return;
        if (diffY > 5 && !this.moved) return;

        if (Math.abs(diffX) <= 0) return;
        this.opening = true;

        if (placement === "left" && ((this.opened && diffX > 0) || (!this.opened && diffX < 0))) {
            return;
        }
        if (placement === "right" && ((this.opened && diffX < 0) || (!this.opened && diffX > 0))) {
            return;
        }

        if (!this.moved && !this.htmlEl.classList.contains(this.options.openClass)) {
            this.htmlEl.classList.add(this.options.openClass);
        }

        if ((placement === "left" && diffX <= 0) || (placement === "right" && diffX >= 0)) {
            translateX = diffX + offset * this.options.padding;
            this.opening = false;
        }

        if (this.overlay) {
            this.overlay.style.opacity = mapNumber(
                Math.abs(translateX),
                0,
                this.options.padding,
                0,
                1
            );
        }

        if (this.options.css3) {
            this.panel.style.transform = `translate3d(${translateX}px, 0, 0)`;
        } else {
            this.panel.style[placement] = `${Math.abs(translateX)}px`;
        }
        this.moved = true;
    }

    _touchEnd(event) {
        if (this.moved) {
            const tolerance = Math.abs(this.offset.x.current) > this.tolerance;
            const placedRight = this.bodyEl.classList.contains("g-offcanvas-right");
            const direction = !placedRight
                ? this.offset.x.current < 0
                : this.offset.x.current > 0;

            this.opening = tolerance ? !direction : direction;
            this.opened = !this.opening;
            this[this.opening ? "open" : "close"](event, this.panel);
        }
        this.moved = false;
        return true;
    }

    _checkTogglers() {
        if (!this.available) return;
        const togglers = Array.from(document.querySelectorAll(
            "[data-offcanvas-toggle], [data-offcanvas-open], [data-offcanvas-close]"
        ));
        const mobileContainer = document.querySelector("#g-mobilemenu-container");
        if (!togglers.length) return;
        if (this.opened) this.close();

        setTimeout(() => {
            const blocks = Array.from(this.offcanvas.querySelectorAll(".g-block"));
            const mobileText = mobileContainer ? mobileContainer.textContent.length : 0;
            const shouldCollapse = blocks.length === 1
                && mobileContainer
                && !this.offcanvas.textContent.trim().length
                && !blocks.some(block => block.querySelector(".g-menu-item"));

            togglers.forEach(toggler => {
                toggler.classList.toggle("g-offcanvas-hide", Boolean(shouldCollapse));
            });
            if (mobileContainer) {
                const block = mobileContainer.closest(".g-block");
                if (block) block.classList.toggle("hidden", !mobileText);
            }

            if (!shouldCollapse && !this.attached) {
                this.attach();
            } else if (shouldCollapse && this.attached) {
                this.detach();
                this.attachMutationEvent();
            }
        }, 0);
    }
}

module.exports = Offcanvas;
