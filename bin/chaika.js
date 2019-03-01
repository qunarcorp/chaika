#!/usr/bin/env node
'use strict';
const semver = require('semver');
const program = require('commander');
const fs = require('fs');
const path = require('path');
const outLog = require('./../source/utils').outLog;

if (semver.lt(process.version, '8.6.0')) {
  outLog.warn(
    `chaika only support {green.bold v8.6.0} or later (current {green.bold ${
      process.version
    }}) of Node.js`
  );
  process.exit(1);
}

// [Function] and
// 通过遍历的形式设置 option
// https://github.com/tj/commander.js/pull/140
program.Command.prototype.and = function(fn) {
  fn.call(this, this);
  return this;
};

program
  .name('chaika')
  .usage('<command> [options]')
  .version(require('../package.json').version, '-v, --version');

fs.readdirSync(path.join(__dirname, '../source/commands')).forEach(file => {
  if (file !== 'index.js' && path.extname(file) === '.js') {
    const command = require(path.join(__dirname, '../source/commands', file));

    program
      .command(command.msg.name)
      .usage(command.msg.usage)
      .description(command.msg.description)
      .and(function(program) {
        if (command.msg.options) {
          command.msg.options.forEach(function(option) {
            program.option(option.pattern, option.desc);
          });
        }
      })
      .action(function(options) {
        command.process(process.cwd(), options);
      });
  }
});

program.parse(process.argv);
if (!program.args.length) program.help();
