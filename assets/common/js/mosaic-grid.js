(function () {
    'use strict';

    document.querySelectorAll('[id^="g-mosaicgrid-"]').forEach(function (grid) {
        var items = Array.from(grid.querySelectorAll('.g-mosaicgrid-item-container'));
        var sizer = grid.querySelector('.g-mosaicgrid-sizer');
        if (!items.length) return;

        function layout() {
            var width = (sizer && sizer.getBoundingClientRect().width) || items[0].getBoundingClientRect().width || grid.clientWidth;
            var columns = Math.max(1, Math.floor(grid.clientWidth / width));
            var heights = Array(columns).fill(0);
            grid.style.position = 'relative';

            items.forEach(function (item) {
                var span = Math.max(1, Math.min(columns, Math.round(item.getBoundingClientRect().width / width)));
                var bestColumn = 0;
                var bestHeight = Number.POSITIVE_INFINITY;
                for (var column = 0; column <= columns - span; column += 1) {
                    var height = Math.max.apply(Math, heights.slice(column, column + span));
                    if (height < bestHeight) { bestHeight = height; bestColumn = column; }
                }
                item.style.position = 'absolute';
                item.style.left = (bestColumn * width) + 'px';
                item.style.top = bestHeight + 'px';
                var bottom = bestHeight + item.getBoundingClientRect().height;
                for (var occupied = bestColumn; occupied < bestColumn + span; occupied += 1) heights[occupied] = bottom;
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
