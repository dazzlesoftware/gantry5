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
        this.bindThumbnailNavigation();
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

        const navigationEnabled = enabled(
            this.element.dataset.navigation ?? this.findDataset(['carouselNav', 'nav']),
            true
        );
        this.navigationElement = this.element.querySelector(':scope > .swiper-navigation')
            || this.findExternalNavigation();

        if (navigationEnabled && !this.navigationElement) {
            const navigation = document.createElement('div');
            navigation.className = 'swiper-navigation';
            this.navigationElement = navigation;
            this.element.append(navigation);
        }

        if (navigationEnabled && this.navigationElement && !this.navigationElement.querySelector('.swiper-button-prev, .swiper-button-next')) {
            this.navigationElement.classList.add('swiper-navigation');
            this.navigationElement.innerHTML = `
                <button class="swiper-button-prev" type="button" aria-label="${this.element.dataset.previousLabel || 'Previous slide'}">
                    <i class="fa fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button class="swiper-button-next" type="button" aria-label="${this.element.dataset.nextLabel || 'Next slide'}">
                    <i class="fa fa-chevron-right" aria-hidden="true"></i>
                </button>
            `;
        } else if (navigationEnabled && this.navigationElement) {
            this.navigationElement.querySelectorAll('.swiper-button-prev, .swiper-button-next').forEach((button) => {
                if (button.tagName !== 'BUTTON') {
                    button.setAttribute('role', 'button');
                    button.setAttribute('tabindex', '0');
                }
            });
        }

        if (navigationEnabled && this.navigationElement && !this.navigationElement.querySelector('.swiper-button-prev')) {
            const previous = document.createElement('button');
            previous.className = 'swiper-button-prev';
            previous.type = 'button';
            previous.setAttribute('aria-label', this.element.dataset.previousLabel || 'Previous slide');
            previous.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
            this.navigationElement.prepend(previous);
        }

        if (navigationEnabled && this.navigationElement && !this.navigationElement.querySelector('.swiper-button-next')) {
            const next = document.createElement('button');
            next.className = 'swiper-button-next';
            next.type = 'button';
            next.setAttribute('aria-label', this.element.dataset.nextLabel || 'Next slide');
            next.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
            this.navigationElement.append(next);
        }

        if (navigationEnabled && this.navigationElement === this.element) {
            const navigation = document.createElement('div');
            navigation.className = 'swiper-navigation';
            navigation.innerHTML = `
                <button class="swiper-button-prev" type="button" aria-label="${this.element.dataset.previousLabel || 'Previous slide'}">
                    <i class="fa fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button class="swiper-button-next" type="button" aria-label="${this.element.dataset.nextLabel || 'Next slide'}">
                    <i class="fa fa-chevron-right" aria-hidden="true"></i>
                </button>
            `;
            this.element.append(navigation);
            this.navigationElement = navigation;
        }

        const paginationEnabled = enabled(this.element.dataset.pagination ?? this.findDataset(['dots']));
        if (paginationEnabled && !this.getPaginationElement()) {
            const pagination = document.createElement('div');
            pagination.className = 'swiper-pagination';
            this.element.append(pagination);
        }
    }

    findExternalNavigation() {
        const container = this.element.closest([
            '[data-carousel-id]',
            '[data-slider-id]',
            '[data-slideshow-id]',
            '[data-showcase-id]',
            '[data-panelslider-id]',
            '[data-bgslideshow-id]',
            '[data-featuredvideos-id]'
        ].join(', '));

        return container?.querySelector('.custom-swiper-navigation, [id^="g-swipercarousel-accordionslider-controls"]')
            || this.element.closest('.g-swipercarousel-accordionslider')
                ?.querySelector('[id^="g-swipercarousel-accordionslider-controls"]')
            || null;
    }

    getPaginationElement() {
        const selector = this.element.dataset.paginationSelector;

        if (selector) {
            try {
                return document.querySelector(selector);
            } catch (error) {
                console.warn(`Invalid Swiper pagination selector: ${selector}`, error);
            }
        }

        const internal = this.element.querySelector(':scope > .swiper-pagination');
        if (internal) {
            return internal;
        }

        const adjacent = this.element.nextElementSibling;
        return adjacent?.matches('.swiper-pagination') ? adjacent : null;
    }

    create() {
        const { dataset } = this.element;
        const role = dataset.gSwiperRole || '';
        const slides = this.element.querySelectorAll('.swiper-slide').length;
        const isPrimarySlides = /(?:^|\s)g-(?:slider|slideshow|showcase|panelslider|bgslideshow)-slides(?:\s|$)/.test(this.element.className);
        const inferredItems = this.findDataset(['items', 'itemsAmount', 'displayitems']);
        const slidesPerView = Math.max(1, number(dataset.slidesPerView ?? (isPrimarySlides ? 1 : inferredItems), 1));
        const navigation = role === 'main'
            ? false
            : enabled(dataset.navigation ?? this.findDataset(['carouselNav', 'nav']), true);
        const pagination = enabled(dataset.pagination ?? this.findDataset(['dots']));
        const autoplay = role === 'navigation'
            ? false
            : enabled(dataset.autoplay ?? this.findDataset(['autoplay']));
        const requestedLoop = enabled(dataset.loop ?? this.findDataset(['loop']), true);
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
                delay: Math.max(1000, number(dataset.autoplayDelay ?? this.findDataset(['autoplayInterval', 'timeout', 'delay']), 5000)),
                disableOnInteraction: false,
                pauseOnMouseEnter: enabled(dataset.pauseOnHover, true)
            } : false,
            breakpoints: this.getBreakpoints(slidesPerView),
            centeredSlides: enabled(dataset.centered),
            effect,
            fadeEffect: { crossFade: true },
            grabCursor: true,
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            initialSlide: this.getInitialSlide(),
            loop: requestedLoop && slides > slidesPerView,
            navigation: navigation ? {
                addIcons: false,
                nextEl: this.navigationElement?.querySelector('.swiper-button-next'),
                prevEl: this.navigationElement?.querySelector('.swiper-button-prev')
            } : false,
            observer: true,
            observeParents: true,
            slidesPerGroup: Math.max(1, number(dataset.slidesPerGroup, 1)),
            spaceBetween: Math.max(0, number(dataset.spaceBetween, 0)),
            pagination: pagination ? {
                el: this.getPaginationElement(),
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

    findDataset(suffixes) {
        let current = this.element;
        const normalized = suffixes.map((suffix) => suffix.toLowerCase());

        while (current) {
            const match = Object.entries(current.dataset || {}).find(([key]) => {
                const lowerKey = key.toLowerCase();
                return normalized.some((suffix) => lowerKey === suffix || lowerKey.endsWith(suffix));
            });

            if (match) {
                return match[1];
            }

            current = current.parentElement;
        }

        return undefined;
    }

    getBreakpoints(slidesPerView) {
        if (slidesPerView <= 1) {
            return undefined;
        }

        const smallMobile = Math.max(1, number(this.findDataset(['itemsSmallmobile']), 1));
        const mobile = Math.max(1, number(this.findDataset(['itemsMobile']), Math.ceil(slidesPerView / 2)));
        const tablet = Math.max(1, number(this.findDataset(['itemsTablet']), Math.ceil(slidesPerView / 2)));

        return {
            0: { slidesPerView: smallMobile },
            480: { slidesPerView: mobile },
            768: { slidesPerView: tablet },
            960: { slidesPerView }
        };
    }

    getInitialSlide() {
        if (this.element.dataset.initialSlide !== undefined) {
            return Math.max(0, number(this.element.dataset.initialSlide, 0));
        }

        const container = this.element.closest([
            '[data-carousel-id]',
            '[data-slider-id]',
            '[data-slideshow-id]',
            '[data-showcase-id]',
            '[data-eventlist-id]'
        ].join(', '));
        const selected = container?.querySelector('.selected, .current, .swiper-current, .active');
        const itemClass = selected
            ? Array.from(selected.classList).find((className) => !['selected', 'current', 'swiper-current', 'active'].includes(className))
            : null;
        const selectable = selected?.parentElement && itemClass
            ? Array.from(selected.parentElement.children).filter((item) => item.classList.contains(itemClass))
            : [];
        const selectedIndex = selected ? selectable.indexOf(selected) : -1;

        if (selectedIndex >= 0) {
            return selectedIndex;
        }

        const preset = this.findDataset(['preset', 'presets']);
        if (preset === false || preset === 'false') {
            return 0;
        }

        const presetIndex = number(preset, 0);
        const oneBasedSliderPreset = container?.matches('.g-slider')
            && container.querySelector('[data-slider-slides-id]');

        return Math.max(0, oneBasedSliderPreset ? presetIndex - 1 : presetIndex);
    }

    syncState(swiper) {
        this.element.classList.toggle('swiper-rtl', swiper.rtlTranslate);

        this.getPaginationElement()?.querySelectorAll('.swiper-pagination-bullet').forEach((bullet, index) => {
            bullet.classList.toggle('active', index === swiper.realIndex);
        });

        this.thumbnailItems?.forEach((thumbnail, index) => {
            const active = index === swiper.realIndex;
            thumbnail.classList.toggle('active', active);
            thumbnail.setAttribute('aria-current', active ? 'true' : 'false');
        });

        const activeSlide = swiper.slides?.[swiper.activeIndex] || null;

        this.element.dispatchEvent(new CustomEvent('g5:swiper:change', {
            bubbles: true,
            detail: {
                activeSlide,
                activeIndex: swiper.realIndex
            }
        }));
    }

    bindThumbnailNavigation() {
        if (String(this.element.dataset.pagination || '').toLowerCase() !== 'thumbs') {
            return;
        }

        const container = this.element.closest('.g-swipercarousel-slider');
        this.thumbnailItems = Array.from(container?.querySelectorAll(':scope > .swiper-thumbs .swiper-thumb') || []);

        this.thumbnailItems.forEach((thumbnail, index) => {
            thumbnail.setAttribute('role', 'button');
            thumbnail.setAttribute('tabindex', '0');
            thumbnail.setAttribute('aria-label', `Go to slide ${index + 1}`);

            const activate = () => {
                if (this.instance.params.loop) {
                    this.instance.slideToLoop(index);
                } else {
                    this.instance.slideTo(index);
                }
            };

            thumbnail.addEventListener('click', activate);
            thumbnail.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activate();
                }
            });
        });

        this.syncState(this.instance);
    }
}

