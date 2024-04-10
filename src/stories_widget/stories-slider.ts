
// https://github.com/zloirock/core-js
// import "core-js/features/object/from-entries";
// import "regenerator-runtime/runtime.js";
// import 'es6-promise/auto'
// import 'es6-object-assign/auto'
// import 'array.prototype.find/auto'
// import 'classlist-polyfill'
// import 'element-closest-polyfill';



// import 'bootstrap/scss/_functions.scss';
// import 'bootstrap/scss/_variables.scss';
// import 'bootstrap/scss/_mixins.scss';
// import 'bootstrap/scss/_root.scss';
// import 'bootstrap/scss/_reboot.scss';

// import 'bootstrap/dist/css/bootstrap-reboot.min.css';

import 'normalize.css';
import {createStore} from './store';



import Vue, {CreateElement, VNode} from 'vue';
import StoriesList from './components/Stories/StoriesList/StoriesList.vue';


import {MutationPayload} from "vuex";
/// <reference path="./bowser.d.ts" />
import bowser from 'bowser/es5';
import {debugLog} from "./common_widget/common";
import {IWidgetStoriesOptions} from "./models/WidgetStoriesOptions";
import {debug} from "./util/debug";
import {setNeedSession} from "./util/env";

import {initAndLoadFonts} from "./helpers/media";
import {AppearanceCommonOptions} from "../story-manager/appearanceCommon.h";
import {StoriesListOptions} from "../widget-stories-list/index.h";
import {
  ClickOnFavoriteCellInternalPayload,
  ClickOnStoryInternalPayload, ClickOnStoryPayload, FontResource,
  STORY_LIST_TYPE, SyncStoreEvent
} from "../story-manager/common.h";

const needSession = false;
setNeedSession(needSession);

// import './app.scss'

// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

// const syncStore = function (mutation: MutationPayload) {
//   if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('event', 'syncStore', {mutation});
// }

const store = createStore();
// const storeUnsubscribe = store.subscribe((mutation, state) => {
//   if (mutation.type.substr(0, "shared".length) === "shared" && isObject(mutation.payload) && mutation.payload.__sync === undefined) {
//     mutation.payload.__sync = true;
//     syncStore(mutation);
//   }
// });


store.commit('UPDATE_NEED_SESSION', {needSession});

Vue.config.productionTip = false;
Vue.config.performance = true;

// Vue.config.devtools = true
const browser = bowser.getParser(window.navigator.userAgent);
const ua = browser.parse();


async function initStoryList(): Promise<any> {
// if has_favorite only

  return Promise.all([
    store.dispatch('shared/FETCH_STORIES', {}),
    // if has_favorite
    store.dispatch('shared/FETCH_FAVORITE_STORIES', {})
  ]);


}

function createApp() {

  return new Vue({
    store,
    el: '#_app',
    components: {
      StoriesList,
    },
    data() {
      return {
        itemsPassedToReader: false,
        itemsPassedToFavoriteReader: false,
        storyListLoaded: false,
      };
    },
    mounted() {
      this.storyListLoaded = true;

      // (window as any).cur?.Rpc?.callMethod('hideLoader');

      // initStoryList().then(() => {
      //     this.storyListLoaded = true;
      // }).finally(() => {
      //     (window as any).cur?.Rpc?.callMethod('hideLoader');
      // });

    },
    destroyed() {
      // storeUnsubscribe();
    },
    methods: {
      onOpenStoryViewer(id: number) {
        // console.log(`open story view intent ${id}`)
        //
        // this.$store.commit('SET_ACTIVE_STORY', {storyId: id})

        // this.$store.state.showStoriesView = true;
        // this.$store.state.storyId         = id;

      }
    },
    render(h: CreateElement): VNode {
      return h('StoriesList', {
        props: {
          loaded: this.storyListLoaded
        },
        on: {
          clickOnStory: (payload: ClickOnStoryPayload) => {
            RPC.clickOnStoryEvent(payload);
          },
          clickOnStoryDeepLink: (payload: ClickOnStoryPayload) => {
              RPC.clickOnStoryDeepLinkEvent(payload);
          },
          clickOnStoryInternal: (payload: ClickOnStoryInternalPayload) => {
              RPC.clickOnStoryInternalEvent(payload);
          },
          flushThumbViews: (payload: Array<number>) => {
              RPC.flushThumbViewsEvent(payload);
          },
          /** @deprecated */
          sessionInitInternal: (payload: any) => { // Session.rawData
            (window as any).cur?.Rpc?.callMethod('event', 'sessionInitInternal', payload);
          },

          clickOnFavoriteCellInternal: (payload: ClickOnFavoriteCellInternalPayload) => {
              RPC.clickOnFavoriteCellInternalEvent(payload);
            // we always need pass items
            // if (this.itemsPassedToFavoriteReader) {
            //     payload.items = null;
            // }
            // if (!this.itemsPassedToFavoriteReader) {
            //     this.itemsPassedToFavoriteReader = true;
            // }

              // (window as any).cur?.Rpc?.callMethod('event', 'clickOnFavoriteCellInternal', payload);





          },

        },
        ref: 'storiesList'
      });

    }
  })
}

async function mount(options: StoriesListOptions & Pick<AppearanceCommonOptions, "hasFavorite">) {

  // sync
  store.commit('shared/setOptions', {options});

  // let session: Nullable<Session> = null;
  // try {
  //   session = await Session.init(store);
  // } catch (error) {
  //   debug(`init failed with error ${error}`)
  // }

  // debug(`init success with session id ${session?.id}`)

  // (window as any).cur?.Rpc?.callMethod('event', 'sessionInitInternal', session?.rawData);


  if ((window as any)['app']) {
    (window as any)['app_'] = createApp();
  }

}

