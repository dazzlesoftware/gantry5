(() => {
    'use strict';

    const defaults = {
        delay: 0,
        duration: 400,
        easing: 'ease',
        offset: 120,
        once: false
    };

    let options = { ...defaults };
    let observer;
    let mutationObserver;
    let targets = new Map();

    const numberOption = (element, name, fallback) => {
        const value = Number(element.dataset[`aos${name}`]);

        return Number.isFinite(value) ? value : fallback;
    };

    const booleanOption = (element, name, fallback) => {
        const value = element.dataset[`aos${name}`];

        return value === undefined ? fallback : value === 'true' || value === '1';
    };

    const dispatch = (name, element) => {
        document.dispatchEvent(new CustomEvent(name, { detail: element }));

        if (element.dataset.aosId) {
            document.dispatchEvent(new CustomEvent(`${name}:${element.dataset.aosId}`, { detail: element }));
        }
    };

    const show = (element) => {
        if (!element.classList.contains('aos-animate')) {
            element.classList.add('aos-animate');
            dispatch('aos:in', element);
        }
    };

    const hide = (element) => {
        if (element.classList.contains('aos-animate')) {
            element.classList.remove('aos-animate');
            dispatch('aos:out', element);
        }
    };

    const observe = (element) => {
        if (element.dataset.nativeScrollObserved === 'true') {
            return;
        }

        element.dataset.nativeScrollObserved = 'true';
        element.classList.add('aos-init');
        element.style.transitionDelay = `${numberOption(element, 'Delay', options.delay)}ms`;
        element.style.transitionDuration = `${numberOption(element, 'Duration', options.duration)}ms`;
        element.style.transitionTimingFunction = element.dataset.aosEasing || options.easing;

        const anchorSelector = element.dataset.aosAnchor;
        const observedElement = (anchorSelector && document.querySelector(anchorSelector)) || element;
        const animations = targets.get(observedElement) || new Set();

        animations.add(element);
        targets.set(observedElement, animations);
        observer.observe(observedElement);
    };

    const refresh = () => document.querySelectorAll('[data-aos]').forEach(observe);

    const init = (settings = {}) => {
        options = { ...defaults, ...settings };
        const body = document.body;

        body.dataset.aosDelay = options.delay;
        body.dataset.aosDuration = options.duration;
        body.dataset.aosEasing = options.easing;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            document.querySelectorAll('[data-aos]').forEach(show);
            return;
        }

        observer?.disconnect();
        targets = new Map();
        document.querySelectorAll('[data-native-scroll-observed]').forEach((element) => {
            delete element.dataset.nativeScrollObserved;
        });
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const animations = targets.get(entry.target) || new Set([entry.target]);
                let allOnce = true;

                animations.forEach((element) => {
                    const once = booleanOption(element, 'Once', options.once);
                    allOnce = allOnce && once;

                    if (entry.isIntersecting) {
                        show(element);
                    } else if (!once) {
                        hide(element);
                    }
                });

                if (entry.isIntersecting && allOnce) {
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: `0px 0px -${Math.max(0, Number(options.offset) || 0)}px 0px`,
            threshold: 0
        });

        refresh();
        mutationObserver?.disconnect();
        mutationObserver = new MutationObserver(refresh);
        mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
    };

    window.NativeScrollAnimations = { init, refresh };
})();

