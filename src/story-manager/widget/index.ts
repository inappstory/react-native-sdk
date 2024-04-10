import {EventEmitter} from 'events';
import {BlobContentType, getBlobURL, isWindowSupportIframeBlobSrc, extend} from "./utils";
import fastXDM from './fast_xdm.js';
import {md5} from "./md5";
import {checkUrlProtocol} from "../helpers/media";
import {Brand, Option} from "../../../global.h";

declare global {
  interface Window {
    IAS_OLDReady: { _e: Array<any> };
    scrollNode: any; // browser env
    IAS_OLD: any;
    fastXDM: any;
    iasAsyncInitCallbacks: Array<() => void>;
  }
}

// create fastXDM on window -- изолирвоать от window
fastXDM(window);

// import StoryReader from "~/src/storyManager/widget/StoryReader";


window.IAS_OLD = window.IAS_OLD || {};


// env c URL test / prod


interface IAbstractModel {
  [key: string]: any
}


enum Events {
  START_LOADER = 'startLoader',
  END_LOADER = 'endLoader',
}

enum BlobType {

}

export type ObjectId = Brand<string, "objectId">

export default class Widget extends EventEmitter {
  static count: number = 0;
  static RPC: any = {};
  protected widgetId!: number | string;

  public callbacks: Dict<any> = {};

  private obj!: HTMLElement;
  private _loaderContainer: Option<HTMLElement> = null;
  public get loaderContainer(): HTMLElement {
    if (!this._loaderContainer) {
      const _loaderContainer = document.createElement('div');
      this.obj.style.position = 'relative';
      _loaderContainer.style.position = 'absolute';
      _loaderContainer.style.left = _loaderContainer.style.top = _loaderContainer.style.right = _loaderContainer.style.bottom = '0px';
      _loaderContainer.style.pointerEvents = 'none';
      this.obj.prepend(_loaderContainer);
      this._loaderContainer = _loaderContainer;
    }
    return this._loaderContainer;
  }

  public setCallbacks(callbacks: Dict<any>) {
    this.callbacks = callbacks;
  }

  constructor(objId: string, private _options: Dict) {
    super();

    const self = this;
    let obj: Option<HTMLElement> = null;
    if (objId === 'body') {
      obj = document.body;
    } else {
      obj = document.querySelector(objId);
    }

    if (obj) {
      this.obj = obj;
    }

    this.loaderContainer;
    // setTimeout(async () => await self.init(objId, options, params, funcs, defaults, onDone, widgetId, iter), 0);
  }

    public set options(options: Dict) {
        this._options = {...this._options, ...options};
    }
    public get options() {
        return this._options;
    }

  public async init(mountSelector: string, options: Dict) {
    const params = {};
    const funcs = {};
    const defaults = {};
    const onDone = () => {
    };
    const widgetId = null;
    const iter = null;

    return this._init(mountSelector as ObjectId, options, params, {}, funcs, defaults, onDone, widgetId, iter);
  }

