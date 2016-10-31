var DefaultOptions =
{
    "dict_disable": ["checked", false],
    "ctrl_only": ["checked", false],
    "english_only": ["checked", true],
    "autoplay": ["checked", false],
    "playwhenhovering": ["checked", true],
    "playwhenclicking": ["checked", false]
};

var DictTranslate = {
    "return-phrase": "",
    "lang": "",
    "translation": [],
}
var ColorsChanged = true;

if (localStorage["ColorOptions"] == undefined) {
    localStorage["ColorOptions"] = JSON.stringify(DefaultOptions);
}


var startupOptions = JSON.parse(localStorage["ColorOptions"]);

initIcon();

sprintfWrapper = {

    init: function () {

        if (typeof arguments == "undefined") {
            return null;
        }
        if (arguments.length < 1) {
            return null;
        }
        if (typeof arguments[0] != "string") {
            return null;
        }
        if (typeof RegExp == "undefined") {
            return null;
        }

        var string = arguments[0];
        var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
        var matches = new Array();
        var strings = new Array();
        var convCount = 0;
        var stringPosStart = 0;
        var stringPosEnd = 0;
        var matchPosEnd = 0;
        var newString = '';
        var match = null;

        while (match = exp.exec(string)) {
            if (match[9]) {
                convCount += 1;
            }

            stringPosStart = matchPosEnd;
            stringPosEnd = exp.lastIndex - match[0].length;
            strings[strings.length] = string.substring(stringPosStart, stringPosEnd);

            matchPosEnd = exp.lastIndex;
            matches[matches.length] = {
                match: match[0],
                left: match[3] ? true : false,
                sign: match[4] || '',
                pad: match[5] || ' ',
                min: match[6] || 0,
                precision: match[8],
                code: match[9] || '%',
                negative: parseInt(arguments[convCount]) < 0 ? true : false,
                argument: String(arguments[convCount])
            };
        }
        strings[strings.length] = string.substring(matchPosEnd);

        if (matches.length == 0) {
            return string;
        }
        if ((arguments.length - 1) < convCount) {
            return null;
        }

        var code = null;
        var match = null;
        var i = null;

        for (i = 0; i < matches.length; i++) {

            if (matches[i].code == '%') {
                substitution = '%'
            }
            else if (matches[i].code == 'b') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
                substitution = sprintfWrapper.convert(matches[i], true);
            }
            else if (matches[i].code == 'c') {
                matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
                substitution = sprintfWrapper.convert(matches[i], true);
            }
            else if (matches[i].code == 'd') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
                substitution = sprintfWrapper.convert(matches[i]);
            }
            else if (matches[i].code == 'f') {
                matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
                substitution = sprintfWrapper.convert(matches[i]);
            }
            else if (matches[i].code == 'o') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
                substitution = sprintfWrapper.convert(matches[i]);
            }
            else if (matches[i].code == 's') {
                matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
                substitution = sprintfWrapper.convert(matches[i], true);
            }
            else if (matches[i].code == 'x') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
                substitution = sprintfWrapper.convert(matches[i]);
            }
            else if (matches[i].code == 'X') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
                substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
            }
            else {
                substitution = matches[i].match;
            }

            newString += strings[i];
            newString += substitution;

        }
        newString += strings[i];

        return newString;

    },

    convert: function (match, nosign) {
        if (nosign) {
            match.sign = '';
        } else {
            match.sign = match.negative ? '-' : match.sign;
        }
        var l = match.min - match.argument.length + 1 - match.sign.length;
        var pad = new Array(l < 0 ? 0 : l).join(match.pad);
        if (!match.left) {
            if (match.pad == "0" || nosign) {
                return match.sign + pad + match.argument;
            } else {
                return pad + match.sign + match.argument;
            }
        } else {
            if (match.pad == "0" || nosign) {
                return match.sign + match.argument + pad.replace(/0/g, ' ');
            } else {
                return match.sign + match.argument + pad;
            }
        }
    }
}

