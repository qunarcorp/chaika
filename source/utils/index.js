'use strict';
const fs = require('fs');
const shell = require('shelljs');
const moment = require('moment');
const figures = require('figures');
const colors = require('colors');
// 开启颜色显示
colors.enable();

// 右侧附加空格，为了保持对齐
const rightPad = (str, len, ch) => {
  len = len || 12;
  ch = ch || ' ';
  for (let i = 0, l = len - str.length; i < l; i++) {
    str += ch;
  }
  return str;
};

// 左侧附加空格，为了保持对齐
// const leftPad = (str, len, ch) => {
//   len = len || 12;
//   ch = ch || ' ';
//   for (let i = 0, l = len - str.length; i < l; i++) {
//     str = ch + str;
//   }
//   return str;
// };

// 给字符串加颜色
const addColor = (str, color) => {
  if (color) {
    color.split(',').forEach(style => (str = str[style]));
  }
  return str;
};

const util = (module.exports = {
  mkdirBlankDir: p => !fs.existsSync(p) && fs.mkdirSync(p),
  newFolder: p => {
    shell.rm('-rf', p);
    shell.mkdir('-p', p);
    return p;
  },
  outLog: {
    log: logs => {
      console.log.apply(
        // eslint-disable-line
        console,
        [`[${moment().format('HH:mm:ss')}]`].concat(logs)
      );
    },
    formatLog: function(logo, tag, logs, color) {
      util.outLog.log(
        [rightPad(` ${logo}  ${tag.toUpperCase()}`)]
          .concat(logs)
          .map(log => addColor(log, color))
      );
    },
    info: function(...logs) {
      util.outLog.formatLog(figures.info, 'info', logs, 'cyan');
    },
    await: function(...logs) {
      util.outLog.formatLog(figures.ellipsis, 'await', logs, 'gray');
    },
    success: function(...logs) {
      util.outLog.formatLog(figures.tick, 'success', logs, 'green'); // ✔
    },
    fail: function(...logs) {
      util.outLog.formatLog(figures.cross, 'fail', logs, 'red');
      process.exit(1);
    },
    warn: function(...logs) {
      util.outLog.formatLog(figures.warning, 'warn', logs, 'yellow');
    },
    primary: function(...logs) {
      util.outLog.formatLog(figures.star, 'primary', logs, 'magenta');
    },
    error: function(...logs) {
      util.outLog.formatLog(figures.cross, 'error', logs, 'red,bold');
    },
    special: function(...logs) {
      util.outLog.formatLog(figures.bullet, 'special', logs, 'magenta');
    },
    cutOut: function() {
      console.info(`=========================================`.gray); // eslint-disable-line
    }
  }
});
