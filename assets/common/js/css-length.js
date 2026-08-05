(() => {
    'use strict';

    const toPx = (element, value, property = 'width') => {
        if (typeof value === 'number') return value;
        const input = String(value || '').trim();
        if (!input) return 0;
        const numeric = Number.parseFloat(input);
        if (!Number.isFinite(numeric)) return 0;
        if (input.endsWith('px') || /^-?[\d.]+$/.test(input)) return numeric;

        const probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;inset:auto;';
        probe.style[property] = input;
        (element || document.body || document.documentElement).append(probe);
        const pixels = Number.parseFloat(getComputedStyle(probe)[property]) || probe.getBoundingClientRect()[property] || 0;
        probe.remove();
        return pixels;
    };

    window.Length = { toPx };
})();
