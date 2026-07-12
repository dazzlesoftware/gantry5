'use strict';

const Menu = require('./menu');
const Offcanvas = require('./offcanvas');
require('./totop');

const { ready, query, queryAll, delegate } = require('./utils/dom');
const instances = { ready, query, queryAll, delegate };

window.G5 = instances;
module.exports = instances;

ready(() => {
    try {
        instances.offcanvas = new Offcanvas();
    } catch (error) {
        console.error('Gantry off-canvas initialization failed:', error);
    }

    try {
        instances.menu = new Menu();
    } catch (error) {
        console.error('Gantry menu initialization failed:', error);
    }
});
