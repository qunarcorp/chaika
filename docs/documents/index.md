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

```bash
npm install chaika -g
```

## package.json 配置

```bash
"consts": {
    "getVersionsUrl": "http://XXXXXXX/nnc_{module}.json",
    "moduleGitUrl": "git@XXXXXXX/nnc_{module}.git",
    "packageUrl": "http://XXXXXXX/"
},
```

**注: nnc\_{module}: 对应的模块名占位, 代码会自动匹配替换**

1. getVersionsUrl 保存模块版本号地址(JSON 格式). 用于版本检测和默认安装时安装最新版本.

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

2. moduleGitUrl 模块的 git 地址. 用于可以更灵活的安装指定分支或 tag 的模块代码.
3. packageUrl 模块的压缩包地址
