const closest = (element, selector) => element instanceof Element ? element.closest(selector) : null;

class Menu {
    constructor(options = {}) {
        this.selectors = {
            mainContainer: ".g-main-nav",
            mobileContainer: "#g-mobilemenu-container",
            topLevel: ".g-toplevel",
            mobileTarget: "[data-g-mobile-target]",
            ...(options.selectors || {})
        };

        this.mobileContainer = document.querySelector(this.selectors.mobileContainer);
        this.mainContainer = document.querySelector(
            `${this.selectors.mainContainer}${this.selectors.mobileTarget}`
        ) || document.querySelector(this.selectors.mainContainer);

        if (!this.mobileContainer || !this.mainContainer) return;

        const breakpoint = this.mobileContainer.getAttribute("data-g-menu-breakpoint") || "48rem";
        this.mediaQuery = window.matchMedia(
            `only all and (max-width: ${this._calculateBreakpoint(breakpoint)})`
        );
        this.mediaQueryListener = event => this._mount(event.matches);

        if (this.mediaQuery.addEventListener) {
            this.mediaQuery.addEventListener("change", this.mediaQueryListener);
        } else {
            this.mediaQuery.addListener(this.mediaQueryListener);
        }

        this._attachDesktopHover();
        this._attachMobileNavigation();
        this._mount(this.mediaQuery.matches);
    }

    detach() {
        if (!this.mediaQuery || !this.mediaQueryListener) return;
        if (this.mediaQuery.removeEventListener) {
            this.mediaQuery.removeEventListener("change", this.mediaQueryListener);
        } else {
            this.mediaQuery.removeListener(this.mediaQueryListener);
        }
    }

    _mount(mobile) {
        const menu = (mobile ? this.mainContainer : this.mobileContainer)
            .querySelector(this.selectors.topLevel);
        if (!menu) return;

        this._setBootstrapMode(menu, mobile);

        const mainBlock = closest(this.mainContainer, ".col");
        const mobileBlock = closest(this.mobileContainer, ".col");

        if (mobile) {
            if (mainBlock) mainBlock.classList.add("hidden");
            if (mobileBlock) mobileBlock.classList.remove("hidden");
            this.mobileContainer.prepend(menu);
        } else {
            if (mobileBlock) mobileBlock.classList.add("hidden");
            if (mainBlock) mainBlock.classList.remove("hidden");
            this.mainContainer.prepend(menu);
        }

    }

    _attachDesktopHover() {
        this.mainContainer.querySelectorAll(".g-menu-item.g-parent").forEach(item => {
            item.addEventListener("mouseenter", () => {
                if (this.mediaQuery.matches) return;
                const toggle = this._directToggle(item, "dropdown");
                const DropdownApi = window.bootstrap && window.bootstrap.Dropdown;
                if (!toggle || !DropdownApi) return;

                Array.from(item.parentElement.children).forEach(sibling => {
                    if (sibling === item) return;
                    const siblingToggle = this._directToggle(sibling, "dropdown");
                    const siblingInstance = siblingToggle && DropdownApi.getInstance(siblingToggle);
                    if (siblingInstance) siblingInstance.hide();
                });

                DropdownApi.getOrCreateInstance(toggle).show();
            });

            item.addEventListener("mouseleave", () => {
                if (this.mediaQuery.matches) return;
                const toggle = this._directToggle(item, "dropdown");
                const DropdownApi = window.bootstrap && window.bootstrap.Dropdown;
                const instance = toggle && DropdownApi && DropdownApi.getInstance(toggle);
                if (instance) instance.hide();
            });
        });
    }

    _attachMobileNavigation() {
        this.mobileContainer.addEventListener("click", event => {
            if (!this.mediaQuery.matches) return;

            const link = event.target.closest("a.g-menu-item-container");
            if (!link || !this.mobileContainer.contains(link)) return;

            const OffcanvasApi = window.bootstrap && window.bootstrap.Offcanvas;
            const offcanvas = this.mobileContainer.closest(".offcanvas");
            if (OffcanvasApi && offcanvas) {
                OffcanvasApi.getOrCreateInstance(offcanvas).hide();
            }
        });
    }

    _setBootstrapMode(menu, mobile) {
        menu.querySelectorAll(".g-menu-item.g-parent").forEach(item => {
            const submenu = Array.from(item.children).find(child => child.classList.contains("g-dropdown"));
            const toggle = Array.from(item.children).find(child => child.getAttribute && child.hasAttribute("aria-controls"));
            if (!submenu || !toggle) return;

            const BootstrapApi = window.bootstrap;
            const oldApi = BootstrapApi && BootstrapApi[mobile ? "Dropdown" : "Collapse"];
            const oldInstance = oldApi && oldApi.getInstance(mobile ? toggle : submenu);
            if (oldInstance) oldInstance.dispose();

            submenu.classList.remove("show", "collapsing");
            toggle.classList.toggle("collapsed", mobile);
            toggle.setAttribute("aria-expanded", "false");

            if (mobile) {
                submenu.classList.remove("dropdown-menu");
                submenu.classList.add("collapse");
                toggle.setAttribute("data-bs-toggle", "collapse");
                toggle.setAttribute("data-bs-target", `#${submenu.id}`);
            } else {
                submenu.classList.remove("collapse");
                submenu.classList.add("dropdown-menu");
                toggle.setAttribute("data-bs-toggle", "dropdown");
                toggle.removeAttribute("data-bs-target");
            }
        });
    }

    _directToggle(item, component) {
        return Array.from(item.children).find(child =>
            child.getAttribute && child.getAttribute("data-bs-toggle") === component
        ) || null;
    }

    _calculateBreakpoint(value) {
        const digitMatch = String(value).match(/^\d+(?:\.\d+)?/);
        const unitMatch = String(value).match(/[a-z]+$/i);
        if (!digitMatch || !unitMatch) return value;
        const unit = unitMatch[0];
        const tolerance = /r?em/.test(unit) ? -0.062 : -1;
        return `${parseFloat(digitMatch[0]) + tolerance}${unit}`;
    }
}

export default Menu;
