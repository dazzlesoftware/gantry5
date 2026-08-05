(function (global) {
    'use strict';
    function render(options) {
        let root = typeof options.element === 'string' ? document.getElementById(options.element) : options.element;
        if (!root || !options.data?.length) return;
        let width = root.clientWidth || 640;
        let height = root.clientHeight || 300;
        let padding = options.axes === false ? 8 : 32;
        let values = options.data.map(function (item) { return Number(item[options.ykeys[0]]) || 0; });
        let min = Math.min.apply(Math, values);
        let max = Math.max.apply(Math, values);
        if (max === min) max = min + 1;
        let ns = 'http://www.w3.org/2000/svg';
        let svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', options.labels?.[0] || 'Line chart');
        if (options.grid !== false) {
            for (let line = 0; line <= 4; line += 1) {
                let gridLine = document.createElementNS(ns, 'line');
                let y = padding + ((height - padding * 2) * line / 4);
                gridLine.setAttribute('x1', padding); gridLine.setAttribute('x2', width - padding);
                gridLine.setAttribute('y1', y); gridLine.setAttribute('y2', y);
                gridLine.setAttribute('stroke', 'currentColor'); gridLine.setAttribute('opacity', '0.15');
                svg.appendChild(gridLine);
            }
        }
        let points = values.map(function (value, index) {
            let x = padding + (values.length === 1 ? 0 : index * (width - padding * 2) / (values.length - 1));
            let y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
            return x + ',' + y;
        }).join(' ');
        let polyline = document.createElementNS(ns, 'polyline');
        polyline.setAttribute('points', points); polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', options.lineColors?.[0] || '#3b82f6'); polyline.setAttribute('stroke-width', '3');
        svg.appendChild(polyline);
        root.replaceChildren(svg);
    }
    global.GenesisLineChart = { render: render };
}(window));