sprintf = sprintfWrapper.init;

// todo start
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    // if (message.action == "addword" || message.action == "delword") {
    //     var url = 'http://dict.youdao.com/wordbook/ajax?action=';
    //     if (message.action == "addword") {
    //         url += 'addword';
    //     } else {
    //         url += 'delword';
    //     }
    //     url += '&q=' + encodeURIComponent(message.data) + '&date=' + new Date() + '&le=eng';
    //     var xhr = new XMLHttpRequest();
    //     xhr.onreadystatechange = function () {
    //         if (xhr.readyState == 4) {
    //             if (xhr.status == 200) {
    //                 var jinfo = JSON.parse(xhr.responseText);
    //                 //添加成功和删除成功的返回值不同
    //                 if (jinfo.message == "adddone") {
    //                     sendResponse({result: "addsuccess"});
    //                 } else if (jinfo.success == "1") {
    //                     sendResponse({result: "delsuccess"});
    //                 } else if (jinfo.message == "nouser") {
    //                     showWindow("http://account.youdao.com/login");
    //                 } else {
    //                     sendResponse(jinfo);
    //                 }
    //             } else {
    //                 sendResponse({error: "status " + status});
    //             }
    //         }
    //     }
    //     xhr.open('GET', url, true);
    //     xhr.send();
    // }
    // if (message.action == "addword") {
    if (message.action == "addword" || message.action == "delword") {

            var url = 'http://dict.youdao.com/wordbook/ajax?action=';
            if (message.action == "delword") {
                url += 'delword';
            } else {
                url += 'addword';
            }
            url += '&q=' + encodeURIComponent(message.data) + '&date=' + new Date() + '&le=eng';

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var jinfo = JSON.parse(xhr.responseText)
                    if (jinfo.message == "nouser") {
                        showLWindow("http://account.youdao.com/login")
                    } else {
                        if (jinfo.message == "adddone") {
                            sendResponse({result: "addsuccess"})
                        }else if (jinfo.success == "1") {
                            sendResponse({result: "delsuccess"});
                        }
                    }
                } else {
                    sendResponse({error: "error "+"  "+xhr.readyState +" "+xhr.status});
                }
            }
        }
        xhr.open('GET', url, false);
        xhr.send();
    }
    if (message.action == "openlogin") {
        showLWindow("http://account.youdao.com/login")
    }
    if (message.action == "openlogout") {
        chrome.cookies.getAll({}, function (cookies) {
            for (var i in cookies) {
                if (cookies[i].domain == "dict.youdao.com" || cookies[i].domain == ".youdao.com") {
                    removeCookie(cookies[i])
                }
            }
        });
    }
});
function showLWindow(url)
{
	var w = 400;
	var h = 400;
	chrome.windows.create({
		url: url,
		type: "popup",
		width: w,
		height: h,
		left: Math.floor(screen.width / 2 - (w + 1) / 2),
		top: Math.floor(screen.height / 2 - h / 2)
	});
}
// todo end
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.init == "init" && ColorsChanged == true) {
            sendResponse(
                {
                    init: "globalPages",
                    ChangeColors: "true",
                    ColorOptions: localStorage["ColorOptions"]
                }
            );
        }
    }
);


