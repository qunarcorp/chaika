'use strict';

const shelljs = require('shelljs');
const fs = require('fs');
const path = require('path');
const CONST = require('../../chaika_config');
const util = require('../../utils');

module.exports = ctx => {
  let distDir = path.join(
    ctx.tmpDir,
    ctx.moduleCfg.module &&
      ctx.moduleCfg.module.indexOf(CONST.MAIN_MODULE_PREFIX)
      ? ctx.moduleCfg.module
      : './'
  );
  if (fs.existsSync(ctx.srcDir)) {
    if (!fs.existsSync(distDir)) {
      util.newFolder(distDir);
    }
    
    shelljs.cp('-R', ctx.srcDir + '/*', distDir);
    
    try {
      let pkgSrc =  path.join( ctx.srcDir,  '../package.json');
      let pkgDist = path.join( distDir, 'package.json' );

      let exists  = fs.existsSync(pkgSrc);
      
      if (exists) {
        fs.copyFileSync(
          pkgSrc,
          pkgDist
        )
      }
     
    } catch (err) {
      console.log(err);
    }

    util.outLog.success('Copy Source Success!');
  }
};
