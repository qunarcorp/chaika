let fs = require("fs-extra");
let path = require("path");
const lodashMerge = require('lodash.mergewith');
const { fail, success } = require("../utils").outLog;
const { DEST_DIR } = require("../chaika_config");
let glob = require("glob");
let cwd = process.cwd();
const crypto = require("crypto");
let cache = {};
let needUpdate = (id, code, fn) => {
    let sha1 = crypto
        .createHash("sha1")
        .update(code)
        .digest("hex");
    if (!cache[id] || cache[id] != sha1) {
        cache[id] = sha1;
        fn();
    }
};

//业务线配置文件名
let isMain;

let spaceLine = (key, text) => {
    return `//===================== ${key} ${text} =====================`;
};

function customizer(objValue, srcValue) {
    if ( Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
}

//获取业务中各配置
const getConfigFromProject = () => {

    let platConfigFile =  [
        'wxConfig.json', 
        'aliConfig.json', 
        'buConfig.json', 
        'ttCofnig.json', 
        'qqConfig.json', 
        'quickConfig.json'
    ];

    let nameSpaceRoutes = {};
    let nameSpaceAlias = {};
    let nameSpaceProjectPkg = {};
    let nameSpacePlatConfig = {};
    let nameSpaceImportSyntax = {};

    let moduleNamePattern = path.join(
        cwd,
        ".chaika_cache",
        "chaika",
        "qunar_*"
    );
    let moduleDirs = glob.sync(moduleNamePattern);
    

    //如果当前不是 home 包，home包资源就在 .chaika_cache/chaika 根目录下
    if (!isMain) {
        moduleDirs.push(path.join(cwd, ".chaika_cache", "chaika"));
    } else {
        moduleDirs.push(path.join(cwd));
    }

   
    // fs.existsSync(path.join(cwd, "source"))
    //     ? moduleDirs.push(path.join(cwd, "source"))
    //     : moduleDirs.push(path.join(cwd));

    moduleDirs.forEach(moduleDir => {
        let pkg = {};
        let pkgJsonPath = "";
        let moduleName = "";
        let appJsonData = {};

        if (path.basename(moduleDir) === "source") {
            pkgJsonPath = path.join(cwd, "package.json");
        } else {
            pkgJsonPath = path.join(moduleDir, "package.json");
        }

        try {
            pkg = require(pkgJsonPath);
        } catch (err) {
            //项目无package.json依赖
        }

        appJsonData = JSON.parse(fs.readFileSync(path.join(moduleDir, 'app.json')));
       
        let order = appJsonData.order || 0;

        let routes = appJsonData["pages"].map(pagePath => {
            const addPrefix = str => (/^\.\/pages\//.test(str) ? str : `./${str}`);
            if ('[object Object]' === Object.prototype.toString.call(pagePath)) {
                /**
                 * 如果配置项为object，并且platform字段有数据，插入差异化注释
                 * 如：if process.env.ANU_ENV == 'wx,ali';
                 * nanachi 会根据注释的内容判断平台的差异进行编译
                 */
                let route = `import '${addPrefix(pagePath.route)}';`;
                if (pagePath.platform) {
                    // nanachi 识别竖线分隔 join('|')
                    const plat = pagePath.platform
                        .split(',')
                        .map(item => item.trim())
                        .join('|');
                    const comment = `// if process.env.ANU_ENV == '${plat}';\n`;
                    route = comment + route;
                }
                // 如果没有platform字段或者为空字符串直接返回 route
                return route;
            }
            return `import '${addPrefix(pagePath)}';`;
        });

       

       
      
        
        moduleName = pkg["module"] || pkg["name"];

        if (!moduleName) return;

        nameSpaceRoutes[moduleName] = {
            list: Array.from(new Set(routes)),
            order: order
        };
        
        //各业务线运行依赖配置
        nameSpaceProjectPkg[moduleName] = pkg.dependencies;

        //各业务线别名配置
        
        nameSpaceAlias[moduleName] = appJsonData.alias;

        nameSpaceImportSyntax[moduleName] =  appJsonData.imports || [];
       
        // 各业务线 config 配置。
        // {
        //     hotel: {
        //         quickConfig_json: {
        //         }
        //     }
        // }
        
        nameSpacePlatConfig[ moduleName ] = {};
        const pathErr = [];
        platConfigFile.forEach((fileName)=>{
            if (/\/source$/.test(moduleDir)) {
                moduleDir = path.resolve(moduleDir, '..');
            }
           
            //各业务线的配置在.chaika_cache/chaika 中的路径
            let configFilePath = path.join(moduleDir, fileName);
           
            if ( !fs.existsSync(configFilePath) ) {
                return;
            }

            //moduleName: qunar_platform, qunar_train, home_qunar, ...
            let key = fileName.replace('.', '_');
            let platConfigJson = {};
            
            try {
                platConfigJson = require(configFilePath);
                nameSpacePlatConfig[moduleName][key] = lodashMerge(nameSpacePlatConfig[moduleName][key], platConfigJson, customizer);
                //nameSpacePlatConfig[moduleName][key] = Object.assign( nameSpacePlatConfig[moduleName][key] || {}, platConfigJson) ;
            } catch (err) {

            }
        })

    });

    return {
        nameSpaceRoutes,
        nameSpaceAlias,
        nameSpaceProjectPkg,
        nameSpacePlatConfig,
        nameSpaceImportSyntax
    };
};

//业务线page route配置插入到app.js
const injectPageRoute = (nameSpaceRoutes, nameSpaceImportSyntax) => {
    //获取业务page路由 和 alias配置
    let nameSpace = nameSpaceRoutes;

    //获取app.js import依赖
    let appJsPath = !isMain
        ? path.join(cwd, ".chaika_cache", "chaika", "app.js")
        : path.join(cwd, "app.js");
    let code = fs.readFileSync(appJsPath).toString();
    //let {code} = getAppJsImportRoutes(path.join(cwd, '.chaika_cache', 'chaika' , 'app.js'));

    //写入app.js
    let allPageRoutes = Object.keys(nameSpace).map(key => {
        return {
            list: [
                //spaceLine(key, "start"),
                ...nameSpace[key]["list"],
                //spaceLine(key, "end"),
                //"\n"
            ],
            order: nameSpace[key]["order"]
        };
    });

    allPageRoutes = allPageRoutes.sort((a, b) => {
        return b.order - a.order;
    });

    allPageRoutes = allPageRoutes.map(item => {
        return item.list;
    });
    //扁平化数组, 二维变一维
    allPageRoutes = [].concat(...allPageRoutes);

    allPageRoutes = Array.from(new Set(allPageRoutes));
    
    let allAppImportSyntaxCode = Object.keys(nameSpaceImportSyntax).reduce((ret, el) => {
        ret = ret.concat(nameSpaceImportSyntax[el]);
        return ret.map((curEl) => {
            curEl = curEl.trim();
            if (!/;$/.test(curEl)) {
                curEl = curEl + ';';
            }
            return curEl;
        });
    }, []).join("\n");

    console.log(
        allAppImportSyntaxCode
    );

    
    code = allPageRoutes.join("\n") + "\n"+ allAppImportSyntaxCode + "\n" + code;
    let appJsDist = path.join(cwd, DEST_DIR, "app.js");

    needUpdate(appJsDist, code, () => {
        fs.ensureFileSync(appJsDist);
        fs.writeFile(appJsDist, code, err => {
            if (err) {
                fail("Merge route fail!" + err + "\n" + err.list);
                return;
            }
            success(
                "Merge page routes into " +
                    path.relative(cwd, appJsDist) +
                    " Success!"
            );
        });
    });
};



//校验冲突: alias和npm
const checkAliasConflict = (aliasSpace, type) => {
    let config = {
        alias: "alias",
        npm: "node_modules"
    };

    let aliasDepTree = {};

    //aliasDepTree
    /**
     * {
     *   @hotelCommon': [ 'train:source/common', 'hotel:source/common'],
     *   ...
     * }
     *
     */
    Object.keys(aliasSpace).forEach(spaceName => {
        let alias = aliasSpace[spaceName] || {};
        Object.keys(alias).forEach(aliasName => {
            aliasDepTree[aliasName] = aliasDepTree[aliasName] || [];
            let aliasValue = alias[aliasName];
            aliasDepTree[aliasName].push(`${spaceName}:${aliasValue}`);
        });
    });

    let errMsg = "";
    Object.keys(aliasDepTree).forEach(aliasName => {
        //如果aliasDepTree中某一个别名被<=1的业务线配置, 肯定不会冲突.
        if (aliasDepTree[aliasName].length <= 1) return;

        //[ 'train:source/common', 'hotel:source/common']
        //这种结构要经过处理，其实他们配置是一样的，不冲突, 经过处理后去重，如果 > 1，则肯定有冲突.
        let alias = aliasDepTree[aliasName].map(value => {
            return value.replace(/^\w+:/, "");
        });
        alias = Array.from(new Set(alias));

        if (alias.length > 1) {
            errMsg += `\nConflict ${config[type]} name: ${aliasName}`;
            aliasDepTree[aliasName].forEach(info => {
                let infoList = info.split(":");
                errMsg += `\nProject: ${infoList[0]}\n`;
                errMsg += `    ${aliasName} >>> ${infoList[1]}`;
            });
            errMsg += "\n=========================================";
        }
    });

    if (!errMsg) return;
    let preText = "";
    if (type === "alias") {
        preText = "alias conflict! Merge abort. Must be fixed!";
    } else {
        preText = "package.json dependencies conflict! Must be fixed!";
    }

    fail(preText + "\n" + errMsg);
};

let merge = nameSpaceMap => {
    let result = {};
    Object.keys(nameSpaceMap).forEach(nameSpace => {
        Object.assign(result, nameSpaceMap[nameSpace]);
    });
    return result;
};

//合并package.json
let mergePkg = (nameSpaceAlias, nameSpaceProjectPkg) => {
    let mainPkgPath = isMain
        ? path.join(cwd, "package.json")
        : path.join(cwd, ".chaika_cache", "chaika", "package.json");

    let mainPkg = require(mainPkgPath);

    //见下面'重要'注释
    mainPkg = JSON.stringify(mainPkg).replace(
        new RegExp(`\\b${DEST_DIR}\\b`, "g"),
        "source"
    );
    mainPkg = JSON.parse(mainPkg);

    let nameSpace = nameSpaceAlias;
    mainPkg.nanachi = mainPkg.nanachi ? mainPkg.nanachi : {};

    let nanachi = mainPkg.nanachi;
    let rootDependencies = mainPkg.dependencies || {};
    let rootAlias = nanachi.alias ? nanachi.alias : {};
    let moduleName = mainPkg.module || mainPkg.name;

    let aliasSpaceMap = Object.assign({ [moduleName]: rootAlias }, nameSpace);
    let dependenciesSpaceMap = Object.assign(
        { [moduleName]: rootDependencies },
        nameSpaceProjectPkg
    );

    // //** dep 冲突测试;
    // dependenciesSpaceMap.nnc_qunar_platform = {}
    // dependenciesSpaceMap.nnc_qunar_platform.cookie2 = '^0.3.6';
    // dependenciesSpaceMap[moduleName].cookie2 = '0.2.6';
    

    //** alias 冲突测试;
    // aliasSpaceMap.nnc_qunar_platform = {};
    // aliasSpaceMap.nnc_qunar_platform['@common'] = '/source/x1';
    // aliasSpaceMap[moduleName]['@common'] = '/source/x2';

    //校验alias冲突
    checkAliasConflict(aliasSpaceMap, "alias");

    //校验package.json中dependencies冲突（某种意义上说, dependencies也是属于alias别名配置）
    checkAliasConflict(dependenciesSpaceMap, "npm");

    

    mainPkg["nanachi"]["alias"] = merge(aliasSpaceMap);
    mainPkg["dependencies"] = merge(dependenciesSpaceMap);

    //重要: micro输出目录是nanachi输入目录, 业务线中各配置都是source为根路径, 需要更新为micro输出目录.
    mainPkg["nanachi"]["sourceDir"] = DEST_DIR.split("/")[1];
    let mainJsonStr = JSON.stringify(mainPkg, null, 4).replace(
        /\bsource\b/g,
        DEST_DIR.split("/")[1]
    );

    let mainJsonDist = path.join(
        DEST_DIR.split("/")[0],
        "package.json"
    );
    fs.writeFile(mainJsonDist, mainJsonStr, err => {
        if (err) {
            fail("Merge package.json fail!" + err + "\n" + err.list);
            return;
        }
        success("Merge " + path.relative(cwd, mainJsonDist) + " Success!");
    });
};

let mergeConfig = (mergeConfig)=> {

    let ret = {
        'wxConfig_json': {},
        'aliConfig_json': {},
        'buConfig_json': {},
        'ttConfig_json': {},
        'qqConfig_json': {},
        'quickConfig_json': {}
    };

    Object.keys(mergeConfig).forEach((key)=>{
        for(let i in mergeConfig[key]) {
            let res = lodashMerge(ret[i], mergeConfig[key][i], customizer);
            ret[i] = res;
        }
    });

   

    for( let i in ret) {
        if ( Object.keys(ret[i]).length ) {
            let dist = path.join(cwd, 'nanachi', 'source', i.replace('_', '.'));
            fs.writeFile(
                dist,
                JSON.stringify(ret[i], null, 4),
                (err)=>{
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }
                    success("Merge " + path.relative(cwd, dist) + " Success!");
                }
            )
        }
    }

}

module.exports = (context, isMainProject) => {
    isMain = isMainProject;
    let {
        nameSpaceRoutes,
        nameSpaceAlias,
        nameSpaceProjectPkg,
        nameSpacePlatConfig,
        nameSpaceImportSyntax
    } = getConfigFromProject();
    injectPageRoute(nameSpaceRoutes, nameSpaceImportSyntax, context);
    mergePkg(nameSpaceAlias, nameSpaceProjectPkg, context);
    mergeConfig(nameSpacePlatConfig);
};
