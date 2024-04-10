import Widget, {ObjectId} from "~/src/storyManager/widget";
import {ClickOnStoryInternalPayload, ClickOnStoryPayload, SyncStoreEvent} from "~/src/types";
import {StoriesListOptions} from "~/src/types/storyManager/storiesList";
import {AppearanceCommonOptions} from "~/src/types/storyManager/appearanceCommon";
import {Dict} from "../../../global.h";
import {isFunction} from "../../helpers/isFunction";

declare global {
  interface Window {
    scrollNode: any; // browser env
    fastXDM: any;
    iasAsyncInitCallbacks: Array<() => void>;
  }
}


export default class _Stories extends Widget {

  private rpc: any;

  constructor(objId: string, options: Dict) {
    super(objId, options);
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
    let cssResource = `${baseUrl}/v${buildVersion}/dist/css/storiesList.css`;
    let jsResource: URL | string = `${baseUrl}/v${buildVersion}/dist/js/storiesList.js`;
    if (process.env.NODE_ENV === "development") {
      cssResource = `${baseUrl}/css/storiesList.css`;
      jsResource = `${baseUrl}/js/storiesList.js`;

      // jsResource = new URL("~/dist/js/storiesList.js", import.meta.url);


      // jsResource = `/js/storiesList.js`;

    }

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
          window.storiesList.init(${JSON.stringify(widgetParams)});
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
    this.on('clickOnStoryInternal', (payload: ClickOnStoryInternalPayload) => {
      if (isFunction(this.callbacks?.handleClickOnStoryInternal)) {
        this.callbacks?.handleClickOnStoryInternal(payload);
      }
    });

    this.on('flushThumbViews', (payload: Array<number>) => {
      if (isFunction(this.callbacks?.handleFlushThumbViews)) {
        this.callbacks?.handleFlushThumbViews(payload);
      }
    });




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

  // pass story list
  setStories(payload: any) {
    this.rpc.callMethod('setStories', payload);
  }

  setFonts(payload: any) {
    this.rpc.callMethod('setFonts', payload);
  }




};
