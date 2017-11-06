# chrome-extensions-youdaowithwordnode

[google翻译版](https://github.com/cclient/chrome-extensions-googletranslatewithyoudaowordnote)

# 使用示例

添加生词:点击

删除生词:alt+点击

![安装](demo.gif)

# 加载方式

# 快速加载(普通用户，部分chrome版本不可用，因非官方应用，会有报警，需要允许）
![安装](install.gif)

1 下载 [chrome-extensions-youdaowithwordnode.crx文件](https://github.com/cclient/chrome-extensions-youdaowithwordnode/releases/download/v1.55_0/chrome-extensions-youdaowithwordnode.crx)

2 Chrome打开 chrome://extensions/

3 拖拽chrome-extensions-youdaowithwordnode.crx 至 Chrome chrome://extensions/页

# 源文件加载（开发者）

1 点击,右上角“Download ZIP”下载项目解压 或 git clone git@github.com:cclient/chrome-extensions-youdaowithwordnode.git

2 Chrome浏览器打开chrome://extensions/

3 勾选"开发者模式",若Chrome为英文版,则勾选 "Developer mode"

4 点击,“加载已解压的扩展程序”,若Chrome为英文版,则点击 "Load unpacked extension"

5 选中zip解压/git 下载目录 确定即可

# 使用说明

点击右上角设置图标即可看到添加的其他功能

添加了“登录”，“注销”，“生词本”，三个链接，及是否“自动添加生词”设置。

在翻译弹窗里添加了“+生词本”链接，添加生词时若没有登录，会弹出登陆框。

登陆成功后即可添加生词(alt+点击，为删除生词)，成功会有提示，也可去“生词本”，验证

若勾选“自动添加生词”，则每次查词，自动加入生词本

注销，换账号用（实现方式为清除dict.youdao.com及.youdao.com下的cookie）

# 项目说明

原始扩展

[有道词典Chrome划词插件](https://chrome.google.com/webstore/detail/%E6%9C%89%E9%81%93%E8%AF%8D%E5%85%B8chrome%E5%88%92%E8%AF%8D%E6%8F%92%E4%BB%B6/eopjamdnofihpioajgfdikhhbobonhbb?hl=zh-CN)


因不带生词本,自已动手添加

本打算自建后台服务,但发觉有道有自带的生词本[有道生词本](http://dict.youdao.com/wordbook/wordlist),且有多平台app，便决定用有道的生词本

# 因是由官方原始扩展修改,或有侵权问题,因此并未上传到chrome官方

# 侵删

# 联系邮箱cclient@hotmail.com

# 业余项目，没有自动更新功能，或会因有道和chrome升级而部分失效，更新请关注[项目地址](https://github.com/cclient/chrome-extensions-youdaowithwordnode) 其实更新频率很低

# 使用愉快