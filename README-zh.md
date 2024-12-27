# Obsidian Sample


## 介绍

这是一个最简单的Obsidian插件开发示例。

这个示例，不需要安装node，git等，只需要使用原生javascript开发即可。


## 使用技巧

1. 根目录新建.hotreload空文件，并安装Hot Reload插件可以自动热加载

2. 重启obsidian可以用location.reload()代替

3. 打开开发者工具

    windows: Ctrl+Shift+I
    macOS: Cmd+Option+I

4. 手机调试可以用手机端模拟器

    切换移动设备和桌面设备 this.app.emulateMobile(!this.app.isMobile);

4. 调试动态生成内容可以用 await sleep(5000);debugger;

5. 代码提示
可以新建node_modules/obsidian文件夹，并把obsidian.d.ts文件复制过来即可。详情可参考[obsidian-sample.zip](https://github.com/wish5115/my-softs/releases/download/ObsidianSample/obsidian-sample.zip)


## 官方文档

官方英文文档

https://docs.obsidian.md/Home

中文文档

https://luhaifeng666.github.io/obsidian-plugin-docs-zh/zh2.0/

其他文档（非官方）

https://publish.obsidian.md/hub/04+-+Guides%2C+Workflows%2C+%26+Courses/for+Plugin+Developers

https://liamca.in/hello


## 已知问题

但也有缺点：

1. 不支持typescript，如想支持需要IDE插件进行转换

2. 不方便导入外部模块，如果导入外部模块需要用全路径，并且模块的修改不会热加载，每次修改模块需要重启obsidian。
不过可以把模块写到main.js中即可，一般小型插件或学习插件开发足够了。
**当然，如果有高手有更好的办法，请多多指教！谢谢啦！**
