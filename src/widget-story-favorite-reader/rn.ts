import {Dict, Option} from "../../global.h";
import Widget, {ObjectId} from "../widget";
import {
    ClickOnStoryInternalWithDataPayload,
    ClickOnStoryPayload,
    STORY_LIST_TYPE,
    STORY_READER_WINDOW_REFERER,
    SyncStoreEvent
} from "../story-manager/common.h";
import {StoryFavoriteReaderOptions, StoryFavoriteReaderOptionsDefault} from "../story-manager/storyFavoriteReader.h";
import {AppearanceCommonOptions, AppearanceCommonOptionsDefault} from "../story-manager/appearanceCommon.h";
import {IWidgetStoryFavoriteReader} from "./index";
import {AppearanceManager} from "../story-manager/AppearanceManager";
import {CreateViewOptions} from "./rn.h";
import * as RPC from "./rpc";
import {create as createRpcServer, RPCServer} from "../rpc/remoteFX/server";
import {WebViewWorkerServer} from "../rpc/WebViewWorkerServer";
// escaped content
// @ts-ignore
import jsResourceGlobal from "../../packages/react-native-ias/StoryFavoriteReaderClient.js";
//@ts-ignore
import cssResourceGlobal from "../../packages/react-native-ias/StoryFavoriteReaderClient.css.js";
import {isFunction} from "../helpers/isFunction";
import {widgetLoaded} from "../widget-stories-list/rpc";
import {BackHandler, Platform} from "react-native";
import {StoriesListOptions, StoriesListOptionsDefault} from "../widget-stories-list/index.h";
import {clickOnStoryInternalEvent} from "./rpc";
import {ModalPresentation} from "../widget/ModalPresentation";

declare global {
  interface Window {
    scrollNode: any; // browser env
    fastXDM: any;
    iasAsyncInitCallbacks: Array<() => void>;
  }
}

// const result = await workerMessage('foo bar  baz bam')

// const jsResourceGlobal = new URL("./StoriesListClient.umd.js", import.meta.url);
// const cssResourceGlobal = new URL("./StoriesListClient.umd.css", import.meta.url);

// const jsResourceGlobal = "";
// const cssResourceGlobal = "";


class WidgetStoryFavoriteReader extends Widget implements IWidgetStoryFavoriteReader {

    modalPresentation: ModalPresentation;
    private openStoryFavoriteReaderWithOptions: Dict = {};

