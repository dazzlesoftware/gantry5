(function () {
    'use strict';
    document.querySelectorAll('[data-lettering], .g-headerlicious-header').forEach(function (element) {
        let text = element.textContent;
        element.textContent = '';
        Array.from(text).forEach(function (character, index) {
            let span = document.createElement('span');
            span.className = 'char' + (index + 1);
            span.textContent = character;
            element.appendChild(span);
        });
    });
}());
