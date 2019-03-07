"use strict";
const util = require("../utils");
const config = require("../chaika_config");
const async = require("async");
const rp = require("request-promise");
const shelljs = require("shelljs");
const targz = require("targz");
const path = require("path");
const fs = require("fs");
const JSON5 = require("json5");

const pkgJsonConst = require("../../package.json").consts || {};

module.exports = {
    msg: {
        name: "install",
        usage: "安装依赖的项目模块",
        description: "安装依赖的项目模块"
    },
    process: projectDir => {
        Object.keys(pkgJsonConst).some(key => {
            if (!pkgJsonConst[key]) {
                util.outLog.error(
                    `Please configure '${key}' with package.json`
                );
                process.exit(1);
            }
        });

        const params = process.argv[3];
        const libsDir = path.join(projectDir, config.LIBS_DIR);

        const moduleGitUrl = pkgJsonConst.moduleGitUrl;
        const PREFIX = "nnc_";

        util.mkdirBlankDir(libsDir);

        if (params && params.indexOf("--")) {
            async.eachSeries(params.split(","), (param, callback) => {
                let kv = param.split("@");
                installPackage(kv[0], kv[1], false, callback);
            });
        } else {
            let modules =
                (require(path.join(projectDir, "package.json")) || {})
                    .modules || {};
            async.eachSeries(
                Object.keys(modules),
                (key, callback) => {
                    installPackage(key, modules[key], true, callback);
                },
                () => {}
            );
        }

        function clearLib(moduleName) {
            if (fs.existsSync(libsDir)) {
                fs.readdirSync(libsDir).forEach(file => {
                    if (
                        path.extname(file) == ".w" &&
                        file.split("-")[0] == moduleName
                    ) {
                        fs.unlinkSync(path.join(libsDir, file));
                    }
                });
            }
        }

        function reWritePackageMoudle(moduleName, version) {
            let pkgConfig =
                    require(path.join(projectDir, "package.json")) || {},
                modules = pkgConfig.modules || {};
            modules[moduleName] = "^" + version;
            pkgConfig.modules = modules;
            fs.writeFileSync(
                path.join(projectDir, "package.json"),
                JSON.stringify(pkgConfig, {}, 2),
                "UTF-8"
            );
        }

        function installModuleByGitBranch(name, gitBranch, callback) {
            let pName = name.indexOf(config.MAIN_MODULE_PREFIX)
                    ? "module_" + name
                    : name,
                branch = gitBranch.substring(1);

            let cloneSh = shelljs.exec(
                `git clone ${moduleGitUrl.replace("{module}", pName)}`,
                {
                    cwd: libsDir,
                    silent: true
                }
            );

            if (cloneSh.code == 0) {
                let pPath = path.join(libsDir, PREFIX + pName),
                    branchSh = shelljs.exec(
                        `git branch -r > /dev/null && git checkout ${branch} > /dev/null`,
                        {
                            cwd: pPath,
                            silent: true
                        }
                    );
                if (branchSh.code) {
                    util.outLog.warn(
                        `Check Out Branch '${branch}' Error, Use 'master' branch.`
                    );
                }
                clearLib(name);

                if (name.indexOf(config.MAIN_MODULE_PREFIX) < 0) {
                    // nanachi 项目，拷贝package.json 到 source 目录，再压缩
                    shelljs.cp(
                        path.join(pPath, "package.json"),
                        path.join(pPath, config.SOURCE_DIR)
                    );
                }

                targz.compress(
                    {
                        src: path.join(
                            pPath,
                            name.indexOf(config.MAIN_MODULE_PREFIX) >= 0
                                ? ""
                                : config.SOURCE_DIR
                        ),
                        dest: path.join(libsDir, `${name}-Git${gitBranch}.w`)
                    },
                    err => {
                        shelljs.rm("-rf", pPath, { silent: true });
                        if (err) {
                            util.outLog.fail(err);
                        } else {
                            util.outLog.success(
                                `Install '${name}@Git${gitBranch}' Success！`
                            );
                        }
                        callback();
                    }
                );
            } else {
                util.outLog.fail("Git Clone Fail！");
                callback();
            }
        }

        function installModuleByOnlineUrl(
            name,
            version,
            url,
            isInit,
            callback
        ) {
            clearLib(name);
            if (version == "0.0.0") {
                util.outLog.primary("Start Install Latest Beta Package ......");
            }

            const options = { url, encoding: null },
                handleSuccess = function handleSuccess(body) {
                    if (version == "0.0.0") {
                        version = url.split("/")[7];
                    }
                    fs.writeFileSync(
                        path.join(libsDir, `${name}-${version}.w`),
                        body
                    );
                    if (version && !isInit) {
                        reWritePackageMoudle(name, version);
                    }
                    util.outLog.success(
                        `Install '${name}@${version}' Success！`
                    );
                },
                handleError = function handleError() {
                    util.outLog.fail(`Install '${name}@${version}' Fail!`);
                },
                handleFinally = function handleFinally() {
                    callback();
                };

            rp(options)
                .then(handleSuccess, handleError)
                .finally(handleFinally);
        }

        function installModuleByTag(name, tag, callback) {
            clearLib(name);

            const url = `${
                    pkgJsonConst.packageUrl
                }nnc_module_${name}/${tag}/${name}-${tag}.w`,
                handleSuccess = function handleSuccess(body) {
                    fs.writeFileSync(
                        path.join(libsDir, `${name}-${tag}.w`),
                        body
                    );
                    util.outLog.success(`Install '${name}@${tag}' Success！`);
                },
                handleError = function handleError() {
                    util.outLog.fail(`Install '${name}@${tag}' Fail!`);
                },
                handleFinally = function handleFinally() {
                    callback();
                };

            rp({ url, encoding: null })
                .then(handleSuccess, handleError)
                .finally(handleFinally);
        }

        function installPackage(name, version = "", isInit, callback) {
            version = version.replace(/\^/, "");
            if (version && version.indexOf("#") === 0) {
                installModuleByGitBranch(name, version, callback);
            } else if (version) {
                installModuleByTag(name, version, callback);
            } else {
                let getVersonUrl = pkgJsonConst.getVersionsUrl;

                const moduleUrl = getVersonUrl.replace("{module}", name);

                rp(moduleUrl)
                    .then(
                        function handleSuccess(body) {
                            let list = JSON5.parse(body),
                                versions = list.map(item => item.version);

                            if (isInit || !version) {
                                version = versions[versions.length - 1];
                            }

                            if (versions.indexOf(version) > -1) {
                                let url = list.filter(
                                    item => item.version == version
                                )[0].path;
                                installModuleByOnlineUrl(
                                    name,
                                    version,
                                    url,
                                    isInit,
                                    callback
                                );
                            } else {
                                util.outLog.fail(
                                    `Get Module '${name}' Version List Fail!`
                                );
                                callback();
                            }
                        },
                        function handleError() {
                            util.outLog.fail(
                                `Get Module '${name}' Version List Fail!`
                            );
                            callback();
                        }
                    )
                    .catch(function(err) {
                        util.outLog.fail("catch err", err);
                    });
            }
        }
    }
};
