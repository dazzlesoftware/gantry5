(function () {
    'use strict';

    document.querySelectorAll('[id^="g-mosaicgrid-"]').forEach(function (grid) {
        let items = Array.from(grid.querySelectorAll('.g-mosaicgrid-item-container'));
        let sizer = grid.querySelector('.g-mosaicgrid-sizer');
        if (!items.length) return;

        function layout() {
            let width = (sizer && sizer.getBoundingClientRect().width) || items[0].getBoundingClientRect().width || grid.clientWidth;
            let columns = Math.max(1, Math.floor(grid.clientWidth / width));
            let heights = Array(columns).fill(0);
            grid.style.position = 'relative';

            items.forEach(function (item) {
                let span = Math.max(1, Math.min(columns, Math.round(item.getBoundingClientRect().width / width)));
                let bestColumn = 0;
                let bestHeight = Number.POSITIVE_INFINITY;
                for (let column = 0; column <= columns - span; column += 1) {
                    let height = Math.max.apply(Math, heights.slice(column, column + span));
                    if (height < bestHeight) { bestHeight = height; bestColumn = column; }
                }
                item.style.position = 'absolute';
                item.style.left = (bestColumn * width) + 'px';
                item.style.top = bestHeight + 'px';
                let bottom = bestHeight + item.getBoundingClientRect().height;
                for (let occupied = bestColumn; occupied < bestColumn + span; occupied += 1) heights[occupied] = bottom;
            });
            grid.style.height = Math.max.apply(Math, heights) + 'px';
        }

        grid.querySelectorAll('img').forEach(function (image) {
            if (!image.complete) image.addEventListener('load', layout, { once: true });
        });
        new ResizeObserver(layout).observe(grid);
        layout();
    });
}());