  constructor(private appearanceManagerGetter: () => Option<AppearanceManager>) {
    super();

      this.modalPresentation = new ModalPresentation();

    this.widgetId = ++Widget.count;

    // вынести в общую часть
    RPC.widgetLoaded.use(() => {
      this.emit("widgetLoaded");
    });

      // вынести в общую часть
      RPC.widgetEvent.use(({name, payload}) => {
          this.emit(name, payload);
      });



    RPC.onReaderOpened.use(options => {

      if (options.windowReferer === STORY_READER_WINDOW_REFERER.default) {
        // web container only !
        // sbHelper.setScrollbar();
      } else if (options.windowReferer === STORY_READER_WINDOW_REFERER.favorite) {
        // self.emit('openStoryReader', options);
      }

      this.emit('openedStoryFavoriteReader', options);

      // if (body) {
      //     body.style.setProperty('user-select', 'none');
      //     body.style.setProperty('-webkit-user-select', 'none');
      //
      //     body.style.setProperty('overflow', 'hidden');
      //     body.style.setProperty('-webkit-overflow-scrolling', 'touch');
      // }

      // if (html) {
      //   // TODO сохранять оригинал и возвраащать обратно
      //   // html.style.setProperty('position', 'fixed');
      //   // html.style.setProperty('overflow', 'hidden');
      // }

      // if (self.iframe) {
      //   // self.iframe.style.setProperty('position', 'fixed');
      //   self.iframe.style.setProperty('display', 'block');
      //   // self.iframe.style.setProperty('height', '0')
      //   // self.iframe.style.setProperty('min-height', '100%')
      //   // self.iframe.style.setProperty('max-height', '100%')
      //
      //   self.iframe.style.setProperty('z-index', zIndex)
      // }

    });

      RPC.onReaderClosed.use(options => {
          if (options.windowReferer === STORY_READER_WINDOW_REFERER.default) {
              // web container only !
              // sbHelper.resetScrollbar();
          } else if (options.windowReferer === STORY_READER_WINDOW_REFERER.favorite) {
              // self.emit('closeStoryReader', options);
          }

          this.emit('closeStoryFavoriteReader', options);

          // set display none


          // if (self.iframe) {
          //   self.iframe.style.setProperty('display', 'none');
          // }

          // if (body) {
          //     body.style.setProperty('user-select', '');
          //     body.style.setProperty('-webkit-user-select', '');
          //
          //     body.style.setProperty('overflow', '');
          //     body.style.setProperty('-webkit-overflow-scrolling', '');
          // }

          // if (html) {
          //
          //   // TODO сохранять оригинал и возвраащать обратно
          //   // html.style.setProperty('position', '');
          //   // html.style.setProperty('overflow', '');
          // }
      });

      RPC.clickOnStoryInternalEvent.use(options => {
          this.emit('clickOnStoryInternal', options);
      });


    const functions = {

      // event: function (name: string, data: Object) {
      //   self.emit(name, data)
      // },

      // setFixedHtmlPosition: function () {
      //   if (html) {
      //     // TODO сохранять оригинал и возвраащать обратно
      //     // html.style.setProperty('position', 'fixed');
      //     // html.style.setProperty('overflow', 'hidden');
      //   }
      // },


    };

      RPC.widgetEvent.use(({name, payload}) => {
          this.emit(name, payload);
      });

      RPC.debug.use(payload => {
          console.log(payload);
      });


      // todo вызывается сразу после закрытия ридера, не хорошо
      // деструктор вообще не вызывается
      // console.log("reader constructor");

      const backPressHandler = () => {
          if (this.modalPresentation.isWidgetConnected) {
              this.closeConnectedReaderWidget();
              this.modalPresentation.modalClosed();
              return true;
          } else if (this.modalPresentation.isOpen) {

              // close reader and loader activity
              this.emit("closeStoryFavoriteReader", this.openStoryFavoriteReaderWithOptions);

              return true;
          } else {
              return false;
          }
      }


      // first intent - open modal
      this.on('openStoryFavoriteReader', (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
          this.modalPresentation.isOpen = true;
          BackHandler.addEventListener("hardwareBackPress", backPressHandler);
          this.openStoryFavoriteReaderWithOptions = options;
      });

      // widget opened and connected to view
      this.on('openedStoryFavoriteReader', () => {
          this.modalPresentation.isWidgetConnected = true;
      });

      // connected widget closed
      // this.on('closeStoryFavoriteReader', (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
      //     BackHandler.removeEventListener("hardwareBackPress", backPressHandler);
      // });

      // connected widget closed and modal closed
      this.on('modalClosed', () => {
          BackHandler.removeEventListener("hardwareBackPress", backPressHandler);
          this.modalPresentation.modalClosed();
      });

  }

  private get storyFavoriteReaderOptions(): {options: StoryFavoriteReaderOptions, storiesListOptions: StoriesListOptions} {
    const appearanceManager = this.appearanceManagerGetter();


      // options: appearanceManager.storyFavoriteReaderOptions,
      //     storiesListOptions: appearanceManager.storiesListOptions


    if (appearanceManager != null) {
      return {
          options: appearanceManager.storyFavoriteReaderOptions,
              storiesListOptions: appearanceManager.storiesListOptions,
      }
    } else {
      return {
          options: StoryFavoriteReaderOptionsDefault,
          storiesListOptions: StoriesListOptionsDefault
      }
    }

  }


  public get widgetSrcFile(): string | URL {
    return jsResourceGlobal;
  }

  public get widgetEntrypoint(): string {
    return `
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, shrink-to-fit=no">
        <meta name="color-scheme" content="dark light">
        <style type="text/css">${cssResourceGlobal}</style>
      </head>
      <div id="app"><div id="_app"></div></div>
      <script type="text/javascript">${jsResourceGlobal}</script>
      <script type="text/javascript">
        window.storiesList = (function () {
          var self = window.storiesList || {};
          self._e = self._e || [];
          self.ready = self.ready || function (f) {self._e.push(f);};
          return self;
        }());

        window.storyFavoriteReader.ready(function () {
          window.storyFavoriteReader.init(${JSON.stringify(this.storyFavoriteReaderOptions)});
          // options
        });

      </script>`;
  }


