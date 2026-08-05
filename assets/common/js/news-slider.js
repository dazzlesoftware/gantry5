(function () {
    'use strict';
    document.querySelectorAll('.g-newsslider').forEach(function (root) {
        let contents = Array.from(root.querySelectorAll('.news-content'));
        let headlines = Array.from(root.querySelectorAll('.news-headlines li'));
        let pagination = Array.from(root.querySelectorAll('.g-newsslider-pagination li'));
        let index = 0;
        let timer;
        if (!contents.length) return;
        function show(next) {
            index = (next + contents.length) % contents.length;
            contents.forEach(function (item, i) { item.classList.toggle('top-content', i === index); });
            headlines.forEach(function (item, i) { item.classList.toggle('selected', i === index); item.classList.add('nh-anim'); });
            pagination.forEach(function (item, i) { item.classList.toggle('selected', i === index); });
        }
        headlines.forEach(function (item, i) { item.addEventListener('click', function () { show(i); }); });
        pagination.forEach(function (item, i) { item.addEventListener('click', function () { show(i); }); });
        root.querySelector('.g-newsslider-navigation .next')?.addEventListener('click', function () { show(index + 1); });
        root.querySelector('.g-newsslider-navigation .prev')?.addEventListener('click', function () { show(index - 1); });
        if (root.dataset.newssliderAutoplay === 'true') timer = window.setInterval(function () { show(index + 1); }, Number(root.dataset.newssliderDelay) || 5000);
        root.addEventListener('mouseenter', function () { if (timer) window.clearInterval(timer); });
        show(0);
    });
}());
