import Widget, {ObjectId} from "~/src/storyManager/widget";
import {ClickOnStoryInternalPayload, STORY_LIST_TYPE, STORY_READER_WINDOW_REFERER, SyncStoreEvent} from "~/src/types";
import ScrollbarHelper from "~/src/storyManager/widget/ScrollbarHelper";
import {isWindowSupportIframeBlobSrc} from "~/src/storyManager/widget/utils";
import {StoryModel} from "~/src/storyManager/models/story";
import {StoryReaderOptions} from "~/src/types/storyManager/storyReader";
import {AppearanceCommonOptions} from "~/src/types/storyManager/appearanceCommon";
import {Option} from "../../../global.h";

declare global {
  interface Window {
    scrollNode: any; // browser env
    fastXDM: any;
    iasAsyncInitCallbacks: Array<() => void>;
  }
}


export default class _StoryReader extends Widget {

  public iframe: Option<HTMLIFrameElement> = null;
  private rpc: any;

  constructor(objId: string, options: Dict<any>) {
    super(objId, options);
  }

  public async init(objId: string, storyReaderOptions: StoryReaderOptions & {appearanceCommon: AppearanceCommonOptions}) {
    var options: Dict<any> = {};
    var params = {


      },
      widgetRoot: any,
      widget: any,
      rpc: any,
      inFullScreenMode = false,
      scrollPosition = [0, 0];

    options.allowTransparency = true;
    options.overflowTouch = false;

    options.backgroundColor = 'transparent';

    var defaults = {
      startHeight: 70,
      minWidth: 150,
      storiesHeight: 70
    };


    var body = document.querySelector('body'),
      html = document.querySelector('html'),
      zIndex = options.zIndex || 2147483645;

    const sbHelper = new ScrollbarHelper(window);

    const self = this;

    const functions = {

      event: function (name: string, data: Object) {
        self.emit(name, data)
      },

      setFixedHtmlPosition: function () {
        if (html) {
          // TODO сохранять оригинал и возвраащать обратно
          // html.style.setProperty('position', 'fixed');
          // html.style.setProperty('overflow', 'hidden');
        }
      },

      open: function (options: { windowReferer: STORY_READER_WINDOW_REFERER }) {

        if (options.windowReferer === STORY_READER_WINDOW_REFERER.default) {
          sbHelper.setScrollbar();
        } else if (options.windowReferer === STORY_READER_WINDOW_REFERER.favorite) {
          // self.emit('openStoryReader', options);
        }
        self.emit('openStoryReader', options);

        // if (body) {
        //     body.style.setProperty('user-select', 'none');
        //     body.style.setProperty('-webkit-user-select', 'none');
        //
        //     body.style.setProperty('overflow', 'hidden');
        //     body.style.setProperty('-webkit-overflow-scrolling', 'touch');
        // }

        if (html) {
          // TODO сохранять оригинал и возвраащать обратно
          // html.style.setProperty('position', 'fixed');
          // html.style.setProperty('overflow', 'hidden');
        }

        if (self.iframe) {
          // self.iframe.style.setProperty('position', 'fixed');
          self.iframe.style.setProperty('display', 'block');
          // self.iframe.style.setProperty('height', '0')
          // self.iframe.style.setProperty('min-height', '100%')
          // self.iframe.style.setProperty('max-height', '100%')

          self.iframe.style.setProperty('z-index', zIndex)
        }


      },
      close: function (options: { windowReferer: STORY_READER_WINDOW_REFERER }) {
        if (options.windowReferer === STORY_READER_WINDOW_REFERER.default) {
          sbHelper.resetScrollbar();
        } else if (options.windowReferer === STORY_READER_WINDOW_REFERER.favorite) {
          // self.emit('closeStoryReader', options);
        }

        self.emit('closeStoryReader', options);

        if (self.iframe) {
          self.iframe.style.setProperty('display', 'none');
        }

        // if (body) {
        //     body.style.setProperty('user-select', '');
        //     body.style.setProperty('-webkit-user-select', '');
        //
        //     body.style.setProperty('overflow', '');
        //     body.style.setProperty('-webkit-overflow-scrolling', '');
        // }

        if (html) {

          // TODO сохранять оригинал и возвраащать обратно
          // html.style.setProperty('position', '');
          // html.style.setProperty('overflow', '');
        }
      },

    };

    return this._init(objId as ObjectId, options, params, storyReaderOptions, functions, defaults, (o: any, i: any, r: any) => {
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
    let cssResource = `${baseUrl}/v${buildVersion}/dist/css/storyReader.css`;
    let jsResource = `${baseUrl}/v${buildVersion}/dist/js/storyReader.js`;
    if (process.env.NODE_ENV === "development") {
      cssResource = `${baseUrl}/css/storyReader.css`;
      jsResource = `${baseUrl}/js/storyReader.js`;
    }

    //<link rel="stylesheet" type="text/css" href="${cssResource}"/>
    return `
        <script type="text/javascript" src="${jsResource}"></script>
        <div id="app"><div id="_app"></div></div>
        <script type="text/javascript">
            window.storyReader.init(${JSON.stringify(widgetParams)});
        </script>
`;

  }

  protected async _init(objId: ObjectId, options: Dict, params: Dict, widgetParams: Dict, funcs: Dict, defaults: Dict, onDone: (obj: any, iframe: any, rpc: any) => void, widgetId: Nullable<string | number>, iter: Nullable<number>) {
    defaults.fullScreen = true;
    defaults.scrolling = false;
    defaults.hidden = true;

    onDone = (obj: any, iframe: any, rpc: any) => {
      this.rpc = rpc;
      this.iframe = iframe;
    };

    return super._init(objId, options, params, widgetParams, funcs, defaults, onDone, widgetId, iter);

    // this.emit('ready');
  }

  rpcCb(name: string, payload: {requestId: string, success: boolean, data: any, err: string}) {
    this.rpc?.callMethod(name, payload);
  }

  sessionInit(payload: any) {
    this.rpc?.callMethod('onSessionInit', payload);
  }

  openReader(payload: ClickOnStoryInternalPayload & {hasShare: boolean}, sourceInfo: Dict) {
    // this.iframe.style.setProperty('display', 'block');
    // document.body.style.setProperty('overflow', 'hidden');

      this.options = {sourceInfo};

    this.rpc?.callMethod('onOpenReader', payload);
  }

  closeReader() {
    this.rpc?.callMethod('onCloseReader');
  }

  closeGoodsWidget(payload: {elementId: string}) {
    this.rpc?.callMethod('onCloseGoodsWidget', payload);
  }

  syncStoreHandle(payload: SyncStoreEvent) {
    this.rpc?.callMethod('onSyncStore', payload);
  }

  // pass story list
  setStories(payload: {storyList: Array<StoryModel>, listType: STORY_LIST_TYPE}) {
    this.rpc?.callMethod('setStories', payload);
  }

  setFonts(payload: any) {
    this.rpc?.callMethod('setFonts', payload);
  }


};
