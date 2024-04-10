import "./xdm"
import {EventEmitter} from "events"

const extend = require('lodash/extend'); // commonJS for node
// (<any>window).extend = extend;
export {extend};

(<any>window).parseJSON = ((<any>window).JSON && JSON.parse) ? function (obj: any) {
    try { return JSON.parse(obj); } catch (e) {
        // topError('<b>parseJSON:</b> ' + e.message, {dt: -1, type: 5, answer: obj});
        return eval('('+obj+')');
    }
} : function(obj: any) {
    return eval('('+obj+')');
};

(<any>window).cur = {destroy: [], nav: []}; // Current page variables and navigation map.

const _ua = navigator.userAgent.toLowerCase();
const browser = {
    version: (_ua.match( /.+(?:me|ox|on|rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
    opera: /opera/i.test(_ua),
    msie: (/msie/i.test(_ua) && !/opera/i.test(_ua)),
    msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
    msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
    msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
    msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
    mozilla: /firefox/i.test(_ua),
    chrome: /chrome/i.test(_ua),
    safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
    iphone: /iphone/i.test(_ua),
    ipod: /ipod/i.test(_ua),
    iphone4: /iphone.*OS 4/i.test(_ua),
    ipod4: /ipod.*OS 4/i.test(_ua),
    ipad: /ipad/i.test(_ua),
    safari_mobile: /iphone|ipod|ipad/i.test(_ua),
    android: /android/i.test(_ua),
    opera_mobile: /opera mini|opera mobi/i.test(_ua),
    mobile: /iphone|ipod|ipad|opera mini|opera mobi|mobile/i.test(_ua),
    mac: /mac/i.test(_ua),
    smart_tv: /smart-tv|smarttv/i.test(_ua)
};


/* Debug */

(<any>window)._logTimer = (new Date()).getTime();
export function debugLog(msg: any) {
    try {
        const t = '[' + (((new Date()).getTime() - (<any>window)._logTimer) / 1000) + '] ';
/*        if (ge('debuglog')) {
            if (msg === null) {
                msg = '[NULL]';
            } else if (msg === undefined) {
                msg = '[UNDEFINED]';
            }
            ge('debuglog').innerHTML += t + msg.toString().replace('<', '&lt;').replace('>', '&gt;')+'<br/>';
        }*/
        if (window.console && console.log) {
            Array.prototype.unshift.call(arguments, t);
            console.log.apply(console, (<any>arguments));
        }
    } catch (e) {
    }
}

export function ge(el: any) {
    return typeof el == 'string' ? document.getElementById(el) : el;
}

export function geByClass(searchClass: any, node: any, tag: any) {
    node = ge(node) || document;
    tag = tag || '*';
    var classElements = [];

    if (browser.msie8 && node.querySelectorAll && tag != '*') {
        return node.querySelectorAll(tag + '.' + searchClass);
    }
    if (node.getElementsByClassName) {
        var nodes = node.getElementsByClassName(searchClass);
        if (tag != '*') {
            tag = tag.toUpperCase();
            for (var i = 0, l = nodes.length; i < l; ++i) {
                if (nodes[i].tagName.toUpperCase() == tag) {
                    classElements.push(nodes[i]);
                }
            }
        } else {
            classElements = Array.prototype.slice.call(nodes);
        }
        return classElements;
    }

    var els = geByTag(tag, node);
    var pattern = new RegExp('(^|\\s)' + searchClass + '(\\s|$)');
    for (var i = 0, l = els.length; i < l; ++i) {
        if (pattern.test(els[i].className)) {
            classElements.push(els[i]);
        }
    }
    return classElements;
}

export function geByClass1(searchClass: string, node?: any, tag?: any) {
    node = ge(node) || document;
    tag = tag || '*';
    return !browser.msie8 && node.querySelector && node.querySelector(tag + '.' + searchClass) || geByClass(searchClass, node, tag)[0];
}

export function geByTag(searchTag: any, node: any) {
    node = ge(node) || document;
    return node.getElementsByTagName(searchTag);
}

export function geByTag1(searchTag: any, node: any) {
    node = ge(node) || document;
    return node.querySelector && node.querySelector(searchTag) || geByTag(searchTag, node)[0];
}



export function loadScript(scriptSrc: string, options: any) {
    var timeout = options.timeout;
    var onLoad = options.onLoad;
    var onError = options.onError;

    const script = document.createElement('script');
    script.addEventListener('load', success);
    script.addEventListener('readystatechange', success);
    script.addEventListener('error', fail);
    script.src = scriptSrc;
    document.head.appendChild(script);

    if (timeout) {
        var failTimeout = setTimeout(fail, timeout);
    }

    function success(evt: any) {
        if ((<any>script).readyState && (<any>script).readyState != 'loaded' && (<any>script).readyState != 'complete') return;

        removeListeners();
        onLoad && onLoad();
    }

    function fail(evt: any) {
        removeListeners();
        onError && onError();
    }

    function removeListeners() {
        clearTimeout(failTimeout);
        script.removeEventListener('load', success);
        script.removeEventListener('readystatechange', success);
        script.removeEventListener('error', fail);
    }

    return {
        destroy: function destroy() {
            removeListeners();
        }
    };
}


