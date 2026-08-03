(() => {
    'use strict';

    class NativeGrid {
        constructor(element, options = {}) {
            if (!(element instanceof Element)) {
                throw new TypeError('NativeGrid requires a grid element.');
            }

            this.element = element;
            this.options = {
                itemSelector: '[data-groups]',
                group: 'all',
                randomize: false,
                sizer: null,
                ...options
            };
            this.items = [...element.querySelectorAll(this.options.itemSelector)];
            this.order = [...this.items];
            this.frame = 0;
            this.width = 0;

            if (this.options.randomize) {
                for (let index = this.order.length - 1; index > 0; index -= 1) {
                    const target = Math.floor(Math.random() * (index + 1));
                    [this.order[index], this.order[target]] = [this.order[target], this.order[index]];
                }
            }

            this.element.style.position = 'relative';
            this.items.forEach((item) => {
                item.style.position = 'absolute';
                item.style.transition = 'transform 350ms ease, opacity 350ms ease';
                item.style.willChange = 'transform, opacity';
            });

            this.resizeObserver = 'ResizeObserver' in window
                ? new ResizeObserver((entries) => {
                    const gridResized = entries.some((entry) => (
                        entry.target === this.element && this.element.clientWidth !== this.width
                    ));
                    const itemResized = entries.some((entry) => entry.target !== this.element);
                    if (gridResized || itemResized) this.scheduleLayout();
                })
                : null;
            this.resizeObserver?.observe(this.element);
            this.items.forEach((item) => this.resizeObserver?.observe(item));
            window.addEventListener('resize', () => this.scheduleLayout(), { passive: true });

            this.filter(this.options.group || 'all');
        }

        groups(item) {
            try {
                const groups = JSON.parse(item.dataset.groups || '[]');
                return Array.isArray(groups) ? groups.map(String) : [];
            } catch (error) {
                return (item.dataset.groups || '').split(/\s*,\s*/).filter(Boolean);
            }
        }

        filter(group = 'all') {
            const selected = String(group || 'all');

            this.items.forEach((item) => {
                const visible = selected === 'all' || this.groups(item).includes(selected);
                item.hidden = !visible;
                item.setAttribute('aria-hidden', String(!visible));
                item.style.opacity = visible ? '1' : '0';
            });

            this.scheduleLayout();
        }

        scheduleLayout() {
            cancelAnimationFrame(this.frame);
            this.frame = requestAnimationFrame(() => this.layout());
        }

        size(element) {
            const bounds = element.getBoundingClientRect();
            const styles = getComputedStyle(element);

            return {
                width: bounds.width + parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0),
                height: bounds.height + parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0)
            };
        }

        layout() {
            const visible = this.order.filter((item) => !item.hidden);
            const containerWidth = this.element.clientWidth;

            if (!visible.length || !containerWidth) {
                this.element.style.height = '0px';
                return;
            }

            this.width = containerWidth;
            const sizerWidth = this.options.sizer ? this.size(this.options.sizer).width : 0;
            const firstWidth = this.size(visible[0]).width;
            const columnWidth = Math.max(1, sizerWidth || firstWidth || containerWidth);
            const columns = Math.max(1, Math.round(containerWidth / columnWidth));
            const actualColumnWidth = containerWidth / columns;
            const heights = Array(columns).fill(0);

            visible.forEach((item) => {
                const itemSize = this.size(item);
                const itemWidth = itemSize.width;
                const span = Math.min(columns, Math.max(1, Math.round(itemWidth / actualColumnWidth)));
                let column = 0;
                let top = Number.POSITIVE_INFINITY;

                for (let start = 0; start <= columns - span; start += 1) {
                    const candidate = Math.max(...heights.slice(start, start + span));
                    if (candidate < top) {
                        top = candidate;
                        column = start;
                    }
                }

                item.style.transform = `translate3d(${column * actualColumnWidth}px, ${top}px, 0)`;
                const bottom = top + itemSize.height;
                for (let index = column; index < column + span; index += 1) heights[index] = bottom;
            });

            this.element.style.height = `${Math.max(...heights)}px`;
            this.element.dispatchEvent(new CustomEvent('nativegrid:layout', { detail: { items: visible } }));
        }
    }

    window.NativeGrid = NativeGrid;
})();
