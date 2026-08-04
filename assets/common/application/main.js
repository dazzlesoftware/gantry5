'use strict';

const Menu = require('./menu');
const Offcanvas = require('./offcanvas');
require('./totop');

const { ready, query, queryAll, delegate } = require('./utils/dom');
const instances = { ready, query, queryAll, delegate };

// Genesis is the canonical browser API. Keep G5 as the same object for
// compatibility with existing themes and third-party integrations.
window.Genesis = instances;
window.G5 = window.Genesis;
module.exports = instances;

ready(() => {
    try {
        instances.offcanvas = new Offcanvas();
    } catch (error) {
        console.error('Genesis off-canvas initialization failed:', error);
    }

    try {
        instances.menu = new Menu();
    } catch (error) {
        console.error('Genesis menu initialization failed:', error);
    }
});
