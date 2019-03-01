'use strict';
const path = require('path');
const preBuild = require('../build/preBuild');
const copySource = require('../build/preBuild/copySource.js');
const util = require('../utils');
const CONST = require('../chaika_config');

const buildNanachi = (ctx, cb) => {
  ctx.distDir = path.join(process.cwd(), CONST.DEST_DIR);
  require('../build/pack.js')(ctx);
  cb && cb();
};

module.exports = {
  msg: {
    name: 'build',
    usage: '合并项目模块',
    description: '合并项目模块',
    options: [
      {
        pattern: '-w, --watch',
        desc: '实时编辑打包'
      },
      {
        pattern: '-e, --env <beta>',
        desc: '配置环境, 参数格式为 env[,biz:env,biz:env,...]'
      }
    ]
  },
  process: options => {
    let ctx = {
      projectDir: process.cwd(),
      libsDir: path.join(process.cwd(), CONST.LIBS_DIR),
      tmpDir: path.join(process.cwd(), CONST.TMP_DIR),
      srcDir: path.join(process.cwd(), CONST.SOURCE_DIR),
      prdDir: path.join(process.cwd(), CONST.PRD_DIR),
      moduleCfg: require(path.join(process.cwd(), 'package.json')),
      env: CONST.ENV,
      isWatch: options.watch
    };

    util.newFolder(ctx.tmpDir);

    preBuild(ctx);

    if (options.watch === true) {
      let compile = 0; // 0 没有编译 1 正在编译 2 正在编译，但是还有改动，编译完还要编译

      const build = () => {
        if (compile === 0) {
          compile = 1;

          copySource(ctx);

          buildNanachi(ctx, () => {
            if (compile === 2) {
              compile = 0;
              build();
            } else {
              compile = 0;
            }
          });
        } else {
          compile = 2;
        }
      };
    }

    buildNanachi(ctx);
  }
};