  private rpc: any;

  public async mount(mountSelector: string, storiesListOptions: StoriesListOptions & Pick<AppearanceCommonOptions, "hasFavorite">): Promise<boolean> {
    // создаем iframe
    // по завершению - mounted();


    const options: CreateViewOptions = {
      allowTransparency: true,
      overflowTouch: false,
      backgroundColor: storiesListOptions.layout.backgroundColor,
      width: 'auto',
      height: 0,
      pageUrl: '',
      startHeight: 0
    };

    // todo непонятно как высоту с учетом title рассчитывать
    if (storiesListOptions.layout.height) {
      options.startHeight = storiesListOptions.layout.height;
    } else {
      if (!storiesListOptions.title) {
        options.startHeight = storiesListOptions.card.height + storiesListOptions.topPadding + storiesListOptions.bottomPadding + storiesListOptions.bottomMargin;
      } else {
        // line height + margin-bottom
        options.startHeight = 50 + storiesListOptions.card.height + storiesListOptions.topPadding + storiesListOptions.bottomPadding + storiesListOptions.bottomMargin;
      }
    }

    this.createView(mountSelector, options);

  }


  private createView(mountSelector: string, options: CreateViewOptions) {
    const self = this;
    let obj: Option<HTMLElement> = null;
    if (mountSelector === 'body') {
      obj = document.body;
    } else {
      obj = document.querySelector(mountSelector);
    }


    if (obj) {


    }
  }

  private extend(obj1: Dict, obj2: Dict) {
    for (var i in obj2) {
      if (obj1[i] && typeof (obj1[i]) === 'object') {
        this.extend(obj1[i], obj2[i])
      } else {
        obj1[i] = obj2[i];
      }
    }
  }

  private genKey() {
    var key = '';
    for (var i = 0; i < 5; i++) {
      key += Math.ceil(Math.random() * 15).toString(16);
    }
    return key;
  }

  private frameName: string = '';

  private mountView(obj: HTMLElement, options: Dict, attrs?: Dict) {

    this.frameName = 'fXD' + this.genKey();

    const div = document.createElement('div');
    div.innerHTML = '<iframe name="' + this.frameName + '" ' + (attrs || '') + '></iframe>';
    const frame = div.firstChild as HTMLIFrameElement;
    const self = this;

    setTimeout(function () {
      frame.frameBorder = '0';
      if (options) self.extend(frame, options);
      obj.insertBefore(frame, obj.firstChild);

      //             this.caller = obj.contentWindow;
      //             this.frame  = obj;
      // rpcServerStart

      // self.start(frame);

    }, 0);

    return frame;
  }