const bindSynchronizedCarousels = (root = document) => {
    const containerSelector = [
        '[data-slider-id]',
        '[data-slideshow-id]',
        '[data-showcase-id]',
        '[data-panelslider-id]',
        '[data-bgslideshow-id]',
        '[data-newsslider-id]',
        '[data-eventlist-id]',
        '[data-featuredvideos-id]'
    ].join(', ');
    const containers = root.matches?.(containerSelector)
        ? [root]
        : Array.from(root.querySelectorAll?.(containerSelector) || []);

    containers.forEach((container) => {
        if (container.dataset.gSwiperSyncReady === 'true') {
            return;
        }

        const carousels = Array.from(container.querySelectorAll(':scope [data-g-swiper]'))
            .filter((element) => element.gantrySwiper?.instance);

        if (carousels.length < 2) {
            return;
        }

        const mainElement = carousels.find((element) => /-slides(?:\s|$)/.test(element.className)) || carousels[0];
        const navigationElement = carousels.find((element) => element !== mainElement && /-carousel(?:\s|$)/.test(element.className)) || carousels[1];
        const main = mainElement.gantrySwiper.instance;
        const navigation = navigationElement.gantrySwiper.instance;

        const updateCurrent = () => {
            navigation.slides.forEach((slide) => slide.classList.remove('swiper-current'));
            const current = navigation.slides[main.realIndex];
            current?.classList.add('swiper-current');
            navigation.slideTo(main.realIndex);
        };

        navigationElement.addEventListener('click', (event) => {
            const slide = event.target.closest('.swiper-slide');
            if (!slide) {
                return;
            }

            const index = navigation.slides.indexOf(slide);
            if (index >= 0) {
                main.slideToLoop(index);
            }
        });

        main.on('slideChange', updateCurrent);
        navigation.on('slideChange', () => {
            if (main.realIndex !== navigation.realIndex) {
                main.slideToLoop(navigation.realIndex);
            }
        });
        updateCurrent();
        container.dataset.gSwiperSyncReady = 'true';
    });
};

