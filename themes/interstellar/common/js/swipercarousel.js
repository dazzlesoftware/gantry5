const showcaseSelector = '[data-g-swiper-showcase]';

class SwiperShowcase {
    constructor(element) {
        this.element = element;
        this.carousel = element.querySelector('[data-g-swiper]');
        this.panelContainer = document.querySelector(element.dataset.panelSelector);
        this.panels = Array.from(this.panelContainer?.querySelectorAll('[data-slide-index]') || []);
        this.indicator = element.querySelector('.g-swipercarousel-panel-indicator');

        if (!this.carousel || !this.panels.length) {
            return;
        }

        this.panels.forEach((panel) => {
            panel.addEventListener('click', () => this.select(Number.parseInt(panel.dataset.slideIndex, 10), true));
        });
        this.carousel.addEventListener('g5:swiper:change', (event) => this.select(event.detail.activeIndex));
        window.addEventListener('resize', () => this.positionIndicator(), { passive: true });
        this.select(0);
    }

    select(index, navigate = false) {
        const selected = this.panels[index];

        if (!selected) {
            return;
        }

        this.panels.forEach((panel) => {
            const active = panel === selected;
            panel.classList.toggle('selected', active);
            panel.setAttribute('aria-selected', String(active));
        });

        if (navigate) {
            this.carousel.gantrySwiper?.instance?.slideTo(index);
        }

        this.positionIndicator(selected);
    }

    positionIndicator(panel = this.panelContainer?.querySelector('.selected')) {
        if (!this.indicator || !panel) {
            return;
        }

        const offset = panel.offsetLeft + ((panel.offsetWidth - this.indicator.offsetWidth) / 2);
        this.indicator.style.transform = `translateX(${Math.max(0, offset)}px)`;
    }
}

const initialize = (root = document) => {
    const elements = root.matches?.(showcaseSelector)
        ? [root]
        : Array.from(root.querySelectorAll?.(showcaseSelector) || []);

    elements.forEach((element) => {
        if (!element.dataset.gSwiperShowcaseReady) {
            element.dataset.gSwiperShowcaseReady = 'true';
            element.gantrySwiperShowcase = new SwiperShowcase(element);
        }
    });
};

const ready = () => {
    initialize();
    new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                initialize(node);
            }
        }));
    }).observe(document.documentElement, { childList: true, subtree: true });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
} else {
    ready();
}
