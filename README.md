# chrome-extensions-youdaowithwordnode
#
google翻译版 https://github.com/cclient/chrome-extensions-googletranslatewithyoudaowordnote
google翻译功能多了删除生词的功能，且在改动的地方加了todu标志。

##加载方式

快速加载
##1 下载chrome-extensions-youdaowithwordnode.crx
##2 Chrome打开 chrome://extensions/
##3 拖拽chrome-extensions-youdaowithwordnode.crx 至 Chrome chrome://extensions/ 页

源文件加载

##点击，右上角“Download ZIP”下载项目,下载完成后，解压到某目录A

##Chrome浏览器打开chrome://extensions/

##勾选开发者模式

##点击,“加载已解压的扩展程序”

##选中目录A 确定即可

#使用说明

##点击右上角设置图标即可看到除了添加的其他功能

##添加了“登录”，“注销”，“生词本”，三个链接，及是否“自动添加生词”设置。

##在翻译弹窗里添加了“+生词本”链接，若没有登录，会弹出登陆框。

##登陆成功后即可添加，添加成功会有提示，也可去“生词本”，验证。

##若勾选“自动添加生词”，则每次查词，自动加入生词本，不用再点击“+生词本”

##注销可有可无，换账号用。

#项目说明

原始扩展 https://chrome.google.com/webstore/detail/%E6%9C%89%E9%81%93%E8%AF%8D%E5%85%B8chrome%E5%88%92%E8%AF%8D%E6%8F%92%E4%BB%B6/eopjamdnofihpioajgfdikhhbobonhbb?hl=zh-CN

##原生不带生词本,只好自已动手

##本来打算自建后台服务,但发觉有道有自带的生词本http://dict.youdao.com/wordbook/wordlist,且有多平台应用，便打算用有道的生词本

##为求简单(牺牲体验),直接链接到youdao官方的login页获取cookie

##登录(弹窗官方页，后续可优化为本地原生实现)

##添加自动加入生词本设置，或设置选中，每次查询，自动添加到生词本

##注销，实现方式为删除相应domain下的cookie

##添加生词时若没有登录(验证账号失败)则会弹出登陆页



#因是由原始扩展修改,或有侵权问题,因此并未上传到chrome官方

##目前只支持手动加载。

##侵删

##联系邮箱cclient@hotmail.com
