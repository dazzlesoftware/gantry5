(function () {
    'use strict';
    document.querySelectorAll('.g-springboard-container').forEach(function (container) {
        var dragging = false;
        var startX = 0;
        var startY = 0;
        var scrollLeft = 0;
        var scrollTop = 0;
        container.style.cursor = 'grab';
        container.addEventListener('pointerdown', function (event) {
            dragging = true; startX = event.clientX; startY = event.clientY;
            scrollLeft = container.scrollLeft; scrollTop = container.scrollTop;
            container.setPointerCapture(event.pointerId); container.style.cursor = 'grabbing';
        });
        container.addEventListener('pointermove', function (event) {
            if (!dragging) return;
            container.scrollLeft = scrollLeft - (event.clientX - startX);
            container.scrollTop = scrollTop - (event.clientY - startY);
        });
        container.addEventListener('pointerup', function () { dragging = false; container.style.cursor = 'grab'; });
        container.addEventListener('pointercancel', function () { dragging = false; container.style.cursor = 'grab'; });
    });
}());