  // container options
  public get containerOptions(): Dict {
    const options: CreateViewOptions = {
      allowTransparency: true,
      overflowTouch: false,
      backgroundColor: 'transparent',
      width: 0,
      height: 0,
      pageUrl: '',
      startHeight: 0
    };


    //
    // // todo непонятно как высоту с учетом title рассчитывать
    // if (this.storiesListOptions.layout.height) {
    //   options.startHeight = this.storiesListOptions.layout.height;
    // } else {
    //   if (!this.storiesListOptions.title) {
    //     options.startHeight = this.storiesListOptions.card.height + this.storiesListOptions.topPadding + this.storiesListOptions.bottomPadding + this.storiesListOptions.bottomMargin;
    //   } else {
    //     // line height + margin-bottom
    //     options.startHeight = 50 + this.storiesListOptions.card.height + this.storiesListOptions.topPadding + this.storiesListOptions.bottomPadding + this.storiesListOptions.bottomMargin;
    //   }
    // }

    let params: Dict<any> = {
      extraCss: null,
      extraJs: null,

    };

    let defaults = {
      maxWidth: 0,
      startHeight: 70,
      minWidth: 150,
      storiesHeight: 70,
      scrolling: false,
      hidden: false
    };

    // todo непонятно как высоту с учетом title рассчитывать
    if (params.storiesLayoutHeight) {
      defaults.startHeight = parseFloat(params.storiesLayoutHeight);
    } else {
      if (!params.storiesTitle) {
        defaults.startHeight = parseFloat((params.storiesHeight || defaults.storiesHeight)) + parseFloat(params.storiesListTopPadding) + parseFloat(params.storiesListBottomPadding) + parseFloat(params.storiesListBottomMargin);
      } else {
        // line height + margin-bottom
        defaults.startHeight = 50 + parseFloat((params.storiesHeight || defaults.storiesHeight)) + parseFloat(params.storiesListTopPadding) + parseFloat(params.storiesListBottomPadding) + parseFloat(params.storiesListBottomMargin);
      }
    }


    let width: number = options.width === 'auto' ? (/*obj.clientWidth || obj.offsetWidth || */defaults.minWidth) | 0 : parseInt(options.width || 0, 10);

    const cssWidth: string = width ? (Math.max(defaults.minWidth || 200, Math.min(defaults.maxWidth || 10000, width)) + 'px') : '100%';

    const containerOptions: Dict = {
      style: {}
    };

    containerOptions.style.width = cssWidth;
    containerOptions.style.overflow = 'hidden';

    if (options.height) {
      // params.height = options.height;
      containerOptions.style.height = options.height + 'px';
    } else {
      containerOptions.style.height = (defaults.startHeight || 200) + 'px';
    }

    if (options.overflowTouch) {
      containerOptions.style.overflow = 'auto';
      containerOptions.style.WebkitOverflowScrolling = 'touch';
    }

    return {
      style: {
        backgroundColor: 'transparent',
        position: 'relative',
        // height: parseInt(containerOptions.style.height),
        height: '100%',
        width: '100%'
      }
    };

    // return containerOptions;
  }


  public get viewOptions(): Dict {
    if (!this.frameName) {
      this.frameName = 'fXD' + this.genKey();
    }

    const options: CreateViewOptions = {
      allowTransparency: true,
      overflowTouch: false,
      backgroundColor: 'transparent',
      width: '100%',
      height: '100%',
      pageUrl: '',
      startHeight: 0
    };

    // // todo непонятно как высоту с учетом title рассчитывать
    // if (this.storiesListOptions.layout.height) {
    //   options.startHeight = this.storiesListOptions.layout.height;
    // } else {
    //   if (!this.storiesListOptions.title) {
    //     options.startHeight = this.storiesListOptions.card.height + this.storiesListOptions.topPadding + this.storiesListOptions.bottomPadding + this.storiesListOptions.bottomMargin;
    //   } else {
    //     // line height + margin-bottom
    //     options.startHeight = 50 + this.storiesListOptions.card.height + this.storiesListOptions.topPadding + this.storiesListOptions.bottomPadding + this.storiesListOptions.bottomMargin;
    //   }
    // }


    // todo in common part
    let params: Dict<any> = {
      extraCss: null,
      extraJs: null,

    };

    let defaults = {
      maxWidth: 0,
      startHeight: 70,
      storiesHeight: 70,
      minWidth: 150,
      scrolling: false,
      hidden: false
    };

    // todo непонятно как высоту с учетом title рассчитывать
    if (params.storiesLayoutHeight) {
      defaults.startHeight = parseFloat(params.storiesLayoutHeight);
    } else {
      if (!params.storiesTitle) {
        defaults.startHeight = parseFloat((params.storiesHeight || defaults.storiesHeight)) + parseFloat(params.storiesListTopPadding) + parseFloat(params.storiesListBottomPadding) + parseFloat(params.storiesListBottomMargin);
      } else {
        // line height + margin-bottom
        defaults.startHeight = 50 + parseFloat((params.storiesHeight || defaults.storiesHeight)) + parseFloat(params.storiesListTopPadding) + parseFloat(params.storiesListBottomPadding) + parseFloat(params.storiesListBottomMargin);
      }
    }


    let width: number = options.width === 'auto' ? (/*obj.clientWidth || obj.offsetWidth || */defaults.minWidth) | 0 : parseInt(options.width || 0, 10);

    const cssWidth: string = width ? (Math.max(defaults.minWidth || 200, Math.min(defaults.maxWidth || 10000, width)) + 'px') : '100%';


    // if (cssWidth === '100%') params.startWidth = (obj.clientWidth || obj.offsetWidth) | 0;

    const iframeOptions: Dict<any> = {
      src: '',
      id: 'iaswidget' + this.widgetId,
      allowtransparency: Boolean(options.allowTransparency || false).toString(),
      style: {
        backgroundColor: options.backgroundColor || 'transparent',
      }
    };

    iframeOptions.width = (cssWidth.indexOf('%') != -1) ? cssWidth : (parseInt(cssWidth) || cssWidth);
    iframeOptions.height = defaults.startHeight || '100%';

    // for correct @media in iframe work - pass innerWidth instead of clientWidth
    // plus parent div overflow: hidden
    // width: cssWidth === '100%' ? '100%' : cssWidth,
    // https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
    iframeOptions.style.width = '1px';
    iframeOptions.style.minWidth = '100%';
    iframeOptions.style["*width"] = '100%';


    if (defaults.scrolling) {
      iframeOptions.scrolling = 'yes';
    } else {
      iframeOptions.scrolling = 'no';
      iframeOptions.style.overflow = 'hidden';
    }

    if (defaults.hidden) {
      iframeOptions.style.display = 'none';
    }


    // if (isWindowSupportIframeBlobSrcSync()) {
    //   iframeOptions.src = blobUrl.src;
    // } else {
    //   //@ts-ignore
    //   iframeOptions.srcDoc = blobUrl.srcdoc;
    // }


    /*
                                // flex: 1,
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            // bottom: 0,

                            // width: '100%',
                            height: this.props.screenHeight,
                            // height: webviewHeight,
     */

    return {
      style: {
        backgroundColor: 'transparent',
        // display: "none",
        position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
        height: "100%",
        width: '100%',
        // height: iframeOptions.height
      },
      // не нужно для WebView
      // onLoad: WidgetStoriesList.onViewFirstLoad,
      source: {
        html: this.widgetEntrypoint, baseUrl: 'https://sdk.inappstory.com'
      },
        onMessage: this.rpcOnMessage
    };

    return {
      name: this.frameName,
      frameBorder: '0',
      ...iframeOptions,
      // onLoad: WidgetStoriesList.onViewFirstLoad
    };

  }


