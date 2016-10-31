/**
 * @author Dongxu Huang
 * @date   2010-2-21
 */

var Options =
{
    "dict_disable": ["checked", false],
    "ctrl_only": ["checked", false],
    "english_only": ["checked", false],
    "autoplay": ["checked", false],
    "playwhenhovering": ["checked", false],
	// todo start
	"autoaddword": ["checked", false],
	// todo end
    "playwhenclicking": ["checked", false]
};
function close()
{
	window.self.close();
}
var retphrase = "";
var basetrans = "";
var webtrans = "";
var noBaseTrans = false;
var noWebTrans = false;
function isChinese(temp) 
{ 
	var re = /[^\u4e00-\u9fa5]/; 
	if(re.test(temp)) return false; 
	return true; 
}
function isJapanese(temp) 
{ 
	var re = /[^\u0800-\u4e00]/; 
	if(re.test(temp)) return false; 
	return true; 
}
function isKoera(str) {
	for(i=0; i<str.length; i++) {
	if(((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
		return true;
		}
	}
	return false;
}
function isContainKoera(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isKoera(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 0) return true;
	return false;
}

function isContainChinese(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isChinese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 5) return true;
	return false;
}
function isContainJapanese(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isJapanese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 2) return true;
	return false;
}
var langType = '';
function translateXML(xmlnode){
	var translate = "<strong>查询:</strong><br/>";
	var root = xmlnode.getElementsByTagName("yodaodict")[0];
	
	if ("" + root.getElementsByTagName("return-phrase")[0].childNodes[0] != "undefined") 
		retphrase = root.getElementsByTagName("return-phrase")[0].childNodes[0].nodeValue;
	
	
	
	if ("" + root.getElementsByTagName("lang")[0]  != "undefined") {
		langType = root.getElementsByTagName("lang")[0].childNodes[0].nodeValue;
	}
	var strpho = "";
 
	if (""+ root.getElementsByTagName("phonetic-symbol")[0] != "undefined" ) {
		if(""+ root.getElementsByTagName("phonetic-symbol")[0].childNodes[0] != "undefined")
			var pho = root.getElementsByTagName("phonetic-symbol")[0].childNodes[0].nodeValue;
		
		if (pho != null) {
			strpho = "&nbsp;[" + pho + "]";
		}
	}
	
	if (""+ root.getElementsByTagName("translation")[0] == "undefined")
	{
		 noBaseTrans = true;
	}
	if (""+ root.getElementsByTagName("web-translation")[0] == "undefined")
	{
		 noWebTrans = true;
	}
	
	
	if (noBaseTrans == false) {
		translate += retphrase + "<br/><br/><strong>基本释义:</strong><br/>";
		
		if ("" + root.getElementsByTagName("translation")[0].childNodes[0] != "undefined") 
			var translations = root.getElementsByTagName("translation");
		else {
			basetrans += '未找到基本释义';
		}
		
		for (var i = 0; i < translations.length; i++) {
			var line = translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "<br/>";
			if (line.length > 50) {
				var reg = /[;；]/;
				var childs = line.split(reg);
				line = '';
				for (var i = 0; i < childs.length; i++) 
					line += childs[i] + "<br/>";
			}
			basetrans += line;
			
		}
	}
	if (noWebTrans == false) {
		if ("" + root.getElementsByTagName("web-translation")[0].childNodes[0] != "undefined") 
			var webtranslations = root.getElementsByTagName("web-translation");
		else {
			webtrans += '未找到网络释义';
		}
		
		for (var i = 0; i < webtranslations.length; i++) {
			webtrans += webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue + ":  ";
			webtrans += webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue + "<br/>";
		}
	}
	mainFrameQuery();
	return ;
}
var _word;

