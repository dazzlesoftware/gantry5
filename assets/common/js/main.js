(() => {
  // application/menu/index.js
  var closest = (element, selector) => element instanceof Element ? element.closest(selector) : null;
  var Menu = class {
    constructor(options = {}) {
      this.selectors = {
        mainContainer: ".g-main-nav",
        mobileContainer: "#g-mobilemenu-container",
        topLevel: ".g-toplevel",
        mobileTarget: "[data-g-mobile-target]",
        ...options.selectors || {}
      };
      this.mobileContainer = document.querySelector(this.selectors.mobileContainer);
      this.mainContainer = document.querySelector(
        "".concat(this.selectors.mainContainer).concat(this.selectors.mobileTarget)
      ) || document.querySelector(this.selectors.mainContainer);
      if (!this.mobileContainer || !this.mainContainer) return;
      const breakpoint = this.mobileContainer.getAttribute("data-g-menu-breakpoint") || "48rem";
      this.mediaQuery = window.matchMedia(
        "only all and (max-width: ".concat(this._calculateBreakpoint(breakpoint), ")")
      );
      this.mediaQueryListener = (event) => this._mount(event.matches);
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener("change", this.mediaQueryListener);
      } else {
        this.mediaQuery.addListener(this.mediaQueryListener);
      }
      this._attachDesktopHover();
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
      const menu = (mobile ? this.mainContainer : this.mobileContainer).querySelector(this.selectors.topLevel);
      if (!menu) return;
      this._setBootstrapMode(menu, mobile);
      const mainBlock = closest(this.mainContainer, ".g-block");
      const mobileBlock = closest(this.mobileContainer, ".g-block");
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
      this.mainContainer.querySelectorAll(".g-menu-item.g-parent").forEach((item) => {
        item.addEventListener("mouseenter", () => {
          if (this.mediaQuery.matches) return;
          const toggle = this._directToggle(item, "dropdown");
          const DropdownApi = window.bootstrap && window.bootstrap.Dropdown;
          if (!toggle || !DropdownApi) return;
          Array.from(item.parentElement.children).forEach((sibling) => {
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
    _setBootstrapMode(menu, mobile) {
      menu.querySelectorAll(".g-menu-item.g-parent").forEach((item) => {
        const submenu = Array.from(item.children).find((child) => child.classList.contains("g-dropdown"));
        const toggle = Array.from(item.children).find((child) => child.getAttribute && child.hasAttribute("aria-controls"));
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
          toggle.setAttribute("data-bs-target", "#".concat(submenu.id));
        } else {
          submenu.classList.remove("collapse");
          submenu.classList.add("dropdown-menu");
          toggle.setAttribute("data-bs-toggle", "dropdown");
          toggle.removeAttribute("data-bs-target");
        }
      });
    }
    _directToggle(item, component) {
      return Array.from(item.children).find(
        (child) => child.getAttribute && child.getAttribute("data-bs-toggle") === component
      ) || null;
    }
    _calculateBreakpoint(value) {
      const digitMatch = String(value).match(/^\d+(?:\.\d+)?/);
      const unitMatch = String(value).match(/[a-z]+$/i);
      if (!digitMatch || !unitMatch) return value;
      const unit = unitMatch[0];
      const tolerance = /r?em/.test(unit) ? -0.062 : -1;
      return "".concat(parseFloat(digitMatch[0]) + tolerance).concat(unit);
    }
  };
  var menu_default = Menu;

  // application/offcanvas/index.js
  var Offcanvas = class {
    constructor() {
      this.offcanvas = document.querySelector("#g-offcanvas");
      this.available = Boolean(this.offcanvas);
      if (!this.available) return;
      this.observer = new MutationObserver(() => this._checkTogglers());
      this.observer.observe(this.offcanvas, { childList: true, subtree: true });
      this._checkTogglers();
    }
    close() {
      if (!this.available) return this;
      const OffcanvasApi = window.bootstrap && window.bootstrap.Offcanvas;
      if (OffcanvasApi) {
        OffcanvasApi.getOrCreateInstance(this.offcanvas).hide();
      }
      return this;
    }
    _checkTogglers() {
      if (!this.available) return;
      const togglers = Array.from(document.querySelectorAll(
        '[data-bs-toggle="offcanvas"][data-bs-target="#g-offcanvas"], [data-bs-toggle="offcanvas"][data-bs-target="#' + this.offcanvas.id + '"]'
      ));
      if (!togglers.length) return;
      setTimeout(() => {
        const mobileContainer = this.offcanvas.querySelector("#g-mobilemenu-container");
        const blocks = Array.from(this.offcanvas.querySelectorAll(".g-block"));
        const mobileText = mobileContainer ? mobileContainer.textContent.length : 0;
        const shouldCollapse = blocks.length === 1 && mobileContainer && !this.offcanvas.textContent.trim().length && !blocks.some((block) => block.querySelector(".g-menu-item"));
        togglers.forEach((toggler) => {
          toggler.classList.toggle("g-offcanvas-hide", Boolean(shouldCollapse));
        });
        if (mobileContainer) {
          const block = mobileContainer.closest(".g-block");
          if (block) block.classList.toggle("hidden", !mobileText);
        }
      }, 0);
    }
  };
  var offcanvas_default = Offcanvas;

  // application/totop/index.js
  var initializeToTop = () => {
    const toTop = document.querySelector("#g-totop");
    if (!toTop) {
      return;
    }
    toTop.addEventListener("click", (event) => {
      event.preventDefault();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeToTop, { once: true });
  } else {
    initializeToTop();
  }

  // application/main.js
  var ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };
  var query = (selector, context = document) => context.querySelector(selector);
  var queryAll = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  var delegate = (element, eventName, selector, handler, options) => {
    const listener = (event) => {
      const target = event.target instanceof Element ? event.target.closest(selector) : null;
      if (target && element.contains(target)) handler.call(target, event, target);
    };
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  };
  var instances = { ready, query, queryAll, delegate };
  window.Genesis = instances;
  ready(() => {
    try {
      instances.offcanvas = new offcanvas_default();
    } catch (error) {
      console.error("Genesis off-canvas initialization failed:", error);
    }
    try {
      instances.menu = new menu_default();
    } catch (error) {
      console.error("Genesis menu initialization failed:", error);
    }
  });
  var main_default = instances;
})();
//# sourceMappingURL=main.js.map