    public rpcOnMessage = (e: MessageEvent) => {
        if (this.rpcBridge) {
            this.rpcBridge(e);
        }
    };
    private rpcBridge: Option<(e: MessageEvent) => void> = null;
    private rpcServerInstance: Option<RPCServer> = null;

    public createRpcServer(worker: any) {
        const server = new WebViewWorkerServer(worker);
        this.rpcBridge = server.createOnMessage();
        this.rpcServerInstance = createRpcServer(RPC.rpcDomains, server);
    }

    public destroyRpcServer() {
        if (this.rpcServerInstance) {
            this.rpcServerInstance.destructor();
        }
    }


  public async init(mountSelector: string, storiesListOptions: StoriesListOptions & Pick<AppearanceCommonOptions, "hasFavorite">) {

    let params: Dict<any> = {
        // настройки storiesList виджета
        storiesHeight: storiesListOptions.card?.height || 70,
        storiesLayoutHeight: storiesListOptions.layout?.height || 0,
        storiesBackgroundColor: storiesListOptions.layout?.backgroundColor || 'transparent',
        storiesListTopPadding: storiesListOptions.topPadding || 20,
        storiesListBottomPadding: storiesListOptions.bottomPadding || 20,
        storiesListBottomMargin: storiesListOptions.bottomMargin || 20,
        storiesTitle: storiesListOptions.title?.content || '',

        extraCss: storiesListOptions.extraCss || null,
        extraJs: null,

      },
      widgetRoot: any,
      widget: any,
      rpc: any,
      inFullScreenMode = false,
      scrollPosition = [0, 0],
      options: Dict<any> = {};

    options.allowTransparency = true;
    options.overflowTouch = false;

    options.backgroundColor = params.storiesBackgroundColor;

    var defaults = {
      startHeight: 70,
      minWidth: 150,
      storiesHeight: 70
    };

    // todo непонятно как высоту с учетом title рассчитывать
    if (params.storiesLayoutHeight) {
      defaults.startHeight = parseFloat(params.storiesLayoutHeight);
    } else {
      if (!params.storiesTitle) {
        defaults.startHeight = parseFloat((params.storiesHeight || defaults.storiesHeight)) + parseFloat(params.storiesListTopPadding) + parseFloat(params.storiesListBottomPadding) + parseFloat(params.storiesListBottomMargin);
      } else {
        // line height + margin-bottom
        defaults.startHeight = 50 + parseFloat((params.storiesHeight || defaults.storiesHeight)) + parseFloat(params.storiesListTopPadding) + parseFloat(params.storiesListBottomPadding) + parseFloat(params.storiesListBottomMargin);
      }
    }

    var body = document.querySelector('body'),
      html = document.querySelector('html'),
      zIndex = options.zIndex || 10000;

    const self = this;

    const functions = {

      // TODO add class to body

      // switchToFullScreen: function () {
      //     if (inFullScreenMode) {
      //         return;
      //     }
      //
      //     scrollPosition = IAS_OLD.Util.getScroll();
      //
      //     if (body) {
      //         body.style.setProperty('user-select', 'none');
      //         body.style.setProperty('-webkit-user-select', 'none');
      //
      //         body.style.setProperty('overflow', 'hidden');
      //         body.style.setProperty('-webkit-overflow-scrolling', 'touch');
      //     }
      //
      //     if (html) {
      //         html.style.setProperty('position', 'fixed');
      //         html.style.setProperty('overflow', 'hidden');
      //     }
      //
      //     if (widgetRoot && widget) {
      //         // получаем текущее смещение от начала viewport
      //         const viewportOffset = widgetRoot.getBoundingClientRect();
      //         const offsetTop = viewportOffset.top;
      //
      //         widget.style.setProperty('position', 'fixed')
      //         widget.style.setProperty('top', '0')
      //         widget.style.setProperty('bottom', '0')
      //         widget.style.setProperty('left', '0')
      //         widget.style.setProperty('right', '0')
      //         widget.style.setProperty('height', '0')
      //         widget.style.setProperty('min-height', '100%')
      //         widget.style.setProperty('max-height', '100%')
      //
      //         widget.style.setProperty('z-index', zIndex)
      //
      //         rpc.callMethod('onEnterFullScreen', {offsetTop: offsetTop})
      //
      //     }
      //
      //     inFullScreenMode = true;
      //
      //     // newWidth  = parseInt(newWidth);
      //     // newHeight = parseInt(newHeight);
      //     // var widgetElem = document.getElementById('iaswidget' + widgetId);
      //     // if (isFinite(newWidth)) {
      //     //   obj.style.width = newWidth + 'px';
      //     //   if (widgetElem) {
      //     //     widgetElem.style.width = newWidth + 'px';
      //     //   }
      //     // }
      //     // if (isFinite(newHeight)) {
      //     //   obj.style.height = newHeight + 'px';
      //     //   if (widgetElem) {
      //     //     widgetElem.style.height = newHeight + 'px';
      //     //   }
      //     // }
      //     // if (options.onResizeWidget) options.onResizeWidget();
      //     //
      //
      //
      // },
      // switchFromFullScreen: function () {
      //     if (!inFullScreenMode) {
      //         return;
      //     }
      //
      //     if (widgetRoot && widget) {
      //         widget.style.setProperty('position', '')
      //         widget.style.setProperty('top', '')
      //         widget.style.setProperty('bottom', '')
      //         widget.style.setProperty('left', '')
      //         widget.style.setProperty('right', '')
      //         widget.style.setProperty('height', isFinite(defaults['startHeight']) ? defaults['startHeight'] + 'px' : '100%')
      //         widget.style.setProperty('min-height', '')
      //         widget.style.setProperty('max-height', '')
      //         widget.style.setProperty('z-index', '')
      //
      //         rpc.callMethod('onLeaveFullScreen')
      //     }
      //
      //     if (body) {
      //         body.style.setProperty('user-select', '');
      //         body.style.setProperty('-webkit-user-select', '');
      //
      //         body.style.setProperty('overflow', '');
      //         body.style.setProperty('-webkit-overflow-scrolling', '');
      //     }
      //
      //     if (html) {
      //         html.style.setProperty('position', '');
      //         html.style.setProperty('overflow', '');
      //     }
      //
      //     window.scrollTo(scrollPosition[0], scrollPosition[1])
      //
      //     inFullScreenMode = false;
      //
      // },

      event: function (name: string, data: Object) {
        self.emit(name, data)
      },
    };


    params.extraJs = null;

    // custom load end
    options.no_finish_loading = true;

    return this._init(mountSelector as ObjectId, options, params, storiesListOptions, functions, defaults, function (o: any, i: any, r: any) {
      widgetRoot = o;
      widget = i;
      rpc = r;
    }, null, null);

  }

