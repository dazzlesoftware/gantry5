import __module0 from '../../utils/dom.js';

'use strict';

const { ready, delegate } = __module0;

ready(() => {
    delegate(document.body, 'click', '[data-genesis-content] .g-main-nav .g-toplevel [data-genesis-ajaxify]', (event, link) => {
        event.preventDefault();

        document.querySelectorAll('[data-genesis-content] .g-main-nav .g-toplevel li.active')
            .forEach((item) => item.classList.remove('active'));

        const item = link.closest('li');
        if (item) item.classList.add('active');
    });
});

export default {};
