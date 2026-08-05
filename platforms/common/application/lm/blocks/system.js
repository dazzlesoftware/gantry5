import __module0 from './particle.js';

"use strict";

let Particle = __module0;

class System extends Particle {}

System.prototype.options = {
    type: 'system',
    attributes: {}
};

export default System;
