/*! Swiper 14.0.7 | Copyright 2014-2026 Vladimir Kharlampidi | MIT License */
import Swiper from 'swiper';
import {
    A11y,
    Autoplay,
    EffectFade,
    Keyboard,
    Navigation,
    Pagination
} from 'swiper/modules';

const selector = '[data-g-swiper]';

const enabled = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    return ['1', 'true', 'enable', 'enabled', 'yes'].includes(String(value).toLowerCase());
};

const number = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

class GantrySwiper {
    constructor(element) {
        this.element = element;
        this.prepareMarkup();
        this.instance = this.create();
    }

    prepareMarkup() {
        let wrapper = this.element.querySelector(':scope > .swiper-wrapper');

        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'swiper-wrapper';

            Array.from(this.element.children)
                .filter((child) => !child.matches('.swiper-navigation, .swiper-pagination'))
                .forEach((slide) => {
                    slide.classList.add('swiper-slide');
                    wrapper.append(slide);
                });

            this.element.prepend(wrapper);
        } else {
            Array.from(wrapper.children).forEach((slide) => {
                slide.classList.add('swiper-slide');
            });
        }

        if (enabled(this.element.dataset.navigation, true) && !this.element.querySelector(':scope > .swiper-navigation')) {
            const navigation = document.createElement('div');
            navigation.className = 'swiper-navigation';
            navigation.innerHTML = `
                <button class="swiper-button-prev" type="button" aria-label="${this.element.dataset.previousLabel || 'Previous slide'}"></button>
                <button class="swiper-button-next" type="button" aria-label="${this.element.dataset.nextLabel || 'Next slide'}"></button>
            `;
            this.element.append(navigation);
        }

        if (enabled(this.element.dataset.pagination) && !this.element.querySelector(':scope > .swiper-pagination')) {
            const pagination = document.createElement('div');
            pagination.className = 'swiper-pagination';
            this.element.append(pagination);
        }
    }

    create() {
        const { dataset } = this.element;
        const slides = this.element.querySelectorAll('.swiper-slide').length;
        const slidesPerView = Math.max(1, number(dataset.slidesPerView, 1));
        const navigation = enabled(dataset.navigation, true);
        const pagination = enabled(dataset.pagination);
        const autoplay = enabled(dataset.autoplay);
        const requestedLoop = enabled(dataset.loop, true);
        const effect = dataset.effect === 'fade' && slidesPerView === 1 ? 'fade' : 'slide';

        const instance = new Swiper(this.element, {
            modules: [A11y, Autoplay, EffectFade, Keyboard, Navigation, Pagination],
            a11y: {
                enabled: true,
                prevSlideMessage: dataset.previousLabel || 'Previous slide',
                nextSlideMessage: dataset.nextLabel || 'Next slide',
                paginationBulletMessage: 'Go to slide {{index}}'
            },
            autoHeight: enabled(dataset.autoHeight, true),
            autoplay: autoplay ? {
                delay: Math.max(1000, number(dataset.autoplayDelay, 5000)),
                disableOnInteraction: false,
                pauseOnMouseEnter: enabled(dataset.pauseOnHover, true)
            } : false,
            breakpoints: slidesPerView > 1 ? {
                0: { slidesPerView: 1 },
                768: { slidesPerView: Math.max(1, Math.ceil(slidesPerView / 2)) },
                960: { slidesPerView }
            } : undefined,
            effect,
            fadeEffect: { crossFade: true },
            grabCursor: true,
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            loop: requestedLoop && slides > slidesPerView,
            navigation: navigation ? {
                nextEl: this.element.querySelector('.swiper-button-next'),
                prevEl: this.element.querySelector('.swiper-button-prev')
            } : false,
            observer: true,
            observeParents: true,
            pagination: pagination ? {
                el: this.element.querySelector('.swiper-pagination'),
                bulletElement: 'button',
                clickable: true,
                renderBullet(index, className) {
                    return `<button class="${className}" type="button"><span></span></button>`;
                }
            } : false,
            slidesPerView,
            speed: Math.max(0, number(dataset.speed, 500)),
            watchOverflow: true,
            on: {
                init: (swiper) => this.syncState(swiper),
                slideChange: (swiper) => this.syncState(swiper),
                paginationUpdate: (swiper) => this.syncState(swiper)
            }
        });

        return instance;
    }

    syncState(swiper) {
        this.element.classList.toggle('swiper-rtl', swiper.rtlTranslate);
    }
}

const initialize = (root = document) => {
    const elements = root.matches?.(selector)
        ? [root]
        : Array.from(root.querySelectorAll?.(selector) || []);

    elements.forEach((element) => {
        if (element.dataset.gSwiperReady === 'true') {
            return;
        }

        element.dataset.gSwiperReady = 'true';
        element.gantrySwiper = new GantrySwiper(element);
    });
};

const ready = () => {
    initialize();

    const observer = new MutationObserver((records) => {
        records.forEach((record) => {
            record.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    initialize(node);
                }
            });
        });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
} else {
    ready();
}

window.G5Swiper = { GantrySwiper, initialize };
