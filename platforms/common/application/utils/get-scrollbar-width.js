'use strict';

let cached = null;

export default () => {
    if (cached !== null) return cached;

    const container = document.querySelector('[data-genesis-container]') || document.body;
    const dummy = document.createElement('div');
    Object.assign(dummy.style, {
        width: '100px',
        height: '100px',
        overflow: 'scroll',
        position: 'absolute',
        zIndex: '-9999'
    });
    container.appendChild(dummy);
    cached = dummy.offsetWidth - dummy.clientWidth;
    dummy.remove();
    return cached;
};
