'use strict';

var mocks = require('./lib/pongular-mocks');

module.exports = mocks;

global.ngModule = mocks.module;
global.inject = mocks.inject;