  getWidgetDocument(widgetParams: Dict): string {

    const baseUrl = process.env.BASE_URL;
    const apiUrl = process.env.API_URL;
    const buildVersion = process.env.BUILD_VERSION;

    // todo можно BASE_URL менять в процессе сборки
    let cssResource: URL | string = `${baseUrl}/v${buildVersion}/dist/css/storyFavoriteReader.css`;
    let jsResource: URL | string = `${baseUrl}/v${buildVersion}/dist/js/storiesList.js`;
    if (process.env.NODE_ENV === "development") {
      cssResource = `${baseUrl}/css/storyReader.css`;
      jsResource = `${baseUrl}/js/storyReader.js`;

      // if npm pack
      // cssResource = new URL("~/dist/css/storiesList.css", import.meta.url);
      // jsResource = new URL("~/dist/js/storiesList.js", import.meta.url);


      // jsResource = `/js/storiesList.js`;

    }

    // cssResource = new URL("~/dist/css/storiesList.css", import.meta.url);
    // jsResource = new URL("~/dist/js/storiesList.js", import.meta.url);

    jsResource = jsResourceGlobal;

    // console.log({meta: import.meta});

    // (async () => {
    //   const {WStories} = await import("~/src/stories_widget/stories-slider");
    //   console.log({WStories});
    // })();


    // <link rel="stylesheet" type="text/css" href="${cssResource}"/>
    // <script type="text/javascript" src="${jsResource}"></script>
    // import.meta.url

    // <script type="text/javascript" src="${jsResource}"></script>
    return `
        <script type="text/javascript" src="${jsResource}"></script>
        <div id="app"><div id="_app"></div></div>
        <script type="text/javascript">
          window.storyFavoriteReader.init(${JSON.stringify(widgetParams)});
        </script>
`;


  }

