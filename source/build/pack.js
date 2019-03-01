'use strict';
const { primary, cutOut } = require('../utils').outLog;

module.exports = that => {
  const { isWatch } = that;

  cutOut();
  // 合并文件
  let program = require('./execFiles')(that);

  // 监听文件改动 再次合并文件
  if (isWatch) {
    cutOut();
    primary('Start Watch File and Execute ......');
    program.watch();
  }
};
