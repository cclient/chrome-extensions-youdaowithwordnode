/**
 * @author Dongxu Huang
 * @date   2010-2-21
 */

function isSelectionInFormElement() {
  var selection_element = document.activeElement;
  if (!selection_element)
    return false;
  var tag_name = selection_element.tagName.toLowerCase();
  return tag_name == 'input' || tag_name == 'textarea' || tag_name == 'select' || tag_name == 'button';
}

function getSelectionRange() {
  var sel = document.selection, range = null;
  var width = 0, height = 0, left = 0, top = 0;
  if (sel) {
    if (sel.type != "Control") {
      range = sel.createRange();
    }
  } else if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
    }
  }
  return range;
}

function isPDF() {
  var plugin = document.getElementById('plugin');
  if (!plugin)
    return false;
  if (plugin.tagName.toLowerCase() != 'embed')
    return false;
  if (plugin.type.toLowerCase() != 'application/pdf')
    return false;
  return true;
}

function getSelectionEndPosition() {
  if (isPDF()) {
    if (window.pdfSelectTextRect &&
        window.pdfSelectTextRect.upX &&
        window.pdfSelectTextRect.upY) {
      var res = {
          x: window.pdfSelectTextRect.upX,
          y: window.pdfSelectTextRect.upY
      };
      if (window.pdfSelectTextRect.downX && window.pdfSelectTextRect.downY) {
        res.x = Math.max(window.pdfSelectTextRect.downX,
            window.pdfSelectTextRect.upX);
        res.y = Math.max(window.pdfSelectTextRect.downY,
            window.pdfSelectTextRect.upY);
      }
      return res;
    }
  }
  var range = getSelectionRange();
  if (!range)
    return null;
  var sel = document.selection;
  var x = 0, y = 0;
  if (sel) {
    if (sel.type != "Control") {
    }
  } else if (window.getSelection) {
    if (isSelectionInFormElement()) {
      var selection_element = document.activeElement;
      if (!selection_element)
        return { x: x, y: y };
      var selection_start = selection_element.selectionStart;
      var selection_end = selection_element.selectionEnd;
      var form_element_selection_rect = getTextBoundingRect(
          selection_element, selection_start, selection_end, false);
      x = form_element_selection_rect.right;
      y = form_element_selection_rect.bottom;
      return { x: x, y: y };
    }

    var endNode = range.endContainer;
    var endRange = document.createRange();
    endRange.setStart(endNode, 0);
    endRange.setEnd(endNode, range.endOffset);
    var endRangeRect = endRange.getClientRects()[endRange.getClientRects().length - 1];
    var ebdRangeRect2;
    if (endRange.getClientRects().length > 1) {
      endRangeRect2 = endRange.getClientRects()[endRange.getClientRects().length - 2];
    }
    if (endRangeRect.left === endRangeRect.right && endRangeRect2) {
      x = endRangeRect2.right;
      y = endRangeRect2.bottom;
    } else {
      x = endRangeRect.right;
      y = endRangeRect.bottom;
    }
  }
  return { x: x, y: y };
}

function getSelectionDimensions() {
  var range = getSelectionRange();
  if (!range)
    return null;
  var sel = document.selection;
  var width = 0, height = 0, left = 0, top = 0;
  if (sel) {
    if (sel.type != "Control") {
      width = range.boundingWidth;
      height = range.boundingHeight;
      left = range.boundingLeft;
      top = range.boundingTop;
    }
  } else if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      if (range.getBoundingClientRect) {
        var rect = range.getBoundingClientRect();
        width = rect.right - rect.left;
        height = rect.bottom - rect.top;
        left = rect.left;
        top = rect.top;
      }
    }
  }
  return { width: width , height: height, left: left, top: top };
}