  protected async _init(mountSelector: ObjectId, options: Dict, params: Dict, widgetParams: Dict, funcs: Dict, defaults: Dict, onDone: (obj: any, iframe: any, rpc: any) => void, widgetId: Nullable<string | number>, iter: Nullable<number>) {

    funcs.event = (name: string, data: Object) => this.emit(name, data)

    onDone = (obj: any, iframe: any, rpc: any) => {
      this.rpc = rpc;
    };

    const result = super._init(mountSelector, options, params, widgetParams, funcs, defaults, onDone, widgetId, iter);

    // story reader

    // const storyReader = new StoryReader('body', options);


    // this.on('sessionInitInternal', (payload: any) => storyReader.sessionInit(payload));
    // this.on('clickOnStoryInternal', (payload: ClickOnStoryInternalPayload) => storyReader.openReader(payload));

    // this.on('clickOnStoryInternal', (payload: ClickOnStoryInternalPayload) => {
    //   if (isFunction(this.callbacks?.handleClickOnStoryInternal)) {
    //     this.callbacks?.handleClickOnStoryInternal(payload);
    //   }
    // });
    //
    // this.on('flushThumbViews', (payload: Array<number>) => {
    //   if (isFunction(this.callbacks?.handleFlushThumbViews)) {
    //     this.callbacks?.handleFlushThumbViews(payload);
    //   }
    // });


    // storyReader.on('storyOpenedInternal', (payload: {id: number}) => this.onStoryOpened(payload));


    // storyReader.on('favoriteStoryInternal', (payload: {id: number, value: boolean}) => this.onStoryFavoriteChange(payload));


    // public event
    this.on('clickOnStory', (payload: ClickOnStoryPayload) => {
      if (isFunction(this.callbacks?.handleClickOnStory)) {
        this.callbacks?.handleClickOnStory(payload);
      }
    });

    // click on deep link from story list
    this.on('clickOnStoryDeepLink', (payload: ClickOnStoryPayload) => {
      if (isFunction(this.callbacks?.handleClickOnStoryDeepLink)) {
        this.callbacks?.handleClickOnStoryDeepLink(payload);
      }
    });

    // button from slide
    // storyReader.on('clickOnButton', (payload: ClickOnButtonPayload) => {
    //     if (params.storyLinkHandleClick && isFunction(params.storyLinkHandleClick)) {
    //         params.storyLinkHandleClick(payload);
    //     } else {
    //         window.open(payload.url, '_self');
    //     }
    // });

    const publicEvents = ['showSlide', 'showStory', 'closeStory', 'clickOnButton', 'likeStory', 'dislikeStory', 'favoriteStory', 'shareStory', 'shareStoryWithPath'];

    // get StoryManager and push events to them
    // publicEvents.forEach((eventName) => storyReader.on(eventName, (payload) => this.emit(eventName, payload)));

    // let storyFavorite: Nullable<_StoryFavorite> = null;
    // if (options.hasFavorite) {
    //   storyFavorite = new _StoryFavorite('body', options);
    // }

    // storyFavorite && this.on('sessionInitInternal', (payload: any) => storyFavorite && storyFavorite.sessionInit(payload));
    // storyFavorite && this.on('clickOnFavoriteCellInternal', (payload: ClickOnFavoriteCellInternalPayload) => storyFavorite && storyFavorite.openReader(payload));

    // custom method
    // storyFavorite && storyFavorite.on('clickOnStoryInternal', (payload: ClickOnStoryInternalPayload) => storyReader.openReader(payload));
    // storyFavorite && storyReader.on('openStoryReader', (options: {windowReferer: STORY_READER_WINDOW_REFERER}) => storyFavorite && storyFavorite.openStoryReader(options));
    // storyFavorite && storyReader.on('closeStoryReader', (options: {windowReferer: STORY_READER_WINDOW_REFERER}) => storyFavorite && storyFavorite.closeStoryReader(options));

    /*    storyFavorite && storyFavorite.on('closeReader', () => {
          try {
            window.focus()
          } catch (e) {
            console.error(e)
          }
        });*/

    this.on('syncStore', (payload: SyncStoreEvent) => {
      // storyReader.syncStoreHandle(payload);
      // storyFavorite && storyFavorite.syncStoreHandle(payload);
    });

    // storyReader.on('syncStore', (payload: SyncStoreEvent) => {
    //     this.syncStoreHandle(payload);
    //     storyFavorite && storyFavorite.syncStoreHandle(payload);
    // });
    //
    // storyFavorite && storyFavorite.on('syncStore', (payload: SyncStoreEvent) => {
    //     this.syncStoreHandle(payload);
    //     storyReader.syncStoreHandle(payload);
    // });

    return result;
  }

