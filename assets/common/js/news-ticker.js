(function () {
    'use strict';
    document.querySelectorAll('.g-newsticker-container').forEach(function (root) {
        let items = Array.from(root.querySelectorAll('.g-newsticker-content'));
        let index = 0;
        let timer;
        if (!items.length) return;
        function show(next) {
            index = (next + items.length) % items.length;
            items.forEach(function (item, i) { item.hidden = i !== index; });
        }
        root.querySelector('.g-next')?.addEventListener('click', function () { show(index + 1); });
        root.querySelector('.g-prev')?.addEventListener('click', function () { show(index - 1); });
        function start() { timer = window.setInterval(function () { show(index + 1); }, 2000); }
        root.addEventListener('mouseenter', function () { window.clearInterval(timer); });
        root.addEventListener('mouseleave', start);
        show(0); start();
    });
}());