function getTextBoundingRect(input, selectionStart, selectionEnd, debug) {
    // Basic parameter validation
    if(!input || !('value' in input)) return input;
    if(typeof selectionStart == "string") selectionStart = parseFloat(selectionStart);
    if(typeof selectionStart != "number" || isNaN(selectionStart)) {
        selectionStart = 0;
    }
    if(selectionStart < 0) selectionStart = 0;
    else selectionStart = Math.min(input.value.length, selectionStart);
    if(typeof selectionEnd == "string") selectionEnd = parseFloat(selectionEnd);
    if(typeof selectionEnd != "number" || isNaN(selectionEnd) || selectionEnd < selectionStart) {
        selectionEnd = selectionStart;
    }
    if (selectionEnd < 0) selectionEnd = 0;
    else selectionEnd = Math.min(input.value.length, selectionEnd);

    // If available (thus IE), use the createTextRange method
    if (typeof input.createTextRange == "function") {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveStart('character', selectionStart);
        range.moveEnd('character', selectionEnd - selectionStart);
        return range.getBoundingClientRect();
    }
    // createTextRange is not supported, create a fake text range
    var offset = getInputOffset(),
        topPos = offset.top,
        leftPos = offset.left,
        width = getInputCSS('width', true),
        height = getInputCSS('height', true);

        // Styles to simulate a node in an input field
    var cssDefaultStyles = "white-space:pre;padding:0;margin:0;",
        listOfModifiers = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing'];

    topPos += getInputCSS('padding-top', true);
    topPos += getInputCSS('border-top-width', true);
    leftPos += getInputCSS('padding-left', true);
    leftPos += getInputCSS('border-left-width', true);
    leftPos += 1; //Seems to be necessary

    for (var i=0; i<listOfModifiers.length; i++) {
        var property = listOfModifiers[i];
        cssDefaultStyles += property + ':' + getInputCSS(property) +';';
    }
    // End of CSS variable checks

    var text = input.value,
        textLen = text.length,
        fakeClone = document.createElement("div");
    if(selectionStart > 0) appendPart(0, selectionStart);
    var fakeRange = appendPart(selectionStart, selectionEnd);
    if(textLen > selectionEnd) appendPart(selectionEnd, textLen);

    // Styles to inherit the font styles of the element
    fakeClone.style.cssText = cssDefaultStyles;

    // Styles to position the text node at the desired position
    fakeClone.style.position = "absolute";
    fakeClone.style.top = topPos + "px";
    fakeClone.style.left = leftPos + "px";
    fakeClone.style.width = width + "px";
    fakeClone.style.height = height + "px";
    document.body.appendChild(fakeClone);
    var returnValue = fakeRange.getBoundingClientRect(); //Get rect

    if (!debug) fakeClone.parentNode.removeChild(fakeClone); //Remove temp
    return returnValue;

    // Local functions for readability of the previous code
    function appendPart(start, end){
        var span = document.createElement("span");
        span.style.cssText = cssDefaultStyles; //Force styles to prevent unexpected results
        span.textContent = text.substring(start, end);
        fakeClone.appendChild(span);
        return span;
    }
    // Computing offset position
    function getInputOffset(){
        var body = document.body,
            win = document.defaultView,
            docElem = document.documentElement,
            box = document.createElement('div');
        box.style.paddingLeft = box.style.width = "1px";
        body.appendChild(box);
        var isBoxModel = box.offsetWidth == 2;
        body.removeChild(box);
        box = input.getBoundingClientRect();
        var clientTop  = docElem.clientTop  || body.clientTop  || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
            scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
        return {
            top : box.top  + scrollTop  - clientTop,
            left: box.left + scrollLeft - clientLeft};
    }
    function getInputCSS(prop, isnumber){
        var val = document.defaultView.getComputedStyle(input, null).getPropertyValue(prop);
        return isnumber ? parseFloat(val) : val;
    }
}

