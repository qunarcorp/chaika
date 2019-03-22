# 快速开始

## 简介

去哪儿网小程序分库开发是把一个个独立的业务当做一个模块, 最终由 chaika 把这些模块合并成一个完整的小程序.
目前去哪儿网小程序模块主要有以下分类:

1. **主模块**
   主模块的主要功能是整个小程序的一些全局配置和全局变量等, 如: package.json 中的 modules 是小程序所有模块的依赖配置
2. **公共模块**
   公共模块是小程序中其他模块公用的模块, 包含一些工具类代码和自定义组件等, 之所以把主模块和公共模块拆成两个模块, 主要是我们考虑到公共模块也可以依赖到不同的小程序中, 但主模块算是单个小程序中特有的, 所以要区别对待.
3. **业务模块**
   业务模块是业务相关的业务逻辑代码, 完全独立可拔插.

## 安装

安装 chaika

```bash
sudo npm install chaika -g
```

## 初始化 chaika

```bash
   chaika init
```

根据提示配置相应参数即可.

**配置说明**
**注: {module}: 对应的模块名占位, 会自动匹配替换**

1.  getVersionsUrl 保存模块版本号地址(JSON 格式). 用于版本检测和默认安装时安装最新版本.
    示例:

    ```bash
    http://XXXXXXX/{module}.json
    ```

    格式示例:

    ```bash
    [
        {
            "version": "0.2.87-rc.127",
            "desc": "lastest rc",
            "path": "http://XXXXXXX/0.2.87-rc.127/demo-0.2.87-rc.127.w",
            "job": "http://XXXXXXX/nnc_module_qunar_demo/127/",
            "timestamp": 1545370160638
        }
    ]
    ```

2.  moduleGitUrl 模块的 git 地址. 用于可以更灵活的安装指定分支或 tag 的模块代码.
    示例:

    ```bash
    git@XXXXXXX/nnc_{module}.git
    ```

3.  packageUrl 模块的压缩包地址
    示例:

    ```bash
    http://XXXXXXX/
    ```

# 开发

下面以去哪网儿项目模块为例。

1. 首先要将**主模块** clone 到本地

    ```bash
    git clone git@XXXXXX/nnc_home_qunar.git
    ```

2. 使用 **chaika install [模块名 @ 版本号或分支名]** 依次安装其他模块依赖

    ```bash
    chaika install qunar_platform@0.0.2-beta.newbranch.10 或
    chaika install qunar_platform@#newbranch
    ```

    也可以在主模块 package.json 统一配置模块依赖
    使用 chaika install 一并安装模块

    ```bash
    "modules": {
    "qunar_travel": "0.0.1-beta.newbranch.1",
    "qunar_platform": "0.0.2-beta.newbranch.10"
    }
    ```

3. 最后使用 **chaika build** 命令将所有模块合并.
   最终的产物在 nanachi 文件夹下, 可以使用 nanachi 直接转译.

    ```bash
    cd nanachi && chaika build
    ```

    > --watch 实时编辑打包，项目代码 source/ 下有内容改变自动打包。

# 命令

## chaika install (安装模块)

安装依赖的项目模块

```bash
chaika install [module_name[@version],module_name[@version],...]
```

#### module_name[@version]

-   module_name：模块名
-   version 支持：
    -   btag，例如：`b-170405-222222-guoxing.ji`
    -   Git 分支，例如：`#release`（`#` 开头）
    -   `'0.0.0'`，下载最新 `btag` 版本
    -   version 省略，下载 `package.json` 里 `modules` 指定的该模块版本。如果 `modules` 没有配置该模块，下载最新版本。

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

构建出 nanachi 可以直接转义的代码

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

> **Node 版本要求**
>
> micrapp 要求 Node 版本不低于 v8.6.0，你可以使用 [nvm](https://github.com/creationix/nvm) 或者 [n](https://github.com/tj/n) 管理多个版本的 Node