function initSliderMode() {

  if (ua.parsedResult.platform.type === 'mobile' || ua.parsedResult.platform.type === 'tablet') {
    store.commit('stories/DISABLE_DESKTOP_MODE');
  } else {
    store.commit('stories/ENABLE_DESKTOP_MODE');
  }

  /*      let viewportWidth = _winWidth();
        if (viewportWidth >= 768) {
            store.commit('stories/ENABLE_DESKTOP_MODE');
        } else {
            store.commit('stories/DISABLE_DESKTOP_MODE');
        }*/

}


import * as RPC from "../widget-stories-list/rpc";
import {Dict, Option} from "../../global.h";
import {clickOnFavoriteCellInternalEvent} from "../widget-stories-list/rpc";



declare global {
  interface Window {
    storiesList: Option<storiesListInit>;
    _rpcServerSourceWindow?: Window;
    _rpcServerSourceWindowOrigin?: string;
    _initRpcClient: () => Promise<void>;
  }
}

// declare global {
//   interface Window {
//     gameReader: Option<GameReaderInit>;
//   }
// }

const WStories = {

  init: function (options: IWidgetStoriesOptions) {

    (window as any).cur = {};
    options = options || {};
    (window as any).cur.options = options;
    // extend((window as any).cur, {});

    (window as any).cur.appTopStartMarginTop = 0;


    // init RPC methods

      if (window.console) {
          window.console.log = function() {
              RPC.debug(JSON.stringify([...arguments]));
          };
      }

      RPC.setStories.use(async ({listType, storyList}) => {
      // debug.log

      switch (listType) {
        case STORY_LIST_TYPE.default: {
          store.commit('shared/setStories', {models: storyList.map(_ => ({rawData: _}))});
          break;
        }
        case STORY_LIST_TYPE.favorite: {
          store.commit('shared/setFavoriteStories', {models: storyList.map(_ => ({rawData: _}))});
          break;
        }
      }
    });


      RPC.setFonts.use(async (payload: Array<FontResource>) => {
      // сохранять в стор ?
      // store.commit('shared/setStories', {models: payload.map(_ => ({rawData: _}))});
      //     console.log('_Stories.setFonts', {payload});

      if (Array.isArray(payload)) {
          initAndLoadFonts(payload);
          // const fontStyle = payload.reduce((previousValue: string, value) => previousValue + fontFaceAsCss(value), "");
          // if (fontStyle) {
          //     initFontStyle(fontStyle);
          // }
      }
    });

      // https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_for_webp
      // check_webp_feature:
      //   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
      //   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
      function check_webp_feature(feature: "lossy"|"lossless"|"alpha"|"animation", callback: (feature: "lossy"|"lossless"|"alpha"|"animation", result: boolean) => void) {
          const kTestImages = {
              lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
              lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
              alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
              animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
          };
          const img = new Image();
          img.onload = function () {
              var result = (img.width > 0) && (img.height > 0);
              callback(feature, result);
          };
          img.onerror = function () {
              callback(feature, false);
          };
          img.src = "data:image/webp;base64," + kTestImages[feature];
      }

    RPC.checkWebPSupport.use(async () => new Promise<boolean>(resolve => {
        check_webp_feature("lossy", (feature, result) => resolve(result))
    }));


    (window as any).cur.RpcMethods = {

      onInit: function () {
        debug(`Widget init with options`, options);
      },

      onStoryOpened: async function (payload: { id: number }) {
        // await store.dispatch('stories/UPDATE_STORY_OPENED', {id: payload.id, value: true});

        // dirty hack
        try {
          if ((window as any)['app_']) {
            (window as any)['app_'].$refs?.storiesList?.onStoryOpened(payload.id);
          }
        } catch (e) {
          console.error(e);
        }
      },

      // onStoryFavoriteChange: async function(payload: {id: number, value: boolean}) {
      //     await store.dispatch('stories/UPDATE_STORY_FAVORITE_INTERNAL', payload);
      // },
      /**
       * @deprecated
       * @param mutation
       */
      onSyncStore: function ({mutation}: SyncStoreEvent) {},

    };


    try {
      window._initRpcClient().then(() => {

        /** Detect device screen width */
        initSliderMode();
        window.addEventListener('resize', initSliderMode);

        mount(options);

        // console.log('call widgetLoaded');
          RPC.widgetLoaded();

      });
    } catch (e) {
      debugLog(e);
    }



  },

  switchToFullScreen: function () {
    if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('switchToFullScreen');
  },

  switchFromFullScreen: function () {
    (window as any)['app_top'].style.setProperty('margin-top', (window as any).cur.appTopStartMarginTop);
    if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('switchFromFullScreen');
  },

  clearLocalData: function (narrativeId?: number) {
    narrativeId = narrativeId || (window as any).__activeNarrativeId;
    if (narrativeId) {
      sessionStorage.removeItem('narrative_' + narrativeId + '_data')
    }
  },


};

type storiesListInit = {
  _e: Array<() => void>,
  ready: (cb: () => void) => void,
};

const storiesList: storiesListInit = (function () {
  const self = (window.storiesList || {}) as storiesListInit;
  self._e = self._e || [];
  if (self._e) {
    for (let i = 0; i < self._e.length; i++) {
      setTimeout(self._e[i], 0);
    }
  }
  self.ready = function (cb) {
    cb();
  };

  Object.assign(self, WStories);

  return self;
}());




window.storiesList = storiesList;