(function () {

var isEditableElement = function (el) {
        if (!el) {
            return false;
        }
        var tag = el.tagName;

        return tag === 'INPUT' || tag === 'TEXTAREA' ||
              (typeof el.getAttribute == 'function' && el.getAttribute('contenteditable') != null);
    },
    isRangeInEditArea = function (range) {
        if (!range) {
            return false;
        }
        var common = range.commonAncestorContainer,
            el;
        if (common.nodeType != 1) {
            common = common.parentNode;
        }
        if (!common || common.nodeType !== 1) {
            return false;
        }

        el = common;

        while (el) {
            if (isEditableElement(el)) {
                return true;
            }
            el = el.parentNode;
        }

        return false;
    };

if (top.window === window) {
  //window.previousFocus = null;
  window.addEventListener('focus', function () {
    if (top.window.previousFocus && !isPDF()) {
      //window.previousFocus.getSelection().removeAllRanges();
      top.window.previousFocus.OnCheckCloseWindowForce();

    }
    top.window.previousFocus = this;
  }, false);
} else {
  window.addEventListener('focus', function () {
    if (top.window.previousFocus && !isPDF()) {

      top.window.previousFocus.OnCheckCloseWindowForce();

    }
    top.window.previousFocus = this;
  }, false);
}

})();

var _rlog = [];
_rlog.push(["_setAccount" , "deskdict"]);
_rlog.push(["_setAutoPageview" , false]);
_rlog.push(["_addPost", "keyfrom", "dict_huaci"]);

var body =  document.getElementsByTagName("body")[0];
var g_bDisable = false;
var Options = null;
var last_frame = null;
var last_div = null;
var div_num = 0;
var xx,yy,sx,sy;
var list = new Array();
var last_time = 0;
var last_request_time = 0;

var styleInsert = document.createElement("style"),
styleContent = document.createTextNode("#yddContainer{display:block;font-family:Microsoft YaHei;position:relative;width:100%;height:100%;top:-4px;left:-4px;font-size:12px;border:1px solid}#yddTop{display:block;height:22px}#yddTopBorderlr{display:block;position:static;height:17px;padding:2px 28px;line-height:17px;font-size:12px;color:#5079bb;font-weight:bold;border-style:none solid;border-width:1px}#yddTopBorderlr .ydd-sp{position:absolute;top:2px;height:0;overflow:hidden}.ydd-icon{left:5px;width:17px;padding:0px 0px 0px 0px;padding-top:17px;background-position:-16px -44px}.ydd-close{right:5px;width:16px;padding-top:16px;background-position:left -44px}#yddKeyTitle{float:left;text-decoration:none}#yddMiddle{display:block;margin-bottom:10px}.ydd-tabs{display:block;margin:5px 0;padding:0 5px;height:18px;border-bottom:1px solid}.ydd-tab{display:block;float:left;height:18px;margin:0 5px -1px 0;padding:0 4px;line-height:18px;border:1px solid;border-bottom:none}.ydd-trans-container{display:block;line-height:160%}.ydd-trans-container a{text-decoration:none;}#yddBottom{position:absolute;bottom:0;left:0;width:100%;height:22px;line-height:22px;overflow:hidden;background-position:left -22px}.ydd-padding010{padding:0 10px}#yddWrapper{color:#252525;z-index:10001;background:url("+chrome.extension.getURL("ab20.png")+");}#yddContainer{background:#fff;border-color:#4b7598}#yddTopBorderlr{border-color:#f0f8fc}#yddWrapper .ydd-sp{background-image:url("+chrome.extension.getURL("ydd-sprite.png")+")}#yddWrapper a,#yddWrapper a:hover,#yddWrapper a:visited{color:#50799b}#yddWrapper .ydd-tabs{color:#959595}.ydd-tabs,.ydd-tab{background:#fff;border-color:#d5e7f3}#yddBottom{color:#363636}#yddWrapper{min-width:250px;max-width:400px;}");
styleInsert.type = "text/css";
if (styleInsert.styleSheet) styleInsert.styleSheet.cssText = styleContent.nodeValue;
else {
  styleInsert.appendChild(styleContent);
}
document.documentElement.appendChild(styleInsert)

chrome.extension.sendRequest(
    {
        init: "init"
    },
    function(response)
    {
        if (response.ColorOptions)
        {
            Options = JSON.parse(response.ColorOptions);
        }
    }
);
body.addEventListener("mouseup",OnDictEvent, false);
body.addEventListener("mousedown",OnDictEventMouseDown, false);
body.addEventListener("touchend",OnDictEvent, false);
body.addEventListener("touchstart",OnDictEventMouseDown, false);

