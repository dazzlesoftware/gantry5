"use strict";

var Particle = require('./particle');

class Spacer extends Particle {}

Spacer.prototype.options = {
    type: 'spacer',
    title: 'Spacer',
    attributes: {}
};

module.exports = Spacer;
