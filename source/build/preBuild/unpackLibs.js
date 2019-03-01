'use strict';
const shelljs = require('shelljs');
const JSON5 = require('json5');
const fs = require('fs');
const path = require('path');
const util = require('../../utils');
const CONST = require('../../chaika_config');

function fileFilter(ctx, file) {
  if (file.indexOf('.ignore') == -1) {
    if (path.extname(file) === '.w') {
      return true;
    } else if (fs.statSync(path.join(ctx.libsDir, file)).isDirectory()) {
      let pkgPath = path.join(ctx.libsDir, file, 'package.json');
      if (fs.existsSync(pkgPath)) {
        let pkg = JSON5.parse(fs.readFileSync(pkgPath, 'UTF-8'));
        return !!pkg.module;
      }
    }
  }
}

function directoryHandle(ctx, file, folderPath, libs) {
  let name = file.split('-')[0];

  util.outLog.primary(`Start Exec Module Folder '${file}' ......`);
  let pkg = JSON5.parse(
    fs.readFileSync(path.join(folderPath, 'package.json'), 'UTF-8')
  );
  pkg.module = pkg.module ? pkg.module : 'home_qunar';

  let srcPath = path.join(
    folderPath,
    pkg.module.indexOf(CONST.MAIN_MODULE_PREFIX) >= 0 ? '' : 'source'
  );

  if (fs.existsSync(srcPath)) {
    libs.push({
      name: pkg.module,
      version: pkg.version,
      folder: file
    });
    // shelljs.cp 文件夹需要在路径后面加上 '/'
    const dest = path.join(
      ctx.tmpDir,
      pkg.module.indexOf(CONST.MAIN_MODULE_PREFIX) ? pkg.module : './'
    );
    if (!fs.existsSync(dest)) {
      util.newFolder(dest);
    }
    shelljs.cp('-R', srcPath + '/*', dest);
    util.outLog.success(`Exec Module '${name}' Success!`);
  } else {
    util.outLog.fail(`${pkg.module} < ${pkg.version} > 'src' Not Found!`);
  }
}

function notDirectoryHandle(ctx, file, libs) {
  let name = file.split('-')[0];

  util.outLog.primary(
    `Start Unpack '${name}' < ${file.slice(
      name.length + 1,
      file.length - 2
    )} > ......`
  );

  libs.push({
    name,
    version: file.slice(name.length + 1, file.length - 2)
  });

  const src = path.join(ctx.libsDir, file);

  const dest = path.join(
    ctx.tmpDir,
    name.indexOf(CONST.MAIN_MODULE_PREFIX) ? name : ''
  );

  if (!fs.existsSync(dest)) {
    util.newFolder(dest);
  }

  const unzipExec = shelljs.exec(`tar -zxvf ${src} -C ${dest}`, {
    silent: true
  });

  if (unzipExec.code) {
    util.outLog.fail(unzipExec.stderr);
  }

  util.outLog.success(`Unpack Module '${name}' Success!`);
}

module.exports = ctx => {
  let libs = (ctx.libs = []);

  if (!fs.existsSync(ctx.libsDir)) return;

  fs.readdirSync(ctx.libsDir).forEach(file => {
    if (!fileFilter) return;

    let folderPath = path.join(ctx.libsDir, file);

    if (fs.statSync(path.join(ctx.libsDir, file)).isDirectory()) {
      directoryHandle(ctx, file, folderPath, libs);
    } else {
      notDirectoryHandle(ctx, file, libs);
    }
  });
};
