"use strict";

var Particle = require('./particle');

class System extends Particle {}

System.prototype.options = {
    type: 'system',
    attributes: {}
};

module.exports = System;