function mainQuery(word,callback) {
		var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(data) {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              var dataText = translateXML(xhr.responseXML);
			  if(dataText != null)
              	callback(dataText);
            }
          }
        }
		_word = word;
        var url = 'http://dict.youdao.com/fsearch?client=deskdict&keyfrom=chrome.extension&q='+encodeURIComponent(word)+'&pos=-1&doctype=xml&xmlVersion=3.2&dogVersion=1.0&vendor=unknown&appVer=3.1.17.4208&le=eng'
		xhr.open('GET', url, true);
        xhr.send();
}
function removeDiv(divname)
{
	var div=document.getElementById(divname);
	if(div == null) return;
	div.parentNode.removeChild(div);
}
function mainFrameQuery(){
	removeDiv('opt_text');
	removeDiv('opt_text');
	removeDiv('opt_text');
	removeDiv('opt_text');
	var lan = '';
	if(isContainKoera(_word))
	{
		lan = "&le=ko";
	}
	if(isContainJapanese(_word))
	{
		lan = "&le=jap";
	}
	if(langType == 'fr')
	{
		lan = "&le=fr";
	}
	var res = document.getElementById('result');
	res.innerHTML = '';
	if (noBaseTrans == false) {
		if(langType=='ko')
			basetrans = "<strong>韩汉翻译:</strong><br/>" + basetrans;
		else if (langType == 'jap')
			basetrans = "<strong>日汉翻译:</strong><br/>" + basetrans;
		else if (langType == 'fr')
			basetrans = "<strong>法汉翻译:</strong><br/>" + basetrans;
		else basetrans = "<strong>英汉翻译:</strong><br/>" + basetrans;
    	res.innerHTML = basetrans;
	}
	if (noWebTrans == false) {
		webtrans = "<strong>网络释义:</strong><br/>" + webtrans;
		res.innerHTML += webtrans;
	}
	if(noBaseTrans == false || noWebTrans == false)
	{
		res.innerHTML +="<a href ='http://dict.youdao.com/search?q="+encodeURIComponent(_word)+"&ue=utf8&keyfrom=chrome.extension"+lan+"' target=_blank>点击 查看详细释义</a>";
	}
	if(noBaseTrans && noWebTrans)
	{
		res.innerHTML = "未找到英汉翻译!";
		res.innerHTML +="<br><a href ='http://www.youdao.com/search?q="+encodeURIComponent(_word)+"&ue=utf8&keyfrom=chrome.extension' target=_blank>尝试用有道搜索</a>";
	}
	retphrase='';
	webtrans = '';
	basetrans = '';
	_word ='';
	langType='';
	noBaseTrans = false;
	noWebTrans = false;
	document.getElementsByName('word')[0].focus();
}
function save_options()
{
	changeIcon();
	for (key in Options)
    {
        if (Options[key][0] == "checked")
        {
            Options[key][1] = document.getElementById(key).checked;
        }
    }
	localStorage["ColorOptions"] = JSON.stringify(Options);
}
function goFeedback()
{
	window.open("http://feedback.youdao.com/deskapp_report.jsp?prodtype=deskdict&ver=chrome.extension");
}
function goAbout()
{
	window.open("http://cidian.youdao.com/chromeplus");
}
function initIcon()
{
	var localOptions = JSON.parse(localStorage["ColorOptions"]);
	if(localOptions['dict_disable'][1] == true) {
		chrome.browserAction.setIcon({
			path: "icon_nodict.png"
		})
	}
}
function changeIcon()
{
	
	if (document.getElementById('dict_disable').checked) {
		
		var a = document.getElementById('ctrl_only');
		a.disabled = true;
    a.parentElement.style.color = 'grey';
		
		a = document.getElementById('english_only');
		a.disabled = true;
    a.parentElement.style.color = 'grey';
    
    a = document.getElementById('autoplay');
    a.disabled = true;
    a.parentElement.style.color = 'grey';
    a = document.getElementById('playwhenhovering');
    a.disabled = true;
    a.parentElement.style.color = 'grey';
    a = document.getElementById('playwhenclicking');
    a.disabled = true;
    a.parentElement.style.color = 'grey';
		
		chrome.browserAction.setIcon({
			path: "icon_nodict.png"
		})
	}
	else {
		var a = document.getElementById('ctrl_only');
		a.disabled = false;
    a.parentElement.style.color = 'black';
		
		a = document.getElementById('english_only');
		a.disabled = false;
    a.parentElement.style.color = 'black';
    
    a = document.getElementById('autoplay');
    a.disabled = false;
    a.parentElement.style.color = 'black';
    a = document.getElementById('playwhenhovering');
    a.disabled = false;
    a.parentElement.style.color = 'black';
    a = document.getElementById('playwhenclicking');
    a.disabled = false;
    a.parentElement.style.color = 'black';
		
		chrome.browserAction.setIcon({
			path: "icon_dict.png"
		})
	}
}

function check()
{
   var word = document.getElementsByName("word")[0].value;
   window.open("http://dict.youdao.com/search?q="+encodeURI(word)+"&ue=utf8&keyfrom=chrome.index");
}
function restore_options()
{
    var localOptions = JSON.parse(localStorage["ColorOptions"]);
    
    for (key in localOptions)
    {
        optionValue = localOptions[key];
        if (!optionValue) return;
        var element = document.getElementById(key);
        if (element)
        {
            element.value = localOptions[key][1];
            switch (localOptions[key][0])
            {
            case "checked":
                if (localOptions[key][1]) element.checked = true;
                else element.checked = false;
                break;
            }
        }
    }
    
}

document.body.onload =  function () { restore_options();document.getElementById('word').focus();changeIcon(); };
document.getElementById("dict_disable").onclick = function () {save_options();};
document.getElementById("ctrl_only").onclick = function () { save_options();};
document.getElementById("english_only").onclick= function () { save_options();};
document.getElementById("autoplay").onclick= function () { save_options();};
document.getElementById("playwhenhovering").onclick= function () { save_options();};
document.getElementById("playwhenclicking").onclick= function () { save_options();};
document.getElementById("feedback").onclick = function () {goFeedback();};
document.getElementById("about").onclick = function () {goAbout();};
document.getElementById("word").onkeydown = function () { if(event.keyCode==13)mainQuery(document.getElementsByName("word")[0].value,translateXML); };
document.getElementById("querybutton").onclick = function () { mainQuery(document.getElementsByName("word")[0].value,translateXML); };

// todo start
document.getElementById("autoaddword").onclick = function () {save_options();};
document.getElementById("btnlogin").onclick = function () {goLogin();};
document.getElementById("btnlogout").onclick = function () {goLogout();};
document.getElementById("btnwordlist").onclick = function () {goWordList();};

function goWordList(){
	window.open("http://dict.youdao.com/wordbook/wordlist");
}
function goLogin() {
	chrome.runtime.sendMessage({
		action : 'openlogin'
	},function(response){
		console.log(response);
	});
}

function goLogout(){

	chrome.runtime.sendMessage({
		action : 'openlogout'
	},function(response){
		console.log(response);
	});
}
// todo end

