(function () {
    'use strict';

    document.querySelectorAll('.g-popupgrid').forEach(function (grid) {
        var preview = grid.nextElementSibling;
        if (!preview || !preview.classList.contains('g-popupgrid-preview')) return;

        var description = preview.querySelector('.g-popupgrid-description-preview');
        var image = document.createElement('img');
        image.className = 'g-popupgrid-original';
        image.alt = '';
        preview.appendChild(image);

        function close() {
            preview.classList.remove('g-popupgrid-preview-open', 'g-popupgrid-preview-image-loaded');
            grid.querySelectorAll('.g-popupgrid-item-current').forEach(function (item) { item.classList.remove('g-popupgrid-item-current'); });
            image.removeAttribute('src');
            if (description) description.replaceChildren();
        }

        grid.querySelectorAll('.g-popupgrid-item').forEach(function (item) {
            item.addEventListener('click', function (event) {
                if (event.target.closest('a')) return;
                var wrap = item.querySelector('.g-popupgrid-item-img-wrap');
                var source = wrap && (wrap.dataset.src || wrap.querySelector('img')?.src);
                var content = item.querySelector('.g-popupgrid-description');
                if (!source) return;
                item.classList.add('g-popupgrid-item-current');
                image.src = source;
                image.addEventListener('load', function () { preview.classList.add('g-popupgrid-preview-image-loaded'); }, { once: true });
                if (description && content) description.replaceChildren(content.cloneNode(true));
                preview.classList.add('g-popupgrid-preview-open');
            });
        });

        preview.querySelectorAll('.g-popupgrid-action-close, .g-popupgrid-preview-area').forEach(function (control) {
            control.addEventListener('click', close);
        });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
        grid.classList.add('g-popupgrid-loaded');
    });
}());
