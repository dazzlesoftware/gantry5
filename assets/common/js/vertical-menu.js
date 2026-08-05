(() => {
    'use strict';

    const instances = new WeakMap();

    class VerticalMenu {
        constructor(element) {
            this.element = element;
            this.levels = new Map(
                Array.from(element.querySelectorAll('.menu__level[data-menu]'))
                    .map(level => [level.dataset.menu, level])
            );
            this.history = ['main'];
            this.abortController = new AbortController();
            this.scope = element.parentElement || document;
            this.breadcrumbs = document.createElement('nav');
            this.breadcrumbs.className = 'menu__breadcrumbs';
            this.breadcrumbs.setAttribute('aria-label', 'Menu path');
            this.back = document.createElement('button');
            this.back.type = 'button';
            this.back.className = 'menu__back';
            this.back.setAttribute('aria-label', 'Back');
            this.back.textContent = '←';
            element.prepend(this.breadcrumbs);
            element.prepend(this.back);
            this.bind();

            const current = Array.from(this.levels.values()).find(level => level.querySelector('.menu__link--current'));
            this.show(current?.dataset.menu || 'main', false);
        }

        bind() {
            const options = { signal: this.abortController.signal };
            this.element.addEventListener('click', event => {
                const link = event.target.closest('[data-submenu]');
                if (!link || !this.element.contains(link)) return;
                event.preventDefault();
                this.show(link.dataset.submenu, true, link.textContent.trim());
            }, options);
            this.back.addEventListener('click', () => this.goBack(), options);
            this.scope.querySelector('.action--open')?.addEventListener('click', () => {
                this.element.classList.add('menu--open');
            }, options);
            this.element.querySelector('.action--close')?.addEventListener('click', () => {
                this.element.classList.remove('menu--open');
            }, options);
        }

        show(name, remember = true, label = '') {
            const next = this.levels.get(name);
            if (!next) return;
            if (remember && this.history[this.history.length - 1] !== name) this.history.push(name);

            this.levels.forEach(level => {
                const active = level === next;
                level.hidden = !active;
                level.classList.toggle('menu__level--current', active);
                level.setAttribute('aria-hidden', String(!active));
            });
            if (remember && label) next.dataset.breadcrumbLabel = label;
            this.renderBreadcrumbs();
            this.back.hidden = this.history.length < 2;
            next.querySelector('.menu__link')?.focus({ preventScroll: true });
        }

        goBack() {
            if (this.history.length < 2) return;
            this.history.pop();
            this.show(this.history[this.history.length - 1], false);
        }

        renderBreadcrumbs() {
            this.breadcrumbs.replaceChildren();
            this.history.forEach((name, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'menu__breadcrumbs-item';
                button.textContent = index === 0
                    ? (this.element.dataset.allText || 'All')
                    : (this.levels.get(name)?.dataset.breadcrumbLabel || name);
                button.addEventListener('click', () => {
                    this.history = this.history.slice(0, index + 1);
                    this.show(name, false);
                }, { signal: this.abortController.signal });
                this.breadcrumbs.append(button);
            });
        }

        destroy() {
            this.abortController.abort();
            this.breadcrumbs.remove();
            this.back.remove();
            this.levels.forEach(level => {
                level.hidden = false;
                level.removeAttribute('aria-hidden');
            });
            instances.delete(this.element);
        }
    }

    const initialize = (root = document) => {
        const elements = root.matches?.('.menu[id="ml-menu"]')
            ? [root]
            : Array.from(root.querySelectorAll?.('.menu[id="ml-menu"]') || []);
        elements.forEach(element => {
            if (!instances.has(element)) instances.set(element, new VerticalMenu(element));
        });
    };

    initialize();
    const observer = new MutationObserver(records => records.forEach(record => {
        record.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) initialize(node);
        });
    }));
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.GenesisVerticalMenu = { initialize, instances };
})();
