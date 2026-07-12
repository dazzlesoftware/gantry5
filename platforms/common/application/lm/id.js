'use strict';

const randomId = () => {
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
        const value = new Uint32Array(1);
        window.crypto.getRandomValues(value);
        return 1000 + (value[0] % 9000);
    }
    return Math.floor(Math.random() * 9000) + 1000;
};

module.exports = (options) => {
    const existing = new Set(options.builder ? Object.keys(options.builder.map || {}) : []);
    const parts = [];

    if (options.type !== 'particle') parts.push(options.type);
    if (options.subtype) parts.push(options.subtype);

    const key = parts.join('-');
    let id;
    do {
        id = randomId();
    } while (existing.has(`${key}-${id}`));

    return `${key}-${id}`;
};
