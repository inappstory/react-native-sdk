import Widget, {ObjectId} from "~/src/storyManager/widget";

declare global {
  interface Window {
    scrollNode: any; // browser env
    fastXDM: any;
    iasAsyncInitCallbacks: Array<() => void>;
  }
}

import {
  ClickOnFavoriteCellInternalPayload,
  ClickOnStoryInternalPayload, STORY_LIST_TYPE,
  STORY_READER_WINDOW_REFERER,
  SyncStoreEvent
} from "~/src/types";
import ScrollbarHelper from "~/src/storyManager/widget/ScrollbarHelper";
import {MutationPayload} from "vuex";
import RootState from "~/src/stories_widget/store/rootState";
import {isWindowSupportIframeBlobSrc} from "~/src/storyManager/widget/utils";
import {StoryModel} from "~/src/storyManager/models/story";
import {StoryFavoriteReaderOptions} from "~/src/types/storyManager/storyFavoriteReader";
import {StoriesListOptions} from "~/src/types/storyManager/storiesList";


export default class _StoryFavorite extends Widget {

  private iframe: any;
  private rpc: any;

  constructor(objId: string, options: Dict) {
    super(objId, options);
  }

  public async init(objId: string, storyFavoriteReaderOptions: {options: StoryFavoriteReaderOptions, storiesListOptions: StoriesListOptions}) {
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
      zIndex = options.zIndex || 2147483644;

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
      open: function () {

        sbHelper.setScrollbar();

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

          self.iframe.style.setProperty('z-index', zIndex);
        }

        self.rpc?.callMethod('onReaderOpened');


      },
      close: function () {
        sbHelper.resetScrollbar();


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

        self.emit('closeReader');
      },

      syncStore: function (mutation: MutationPayload, state: RootState) {


      },

    };

    return this._init(objId as ObjectId, options, params, storyFavoriteReaderOptions, functions, defaults, function (o: any, i: any, r: any) {
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
    let cssResource = `${baseUrl}/v${buildVersion}/dist/css/storyFavoriteReader.css`;
    let jsResource = `${baseUrl}/v${buildVersion}/dist/js/storyFavoriteReader.js`;
    if (process.env.NODE_ENV === "development") {
      cssResource = `${baseUrl}/css/storyFavoriteReader.css`;
      jsResource = `${baseUrl}/js/storyFavoriteReader.js`;
    }

    // <link rel="stylesheet" type="text/css" href="${cssResource}"/>
    return `

        <script type="text/javascript" src="${jsResource}"></script>
        <div id="app"><div id="_app"></div></div>
        <script type="text/javascript">
            window.storyFavoriteReader.init(${JSON.stringify(widgetParams)});
        </script>
`;

  }

  protected async _init(objId: ObjectId, options: Dict, params: Dict, widgetParams: Dict, funcs: Dict, defaults: Dict, onDone: (obj: any, iframe: any, rpc: any) => void, widgetId: Nullable<string | number>, iter: Nullable<number>) {
    defaults.fullScreen = true;
    defaults.scrolling = true;
    defaults.hidden = true;

    onDone = (obj: any, iframe: any, rpc: any) => {
      this.rpc = rpc;
      this.iframe = iframe;
    };

    return await super._init(objId, options, params, widgetParams, funcs, defaults, onDone, widgetId, iter);
  }

  sessionInit(payload: any) {
    this.rpc?.callMethod('onSessionInit', payload);
  }

  openReader(payload: ClickOnFavoriteCellInternalPayload,  sourceInfo: Dict) {
    // this.iframe.style.setProperty('display', 'block');
    // document.body.style.setProperty('overflow', 'hidden');
      this.options = {sourceInfo};

    this.rpc?.callMethod('onOpenReader', payload);
  }

  syncStoreHandle(payload: SyncStoreEvent) {

    // this.rpc?.callMethod('onSyncStore', payload);

  }

  // открылся storyReader, запущенный с favorite экрана
  openStoryReader(options: { windowReferer: STORY_READER_WINDOW_REFERER }) {
    this.rpc?.callMethod('onOpenStoryReader', options);
  }

  // закрылся storyReader, запущенный с favorite экрана
  closeStoryReader(options: { windowReferer: STORY_READER_WINDOW_REFERER }) {
    this.rpc?.callMethod('onCloseStoryReader', options);
  }


  // pass story list
  setStories(payload: {storyList: Array<StoryModel>, listType: STORY_LIST_TYPE}) {
    this.rpc?.callMethod('setStories', payload);
  }

  setFonts(payload: any) {
    this.rpc?.callMethod('setFonts', payload);
  }


};
