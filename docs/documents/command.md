# 命令

## chaika install (安装模块)

安装依赖的项目模块
```bash
chaika install [module_name[@version],module_name[@version],...]
```
#### module_name[@version]
* module_name：模块名
* version 支持：
    * btag，例如：`b-170405-222222-guoxing.ji`
    * Git 分支，例如：`#release`（`#` 开头）
    * `'0.0.0'`，下载最新 `btag` 版本
    * version 省略，下载 `package.json` 里 `modules` 指定的该模块版本。如果 `modules` 没有配置该模块，下载最新版本。

如果直接 `chaika install` 后面不加模块参数，则安装 `package.json` 文件里 `modules` 字段配置的模块及指定版本。例：`modules` 配置
```js
"modules": {
    "home_xxx": "^0.1.8",
    "common": "^0.2.0",
    "xxx1": "^0.1.2",
    "xxx2": "^0.1.0",
    "xxx3": "^0.1.6"
}
```

## chaika build (构建)

构建出nanachi可以直接转义的代码

chaika build 有很多选项，你可以通过运行下面代码来查看这些选项：
```
chaika build --help
```
```
Usage: build [options]

Options:

-w, --watch       实时编辑
-h, --help        output usage information
```