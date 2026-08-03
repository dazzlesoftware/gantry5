(function () {
    'use strict';
    document.querySelectorAll('[data-flippingcards-id]').forEach(function (row) {
        var eventName = row.dataset.flippingcardsTrigger === 'hover' ? 'mouseenter' : 'click';
        var axis = row.dataset.flippingcardsAxis === 'x' ? 'X' : 'Y';
        var speed = Number(row.dataset.flippingcardsSpeed) || 500;
        row.querySelectorAll('.g-flippingcard').forEach(function (card) {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform ' + speed + 'ms ease';
            card.addEventListener(eventName, function () {
                var flipped = card.classList.toggle('g-flippingcard-flipped');
                card.style.transform = flipped ? 'rotate' + axis + '(180deg)' : '';
            });
            if (eventName === 'mouseenter') card.addEventListener('mouseleave', function () { card.classList.remove('g-flippingcard-flipped'); card.style.transform = ''; });
        });
    });
}());
