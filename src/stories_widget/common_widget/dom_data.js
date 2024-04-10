/* Store data connected to element */

import {ge} from "./common"

function now() {
  return +new Date;
}

window.kiozkExpand = 'KIOZK' + now();
window.kiozkUUID = 0;
window.kiozkCache = {};

export function data(elem, name, data) {
  let id = elem[kiozkExpand], undefined;
  if (!id) {
    id = elem[kiozkExpand] = ++kiozkUUID;
  }

  if (name && !kiozkCache[id]) {
    kiozkCache[id] = {};
  }

  if (data !== undefined) {
    kiozkCache[id][name] = data;
  }

  return name ? kiozkCache[id][name] : id;
}

export function attr(el, attrName, value) {
  el = ge(el);
  if (typeof value == 'undefined') {
    return el.getAttribute(attrName);
  } else {
    el.setAttribute(attrName, value);
    return value;
  }
}

export function removeAttr(el) {
  for (var i = 0; i < arguments.length; ++i) {
    var n = arguments[i];
    if (el[n] === undefined) continue;
    try {
      delete el[n];
    } catch(e) {
      try {
        el.removeAttribute(n);
      } catch(e) {}
    }
  }
}

export function removeData(elem, name) {
  var id = elem ? elem[vkExpand] : false;
  if (!id) return;

  if (name) {
    if (vkCache[id]) {
      delete vkCache[id][name];
      name = '';
      for (name in vkCache[id]) {
        break;
      }

      if (!name) {
        removeData(elem);
      }
    }
  } else {
    removeEvent(elem);
    removeAttr(elem, vkExpand);
    delete vkCache[id];
  }
}

export function cleanElems() {
  var a = arguments;
  for (var i = 0; i < a.length; ++i) {
    var el = ge(a[i]);
    if (el) {
      removeData(el);
      removeAttr(el, 'btnevents');
    }
  }
}