const bindStaticNavigation = (root = document) => {
    const definitions = [
        {
            container: '[data-newsslider-id]',
            items: '.g-newsslider-carousel-item-container',
            active: 'current'
        },
        {
            container: '[data-eventlist-id]',
            items: '.g-eventlist-item',
            active: 'selected'
        }
    ];

    definitions.forEach((definition) => {
        const containers = root.matches?.(definition.container)
            ? [root]
            : Array.from(root.querySelectorAll?.(definition.container) || []);

        containers.forEach((container) => {
            if (container.dataset.gSwiperStaticReady === 'true') {
                return;
            }

            const swiperElement = container.querySelector('[data-g-swiper]');
            const swiper = swiperElement?.gantrySwiper?.instance;
            const items = Array.from(container.querySelectorAll(definition.items));
            if (!swiper || !items.length) {
                return;
            }

            const update = () => {
                items.forEach((item) => item.classList.remove(definition.active));
                const current = items[swiper.realIndex];
                current?.classList.add(definition.active);
                current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            };

            items.forEach((item, index) => {
                item.addEventListener('click', () => swiper.slideToLoop(index));
            });
            swiper.on('slideChange', update);
            update();
            container.dataset.gSwiperStaticReady = 'true';
        });
    });
};

const bindShowcaseSets = (root = document) => {
    const containers = root.matches?.('[data-showcase-id]')
        ? [root]
        : Array.from(root.querySelectorAll?.('[data-showcase-id]') || []);

    containers.forEach((container) => {
        if (container.dataset.gSwiperShowcaseReady === 'true') {
            return;
        }

        const swiperElement = container.querySelector('[data-showcase-slides-id][data-g-swiper]');
        const swiper = swiperElement?.gantrySwiper?.instance;
        const sets = Array.from(container.querySelectorAll('.g-showcase-slides.desktop .g-showcase-slides-set'));
        if (!swiper || !sets.length) {
            return;
        }

        const itemsPerSet = Math.max(1, number(container.dataset.showcaseItems, 1));
        const update = () => {
            sets.forEach((set) => set.classList.remove('active'));
            const index = Math.min(sets.length - 1, Math.floor(swiper.realIndex / itemsPerSet));
            sets[index]?.classList.add('active');
            sets[index]?.querySelectorAll('.g-showcase-slides-slide').forEach((slide) => {
                slide.classList.add('finished');
            });
        };

        swiper.on('slideChangeTransitionStart', () => {
            sets.forEach((set) => {
                set.querySelectorAll('.g-showcase-slides-slide').forEach((slide) => {
                    slide.classList.remove('finished');
                });
            });
        });
        swiper.on('slideChangeTransitionEnd', update);
        update();
        container.dataset.gSwiperShowcaseReady = 'true';
    });
};

