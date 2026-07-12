'use strict';

const { ready, delegate } = require('../../utils/dom');

ready(() => {
    delegate(document.body, 'click', '[data-g5-content] .g-main-nav .g-toplevel [data-g5-ajaxify]', (event, link) => {
        event.preventDefault();

        document.querySelectorAll('[data-g5-content] .g-main-nav .g-toplevel li.active')
            .forEach((item) => item.classList.remove('active'));

        const item = link.closest('li');
        if (item) item.classList.add('active');
    });
});

module.exports = {};
