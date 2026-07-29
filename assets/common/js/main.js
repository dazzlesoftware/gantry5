(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

const Menu = require('./menu');
const Offcanvas = require('./offcanvas');
require('./totop');

const { ready, query, queryAll, delegate } = require('./utils/dom');
const instances = { ready, query, queryAll, delegate };

window.G5 = instances;
module.exports = instances;

ready(() => {
    try {
        instances.offcanvas = new Offcanvas();
    } catch (error) {
        console.error('Gantry off-canvas initialization failed:', error);
    }

    try {
        instances.menu = new Menu();
    } catch (error) {
        console.error('Gantry menu initialization failed:', error);
    }
});

},{"./menu":2,"./offcanvas":3,"./totop":4,"./utils/dom":6}],2:[function(require,module,exports){
"use strict";

const hasTouchEvents = "ontouchstart" in window
    || (window.DocumentTouch && document instanceof window.DocumentTouch);

const closest = (element, selector) => element instanceof Element ? element.closest(selector) : null;
const directChildren = (element, selector) => Array.from(element ? element.children : [])
    .filter(child => child.matches(selector));
const descendants = (element, selector) => Array.from(element ? element.querySelectorAll(selector) : []);
const clearStyle = element => element && element.removeAttribute("style");

class Menu {
    constructor(options = {}) {
        const defaults = {
            selectors: {
                mainContainer: ".g-main-nav",
                mobileContainer: "#g-mobilemenu-container",
                topLevel: ".g-toplevel",
                rootItems: "> ul > li",
                parent: ".g-parent",
                item: ".g-menu-item",
                dropdown: ".g-dropdown",
                overlay: ".g-menu-overlay",
                touchIndicator: ".g-menu-parent-indicator",
                linkedParent: "[data-g-menuparent]",
                mobileTarget: "[data-g-mobile-target]"
            },
            states: {
                active: "g-active",
                inactive: "g-inactive",
                selected: "g-selected",
                touchEvents: "g-menu-hastouch"
            }
        };

        this.options = {
            ...defaults,
            ...options,
            selectors: { ...defaults.selectors, ...(options.selectors || {}) },
            states: { ...defaults.states, ...(options.states || {}) }
        };
        this.selectors = this.options.selectors;
        this.states = this.options.states;
        this.active = null;
        this.location = [];
        this.listeners = [];

        this.overlay = document.createElement("div");
        this.overlay.className = this.selectors.overlay.replace(/^\./, "");

        const pageSurround = document.querySelector("#g-page-surround");
        if (pageSurround) pageSurround.prepend(this.overlay);

        const mainContainer = document.querySelector(this.selectors.mainContainer);
        if (!mainContainer) return;

        const hoverExpand = mainContainer.getAttribute("data-g-hover-expand");
        this.hoverExpand = hoverExpand === null || hoverExpand === "true";
        if (hasTouchEvents || !this.hoverExpand) {
            mainContainer.classList.add(this.states.touchEvents);
        }

        this.attach();
    }

    listen(element, type, handler, options) {
        if (!element) return;
        const listener = handler.bind(this);
        element.addEventListener(type, listener, options);
        this.listeners.push({ element, type, listener, options });
    }

    attach() {
        const selectors = this.selectors;
        const mainItems = document.querySelectorAll(`${selectors.mainContainer} ${selectors.item}`);
        const mobileContainer = document.querySelector(selectors.mobileContainer);
        const body = document.body;

        if (!mainItems.length) return;
        if (this.hoverExpand) {
            mainItems.forEach(item => {
                this.listen(item, "mouseenter", this.mouseenter);
                this.listen(item, "mouseleave", this.mouseleave);
            });
        }

        this.listen(body, "click", this.handleBodyClick);

        if (hasTouchEvents || !this.hoverExpand) {
            document.querySelectorAll(selectors.linkedParent).forEach(link => {
                this.listen(link, "touchmove", this.touchmove, { passive: true });
                this.listen(link, "touchend", this.touchend);
            });
            this.listen(this.overlay, "touchend", this.closeAllDropdowns);
        }

        if (mobileContainer) {
            const breakpoint = mobileContainer.getAttribute("data-g-menu-breakpoint") || "48rem";
            this.mediaQuery = window.matchMedia(
                `only all and (max-width: ${this._calculateBreakpoint(breakpoint)})`
            );
            this.mediaQueryListener = event => this._checkQuery(event);
            if (this.mediaQuery.addEventListener) {
                this.mediaQuery.addEventListener("change", this.mediaQueryListener);
            } else {
                this.mediaQuery.addListener(this.mediaQueryListener);
            }
            this._checkQuery(this.mediaQuery);
        }
    }

    detach() {
        this.listeners.forEach(({ element, type, listener, options }) => {
            element.removeEventListener(type, listener, options);
        });
        this.listeners = [];

        if (this.mediaQuery && this.mediaQueryListener) {
            if (this.mediaQuery.removeEventListener) {
                this.mediaQuery.removeEventListener("change", this.mediaQueryListener);
            } else {
                this.mediaQuery.removeListener(this.mediaQueryListener);
            }
        }
    }

    handleBodyClick(event) {
        const linkedParent = closest(event.target, this.selectors.linkedParent);
        if (linkedParent) {
            const inMainMenu = Boolean(linkedParent.closest(this.selectors.mainContainer));
            const inFullwidthSublevel = Boolean(linkedParent.closest(".g-fullwidth .g-sublevel"));
            if (!inMainMenu || inFullwidthSublevel) {
                this.click(event);
                return;
            }
        }

        const anchor = closest(event.target, "a[href]");
        if (anchor && !anchor.closest(this.selectors.mainContainer)) {
            this.resetAfterClick(event);
        }
    }

    click(event) {
        this.touchend(event);
    }

    resetAfterClick(event) {
        const target = event.target instanceof Element ? event.target : null;
        if (target && target.hasAttribute("data-g-menuparent")) return true;

        this.closeDropdown(event);
        if (window.G5 && window.G5.offcanvas) window.G5.offcanvas.close();
        return true;
    }

    mouseenter(event) {
        const element = event.currentTarget;
        if (!closest(element, this.selectors.mainContainer)) return;
        if (closest(element.parentElement, this.selectors.item) && !closest(element, ".g-standard")) return;
        this.openDropdown(element);
    }

    mouseleave(event) {
        const element = event.currentTarget;
        if (!closest(element, this.selectors.mainContainer)) return;
        if (closest(element.parentElement, this.selectors.item) && !closest(element, ".g-standard")) return;
        this.closeDropdown(element);
    }

    touchmove(event) {
        const target = event.target instanceof Element ? event.target : event.currentTarget;
        target.gantryMenuMoving = true;
    }

    touchend(event) {
        const selectors = this.selectors;
        const states = this.states;
        let target = event.target instanceof Element ? event.target : null;
        if (!target) return true;

        const item = closest(target, selectors.item);
        const indicator = item ? item.querySelector(selectors.touchIndicator) : null;
        const menuType = closest(target, ".g-standard") ? "standard" : "megamenu";
        const isGoingBack = Boolean(closest(target, ".g-go-back"));

        if (target.gantryMenuMoving) {
            target.gantryMenuMoving = false;
            return false;
        }
        target.gantryMenuMoving = false;

        if (indicator) target = indicator;

        const parent = target.matches(selectors.item) ? target : closest(target, selectors.item);
        if (!parent) return true;
        const isSelected = parent.classList.contains(states.selected);

        if (!parent.querySelector(selectors.dropdown) && !indicator) return true;

        event.stopPropagation();
        if (!indicator || target.matches(selectors.touchIndicator)) event.preventDefault();

        if (!isSelected && parent.parentElement) {
            Array.from(parent.parentElement.children)
                .filter(sibling => sibling !== parent && sibling.matches(`${selectors.item}.${states.selected}`))
                .forEach(open => this.closeDropdown(open));
        }

        const isOutsideMain = !closest(parent, selectors.mainContainer);
        const hasDropdown = parent.querySelector(
            `:scope > ${selectors.dropdown}, :scope > * > ${selectors.dropdown}`
        );

        if ((menuType === "megamenu" || isOutsideMain) && (hasDropdown || isGoingBack)) {
            let sublevel = closest(target, ".g-sublevel") || closest(target, ".g-toplevel");
            const slideout = parent.querySelector(".g-sublevel");
            const columns = closest(parent, ".g-dropdown-column");

            if (sublevel) {
                const isNavMenu = Boolean(closest(target, selectors.mainContainer));
                if (!isNavMenu || !sublevel.matches(".g-toplevel")) {
                    this._fixHeights(sublevel, slideout, isGoingBack, isNavMenu);
                }

                if (!isNavMenu && columns) {
                    const grid = directChildren(columns, ".g-grid")[0];
                    const blocks = directChildren(grid, ".g-block");
                    if (blocks.length > 1) {
                        const blockSublevels = blocks
                            .map(block => directChildren(block, ".g-sublevel")[0])
                            .filter(Boolean);
                        if (blockSublevels.length) sublevel = blockSublevels;
                    }
                }

                const sublevels = Array.isArray(sublevel) ? sublevel : [sublevel];
                sublevels.forEach(element => {
                    element.classList.toggle("g-slide-out", !isSelected);
                });
            }
        }

        this[isSelected ? "closeDropdown" : "openDropdown"](parent);
        if (event.type !== "click") {
            this.toggleOverlay(closest(target, selectors.mainContainer));
        }
        return false;
    }

    openDropdown(element) {
        element = element && (element.currentTarget || element.target || element);
        if (!(element instanceof Element)) return;

        const dropdown = element.querySelector(this.selectors.dropdown);
        element.classList.add(this.states.selected);
        if (dropdown) {
            dropdown.classList.remove(this.states.inactive);
            dropdown.classList.add(this.states.active);
        }
    }

    closeDropdown(element) {
        element = element && (element.currentTarget || element.target || element);
        if (!(element instanceof Element)) return;

        const menuItem = element.matches(this.selectors.item)
            ? element
            : closest(element, this.selectors.item) || element;
        const dropdown = menuItem.querySelector
            ? menuItem.querySelector(this.selectors.dropdown)
            : null;

        menuItem.classList.remove(this.states.selected);
        if (!dropdown) return;

        descendants(dropdown, ".g-sublevel").forEach(clearStyle);
        descendants(dropdown, `.g-slide-out, .${this.states.selected}`).forEach(item => {
            item.classList.remove("g-slide-out", this.states.selected);
        });
        descendants(dropdown, `.${this.states.active}`).forEach(item => {
            item.classList.remove(this.states.active);
            item.classList.add(this.states.inactive);
        });
        dropdown.classList.remove(this.states.active);
        dropdown.classList.add(this.states.inactive);
    }

    closeAllDropdowns() {
        const topLevel = document.querySelector(
            `${this.selectors.mainContainer} > ${this.selectors.topLevel}`
        );
        if (!topLevel) return;

        directChildren(topLevel, this.selectors.item).forEach(item => this.closeDropdown(item));
        topLevel.classList.remove(this.states.selected);
        this.toggleOverlay(topLevel);
    }

    resetStates(menu) {
        if (!menu) return;
        const items = [menu, ...descendants(
            menu,
            ".g-toplevel, .g-dropdown-column, .g-dropdown, .g-selected, .g-active, .g-slide-out"
        )];
        items.forEach(item => {
            clearStyle(item);
            item.classList.remove("g-selected", "g-slide-out");
            if (item.classList.contains("g-active")) {
                item.classList.remove("g-active");
                item.classList.add("g-inactive");
            }
        });
    }

    toggleOverlay(menu) {
        if (!menu) return;
        const shouldOpen = Boolean(menu.querySelector(".g-active, .g-selected"));
        this.overlay.classList.toggle("g-menu-overlay-open", shouldOpen);
        this.overlay.style.opacity = shouldOpen ? 1 : 0;
    }

    _fixHeights(parent, sublevel, isGoingBack, isNavMenu) {
        if (!parent || !sublevel || parent === sublevel) return;
        if (isGoingBack) clearStyle(parent);

        const target = !isNavMenu ? closest(sublevel, ".g-dropdown") : sublevel;
        if (!target) return;
        const heights = {
            from: parent.getBoundingClientRect(),
            to: target.getBoundingClientRect()
        };
        const height = Math.max(heights.from.height, heights.to.height);

        if (isGoingBack) {
            closestHeightParents(parent).forEach(element => {
                if (closest(element, ".g-toplevel")) {
                    element.style.height = `${heights.from.height}px`;
                }
            });
        }

        if (isGoingBack) return;
        if (heights.from.height < heights.to.height) {
            parent.style.height = `${height}px`;
            closestHeightParents(parent).forEach(element => {
                if (closest(element, ".g-toplevel")) element.style.height = `${height}px`;
            });
        } else if (isNavMenu) {
            sublevel.style.height = `${height}px`;
        }

        if (isNavMenu) return;
        let maxHeight = height;
        const block = closest(sublevel, ".g-block:not(.size-100)");
        const column = block ? closest(block, ".g-dropdown-column") : null;
        ancestorMatches(sublevel, ".g-slide-out, .g-dropdown-column").forEach(slideout => {
            maxHeight = Math.max(maxHeight, parseInt(slideout.style.height || 0, 10));
        });

        if (column) {
            column.style.height = `${maxHeight}px`;
            const grid = directChildren(column, ".g-grid")[0];
            const blocks = directChildren(grid, ".g-block");
            let remaining = maxHeight;
            blocks.forEach((currentBlock, index) => {
                if (index + 1 !== blocks.length) {
                    remaining -= currentBlock.getBoundingClientRect().height;
                } else {
                    const childSublevel = currentBlock.querySelector(":scope > .g-sublevel");
                    if (childSublevel) childSublevel.style.height = `${remaining}px`;
                }
            });
        } else {
            sublevel.style.height = `${maxHeight}px`;
        }
    }

    _calculateBreakpoint(value) {
        const digitMatch = String(value).match(/^\d+(?:\.\d+)?/);
        const unitMatch = String(value).match(/[a-z]+$/i);
        if (!digitMatch || !unitMatch) return value;
        const unit = unitMatch[0];
        const tolerance = /r?em/.test(unit) ? -0.062 : -1;
        return `${parseFloat(digitMatch[0]) + tolerance}${unit}`;
    }

    _checkQuery(mediaQuery) {
        const selectors = this.selectors;
        const mobileContainer = document.querySelector(selectors.mobileContainer);
        const mainContainer = document.querySelector(
            `${selectors.mainContainer}${selectors.mobileTarget}`
        ) || document.querySelector(selectors.mainContainer);
        if (!mobileContainer || !mainContainer) return;

        let menu;
        if (mediaQuery.matches) {
            menu = mainContainer.querySelector(selectors.topLevel);
            if (menu) {
                const mainBlock = closest(mainContainer, ".g-block");
                const mobileBlock = closest(mobileContainer, ".g-block");
                if (mainBlock) mainBlock.classList.add("hidden");
                if (mobileBlock) mobileBlock.classList.remove("hidden");
                mobileContainer.prepend(menu);
            }
        } else {
            menu = mobileContainer.querySelector(selectors.topLevel);
            if (menu) {
                const mobileBlock = closest(mobileContainer, ".g-block");
                const mainBlock = closest(mainContainer, ".g-block");
                if (mobileBlock) mobileBlock.classList.add("hidden");
                if (mainBlock) mainBlock.classList.remove("hidden");
                mainContainer.prepend(menu);
            }
        }

        this.resetStates(menu);
        if (!mediaQuery.matches && menu) {
            descendants(menu, "[data-g-item-width]").forEach(dropdown => {
                dropdown.style.width = dropdown.getAttribute("data-g-item-width");
            });
        }
    }

    _debug() {}
}

const ancestorMatches = (element, selector) => {
    const matches = [];
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (parent.matches(selector)) matches.push(parent);
    }
    return matches;
};

const closestHeightParents = element => ancestorMatches(element, '[style^="height"]');

module.exports = Menu;

},{}],3:[function(require,module,exports){
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

},{"../utils/decouple":5}],4:[function(require,module,exports){
'use strict';

const { ready, query } = require('../utils/dom');

ready(() => {
    const toTop = query('#g-totop');
    if (!toTop) {
        return;
    }

    toTop.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

module.exports = {};

},{"../utils/dom":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
'use strict';

const ready = (callback) => {
    let called = false;
    const run = () => {
        if (called) return;
        called = true;
        callback();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
        setTimeout(run, 0);
        return;
    }

    run();
};

const query = (selector, context = document) => context.querySelector(selector);
const queryAll = (selector, context = document) => [...context.querySelectorAll(selector)];

const delegate = (element, type, selector, callback, options) => {
    const listener = (event) => {
        const target = event.target instanceof Element ? event.target.closest(selector) : null;
        if (target && element.contains(target)) {
            callback.call(target, event, target);
        }
    };

    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
};

module.exports = { ready, query, queryAll, delegate };

},{}]},{},[1])

//# sourceMappingURL=main.js.map
