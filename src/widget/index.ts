import {EventEmitter} from 'events';
import {BlobContentType, getBlobURL, extend} from "./utils";
import {md5} from "./md5";
import {checkUrlProtocol} from "../helpers/media";
import {Brand, Option, Dict} from "../../global.h";

declare global {
  interface Window {
    scrollNode: any; // browser env
    iasAsyncInitCallbacks: Array<() => void>;
  }
}

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

/*
Фабрика
создание и вставка в виджета в разметку
Adapter
iframe или View.webview
общение - класс Transport - может быть общий
WebView onMessage={this.webViewMessageHandler}

 */

export default class Widget extends EventEmitter {
  static count: number = 0;
  static RPC: any = {};
  protected widgetId!: number | string;

  public callbacks: Dict<any> = {};

  private obj!: HTMLElement;
  private _loaderContainer: Option<HTMLElement> = null;
  public get loaderContainer() {
    // if (!this._loaderContainer) {
    //   const _loaderContainer = document.createElement('div');
    //   this.obj.style.position = 'relative';
    //   _loaderContainer.style.position = 'absolute';
    //   _loaderContainer.style.left = _loaderContainer.style.top = _loaderContainer.style.right = _loaderContainer.style.bottom = '0px';
    //   _loaderContainer.style.pointerEvents = 'none';
    //   this.obj.prepend(_loaderContainer);
    //   this._loaderContainer = _loaderContainer;
    // }
    return this._loaderContainer;
  }

  public setCallbacks(callbacks: Dict<any>) {
    this.callbacks = callbacks;
  }

  constructor() {
    super();

    // const self = this;
    // let obj: Option<HTMLElement> = null;
    // if (objId === 'body') {
    //   obj = document.body;
    // } else {
    //   obj = document.querySelector(objId);
    // }
    //
    // if (obj) {
    //   this.obj = obj;
    // }

    this.loaderContainer;
    // setTimeout(async () => await self.init(objId, options, params, funcs, defaults, onDone, widgetId, iter), 0);
  }

  public async init(mountSelector: string, options: Dict) {
    const params = {};
    const funcs = {};
    const defaults = {};
    const onDone = () => {
    };
    const widgetId = null;
    const iter = null;

    // return this._init(mountSelector as ObjectId, options, params, {}, funcs, defaults, onDone, widgetId, iter);
  }