// todo start

document.addEventListener("click", function (event) {
    if (event.target.getAttribute("id") == "btnaddword") {
        var word = document.getElementById("yddKeyTitle").innerText;
        var posteventloopdata = {
            data: word
        };
        posteventloopdata.action=(event.altKey==true)?"delword":"addword";
        chrome.runtime.sendMessage(posteventloopdata, function (response) {
            console.log(response);
            if(response&&!response.error){
                if(response.result=="addsuccess"){
                    event.target.innerText = "Add Success";
                }else if(response.result=="delsuccess"){
                    event.target.innerText = "Del Success";
                }
            }
        });
    }
}, false);
// todo end
var timer, prevC, prevO, prevWord, c ;
var isAlpha = function(str){return /[a-zA-Z']+/.test(str)};
var scr_flag = false;
function onScrTrans(event){
    if(!optVal("ctrl_only"))
    {
      return;
    }
    if (!event.ctrlKey){
        return true;
    }

    var r = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!r) return true;

    pX = event.pageX;
    pY = event.pageY;
    var so = r.startOffset, eo = r.endOffset;
    if (prevC === r.startContainer && prevO === so) return true

    prevC = r.startContainer;
    prevO = so;
    var tr = r.cloneRange(), text='';
    if (r.startContainer.data) while (so >= 1){
        tr.setStart(r.startContainer, --so);
        text = tr.toString();
        if (!isAlpha(text.charAt(0))){
            tr.setStart(r.startContainer, so + 1);
            break;
        }
    }
    if (r.endContainer.data) while (eo < r.endContainer.data.length){
        tr.setEnd(r.endContainer, ++eo);
        text = tr.toString();
        if (!isAlpha(text.charAt(text.length - 1))){
            tr.setEnd(r.endContainer, eo - 1);
            break;
        }
    }

    var word = tr.toString();

    if (prevWord == word  ) return true;

    prevWord = word;


    if (word.length >= 1){

		timer = setTimeout(function(){
		scr_flag = true;
		var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(tr);
        xx = event.pageX,yy = event.pageY, sx = event.screenX, sy = event.screenY;
		getYoudaoDict(word,event.pageX,event.pageY,event.screenX,event.screenY);
        }, 100);
    }
}
document.addEventListener('mousemove', onScrTrans, true);


function optVal(strKey)
{
    if (Options !== null)
    {
        if (Options[strKey] && Options[strKey].length > 1)
          return Options[strKey][1];
    }
}

function tool_disable()
{
  g_bDisable = true;
}
function isEnglish(s)
{
    for(var i=0;i<s.length;i++)
    {
        if(s.charCodeAt(i)>126)
        {
            return false;
        }
    }
    return true;
}
document.onkeydown=function(e) {
  if (e.ctrlKey){
        return true;
  }
  if(optVal("ctrl_only"))
  {
    return;
  }
  e=e || window.event;
  var key=e.keyCode || e.which;
  OnCheckCloseWindow();
}
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

function isKoera(chr) {

	if(((chr > 0x3130 && chr < 0x318F) ||
	    (chr >= 0xAC00 && chr <= 0xD7A3)))
	{
		return true;
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
function isContainChinese2(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isChinese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 0 && temp.length<=3) return true;
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
function ExtractEnglish(word)
{
	var patt1 = new RegExp(/([a-zA-Z ]+)/);

	var result = patt1.exec(word) ? patt1.exec(word)[1] : '';

	return result;
}
function spaceCount(temp)
{
	var cnt=0;
	for (var i=0;i<temp.length ; i++)
	{
		if(temp.charAt(i) == ' ')
			cnt++;
	}
	return cnt;
}

window.addEventListener('message',function(event) {
  if (event && typeof event.data == 'object' && event.data.type == 'getSelectedTextReply') {
    window.pdfSelectText = event.data.selectedText;
    window.pdfSelectTextRect = window.pdfSelectTextRect || {};
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('mouseup', true, true, window, 'custom', 0, 0, window.pdfSelectTextRect.upX, window.pdfSelectTextRect.upY, false, false, false, false, 0, null);
    body.dispatchEvent(event);
  }
},false);

function OnDictEventMouseDown(e) {
  window.pdfSelectTextRect = window.pdfSelectTextRect || {};
  window.pdfSelectTextRect.downX = e.clientX;
  window.pdfSelectTextRect.downY = e.clientY;
  window.pdfSelected = true;
}

function OnDictEvent(e) {
  if (isPDF() && pdfSelected) {
    var plugin = document.getElementById('plugin');
    plugin.postMessage({'type': 'getSelectedText'});
    window.pdfSelectTextRect = window.pdfSelectTextRect || {};
    window.pdfSelectTextRect.upX = e.clientX;
    window.pdfSelectTextRect.upY = e.clientY;
    window.pdfSelected = false;
    return;
  }

  /*read options*/
  chrome.extension.sendRequest(
	    {
	        init: "init"
	    },
	    function(response)
	    {
	        if (response.ColorOptions)
	        {
	            Options = JSON.parse(response.ColorOptions);
	        }
	    }
  );
  if(in_div) return;
  OnCheckCloseWindow();

  if(optVal("dict_disable"))
    return;
  if(!optVal("ctrl_only") && e.ctrlKey)
    return;
  if(optVal("ctrl_only") && !e.ctrlKey)
    return;
  if(g_bDisable)
    return;
  var word = String(window.getSelection());
  word = word.replace(/^\s*/, "").replace(/\s*$/, "");
  if (window.pdfSelectText) {
    word = window.pdfSelectText;
  }

  if(word=="") return;

  if ( (optVal("english_only") && isContainJapanese(word)) ||
	   (optVal("english_only") && isContainKoera(word))  ||
	   (optVal("english_only") && isContainChinese(word))
	   )
  	return ;


  if(word.length > 2000)
  	return;

  if( 	(!isContainChinese(word) && spaceCount(word) >= 3)
        || (isContainChinese(word) && word.length >4)
		    || isContainJapanese(word) && word.length >4)
  {
  	xx = e.pageX,yy = e.pageY, sx = e.screenX, sy = e.screenY;
    if (isPDF()) {
      xx = window.pdfSelectTextRect.upX;
      yy = window.pdfSelectTextRect.upY;
    }
	  getYoudaoTrans(word,e.pageX,e.pageY,e.screenX,e.screenY);
    return;
  }
  if (optVal("english_only"))
  {
	  word = ExtractEnglish(word);
  }
  // TODO: add isEnglish function
  if (word != '') {
  	OnCheckCloseWindowForce();
  	xx = e.pageX,yy = e.pageY, sx = e.screenX, sy = e.screenY;
    if (isPDF()) {
      xx = window.pdfSelectTextRect.upX;
      yy = window.pdfSelectTextRect.upY;
    }
	getYoudaoDict(word,e.pageX,e.pageY,e.screenX,e.screenY);
	return;
  }
}




function OnCheckCloseWindow() {
   isDrag =false;
   if(in_div) return;
   if (last_frame != null) {
  	var cur = Math.round(new Date().getTime());
	if (cur - last_time < 500 ) {
		return;
	}
	while (list.length != 0) {
		body.removeChild(list.pop());
	}
    last_frame = null;
    last_div = null;
    return true;
  }
  return false
}
function OnCheckCloseWindowForce() {
  in_div = false;
  if (last_frame != null) {
  	var cur = Math.round(new Date().getTime());

    while(list.length !=0)
    	body.removeChild(list.pop());

    last_frame = null;
    last_div = null;

    return true;
  }
  return false
}
function createPopUpEx(word,x,y,screenx, screeny)
{
	OnCheckCloseWindowForce();
  if (window.getSelection() && window.getSelection().rangeCount > 0)
	  createPopUp(word, window.getSelection().getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny)
  if (isPDF() && window.pdfSelectText)
    createPopUp(word, window.pdfSelectText, x, y, screenx, screeny)
}
var in_div = false;
function createPopUp(word,senctence, x, y, screenX, screenY) {
  last_word = word;

  var frame_height = 150;
  var frame_width = 300;
  var padding = 10;

  var frame_left = 0;
  var frame_top = 0;
  var frame = document.createElement('div');

  frame.id = 'yddWrapper';

  var screen_width = screen.availWidth;
  var screen_height = screen.availHeight;

  if (screenX + frame_width < screen_width) {

    frame_left = x;
  } else {
    frame_left = (x - frame_width - 2 * padding);
  }
  frame.style.left = frame_left  + 'px';

  if (screenY + frame_height + 20 < screen_height) {
    frame_top = y;
  } else {
	frame_top = (y - frame_height - 2 * padding);
  }

  //var selection_rect = getSelectionDimensions();
  var selection_end_position = getSelectionEndPosition();

  if (getSelection().toString() == '' && !isPDF()) {
    OnCheckCloseWindowForce();
    return;
  }

  frame.style.top = (selection_end_position.y + window.scrollY) + 'px';
  frame.style.left = (selection_end_position.x + window.scrollX) + 'px';
  frame.style.position = 'absolute';
  frame.style.zIndex = 2147483648;

  if (frame.style.left + frame_width > screen_width)
  {
  	frame.style.left -=  frame.style.left +frame_width - screen_width;
  }
  frame.innerHTML += word ;
  frame.onmouseover = function(e){in_div = true;};
  frame.onmouseout = function(e){in_div = false;};
  body.style.position = "static";
  body.appendChild(frame);
  document.getElementById("test").onclick = function(e){ OnCheckCloseWindowForce();};
  document.getElementById("test").onmousemove = function(e){frame.style.cursor='default';};
  document.getElementById("yddTop").onmousedown = dragDown;
  document.getElementById("yddTop").onmouseup = dragUp;
  document.getElementById("yddTop").onmousemove = dragMove;
  document.getElementById("yddTop").onmouseover = function(e){frame.style.cursor='move';};
  document.getElementById("yddTop").onmouseout = function(e){frame.style.cursor='default';};

  if (document.getElementById("voice") != null) {
  	var speach_swf = document.getElementById("voice");
  	if (speach_swf.innerHTML != '') {
		//speach_swf.innerHTML = insertaudio("http://dict.youdao.com/speech?audio=" + speach_swf.innerHTML, "test", "CLICK", "dictcn_speech");
    insertSpeech(speach_swf, document.getElementById('yddKeyTitle').innerText);
		var speach_flash = document.getElementById("speach_flash");
		if(speach_flash != null)
		{
			try {
				speach_flash.StopPlay();
			}
			catch(err)
			{
				;
			}
		}
	}
  }
  list.push(frame);
  var leftbottom = frame_top + 10 + document.getElementById("yddWrapper").clientHeight;

  if( leftbottom  < y)
  {
  	 var newtop = y - document.getElementById("yddWrapper").clientHeight;
  	 frame.style.top = newtop + 'px';
  }
  if(last_frame!=null)
  {
  	if (last_frame.style.top == frame.style.top && last_frame.style.left == frame.style.left) {
		body.removeChild(frame);
		list.pop();
		return;
	}
  }
  last_time = Math.round(new Date().getTime());
  last_frame = frame;
  div_num++;

  if (frame.getBoundingClientRect().bottom > body.getBoundingClientRect().height &&
      frame.getBoundingClientRect().height < body.getBoundingClientRect().height &&
      frame.getBoundingClientRect().bottom > body.scrollHeight) {
    frame.style.top = 'auto';
    frame.style.bottom = 0;
  }
  if (frame.getBoundingClientRect().right > body.getBoundingClientRect().width &&
      frame.getBoundingClientRect().width < body.getBoundingClientRect().width &&
      frame.getBoundingClientRect().right > body.scrollWidth) {
    frame.style.left = 'auto';
    frame.style.right = 0;
  }
  if (frame.getBoundingClientRect().bottom > window.innerHeight) {
    frame.style.top = 'auto';
    frame.style.bottom = (-body.scrollTop) + 'px';
  }
  if (frame.getBoundingClientRect().right > window.innerWidth) {
    frame.style.left = 'auto';
    frame.style.right = (-body.scrollLeft) + 'px';
  }
}

function insertaudio(a, query, action, type){
//return  '<object type="application/x-shockwave-flash" data="' + a '"width="15px" height="15px" align="absmiddle" id="speach_flash">' +'<param name="allowScriptAccess" value="sameDomain" />' +'<param name="movie" value="http://cidian.youdao.com/chromeplus/voice.swf" />' +'<param name="loop" value="false" />' +'<param name="menu" value="false" />' +'<param name="quality" value="high" />' +'<param name="wmode"  value="transparent">'+'<param name="FlashVars" value="audio=' + a + '">' +'<embed wmode="transparent" src="http://cidian.youdao.com/chromeplus/voice.swf" loop="false" menu="false" quality="high" bgcolor="#ffffff" width="15" height="15" align="absmiddle" allowScriptAccess="sameDomain" FlashVars="audio=' + a + '" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />' +'</object>' ;
}

function insertSpeech(speechObject, word) {
  speechObject.style.width = '13px';
  speechObject.style.height = '16px';
  speechObject.style.display = 'inline-block';
  speechObject.style.verticalAlign = 'top';
  speechObject.style.cursor = 'pointer';
  speechObject.style.backgroundRepeat = 'no-repeat';
  speechObject.style.backgroundImage = 'url(' + chrome.extension.getURL('speech.png') + ')';
  speechObject.innerHTML = '';
  if (optVal("autoplay")) {
    setAutoPlay();
	playAudio('http://dict.youdao.com/dictvoice?audio=' + word + '&type=1')
  }

  if (optVal("playwhenhovering")) {
    speechObject.onmouseover = function () {
      playAudio('http://dict.youdao.com/dictvoice?audio=' + word + '&type=1')
    }
  }
  if (optVal("playwhenclicking")) {
    speechObject.onclick = function () {
      playAudio('http://dict.youdao.com/dictvoice?audio=' + word + '&type=1')
    }
  }
}

var isDrag =false;
var px = 0;
var py=0;

function dragMove(e)
{
	if (!last_frame)
    return;
	if(isDrag)
	{
		var myDragDiv = last_frame;
		myDragDiv.style.pixelLeft = px + e.x;
        myDragDiv.style.pixelTop = py + e.y;
	}
}
function dragDown(e)
{
	var oDiv = last_frame;
  if (!last_frame)
    return;

	px = oDiv.style.pixelLeft - e.x;
    py = oDiv.style.pixelTop - e.y;
	isDrag = true;
}
function dragUp(e)
{
  if (!last_frame)
    return;
	var oDiv = last_frame;

	isDrag = false;
}
function onText(data)
{

	createPopUpEx(data,xx,yy,sx,sy);
}
function getYoudaoDict(word,x,y,screenx,screeny){
	// chrome.extension.sendRequest({'action' : 'dict' , 'word': word , 'x' : x, 'y':y , 'screenX' : screenx, 'screenY': screeny}, onText);
    // todo start
    chrome.extension.sendRequest({
        'action': 'dict',
        'word': word,
        'x': x,
        'y': y,
        'screenX': screenx,
        'screenY': screeny
    }, function (data) {
        onText(data);
        if (optVal("autoaddword")) {
            //这样写,能保证成功就是成功,数据一致,但有dom操作
            //也可以,直接拼好带成功提示的弹窗的自符串,直接显示.
            chrome.runtime.sendMessage({
                action: "addword",
                data: word
            }, function (response) {
                var btn = document.getElementById("btnaddword")
                btn != null && (btn.innerText = "Add Success");
            });
        }
    });
    // todo end

}
function getYoudaoTrans(word,x,y,screenx,screeny){
	chrome.extension.sendRequest({'action' : 'translate' , 'word': word , 'x' : x, 'y':y , 'screenX' : screenx, 'screenY': screeny}, onText);
}


