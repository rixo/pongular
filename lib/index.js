'use strict';

var pongular = require('./pongular').pongular;
var mocks = require('./pongular-mocks');

Object.defineProperty(pongular, 'pongular', {
  get: function() {
    console.warn('require("pongular").pongular is deprecated, prefer the simple form require("pongular").');
    return pongular;
  }
});

module.exports = pongular;
