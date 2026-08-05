import __module0 from './particle.js';

"use strict";

var Particle = __module0;

class Spacer extends Particle {}

Spacer.prototype.options = {
    type: 'spacer',
    title: 'Spacer',
    attributes: {}
};

export default Spacer;
