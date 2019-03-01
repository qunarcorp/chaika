window.ydoc_plugin_search_json = {
  "文档": [
    {
      "title": "快速开始",
      "content": "",
      "url": "/documents/index.html",
      "children": [
        {
          "title": "简介",
          "url": "/documents/index.html#简介",
          "content": "简介去哪儿网小程序分库开发是把一个个独立的业务当做一个模块, 最终由 chaika 把这些模块合并成一个完整的小程序.目前去哪儿网小程序模块主要有以下分类:主模块\n主模块的主要功能是整个小程序的一些全局配置和全局变量等, 如: package.json 中的 modules 是小程序所有模块的依赖配置\n公共模块\n公共模块是小程序中其他模块公用的模块, 包含一些工具类代码和自定义组件等, 之所以把主模块和公共模块拆成两个模块, 主要是我们考虑到公共模块也可以依赖到不同的小程序中, 但主模块算是单个小程序中特有的, 所以要区别对待.\n业务模块\n业务模块是业务相关的业务逻辑代码, 完全独立可拔插.\n"
        },
        {
          "title": "安装",
          "url": "/documents/index.html#安装",
          "content": "安装npm install chaika -g"
        },
        {
          "title": "package.json 配置",
          "url": "/documents/index.html#package.json-配置",
          "content": "package.json 配置\"consts\": {    \"getVersionsUrl\": \"http://XXXXXXX/nnc_{module}.json\",\n    \"moduleGitUrl\": \"git@XXXXXXX/nnc_{module}.git\",\n    \"packageUrl\": \"http://XXXXXXX/\"\n},\n注: nnc_{module}: 对应的模块名占位, 代码会自动匹配替换getVersionsUrl 保存模块版本号地址(JSON 格式). 用于版本检测和默认安装时安装最新版本.\n[    {\n        \"version\": \"0.2.87-rc.127\",\n        \"desc\": \"lastest rc\",\n        \"path\": \"http://XXXXXXX/0.2.87-rc.127/demo-0.2.87-rc.127.w\",\n        \"job\": \"http://XXXXXXX/nnc_module_qunar_demo/127/\",\n        \"timestamp\": 1545370160638\n    }\n]\nmoduleGitUrl 模块的 git 地址. 用于可以更灵活的安装指定分支或 tag 的模块代码.\npackageUrl 模块的压缩包地址\n"
        }
      ]
    },
    {
      "title": "开发",
      "content": "下面以去哪网儿项目模块为例。\n首先要将主模块 clone 到本地\ngit clone git@XXXXXX/nnc_home_qunar.git\n\n\n\n使用 chaika install [模块名 @ 版本号或分支名] 依次安装其他模块依赖\nchaika install qunar_platform@0.0.2-beta.newbranch.10 或\nchaika install qunar_platform@#newbranch\n\n也可以在主模块 package.json 统一配置模块依赖\n使用 chaika install 一并安装模块\n\"modules\": {\n\"qunar_travel\": \"0.0.1-beta.newbranch.1\",\n\"qunar_platform\": \"0.0.2-beta.newbranch.10\"\n}\n\n\n\n最后使用 chaika build 命令将所有模块合并.\n最终的产物在 nanachi 文件夹下, 可以使用 nanachi 直接转译.\nchaika build\n\n\n--watch 实时编辑打包，项目代码 source/ 下有内容改变自动打包。\n\n\n",
      "url": "/documents/develop.html",
      "children": []
    },
    {
      "title": "命令",
      "content": "",
      "url": "/documents/command.html",
      "children": [
        {
          "title": "chaika install (安装模块)",
          "url": "/documents/command.html#chaika-install-安装模块",
          "content": "chaika install (安装模块)安装依赖的项目模块chaika install [module_name[@version],module_name[@version],...]module_name[@version]module_name：模块名\nversion 支持：\n\nbtag，例如：b-170405-222222-guoxing.ji\nGit 分支，例如：#release（# 开头）\n'0.0.0'，下载最新 btag 版本\nversion 省略，下载 package.json 里 modules 指定的该模块版本。如果 modules 没有配置该模块，下载最新版本。\n\n\n如果直接 chaika install 后面不加模块参数，则安装 package.json 文件里 modules 字段配置的模块及指定版本。例：modules 配置\"modules\": {    \"home_xxx\": \"^0.1.8\",\n    \"common\": \"^0.2.0\",\n    \"xxx1\": \"^0.1.2\",\n    \"xxx2\": \"^0.1.0\",\n    \"xxx3\": \"^0.1.6\"\n}\n"
        },
        {
          "title": "chaika build (构建)",
          "url": "/documents/command.html#chaika-build-构建",
          "content": "chaika build (构建)构建出nanachi可以直接转义的代码chaika build 有很多选项，你可以通过运行下面代码来查看这些选项：chaika build --helpUsage: build [options]\nOptions:\n\n-w, --watch       实时编辑\n-h, --help        output usage information\n"
        }
      ]
    }
  ],
  "更新日志": [
    {
      "title": "",
      "content": "",
      "url": "/release/release.html",
      "children": [
        {
          "title": "0.0.4",
          "url": "/release/release.html#0.0.4",
          "content": "0.0.4feat 更新文档\n"
        },
        {
          "title": "0.0.3",
          "url": "/release/release.html#0.0.3",
          "content": "0.0.3feat 修复执行逻辑代码\n"
        },
        {
          "title": "0.0.2",
          "url": "/release/release.html#0.0.2",
          "content": "0.0.2feat 增加build命令\n"
        },
        {
          "title": "0.0.1",
          "url": "/release/release.html#0.0.1",
          "content": "0.0.1feat 增加install命令\n"
        }
      ]
    }
  ]
}