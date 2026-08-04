'use strict';

const { ready, delegate } = require('../../utils/dom');

ready(() => {
    delegate(document.body, 'click', '[data-genesis-content] .g-main-nav .g-toplevel [data-genesis-ajaxify]', (event, link) => {
        event.preventDefault();

        document.querySelectorAll('[data-genesis-content] .g-main-nav .g-toplevel li.active')
            .forEach((item) => item.classList.remove('active'));

        const item = link.closest('li');
        if (item) item.classList.add('active');
    });
});

module.exports = {};
