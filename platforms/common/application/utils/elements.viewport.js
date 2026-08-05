'use strict';

export default (container, selector, threshold = 0) => {
    const root = container && container[0] ? container[0] : container;
    if (!(root instanceof Element)) return [];

    const scopedSelector = selector.trim().startsWith('>')
        ? `:scope ${selector.trim()}`
        : selector;
    const top = root.scrollTop;
    const bottom = top + root.getBoundingClientRect().height;

    return [...root.querySelectorAll(scopedSelector)].filter((element) =>
        element.offsetTop + threshold >= top &&
        element.offsetTop - threshold <= bottom
    );
};
