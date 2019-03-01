'use strict';
const { info, cutOut } = require('../../utils').outLog;
const unpackLibs = require('./unpackLibs');
const copySource = require('./copySource');

module.exports = ctx => {
  info('Start Generate ......');
  cutOut();
  unpackLibs(ctx);
  cutOut();
  copySource(ctx);
};