  protected async _init(mountSelector: ObjectId, options: Dict, params: Dict, widgetParams: Dict, funcs: Dict, defaults: Dict, onDone: (obj: any, iframe: any, rpc: any) => void, widgetId: Nullable<string | number>, iter: Nullable<number>) {

    params = params || {};
    funcs = funcs || {};

    const self = this;
    let obj: Option<HTMLElement> = null;
    if (mountSelector === 'body') {
      obj = document.body;
    } else {
      obj = document.querySelector(mountSelector);
    }
    this.widgetId = widgetId || (++Widget.count);

    if (!obj) {
      let _iter = iter || 0;
      if (_iter > 10) {
        throw Error('IAS_OLD.Widget: object #' + mountSelector + ' not found.');
      }
      setTimeout(async () => {
        await self._init(mountSelector, options, params, widgetParams, funcs, defaults, onDone, self.widgetId, _iter + 1);
      }, 500);

      return;
    }


    options = options || {};
    defaults = defaults || {};
    funcs = funcs || {};

    if (options.preview) {
      params.preview = 1;
      delete options['preview'];
    }
    var ifr, url, urlQueryString, encodedParam, rpc: any, iframe: any, i,
      base_domain = options.base_domain || IAS_OLD._protocol + '//sdk-narrator.kiozk.ru',
      // base_domain = options.base_domain || IAS_OLD._protocol + '//sdk-nar-nar.test.kiozk.ru',
      width: number = options.width === 'auto' ? (obj.clientWidth || obj.offsetWidth || defaults.minWidth) | 0 : parseInt(options.width || 0, 10);
    const cssWidth: string = width ? (Math.max(defaults.minWidth || 200, Math.min(defaults.maxWidth || 10000, width)) + 'px') : '100%';

    if (!defaults.fullScreen) {
      obj.style.width = cssWidth;
      obj.style.overflow = 'hidden';

      if (options.height) {
        params.height = options.height;
        obj.style.height = options.height + 'px';
      } else {
        obj.style.height = (defaults.startHeight || 200) + 'px';
      }

      if (options.overflowTouch) {
        obj.style['overflow'] = 'auto';
        (obj as any).style['-webkit-overflow-scrolling'] = 'touch';
      }
    }


    if (cssWidth === '100%') params.startWidth = (obj.clientWidth || obj.offsetWidth) | 0;
    if (!params.url) params.url = options.pageUrl || location.href.replace(/#.*$/, '');

    // const widgetUrl = 'stories.php';
    // url = base_domain + '/' + widgetUrl;
    // urlQueryString = '';
    // if (!options.noDefaultParams) {
    //     urlQueryString += '&appKey=' + IAS_OLD._apiKey + '&width=' + encodeURIComponent(cssWidth)
    // }
    // urlQueryString += '&_ver=' + IAS_OLD.version
    params.url = params.url || "";
    params.referrer = params.referrer || document.referrer || "";
    params.title = params.title || document.title || "";
    params.userId = params.userId || '';

    params.origin = window.location.protocol + '//' + window.location.hostname;

    // for (i in params) {
    //     if (params.hasOwnProperty(i)) {
    //         if (typeof (params[i]) == 'number') {
    //             encodedParam = params[i];
    //         } else {
    //             try {
    //                 encodedParam = encodeURIComponent(params[i]);
    //             } catch (e) {
    //                 encodedParam = '';
    //             }
    //         }
    //         urlQueryString += '&' + i + '=' + encodedParam;
    //     }
    // }
    // urlQueryString += '&' + (+new Date()).toString(16);
    // url += '?' + urlQueryString.substr(1);

    const iframeDocumentResources = {
      html: this.getWidgetDocument(widgetParams), css: params.extraCss ?? null, js: params.extraJs ?? null
    };
    let blobUrl = this.getGeneratedPageURL(iframeDocumentResources);


    funcs.onStartLoading && funcs.onStartLoading();
    if (!options.no_loading) {
      self.loading(this.loaderContainer, true);
    }

    funcs.showLoader = function (enable: boolean) {
      IAS_OLD.Util.Loader(enable);
    };
    funcs.publish = function () {
      var args = Array.prototype.slice.call(arguments);
      args.push(self.widgetId);
      IAS_OLD.Observer.publish.apply(IAS_OLD.Observer, args);
    };
    funcs.onInit = function () {
      if (!options.no_finish_loading) {
        self.loading(this.loaderContainer, false);
      }
      // if (funcs.onReady) funcs.onReady();
      if (options.onReady) options.onReady();
    };
    funcs.hideLoader = function () {
      self.loading(this.loaderContainer, false);
    }
    funcs.resize = function (e: number, cb: () => void) {
      if (obj) {
        obj.style.height = e + 'px';
        var el = document.getElementById('iaswidget' + self.widgetId);
        if (el) {
          el.style.height = e + 'px';
        }
      }
    };
    funcs.resizeWidget = function (width: string, height: string) {
      const newWidth = parseInt(width);
      const newHeight = parseInt(height);
      var widgetElem = document.getElementById('iaswidget' + self.widgetId);
      if (isFinite(newWidth)) {
        if (obj) {
          obj.style.width = newWidth + 'px';
          if (widgetElem) {
            widgetElem.style.width = newWidth + 'px';
          }
        }
      }
      if (isFinite(newHeight)) {
        if (obj) {
          obj.style.height = newHeight + 'px';
          if (widgetElem) {
            widgetElem.style.height = newHeight + 'px';
          }
        }
      }
      if (options.onResizeWidget) options.onResizeWidget();
    };

    rpc = IAS_OLD.Widget.RPC[self.widgetId] = new window.fastXDM.Server(funcs, function (origin: string) {
      if (!origin) return true;
      origin = origin.toLowerCase();
      return true;
      // TODO вернуть обратно
      return (origin.match(/(\.|\/)inappstory\.com($|\/|\?)/));
    }, {safe: true});

    const iframeOptions: Dict<any> = {
      src: '',
      id: 'iaswidget' + self.widgetId,
      allowTransparency: options.allowTransparency || false,
      style: {
        backgroundColor: options.backgroundColor || 'transparent',
      }
    };

    if (!defaults.fullScreen) {
      iframeOptions.width = (cssWidth.indexOf('%') != -1) ? cssWidth : (parseInt(cssWidth) || cssWidth);
      iframeOptions.height = defaults.startHeight || '100%';

      // for correct @media in iframe work - pass innerWidth instead of clientWidth
      // plus parent div overflow: hidden
      // width: cssWidth === '100%' ? '100%' : cssWidth,
      // https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
      iframeOptions.style.width = '1px';
      iframeOptions.style.minWidth = '100%';
      iframeOptions.style["*width"] = '100%';
    } else {
      iframeOptions.style.position = 'fixed';
      iframeOptions.style.left = 0;
      iframeOptions.style.top = 0;
      iframeOptions.style.padding = 0;
      iframeOptions.style.border = 0;
      iframeOptions.style.zIndex = 1002;
      iframeOptions.style.width = '100%';
      iframeOptions.style.height = '100%';
    }

    if (defaults.scrolling) {
      iframeOptions.scrolling = 'yes';
    } else {
      iframeOptions.scrolling = 'no';
      iframeOptions.style.overflow = 'hidden';
    }

    if (defaults.hidden) {
      iframeOptions.style.display = 'none';
    }


    if (await isWindowSupportIframeBlobSrc()) {
      iframeOptions.src = blobUrl.src;
    } else {
      //@ts-ignore
      iframeOptions.srcdoc = blobUrl.srcdoc;
    }


    iframe = IAS_OLD.Widget.RPC[self.widgetId].append(obj, iframeOptions);
    onDone && setTimeout(function () {
      onDone(obj, iframe || obj?.firstChild, rpc);
    }, 10);


    this.emit('ready');

    // on initDone from iframe

    // this.on('sessionInitInternal', (payload: any) => storyReader.sessionInit(payload));


    return new Promise((resolve, reject) => {
      this.on('widgetLoaded', () => {
        // console.log('widgetLoaded');
        resolve(true)
      });
    });

  }


  showBoxUrl(domain: string, url: string) {
    domain = (domain || IAS_OLD._protocol + '//sdk-narrator.kiozk.ru').replace(/\/?\s*$/, '');
    url = url.replace(/^\s*\/?/, '');
    return domain + '/' + url;
  }



  loading(obj: any, enabled: boolean) {
    // if (enabled) {
    //   this.emit(Events.START_LOADER, obj);
    // } else {
    //   this.emit(Events.END_LOADER, obj);
    // }
    //
    //
    // if (this.listenerCount(Events.START_LOADER) === 0) {
    //   obj.style.background = enabled ? 'url("' + IAS_OLD._protocol + '//sdk-narrator.kiozk.ru/images/upload2.gif") center center no-repeat transparent' : 'none';
    // }
  }

  startLoader() {
    const baseUrl = process.env.BASE_URL;
    const buildVersion = process.env.BUILD_VERSION;

    // todo можно BASE_URL менять в процессе сборки
    let imgResource = checkUrlProtocol(`${baseUrl}/v${buildVersion}/dist/images/loader.gif`);
    if (process.env.NODE_ENV === "development") {
      imgResource = checkUrlProtocol(`${baseUrl}/images/loader.gif`);
    }

    this.loaderContainer.style.background = `url("${imgResource}") center center no-repeat transparent`;
  }
  stopLoader() {
    this.loaderContainer.style.background = 'none';
  }





  getGeneratedPageURL({html, css, js}: { html: string, css: Nullable<string>, js: Nullable<string> }) {
    let cssTag = '';
    let jsTag = '';
    if (css !== null) {
      cssTag = `<link rel="stylesheet" type="text/css" href="${getBlobURL(css, BlobContentType.CSS)}" />`;
    }
    if (js !== null) {
      jsTag = `<script >${getBlobURL(js, BlobContentType.JS)}</script>`;
    }
    const baseURI = document.baseURI;
    const source = `
    <html>
      <head>
        <base href="${baseURI}"></base>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${cssTag}
        ${jsTag}
      </head>
      <body>
        ${html || ''}
      </body>
    </html>
  `;

    if (css !== null) {
      cssTag = `<style>${css}</style>`;
    }
    if (js !== null) {
      jsTag = `<script>${js}</script>`;
    }
    let htmlVariant = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${cssTag}
        ${jsTag}
      </head>
      <body>
        ${html || ''}
      </body>
    </html>
        `;
    return {src: getBlobURL(source, BlobContentType.HTML), srcdoc: htmlVariant};
  }

  getWidgetDocument(widgetParams: Dict): string {
    return '';
  }

  destroy(widgetId: string, objId: string) {
    var obj = document.getElementById(objId);
    if (!obj) {
      throw Error('IAS_OLD.Widget: object #' + objId + ' not found.');
    }
    var rpc = Widget.RPC[widgetId];
    if (!rpc) {
      rpc.destroy();
    }
    // TODO destroy APP
    obj.innerHTML = '';
  }


}


export class IAS_OLD {
  static version = 'v1';
  static MD5: any = md5;
  static extend: any = extend;

  static readonly _protocol = 'https:';
  static readonly _base_domain = '';

  static Widget: any = Widget;

  // static Stories = Stories;
  // static StoryReader = StoryReader;


  static xdConnectionCallbacks: Array<any>;
  static init: any;
  static _apiKey: any;
  static userId: any;

  static XDM: any;
  static _domain: any;
  static _path: any;
  static xdReady: any;
  static Observer: any;

  static _rootId: any;

  static Util: any;

}


if (!IAS_OLD.xdConnectionCallbacks) {

  IAS_OLD.extend(IAS_OLD, {
    version: 1,
    _apiKey: null,
    _session: null,
    _domain: {
      // main: IAS_OLD._protocol + '//sdk-narrator.kiozk.ru/',
      main: IAS_OLD._protocol + '//sdk-narrator.kiozk.ru/',
      api: IAS_OLD._protocol + '//api-narrator.kiozk.ru/'
    },
    _path: {
      login: 'authorize',
      proxy: 'fxdm_oauth_proxy.html'
    },
    _rootId: 'ias_api_transport',
    _nameTransportPath: '',
    xdReady: false,

  });

  IAS_OLD.init = function (options: Dict) {
    var body, root;

    IAS_OLD._apiKey = null;

    if (!options.apiKey) {
      throw Error('IAS_OLD.init() called without an apiKey');
    }
    IAS_OLD._apiKey = options.apiKey;

    IAS_OLD.userId = options.userId;
    return true;

  };


} else { // if IAS_OLD.xdConnectionCallbacksready
  setTimeout(function () {
    var callback;
    while (callback = IAS_OLD.xdConnectionCallbacks.pop()) {
      callback();
    }
  }, 0);

  // if (IAS_OLD.Widget && !IAS_OLD.Widget._constructor) {
  //     IAS_OLD.Widget = false;
  // }
}

if (!IAS_OLD.XDM) {
  IAS_OLD.XDM = {
    remote: null,
    init: function () {
      if (this.remote) return false;
      var url = IAS_OLD._domain.api + IAS_OLD._path.proxy;
      this.remote = new window.fastXDM.Server({
        onInit: function () {
          IAS_OLD.xdReady = true;
          IAS_OLD.Observer.publish('xdm.init');
        }
      });

      this.remote.append(document.getElementById(IAS_OLD._rootId), {
        src: url
      });
    },
    xdHandler: function (code: string) {
      try {
        eval('IAS_OLD.' + code);
      } catch (e) {
        // nope
      }
    }
  };
}

if (!IAS_OLD.Observer) {
  IAS_OLD.Observer = {
    _subscribers: function () {
      if (!this._subscribersMap) {
        this._subscribersMap = {};
      }
      return this._subscribersMap;
    },
    publish: function (/*eventName: string*/) {

      var
        args = Array.prototype.slice.call(arguments),
        eventName = args.shift(),
        subscribers = this._subscribers()[eventName],
        i, j;

      if (!subscribers) return;

      for (i = 0, j = subscribers.length; i < j; i++) {
        if (subscribers[i] != null) {
          subscribers[i].apply(this, args);
        }
      }
    },
    subscribe: function (eventName: string, handler: any) {
      var
        subscribers = this._subscribers();

      if (typeof handler != 'function') return false;

      if (!subscribers[eventName]) {
        subscribers[eventName] = [handler];
      } else {
        subscribers[eventName].push(handler);
      }
    },
    unsubscribe: function (eventName: string, handler: any) {
      var
        subscribers = this._subscribers()[eventName],
        i, j;

      if (!subscribers) return false;
      if (typeof handler == 'function') {
        for (i = 0, j = subscribers.length; i < j; i++) {
          if (subscribers[i] == handler) {
            subscribers[i] = null;
          }
        }
      } else {
        delete this._subscribers()[eventName];
      }
    }
  };
}

if (!IAS_OLD.Util) {
  IAS_OLD.Util = {
    getStyle: function (elem: any, name: string) {
      var ret, defaultView = document.defaultView || window;
      if (defaultView.getComputedStyle) {
        name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
        var computedStyle = defaultView.getComputedStyle(elem, null);
        if (computedStyle) {
          ret = computedStyle.getPropertyValue(name);
        }
      } else if (elem.currentStyle) {
        var camelCase = name.replace(/\-(\w)/g, function (all, letter) {
          return letter.toUpperCase();
        });
        ret = elem.currentStyle[name] || elem.currentStyle[camelCase];
      }

      return ret;
    },

    getXY: function (obj: any, fixed: boolean) {
      if (!obj || obj === undefined) return;

      var left = 0, top = 0;
      if (obj.getBoundingClientRect !== undefined) {
        var rect = obj.getBoundingClientRect();
        left = rect.left;
        top = rect.top;
        fixed = true;
      } else if (obj.offsetParent) {
        do {
          left += obj.offsetLeft;
          top += obj.offsetTop;
          if (fixed) {
            left -= obj.scrollLeft;
            top -= obj.scrollTop;
          }
        } while (obj = obj.offsetParent);
      }
      if (fixed) {
        top += window.pageYOffset || window.scrollNode && window.scrollNode.scrollTop || document.documentElement.scrollTop;
        left += window.pageXOffset || window.scrollNode && window.scrollNode.scrollLeft || document.documentElement.scrollLeft;
      }

      return [left, top];
    },

    Loader: function self(enable: boolean) {
      if (!(self as any).loader) {
        (self as any).loader = document.createElement('DIV');
        (self as any).loader.innerHTML = '<style type="text/css">\
        @-webkit-keyframes IAS_OLDWidgetsLoaderKeyframes {0%{opacity: 0.2;}30%{opacity: 1;}100%{opacity: 0.2;}}\
        @keyframes IAS_OLDWidgetsLoaderKeyframes {0%{opacity: 0.2;}30%{opacity: 1;}100%{opacity: 0.2;}}\
        .IAS_OLDWidgetsLoader div {width: 7px;height: 7px;-webkit-border-radius: 50%;-khtml-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;background: #fff;top: 21px;position: absolute;z-index: 2;-o-transition: opacity 350ms linear; transition: opacity 350ms linear;opacity: 0.2;-webkit-animation-duration: 750ms;-o-animation-duration: 750ms;animation-duration: 750ms;-webkit-animation-name: IAS_OLDWidgetsLoaderKeyframes;-o-animation-name: IAS_OLDWidgetsLoaderKeyframes;animation-name: IAS_OLDWidgetsLoaderKeyframes;-webkit-animation-iteration-count: infinite;-o-animation-iteration-count: infinite;animation-iteration-count: infinite;-webkit-transform: translateZ(0);transform: translateZ(0);}</style><div class="IAS_OLDWidgetsLoader" style="position: fixed;left: 50%;top: 50%;margin: -25px -50px;z-index: 1002;height: 50px;width: 100px;"><div style="left: 36px;-webkit-animation-delay: 0ms;-o-animation-delay: 0ms;animation-delay: 0ms;"></div><div style="left: 47px;-webkit-animation-delay: 180ms;-o-animation-delay: 180ms;animation-delay: 180ms;"></div><div style="left: 58px;-webkit-animation-delay: 360ms;-o-animation-delay: 360ms;animation-delay: 360ms;"></div><span style="display: block;background-color: #000;-webkit-border-radius: 4px;-khtml-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px;-webkit-box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.35);-moz-box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.35);box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.35);position: absolute;left: 0;top: 0;bottom: 0; right: 0;z-index: 1;opacity: 0.7;"></span></div>';
        document.body.insertBefore((self as any).loader, document.body.firstChild);
      }
      (self as any).loader.style.display = enable ? 'block' : 'none';
    },

    addEvent: function (type: any, func: any, target: any) {
      target = target || window.document;
      if (target.addEventListener) {
        target.addEventListener(type, func, false);
      } else if (target.attachEvent) {
        target.attachEvent('on' + type, func);
      }
    },

    removeEvent: function (type: any, func: any, target: any) {
      target = target || window.document;
      if (target.removeEventListener) {
        target.removeEventListener(type, func, false);
      } else if (target.detachEvent) {
        target.detachEvent('on' + type, func);
      }
    },

    ss: function (el: any, styles: any) {
      IAS_OLD.extend(el.style, styles, true);
    },

    getScroll: function () {
      if (window.pageYOffset !== undefined) {
        return [pageXOffset, pageYOffset];
      } else {
        var sx, sy, d = document,
          r = d.documentElement,
          b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
      }
    }

  };
}

// Init asynchronous library loading
if (window.IAS_OLDReady && window.IAS_OLDReady._e) {
  for (let i = 0; i < window.IAS_OLDReady._e.length; i++) {
    setTimeout(window.IAS_OLDReady._e[i], 0);
  }
}

// window.iasAsyncInit && setTimeout(iasAsyncInit, 0);

if (window.iasAsyncInitCallbacks && window.iasAsyncInitCallbacks.length) {
  setTimeout(function () {
    var callback;
    while (callback = window.iasAsyncInitCallbacks.pop()) {
      try {
        callback();
      } catch (e) {
        try {
          console.error(e);
        } catch (e2) {
        }
      }
    }
  }, 0);
}


// window.IAS_OLD = IAS_OLD;




