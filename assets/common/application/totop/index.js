'use strict';

const { ready, query } = require('../utils/dom');

ready(() => {
    const toTop = query('#g-totop');
    if (!toTop) {
        return;
    }

    toTop.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

module.exports = {};
