'use strict';
const { fail, success, info } = require('../utils').outLog;
const { DEST_DIR, MAIN_PROJECT, WATCHEVENTS } = require('../chaika_config');
const chokidar = require('chokidar');
const merge = require('./merge');
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const shell = require('shelljs');

const cwd = process.cwd();

const copy = (src, dist, isFile) => {
    if (/\w+Config\.json$/.test(dist)) {
        return;
    }
    isFile ? fs.ensureFileSync(dist) : fs.ensureDirSync(dist);
    let promise = isFile ? fs.copyFile(src, dist) : fs.copy(src, dist);
    let logFilePathText = path.relative(cwd, dist);
    promise
        .then(() => {
            success(`Copy to ${logFilePathText} Success!`);
        })
        .catch(err => {
            fail(`File Conflict! ${err} \n`);
        });
};

const getPath = srcDir => {
    return fs.readdirSync(srcDir);
};
const checkIsFile = fPath => {
    return fs.statSync(fPath).isFile();
};

const isIgnore = fPath => {
    let filename = path.basename(fPath);
    if (/^\./.test(filename) || ['package.json', 'app.js', 'app.json'].includes(filename)) {
        return true;
    }
};

module.exports = that => {
    // 获取项目名称
    const projectDir = that.projectDir;
    let projectName = that.projectDir;
    const index = projectDir.lastIndexOf('/');
    projectName = projectName.substring(index + 1, projectName.length);
    projectName = projectName.split('.').pop();

    const isMainProject = MAIN_PROJECT === projectName;
    function run() {
        let srcDir = path.join(cwd, '.chaika_cache', 'chaika');
        let distDir = path.join(cwd, DEST_DIR);

        //copy cache目录资源
        getPath(srcDir).forEach(fPath => {
            if (isIgnore(fPath)) return;

            let src = path.join(srcDir, fPath);
            let dist = path.join(distDir, fPath);
            let isFile = checkIsFile(src);
            let isQunarDir = /^qunar_/.test(fPath);

            //如果是文件，直接copy
            if (isFile) {
                copy(src, dist, isFile);
                return;
            }

            if (!isQunarDir) {
                //如果是非qunar_目录，直接copy 如style, assets,...
                copy(src, dist, isFile);
            }

            //如果是qunar目录，抽出来放到source下面
            if (isQunarDir) {
                glob(`${src}/**`, {}, (err, files) => {
                    files.forEach(id => {
                        if (isIgnore(id)) return;
                        if (!checkIsFile(id)) return;
                        let dist = path.join(distDir, path.relative(src, id));
                        
                        
                        copy(id, dist, true);
                    });
                });
            }
        });

        //copy source目录资源
        glob(`${path.join(cwd, 'source')}/**`, {}, (err, files) => {
            files.forEach(id => {
                if (isIgnore(id)) return;
                if (!checkIsFile(id)) return;
                let dist = path.join(distDir, path.relative(path.join(cwd, 'source'), id));
                copy(id, dist, true);
            });
        });

        ['quickConfig.json', 'project.config.json'].forEach(function(fileName) {
            try {
                let dist =
                    fileName === 'quickConfig.json'
                        ? path.join(cwd, 'nanachi', fileName)
                        : path.join(cwd, 'nanachi', 'source', fileName);

                fs.ensureFileSync(dist);
                fs.copyFileSync(path.join(cwd, fileName), dist);
            } catch (err) {
                //有就copy, 没有就算了
            }
        });

        merge(that, isMainProject);
    }

    run();
    function getDistPath(changedPath) {
        return changedPath.replace(`${path.sep}source${path.sep}`, `${path.sep}${DEST_DIR}${path.sep}`);
    }
    return {
        watch: function() {
            let isReady = false;
            chokidar
                .watch(that.srcDir, {
                    ignored: /(^|[\\/\\])\../,
                    awaitWriteFinish: {
                        stabilityThreshold: 500,
                        pollInterval: 100
                    }
                })
                .on('ready', () => (isReady = true))
                .on('all', (event, changedPath) => {
                    if (!isReady) return;
                    const dist = getDistPath(changedPath);
                    switch (event) {
                        case 'change':
                            const special = ['package.json', 'app.js', 'app.json'];
                            if (special.includes(path.basename(changedPath))) {
                                merge(that, isMainProject);
                                return;
                            }
                            fs.copyFileSync(changedPath, dist);
                            info(changedPath, ' file chaged, type: ', event);
                            break;
                        case 'unlink':
                        case 'unlinkDir':
                            const rmResult = shell.rm('-rf', [dist]);
                            info(changedPath, ' file chaged, type: ', event, '\n', rmResult);
                            break;
                        case 'add':
                            fs.ensureFileSync(dist);
                            fs.copyFileSync(changedPath, dist);
                            info(changedPath, ' file chaged, type: ', event);
                            break;
                        default:
                            // console.log('other event :::', event);
                            break;
                    }
                });
        }
    };
};
