// Genesis Offcanvas section controller.
//
// #g-offcanvas is a real Bootstrap 5 Offcanvas component now (see
// engines/common/nucleus/templates/layout/offcanvas.html.twig) — Bootstrap's
// own bundled JS drives show/hide/backdrop/focus-trap/Escape entirely via
// the header toggle button's data-bs-toggle="offcanvas" attribute. No custom
// drag/slide/touch code is needed for that anymore.
//
// This module keeps only the one thing Bootstrap doesn't do: hiding the
// toggle button(s) when the Offcanvas section ends up with no real content
// (e.g. an empty mobile-menu container because no Menu particle exists in
// the layout), and exposing a close() a Bootstrap-agnostic caller (see
// assets/common/application/menu/index.js's resetAfterClick) can use
// without reaching into the Bootstrap API directly.

class Offcanvas {
    constructor() {
        this.offcanvas = document.querySelector('#g-offcanvas');
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
            const mobileContainer = this.offcanvas.querySelector('#g-mobilemenu-container');
            const blocks = Array.from(this.offcanvas.querySelectorAll('.g-block'));
            const mobileText = mobileContainer ? mobileContainer.textContent.length : 0;
            const shouldCollapse = blocks.length === 1
                && mobileContainer
                && !this.offcanvas.textContent.trim().length
                && !blocks.some(block => block.querySelector('.g-menu-item'));

            togglers.forEach(toggler => {
                toggler.classList.toggle('g-offcanvas-hide', Boolean(shouldCollapse));
            });

            if (mobileContainer) {
                const block = mobileContainer.closest('.g-block');
                if (block) block.classList.toggle('hidden', !mobileText);
            }
        }, 0);
    }
}

export default Offcanvas;
