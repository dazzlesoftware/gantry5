(function () {
    'use strict';
    document.querySelectorAll('[data-lettering], .g-headerlicious-header').forEach(function (element) {
        var text = element.textContent;
        element.textContent = '';
        Array.from(text).forEach(function (character, index) {
            var span = document.createElement('span');
            span.className = 'char' + (index + 1);
            span.textContent = character;
            element.appendChild(span);
        });
    });
}());
