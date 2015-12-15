# chrome-extensions-youdaowithwordnode
#
原始扩展 https://chrome.google.com/webstore/detail/%E6%9C%89%E9%81%93%E8%AF%8D%E5%85%B8chrome%E5%88%92%E8%AF%8D%E6%8F%92%E4%BB%B6/eopjamdnofihpioajgfdikhhbobonhbb?hl=zh-CN


#原生不带生词本,只好自已动手

#本来打算自建后台服务,但发觉有道有自带的生词本http://dict.youdao.com/wordbook/wordlist,便打算用有道自已的生词本
#为求简单(牺牲体验),直接链接到youdao官方的login页获取cookie

##点击右上角设置图标即可看到除了官方功能，添加的其他功能。


##补充说明

#登录(弹窗到官方，后续可优化为本地原生实现)

#在翻译结果框中添加按钮 +生词本，点击会添到有道生词本，成功，则文件变为 添加成功

#添加自动加入生词本设置，或设置先中，每次查询，自动添加到生词本

#注销，实现方式为删除相应domain下的cookie

#添加生词时若没有登录(验证账号失败)则会弹出登陆页



##因是由原始扩展修改,或有侵权问题,因此并未上传到chrome官方

#目前只支持手动加载。

#加载方式

#下载项目到某目录A

#Chrome浏览器打开chrome://extensions/

#勾选开发者模式

#点击,加载已解压的扩展程序

#选中目录A 确定即可



#侵删

#联系邮箱cclient@hotmail.com