const bindBackgroundSlides = (root = document) => {
    const containers = root.matches?.('[data-bgslideshow-id]')
        ? [root]
        : Array.from(root.querySelectorAll?.('[data-bgslideshow-id]') || []);

    containers.forEach((container) => {
        if (container.dataset.gSwiperBackgroundReady === 'true') {
            return;
        }

        const swiperElement = container.querySelector('[data-bgslideshow-slides-id][data-g-swiper]');
        const swiper = swiperElement?.gantrySwiper?.instance;
        const images = Array.from(container.querySelectorAll('[data-bgslideshow-carousel-id] img'));
        let target = null;

        try {
            target = document.querySelector(container.dataset.vegasElement);
        } catch {
            target = null;
        }

        if (!swiper || !target || !images.length) {
            return;
        }

        const update = () => {
            const image = images[swiper.realIndex]?.currentSrc || images[swiper.realIndex]?.src;
            if (!image) {
                return;
            }

            if (typeof target.animate === 'function') {
                target.animate([{ opacity: 0.85 }, { opacity: 1 }], {
                    duration: Math.max(150, number(container.dataset.bgslideshowTransitionDuration, 500)),
                    easing: 'ease-out'
                });
            }
            target.style.backgroundImage = `url("${image.replaceAll('"', '\\"')}")`;
            target.style.backgroundRepeat = 'no-repeat';
            target.style.backgroundSize = container.dataset.bgslideshowCover || 'cover';
            target.style.backgroundPosition = [
                container.dataset.bgslideshowAlign || 'center',
                container.dataset.bgslideshowValign || 'center'
            ].join(' ');
        };

        swiper.on('slideChange', update);
        update();
        container.dataset.gSwiperBackgroundReady = 'true';
    });
};

