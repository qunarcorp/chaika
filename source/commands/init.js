const path = require("path");
const crypto = require("crypto");
const inquirer = require("inquirer");
const fse = require("fs-extra");

// AES对称加密
const qunarInternal =
    "c1d1c708dc5c7da41b0b5b59d786122a4b16113b6084c3e85841707059eff5a5d24600344f4eb0bde3626cb64bacaa4748aca86f930583cbe1fd28ca1ed56963734f6afd3d63d7ec4b91827b78c20126f4fdd4267889f13cd9ecda3aede094bda73805d911e30fc291e06ccb598e2ec5eca7fefdeb0fa776e7105f151c41207465f6830584fdba3506d297f54493375d9724c80bc338f75e0efcb4b01a0c0eb0148af1088fa5d2b03a7db9f44237bdd82713652b6e7ddfc3cf6abd871389d3ea0c0421e3911d24df83783e91a9a265a7404cfd3d7dbc0acd86cf2bcabca99c84d8c5a9f322069d8116ae953b81b81a8196c555187de04f14738c49173f5e53e067bd7a50168639c448efd199eb8fb7b7";

function setPackageJson(pkg) {
    try {
        var distPath = path.join(__dirname, "../../package.json");
        fse.writeFileSync(distPath, JSON.stringify(pkg, null, 4), "utf8");
    } catch (error) {
        throw error;
    }
}

function setPromps(name, msg) {
    return {
        type: "input",
        name: name,
        message: msg,
        validate: function(input) {
            if (!input) {
                return "不能为空";
            }

            return true;
        }
    };
}

module.exports = {
    msg: {
        name: "init",
        usage: "初始化 chaika",
        description: "定义 chaika 配置",
        options: [
            {
                pattern: "-c, --camel",
                desc: "内部配置信息"
            }
        ]
    },
    process: (p, options) => {
        const promps = [];
        const isQunar = options.qunar;

        if (isQunar) {
            promps.push({
                type: "password",
                name: "password",
                message: "请输入 qunar 密码",
                validate: function(pw) {
                    if (!pw) {
                        return "不能为空";
                    }

                    try {
                        const decipher = crypto.createDecipher("aes192", pw);
                        let dec = decipher.update(qunarInternal, "hex", "utf8");
                        dec += decipher.final("utf8");
                        const pkg = require("../../package.json");
                        pkg.consts = JSON.parse(dec);
                        setPackageJson(pkg);
                    } catch (error) {
                        return "密码错误";
                    }

                    return true;
                }
            });
        } else {
            promps.push(setPromps("getVersionsUrl", "请输入包版本管理地址"));

            promps.push(
                setPromps(
                    "moduleGitUrl",
                    "请输入模块 git 地址 (为支持分支下载模块)"
                )
            );

            promps.push(setPromps("packageUrl", "请输入模块包地址"));
        }

        inquirer.prompt(promps).then(function(answers) {
            if (!isQunar) {
                const pkg = require("../../package.json");
                pkg.consts = answers;
                setPackageJson(pkg);

                console.log("初始化完成.");
            }
        });
    }
};
