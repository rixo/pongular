'use strict';

var pongular = require('./pongular').pongular;
var mocks = require('./pongular-mocks');

pongular.mocks = mocks;

module.exports = pongular;