function genTable(word, strpho, baseTrans, webTrans) {
    var lan = '';
    if (isContainKoera(word)) {
        lan = "&le=ko";
    }
    if (isContainJapanese(word)) {
        lan = "&le=jap";
    }
    var title = word;
    if ((isContainChinese(title) || isContainJapanese(title) || isContainKoera(title)) && title.length > 15) {
        title = title.substring(0, 10) + '...';
    }
    if (title.length > 25) {
        title = title.substring(0, 15) + ' ...';
    }
    var fmt = '';
    if (noBaseTrans && noWebTrans) {

        fmt = '<div id="yddContainer" align=left style="padding:0px 0px 0px 0px;">' +
            '    <div id="yddTop" class="ydd-sp"><div id="yddTopBorderlr"><a href="http://dict.youdao.com/search?q=' +
            encodeURIComponent(word) +
            '&keyfrom=chrome.extension' +
            lan +
            '" title="查看完整释义" class="ydd-sp ydd-icon" style="padding:0px 0px 0px 0px;padding-top:17px;" target=_blank></a> <a href="http://dict.youdao.com/search?q=' +
            encodeURIComponent(word) +
            '&keyfrom=chrome.extension' +
            lan +
            '" target=_blank title="查看完整释义" id="yddKeyTitle">' +
            title +
            '</a>&nbsp;<span style="font-weight:normal;font-size:10px;">' +
            strpho +
            '</span><span style="float:right;font-weight:normal;font-size:10px"><a href="http://www.youdao.com/search?q=' +
            encodeURIComponent(word) +
            '&ue=utf8&keyfrom=chrome.extension" target=_blank>详细</a></span><a id="test"><span class="ydd-sp ydd-close">X</span></a></div></div>' +
            '    <div id="yddMiddle">';
    }
    else {
        fmt = '<div id="yddContainer" align=left style="padding:0px 0px 0px 0px;">' +
            '    <div id="yddTop" class="ydd-sp"><div id="yddTopBorderlr"><a href="http://dict.youdao.com/search?q=' +
            encodeURIComponent(word) +
            '&keyfrom=chrome.extension' +
            lan +
            '" title="查看完整释义" class="ydd-sp ydd-icon" style="padding:0px 0px 0px 0px;padding-top:17px;" target=_blank></a> <a href="http://dict.youdao.com/search?q=' +
            encodeURIComponent(word) +
            '&keyfrom=chrome.extension' +
            lan +
            '" target=_blank title="查看完整释义" id="yddKeyTitle">' +
            title +
            '</a>&nbsp;<span style="font-weight:normal;font-size:10px;">' +
            strpho +
            '&nbsp;&nbsp;</span><span id="voice" style="padding:2px;height:15px;width:15px">' +
            speach +
            '</span><span style="float:right;font-weight:normal;font-size:10px"><a href="http://dict.youdao.com/search?q=' +
            encodeURIComponent(word) +
            '&keyfrom=chrome.extension' +
            lan +
            '" target=_blank>详细</a></span><a id="test"><span class="ydd-sp ydd-close">X</span></a></div></div>' +
            '    <div id="yddMiddle">';
    }
    if (noBaseTrans == false) {
        var base =
            '  <div class="ydd-trans-wrapper" style="display:block;padding:0px 0px 0px 0px" id="yddSimpleTrans">' +
            // '        <div class="ydd-tabs"><span class="ydd-tab">基本翻译</span></div>' +
            //  todo start
            '        <div class="ydd-tabs"><span class="ydd-tab">基本翻译 &nbsp &nbsp &nbsp &nbsp<a href="javascript:void(0)" id="btnaddword">+生词本</a></span></div>' +
            //  todo end
            '        %s' +
            '	</div>';
        base = sprintf(base, baseTrans);
        fmt += base;
    }
    if (noWebTrans == false) {
        var web =
            '       <div class="ydd-trans-wrapper" style="display:block;padding:0px 0px 0px 0px">' +
            '        <div class="ydd-tabs"><span class="ydd-tab">网络释义</span></div>' +
            '        %s' +
            '      </div>';
        web = sprintf(web, webTrans);
        fmt += web;
    }
    if (noBaseTrans && noWebTrans) {
        fmt += '&nbsp;&nbsp;没有英汉互译结果<br/>&nbsp;&nbsp;<a href="http://www.youdao.com/search?q=' + encodeURIComponent(word) + '&ue=utf8&keyfrom=chrome.extension" target=_blank>请尝试网页搜索</a>';
    }
    fmt += '   </div>' +
        '  </div>';

    res = fmt;
    noBaseTrans = false;
    noWebTrans = false;
    speach = '';
    //alert(res);
    return res;
}
var noBaseTrans = false;
var noWebTrans = false;
var speach = '';
function translateXML(xmlnode) {
    var translate = "<strong>查询:</strong><br/>";
    var root = xmlnode.getElementsByTagName("yodaodict")[0];

    if ("" + root.getElementsByTagName("return-phrase")[0].childNodes[0] != "undefined")
        var retphrase = root.getElementsByTagName("return-phrase")[0].childNodes[0].nodeValue;

    if ("" + root.getElementsByTagName("dictcn-speach")[0] != "undefined")
        speach = root.getElementsByTagName("dictcn-speach")[0].childNodes[0].nodeValue;

    var lang = "&le=";
    if ("" + root.getElementsByTagName("lang")[0] != "undefined")
        lang += root.getElementsByTagName("lang")[0].childNodes[0].nodeValue;
    var strpho = "";
    if ("" + root.getElementsByTagName("phonetic-symbol")[0] != "undefined") {
        if ("" + root.getElementsByTagName("phonetic-symbol")[0].childNodes[0] != "undefined")
            var pho = root.getElementsByTagName("phonetic-symbol")[0].childNodes[0].nodeValue;

        if (pho != null) {
            strpho = "&nbsp;[" + pho + "]";
        }
    }

    if ("" + root.getElementsByTagName("translation")[0] == "undefined") {
        noBaseTrans = true;
    }
    if ("" + root.getElementsByTagName("web-translation")[0] == "undefined") {
        noWebTrans = true;
    }

    var basetrans = "";
    var webtrans = "";
    var translations;
    var webtranslations;
    if (noBaseTrans == false) {
        if ("" + root.getElementsByTagName("translation")[0].childNodes[0] != "undefined") {
            translations = root.getElementsByTagName("translation");
        }
        else {
            noBaseTrans = true;
        }
        var i;
        for (i = 0; i < translations.length - 1; i++) {
            basetrans += '<div class="ydd-trans-container ydd-padding010">' + translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "</div>";
        }
        basetrans += '<div class="ydd-trans-container ydd-padding010">' + translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "</div>";
    }

    if (noWebTrans == false) {
        if ("" + root.getElementsByTagName("web-translation")[0].childNodes[0] != "undefined") {
            webtranslations = root.getElementsByTagName("web-translation");
        }
        else {
            noWebTrans = true;
        }
        var i;
        for (i = 0; i < webtranslations.length - 1; i++) {
            webtrans += '<div class="ydd-trans-container ydd-padding010"><a href="http://dict.youdao.com/search?q=' + encodeURIComponent(webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue) + '&keyfrom=chrome.extension' + lang + '" target=_blank>' + webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue + ":</a> ";
            webtrans += webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue + "<br /></div>";
        }
        webtrans += '<div class="ydd-trans-container ydd-padding010"><a href="http://dict.youdao.com/search?q=' + encodeURIComponent(webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue) + '&keyfrom=chrome.extension' + lang + '" target=_blank>' + webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue + ":</a> ";
        webtrans += webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue + "</div>";
    }
    return genTable(retphrase, strpho, basetrans, webtrans);
    //return translate;
}
function translateTransXML(xmlnode) {
    var s = xmlnode.indexOf("CDATA[");
    var e = xmlnode.indexOf("]]");
    var input_str = xmlnode.substring(s + 6, e);

    var remain = xmlnode.substring(e + 2, xmlnode.length - 1);
    s = remain.indexOf("CDATA[");
    e = remain.indexOf("]]");
    trans_str = remain.substring(s + 6, e);

    trans_str_tmp = trans_str.replace(/^\s*/, "").replace(/\s*$/, "");
    input_str_tmp = input_str.replace(/^\s*/, "").replace(/\s*$/, "");

    if ((isContainChinese(input_str_tmp) || isContainJapanese(input_str_tmp) || isContainKoera(input_str_tmp)) && input_str_tmp.length > 15) {
        input_str_tmp = input_str_tmp.substring(0, 8) + ' ...';
    }
    else if (input_str_tmp.length > 25) {
        input_str_tmp = input_str_tmp.substring(0, 15) + ' ...';
    }


    if (trans_str_tmp == input_str_tmp) return null;

    var res = '<div id="yddContainer" align=left style="padding:0px 0px 0px 0px;" >' +
        '    <div id="yddTop" class="ydd-sp"><div id="yddTopBorderlr"><a href="http://fanyi.youdao.com/translate?i=' + encodeURIComponent(input_str) + '&keyfrom=chrome" class="ydd-sp ydd-icon" style="padding:0px 0px 0px 0px;padding-top:17px;" target=_blank">有道词典</a><div style="font-weight:normal;display: inline;">'
        + input_str_tmp.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;") +
        '</div><span style="float:right;font-weight:normal;font-size:10px"><a href="http://fanyi.youdao.com/translate?i=' + encodeURIComponent(input_str) + '&smartresult=dict&keyfrom=chrome.extension" target=_blank>详细</a></span><a id="test"><span class="ydd-sp ydd-close">X</span></a></div></div>' +
        '    <div id="yddMiddle">' +
        '      <div class="ydd-trans-wrapper" id="yddSimpleTrans">' +
        '        <div class="ydd-trans-container ydd-padding010">' +
        trans_str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;")
        + '</div>' +
        '      ' +
        '	</div>' +
        '   </div>' +
        '  </div>';


    return res;
}
function fetchWordWithoutDeskDict(word, callback) {
    var lang = '';
    if (isContainKoera(word)) {
        lang = '&le=ko';
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {

                var dataText = translateXML(xhr.responseXML);
                if (dataText != null)
                    callback(dataText);
            } else {
                //callback(null);
            }
        }
    }
    var url = 'http://dict.youdao.com/fsearch?client=deskdict&keyfrom=chrome.extension&q=' + encodeURIComponent(word) + '&pos=-1&doctype=xml&xmlVersion=3.2&dogVersion=1.0&vendor=unknown&appVer=3.1.17.4208&le=eng'

    xhr.open('GET', url, true);
    xhr.send();
};
var _word;
var _callback;
var _timer;
function handleTimeout() {
    fetchWordWithoutDeskDict(_word, _callback);
}
function isKoera(str) {
    for (i = 0; i < str.length; i++) {
        if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
            return true;
        }
    }
    return false;
}
function isContainKoera(temp) {
    var cnt = 0;
    for (var i = 0; i < temp.length; i++) {
        if (isKoera(temp.charAt(i)))
            cnt++;
    }
    if (cnt > 0) return true;
    return false;
}
function fetchWord(word, callback) {
    if (isContainKoera(word)) {
        fetchWordWithoutDeskDict(word, callback);
        return;
    }
    var xhr = new XMLHttpRequest();
    _word = word;
    _callback = callback;
    xhr.onreadystatechange = function (data) {
        clearTimeout(_timer);
    }
    var url = 'http://127.0.0.1:8999/word=' + word + '&';
    xhr.open('GET', url, true);
    xhr.send();
    _timer = setTimeout(handleTimeout, 600);
};
function onRequest(request, sender, callback) {

    if (request.action == 'dict') {
        if (navigator.appVersion.indexOf("Win") != -1) {
            fetchWordWithoutDeskDict(request.word, callback);
        }
        else {
            fetchWordWithoutDeskDict(request.word, callback);
        }
    }
    if (request.action == 'translate') {
        fetchTranslate(request.word, callback);
    }
};


function fetchTranslate(words, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var dataText = translateTransXML(xhr.responseText);
                if (dataText != null)
                    callback(dataText);
            } else {
                //callback(null);
            }
        }
    }
    var url = "http://fanyi.youdao.com/translate?client=deskdict&keyfrom=chrome.extension&xmlVersion=1.1&dogVersion=1.0&ue=utf8&i=" + encodeURIComponent(words) + "&doctype=xml";
    xhr.open('GET', url, true);
    xhr.send();
}

chrome.extension.onRequest.addListener(onRequest);