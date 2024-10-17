/*!
 * Copyright Zendesk, Inc.
 * 
 * By downloading or accessing this software, You agree to the Zendesk Terms of Service (https://www.zendesk.com/company/terms) and Application Developer and API License Agreement (https://www.zendesk.com/company/application-developer-and-api-license-agreement) and acknowledge that such terms govern Your use of and access to the software.
 * 
 */
!function(e, t) {
"object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.zChat = t() : e.zChat = t();
}(window, function() {
return function(e) {
function t(i) {
if (n[i]) return n[i].exports;
var o = n[i] = {
i: i,
l: !1,
exports: {}
};
e[i].call(o.exports, o, o.exports, t);
o.l = !0;
return o.exports;
}
var n = {};
t.m = e;
t.c = n;
t.d = function(e, n, i) {
t.o(e, n) || Object.defineProperty(e, n, {
enumerable: !0,
get: i
});
};
t.r = function(e) {
"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
value: "Module"
});
Object.defineProperty(e, "__esModule", {
value: !0
});
};
t.t = function(e, n) {
1 & n && (e = t(e));
if (8 & n) return e;
if (4 & n && "object" == typeof e && e && e.__esModule) return e;
var i = Object.create(null);
t.r(i);
Object.defineProperty(i, "default", {
enumerable: !0,
value: e
});
if (2 & n && "string" != typeof e) for (var o in e) t.d(i, o, function(t) {
return e[t];
}.bind(null, o));
return i;
};
t.n = function(e) {
var n = e && e.__esModule ? function() {
return e.default;
} : function() {
return e;
};
t.d(n, "a", n);
return n;
};
t.o = function(e, t) {
return Object.prototype.hasOwnProperty.call(e, t);
};
t.p = "../../bin/";
return t(t.s = 50);
}([ function(e, t, n) {
function i(e, t) {
var n = {}, i = {}, o = function(t) {
return !e.nodeType && e != window && e != document || ("FORM" != e.tagName || "submit" != t) && (!d.isCustomEvents && (d.isFF && d.isFF < 9 ? !document.createEvent("event")[t.toUpperCase()] : void 0 === e["on" + t]));
}, r = function(t, i) {
if (!t && "function" != typeof i) throw "bad arguments to on / addEventListener";
if (!(t in n)) {
n[t] = [];
o(t) || s(t);
}
n[t].push(i);
return e;
}, s = function(t) {
if (!(t in i)) {
i[t] = function(i) {
i && (i.stopPropagation || h(i));
var o, r = n[t], s = r.length, a = !0;
r._active = !0;
for (o = 0; o < s; o++) try {
if (!r[o]) continue;
!1 === r[o].call(e, d.isCustomEvents && i instanceof d.CustomEvent ? i.detail : i) && (a = !1);
} catch (e) {
f.fire("error", e);
}
r._active = !1;
if (r._dirty) {
for (o = 0; o < s; o++) if (!r[o]) {
o == s - 1 ? r.pop() : r[o--] = r.pop();
s--;
}
r._dirty = !1;
}
if (!1 === a) {
if (i) {
i.preventDefault();
i.returnValue = !1;
}
return !1;
}
};
e.attachEvent ? e.attachEvent("on" + t, i[t]) : e.addEventListener && e.addEventListener(t, i[t], !1);
}
}, a = function(t) {
var o = i[t];
if (o) {
e.attachEvent ? e.detachEvent("on" + t, o) : e.addEventListener && e.removeEventListener(t, o, !1);
delete i[t];
delete n[t];
}
}, c = function(t, o) {
var r = n[t];
if (r) {
for (var s = 0, c = r.length; s < c; s++) if (r[s] === o) {
1 == r.length ? i[t] ? a(t) : delete n[t] : r._active ? (r[s] = null, r._dirty = !0) : s == c - 1 ? r.pop() : r[s] = r.pop();
break;
}
return e;
}
}, u = function() {
if (n && i) {
for (var e in i) i.hasOwnProperty(e) && a(e);
n = i = null;
}
}, l = function(t, i) {
if (!d.isCustomEvents || o(t)) {
var r = n[t], s = !0;
if (r && r.length) {
r._active = !0;
var a, c, u;
for (a = 0, c = r.length; a < c; a++) try {
if (!r[a]) continue;
u = r[a].call(e, i);
!1 === u && (s = !1);
} catch (e) {
f.fire("error", e);
}
r._active = !1;
if (r._dirty) {
for (a = 0; a < c; a++) if (!r[a]) {
a == c - 1 ? r.pop() : r[a--] = r.pop();
c--;
}
r._dirty = !1;
}
}
return s;
}
return e.dispatchEvent(new d.CustomEvent(t, {
bubbles: !1,
cancelable: !0,
detail: i
}));
}, h = function(e) {
e.preventDefault = h.preventDefault;
e.stopPropagation = h.stopPropagation;
e.target = e.srcElement;
};
h.preventDefault = function() {
this.returnValue = !1;
};
h.stopPropagation = function() {
this.cancelBubble = !0;
};
var p = {
fire: l,
on: r,
un: c,
unextendEvents: u
};
if (t) return p;
for (var m in p) p.hasOwnProperty(m) && (e[m] = p[m]);
d.bugs.leaksMemory && d.bugs.leaksMemory(function() {
for (var t in p) p.hasOwnProperty(t) && (e[t] = null);
});
return e;
}
function o(e) {
a(0, e);
}
function r(e) {
a(1, e);
}
function s(e) {
a(2, e);
}
function a(e, t) {
e <= h ? t() : p[e].push(t);
}
function c(e) {
for (;h < e; ) {
h++;
for (var t = 0; t < p[h].length; t++) p[h][t]();
p[h] = null;
}
}
function u() {
h > 0 || (document.body && document.body.firstChild ? c(1) : window.setTimeout(u, 200));
}
function l() {
c(2);
}
var d = n(2), f = {
extend: i,
body: i(document.body, !0),
window: i(window, !0),
document: i(document, !0),
runAfterScriptReady: o,
runAfterFirstChildReady: r,
runAfterDomReady: s
};
f.extend(f);
var h = 0, p = [ [], [], [], [] ];
u();
!function() {
var e;
if (d.isSafari) e = window.setInterval(function() {
if (/loaded|complete/i.test(document.readyState)) {
window.clearInterval(e);
l();
}
}, 20); else if (document.addEventListener) /loaded|complete/i.test(document.readyState) ? l() : document.addEventListener("DOMContentLoaded", l, !1); else if (d.isIE) {
window.attachEvent("onload", l);
var t = document.createElement("document:ready");
e = window.setInterval(function() {
if (/loaded|complete/i.test(document.readyState)) {
t = null;
window.clearInterval(e);
l();
} else {
try {
t.doScroll("left");
} catch (e) {
return;
}
t = null;
window.clearInterval(e);
l();
}
}, 200);
}
}();
e.exports = f;
}, function(e, t) {
var n = function(e) {
return function(e, t) {
return t ? null == e : void 0 === e;
};
}();
e.exports = n;
}, function(e, t, n) {
function i() {
function e(e) {
return e.replace(/^http:/, N ? "https:" : "http:");
}
function t() {
if (void 0 !== window.innerHeight) return window.innerHeight;
if (document.documentElement) return document.documentElement.offsetHeight;
var e = document.getElementsByTagName("body");
return e.length ? e[0].clientHeight : 0;
}
function n() {
if (void 0 !== window.innerWidth) return window.innerWidth;
if (document.documentElement) return document.documentElement.offsetWidth;
var e = document.getElementsByTagName("body");
return e.length ? e[0].clientWidth : 0;
}
function i() {
if (!r(s)) return s;
var e = document.createElement("div"), t = document.createElement("div"), n = e.style, i = t.style;
n.overflow = "auto";
n.width = n.height = "100px";
n.position = "absolute";
n.top = "-1000px";
i.width = "100%";
i.height = "200px";
e.appendChild(t);
document.body.appendChild(e);
s = e.offsetWidth - e.clientWidth;
document.body.removeChild(e);
return s;
}
var s, a, c = navigator, u = c.userAgent.toLowerCase(), l = +(/trident.*rv:? *([0-9]+)/.exec(u) || [])[1] || !1, d = function() {
for (var e = 3, t = document.createElement("div"), n = t.getElementsByTagName("i"); t.innerHTML = "<!--[if gt IE " + ++e + "]><i></i><![endif]-->", 
n[0]; ) ;
return e > 4 ? e : document.documentMode;
}(), f = 8 === d, h = 7 === d, p = 6 === d, m = !!window.opera && "[object Opera]" === Object.prototype.toString.call(window.opera), g = u.indexOf("edge") > -1, _ = "Google Inc." === c.vendor, v = "Apple Computer, Inc." === c.vendor, y = !g && !d && !m && (_ || v || /webkit|khtml/.test(u)), w = +/\d+/.exec(/firefox\/\d+/i.exec(c.userAgent) || ""), b = -1 !== u.indexOf("iphone"), $ = -1 !== u.indexOf("ipod"), E = -1 !== u.indexOf("ipad"), k = b || E || $, T = -1 !== u.indexOf("android"), O = -1 !== u.indexOf("wp7"), L = k || T || O, x = d && "msie" || w && "firefox" || m && "opera" || _ && "chrome" || v && "safari", A = "CSS1Compat" === document.compatMode, I = !A, R = d && I && document.documentElement && !!document.documentElement.style.setExpression, C = document.documentMode || d, S = -1 !== u.indexOf("windows") || -1 !== u.indexOf("win32"), D = -1 !== u.indexOf("macintosh") || -1 !== u.indexOf("mac os x"), N = "https:" === document.location.protocol, P = c.language || c.browserLanguage || c.userLanguage || c.systemLanguage, M = {
noBoxSizing: C <= 7,
ie: {
cssBottomRight: p,
cssFixed: p || R,
buggyCSS: p || R
}
}, V = "textContent" in document.createElement("div"), j = !1, U = null;
try {
if (window.CustomEvent && /\[native code\]|\[object CustomEventConstructor\]/.test(window.CustomEvent.toString())) {
new window.CustomEvent("testevent", {
bubbles: !1,
cancelable: !0,
detail: !0
});
j = !0;
U = window.CustomEvent;
}
} catch (e) {}
switch (x) {
case "msie":
case "firefox":
case "chrome":
a = +/\d+/.exec(new RegExp(x + "[ /]\\d+").exec(u) || "");
break;

default:
a = +/\d+/.exec(/version[ \/]\d+/.exec(u) || "");
}
var q = !1;
try {
var z = {
get passive() {
q = !0;
}
}, K = function() {};
window.addEventListener("test", K, z);
window.removeEventListener("test", K, z);
} catch (e) {
q = !1;
}
if (p) {
var F = [];
M.leaksMemory = function(e) {
o.isFunction(e);
F.push(e);
};
var W = function() {
for (var e = 0; e < F.length; e++) F[e]();
};
M.leaksMemory.remove = function(e) {
for (var t = F.length - 1; t >= 0; t--) e == F[t] && F.splice(t, 1);
};
window.attachEvent("onunload", W);
}
var H = "Shockwave Flash", B = "ShockwaveFlash.ShockwaveFlash", G = "application/x-shockwave-flash", Y = "application/x-java-vm";
return {
browser: x,
version: a,
isStrict: A,
isQuirks: I,
isOpera: m,
isSafari: v,
isWebKit: y,
isChrome: _,
isAndroid: T,
isIPhone: b,
isIPod: $,
isIPad: E,
isIOS: k,
isWP7: O,
isMobile: L,
isNewIE: l,
isEdge: g,
isIE: d,
isIE6: p,
isIE7: h,
isIE8: f,
isFF: w,
isCustomEvents: j,
CustomEvent: U,
engineIE: C,
bugs: M,
isWindows: S,
isMac: D,
isSecure: N,
secureURL: e,
hasFlash: function() {
var e, t = c.plugins && c.plugins[H];
if (t) {
e = c.mimeTypes && c.mimeTypes[G];
return e && !e.enabledPlugin ? null : t.description;
}
if (window.ActiveXObject) try {
t = new window.ActiveXObject(B);
t.AllowScriptAccess = "always";
return t.GetVariable("$version");
} catch (e) {}
}(),
hasJava: function() {
var e = c.mimeTypes;
return d ? !O && ("javaEnabled" in c && c.javaEnabled()) : e && (e = e[Y]) && (e = e.enabledPlugin) ? e.name : void 0;
}(),
language: P,
getScrollbarSize: i,
getWindowClientHeight: t,
getWindowClientWidth: n,
isTextContent: V,
hasPassiveListeners: q
};
}
var o = n(23), r = n(1), s = i();
s.sniffBrowser = i;
e.exports = s;
}, function(e, t, n) {
function i() {
if (window.$zopim && window.$zopim.s) return window.$zopim.s.src;
for (var e, t = document.getElementsByTagName("script"), n = /.*zopim.(com|net|org)\//, i = 0, o = t.length; i < o; i++) {
e = t[i].src || "";
if (n.test(e)) return e;
}
return "";
}
function o(e) {
e && !m.test(e) && (e = null);
var t = "id." + (d.brandDomain || "zopim.com");
return "https://" + (e || t) + "/authenticated/web/jwt";
}
function r(e) {
if (e) {
if (g.test(e)) return e.replace(g, "$1.zopim.com$2");
m.test(e) || (e = null);
}
var t = "widget-mediator." + (d.brandDomain && d.brandDomain.replace(/:[0-9]+/, "") || "zopim.com");
return e || t;
}
var s = n(1), a = n(4), c = n(2), u = n(46), l = n(21), d = function() {
for (var e = i(), t = [ /\/?[?]/, /\/livechat\// ], n = [], o = 0; o < t.length; o++) {
n = e.split(t[o]);
if (n.length) break;
}
var r = n[1], s = n[0], a = /^(https?:)?\/\/[^\/]+/.exec(s), c = s.replace(/^(https?:)?\/\//i, "").split("/")[0], u = c.replace(/(.+\.)(?=.+\..+)/, ""), l = n[0].split("/");
l = l.pop() == c ? n[0] : l.join("/");
a = a && "zopim.com" !== c ? a[0] : "https://v2.zopim.com";
return {
accountKey: r,
brandDomain: u,
baseURL: l,
rootURL: a
};
}(), f = "https://v2.zopim.com/widget", h = f + "/images", p = u.map([ ".zopim.com", ".zopim.org", ".zdch.at", ".zd-dev.com", ".bre-zd.com" ], l.escape), m = new RegExp("^[a-z][a-z0-9_-]*(\\.[a-z][a-z0-9_-]*)*(" + p.join("|") + ")(:\\d+)?$", "i"), g = /^([a-z][a-z0-9_-]*)(:\d+)?$/i;
s(a.baseURL, !0) && (a.baseURL = c.secureURL(d.baseURL));
var _ = {
ASSETS_URL: f,
IMAGES_URL: h,
SOUNDS_URL: "https://v2.zopim.com/widget/sounds",
FONTS_URL: "https://v2.zopim.com/widget/fonts",
ASSETS_LEGACY: document.location.protocol + "//cdn.zopim.com/assets",
BRANDING_URL: "https://www.zopim.com",
AVATARS: {
CONCIERGE: h + "/avatar_simple_agent.png",
AGENT: h + "/avatar_simple_agent.png",
VISITOR: h + "/avatar_simple_visitor.png",
DEFAULT: h + "/avatar_simple_visitor.png"
},
ACCOUNT_KEY: d.accountKey,
BRAND_DOMAIN: d.brandDomain,
COUNTRY_CODE: function() {
var e = '<!--# echo var="http_cf_ipcountry" default="geo" -->'.toUpperCase();
"<" == e.charAt(0) && (e = "geo");
return e;
}(),
AUTH_URL: "https://www.zopim.com/auth/$NAME/$KEY-$MID",
AUTH_LOGOUT_URL: "https://www.zopim.com/auth/logout/$KEY-$MID",
AUTH_SERVER_URL: o(),
IS_POPOUT: window.$zopim_popout,
POPOUT_WINDOW_PREFIX: "zlivechatpopout_",
POPOUT_URL: d.rootURL + "/widget/livechat.html",
CALLBACK_FILE_UPLOAD_PATH: "/client/widget/upload",
FILE_UPLOAD_PATH: "/client/widget/uploads",
FILE_UPLOAD_MAX: 20971520,
RESEND_MSG_TIMEOUT: 5e3,
FILE_REPLACE_SOURCE: /^(\s*https?\:\/\/v2(?:assets|uploads)\.zopim\.)com(\/)/i,
FILE_REPLACE_RESULT: "$1io$2",
CHAT_LOG_REMEMBER_COUNT: 10,
getAuthServerURL: o,
getMediatorHost: r
};
e.exports = _;
}, function(e, t) {
var n = {
build_number: "20200423.075440",
git_commit: "a2e84ec3fc0a7507e1dcc0cd9c0b4c7c6519e194",
release_tag: "1.11.2"
};
e.exports = n;
}, function(e, t) {
function n(e) {
return "function" == typeof e;
}
e.exports = n;
}, function(e, t, n) {
function i(e, t) {
for (var n, i = document.createElement("div"), o = 0, r = P.length; o < r; o++) if (void 0 !== i.style[P[o]]) {
n = t[o];
break;
}
return n ? e ? function(e, t, i) {
e.autobind(t, n, i);
} : function(e, t, i) {
M && e.autounbind(t, n, i);
} : function() {};
}
function o(e, t) {
for (var n = {}, i = 0, o = t.length; i < o; i++) {
var r = t[i];
r in e && (n[r] = e[r]);
}
return n;
}
function r() {
for (var e, t, n = arguments.length, i = 1, o = arguments[0] || {}; i < n; i++) if (null != (e = arguments[i])) for (t in e) Object.prototype.hasOwnProperty.call(e, t) && o !== e[t] && (o[t] = e[t]);
return o;
}
function s(e, t) {
for (var n in t) if (Object.prototype.hasOwnProperty.call(t, n)) if (t[n] && t[n].constructor && t[n].constructor === Object) {
e[n] = e[n] || {};
s(e[n], t[n]);
} else e[n] = t[n];
return e;
}
function a(e, t) {
for (var n in t) if (Object.prototype.hasOwnProperty.call(t, n)) {
if (!(n in e)) continue;
t[n] && t[n].constructor && t[n].constructor === Object ? a(e[n], t[n]) : delete e[n];
}
return e;
}
function c() {
if (void 0 === x) try {
x = u();
} catch (e) {}
return x;
}
function u() {
if (!window.getComputedStyle) return !1;
var e = document.createElement("div"), t = "border-box";
document.body.appendChild(e);
e.style.height = "10px";
e.style.padding = "5px";
e.style.boxSizing = t;
e.style.webkitBoxSizing = t;
e.style.mozBoxSizing = t;
var n = parseInt(window.getComputedStyle(e).height, 10);
document.body.removeChild(e);
return 10 != n;
}
function l(e) {
var t = e.getComputedStyle();
if ("auto" == t.height) return e.getHeight();
var n = parseInt(t.height, 10) || 0;
j.computedHeightBoxSizingBug() && (n += (parseInt(t.paddingTop, 10) || 0) + (parseInt(t.paddingBottom, 10) || 0) + (parseInt(t.borderTopWidth, 10) || 0) + (parseInt(t.borderBottomWidth, 10) || 0));
return n + "px";
}
function d(e) {
function t() {
this.addClass("hover");
}
function n() {
this.removeClass("hover");
}
if (A.bugs.noBoxSizing) {
e.on("mouseover", t);
e.on("mouseout", n);
}
}
function f(e, t) {
for (var n, i = t.split("."); i.length; ) {
n = i.shift();
I(e[n], !0) && (e[n] = {});
e = e[n];
}
return e;
}
function h(e, t) {
if (0 === t.indexOf(e.path)) {
for (var n, i = e.path.split(".").length, o = t.split(".").slice(i), r = e.update; o.length; ) {
n = o.shift();
if (!(n in r)) return;
r = r[n];
}
return r;
}
}
function p(e, t, n) {
e = e.split(".");
var i = e.pop();
if (i) {
for (var o = 0, r = e.length; o < r; o++) {
e[o] in n || (n[e[o]] = {});
n = n[e[o]];
}
n[i] = t;
}
}
function m(e) {
for (var t = e.split("."), n = "." + t.splice(t.length - 2, 2).join("."); t.length; ) {
var i = {
domain: n,
path: "/"
};
C.set("zte2095", "1", i);
if ("1" == C.get("zte2095")) {
C.remove("zte2095", i);
break;
}
n = "." + t.pop() + n;
}
return n;
}
function g(e) {
return q.test(e);
}
function _(e) {
return U.test(e);
}
function v(e) {
if (e && "object" == typeof e) {
var t = [];
for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
return t;
}
}
function y(e) {
if (window.Image) try {
var t = new window.Image();
t.onload = t.onerror = function() {
e(!(1 != this.width || 1 != this.height));
};
t.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
} catch (t) {
e();
} else e();
}
function w(e, t) {
e = parseInt(e, 10);
isNaN(e) && (e = 0);
var n = e < 0;
e = Math.abs(e).toString().split("");
for (var i = Math.max(t - e.length, 0); i--; ) e.unshift("0");
n && e.unshift("-");
return e.join("");
}
function b(e, t) {
function n(e, t, n) {
return n.replace("<hours>", e).replace("<minutes>", t);
}
var i = R("<hours>:<minutes>"), o = R("<hours>:<minutes> am"), r = R("<hours>:<minutes> pm"), s = "24" === t ? 24 : 12, a = function(e, t) {
return e - Math[e > 0 ? "floor" : "ceil"](e / t) * t;
}(Math[e > 0 ? "floor" : "ceil"](e / 60), s), c = j.pad(Math.abs(e) % 60, 2);
if (24 === s) return n(j.pad(a, 2), c, i);
var u = 0 === a ? 12 : a;
return Math.abs(e / 60) % 24 < 12 ? n(u, c, o) : n(u, c, r);
}
function $(e) {
return e && e.replace(S.FILE_REPLACE_SOURCE, S.FILE_REPLACE_RESULT);
}
function E(e, t) {
t = parseInt(t, 10);
if (!t) return e.getValue();
var n = e.getKeys(), i = n.length, o = {};
if (i <= t) return e.getValue() || o;
for (var r = 0; r < i; r++) n[r] = parseInt(n[r], 10);
n = n.sort().slice(-t);
var s, a = e.getValue();
if (!a) return o;
for (r = 0, i = n.length; r < i; r++) {
s = n[r];
o[s] = a[s];
}
return o;
}
function k(e, t) {
var n;
if (e.leaf && e.parentNode) {
n = {};
n[e.name] = t;
e.parentNode.write(n);
} else e.write(t);
}
function T() {
if (A.isNewIE) try {
"body" !== document.activeElement.nodeName.toLowerCase() && document.activeElement.focus();
} catch (e) {}
}
function O() {
window.console && window.console.warn && window.console.warn("The Zopim widget embed code is invalid. Please email chat@zendesk.com with your account key: " + S.ACCOUNT_KEY);
}
function L(e, t, n) {
return S.AUTH_URL.replace("$NAME", e).replace("$KEY", t).replace("$MID", n);
}
var x, A = n(2), I = n(1), R = n(11), C = n(16), S = n(3), D = "-webkit- -moz- -o- -ms- ".split(" "), N = "webkit Moz O ms ".split(" "), P = [ "transition", "MozTransition", "OTransition", "WebkitTransition" ], M = [ "transitionend", "transitionend", "otransitionend", "webkitTransitionEnd" ], V = [ "animationend", "animationend", "oanimationend", "webkitAnimationEnd" ], j = {
contains: function() {
var e = document.documentElement;
return e.compareDocumentPosition ? function(e, t) {
e = e.dom || e;
t = t.dom || t;
return !!(16 & e.compareDocumentPosition(t));
} : e.contains ? function(e, t) {
e = e.dom || e;
t = t.dom || t;
var n = 9 === e.nodeType ? e.documentElement : e, i = t.parentNode;
return e === i || !!(i && 1 === i.nodeType && n.contains && n.contains(i));
} : function(e, t) {
e = e.dom || e;
t = t.dom || t;
for (;t = t.parentNode; ) if (t === e) return !0;
return !1;
};
}(),
onTransitionEnd: i(!0, M),
unTransitionEnd: i(!1, M),
onAnimationEnd: i(!0, V),
unAnimationEnd: i(!1, V),
css_prefixes: D,
cssom_prefixes: N,
isStyleSupported: function() {
function e(e) {
for (var t = e.charAt(0).toUpperCase() + e.slice(1), i = (e + " " + N.join(t + " ") + t).split(" "), o = 0; o < i.length; o++) if (void 0 !== n[i[o]]) return !0;
return !1;
}
var t = document.createElement("div"), n = t.style;
return e;
}(),
pick: o,
shallowExtend: r,
fullyExtend: s,
fullyDelete: a,
computedHeightBoxSizingBug: c,
getComputedHeight: l,
hoverFix: d,
getEffectiveTLD: m,
descendsObj: f,
insertObj: p,
getValueByReference: h,
isDefaultName: _,
getKeys: v,
supportsDataURI: y,
isIE: function() {
return A.isIE || /Trident\//.test(window.navigator.userAgent);
}(),
pad: w,
formatMinutesAsHours: b,
replaceFileHostname: $,
getLastLogEntries: E,
writeNode: k,
isAgentNick: g,
refocusActiveElement: T,
warnBadEmbed: O,
getAuthLoginUrl: L
}, U = /^Visitor [0-9]{3,}$/, q = /^agent:[0-9]+/i;
e.exports = j;
}, function(e, t) {
function n(e) {
return "[object Array]" == Object.prototype.toString.call(e);
}
e.exports = n;
}, function(e, t, n) {
function i(e) {
if (!(this instanceof i)) {
c || i._initSingleton(window);
return c;
}
if (e) return i.parseQuery(e);
this.store = {};
}
function o(e, t, n) {
if (void 0 === t && void 0 === n) return e;
void 0 === t && (t = "string");
if (!(t in a)) throw "invalid type requested";
return void 0 === e ? void 0 !== n ? n : a[t] : "boolean" === t ? s.test(e) : "integer" === t ? !0 === e ? 1 : parseInt(e, 10) : "float" === t ? !0 === e ? 1 : parseFloat(e) : e;
}
var r = n(7), s = /^(1|on|true)$/i, a = {
boolean: !1,
integer: 0,
float: 0,
string: ""
}, c = null;
i._initSingleton = function(e) {
c = new i(e.location.search);
};
i.buildQuery = function(e) {
var t, n, i, o, s, a, c = [], u = [];
for (s in e) Object.prototype.hasOwnProperty.call(e, s) && c.push(s);
c.sort();
for (t = 0, i = c.length; t < i; t++) {
s = c[t];
a = e[s];
s = window.encodeURIComponent(s);
if (r(a)) if (1 !== a.length || !0 !== a[0]) for (n = 0, o = a.length; n < o; n++) u.push(s + "=" + window.encodeURIComponent(a[n] + "")); else u.push(s); else u.push(s + "=" + window.encodeURIComponent(a + ""));
}
return u.join("&");
};
i.parseQuery = function(e) {
var t, n, o = new i();
e = e.replace(/^\?|\/+$/g, "");
var r, s, a = e.split("&");
for (t = 0, n = a.length; t < n; t++) {
var c = a[t];
if (c.length) {
var u = c.indexOf("=");
if (u <= -1) {
r = c;
s = !0;
} else {
r = c.slice(0, u);
s = window.decodeURIComponent(c.slice(u + 1));
}
o.add(window.decodeURIComponent(r), s);
}
}
return o;
};
i.getHash = function(e, t) {
var n = t || window.location.hash;
return i.parseQuery(n.replace(/^#/, "")).get(e);
};
var u = i.prototype;
u.add = function(e, t) {
this.has(e) ? this.store[e].push(t) : this.store[e] = [ t ];
};
u.has = function(e) {
return Object.prototype.hasOwnProperty.call(this.store, e);
};
u.getLast = function(e, t, n) {
return this.has(e) ? this.getAt(e, this.store[e].length - 1, t, n) : o(void 0, t, n);
};
u.getFirst = function(e, t, n) {
return this.getAt(e, 0, t, n);
};
u.getAt = function(e, t, n, i) {
return o(this.has(e) ? this.store[e][t] : void 0, n, i);
};
u.getRaw = function(e) {
return this.has(e) ? this.store[e].concat() : [];
};
u.get = u.getLast;
u.toString = function() {
return i.buildQuery(this.store);
};
e.exports = i;
}, function(e, t, n) {
function i(e, t) {
if (!r(e)) throw new TypeError("FunctionUtils.bind - what is trying to be bound is not callable");
if (r(e.bind) && !("prototype" in e.bind)) return e.bind.apply(e, a.call(arguments, 1));
var n = a.call(arguments, 2), i = function() {}, o = function() {
return e.apply(this instanceof i && t ? this : t, n.concat(a.call(arguments)));
};
i.prototype = o.prototype;
o.prototype = new i();
return o;
}
function o(e) {
var t;
return function() {
if (!t) {
t = !0;
return e.apply(this, a.call(arguments));
}
};
}
var r = n(5), s = {
bind: i,
once: o
}, a = Array.prototype.slice;
e.exports = s;
}, function(e, t, n) {
function i(e) {
return '"' + e.replace(d, o) + '"';
}
function o(e) {
return f[e] || "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4);
}
function r(e) {
switch (typeof e) {
case "string":
return i(e);

case "number":
return isFinite(e) ? e.toString() : "null";

case "boolean":
return String(e);

case "object":
if (!e) return "null";
var t, n, o = [];
if (u(e)) {
for (t = 0, n = e.length; t < n; t++) o[t] = r(e[t]) || "null";
return "[" + o.join(",") + "]";
}
var s, a, c = [];
for (s in e) e.hasOwnProperty(s) && c.push(s);
c.sort();
for (t = 0, n = c.length; t < n; t++) {
s = c[t];
a = r(e[s]);
a && o.push(i(s) + ":" + a);
}
if (o.length) return "{" + o.join(",") + "}";
}
}
function s(e, t, n) {
return t ? m[t] : String.fromCharCode(parseInt(n, 16));
}
function a(e) {
var t, n, i, o, r, a = e.match(h), c = a.length, u = a[0];
"{" == u ? (t = {}, r = 1) : "[" == u ? (t = [], r = 1) : (t = [], r = 0, n = !0);
var l = [ t ];
for (c = a.length; r < c; ++r) {
u = a[r];
switch (u.charCodeAt(0)) {
case 91:
o = l[0];
l.unshift(o[i || o.length] = []);
i = void 0;
break;

case 93:
l.shift();
break;

case 123:
o = l[0];
l.unshift(o[i || o.length] = {});
i = void 0;
break;

case 125:
l.shift();
break;

case 102:
o = l[0];
o[i || o.length] = !1;
i = void 0;
break;

case 110:
o = l[0];
o[i || o.length] = null;
i = void 0;
break;

case 116:
o = l[0];
o[i || o.length] = !0;
i = void 0;
break;

case 34:
u = u.substring(1, u.length - 1);
-1 !== u.indexOf(_) && (u = u.replace(p, s));
o = l[0];
if (void 0 == i) {
if (!(o instanceof Array)) {
i = u || g;
break;
}
i = o.length;
}
o[i] = u;
i = void 0;
break;

default:
o = l[0];
o[i || o.length] = +u;
i = void 0;
}
}
if (n) {
if (1 == l.length) return t[0];
} else if (!l.length) return t;
throw "error";
}
var c = n(1), u = n(7), l = !c(window) && window.JSON || {
parse: a,
stringify: r
}, d = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, f = {
"\b": "\\b",
"\t": "\\t",
"\n": "\\n",
"\f": "\\f",
"\r": "\\r",
"\\": "\\\\",
'"': '\\"'
}, h = new RegExp('(?:false|true|null|[\\{\\}\\[\\]]|(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)|(?:"(?:[^\\0-\\x08\\x0a-\\x1f"\\\\]|\\\\(?:["/\\\\bfnrt]|u[0-9A-Fa-f]{4}))*"))', "g"), p = new RegExp("\\\\(?:([^u])|u(.{4}))", "g"), m = {
'"': '"',
"/": "/",
"\\": "\\",
b: "\b",
f: "\f",
n: "\n",
r: "\r",
t: "\t"
}, g = new String(""), _ = "\\";
e.exports = l;
}, function(e, t, n) {
function i(e, t) {
if (isNaN(e)) {
var n = new o();
n.add("_", e);
return n;
}
-1 == e && (e = y.length);
var i = y[e];
i || (y[e] = i = new o());
if ("string" == typeof t) i.add("_", t); else for (var r in t) t.hasOwnProperty(r) && i.add(r, t[r]);
return i;
}
function o() {
function e(e, t) {
u[e] = t;
}
function t(e) {
r(e, d);
}
function n(e) {
l.push(e);
}
function i() {
return s();
}
function s(e) {
return u[e || w] || u._;
}
function a(e) {
var t, n = s(e);
for (t = 0; t < l.length; t++) l[t](n);
}
function c(e, t) {
var n, i = new o();
y[u._] = i;
for (var r in u) if (u.hasOwnProperty(r)) {
n = u[r];
if ("string" != typeof n) continue;
n = n[e].apply(n, t);
i.add(r, n);
}
return i;
}
for (var u = {}, l = [], d = {
add: e,
bind: t,
onTranslate: n,
toJSON: i,
toString: s,
update: a
}, f = [ "concat", "replace", "toLowerCase", "toUpperCase" ], h = 0; h < f.length; h++) d[f[h]] = function(e) {
return function() {
return c(e, arguments);
};
}(f[h]);
return d;
}
function r(e, t) {
for (var n = 0; n < b.length; n++) if (b[n] == e) {
$[n] = t;
return;
}
b.push(e);
$.push(t);
}
function s(e) {
for (var t = 0; t < b.length; t++) if (b[t] == e) {
b.splice(t, 1);
$.splice(t, 1);
return;
}
}
function a(e) {
e = e.split(/-|_/).slice(0, 2);
var t = e[0] = e[0].toLowerCase();
e[1] && (e[1] = e[1].toUpperCase());
e = e.join("_");
return g.languages ? e in g.languages ? e : t in g.languages ? t : null : null;
}
function c(e) {
var t, n, o, r, s, c;
e = a(e);
if (e) {
s = g.languages[e];
if (s) {
c = _[g.languages[e]];
if (c) {
i.language = w = e;
v.ensureLoaded(c, function(i) {
i && u(e);
if (e == w) {
for (t = 0, n = y.length; t < n; t++) y[t].update instanceof Function && y[t].update(e);
for (t = 0, n = b.length; t < n; t++) {
o = b[t];
r = $[t].toString();
if (k) o.textContent = r; else if ("string" == typeof o.innerText) o.innerText = r; else if ("string" == typeof o.nodeValue) try {
o.data = r;
} catch (e) {}
}
E._active = !0;
n = E.length;
for (t = 0; t < n; t++) try {
E[t] && E[t](e);
} catch (e) {}
E._active = !1;
if (E._dirty) {
for (t = 0; t < n; t++) if (!E[t]) {
t == n - 1 ? E.pop() : E[t--] = E.pop();
n--;
}
E._dirty = !1;
}
}
});
}
}
}
}
function u(e) {
var t, n = _[g.languages[e]];
for (t = 0; t < n.length; t++) 0 !== n[t] && y[t].add(e, n[t]);
}
function l(e) {
E.push(e);
}
function d(e) {
for (var t = 0, n = E.length; t < n; t++) if (E[t] == e) {
E._active ? (E[t] = null, E._dirty = !0) : t == n - 1 ? E.pop() : E[t] = E.pop();
break;
}
}
function f() {
return !(-1 == w.search(T));
}
function h(e) {
return f() ? e.replace(/left/, "%left%").replace(/right/, "left").replace(/%left%/, "right").replace(/ltr/, "%ltr%").replace(/rtl/, "ltr").replace(/%ltr%/, "rtl") : e;
}
function p() {
var e = g.strings;
if (e) for (var t = 0; t < e.length; t++) i(t, e[t]);
}
var m = n(2), g = n(4), _ = n(19), v = n(43), y = [], w = "_", b = [], $ = [], E = [], k = m.isTextContent, T = /^ar|^fa|^he|^ur/;
i.bind = r;
i.flip = h;
i.onLanguage = l;
i.unLanguage = d;
i.update = c;
i.unbind = s;
i.rtl = f;
i.findClosestLanguage = a;
i.loadDefaultStrings = p;
p();
e.exports = i;
}, function(e, t) {
function n(e) {
return "string" == typeof e;
}
e.exports = n;
}, function(e, t, n) {
function i(e) {
p = e;
}
function o(e) {
E = e ? v.getAuthServerURL(e) : v.AUTH_SERVER_URL;
}
function r(e) {
f = e;
}
function s() {
return f;
}
function a(e) {
if (h) {
+new Date() - h.issued_at >= h.expires_in - 6e4 ? y.authenticate(function(t) {
if (t) {
p && p.$("visitor").$("auth_status$string").update("failed");
e(t, null);
} else e(null, h.id_token);
}) : e(null, h.id_token);
} else e(null, null);
}
function c() {
f = void 0;
h = void 0;
p && p.$("visitor").$("authenticated$bool").update(!1);
}
function u() {
return !!h;
}
function l(e) {
f && f(g.once(function(t) {
t && m(t) ? y.exchangeToken({
account_key: v.ACCOUNT_KEY,
auth_url: E,
site_jwt: t,
state: h && h.state ? h.state : null
}, function(t, n) {
h = n;
p && p.$("visitor").$("authenticated$bool").update(!t);
e(t);
}) : e({
reason: "invalid jwt in callback"
});
}));
}
function d(e, t) {
var n = new XMLHttpRequest();
n.open("POST", e.auth_url, !0);
n.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
n.onload = function() {
if (t) {
var e;
try {
var i = n.response;
if ("" === i) throw w;
e = JSON.parse(i);
} catch (e) {
t({
reason: w
});
return;
}
200 === n.status ? t(void 0, {
issued_at: +new Date(),
id_token: e.id_token,
expires_in: 1e3 * e.expires_in,
state: e.state
}) : t({
reason: $,
details: e.details
});
}
};
n.onerror = function() {
t && t({
reason: b
});
};
var i = {
account_key: e.account_key,
token: e.site_jwt,
format: "json"
};
e.state && (i.state = e.state);
var o = _.buildQuery(i);
n.send(o);
}
var f, h, p, m = n(12), g = n(9), _ = n(8), v = n(3), y = {
authenticate: l,
isAuthenticated: u,
getSiteJWTFunc: s,
retrieveIDToken: a,
clearIdentity: c,
setOverrideHost: o,
setSiteJWTFunc: r,
setDataNode: i,
exchangeToken: d
}, w = "format error", b = "network/security error", $ = "jwt verification error", E = v.AUTH_SERVER_URL;
e.exports = y;
}, function(e, t, n) {
function i(e) {
b.setActivityWindow(e);
T = $.ACCOUNT_KEY;
g = (e || window).location.hostname;
_ = /\b(?:\d{1,3}\.){3}\d{1,3}/.test(g) ? g : E.getEffectiveTLD(g);
}
function o() {
if ($.IS_POPOUT) return b.get(x) || y().get("mid");
var e = d();
return e || (b.get(L) || "");
}
function r(e) {
b.set(L, e, {
path: "/",
ttl: 365,
domain: _
});
}
function s() {
b.remove(L, {
path: "/",
domain: _
});
}
function a() {
var e = f();
if ("boolean" == typeof e) return e;
var t = b.get(A);
t = parseInt(t, 10);
return 0 !== t && (1 === t || void 0);
}
function c() {
b.remove(A, {
path: "/",
domain: _
});
}
function u(e) {
e = v(e);
e = e ? 1 : 0;
b.set(A, e, {
path: "/",
ttl: 365,
domain: _
});
}
function l() {
s();
w.remove(O);
}
function d() {
var e = b.getJSONCookie("__zlcid");
b.remove("__zlcid", {
path: "/"
});
if (e.mID) return e.mID;
var t = h("__zlcstore");
b.remove("__zlcstore", {
path: "/",
domain: _
});
return t && t.mID ? t.mID : void 0;
}
function f() {
var e, t = h("__zlcprivacy");
if ("boolean" == typeof t) {
e = t;
u(t);
}
return e;
}
function h(e) {
return b.getJSONCookie(e)[T];
}
function p(e, t) {
var n = w.get(O) || {};
n[T] || (n[T] = {});
var i = n[T];
i[e] = t;
i.timestamp = +new Date();
w.set(O, n);
}
function m(e) {
var t = w.get(O) || {};
if (!t[T]) return {};
var n = t[T];
return n.timestamp ? +new Date() - n.timestamp > k ? {} : n[e] : n[e] || {};
}
var g, _, v = n(38), y = n(8), w = n(37), b = n(16), $ = n(3), E = n(6), k = 48e4, T = $.ACCOUNT_KEY, O = "__zlcstore", L = "__zlcmid", x = "__zlcpomid", A = "__zlcprivacy", I = {
init: i,
DOM: {
saveVariable: p,
getVariable: m
},
Cookie: b,
clearAll: l,
setIdentity: r,
getIdentity: o,
clearIdentity: s,
clearAllowCookieLaw: c,
getAllowCookieLaw: a,
setAllowCookieLaw: u
};
e.exports = I;
}, function(e, t, n) {
function i() {
var e = this;
this.arr = [];
this.validate = y.bind(this.validate, this);
$.concat([ "validateAndThrow", "validateAndLog" ]).forEach(function(t) {
e.validate[t] = e[t].bind(e);
});
return this.validate;
}
function o(e) {
return function(t) {
if (0 === e.length) return !1;
for (var n = 0, i = e.length; n < i; n++) {
if (!(0, e[n])(t)) return !1;
}
return new _('Expect "' + t + '" to fulfill at least one condition', t);
};
}
function r(e) {
return function(t) {
if (t !== e) return new _('expect "' + t + '" to equal "' + e + '"', t);
};
}
function s(e, t) {
return function(n) {
if ("object" != typeof n || !n) return new _('Expect "' + n + '" to be an object', n);
if (t && t.requiredKeys) for (var i = 0, o = t.requiredKeys.length; i < o; i++) {
var r = t.requiredKeys[i];
if (!(r in n)) {
var s = new _('Expect key "' + r + '" to be defined', n);
return s.unshiftPath(r);
}
}
for (var a in n) if (Object.prototype.hasOwnProperty.call(n, a)) {
var c, u = n[a], l = e[a];
if (l) c = l(u); else {
if (t && !t.whitelistedKeysOnly) continue;
c = new _('The key "' + a + '" is not whitelisted', n);
}
if (c) return c.unshiftPath(a);
}
};
}
function a(e) {
return function(t) {
if (typeof t !== e) return new _('Expect "' + t + '" to have type "' + e + '"', t);
};
}
function c() {
return function(e) {
if (!e) return new _('Expect "' + e + '" to be truthty', e);
};
}
function u(e) {
return function(t) {
e.lastIndex = 0;
if (!e.test(t)) return new _('Expect "' + t + '" to match predefined format', t);
};
}
function l(e) {
return function(t) {
if (t.length < e) return new _('Expect the length of "' + t + '" to be at least ' + e, t);
};
}
function d(e) {
return function(t) {
if (t.length > e) return new _('Expect the length of "' + t + '" to be at most ' + e, t);
};
}
function f() {
return function(e) {
if (!v(e)) return new _('Expect "' + e + '" to be an Array', e);
};
}
function h(e) {
return function(t) {
var n;
if (!v(t)) return new _('Expect "' + t + '" to be an Array', t);
for (var i = 0, o = t.length; i < o; i++) {
n = e(t[i]);
if (n) return n.unshiftPath(i);
}
};
}
function p(e, t) {
return function(n) {
if (!e(n)) return new _('Expect "' + n + '" to ' + t, n);
};
}
function m(e) {
return e;
}
function g(e) {
var t = window.console;
t.error ? t.error(e) : t.log && t.log(e);
}
function _(e, t) {
this.message = e;
this.actual = t;
this.paths = void 0;
this.unshiftPath = function(e) {
this.paths || (this.paths = []);
this.paths.unshift(e);
return this;
};
}
var v = n(7), y = n(9), w = window.Error, b = {
any: o,
equal: r,
obj: s,
type: a,
ok: c,
chain: m,
regex: u,
minLength: l,
maxLength: d,
array: f,
each: h,
predicate: p
}, $ = Object.keys(b), E = i.prototype;
$.forEach(function(e) {
var t = b[e];
i[e] = E[e] = function() {
if (!(this instanceof i)) {
var n = new i();
return n[e].apply(n, arguments);
}
var o = t.apply(null, arguments);
this.arr.push(o);
return this.validate;
};
});
E.validate = function(e) {
for (var t, n, i = 0, o = this.arr.length; i < o; i++) {
t = this.arr[i];
n = t(e);
if (n) return n;
}
};
E.validateAndThrow = function(e, t) {
var n = this.validate(e);
t = t ? t + " - " : "";
if (n) throw new w(t + n.message);
};
E.validateAndLog = function(e, t) {
var n = this.validate(e);
t = t ? t + " - " : "";
if (n) {
g(new w(t + n.message));
return n;
}
};
e.exports = i;
_.prototype = Object.create(w.prototype);
_.prototype.name = "ValidationError";
}, function(e, t, n) {
function i(e) {
m = e || window;
h = m.encodeURIComponent;
p = m.decodeURIComponent;
}
function o(e) {
return "string" == typeof e && "" != e;
}
function r() {
var e, t, n, i, o = m.document.cookie, r = {};
if (!o || "string" != typeof o) return {};
o = o.split(/;\s/);
for (e = o.length; e--; ) try {
t = o[e].match(/^([^=]+)(=(.*))?$/);
if (!t) continue;
n = p(t[1]);
i = p(t[3] || "");
r[n] = i;
} catch (e) {}
return r;
}
function s(e) {
return o(e) ? r()[e] || null : null;
}
function a(e) {
var t = s(e), n = {};
try {
n = d.parse(t);
} catch (e) {}
return n && "object" == typeof n ? n : {};
}
function c(e, t, n) {
n = n || {};
var i = h(e) + "=" + h(t);
if ("ttl" in n) {
var o = new Date(), r = 24 * n.ttl * 60 * 60 * 1e3;
o.setTime(o.getTime() + r);
i += "; expires=" + o.toGMTString();
}
"path" in n && (i += "; path=" + n.path);
"domain" in n && (i += "; domain=" + n.domain);
n.secure && (i += "; secure");
i += "; SameSite=" + (n.samesite || "Lax");
m.document.cookie = i;
}
function u(e, t, n) {
"object" != typeof t && (t = {});
c(e, d.stringify(t), n);
}
function l(e, t) {
t = t || {};
t.ttl = -1;
c(e, "", t);
}
var d = n(10), f = {
set: c,
get: s,
getJSONCookie: a,
setJSONCookie: u,
remove: l,
setActivityWindow: i
}, h = window.encodeURIComponent, p = window.decodeURIComponent, m = window;
e.exports = f;
}, function(e, t, n) {
function i(e, t, n) {
s.ok("function" == typeof e, "1st argument to nextTick must be a function");
if (n) for (var i = u.length; i-- > 0; ) if (u[i][0] === e && u[i][1] === t) return;
u.push([ e, t ]);
r || (r = setTimeout(o, 0));
}
function o() {
var e = +new Date() + c, t = u;
u = [];
r && (r = clearTimeout(r));
for (var n = 0, i = t.length; n < i; n++) {
try {
t[n][0].apply(t[n][1]);
} catch (e) {
a.fire("error", e);
}
if (+new Date() > e) {
if (n < i - 1) {
t.splice(0, n + 1);
if (u.length) u = t.concat(u); else {
u = t;
r = setTimeout(o, 0);
}
}
break;
}
}
}
var r, s = n(23), a = n(0), c = 100, u = [];
i.tick = o;
e.exports = i;
}, function(e, t, n) {
function i(e) {
var t, n, i = r.extend(this);
try {
t = new window.ActiveXObject("htmlfile");
t.open();
t.write("<script>document.win = window</script>");
t.close();
n = t.win;
} catch (e) {}
if (!n) {
var o = this.iframe = document.createElement("iframe"), a = o.style;
i.allowTransparency = "true";
i.frameBorder = "0";
a.backgroundColor = "transparent";
a.position = "absolute";
a.width = a.height = "1px";
a.left = a.top = "-9999px";
a.border = 0;
document.body.appendChild(o);
try {
n = o.contentWindow;
t = n.document;
t.open();
t.close();
} catch (e) {
i.fire("error");
i.destroy();
return;
}
}
i.doc = t;
i.win = n;
i.$Loader = {
cleanup: function() {
s(function() {
i.$Loader.payload ? i.fire("success", i.$Loader.payload) : i.fire("error");
i.$Loader.payload = null;
e || i.destroy();
});
}
};
i.reusable = e;
}
function o(e) {
return e && e.replace(a, function(e) {
return "&#" + e.charCodeAt(0) + ";";
});
}
var r = n(0), s = n(17);
i.prototype.setScope = function(e) {
this.scope = e;
};
var a = /[&<>"']/g;
i.prototype.load = function(e) {
if (/^(?:https?:)?\/\//i.test(e)) {
e = o(e);
try {
this.doc.open();
this.win.$Loader = this.$Loader;
this.win.$Loader.scope = this.scope || {};
this.doc.write('<html><head><script src="' + e + '"></script><script>document.addEventListener && document.addEventListener("DOMContentLoaded", function() {try { $Loader.cleanup() } catch(e) {}})</script></head><body></body></html>');
this.doc.close();
} catch (e) {
this.$Loader.cleanup();
}
} else this.$Loader.cleanup();
};
i.prototype.destroy = function() {
try {
this.iframe && document.body.removeChild(this.iframe);
this.doc = this.win = this.iframe = this.win.$Loader = null;
} catch (e) {}
};
e.exports = i;
}, function(e, t, n) {
var i = n(4), o = {};
o.$Data = i;
e.exports = o;
}, function(e, t) {
function n(e, t) {
function n() {
a = !a;
e.apply(o, i);
}
var i, o, r, s, a = !0;
return function() {
i = Array.prototype.slice.call(arguments);
o = this;
if (a) {
s = setTimeout(function() {
a = !0;
}, t);
return n();
}
s && clearTimeout(s);
r && clearTimeout(r);
r = setTimeout(n, t);
};
}
function i(e, t) {
function n() {
e.apply(o, i);
}
var i, o, r;
return function() {
r && clearTimeout(r);
i = Array.prototype.slice.call(arguments);
o = this;
r = setTimeout(n, t);
};
}
function o(e, t) {
function n() {
s = +new Date();
r = null;
e.apply(o, i);
}
var i, o, r, s = 0;
return function() {
i = Array.prototype.slice.call(arguments);
o = this;
if (!r) {
var e = +new Date() - s;
e >= t ? n() : r = setTimeout(n, t - e);
}
};
}
function r(e, t) {
function n() {
s = +new Date();
i = o.length > 1 ? setTimeout(n, t) : null;
e.apply(r.shift(), o.shift());
}
var i, o = [], r = [], s = 0;
return function() {
o.push(Array.prototype.slice.call(arguments));
r.push(this);
if (!i) {
var e = +new Date() - s;
e >= t ? n() : i = setTimeout(n, t - e);
}
};
}
var s = {
debounceExceptFirst: n,
debounce: i,
throttle: o,
queue: r
};
e.exports = s;
}, function(e, t) {
var n = "[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+([a-z0-9][a-z0-9-]*[a-z0-9])", i = "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)", o = {
email: new RegExp("^" + n + "$", "i"),
ip_token: new RegExp("^" + i + "$"),
ip: new RegExp("^(?:" + i + "\\.){3}" + i + "$"),
tld: /^(AERO|ARPA|ASIA|A[CDEFGILMNOQRSTUWXZ]|BIZ|B[ABDEFGHIJMNORSTVWYZ]|CAT|COM|COOP|C[ACDFGHIKLMNORUVXYZ]|D[EJKMOZ]|EDU|E[CEGRSTU]|F[IJKMOR]|GOV|G[ABDEFGHILMNPQRSTUWY]|H[KMNRTU]|INFO|INT|I[DELMNOQRST]|JOBS|J[EMOP]|K[EGHIMNPRWYZ]|L[ABCIKRSTUVY]||MIL|MOBI|MUSEUM|M[ACDEGHKLMNOPQRSTUVWXYZ]|NAME|NET|N[ACEFGILOPRUZ]|ORG|OM|PRO|P[AEFGHKLMNRSTWY]|QA|R[EOSUW]|S[ABCDEGHIJKLMNORTUVYZ]|TEL|TRAVEL|T[CDFGHJKLMNOPRTVWZ]|U[AGKSYZ]|V[ACEGINU]|W[FS]|XN|Y[ET]|Z[AMW])$/i,
search: {
email: new RegExp(n, "ig"),
email_lws: new RegExp("(^|\\s+)" + n, "ig"),
hurl: /(^|\s+)(?:(?:https?|ftps?):\/\/)(?:\S+)/gi,
url: /(^|\s+)(?:[\w-]+\.)+(\w{2,})(?::[0-9]+)?(?:\/\S*)?/g,
phone_number: /(?:^|\s+)(?:(?:\+?\d{1,3}|\(\d{1,3}\))([-.\s])?)?\d{3,10}(?:([-.\s])\d{3,10})?/gi
},
escape: function(e) {
return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
};
e.exports = o;
}, function(e, t) {
function n(e) {
return "number" == typeof e;
}
e.exports = n;
}, function(e, t, n) {
function i(e, t) {
e || r.log(t);
}
var o = n(5), r = {
ok: i,
isFunction: function(e, t) {
i(o(e), t);
}
};
r.log = function() {};
e.exports = r;
}, function(e, t) {
function n(e, t) {
c = e.$("connection");
u = t.$("tmp");
f = c.$("status$string");
h = c.$("socket_status$string");
p = c.$("disconnection_status$string");
m = c.$("socket_resume_timestamp$int");
g = c.$("socket_open_timestamp$int");
_ = c.$("client_reattached_timestamp$int");
v = e.$("livechat").$("account").$("status$string");
y = e.$("visitor").$("auth_status$string");
c.bindValue(r);
}
function i() {
c && c.unbindValue(r);
}
function o() {
i();
l = clearTimeout(l);
c = u = null;
f = h = p = m = g = _ = v = y = null;
d = void 0;
}
function r(e) {
e && "resume" == e.socket_status$string && (l = setTimeout(r, 1e3));
var t = s();
if (t && t !== d) {
u.update({
friendly_connection_status$string: t
});
d = t;
}
}
function s() {
var e = +new Date(), t = f.getValue(), n = h.getValue(), i = p.getValue(), o = m.getValue(), r = g.getValue(), s = _.getValue();
if ((n || t || i) && "disconnecting" !== i) {
if ("break" == n) {
if (w.indexOf(t) > -1) return "closed";
if ("disconnected" === i) return "closed";
}
return (null === n || "reconnect" == n || "resume" == n && e - o >= 1e3) && "reattached" === t && r <= s ? "connected" : "connecting";
}
}
function a() {
var e = f.getValue(), t = v.getValue(), n = p.getValue(), i = y.getValue();
return "banned" === t ? "banned" : "disconnected" === n ? "failed" === i ? "authentication_failed" : "logged_out" : "idle_disconnect" === e ? "idle_disconnect" : "error" === e || "shutdown" === e ? "server_error" : "unknown";
}
var c, u, l, d, f, h, p, m, g, _, v, y, w = [ "idle_disconnect", "shutdown", "error" ], b = {
init: n,
reset: o,
destroy: i,
getConnectionClosedReason: a
};
e.exports = b;
}, function(e, t, n) {
function i(e, t) {
t = t || window;
r = e.$("livechat").$("profile");
var n = {
window: s.extend(t, !0),
document: s.extend(t.document, !0)
}, i = a.throttle(o, u);
n.document.on("mousemove", i);
n.window.on("click", i);
n.window.on("scroll", i);
n.window.on("keypress", i);
i();
}
function o() {
r.write({
active$int: +new Date()
});
}
var r, s = n(0), a = n(20), c = {
init: i
}, u = 3e5;
e.exports = c;
}, function(e, t, n) {
var i = n(11), o = {
livechat: {
timestamp$int: +new Date(),
settings: {
file_sending: {
enabled$bool: !0
},
behavior: {
do_not_display$bool: !1
},
theme: {
name$string: "simple",
message_type$string: "bubble_avatar",
colors: {
placeholder$string: "_"
},
chat_button: {
position$string: "br",
position_mobile$string: "br"
},
chat_window: {
position$string: "br",
size$string: "medium",
profile_card: {
display_avatar$bool: !0,
display_rating$bool: !0,
display_title_name$bool: !0
},
use_banner$bool: !0,
title_bar: {
hide_minimize$bool: !1,
hide_popout$bool: !1
}
},
branding: {
type$string: "icon_font_zopim"
}
},
greetings: {
online$string: i("Chat With Us"),
offline$string: i("Leave a Message")
},
banner: {
enabled$bool: !0,
layout$string: "image_right",
text$string: i("Chat with us"),
image_path$string: "",
image_data$string: ""
},
chat_button: {
hide_when_offline$bool: !1
},
chat_window: {
mobile_mode$string: "popout",
title_bar: {
title$string: i("support"),
status_messages: {
online$string: i("We're online."),
away$string: i("We're away."),
offline$string: i("We're offline.")
}
}
},
login: {
allowed_types: {
email$bool: !0,
facebook$bool: !0,
twitter$bool: !1,
google$bool: !0
},
phone_display$bool: !1,
restrict_profile$bool: !1
},
concierge: {
display_name$string: i("Live Support"),
title$string: i("Ask us anything"),
avatar_path$string: "",
avatar_data$string: "",
greeting: {
enabled$bool: !1,
message$string: i("Hi, welcome to our website!")
}
},
branding: {
hide_branding$bool: !1,
hide_favicon$bool: !1,
custom_favicon_path$string: ""
},
language: {
language$string: "--"
},
cookie_law: {
enabled$bool: !1
},
sound: {
disabled$bool: !1
},
popout: {
enabled$bool: !0
},
rating: {
enabled$bool: !0
},
end_chat_menu: {
enabled$bool: !0,
message$string: ""
},
emoticons: {
enabled$bool: !1
},
bubble: {
enabled$bool: !0,
title$string: i("Questions?"),
text$string: i("Click here to chat with us")
},
forms: {
pre_chat_form: {
required$bool: !1,
profile_required$bool: !1,
message$string: "",
form: {
0: {
name$string: "name",
required$bool: 0
},
1: {
name$string: "email",
required$bool: 0
},
2: {
label$string: i("Choose a department"),
name$string: "department",
required$bool: 0,
type$string: "department"
},
3: {
label$string: i("Message"),
name$string: "message",
required$bool: 0,
type$string: "textarea"
},
4: {
label$string: i("Phone"),
name$string: "phone",
required$bool: 0,
type$string: "text",
hidden$bool: !0
}
}
},
offline_form: {
message$string: i("Sorry, we aren't online at the moment. Leave a message and we'll get back to you."),
message_disabled$string: i("Sorry, we aren't online at the moment."),
post_submit_message$string: i("Thanks for the message! We'll get back to you as soon as we can."),
profile_required$bool: !0,
form: {
0: {
name$string: "name",
required$bool: 1
},
1: {
name$string: "email",
required$bool: 1
},
2: {
label$string: i("Message"),
name$string: "message",
required$bool: 1,
type$string: "textarea"
},
3: {
label$string: i("Phone"),
name$string: "phone",
required$bool: 0,
type$string: "text",
hidden$bool: !0
}
}
},
post_chat_form: {
header$string: i("Nice chatting with you!"),
message$string: i("How would you rate the chat experience you just had?"),
comments_enabled$bool: !0,
comments_messages: {
good: {
message$string: i("Thanks for the good rating! Would you like to leave a comment?"),
placeholder$string: i("What did you like about this chat?")
},
bad: {
message$string: i("Sorry that we disappointed you. We'd appreciate it if you could tell us how to improve."),
placeholder$string: i("What did you dislike about this chat?")
}
}
},
card_form: {}
}
}
}
};
e.exports = o;
}, function(e, t) {
function n(e) {
"use strict";
if (null == this) throw new TypeError();
var t = Object(this), n = t.length >>> 0;
if (0 === n) return -1;
var i = 0;
if (arguments.length > 0) {
i = Number(arguments[1]);
i != i ? i = 0 : 0 != i && i != 1 / 0 && i != -1 / 0 && (i = (i > 0 || -1) * Math.floor(Math.abs(i)));
}
if (i >= n) return -1;
for (var o = i >= 0 ? i : Math.max(n - Math.abs(i), 0); o < n; o++) if (o in t && t[o] === e) return o;
return -1;
}
function i(e, t, n) {
return o.call(t, e, n);
}
var o = Array.prototype.indexOf;
"function" == typeof o && /\[native code\]/.test(o.toString()) || (o = n);
e.exports = i;
}, function(e, t, n) {
var i = n(11), o = n(27), r = n(1), s = i("File size too large. Maximum limit is <size>."), a = i("The file you are trying to send is not supported."), c = i("File sending is temporarily disabled. Please try again later."), u = i("<size> bytes"), l = i("<size> KB"), d = i("<size> MB"), f = {};
f.ERR_SIZE = "TOO_LARGE";
f.ERR_FORMAT = "ILLEGAL_TYPE";
f.ERR_DISABLED = "FILE_UPLOADS_TEMPORARILY_DISABLED";
var h = /^(x-|vnd\.)/i, p = [ "png", "jpg", "jpeg", "gif", "txt", "pdf" ], m = {}, g = i("Failed to send. Please try again.");
m[f.ERR_SIZE] = s;
m[f.ERR_FORMAT] = a;
m[f.ERR_DISABLED] = c;
f.prettySize = function() {
var e = [ u, l, d ], t = [ 0, 1, 2 ];
return function(n, i) {
n = Math.max(parseInt(n, 10) || 0, 0);
i = i || {};
for (var o, r = i.base2 ? 1024 : 1e3, s = e.length; s--; ) {
o = Math.pow(r, s);
if (n >= o) return e[s].replace("<size>", (n / o).toFixed(t[s]));
}
};
}();
f.prettyType = function(e, t, n) {
n = n || window.Infinity;
var i = e.split("/")[1];
i = i && i.replace(h, "");
if (i && i.length < n) return i.toLowerCase();
i = t.split(".").pop();
return (i || "").toLowerCase();
};
f.isValidType = function(e, t) {
if (e) {
t = t || p;
var n = e.substr(e.lastIndexOf(".") + 1).toLowerCase();
return -1 !== o(n, t);
}
};
f.prettyError = function(e, t) {
var n = e in m ? m[e] : g;
r(t) || (n = n.replace("<size>", f.prettySize(t || 5e6)));
return n;
};
f.blobToFile = function(e, t, n) {
e.lastModifiedDate = new Date();
e.name = t;
return new window.File([ e ], t, {
type: n
});
};
f.getExtension = function(e) {
var t = e.lastIndexOf(".");
return -1 === t ? null : e.substr(t + 1).toLowerCase();
};
e.exports = f;
}, function(e, t, n) {
function i(e, t) {
f = e;
h = t;
f.$("livechat").$("channel").$("department_id$int").on("value", function(e) {
e && (p = e);
});
}
function o() {
p = void 0;
}
function r(e, t, n) {
var i = parseInt(t, 10) || parseInt(h.getServerTime().toFixed(0), 10), o = i + "", r = f.$("livechat").$("profile"), s = p, a = (e.msg || "") + "";
"department" in e && (s = e.department);
f.$("livechat").$("channel").$("log").$(o).write({
timestamp$int: i,
type$string: "chat.msg",
msg$string: a,
nick$string: r.$("nick$string").getValue() || "",
display_name$string: r.$("display_name$string").getValue() || "",
department_id$int: s,
unverified$bool: !0,
__client$bool: !0
}, n);
}
function s(e, t) {
var n = parseInt(t, 10) || parseInt(h.getServerTime().toFixed(0), 10), i = n + "";
f.$("livechat").$("channel").$("log").$(i).write({
timestamp$int: n,
nick$string: f.$("livechat").$("profile").$("nick$string").getValue() || "",
display_name$string: f.$("livechat").$("profile").$("display_name$string").getValue() || "",
type$string: "chat.file.upload",
file_name$string: e.file_name || "",
file_type$string: e.file_type || "",
file_size$int: e.file_size || 0,
unverified$bool: !0,
__client$bool: !0
});
return n;
}
function a(e, t) {
function n(e) {
if ("ok" !== e.raw.__status) return t(new window.Error(d(e.raw.error)));
if (!e.raw.data || "chat.file" !== e.raw.data.type) return t(new window.Error("INTERNAL_ERROR"));
t(null, b.pick(e.raw.data, [ "mime_type", "name", "size", "url", "metadata" ]));
}
var i = k._validateAndPrepareData([ e ]);
t = _.once(t);
if (m(i)) g(function() {
t(new window.Error(i));
}); else {
var o = h.registerCallback(n), r = "https://" + i.host + v.CALLBACK_FILE_UPLOAD_PATH, s = {
ts: parseInt(h.getServerTime().toFixed(0), 10),
__messageID: o,
__socketID: h.getSocketID()
}, a = {
"X-Zopim-MID": i.mid,
"X-Zopim-UID": i.uid
}, c = {
error: function() {
t(new window.Error("CONN_ERROR"));
},
load: function() {
if (200 !== this.status) {
var e;
try {
e = JSON.parse(this.responseText);
} catch (e) {}
t(e && e.error ? new window.Error(d(e.error)) : new window.Error("INTERNAL_ERROR"));
}
}
};
k._uploadFiles(i.form_data, r, s, a, c);
}
}
function c(e, t) {
var n = k._validateAndPrepareData(e);
if (m(n)) return n;
var i = s({
file_name: n.name,
file_type: n.type,
file_size: n.size
}, t), o = "https://" + n.host + v.FILE_UPLOAD_PATH, r = {
ts: i
}, a = {
"X-Zopim-MID": n.mid,
"X-Zopim-UID": n.uid
};
k._uploadFiles(n.form_data, o, r, a);
}
function u(e) {
if (!window.FormData) return "NOT_SUPPORTED";
var t = f.$("livechat"), n = t.$("settings").$("file_sending"), i = t.$("settings").$("package"), o = n.$("enabled$bool").getValue(), r = (n.$("allowed_extensions$string").getValue() || "").trim().replace(/\s*,\s*/g, ",").split(","), s = i.$("color_customization_enabled$int").getValue() || i.$("widget_customization_enabled$int").getValue(), a = t.$("profile").$("mid$string").getValue(), c = t.$("profile").$("uid$string").getValue(), u = h.getHost(), l = new window.FormData(), d = [], p = [], m = 0;
if (!u) return "CONN_ERROR";
if (!s) return "INVALID_PLAN";
if (!o) return "NOT_ALLOWED";
for (var g = 0, _ = e.length; g < _; g++) {
if (!y.isValidType(e[g].name, r)) return "INVALID_EXTENSION";
d.push(e[g].name);
p.push(e[g].type);
m += e[g].size || 0;
l.append("file_" + e[g].name, e[g]);
}
return m > v.FILE_UPLOAD_MAX ? "EXCEED_SIZE_LIMIT" : {
form_data: l,
name: d.join(", "),
type: p.join(", "),
size: m,
host: u,
mid: a,
uid: c
};
}
function l(e, t, n, i, o) {
var r = new window.XMLHttpRequest(), s = t + (Object.keys(n).length ? "?" + w.buildQuery(n) : "");
if (r.upload) {
r.open("POST", s, !0);
for (var a in i) Object.prototype.hasOwnProperty.call(i, a) && r.setRequestHeader(a, i[a]);
for (var c in o) Object.prototype.hasOwnProperty.call(o, c) && r.addEventListener(c, o[c]);
r.send(e);
}
}
function d(e) {
return E[e] || "UNKNOWN_ERROR";
}
var f, h, p, m = n(12), g = n(17), _ = n(9), v = n(3), y = n(28), w = n(8), b = n(6), $ = {
NOT_SUPPORTED: "NOT_SUPPORTED",
NOT_ALLOWED: "NOT_ALLOWED",
CONN_ERROR: "CONN_ERROR",
INVALID_EXTENSION: "INVALID_EXTENSION",
INVALID_PLAN: "INVALID_PLAN",
EXCEED_SIZE_LIMIT: "EXCEED_SIZE_LIMIT",
INTERNAL_ERROR: "INTERNAL_ERROR",
UNKNOWN_ERROR: "UNKNOWN_ERROR"
}, E = {
TOO_LARGE: "EXCEED_SIZE_LIMIT",
ILLEGAL_TYPE: "INVALID_EXTENSION",
NO_SESSION: "INTERNAL_ERROR",
UNEXPECTED_ERROR: "INTERNAL_ERROR",
UNABLE_TO_GET_SETTINGS: "INTERNAL_ERROR",
S3_UPLOAD_ERROR: "INTERNAL_ERROR",
NO_GATES: "INTERNAL_ERROR",
FILE_UPLOADS_DISABLED: "NOT_ALLOWED",
FILE_UPLOADS_TEMPORARILY_DISABLED: "INVALID_PLAN"
}, k = {
FILE_SENDING_ERRORS: $,
init: i,
sendChatMsg: r,
sendFiles: c,
sendFileWithCallback: a,
clearChatDepartmentID: o,
_validateAndPrepareData: u,
_uploadFiles: l
};
e.exports = k;
}, function(e, t) {
var n = {};
n.SECOND = 1e3;
n.MINUTE = 60 * n.SECOND;
n.HOUR = 60 * n.MINUTE;
n.DAY = 24 * n.HOUR;
n.WEEK = 7 * n.DAY;
e.exports = n;
}, function(e, t, n) {
function i(e) {
var t = this, n = this.longpoll = new s(!0), i = this.sender = new s(!0);
n.on("success", function(e) {
t.process_data(e);
});
n.on("error", function() {
t.abort("longpoll error");
});
i.on("success", function() {
t.ondrain && t.ondrain();
});
i.on("error", function() {
t.abort("sender error");
});
this.url = "https://" + e;
o.window.on("unload", this.unload = function() {
t.abort("unload");
});
this.longpoll.load(this.url + [ "c", +new Date() ].join("/"));
}
var o = n(0), r = i;
i.protocol = "xdds";
var s = n(18);
i.prototype.process_data = function(e) {
if (e && !this._abort) {
!this.ts && this.onopen && this.onopen();
this.ts = +new Date();
this.onmessage && this.onmessage(e, this.ts);
this.longpoll && this.longpoll.load(this.url + [ "p", +new Date() ].join("/"));
}
};
i.prototype.send = function(e) {
if (this._abort) return !1;
var t = this.url + [ "d", +new Date(), window.encodeURIComponent(e) ].join("/");
this.sender && this.sender.load(t);
return !1;
};
i.prototype.abort = function(e) {
if (!this._abort) {
this._abort = !0;
a("XDDS - abort: " + e);
o.window.un("unload", this.unload);
this.longpoll.destroy();
this.sender.destroy();
this.longpoll = this.sender = this.unload = null;
this.onclose && this.onclose(e);
window.CollectGarbage && window.CollectGarbage();
}
};
var a = function() {};
e.exports = r;
}, function(e, t) {
function n(e) {
var t, n = this;
try {
t = new i("wss://" + e + [ "c", +new Date() ].join("/"));
} catch (e) {}
if (t) {
t.onclose = function(e) {
n.onclose && n.onclose(e);
};
t.onerror = function(e) {
n.onerror && n.onerror(e);
};
t.onmessage = function(e) {
n.onmessage && n.onmessage(e.data, +new Date());
};
t.onopen = function(e) {
n.onopen && n.onopen(e);
};
this.ws = t;
}
}
var i = window.WebSocket || window.MozWebSocket, o = i ? n : null;
n.prototype.abort = function() {
if (this.ws && !this._aborted) {
this._aborted = !0;
var e = this.ws;
e.readyState == i.CONNECTING ? e.onopen = function() {
e.close();
} : e.close();
}
};
n.prototype.send = function(e) {
this.ws && this.ws.send(e);
return !0;
};
n.protocol = "ws";
e.exports = o;
}, function(e, t, n) {
function i(e) {
function t(e) {
!c && r.onopen && r.onopen();
c = +new Date();
e.origin == i && ("event-stream" == e.data ? s.onload = null : r.onmessage && r.onmessage(e.data, c));
}
var n, i, r = this, s = this.iframe = o("iframe");
this.url = "https://" + e;
s.src = this.src = n = this.url + [ "c", +new Date() ].join("/");
i = n.match(/https?:\/\/[^\/]+/)[0];
s.onload = function(e) {
r.abort(e);
};
document.body.insertBefore(s, document.body.firstChild);
a("SPM connecting to: " + this.url);
window.addEventListener("message", t, !1);
this.remove_listeners = function() {
window.removeEventListener("message", t, !1);
};
var c;
}
function o(e) {
var t = document.createElement(e), n = t.style;
n.position = "absolute";
n.width = n.height = 0;
n.overflow = "hidden";
return t;
}
var r = n(2), s = window.postMessage ? !r.isAndroid && i : null;
i.protocol = "spm";
i.prototype.send = function(e) {
this.iframe.contentWindow.postMessage(e, this.src);
return !0;
};
i.prototype.abort = function(e) {
if (!this._abort) {
this._abort = !0;
a(e);
this.iframe && document.body.removeChild(this.iframe);
this.onclose && this.onclose(e);
this.remove_listeners();
this.iframe = this.remove_listeners = null;
}
};
var a = function() {};
e.exports = s;
}, function(e, t, n) {
function i(e) {
function t(e) {
c("extracting data");
!n && s.onopen && s.onopen();
n = e;
u += i.responseText.substr(l);
l = i.responseText.length;
u = u.split("\n\n");
for (var t = 0; t < u.length - 1; t++) s.onmessage && s.onmessage(u[t], n);
u = u[u.length - 1];
(l > 1048576 && !u.length || l > 4194304) && s.abort();
}
var n, i = this.xhr = new r(), s = this, u = "", l = 0;
this.url = a + e;
i.open("GET", this.url + [ "c", +new Date() ].join("/"), !0);
i.onerror = function(e) {
s.abort(e);
};
if (o.isIE) {
i.onprogress = function() {
t(+new Date());
};
i.onload = function() {
s.abort("close");
};
} else i.onreadystatechange = function() {
switch (i.readyState) {
case 3:
t(+new Date());
break;

case 4:
s.abort("close");
}
};
c("CXHR connecting to: " + this.url);
i.send();
}
var o = n(2), r = o.isIE ? window.XDomainRequest : !o.isOpera && !o.isAndroid && window.XMLHttpRequest, s = r ? i : null, a = o.isIE ? "//" : "https://";
i.protocol = "cxhr";
i.prototype.send = function(e) {
function t() {
c.abort("send failed");
}
function n() {
c.xhr_sender = null;
clearTimeout(i);
c.ondrain && c.ondrain();
}
var i, s = this.url + [ "d", +new Date() ].join("/"), a = new r(), c = this;
a.open("POST", s, !0);
a.send(e);
if (o.isIE) {
a.onerror = t;
a.onload = n;
} else a.onreadystatechange = function() {
if (4 == a.readyState) {
200 != a.status && t();
n();
}
};
i = setTimeout(t, 5e3);
this.xhr_sender = a;
return !1;
};
i.prototype.abort = function(e) {
if (!this._abort) {
this._abort = !0;
c(e);
this.xhr && this.xhr.abort();
this.xhr_sender && this.xhr_sender.abort();
this.onclose && this.onclose(e);
this.onerror = this.onload = this.onprogress = this.onreadystatechange = this.xhr = this.xhr_sender = null;
}
};
var c = function() {};
e.exports = s;
}, function(e, t, n) {
function i(e, t, n, o) {
this.options = o = o || {};
for (var r in _) r in o || (o[r] = _[r]);
if (!m && !o.PREFERRED_PROVIDER) throw "No available transports";
u.extend(this);
this.provider = o.PREFERRED_PROVIDER || m;
this.id = n || i.generateID();
this.host = e;
this.ns = t;
this.path = "/" + [ "s", this.ns, this.provider.protocol, this.id ].join("/");
this.url = this.host + this.path + "/";
this.status = window.navigator && !1 === window.navigator.onLine ? "offline" : "connecting";
this.connected = !1;
this.quality = 0;
this.rtt = o.INITIAL_RTT;
this.clock_skew = 0;
this.connect_attempts = 0;
this.connections = 0;
this.disconnects = 0;
this.sent_bytes = 0;
this.recv_bytes = 0;
this.sent_messages = 0;
this.recv_messages = 0;
this.sent_frames = 0;
this.recv_frames = 0;
this.lost_frames = 0;
this.ooo_frames = 0;
this.remote_seq = 0;
this.local_seq = 0;
this.timeout_server = 0;
this.timeout_response_soft = 0;
this.timeout_response_hard = 0;
this.bytes_at_connect = -1;
this.time_last_alive = -1;
this.time_last_open = -1;
this.starttime = Date.now();
this.uptime = 0;
this.connected_time = new a();
this.idle_time = new a();
this.last_frame_time = 0;
this.raw_clock_skew = 0;
this.smooth_skewed_transit_time_in = 0;
this.remote_smooth_skewed_transit_time_out = 0;
this.cur_conn_recv_messages = 0;
this.drained = !0;
this.buffer = [];
this.glitch_timer = this.reconnect_timer = null;
this.reconnect_delay = o.RECONNECT_DELAY_MS * (.2 * Math.random() + .8);
this.keep_alive_interval = 15e3;
this.data_packet_queue = new c(this);
var s = this;
this.onoffline = function() {
i.prototype.onoffline.call(s);
};
this.ononline = function() {
i.prototype.ononline.call(s);
};
u.window.on("offline", this.onoffline);
u.window.on("online", this.ononline);
"connecting" === this.status && this.connect();
}
function o() {
var e = w, t = new Date(), n = t.getUTCFullYear() - 2e3, i = t.getUTCMonth() + 1, o = t.getUTCDate(), r = t.getUTCHours(), s = t.getUTCMinutes(), a = t.getUTCSeconds(), c = t.getUTCMilliseconds();
return e[n] + e[i] + e[o] + e[r] + e[s] + e[a] + e[c >> 6] + e[63 & c];
}
function r(e) {
for (var t = "", n = w; e-- > 0; ) t += n.charAt(Math.floor(Math.random() * n.length));
return t;
}
function s(e, t, n) {
return Math.min(n, Math.max(t, e));
}
function a() {
this.count = 0;
this.sum = 0;
this.sq_sum = 0;
this.mean = 0;
this.stddev = 0;
}
function c(e) {
this.socket = e;
this.queue = [];
this.curFrame = null;
this.curIdx = 0;
this.last_work_finished_time = 0;
this.work_timer = null;
this.processing = !1;
}
var u = n(0), l = n(10), d = n(34), f = n(33), h = n(32), p = n(31), m = h || d || f || p, g = p, _ = {
INITIAL_RTT: 1e3,
RECONNECT_DELAY_MS: 3e4,
FAST_RECONNECT_MS: 100,
FLUSH_DELAY_MS: 75,
MAX_BLOCKING_TIME_MS: 40,
MAX_NO_WORK_TIME_MS: 15,
PREFERRED_PROVIDER: void 0
};
i.providers = {};
[ d, f, h, p ].forEach(function(e) {
e && (i.providers[e.protocol] = e);
});
i.available = function() {
return !!m;
};
i.generateID = function() {
return r(16);
};
i.prototype.connect = function(e) {
this.debug("connect(" + (e && "glitch" || "") + ")");
if (!this.reconnect_timer) {
var t = this, n = this.options, i = !this.connections || !this.cur_conn_recv_messages;
!n.PREFERRED_PROVIDER && i && (this.provider = 1 & this.connect_attempts ? g : m);
this.response_timer = clearTimeout(this.response_timer);
this.timeout_timer = clearTimeout(this.timeout_timer);
if (this.socket) {
this.socket.onclose = this.socket.ondrain = this.socket.onerror = this.socket.onmessage = this.socket.onopen = null;
this.socket.abort("connect");
this.socket = null;
}
this.connected = !1;
this.cur_conn_recv_messages = 0;
if (e) {
this.reconnect_delay = n.RECONNECT_DELAY_MS * (.2 * Math.random() + .9);
this.glitch_timer = setTimeout(function() {
t.quality = 0;
t.glitch_timer = setTimeout(function() {
t.status = "reconnecting";
t.fire_break();
}, s(3 * t.rtt, 1e3, 5e3));
}, s(3 * this.rtt, 1e3, 5e3));
}
this.debug("reconnect_delay: " + this.reconnect_delay);
clearTimeout(this.reconnect_timer);
this.reconnect_timer = setTimeout(function() {
t.reconnect_timer = null;
t.reconnect_delay = Math.min(1.4 * t.reconnect_delay + 1e3, 6e4);
t.reconnect_delay *= .2 * Math.random() + .9;
t.connect();
}, this.reconnect_delay);
this.path = "/" + [ "s", this.ns, this.provider.protocol, this.id ].join("/");
this.url = this.host + this.path + "/";
this.debug("connecting: " + this.url);
this.socket = new this.provider(this.url);
this.transport = this.provider.protocol;
this.connect_attempts++;
this.socket.onopen = function() {
t.status = "connected";
t.glitch_timer = clearTimeout(t.glitch_timer);
t.reconnect_timer = clearTimeout(t.reconnect_timer);
t.connections++;
t.drained = !0;
t.connected = !0;
t.time_last_open = t.time_last_alive = Date.now();
t.uptime >= 0 && (t.uptime -= t.time_last_open);
1 == t.connections ? t.fire("open") : t.fire_resume();
t.flush();
t.keep_alive();
t.debug("connected");
-1 == t.bytes_at_connect && setTimeout(function() {
t.bytes_at_connect = t.recv_bytes;
}, 50);
};
this.socket.onmessage = function(e, n) {
t.onmessage(e, n);
};
this.socket.onclose = function(e) {
t._onclose(e);
};
this.socket.ondrain = function(e) {
t._ondrain(e);
};
this.socket.onerror = function(e) {
t._onerror(e);
};
}
};
i.prototype.reconnect = function() {
this.reconnect_timer = clearTimeout(this.reconnect_timer);
this.broken_reason = "FORCED_RECONNECT";
this.connect();
};
i.prototype.send = function(e, t) {
if ("disconnected" != this.status) {
"null" == this.buffer[0] && (this.buffer = []);
this.buffer.push(l.stringify(e));
this.schedule_flush();
t && this.response_timeout();
}
};
i.prototype.close = function(e) {
this.debug("close()");
this.flush_scheduled = clearTimeout(this.flush_scheduled);
this.keep_alive_timer = clearTimeout(this.keep_alive_timer);
this.reconnect_timer = clearTimeout(this.reconnect_timer);
this.response_timer = clearTimeout(this.response_timer);
this.timeout_timer = clearTimeout(this.timeout_timer);
this.broken_reason || (this.broken_reason = "CLOSE");
this.fire_break();
this.status = e ? "reconnecting" : "disconnected";
this.connected = !1;
this.quality = 0;
if (this.socket) {
this.socket.onclose = this.socket.ondrain = this.socket.onerror = this.socket.onmessage = this.socket.onopen = null;
this.socket.abort("close");
this.socket = null;
if (!e) {
u.window.un("offline", this.onoffline);
u.window.un("online", this.ononline);
}
}
};
i.prototype.hibernate = function() {};
i.prototype.onoffline = function() {
this.debug("onoffline");
this.broken_reason = "OFFLINE";
this.close(!0);
};
i.prototype.ononline = function() {
this.debug("ononline");
if ("disconnected" != this.status && !this.connected) {
this.reconnect_timer = clearTimeout(this.reconnect_timer);
this.connect();
}
};
i.prototype.schedule_flush = function() {
if ("disconnected" != this.status && !this.flush_scheduled && this.drained && this.connected) {
var e = this, t = this.options;
this.flush_scheduled = setTimeout(function() {
e.flush();
}, t.FLUSH_DELAY_MS);
}
};
i.prototype.flush = function() {
if ("disconnected" != this.status && this.buffer.length && this.drained && this.connected) {
var e = this.buffer;
this.sent_messages += e.length;
this.sent_frames++;
e = this.generate_frame(e.join("\n"));
this.drained = this.socket.send(e);
this.sent_bytes += e.length;
this.flush_scheduled = clearTimeout(this.flush_scheduled);
this.buffer = [];
this.keep_alive();
this.time_last_alive = Date.now();
}
};
i.prototype.keep_alive = function() {
if ("disconnected" != this.status) {
clearTimeout(this.keep_alive_timer);
var e = this;
this.keep_alive_timer = setTimeout(function() {
e.debug("pong!");
e.send(null);
}, this.keep_alive_interval);
}
};
i.prototype.response_timeout = function() {
if (!this.response_timer) {
var e = this, t = s(4 * this.rtt + this.options.FLUSH_DELAY_MS, 2e3, 2e4);
this.response_timer = setTimeout(function() {
e.timeout_response_soft++;
e.debug("response timeout, " + t + "ms");
e.fire_break("SOFT_RESPONSE_TIMEOUT");
e.response_timer = setTimeout(function() {
e.timeout_response_hard++;
e.debug("response timeout - reconnecting");
e.broken_reason = "HARD_RESPONSE_TIMEOUT";
e.connect(!0);
}, 2 * t);
}, t);
}
};
i.prototype.reset_server_timeout = function() {
clearTimeout(this.timeout_timer);
var e = this, t = 4 * this.keep_alive_interval + s(4 * e.rtt, 2e3, 2e4);
this.timeout_timer = setTimeout(function() {
e.timeout_server++;
e.debug("server " + t + "ms timeout, reconnecting");
e.broken_reason = "SERVER_TIMEOUT";
e.connect(!0);
}, t);
};
i.prototype.fire_break = function(e) {
this.broken || this.fire("break", e || this.broken_reason);
this.broken = !0;
this.broken_reason = "";
this.uptime < 0 && (this.uptime += Date.now());
};
i.prototype.fire_resume = function() {
this.broken_reason = "";
this.broken && this.fire("resume");
this.broken = !1;
this.uptime >= 0 && (this.uptime -= Date.now());
};
i.prototype.onmessage = function(e, t) {
this.recv_bytes += e.length;
e = e.split("\n");
if (e.length < 6) this.debug("Bad data: " + e.join("\n")); else {
var n = Date.now(), i = +e[0], o = +e[1], r = +e[2], s = (e[3], e[4]);
this.calculate_clocks(t || Date.now(), i, o);
this.reset_server_timeout();
switch (s) {
case "a":
this.broken_reason = "ABORT";
this.close();
break;

case "d":
this.response_timer = clearTimeout(this.response_timer);
this.fire_resume();
this.check_sequence(r);
this.data_packet_queue.queueFrame(e, 5, n);
break;

case "e":
this.debug("server: Are you still there?");
this.send(null);
this.flush();
break;

case "n":
this.remote_seq = r;
this.keep_alive_interval = +e[5] || 15e3;
this.debug("keep_alive is " + this.keep_alive_interval + "ms");
this.reset_server_timeout();
this.connections > 1 && this.fire("reopen");
break;

case "p":
this.debug("ping!");
}
}
};
i.prototype._onclose = function() {
var e = this, t = this.options;
0 == this.connections && 0 == this.disconnects && this.fire("close");
this.debug("_onclose");
this.disconnects++;
this.broken_reason = "HANGUP";
if (this.connected) {
clearTimeout(this.reconnect_timer);
this.reconnect_timer = setTimeout(function() {
e.reconnect_timer = null;
e.connect(!0);
}, t.FAST_RECONNECT_MS);
} else if (!this.connections && 1 == this.connect_attempts) {
clearTimeout(this.reconnect_timer);
this.reconnect_timer = setTimeout(function() {
e.reconnect_timer = null;
e.connect();
}, 0);
}
this.connected = !1;
clearTimeout(this.keep_alive_timer);
this.time_last_alive > 0 && this.idle_time.add(Date.now() - this.time_last_alive);
this.time_last_open > 0 && this.connected_time.add(Date.now() - this.time_last_open);
this.time_last_alive = this.time_last_open = -1;
this.uptime < 0 && (this.uptime += Date.now());
};
i.prototype._ondrain = function() {
this.drained = !0;
this.flush();
};
i.prototype._onerror = function(e) {
this.debug("_error");
this.fire("error", e);
};
i.prototype.generate_frame = function(e, t) {
return [ Date.now(), this.smooth_skewed_transit_time_in, ++this.local_seq, this.remote_seq, t || "d", e ].join("\n");
};
var v = Math.pow(50, .1), y = Math.pow(1e3, .1) - v;
i.prototype.calculate_clocks = function(e, t, n) {
var i = e - t, o = Math.max(0, e - this.last_frame_time), r = 1 / (o / 45e3 + 1);
this.smooth_skewed_transit_time_in ? this.smooth_skewed_transit_time_in = r * this.smooth_skewed_transit_time_in + (1 - r) * i : this.smooth_skewed_transit_time_in = i;
this.remote_smooth_skewed_transit_time_out = n;
if (this.smooth_skewed_transit_time_in && this.remote_smooth_skewed_transit_time_out) {
this.rtt = this.smooth_skewed_transit_time_in + this.remote_smooth_skewed_transit_time_out;
this.quality = ~~(100 * (1 - (Math.pow(this.rtt, .1) - v) / y));
this.quality = Math.min(100, Math.max(0, this.quality));
this.raw_clock_skew = i - this.rtt / 2;
this.clock_skew ? this.clock_skew = .9 * this.clock_skew + .1 * this.raw_clock_skew : this.clock_skew = this.raw_clock_skew;
}
this.time_last_alive = this.last_frame_time = e;
};
i.prototype.check_sequence = function(e) {
if (this.remote_seq + 1 == e) this.remote_seq = e; else if (this.remote_seq < e) {
var t = e - this.remote_seq + 1;
this.lost_frames += t;
this.fire("lost", t);
this.remote_seq = e;
} else {
this.ooo_frames++;
this.fire("out_of_order");
}
};
m && (i.prototype.transport = m.protocol);
i.prototype.debug = function() {};
var w = "+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
i.genDate = o;
i.genID = r;
a.prototype.add = function(e) {
this.count++;
this.sum += e;
this.sq_sum += e * e;
this.mean = this.sum / this.count;
this.stddev = Math.sqrt(this.sq_sum / this.count - this.mean * this.mean);
};
var b = c.prototype;
b.queueFrame = function(e, t, n) {
this.queue.push({
msgs: e,
start_idx: t,
receive_time: n
});
this.process();
};
b.process = function() {
var e = Date.now() - this.last_work_finished_time;
if (!(this.processing && e < this.socket.options.MAX_NO_WORK_TIME_MS)) {
this.work_timer = window.clearTimeout(this.work_timer);
this.processing = !0;
this.work();
}
};
b.work = function() {
for (var e, t, n, i = Date.now() + this.socket.options.MAX_BLOCKING_TIME_MS, o = !1, r = this.socket.recv_frames, s = this, a = 0; a < this.queue.length; a++) {
e = this.queue[a];
if (!("start_time" in e)) {
e.start_time = Date.now();
e.ticks = 0;
e.idx = e.start_idx;
}
e.ticks++;
t = e.msgs;
n = t.length;
for (;e.idx < n; ) {
var c, u = Date.now();
if (u > i) {
o = !0;
break;
}
this.socket.dispatch_delay = u - e.receive_time;
try {
c = l.parse(t[e.idx]);
e.idx++;
} catch (n) {
this.socket.debug("Invalid json message: " + t[e.idx]);
continue;
}
this.socket.fire("message", c);
this.socket.recv_messages++;
this.socket.cur_conn_recv_messages++;
}
e.idx >= n && this.socket.recv_frames++;
if (o) break;
}
this.queue.splice(0, this.socket.recv_frames - r);
this.queue.length ? this.work_timer = window.setTimeout(function() {
s.work();
}, 0) : this.processing = !1;
this.last_work_finished_time = Date.now();
};
e.exports = i;
}, function(e, t) {
function n(e) {
return Date.now() - (e ? e.clock_skew : 0);
}
function i(e) {
return e ? {
connect_attempts: e.connect_attempts,
connections: e.connections,
disconnects: e.disconnects,
timeout_server: e.timeout_server,
timeout_response_soft: e.timeout_response_soft,
timeout_response_hard: e.timeout_response_hard,
sent_bytes: e.sent_bytes,
recv_bytes: e.recv_bytes,
sent_messages: e.sent_messages,
recv_messages: e.recv_messages,
sent_frames: e.sent_frames,
recv_frames: e.recv_frames,
lost_frames: e.lost_frames,
ooo_frames: e.ooo_frames,
bytes_at_connect: e.bytes_at_connect,
rtt: e.rtt,
clock_skew: e.clock_skew,
reconnect_delay: e.reconnect_delay,
quality: e.quality,
host: e.host,
status: e.status,
last_frame_time: e.last_frame_time,
local_time: Date.now()
} : {
status: "not connected"
};
}
var o = {
getServerTime: n,
getConnectionStats: i
};
e.exports = o;
}, function(e, t, n) {
function i(e) {
return function() {
try {
var t = Array.prototype.slice.call(arguments, 0);
t.unshift(r);
d.appendChild(r);
r.addBehavior("#default#userData");
r.load(l);
var n = e.apply(a, t);
d.removeChild(r);
return n;
} catch (e) {}
};
}
function o(e) {
return e.replace(h, "___");
}
var r, s = n(10), a = {}, c = window, u = c.document, l = "localStorage";
a.disabled = !1;
a.set = function() {};
a.get = function() {};
a.remove = function() {};
a.clear = function() {};
a.transact = function(e, t, n) {
var i = a.get(e);
if (null == n) {
n = t;
t = null;
}
void 0 === i && (i = t || {});
n(i);
a.set(e, i);
};
a.getAll = function() {};
a.serialize = function(e) {
return s.stringify(e);
};
a.deserialize = function(e) {
if ("string" == typeof e) try {
return s.parse(e);
} catch (t) {
return e || void 0;
}
};
if (function() {
try {
return l in c && c[l];
} catch (e) {
return !1;
}
}()) {
r = c[l];
a.set = function(e, t) {
if (void 0 === t) return a.remove(e);
r.setItem(e, a.serialize(t));
return t;
};
a.get = function(e) {
return a.deserialize(r.getItem(e));
};
a.remove = function(e) {
r.removeItem(e);
};
a.clear = function() {
r.clear();
};
a.getAll = function() {
for (var e = {}, t = 0; t < r.length; ++t) {
var n = r.key(t);
e[n] = a.get(n);
}
return e;
};
} else if (u.documentElement.addBehavior) {
var d, f;
try {
f = new window.ActiveXObject("htmlfile");
f.open();
f.write('<script>document.w=window</script><iframe src="/favicon.ico"></frame>');
f.close();
d = f.w.frames[0].document;
r = d.createElement("div");
} catch (e) {
r = u.createElement("div");
d = u.body;
}
var h = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
a.set = i(function(e, t, n) {
t = o(t);
if (void 0 === n) return a.remove(t);
e.setAttribute(t, a.serialize(n));
e.save(l);
return n;
});
a.get = i(function(e, t) {
t = o(t);
return a.deserialize(e.getAttribute(t));
});
a.remove = i(function(e, t) {
t = o(t);
e.removeAttribute(t);
e.save(l);
});
a.clear = i(function(e) {
var t = e.XMLDocument.documentElement.attributes;
e.load(l);
for (var n, i = 0; n = t[i]; i++) e.removeAttribute(n.name);
e.save(l);
});
a.getAll = i(function(e) {
for (var t, n = e.XMLDocument.documentElement.attributes, i = {}, r = 0; t = n[r]; ++r) {
var s = o(t.name);
i[t.name] = a.deserialize(e.getAttribute(s));
}
return i;
});
}
try {
a.set("__storejs__", "__storejs__");
"__storejs__" != a.get("__storejs__") && (a.disabled = !0);
a.remove("__storejs__");
} catch (e) {
a.disabled = !0;
}
a.enabled = !a.disabled;
var p = a;
e.exports = p;
}, function(e, t) {
function n(e) {
return !!e && "false" != e;
}
e.exports = n;
}, function(e, t, n) {
function i(e) {
ie = e.isCookieDenied;
G = fe.getMediatorHost(e.overrideProxy);
oe = e.source;
re = e.source_ver;
se = e.gd_compatible;
K = e.activity_window || window;
F = K.document;
W = e.root;
X = W.$("tmp").$("api_settings");
Z = W.$("tmp").$("server_settings");
Q = W.$("livechat").$("settings").$("cached$bool");
H = W.$("connection");
J = H.$("server_retired$bool");
te = H.$("server_ready$bool");
te.bindValue(c);
J.bindValue(a);
Y = W.$("livechat").$("ui").$("mockup$bool").getValue();
if (Y) H.$("status$string").update("reattached"); else {
W.$("livechat").$("profile").bindValue(s);
H.$("status$string").bindValue(r);
H.$("socket_status$string").bindValue(L);
W.bindWrite(D);
H.$("reconnect$bool").bindValue(g);
if (window.__z_sdk) q = !0; else {
q = !1;
"visibilityState" in document && "prerender" == document.visibilityState ? document.addEventListener("visibilitychange", o) : Oe.connect();
}
}
}
function o() {
if ("prerender" != document.visibilityState) {
document.removeEventListener("visibilitychange", o);
Oe.connect();
}
}
function r(e) {
we = "reattached" == e;
if (we) {
H.update({
client_reattached_timestamp$int: +new Date()
});
D();
}
we && !1 === q && x();
if ("idle_disconnect" == e || "shutdown" == e || "error" == e) {
var t = W.$("livechat").$("account").$("status$string").getValue(), n = W.$("connection").$("backoff"), i = n.$("active$int").getValue() || 0, o = n.$("max_seconds$int").getValue();
"invalid_account_key" == t ? me.warnBadEmbed() : "widget_v2" == oe && "shutdown" == e && i && o && p(o);
f();
}
L();
}
function s(e) {
e && (ie() || fe.IS_POPOUT || e.mid$string && he.setIdentity(e.mid$string));
}
function a(e) {
ee = !0 === e;
}
function c(e) {
ne = !1 !== e;
if (ne) {
Ee = !1;
u();
}
}
function u() {
for (var e = 0, t = $e.length; e < t; e++) {
var n = $e[e];
ce(n) && n();
}
$e = [];
}
function l(e) {
if (!ne || ee) {
H.update({
server_ready$bool: !1
});
$e.push(e);
if (!Ee) {
Ee = !0;
B.reconnect();
}
} else e();
}
function d(e) {
B && B.send(e);
}
function f(e) {
B && B.close();
z = !e;
B = null;
}
function h() {
window.clearTimeout(Oe.reconnectTimer);
f(!0);
Oe.connect();
}
function p(e) {
window.clearTimeout(Oe.reconnectTimer);
Oe.reconnectTimer = window.setTimeout(function() {
Oe.reconnect();
}, 1e3 * e);
}
function m() {
H.update({
status$string: "idle_disconnect"
});
}
function g(e) {
e && Oe.reconnect();
}
function _(e) {
return ae || new _e(e, "W", null, ye);
}
function v() {
if (!B && !z) {
B = _(G);
B.on("break", b);
B.on("message", w);
B.on("reopen", E);
B.on("resume", $);
B.on("open", y);
}
}
function y() {
if (!Y) {
H.update({
socket_open_timestamp$int: +new Date(),
socket_status$string: null,
disconnection_status$string: null
});
T();
}
}
function w(e) {
if (e) {
if (e.raw && e.raw.__messageID in Te) {
var t = Te[e.raw.__messageID];
delete Te[e.raw.__messageID];
t(e);
}
var n = W;
if ("update" in e) {
var i = me.getValueByReference(e, "livechat.account");
if (i) {
Z.$("account").update(i);
me.fullyExtend(i, X.getValue("account"));
}
var o = me.getValueByReference(e, "livechat.settings");
if (o) {
Z.$("settings").update(o);
me.fullyExtend(o, X.getValue("settings"));
}
var r = me.getValueByReference(e, "livechat.profile.mid$string");
if (r && r !== he.getIdentity()) {
W.$("livechat").$("channel").update(null);
W.$("livechat").$("profile").update(null);
W.$("livechat").$("ui").$("chat_button").$("unread_count$int").update(0);
}
e.path && (n = n.descend(e.path));
n.update(e.update);
Oe.fire("message", e);
}
}
}
function b() {
H.update({
socket_status$string: "break"
});
}
function $() {
H.update({
socket_resume_timestamp$int: +new Date(),
socket_status$string: "resume"
});
}
function E() {
H.update({
socket_open_timestamp$int: +new Date(),
socket_status$string: "reconnect"
});
we = !1;
T();
}
function k() {
var e = he.getIdentity(), t = ie(), n = W.$("livechat").$("ui").getValue("mobile$bool") ? "mobile" : "desktop", i = W.$("livechat").$("settings").$("theme").getValue("name$string"), o = {
__type: "register",
accountKey: fe.ACCOUNT_KEY,
mID: e,
ua: K.navigator.userAgent,
dt: n,
theme: i,
cookie_law: t,
rev: ue.git_commit,
source: oe,
source_ver: re,
country_code: fe.COUNTRY_CODE,
multisession: !0,
gd_compatible: se
};
if (W.$("livechat").$("ui").$("popout$bool").getValue()) o.popout = !0; else {
o.title = F.title;
o.url = K.location.href;
o.ref = K.document.referrer;
}
var r = Oe._register;
if (r) for (var s in r) Object.prototype.hasOwnProperty.call(r, s) && (o[s] = r[s]);
return o;
}
function T() {
if (fe.ACCOUNT_KEY) {
var e = k();
pe.retrieveIDToken(function(t, n) {
if (t) j(); else {
if (n) {
delete e.mID;
e.idt = n;
}
d(e);
}
});
}
}
function O() {
return !!Q.getValue();
}
function L() {
var e = H.getValue("status$string"), t = H.getValue("socket_status$string");
window.clearTimeout(A.timer);
if ("error" != e) if ("break" == t) if ("idle_disconnect" == e) H.update({
message$string: "idle_disconnect"
}); else {
H.update({
message$string: "reconnecting"
});
A.timer = window.setTimeout(A, 6e4);
} else if (null === t && "registered" == e) H.update({
message$string: "resuming"
}); else if (le(e) && le(t)) {
var n = O() ? "fast_init" : "first_init";
H.update({
message$string: n
});
} else H.update({
message$string: null
}); else A.timer = window.setTimeout(A, 5e3);
}
function x() {
B && W.$("livechat").$("profile").write({
disconnect_timeout$int: P(B.rtt)
});
}
function A() {
H.update({
message$string: "disconnected"
});
}
function I() {
return ge.getConnectionStats(B);
}
function R() {
return G;
}
function C() {
return ge.getServerTime(B);
}
function S(e) {
ke += 1;
Te[ke] = e;
return ke;
}
function D(e) {
if (e) {
var t = {};
t.path = e.path;
t.value = e.value;
ce(e.func) && (t.__messageID = S(e.func));
be.push(t);
}
if (B && we) for (;be.length; ) B.send(be.shift());
}
function N(e) {
return e ? Z.getValue(e) : Z.getValue();
}
function P(e) {
var t, n, i = 10 * ve.SECOND, o = 1 * ve.SECOND, r = 120 * ve.SECOND, s = 20 * ve.SECOND;
e = Math.round(e) || 0;
e = Math.max(o, Math.min(e, i));
t = (e - o) / (i - o);
n = s + function(e) {
return e;
}(t) * (r - s);
return Math.floor(n / 1e3);
}
function M(e) {
ae = e;
}
function V() {
return B ? B.id : null;
}
function j() {
H.update({
disconnection_status$string: "disconnecting"
});
f();
A.timer = clearTimeout(A.timer);
H.update({
disconnection_status$string: "disconnected"
});
}
function U() {
te.unbindValue(c);
J.unbindValue(a);
W.$("livechat").$("profile").unbindValue(s);
H.$("status$string").unbindValue(r);
H.$("socket_status$string").unbindValue(L);
H.$("reconnect$bool").unbindValue(g);
j();
we = !1, be = [], $e = [], Ee = !1, ke = 0, Te = {}, q = z = W = H = B = Y = X = Z = Q = J = ee = te = ne = ie = oe = re = se = ae = null;
}
var q, z, K, F, W, H, B, G, Y, X, Z, Q, J, ee, te, ne, ie, oe, re, se, ae, ce = n(5), ue = n(4), le = n(1), de = n(0), fe = n(3), he = n(14), pe = n(13), me = n(6), ge = n(36), _e = n(35), ve = n(30), ye = {
FLUSH_DELAY_MS: 0,
RECONNECT_DELAY_MS: 1e4
}, we = !1, be = [], $e = [], Ee = !1, ke = 0, Te = {}, Oe = de.extend({
init: i,
send: d,
connect: v,
reconnect: h,
clientDisconnect: j,
destroy: U,
disconnect: m,
getConnectionStats: I,
getHost: R,
getServerTime: C,
getServerSettings: N,
reconnectIfServerRetired: l,
registerCallback: S,
getSocketID: V,
getDCTimeoutValue: P,
setSocket: M,
reset: U
});
e.exports = Oe;
}, function(e, t, n) {
function i(e) {
var t = e.type, n = u[t];
if (!n) return t ? new Error(t + " type is not supported. Please upgrade the Web SDK version.") : new Error('Structured message object should contain "type" property');
var i = n(e);
if (i) {
var o = i.paths && "type" === i.paths.pop(), r = o && i.actual ? i.actual + " type is not supported. Please upgrade the Web SDK version." : i.message;
return new Error(r);
}
}
var o = n(15), r = {
QUICK_REPLIES: "QUICK_REPLIES",
BUTTON_TEMPLATE: "BUTTON_TEMPLATE",
PANEL_TEMPLATE: "PANEL_TEMPLATE",
PANEL_TEMPLATE_CAROUSEL: "PANEL_TEMPLATE_CAROUSEL",
LIST_TEMPLATE: "LIST_TEMPLATE"
}, s = {
QUICK_REPLY_ACTION: "QUICK_REPLY_ACTION",
LINK_ACTION: "LINK_ACTION"
}, a = o.obj({
text: o.type("string"),
action: o.obj({
type: o.any([ o.equal(s.QUICK_REPLY_ACTION), o.equal(s.LINK_ACTION) ]),
value: o.type("string")
}, {
requiredKeys: [ "type", "value" ],
whitelistedKeysOnly: !0
})
}, {
requiredKeys: [ "text", "action" ],
whitelistedKeysOnly: !0
}), c = o.obj({
type: o.equal(r.PANEL_TEMPLATE),
panel: o.obj({
heading: o.type("string"),
paragraph: o.type("string"),
image_url: o.type("string"),
action: o.obj({
type: o.equal(s.LINK_ACTION),
value: o.type("string")
}, {
requiredKeys: [ "type", "value" ],
whitelistedKeysOnly: !0
})
}, {
requiredKeys: [ "heading" ],
whitelistedKeysOnly: !0
}),
buttons: o.each(a)
}, {
requiredKeys: [ "type", "panel" ],
whitelistedKeysOnly: !0
}), u = {
QUICK_REPLIES: o.obj({
type: o.equal(r.QUICK_REPLIES),
msg: o.type("string"),
quick_replies: o.each(o.obj({
text: o.type("string"),
action: o.obj({
type: o.equal(s.QUICK_REPLY_ACTION),
value: o.type("string")
}, {
requiredKeys: [ "type", "value" ],
whitelistedKeysOnly: !0
})
}, {
requiredKeys: [ "text", "action" ],
whitelistedKeysOnly: !0
}))
}, {
requiredKeys: [ "type", "msg", "quick_replies" ],
whitelistedKeysOnly: !0
}),
BUTTON_TEMPLATE: o.obj({
type: o.equal(r.BUTTON_TEMPLATE),
msg: o.type("string"),
buttons: o.each(a)
}, {
requiredKeys: [ "type", "msg", "buttons" ],
whitelistedKeysOnly: !0
}),
PANEL_TEMPLATE: c,
PANEL_TEMPLATE_CAROUSEL: o.obj({
type: o.equal(r.PANEL_TEMPLATE_CAROUSEL),
items: o.each(c).minLength(2).maxLength(10)
}, {
requiredKeys: [ "type", "items" ],
whitelistedKeysOnly: !0
}),
LIST_TEMPLATE: o.obj({
type: o.equal(r.LIST_TEMPLATE),
items: o.each(o.obj({
heading: o.type("string"),
paragraph: o.type("string"),
image_url: o.type("string"),
action: o.obj({
type: o.equal(s.LINK_ACTION),
value: o.type("string")
}, {
requiredKeys: [ "type", "value" ],
whitelistedKeysOnly: !0
})
}, {
requiredKeys: [ "heading", "paragraph", "action" ],
whitelistedKeysOnly: !0
})),
buttons: o.each(a)
}, {
requiredKeys: [ "type", "items" ],
whitelistedKeysOnly: !0
})
}, l = {
validate: i,
STRUCTURED_MSG_VALIDATOR: u,
STRUCTURED_MSG_TYPE: r
};
e.exports = l;
}, function(e, t, n) {
function i(e, t) {
if (!o(t.interval) || !o(t.limit)) throw new Error("requires numeric interval and limit");
if (t.callback && !r(t.callback)) throw new Error("requires callback to be a function");
return function() {
var n = Date.now();
if (t.start > n - t.interval) {
t.count || (t.count = 0);
t.count++;
if (t.count > t.limit) {
t.callback && t.callback();
return;
}
} else {
t.start = n;
t.count = 1;
}
return e.apply(this, arguments);
};
}
var o = n(22), r = n(5), s = {
rateLimit: i
};
e.exports = s;
}, function(e, t, n) {
function i(e, t, n) {
var i = this;
o.extend(i);
var s = new r();
t = t || {};
s.setScope(t);
s.on("success", n);
s.on("error", function(e) {
i.onError(e);
});
s.load(e);
}
var o = n(0), r = n(18);
i.prototype.onError = function(e) {};
e.exports = i;
}, function(e, t, n) {
function i(e, t) {
var n = a[e];
n.module_function = new Function("$Modules", t.toString().replace(d, "$1"));
n.ready();
}
function o(e) {
var t, n, i, o;
for (t = l.length - 1; t >= 0; t--) {
i = l[t];
o = i.dependencies;
for (n = o.length - 1; n >= 0; n--) if (o[n] == e) {
o.splice(n, 1);
break;
}
i.ready();
}
}
function r() {
var e = Array.prototype.slice.call(arguments), t = e.shift();
this.fqname = t;
this.name = t.split(".").pop();
this.callbacks = [];
this.dependencies = e;
l.push(this);
}
function s(e) {
e();
}
var a = n(19), c = n(4), u = n(42), l = [], d = /^function *\( *\) *{ *([\s\S]*) *}$/;
r.ensureLoaded = function(e, t) {
e instanceof r ? e.ensureLoaded(t) : t();
};
r.prototype.ensureLoaded = function(e) {
this.ifLoaded(e);
this.load();
};
r.prototype.ifLoaded = function(e) {
this.callbacks.push(e);
};
r.prototype.load = function() {
function e(e) {
i(e[0], e[1]);
}
var t, n, o = this.getDependencies();
for (t = 0; t < o.length; t++) {
n = o[t];
n.loader || (n.loader = new u(c.baseURL + "/lib/" + c.build_number + "/" + n.fqname + ".js", a, e));
}
};
r.prototype.getDependencies = function() {
var e, t = this.dependencies, n = [ this ];
for (e = 0; e < t.length; e++) {
var i = a[t[e]];
n = n.concat(i.getDependencies());
}
return n;
};
r.prototype.ready = function() {
if (!this.dependencies.length && this.module_function) {
for (e = l.length - 1; e >= 0; e--) if (l[e] == this) {
l.splice(e, 1);
break;
}
this.module_function(a);
var e, t = a[this.fqname];
t.ifLoaded = t.ensureLoaded = s;
for (e = 0; e < this.callbacks.length; e++) this.callbacks[e](t);
o(this.fqname);
delete this.callbacks;
delete this.fqname;
delete this.name;
delete this.dependencies;
delete this.loader;
}
};
a.Module = r;
e.exports = r;
}, function(e, t) {
function n(e) {
return window[e];
}
var i = {
getVariable: n
};
e.exports = i;
}, function(e, t, n) {
function i() {
var e = o.getVariable("navigator"), t = e.userAgent || "", n = e.vendor || "", i = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i, r = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i, s = t || n || window.opera;
return i.test(s) || r.test(s.substr(0, 4));
}
var o = n(44);
e.exports = i;
}, function(e, t, n) {
function i(e, t) {
return t ? s(e, t) : o(e);
}
function o(e) {
for (var t, n, i = e.length; i > 1; ) {
t = Math.floor(i-- * Math.random());
n = e[t];
e[t] = e[i];
e[i] = n;
}
return e;
}
function r(e, t) {
if (!e || e.length <= 0) return -1;
if (!t) return Math.floor(Math.random() * e.length);
t = a(e, t);
var n, i = 0;
for (n = t.length; n--; ) i += t[n];
var o = Math.random() * i, r = 0, s = t.length;
for (n = 0; n < s - 1; n++) {
r += t[n];
if (o <= r) return n;
}
return n;
}
function s(e, t) {
var n, i, o, r, s, c = e.concat();
t = a(e, t);
e.length = 0;
s = 0;
for (n = t.length; n--; ) s += t[n];
o = Math.random() * s;
r = 0;
n = 0;
for (;c.length; ) {
r += t[n];
if (o <= r) {
s -= t[n];
i = c.splice(n, 1)[0];
t.splice(n, 1);
e.push(i);
o = Math.random() * s;
r = 0;
n = 0;
} else n++;
}
return e;
}
function a(e, t) {
if (u(t)) {
if (t.length === e.length) return t.concat();
throw new window.Error("Invalid weights array: length does not match");
}
if (l(t)) return c(e, t);
throw new window.Error("Invalid weights supplied");
}
function c(e, t, n) {
var i, o, r;
if (!u(e)) throw new TypeError(" arr is not an array");
var s = Object(e), a = s.length >>> 0;
if (!l(t)) throw new TypeError(t + " is not a function");
arguments.length > 2 && (i = n);
o = new Array(a);
r = 0;
for (;r < a; ) {
var c, d;
if (r in s) {
c = s[r];
d = t.call(i, c, r, s);
o[r] = d;
}
r++;
}
return o;
}
var u = n(7), l = n(5), d = {
shuffle: i,
random_index: r,
map: c
};
e.exports = d;
}, function(e, t) {
function n(e, t) {
this.name = e;
this.leaf = /\$[a-z]+$/.test(e);
this.parentNode = t;
if (!this.leaf) {
this.deleted = !1;
this.childNodes = {};
this.keys = {};
}
}
function i(e, t) {
return Object.prototype.hasOwnProperty.call(e, t);
}
function o(e) {
for (var t = "", n = 0; n < e.length; n++) /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e[n]) ? t += "." + e[n] : t += "[" + JSON.stringify(e[n]) + "]";
return t.substr(1);
}
n.prototype.fqname = function() {
return o(this.path());
};
n.prototype.path = function() {
for (var e = this, t = [ this.name ]; e = e.parentNode; ) t.unshift(e.name);
return t;
};
n.prototype._getOrCreateChildNode = function(e) {
var t;
if (i(this.childNodes, e)) t = this.childNodes[e]; else {
t = new n(e, this);
this.childNodes[e] = t;
this.deleted && t.undeleteParents();
}
return t;
};
n.prototype.descend = function(e) {
var t, n, i = this;
"string" == typeof e && (e = e.split("."));
for (t = 0, n = e.length; t < n; t++) i = i._getOrCreateChildNode(e[t]);
return i;
};
n.prototype.$$ = n.prototype.descend;
n.prototype.$ = function(e, t, n, i, o, r, s, a, c) {
var u = this._getOrCreateChildNode(e);
return t ? u.$(t, n, i, o, r, s, a, c) : u;
};
n.prototype.update = function(e, t) {
var n, i, o, r, s;
null != e && this.undeleteParents();
if (this.leaf) {
if (this.value !== e) {
this.value = e;
r = !0;
this.notifyListeners(e, t);
}
} else if (null == e) {
if (!this.deleted) {
r = null;
this.deleted = !0;
for (n in this.childNodes) this.childNodes[n].update(null, !0);
this.notifyListeners(r, t);
}
} else {
if (this.deleted) {
this.deleted = !1;
r = e;
for (n in e) this.$(n).update(e[n], !0);
} else for (n in e) {
o = this.$(n);
i = e[n];
if (o.leaf) {
if (o.update(i, !0)) {
r || (r = {});
r[n] = i;
}
} else if (void 0 !== (s = o.update(i, !0))) {
r || (r = {});
r[n] = s;
}
}
r && this.notifyListeners(r, t);
}
return r;
};
n.prototype.replace = function(e, t) {
var n, o, r, s, a;
null != e && this.undeleteParents();
if (this.leaf) {
if (this.value !== e) {
this.value = e;
s = !0;
this.notifyListeners(e, t);
}
} else if (null == e) {
if (!this.deleted) {
s = null;
this.deleted = !0;
for (n in this.childNodes) this.childNodes[n].replace(null, !0);
this.notifyListeners(s, t);
}
} else {
if (this.deleted) {
this.deleted = !1;
s = e;
for (n in e) this.$(n).replace(e[n], !0);
} else {
for (n in this.childNodes) if (!i(e, n)) {
r = this.childNodes[n];
if (r.leaf) {
if (r.replace(null, !0)) {
s || (s = {});
s[n] = null;
}
} else if (void 0 !== (a = r.replace(null, !0))) {
s || (s = {});
s[n] = null;
}
}
for (n in e) {
r = this.$(n);
o = e[n];
if (r.leaf) {
if (r.replace(o, !0)) {
s || (s = {});
s[n] = o;
}
} else if (void 0 !== (a = r.replace(o, !0))) {
s || (s = {});
s[n] = a;
}
}
}
s && this.notifyListeners(s, t);
}
return s;
};
n.prototype.undeleteParents = function() {
for (var e = this.parentNode; e && e.deleted; ) {
e.deleted = !1;
e = e.parentNode;
}
};
n.prototype.write = function(e, t, n) {
if ("function" == typeof t) {
n = t;
t = !1;
}
var i = {
path: this.path(),
value: e
};
"function" == typeof n && (i.func = n);
this.update(e, t || !1);
for (var o = this; o.parentNode; ) o = o.parentNode;
o.notifyWriteListeners(i);
};
n.prototype.bindWrite = function(e) {
this.getWriteListeners().push(e);
};
n.prototype.getValueListeners = function() {
this.listeners_value || (this.listeners_value = []);
return this.listeners_value;
};
n.prototype.getWriteListeners = function() {
this.listeners_write || (this.listeners_write = []);
return this.listeners_write;
};
n.prototype.getKeysListeners = function() {
this.listeners_keys || (this.listeners_keys = []);
return this.listeners_keys;
};
n.prototype.bindValue = function(e) {
var t = this.getValueListeners();
t.push(e);
try {
e.call(this, this.getValue());
} catch (e) {}
};
n.prototype.bindKeys = function(e) {
if (!this.leaf) {
var t = this.getKeysListeners();
t.push(e);
try {
e.call(this, this.getKeys(), []);
} catch (e) {}
}
};
n.prototype.unbindValue = function(e) {
for (var t = this.getValueListeners(), n = 0; n < t.length; n++) if (t[n] == e) {
t.splice(n, 1);
return;
}
};
n.prototype.unbindKeys = function(e) {
if (!this.leaf) for (var t = this.getKeysListeners(), n = 0; n < t.length; n++) if (t[n] == e) {
t.splice(n, 1);
return;
}
};
n.prototype.on = function(e, t) {
switch (e) {
case "value":
this.bindValue(t);
break;

case "keys":
this.bindKeys(t);
}
};
n.prototype.un = function(e, t) {
switch (e) {
case "value":
this.unbindValue(t);
break;

case "keys":
this.unbindKeys(t);
}
};
n.prototype.notifyListeners = function(e, t) {
var n, o, r, s;
if (!this.leaf) if (e) {
for (n in e) if (null != e[n]) {
if (!i(this.keys, n)) {
this.keys[n] = 1;
o || (o = []);
o.push(n);
}
} else if (i(this.keys, n)) {
delete this.keys[n];
r || (r = []);
r.push(n);
}
} else for (n in this.keys) {
delete this.keys[n];
r || (r = []);
r.push(n);
}
if (this.listeners_value) {
s = this.getValueListeners().concat();
for (var a = 0, c = s.length; a < c; a++) try {
s[a](e);
} catch (e) {}
}
if (!this.leaf) {
if (this.listeners_keys && (o || r)) {
s = this.getKeysListeners().concat();
for (a = 0, c = s.length; a < c; a++) try {
s[a](o || [], r || []);
} catch (e) {}
}
if (!t && this.parentNode) {
var u = {};
u[this.name] = e;
this.parentNode.notifyListeners(u, t);
}
}
};
n.prototype.notifyWriteListeners = function(e) {
if (this.listeners_write) for (var t = this.getWriteListeners().concat(), n = 0; n < t.length; n++) try {
t[n].call(this, e);
} catch (e) {}
};
n.prototype.getValue = function(e) {
if (e) return this.descend(e).getValue();
if (this.leaf) return this.value;
if (this.deleted) return null;
var t, n, i = {};
for (var o in this.childNodes) if (null != (n = this.childNodes[o].getValue())) {
i[o] = n;
t = !0;
}
return t ? i : null;
};
n.prototype.hasKey = function(e) {
return i(this.keys, e);
};
n.prototype.getKeys = function() {
if (this.leaf) return null;
var e = [];
for (var t in this.keys) e.push(t);
return e;
};
n.prototype.gc = function() {
if (this.leaf) throw new TypeError("Leaf nodes cannot be collected");
var e = !0;
for (var t in this.childNodes) {
var n = this.childNodes[t];
e = n.leaf ? !(n.listeners_value && n.listeners_value.length) && null == n.value && (delete this.keys[t], 
delete this.childNodes[t]) && e : n.gc() && (delete this.keys[t], delete this.childNodes[t]) && e;
}
return e && this.deleted && !(this.listeners_keys && this.listeners_keys.length) && !(this.listeners_value && this.listeners_value.length);
};
n.DataNode = n;
e.exports = n;
}, function(e, t) {
var n = function(e, t) {
return e === t || e && t && "object" == typeof e && "object" == typeof t && i(e, t);
}, i = function(e, t) {
var i;
for (i in e) if (!n(e[i], t[i])) return !1;
for (i in t) if (!n(e[i], t[i])) return !1;
return !0;
}, o = function(e) {
if ("object" != typeof e || !e) return e;
var t = {};
for (var n in e) e.hasOwnProperty(n) && (t[n] = o(e[n]));
return t;
}, r = function(e) {
if (e) for (var t = 1, n = arguments.length; t < n; t++) {
var i = arguments[t];
if (i) for (var o in i) i.hasOwnProperty(o) && (e[o] = i[o]);
}
return e;
}, s = {
equal: n,
clone: o,
extend: r
};
e.exports = s;
}, function(e, t, n) {
function i(e) {
de([ ct ], [ e ], "logout") || (Be.isAuthenticated() ? o(e) : le(new Error("This API is only applicable for authenticated visitors"), "logout"));
}
function o(e) {
be.destroy();
a();
Be.clearIdentity();
Ge.clearIdentity();
Je = !1;
e && setTimeout(function() {
e(null);
});
}
function r(e) {
ke && et.un("data", ke);
ke = function(e) {
Qe.fire(e.type, e.detail);
};
et.on("data", ke);
if (Je) le(new Error("Zendesk Chat Web SDK has already been initialized. Please ensure that zChat.init() is only called once in your code"), "init"); else if (Le.isIE <= 10) le(new Error("The current browser you are on is not supported by the Web SDK. Please refer to the documentation to learn about the system requirements for Zendesk Chat."), "init"); else {
var t = it.obj({
account_key: it.type("string").ok(),
suppress_console_error: it.type("boolean"),
override_auth_server_host: it.type("string").ok(),
override_proxy: it.type("string").ok(),
authentication: it.obj({
jwt_fn: it.type("function").ok()
}, {
requiredKeys: [ "jwt_fn" ]
}),
activity_window: it.type("object").chain(lt),
popout: it.type("boolean")
}, {
requiredKeys: [ "account_key" ]
});
if (!de([ t ], [ e ], "init")) {
var n = new Ne("root"), i = new Ne("root"), o = {
livechat: {
settings: De.clone(He.livechat.settings)
}
};
n.update(o);
i.update(o);
je() && n.$("livechat").$("ui").$("mobile$bool").update(!0);
Ve.ACCOUNT_KEY = e.account_key;
if (e.authentication) {
Be.setOverrideHost(e.override_auth_server_host);
Be.setSiteJWTFunc(e.authentication.jwt_fn);
Be.setDataNode(n);
Be.authenticate(function(t) {
t ? le(new Error("Failed to verify token: " + t.reason + (t.details ? ": " + t.details : "")), "init", {
reason: t.reason,
details: t.details
}) : s(e, Fe, n, i);
});
} else s(e, Fe, n, i);
}
}
}
function s(e, t, n, i) {
be = t;
$e = n;
Ee = i;
Xe.init($e, Ee);
te();
Te = function(e) {
(e.path ? Ee.descend(e.path) : Ee).update(e.update);
};
be.on("message", Te);
Oe = e.suppress_console_error || !1;
Ge.init(e.activity_window);
switch (Ge.DOM.getVariable("account_status")) {
case "invalid_account_key":
Ue.warnBadEmbed();

case "banned":
return;
}
be.init({
root: $e,
overrideProxy: e.override_proxy,
isCookieDenied: function() {
return !1;
},
source: tt,
lastHost: Ge.DOM.getVariable("web_sdk_last_host"),
source_ver: xe.release_tag,
activity_window: e.activity_window,
gd_compatible: 1
});
$e.$("connection").$("server$string").bindValue(function(e) {
e && Ge.DOM.saveVariable("web_sdk_last_host", e);
});
Ee.$("livechat").$("account").$("status$string").bindValue(function(e) {
e && Ge.DOM.saveVariable("account_status", e);
});
We.init($e, be);
Ye.init($e, e.activity_window);
Je = !0;
}
function a() {
et.un("data", ke);
Xe.destroy();
be.un("message", Te);
ke = null;
Te = null;
Oe = void 0;
}
function c() {
be.reconnect();
}
function u() {
"invalid_account_key" !== Ge.DOM.getVariable("account_status") ? "closed" === Qe.getConnectionStatus() ? ft() : le(new Error("Call has been ignored due to invalid connection status"), "reconnect") : Ue.warnBadEmbed();
}
function l() {
return et;
}
function d() {
return vt(Ee.$("livechat").$("profile").getValue());
}
function f(e, t) {
if (!de([ it.obj({
display_name: it.any([ it.equal(""), it.type("string").regex(st).maxLength(255) ]),
email: it.any([ it.equal(""), it.type("string").regex(Pe.email) ]),
phone: at
}), ct ], [ e, t ], "setVisitorInfo")) {
var n = {};
t = t || nt;
"display_name" in e && (n.display_name$string = e.display_name);
"email" in e && (n.email$string = e.email);
"phone" in e && (n.phone$string = e.phone);
$e.$("livechat").$("profile").write(n, pe(t));
}
}
function h(e, t) {
if (!de([ it.type("string").regex(st), ct ], [ e, t ], "sendChatMsg")) {
t = t || nt;
We.sendChatMsg({
msg: e.trim()
}, null, pe(t));
}
}
function p(e, t) {
de([ it.chain(fe), ct ], [ e, t ], "sendFile") || m(e, t);
}
function m(e, t) {
t = t || nt;
Fe.reconnectIfServerRetired(function() {
We.sendFileWithCallback(e, t);
});
}
function g(e) {
var t = it.type("number"), n = Ee.$("livechat");
if (!de([ t ], [ e ], "getDepartment")) {
n.$("account").$("departments_migrated$bool").getValue() && n.$("dg_mappings").hasKey(e) && console.warn("legacy department id is deprecated, use group id %s instead", n.$("dg_mappings").$(e).$("group_id$int").getValue());
return _(e);
}
}
function _(e) {
var t = Ee.$("livechat"), n = t.$("departments").$(e).getValue();
if (t.$("account").$("departments_migrated$bool").getValue()) {
if (n && t.$("dg_mappings").hasKey(e)) {
var i = t.$("dg_mappings").$(e).$("group_id$int").getValue();
return yt(n, i);
}
!n && t.$("groups").hasKey(e) && (n = t.$("groups").$(e).getValue());
}
return n ? yt(n, e) : void 0;
}
function v() {
var e = {}, t = Ee.$("livechat");
e = t.$("account").$("departments_migrated$bool").getValue() ? t.$("groups").getValue() : t.$("departments").getValue();
return re(e, yt);
}
function y() {
var e = Ee.$("livechat").$("profile").$("department_id$int"), t = e.getValue();
return Ie(t) ? t : void 0;
}
function w(e, t) {
if (!de([ it.type("number").chain(he), ct ], [ e, t ], "setVisitorDefaultDepartment")) {
t = t || nt;
$e.$("livechat").$("profile").write({
department_id$int: e
}, pe(t));
}
}
function b(e) {
if (!de([ ct ], [ e ], "clearVisitorDefaultDepartment")) {
e = e || nt;
$e.$("livechat").$("profile").write({
department_id$int: null
}, pe(e));
}
}
function $(e, t) {
k("added$string", e, "addTag", t);
}
function E(e, t) {
k("removed$string", e, "removeTag", t);
}
function k(e, t, n, i) {
if (!de([ it.type("string").regex(st).chain(ut), ct ], [ t, i ], n)) {
i = i || nt;
var o = {};
o[e] = t.trim();
$e.$("livechat").$("channel").$("tags").write(o, pe(i));
}
}
function T(e, t) {
L("added$string", e, "addTags", t);
}
function O(e, t) {
L("removed$string", e, "removeTags", t);
}
function L(e, t, n, i) {
if (!de([ it.each(it.type("string").regex(st).chain(ut)).minLength(1), ct ], [ t, i ], n)) {
i = i || nt;
for (var o = 0, r = t.length; o < r; o++) t[o] = t[o].trim();
var s = {};
s[e] = t.join(",");
$e.$("livechat").$("channel").$("tags").write(s, pe(i));
}
}
function x(e, t) {
if (!de([ it.obj({
title: it.type("string").regex(st),
url: it.type("string").regex(rt)
}, {
requiredKeys: [ "title", "url" ]
}), ct ], [ e, t ], "sendVisitorPath")) {
t = t || nt;
$e.$("livechat").$("session").$("page_path").write({
url$string: e.url,
title$string: e.title
}, pe(t));
}
}
function A() {
var e = Ee.$("livechat").$("channel").$("rating$string").getValue(), t = Ee.$("livechat").$("channel").$("comment$string").getValue(), n = {};
Re(e) || (n.rating = e);
Re(t) || (n.comment = t);
return n;
}
function I(e, t) {
if (!de([ it.any([ it.equal(null), it.equal("good"), it.equal("bad") ]), ct ], [ e, t ], "sendChatRating")) {
t = t || nt;
$e.$("livechat").$("channel").write({
rating$string: e
}, pe(t));
}
}
function R(e, t) {
if (!de([ it.type("string"), ct ], [ e, t ], "sendChatComment")) {
t = t || nt;
$e.$("livechat").$("channel").write({
comment$string: e
}, pe(t));
}
}
function C(e, t) {
var n = it.obj({
clear_dept_id_on_chat_ended: it.type("boolean")
}), i = $e.$("livechat").$("channel");
if ("function" == typeof e) {
t = e;
e = {};
} else void 0 === e && (e = {});
if (!de([ n, ct ], [ e, t ], "endChat")) {
t = t || nt;
i.write({
chatting$bool: !1
}, pe(t));
e.clear_dept_id_on_chat_ended && We.clearChatDepartmentID();
}
}
function S() {
return Ee.$("livechat").$("channel").$("chatting$bool").getValue() || !1;
}
function D() {
return re(Ee.$("livechat").$("agents").getValue(), wt);
}
function N(e) {
return wt(Ee.$("livechat").$("agents").$(e).getValue(), e);
}
function P() {
var e = Ee.$("livechat"), t = e.$("settings"), n = t.$("operating_hours");
if (t.hasKey("operating_hours")) {
var i = n.$("type$string").getValue(), o = {
enabled: n.$("enabled$bool").getValue(),
type: i,
timezone: t.$("timezone$string").getValue() || "UTC"
};
if ("account" == i) o.account_schedule = me(n.$("schedule").getValue() || {}); else if ("department" == i) {
var r = e.$("dg_mappings").getValue(), s = ge(n.$("schedules").getValue(), e.$("departments").getKeys());
e.$("account").$("departments_migrated$bool").getValue() && r && (s = Object.keys(s).reduce(function(e, t) {
t in r ? e[r[t].group_id$int] = s[t] : e[t] = s[t];
return e;
}, {}));
o.department_schedule = s;
}
return o;
}
}
function M(e, t) {
if (!de([ it.obj({
name: it.type("string").regex(st).maxLength(255),
email: it.type("string").regex(Pe.email),
message: it.type("string").regex(st),
phone: at
}, {
requiredKeys: [ "name", "email", "message" ]
}), ct ], [ e, t ], "sendOfflineMsg")) {
t = t || nt;
var n = {
name: {
name$string: "name",
value$string: e.name
},
email: {
name$string: "email",
value$string: e.email
},
message: {
name$string: "message",
value$string: e.message
}
};
"phone" in e && (n.phone = {
name$string: "phone",
value$string: e.phone
});
"department" in e && (n.department = {
name$string: "department_id",
value$string: e.department
});
$e.$("livechat").$("settings").$("forms").$("offline_form").$("form_submitted").write(n, pe(t));
}
}
function V(e) {
var t = $e.$("livechat").$("channel").$("typing"), n = t.$("typing$bool").getValue(), i = it.type("boolean");
n !== e && (de([ i ], [ e ], "sendTyping") || t.write({
typing$bool: e
}));
}
function j(e, t) {
var n = it.type("string").regex(Pe.email), i = !!Ee.$("livechat").$("channel").$("log").getKeys().length;
if (!de([ n, ct ], [ e, t ], "sendEmailTranscript")) {
t = t || nt;
Ee.$("livechat").$("channel").$("chatting$bool").getValue() || !1 ? $e.$("livechat").$("channel").write({
email_transcript$string: e
}, pe(t)) : Be.isAuthenticated() || i ? $e.$("livechat").$("channel").write({
email_last_transcript$string: e
}, pe(t)) : le(new Error("There were no past chat to send a transcript of"), "sendEmailTranscript");
}
}
function U(e, t) {
return {
id: parseInt(t, 10)
};
}
function q(e) {
return Object.prototype.hasOwnProperty.call(e, "typing$bool") ? {
type: "typing"
} : null;
}
function z(e) {
var t = Object.prototype.hasOwnProperty.call(e, "typing$bool"), n = {
type: "typing",
nick: "agent:trigger"
};
return t ? n : null;
}
function K(e) {
return Object.prototype.hasOwnProperty.call(e, "timestamp$int") ? {
type: "last_read"
} : null;
}
function F(e) {
return 0 === e.indexOf("visitor:") ? "visitor" : e;
}
function W(e) {
if (!e.type$string) return null;
if (!e.nick$string) return null;
var t = {
nick: F(e.nick$string),
type: e.type$string
}, n = e.msg$string;
e.first$bool && (t.first = e.first$bool);
switch (e.type$string) {
case "chat.msg":
if ("attachment" in e) {
if (!0 === e.unverified$bool) return null;
var i, o = e.attachment, r = {
mime_type: o.mime_type$string,
name: o.name$string,
size: o.size$int,
url: o.url$string
};
if ("metadata" in o) {
i = o.metadata;
r.metadata = {
width: i.width$int,
height: i.height$int
};
}
"deleted$bool" in o && (r.deleted = o.deleted$bool);
return De.extend(t, {
type: "chat.file",
display_name: e.display_name$string,
attachment: r
});
}
if ("structured_msg" in e) {
var s = ue(e.structured_msg);
ye(s, [ "items", "buttons", "quick_replies" ]);
var a = Ke.validate(s);
a ? le(a, 'Unsupported structured message in "chat.msg" event') : t.structured_msg = s;
}
;
return De.extend(t, {
display_name: e.display_name$string,
msg: n,
options: e.options$string ? e.options$string.split("/") : []
});

case "chat.rating":
return De.extend(t, {
display_name: e.display_name$string,
new_rating: e.new_rating$string,
rating: e.rating$string
});

case "chat.comment":
return De.extend(t, {
display_name: e.display_name$string,
comment: e.comment$string,
new_comment: e.new_comment$string
});

case "chat.memberleave":
return De.extend(t, {
display_name: e.display_name$string
});

case "chat.memberjoin":
case "chat.request.rating":
return De.extend(t, {
display_name: e.display_name$string
});

case "chat.event":
var c, u = /Please wait while our agents attend to you. There are currently (\d+) visitor\(s\) waiting to be served\./;
return "agent:system" === e.nick$string && (c = u.exec(n)) ? {
type: "chat.wait_queue",
nick: "system.queue",
wait_queue: parseInt(c[1], 10)
} : null;

case "chat.join":
var l = e.history;
if (l && l[0]) {
var d = De.extend({}, l[0]), f = d.timestamp$int;
d.type$string = d.__type$string;
d.display_name$string = d.name$string;
f *= 1e3;
d.timestamp$int = f;
return W(d);
}
return null;

case "chat.file.update":
default:
return null;
}
}
function H() {
var e, t, n, i = [ "type$string", "timestamp$int" ], o = Ee.$("livechat").$("channel").$("log").getValue(), r = [];
for (var s in o) if (Object.prototype.hasOwnProperty.call(o, s)) {
if (o[s].type$string) e = o[s]; else {
e = $e.$("livechat").$("channel").$("log").$(s).getValue();
if ("chat.msg" === e.type$string && (!0 === e.unverified$bool || !0 === e.failed$bool)) continue;
}
var a = W(e);
if (null === a) continue;
for (var c = 0; c < i.length; c++) {
t = i[c];
n = ce(t);
n in a || (a[n] = e[t]);
}
r.push(a);
}
return r;
}
function B() {
if (!Ee) return "closed";
var e = Ee.$("tmp").$("friendly_connection_status$string").getValue();
return gt(e)[0];
}
function G() {
var e = Ee.$("livechat").$("account").$("status$string").getValue();
return _t(e)[0];
}
function Y() {
return Ee.$("livechat").$("channel").$("queue_position$int").getValue() || 0;
}
function X(e) {
if (!de([ ct ], [ e ], "fetchChatHistory")) if (Be.isAuthenticated()) {
var t = Ee.$("livechat").$("history"), n = $e.$("livechat").$("history"), i = n.$("in_progress$bool").getValue(), o = t.$("has_more$bool").getValue(), r = t.$("cursor$string").getValue();
if (i) le(new Error("Previous fetching of history is still in progress"), "fetchChatHistory"); else if (!1 !== o) {
e = e || nt;
n.$("in_progress$bool").update(!0);
n.write({
cursor$string: r || ""
}, pe(e));
} else le(new Error("No more history to load"), "fetchChatHistory");
} else le(new Error("This API is not available for unauthenticated visitors"), "fetchChatHistory");
}
function Z() {
S() && $e.$("livechat").$("ui").$("chat").write({
read_ts$int: +new Date()
});
}
function Q(e, t, n) {
return function(i, o) {
if (null === i) return {};
for (var r = {}, s = 0, a = e.length; s < a; s++) {
var c = e[s];
c in i && (r[ce(c)] = i[c]);
}
Ce(t) && Object.keys(r).length && (r[t] = o);
if (Se(n)) {
var u = n(i, o);
return null === u ? {} : De.extend(r, u);
}
return r;
};
}
function J(e, t, n) {
Ee.descend(t).bindValue(function(t) {
n(t).forEach(function(t) {
ee(e, t);
});
});
}
function ee(e, t) {
if (t) {
if (t instanceof Error) {
if (!t.message) return;
} else if ("object" == typeof t && !Object.keys(t).length) return;
et.fire("data", {
type: e,
detail: t
});
}
}
function te() {
J("connection_update", "tmp.friendly_connection_status$string", gt);
J("account_status", "livechat.account.status$string", ie(mt));
J("visitor_update", "livechat.profile", se([ "email$string", "phone$string", "display_name$string" ], d));
J("department_update", "livechat.departments", ae([ "name$string", "status$string" ], _));
J("agent_update", "livechat.agents", ae([ "avatar_path$string", "display_name$string", "title$string" ], N));
J("chat", "livechat.channel.log", oe(Et));
J("chat", "livechat.agents", oe(bt));
J("chat", "livechat.triggers.agents", oe($t));
J("chat", "livechat.channel.queue_position$int", ne);
J("history", "livechat.history.log", oe(Et));
J("chat", "livechat.channel.last_read", oe(kt));
}
function ne(e) {
return [ "number" != typeof e ? null : {
type: "chat.queue_position",
nick: "system.queue",
queue_position: e
} ];
}
function ie(e) {
return function(t) {
return void 0 === t ? [ null ] : [ e[t] || null ];
};
}
function oe(e) {
return function(t) {
return re(t, e);
};
}
function re(e, t) {
var n = [];
for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && n.push(t(e[i], i));
return n;
}
function se(e, t) {
return function(n) {
return e.some(function(e) {
return n && e in n;
}) ? [ t() ] : [ null ];
};
}
function ae(e, t) {
return function(n) {
var i = [];
for (var o in n) if (Object.prototype.hasOwnProperty.call(n, o)) {
var r = n[o], s = e.some(function(e) {
return r && e in r;
});
s && i.push(t(o));
}
return i;
};
}
function ce(e) {
return e.split("$")[0];
}
function ue(e) {
if (!e || "object" != typeof e) return e;
var t = {};
for (var n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
var i = ce(n), o = ue(e[n]);
t[i] = o;
}
return t;
}
function le(e, t, n) {
var i = t ? t + ": " : "";
e = new Error("Zendesk Chat Web SDK: Error: " + i + e.message);
e.context = t;
e.extra = n;
Oe || window.console && window.console.error && console.error(e.message);
ee("error", e);
}
function de(e, t, n) {
for (var i = 0; i < e.length; i++) {
var o = e[i], r = o(t[i]);
if (r) {
le(r, n);
return !0;
}
}
return !1;
}
function fe(e) {
if ("[object File]" !== Object.prototype.toString.call(e)) return new Error("Expect a File object");
}
function he(e) {
if (!g(e)) return new Error("Expect a valid department id");
}
function pe(e) {
return function(t) {
var n = t.raw, i = "ok" === n.__status ? null : new window.Error("Failed");
for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && 0 === o.indexOf("__") && delete n[o];
e(i, n);
};
}
function me(e) {
for (var t, n, i = {}, o = 0; o < 7; o++) {
var r = e[o] || {};
if (r.enabled$bool) {
t = [];
n = r.periods;
for (var s in n) Object.prototype.hasOwnProperty.call(n, s) && t.push({
start: n[s].start$int,
end: n[s].end$int
});
i[o] = we(t);
} else i[o] = [];
}
return i;
}
function ge(e, t) {
var n, i = {}, o = ve(e), r = _e(e, t);
t.forEach(function(e) {
var t = r[e];
i[e] = {};
for (n = 0; n < 7; n++) i[e][n] = [];
t.forEach(function(t) {
for (var n in o[t]) Object.prototype.hasOwnProperty.call(o[t], n) && Array.prototype.push.apply(i[e][n], o[t][n]);
});
for (n = 0; n < 7; n++) {
var s = i[e][n];
s.length > 1 && (i[e][n] = we(s));
}
});
return i;
}
function _e(e, t) {
var n, i = {};
t.forEach(function(e) {
i[e] = [];
});
for (var o in e) if (Object.prototype.hasOwnProperty.call(e, o)) {
n = e[o];
for (var r in n.departments) if (Object.prototype.hasOwnProperty.call(n.departments, r)) {
if (!n.departments[r]) continue;
var s = ce(r);
if (!i[s]) continue;
i[s].push(o);
}
}
return i;
}
function ve(e) {
var t, n, i = {};
for (var o in e) if (Object.prototype.hasOwnProperty.call(e, o)) {
n = e[o];
if (Object.prototype.hasOwnProperty.call(n, "deleted_ts$int")) continue;
if (!n.departments) continue;
if (!n.enabled$bool) continue;
t = {};
for (var r = 0; r < 7; r++) {
var s = n[r], a = [];
if (s.enabled$bool && s.periods) {
var c = s.periods;
for (var u in c) Object.prototype.hasOwnProperty.call(c, u) && a.push({
start: c[u].start$int,
end: c[u].end$int
});
a.length && (t[r] = a);
}
}
Object.keys(t).length && (i[o] = t);
}
return i;
}
function ye(e, t) {
for (var n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
-1 !== t.indexOf(n) && (e[n] = re(e[n], function(e) {
return e;
}));
"object" == typeof e[n] && ye(e[n], t);
}
}
function we(e) {
if (e.length <= 1) return e;
var t = [];
e.forEach(function(e) {
t[e.start] = void 0 !== t[e.start] ? t[e.start] + 1 : 1;
t[e.end] = void 0 !== t[e.end] ? t[e.end] - 1 : -1;
});
return function(e) {
var t, n = [], i = 0;
e.forEach(function(e, o) {
e > 0 && !t && (t = o);
if (e) {
i += e;
if (0 === i) {
n.push({
start: t,
end: o
});
t = void 0;
}
}
});
return n;
}(t);
}
var be, $e, Ee, ke, Te, Oe, Le = n(2), xe = n(4), Ae = n(0), Ie = n(22), Re = n(1), Ce = n(12), Se = n(5), De = n(48), Ne = n(47), Pe = n(21), Me = n(20), Ve = n(3), je = n(45), Ue = n(6), qe = n(15), ze = n(41), Ke = n(40), Fe = n(39), We = n(29), He = n(26), Be = n(13), Ge = n(14), Ye = n(25), Xe = n(24), Ze = {
init: r,
reconnect: u,
getFirehose: l,
setVisitorInfo: f,
getVisitorInfo: d,
setVisitorDefaultDepartment: w,
getVisitorDefaultDepartment: y,
getAllDepartments: v,
getDepartment: g,
clearVisitorDefaultDepartment: b,
addTag: $,
removeTag: E,
addTags: T,
removeTags: O,
sendChatMsg: h,
sendFile: p,
sendVisitorPath: x,
sendChatComment: R,
sendChatRating: I,
getChatInfo: A,
endChat: C,
isChatting: S,
getServingAgentsInfo: D,
sendOfflineMsg: M,
sendTyping: Me.debounceExceptFirst(V, 300),
sendEmailTranscript: j,
getChatLog: H,
getConnectionStatus: B,
getAccountStatus: G,
getOperatingHours: P,
getQueuePosition: Y,
fetchChatHistory: X,
markAsRead: Me.throttle(Z, 2e3),
logout: i,
EMAIL_REGEX: Pe.email
}, Qe = Ae.extend(Ze), Je = !1, et = Ae.extend({}), tt = "web_sdk", nt = function() {}, it = qe, ot = /[0-9]+/, rt = /^(https?|ftps?):\/\//i, st = /\S/, at = it.any([ it.equal(""), it.type("string").regex(ot).maxLength(25) ]), ct = it.any([ it.equal(void 0), it.type("function") ]), ut = it.predicate(function(e) {
return -1 === e.indexOf(",");
}, "not contain any comma character"), lt = it.predicate(function(e) {
return "object" == typeof e.document && !!e.document && "object" == typeof e.navigator && !!e.navigator && "object" == typeof e.location && !!e.location;
}, "be a valid window object"), dt = {
interval: 6e5,
limit: 10,
callback: function() {
le(new Error("Call has been ratelimted"), "reconnect");
}
}, ft = ze.rateLimit(c, dt), ht = [ "email$string", "phone$string", "display_name$string" ], pt = {
connected: "connected",
connecting: "connecting",
closed: "closed"
}, mt = {
online: "online",
offline: "offline",
away: "away",
invalid_account_key: null,
banned: null
}, gt = ie(pt), _t = ie(mt), vt = Q(ht), yt = Q([ "name$string", "status$string" ], "id", U), wt = Q([ "avatar_path$string", "display_name$string", "title$string" ], "nick"), bt = Q([ "typing$bool" ], "nick", q), $t = Q([ "typing$bool" ], "display_name", z), Et = Q([ "timestamp$int" ], null, W), kt = Q([ "timestamp$int" ], "nick", K), Tt = (Q([ "banner", "behavior", "branding", "bubble", "chat_button", "chat_window", "concierge", "file_sending", "forms", "greetings", "language", "login", "rating", "sound", "theme", "timezone$string" ]), 
[ "on", "un", "fire", "unextendEvents", "init", "getFirehose", "getConnectionStatus" ]);
for (var Ot in Qe) Object.prototype.hasOwnProperty.call(Qe, Ot) && -1 === Tt.indexOf(Ot) && Se(Qe[Ot]) && (Qe[Ot] = function(e, t) {
return function() {
if (!1 !== Je) return t.apply(null, arguments);
le(new Error("Web SDK is not initialized yet. Please ensure that you call zChat.init() and wait for the connection to be established before calling this method"), e);
};
}(Ot, Qe[Ot]));
e.exports = Qe;
}, function(e, t, n) {
var i = n(49), o = i;
e.exports = o;
} ]);
});
//# sourceMappingURL=web_sdk.map