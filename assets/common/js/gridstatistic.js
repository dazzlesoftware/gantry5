(() => {
    'use strict';

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parse = (value) => Number.parseFloat(String(value).replace(/[^\d+-.]/g, ''));

    const animate = (element) => {
        if (element.dataset.gridStatisticReady) return;
        element.dataset.gridStatisticReady = 'true';
        const source = element.dataset.odometerValue || '0';
        const target = parse(source);
        if (!Number.isFinite(target)) {
            element.textContent = source;
            return;
        }

        const decimals = source.includes('.') ? source.split('.').at(-1).replace(/\D/g, '').length : 0;
        const grouped = source.includes(',');
        const formatter = new Intl.NumberFormat(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: grouped
        });
        const duration = reducedMotion ? 0 : 1200;
        const started = performance.now();
        const frame = (now) => {
            const progress = duration ? Math.min(1, (now - started) / duration) : 1;
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = formatter.format(target * eased);
            if (progress < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    };

    const elements = [...document.querySelectorAll('[data-odometer-value]')];
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            animate(entry.target);
        }), { rootMargin: '100px' });
        elements.forEach((element) => observer.observe(element));
    } else {
        elements.forEach(animate);
    }
})();