  // protected async _init(mountSelector: ObjectId, options: Dict, params: Dict, widgetParams: Dict, funcs: Dict, defaults: Dict, onDone: (obj: any, iframe: any, rpc: any) => void, widgetId: Option<string | number>, iter: Option<number>) {
  //
  //   params = params || {};
  //   funcs = funcs || {};
  //
  //   const self = this;
  //   let obj: Option<HTMLElement> = null;
  //   if (mountSelector === 'body') {
  //     obj = document.body;
  //   } else {
  //     obj = document.querySelector(mountSelector);
  //   }
  //   this.widgetId = widgetId || (++Widget.count);
  //
  //   if (!obj) {
  //     let _iter = iter || 0;
  //     if (_iter > 10) {
  //       throw Error('IAS_OLD.Widget: object #' + mountSelector + ' not found.');
  //     }
  //     setTimeout(async () => {
  //       await self._init(mountSelector, options, params, widgetParams, funcs, defaults, onDone, self.widgetId, _iter + 1);
  //     }, 500);
  //
  //     return;
  //   }
  //
  //
  //   options = options || {};
  //   defaults = defaults || {};
  //   funcs = funcs || {};
  //
  //   if (options.preview) {
  //     params.preview = 1;
  //     delete options['preview'];
  //   }
  //   var ifr, url, urlQueryString, encodedParam, rpc: any, iframe: any, i,
  //     base_domain = options.base_domain || IAS_OLD._protocol + '//sdk-narrator.kiozk.ru',
  //     // base_domain = options.base_domain || IAS_OLD._protocol + '//sdk-nar-nar.test.kiozk.ru',
  //     width: number = options.width === 'auto' ? (obj.clientWidth || obj.offsetWidth || defaults.minWidth) | 0 : parseInt(options.width || 0, 10);
  //   const cssWidth: string = width ? (Math.max(defaults.minWidth || 200, Math.min(defaults.maxWidth || 10000, width)) + 'px') : '100%';
  //
  //   if (!defaults.fullScreen) {
  //     obj.style.width = cssWidth;
  //     obj.style.overflow = 'hidden';
  //
  //     if (options.height) {
  //       params.height = options.height;
  //       obj.style.height = options.height + 'px';
  //     } else {
  //       obj.style.height = (defaults.startHeight || 200) + 'px';
  //     }
  //
  //     if (options.overflowTouch) {
  //       obj.style['overflow'] = 'auto';
  //       (<any>obj).style['-webkit-overflow-scrolling'] = 'touch';
  //     }
  //   }
  //
  //
  //   if (cssWidth === '100%') params.startWidth = (obj.clientWidth || obj.offsetWidth) | 0;
  //   if (!params.url) params.url = options.pageUrl || location.href.replace(/#.*$/, '');
  //
  //   // const widgetUrl = 'stories.php';
  //   // url = base_domain + '/' + widgetUrl;
  //   // urlQueryString = '';
  //   // if (!options.noDefaultParams) {
  //   //     urlQueryString += '&appKey=' + IAS_OLD._apiKey + '&width=' + encodeURIComponent(cssWidth)
  //   // }
  //   // urlQueryString += '&_ver=' + IAS_OLD.version
  //   params.url = params.url || "";
  //   params.referrer = params.referrer || document.referrer || "";
  //   params.title = params.title || document.title || "";
  //   params.userId = params.userId || '';
  //
  //   params.origin = window.location.protocol + '//' + window.location.hostname;
  //
  //   // for (i in params) {
  //   //     if (params.hasOwnProperty(i)) {
  //   //         if (typeof (params[i]) == 'number') {
  //   //             encodedParam = params[i];
  //   //         } else {
  //   //             try {
  //   //                 encodedParam = encodeURIComponent(params[i]);
  //   //             } catch (e) {
  //   //                 encodedParam = '';
  //   //             }
  //   //         }
  //   //         urlQueryString += '&' + i + '=' + encodedParam;
  //   //     }
  //   // }
  //   // urlQueryString += '&' + (+new Date()).toString(16);
  //   // url += '?' + urlQueryString.substr(1);
  //
  //   const iframeDocumentResources = {
  //     html: this.getWidgetDocument(widgetParams), css: params.extraCss ?? null, js: params.extraJs ?? null
  //   };
  //   let blobUrl = this.getGeneratedPageURL(iframeDocumentResources);
  //
  //
  //   funcs.onStartLoading && funcs.onStartLoading();
  //   if (!options.no_loading) {
  //     self.loading(this.loaderContainer, true);
  //   }
  //
  //   funcs.showLoader = function (enable: boolean) {
  //     IAS_OLD.Util.Loader(enable);
  //   };
  //   funcs.publish = function () {
  //     var args = Array.prototype.slice.call(arguments);
  //     args.push(self.widgetId);
  //     IAS_OLD.Observer.publish.apply(IAS_OLD.Observer, args);
  //   };
  //   funcs.onInit = function () {
  //     if (!options.no_finish_loading) {
  //       self.loading(this.loaderContainer, false);
  //     }
  //     // if (funcs.onReady) funcs.onReady();
  //     if (options.onReady) options.onReady();
  //   };
  //   funcs.hideLoader = function () {
  //     self.loading(this.loaderContainer, false);
  //   }
  //   funcs.resize = function (e: number, cb: () => void) {
  //     if (obj) {
  //       obj.style.height = e + 'px';
  //       var el = document.getElementById('iaswidget' + self.widgetId);
  //       if (el) {
  //         el.style.height = e + 'px';
  //       }
  //     }
  //   };
  //   funcs.resizeWidget = function (width: string, height: string) {
  //     const newWidth = parseInt(width);
  //     const newHeight = parseInt(height);
  //     var widgetElem = document.getElementById('iaswidget' + self.widgetId);
  //     if (isFinite(newWidth)) {
  //       if (obj) {
  //         obj.style.width = newWidth + 'px';
  //         if (widgetElem) {
  //           widgetElem.style.width = newWidth + 'px';
  //         }
  //       }
  //     }
  //     if (isFinite(newHeight)) {
  //       if (obj) {
  //         obj.style.height = newHeight + 'px';
  //         if (widgetElem) {
  //           widgetElem.style.height = newHeight + 'px';
  //         }
  //       }
  //     }
  //     if (options.onResizeWidget) options.onResizeWidget();
  //   };
  //
  //   rpc = IAS_OLD.Widget.RPC[self.widgetId] = new window.fastXDM.Server(funcs, function (origin: string) {
  //     if (!origin) return true;
  //     origin = origin.toLowerCase();
  //     return true;
  //     // TODO вернуть обратно
  //     return (origin.match(/(\.|\/)inappstory\.com($|\/|\?)/));
  //   }, {safe: true});
  //
  //   const iframeOptions: Dict<any> = {
  //     src: '',
  //     id: 'iaswidget' + self.widgetId,
  //     allowTransparency: options.allowTransparency || false,
  //     style: {
  //       backgroundColor: options.backgroundColor || 'transparent',
  //     }
  //   };
  //
  //   if (!defaults.fullScreen) {
  //     iframeOptions.width = (cssWidth.indexOf('%') != -1) ? cssWidth : (parseInt(cssWidth) || cssWidth);
  //     iframeOptions.height = defaults.startHeight || '100%';
  //
  //     // for correct @media in iframe work - pass innerWidth instead of clientWidth
  //     // plus parent div overflow: hidden
  //     // width: cssWidth === '100%' ? '100%' : cssWidth,
  //     // https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
  //     iframeOptions.style.width = '1px';
  //     iframeOptions.style.minWidth = '100%';
  //     iframeOptions.style["*width"] = '100%';
  //   } else {
  //     iframeOptions.style.position = 'fixed';
  //     iframeOptions.style.left = 0;
  //     iframeOptions.style.top = 0;
  //     iframeOptions.style.padding = 0;
  //     iframeOptions.style.border = 0;
  //     iframeOptions.style.zIndex = 1002;
  //     iframeOptions.style.width = '100%';
  //     iframeOptions.style.height = '100%';
  //   }
  //
  //   if (defaults.scrolling) {
  //     iframeOptions.scrolling = 'yes';
  //   } else {
  //     iframeOptions.scrolling = 'no';
  //     iframeOptions.style.overflow = 'hidden';
  //   }
  //
  //   if (defaults.hidden) {
  //     iframeOptions.style.display = 'none';
  //   }
  //
  //
  //   if (await isWindowSupportIframeBlobSrc()) {
  //     iframeOptions.src = blobUrl.src;
  //   } else {
  //     //@ts-ignore
  //     iframeOptions.srcdoc = blobUrl.srcdoc;
  //   }
  //
  //
  //   iframe = IAS_OLD.Widget.RPC[self.widgetId].append(obj, iframeOptions);
  //   onDone && setTimeout(function () {
  //     onDone(obj, iframe || obj?.firstChild, rpc);
  //   }, 10);
  //
  //
  //   this.emit('ready');
  //
  //   // on initDone from iframe
  //
  //   // this.on('sessionInitInternal', (payload: any) => storyReader.sessionInit(payload));
  //
  //
  //   return new Promise((resolve, reject) => {
  //     this.on('widgetLoaded', () => {
  //       // console.log('widgetLoaded');
  //       resolve(true)
  //     });
  //   });
  //
  // }

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


  getGeneratedPageURL({html, css, js}: { html: string, css: Option<string>, js: Option<string> }) {
    let cssTag = '';
    let jsTag = '';
    if (css !== null) {
      cssTag = `<link rel="stylesheet" type="text/css" href="${getBlobURL(css, BlobContentType.CSS)}" />`;
    }
    if (js !== null) {
      jsTag = `<script >${getBlobURL(js, BlobContentType.JS)}</script>`;
    }
    const source = `
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
    // var obj = document.getElementById(objId);
    // if (!obj) {
    //   throw Error('IAS_OLD.Widget: object #' + objId + ' not found.');
    // }
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







