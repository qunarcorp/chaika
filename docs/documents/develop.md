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
   chaika build
   ```

   > --watch 实时编辑打包，项目代码 source/ 下有内容改变自动打包。
