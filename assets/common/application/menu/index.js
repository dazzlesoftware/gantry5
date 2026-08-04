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
        if (window.Genesis && window.Genesis.offcanvas) window.Genesis.offcanvas.close();
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
