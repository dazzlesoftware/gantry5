(function (global) {
    'use strict';
    function render(options) {
        var root = typeof options.element === 'string' ? document.getElementById(options.element) : options.element;
        if (!root || !options.data?.length) return;
        var width = root.clientWidth || 640;
        var height = root.clientHeight || 300;
        var padding = options.axes === false ? 8 : 32;
        var values = options.data.map(function (item) { return Number(item[options.ykeys[0]]) || 0; });
        var min = Math.min.apply(Math, values);
        var max = Math.max.apply(Math, values);
        if (max === min) max = min + 1;
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', options.labels?.[0] || 'Line chart');
        if (options.grid !== false) {
            for (var line = 0; line <= 4; line += 1) {
                var gridLine = document.createElementNS(ns, 'line');
                var y = padding + ((height - padding * 2) * line / 4);
                gridLine.setAttribute('x1', padding); gridLine.setAttribute('x2', width - padding);
                gridLine.setAttribute('y1', y); gridLine.setAttribute('y2', y);
                gridLine.setAttribute('stroke', 'currentColor'); gridLine.setAttribute('opacity', '0.15');
                svg.appendChild(gridLine);
            }
        }
        var points = values.map(function (value, index) {
            var x = padding + (values.length === 1 ? 0 : index * (width - padding * 2) / (values.length - 1));
            var y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
            return x + ',' + y;
        }).join(' ');
        var polyline = document.createElementNS(ns, 'polyline');
        polyline.setAttribute('points', points); polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', options.lineColors?.[0] || '#3b82f6'); polyline.setAttribute('stroke-width', '3');
        svg.appendChild(polyline);
        root.replaceChildren(svg);
    }
    global.GenesisLineChart = { render: render };
}(window));