  onStoryOpened(payload: { id: number }) {
    this.rpc.callMethod('onStoryOpened', payload);
  }

  // onStoryFavoriteChange(payload: {id: number, value: boolean}) {
  //     this.rpc.callMethod('onStoryFavoriteChange', payload);
  // }

  syncStoreHandle(payload: SyncStoreEvent) {
    this.rpc.callMethod('onSyncStore', payload);
  }


  private _sourceInfo: {listType: STORY_LIST_TYPE, feed: Option<string>} = {
      listType: STORY_LIST_TYPE.default,
      feed: null
  };
  public get sourceInfo(): {listType: STORY_LIST_TYPE, feed: Option<string>} {
      return this._sourceInfo;
  }

  // pass story list
  openReader(payload: ClickOnStoryInternalWithDataPayload & { hasShare: boolean }, sourceInfo: {listType: STORY_LIST_TYPE, feed: Option<string>}) {
    this._sourceInfo = sourceInfo;
      // вынести в общую часть
    RPC.onOpenReader(payload);

  }

    // pass story list
    closeConnectedReaderWidget() {
        RPC.onCloseReader();
    }

  // pass story list
  setStories(payload: any) {
    // вынести в общую часть
    RPC.setStories(payload);

  }

  setFonts(payload: any) {
    RPC.setFonts(payload);
  }


    rpcCb(payload: any) {
      RPC.widgetEventCb(payload);
    }


  destructor() {
    // destroy RPC

  }


}

export {WidgetStoryFavoriteReader};