const bindAccordionSlides = (root = document) => {
    const accordionSelector = '.g-swipercarousel-accordionslider, .g-swipercarousel-lists[data-g-accordion="true"]';
    const containers = root.matches?.(accordionSelector)
        ? [root]
        : Array.from(root.querySelectorAll?.(accordionSelector) || []);

    containers.forEach((container) => {
        if (container.dataset.gSwiperAccordionReady === 'true') {
            return;
        }

        const items = Array.from(container.querySelectorAll('.g-swipercarousel-item'));
        const updateSwiperHeight = () => {
            const swiper = container.querySelector('[data-g-swiper]')?.gantrySwiper?.instance;
            if (!swiper) {
                return;
            }

            // Accordion content changes the active slide's height without moving
            // the carousel. Refresh on the next two frames so Swiper measures the
            // completed DOM update instead of retaining the previous slide height.
            requestAnimationFrame(() => {
                swiper.update();
                swiper.updateAutoHeight(0);
                requestAnimationFrame(() => swiper.updateAutoHeight(0));
            });
        };
        const setItemOpen = (item, open) => {
            const heading = item.querySelector('.g-swipercarousel-item-title');
            const content = item.querySelector(':scope > .g-swipercarousel-content');
            if (!heading || !content) {
                return;
            }

            heading.classList.toggle('ui-accordion-header-active', open);
            heading.classList.toggle('ui-state-active', open);
            heading.setAttribute('aria-expanded', String(open));
            content.classList.toggle('ui-accordion-content-active', open);
            content.hidden = !open;
            item.querySelector('.indicator span')?.replaceChildren(document.createTextNode(open ? '\u2212' : '+'));
        };

        items.forEach((item, index) => {
            const heading = item.querySelector('.g-swipercarousel-item-title');
            const content = item.querySelector(':scope > .g-swipercarousel-content');
            if (!heading || !content) {
                return;
            }

            heading.setAttribute('role', 'button');
            heading.setAttribute('tabindex', '0');
            const toggle = () => {
                const open = content.hidden;
                if (open) {
                    items.forEach((otherItem) => setItemOpen(otherItem, false));
                }
                setItemOpen(item, open);
                updateSwiperHeight();
            };
            heading.addEventListener('click', toggle);
            heading.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                }
            });
            setItemOpen(item, index === 0);
        });

        container.dataset.gSwiperAccordionReady = 'true';
    });
};

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

    bindSynchronizedCarousels(root);
    bindStaticNavigation(root);
    bindShowcaseSets(root);
    bindBackgroundSlides(root);
    bindAccordionSlides(root);
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

window.GenesisSwiper = { GantrySwiper, initialize };
window.G5Swiper = window.GenesisSwiper;
