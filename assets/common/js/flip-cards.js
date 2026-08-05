(function () {
    'use strict';

    function enabled(value) { return value === 'true' || value === '1'; }

    document.querySelectorAll('[data-flipster-id]').forEach(function (root) {
        let cards = Array.from(root.querySelectorAll('.g-flipster-card'));
        if (!cards.length) return;
        let start = root.dataset.flipsterStart;
        let index = start === 'center' ? Math.floor(cards.length / 2) : Number.parseInt(start || '0', 10);
        let loop = enabled(root.dataset.flipsterLoop);
        let timer;

        root.classList.add('flipster--' + (root.dataset.flipsterStyle || 'coverflow'));
        function show(next) {
            if (loop) next = (next + cards.length) % cards.length;
            index = Math.max(0, Math.min(next, cards.length - 1));
            cards.forEach(function (card, cardIndex) {
                let offset = cardIndex - index;
                card.classList.toggle('flipster__item--current', offset === 0);
                card.style.transform = 'translateX(' + (offset * 55) + '%) scale(' + (offset === 0 ? 1 : 0.8) + ')';
                card.style.opacity = Math.abs(offset) > 2 ? '0' : (offset === 0 ? '1' : '0.55');
                card.style.zIndex = String(cards.length - Math.abs(offset));
                card.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
            });
        }

        if (enabled(root.dataset.flipsterClick)) cards.forEach(function (card, cardIndex) { card.addEventListener('click', function () { show(cardIndex); }); });
        if (enabled(root.dataset.flipsterKeyboard)) root.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') show(index - 1);
            if (event.key === 'ArrowRight') show(index + 1);
        });
        let autoplay = Number(root.dataset.flipsterAutoplay);
        if (autoplay > 0) {
            function startTimer() { timer = window.setInterval(function () { show(index + 1); }, autoplay); }
            startTimer();
            if (enabled(root.dataset.flipsterPauseonhover)) {
                root.addEventListener('mouseenter', function () { window.clearInterval(timer); });
                root.addEventListener('mouseleave', startTimer);
            }
        }
        root.tabIndex = 0;
        show(index);
    });
}());
