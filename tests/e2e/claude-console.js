var R = {};

// 1. 全局 CSS 变量和字体
var body = getComputedStyle(document.body);
R.bodyFont = body.fontFamily;
R.pageBg = body.backgroundColor;

// 2. 侧栏
var nav = document.querySelector("nav");
if (nav) {
  var s = getComputedStyle(nav);
  R.sidebar = {
    tag: nav.tagName,
    cls: nav.className.slice(0, 500),
    bg: s.backgroundColor,
    w: s.width,
    borderR: s.borderRight,
    fontSize: s.fontSize,
    textArr: nav.innerText.split("\n").filter(function(l){return l.trim()}),
  };

  // 侧栏内部每个按钮
  R.sidebar.buttons = Array.from(nav.querySelectorAll("button,a")).map(function(b){
    var cs = getComputedStyle(b);
    return {
      text: (b.textContent||"").trim().slice(0,60),
      tag: b.tagName,
      bg: cs.backgroundColor,
      color: cs.color,
      fontSize: cs.fontSize,
      borderRadius: cs.borderRadius,
      padding: cs.padding,
      border: cs.border,
    };
  }).filter(function(b){return b.text && b.text.length > 1}).slice(0, 15);

  // 侧栏链接/列表项
  R.sidebar.links = Array.from(nav.querySelectorAll("a")).map(function(a){
    return {href: a.getAttribute("href"), text: (a.textContent||"").trim().slice(0,60)};
  }).filter(function(a){return a.text});
}

// 3. 顶栏
var header = document.querySelector("header");
if (header) {
  var hs = getComputedStyle(header);
  R.header = {
    bg: hs.backgroundColor,
    h: hs.height,
    borderB: hs.borderBottom,
    text: header.innerText.split("\n").filter(function(l){return l.trim()}).slice(0,10),
  };
}

// 4. 聊天消息（如果有的话）
var msgs = document.querySelectorAll("[class*=message], [class*=Message], [class*=thread]");
if (msgs.length === 0) msgs = document.querySelectorAll("[class*=prose]");
R.messageCount = msgs.length;
if (msgs.length > 0) {
  var m = msgs[0];
  var ms = getComputedStyle(m);
  R.firstMessage = {
    cls: m.className.slice(0, 200),
    fontSize: ms.fontSize,
    lineHeight: ms.lineHeight,
    color: ms.color,
    maxWidth: ms.maxWidth,
    text: m.innerText.slice(0, 200),
  };
}

// 5. 输入框
var input = document.querySelector("[contenteditable=true], [role=textbox]");
if (input) {
  var ic = input.closest("div[class]");
  if (ic) {
    var ics = getComputedStyle(ic);
    R.inputContainer = { cls: ic.className.slice(0, 300), bg: ics.backgroundColor, border: ics.border, borderRadius: ics.borderRadius, w: ics.width, maxW: ics.maxWidth };
  }
}

// 6. 聊天列表项样式
var chatItems = document.querySelectorAll("nav a[href]");
R.chatItemCount = chatItems.length;
if (chatItems.length > 0) {
  var ci = chatItems[Math.min(1, chatItems.length-1)];
  var cis = getComputedStyle(ci);
  R.chatItem = { cls: ci.className.slice(0, 200), color: cis.color, fontSize: cis.fontSize, padding: cis.padding };
}

// 7. 新聊天按钮
var newChatBtn = Array.from(document.querySelectorAll("nav button")).find(function(b){return b.textContent.match(/新|new/i)});
if (newChatBtn) {
  var ns = getComputedStyle(newChatBtn);
  R.newChatBtn = { text: newChatBtn.textContent.trim(), bg: ns.backgroundColor, color: ns.color, border: ns.border, borderRadius: ns.borderRadius, padding: ns.padding, fontSize: ns.fontSize, w: ns.width };
}

// 8. 欢迎页
var welcome = document.querySelector("[class*=welcome],[class*=empty],[class*=landing]");
if (welcome) {
  R.welcome = { text: welcome.innerText.slice(0, 600), cls: welcome.className.slice(0, 200) };
}

// 9. 用户区
var userArea = Array.from(document.querySelectorAll("nav > div")).find(function(d){return d.innerText.match(/免费|计划|plan|Free/i)});
if (userArea) {
  var us = getComputedStyle(userArea);
  R.userArea = { text: userArea.innerText.slice(0, 200), bg: us.backgroundColor, borderTop: us.borderTop };
}

console.log(JSON.stringify(R, null, 2));
