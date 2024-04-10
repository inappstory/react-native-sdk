// @ts-nocheck

// https://github.com/zloirock/core-js

// import "core-js/features/object/from-entries";
// import "regenerator-runtime/runtime.js";
// import 'es6-promise/auto';
// import 'es6-object-assign/auto';
// import 'array.prototype.find/auto';
// import 'classlist-polyfill';
// import 'element-closest-polyfill';

// import 'bootstrap/scss/_functions.scss';
// import 'bootstrap/scss/_variables.scss';
// import 'bootstrap/scss/_mixins.scss';
// import 'bootstrap/scss/_root.scss';
// import 'bootstrap/scss/_reboot.scss';

// import 'bootstrap/dist/css/bootstrap-reboot.min.css';

import 'normalize.css';
import {ensureSessionId, Session} from "./models/Session";
import {createStore} from './store';



import Vue, {CreateElement, VNode} from 'vue';
import StoriesViewer from './components/Stories/StoriesViewer/StoriesViewer.vue';


import {mapState, MutationPayload} from "vuex";
/// <reference path="./bowser.d.ts" />
import bowser from 'bowser/es5'; // ??????????????????
import {debugLog} from "./common_widget/common";
import {StoriesState} from "./store/vuex-stories-module";
import {IWidgetStoriesOptions} from "./models/WidgetStoriesOptions";
import {debug} from "./util/debug";
import {setNeedSession} from "./util/env";

import StoriesItem from "./models/StoriesItem";
import AbstractModel from "./models/AbstractModel";
import RootState from "./store/rootState";
import {keyCodes} from "./helpers/events";
import {initAndLoadFonts} from "./helpers/media";

import {v4 as uuidV4} from "uuid";
import {
    STORY_READER_WINDOW_REFERER,
    ClickOnStoryInternalWithDataPayload,
    STORY_LIST_TYPE,
    SyncStoreEvent,
    FontResource
} from "../story-manager/common.h";

setNeedSession(true);

// import './app.scss'


// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

const store = createStore();

/** @deprecated */
// const syncStore = function (mutation: MutationPayload, sharedState: RootState["shared"]) {
//   if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('event', 'syncStore', {mutation});
// }
// const storeUnsubscribe = store.subscribe((mutation, state) => {
//   if (mutation.type.substr(0, "shared".length) === "shared" && isObject(mutation.payload) && mutation.payload.__sync === undefined) {
//     mutation.payload.__sync = true;
//     syncStore(mutation);
//   }
// });

store.commit('UPDATE_NEED_SESSION', {needSession: true});

Vue.config.productionTip = false
Vue.config.performance = true

// Vue.config.devtools = true
const browser = bowser.getParser(window.navigator.userAgent);
const ua = browser.parse();

// export function debug(message?: any, ...optionalParams: any[]): void {
//   return;
// }


// window.onload = function () {

// if (window.__INITIAL_STATE__) {
// store.replaceState(window.__INITIAL_STATE__)
// }

let openOptions = STORY_READER_WINDOW_REFERER.default;

function createApp(StoryManagerProxy) {

  return new Vue({
    store,
    el: '#_app',
    components: {
      StoriesViewer
    },
    // data: function (){
    //   return {
    //     sharedState: store.state,
    //     showStoriesView: this.$store.state.showStoriesView,
    //     storyId: this.$store.state.storyId,
    //     saving: false,
    //     user: this.$store.state.user
    // }
    // },
    data: {

      visible: true,
      showStoriesView: false

    },
    computed: {
      ...mapState('stories', {
        sharedStoryId: (state: StoriesState): number | null => state.storyId,
        sharedShowStoriesView: (state: StoriesState): boolean => state.showStoriesView,
        modeDesktop: (state: StoriesState): boolean => state.modeDesktop
      }),
    },

    watch: {
      sharedShowStoriesView: function (to: boolean, from: boolean): void {

        if (to) {

          this.showStoriesView = true;

          // if ((window as any).WStories) {
          // TODO add temporal backdrop with loader
          // (window as any).WStories.switchToFullScreen();
          // }

          // if (!this.$store.getters['session/id']) {
          //     Session.reInitSession().then(idSession => {});
          // }

          // this.showStoriesView = true;

          try {
            window.focus()
          } catch (e) {
            console.error(e)
          }

        } else {
          this.showStoriesView = false;
          // if ((window as any).WStories) {
          //     (window as any).WStories.switchFromFullScreen();
          // }

          try {
            window.blur()
          } catch (e) {
            console.error(e)
          }
        }


      },
    },
    provide: function () {
      return {
        setVisible: () => {
          this.visible = true
        },
        setHidden: () => {
          this.visible = false
        }
      }
    },
    mounted() {
      this.initHandlers();
    },
    destroyed() {
      // storeUnsubscribe();
      this.removeHandlers();
    },
    methods: {
      initHandlers() {
        window.addEventListener('keydown', this.onKeydown);
      },
      removeHandlers() {
        window.removeEventListener('keydown', this.onKeydown);
      },
      onCloseStoryReader() {
        this.$store.commit('stories/setSharedShowStoriesView', false);
        WStoriesReader.close();
      },
      onKeydown(e) {
        if (e.keyCode === keyCodes.esc) {
          // this.onCloseStoryReader();
          try {
            this.$refs['storiesViewer']?.closeViewer("closeReaderByEscBtn");
          } catch (e) {
            console.error(e);
          }

        }
      },
    },
    render(h: CreateElement): VNode | undefined {
      if (this.showStoriesView) {
        return h('StoriesViewer', {
          ref: 'storiesViewer',
          props: {
            id: this.sharedStoryId,
            timeout: 10000,
            timerEnabled: true,
            storyManagerProxy: (name, data) => StoryManagerProxy.rpcCallEventWithCb(name, data),
          },
          style: {display: this.visible ? 'block' : 'none'},
          on: {
            close: this.onCloseStoryReader,
            showSlide: (event) => {
                RPC.widgetEvent({name: "showSlide", payload: event});
            },
            showStory: (event) => {
                RPC.widgetEvent({name: "showStory", payload: event});
            },
            closeStory: (event) => {
                RPC.widgetEvent({name: "closeStory", payload: event});
            },
            closeStoryByScrolling: (event) => {
                RPC.widgetEvent({name: "closeStoryByScrolling", payload: event});
            },
            clickOnButton: (event) => {
                RPC.widgetEvent({name: "clickOnButton", payload: event});
            },
            clickOnSwipeUpGoods: (event) => {
                RPC.widgetEvent({name: "clickOnSwipeUpGoods", payload: event});
            },
            likeStory: (event) => {
                RPC.widgetEvent({name: "likeStory", payload: event});
            },
            dislikeStory: (event) => {
                RPC.widgetEvent({name: "dislikeStory", payload: event});
            },
            favoriteStory: (event) => {
                RPC.widgetEvent({name: "favoriteStory", payload: event});
            },
            favoriteStoryInternal: (event) => {
                RPC.widgetEvent({name: "favoriteStoryInternal", payload: event});
            },
            shareStory: (event) => {
                RPC.widgetEvent({name: "shareStory", payload: event});
            },
            shareStoryWithPath: (event) => {
                RPC.widgetEvent({name: "shareStoryWithPath", payload: event});
            },
            storyOpenedInternal: (event) => {
                RPC.widgetEvent({name: "storyOpenedInternal", payload: event});
            },
            openViewer: (payload: { storiesId: number }) => WStoriesReader.setFixedHtmlPosition(),
              shareStoryInternal: (shareData) => RPC.onShareStoryInternal(shareData),
              changeSoundOnInternal: (event) => RPC.widgetEvent({name: "changeSoundOnInternal", payload: event}),
          }
        })
      } else {
        return undefined;
      }
    }
  })
}


function mount(options: IWidgetStoriesOptions, StoryManagerProxy) {

  // sync
  store.commit('stories/setOptions', options);

  // Session.setStoreLink(store);

  if ((window as any)['app']) {
    (window as any)['app_'] = createApp(StoryManagerProxy)
  }

}

function initSliderMode() {

  // todo - from manager
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

import * as RPC from "../widget-story-reader/rpc";
import {Dict, Option} from "../../global.h";

declare global {
  interface Window {
    storyReader: Option<storyReaderInit>;
    _rpcServerSourceWindow?: Window;
    _rpcServerSourceWindowOrigin?: string;
    _initRpcClient: () => Promise<void>;
  }
}


const WStoriesReader = {

  init: function (options: IWidgetStoriesOptions) {

    options = options || {};
    (window as any).cur.options = options;
    // extend((window as any).cur, {});

    (window as any).cur.appTopStartMarginTop = 0;

      if (window.console) {
          window.console.log = function() {
              RPC.debug(JSON.stringify([...arguments]));
          };
      }


    // RPC
      RPC.onCloseReader.use(async (payload) => {

      // dirty hack
      try {
          const app = (window as any)['app_'];
        if (app && app.$refs && app.$refs.storiesViewer && app.$refs.storiesViewer.closeViewerImportant) {
            app.$refs.storiesViewer.closeViewerImportant("externalCloseReader");
        } else {
            store.commit('stories/setSharedShowStoriesView', false);
            WStoriesReader.close();
        }

      } catch (e) {
        console.error(e);
      }

    });

    RPC.onOpenReader.use(async (payload) => {
      // if debug
      // console.log('onOpenReader payload:', payload);

      // ensureSessionId();

      // console.log(payload)

      // setSession(payload.session);
      // Session.setStoreLink(store);


      // const fontStyle = store.getters['shared/session']?.cache?.fontsCss;
      // if (fontStyle) {
      //   // TODO only on first time
      //   initFontStyle(fontStyle);
      // }


      store.commit('stories/setStories', payload);

      store.commit('stories/setStoriesContext', {rawData: payload.storyContext});
      store.commit('stories/SET_ACTIVE_STORY', payload.id);

      store.commit('stories/setHasShare', payload.hasShare);

      store.commit('stories/setPlatform', payload.platform);

      if (payload.soundOn != null) {
          store.commit('stories/setMuted', !payload.soundOn);
      }


      openOptions = payload.windowReferer;
      window.setTimeout(() => {
          WStoriesReader.open(payload.windowReferer);
      }, 200);


    });

    // не нужно по идее?
      RPC.setStories.use(async ({listType, storyList}) => {

      // debug.log
      // console.log('_StoryReader.setStories', {listType, storyList});

      store.commit('stories/setStories', {listType, storyList});

    });

      RPC.setFonts.use(async (payload: Array<FontResource>) => {
          // store.commit('shared/setStories', {models: payload.map(_ => ({rawData: _}))});
          //     console.log('_StoryReader.setFonts', {payload});

          if (Array.isArray(payload)) {
              initAndLoadFonts(payload);
              // const fontStyle = payload.reduce((previousValue: string, value) => previousValue + fontFaceAsCss(value), "");
              // if (fontStyle) {
              //     initFontStyle(fontStyle);
              // }
          }
      });

  RPC.onPauseUI.use( payload => {

      // dirty hack
      try {
          if ((window as any)['app_']) {
              (window as any)['app_'].$refs?.storiesViewer?.pauseUI();
          }
      } catch (e) {
          console.error(e);
      }
    });

  RPC.onResumeUI.use( payload => {

      // dirty hack
      try {
          if ((window as any)['app_']) {
              (window as any)['app_'].$refs?.storiesViewer?.resumeUI();
          }
      } catch (e) {
          console.error(e);
      }
    });

      RPC.setSoundOn.use(async (value) => {
          store.commit('stories/setMuted', !value);
      });



    (window as any).cur.RpcMethods = {
      onInit: function () {

        debug(`Widget init with options`, options);
        // debug()

        // if (cur.Rpc) cur.Rpc.callMethod('resize', 5000); // height
        // if (cur.Rpc) cur.Rpc.callMethod('switchToFullScreen');


        // addEvent(window, 'resize', onBodyResize);
        // uiScroll.addResizeSensor(cur.heightEl, WPost.onresize)[1]();
      },


      onCloseGoodsWidget: function(payload: {elementId: string}) {
        if ((window as any).goods_widget_complete) {
          (window as any).goods_widget_complete(payload.elementId);
        }
      },


      onEnterFullScreen: async function (data: any) {
        const offsetTop = data.offsetTop || 0;
        if ((window as any)['app_top']) {
          (window as any).cur.appTopStartMarginTop = (window as any)['app_top'].style.getPropertyValue('margin-top');
          (window as any)['app_top'].style.setProperty('margin-top', offsetTop + 'px');
        }

        if ((window as any)['_app_bottom']) {
          (window as any)['_app_bottom'].showStoriesView = true;

          await ensureSessionId();

        }

      },
      onLeaveFullScreen: function () {

        // if ((window as any)['_app_bottom']) {
        //     (window as any)['_app_bottom'].showStoriesView = false;
        // }

      },

      /**
       * @deprecated
       * @param mutation
       */
      onSyncStore: function ({mutation}: SyncStoreEvent) {
        // store.commit(mutation.type, mutation.payload);

        // console.log('reader onSyncStore', mutation);

      },

      // eventCb: function ({requestId, success, data, err}) {
      //   if ((window as any)._rpcCallEventWithCbQueue.has(requestId)) {
      //     const cb = (window as any)._rpcCallEventWithCbQueue.get(requestId);
      //     cb({success, data, err});
      //     (window as any)._rpcCallEventWithCbQueue.delete(requestId);
      //   }
      // },

    };

    RPC.widgetEventCb.use(({requestId, success, data, err}) => {
        if ((window as any)._rpcCallEventWithCbQueue.has(requestId)) {
            const cb = (window as any)._rpcCallEventWithCbQueue.get(requestId);
            cb({success, data, err});
            (window as any)._rpcCallEventWithCbQueue.delete(requestId);
        }
    });


    (window as any)._rpcCallEventWithCbQueue = new Map();
    class StoryManagerProxy {
      public static rpcCallEventWithCb = (name: string, data: any): Promise<{data: any}> => {
        const id = uuidV4();


        RPC.widgetEvent({name, payload: {...data, __cb: {id}}});

        // fastXdm - удалить

        return new Promise((resolve, reject) => {
          (window as any)._rpcCallEventWithCbQueue.set(id, (resp: {success: boolean, data: any, err: string}) => resp.success ? resolve(resp.data) : reject(resp.err));
        });

      }
    }


    try {
      window._initRpcClient().then(() => {

        /** Detect device screen width */
        initSliderMode();
        window.addEventListener('resize', initSliderMode);

        mount(options, StoryManagerProxy);

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

  setFixedHtmlPosition: function () {
    if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('setFixedHtmlPosition');
  },
  open: function (windowReferer) {
    // if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('open', {windowReferer});
      RPC.onReaderOpened({windowReferer});
  },
  close: function () {
    // if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('close', {windowReferer: openOptions});

      // wait until stats flushed on close reader
      setTimeout(() => {
          RPC.onReaderClosed({windowReferer: openOptions});
      }, 100)


  },


};


// (<any>global).WStoriesReader = WStoriesReader;

// export {WStoriesReader}


type storyReaderInit = {
  _e: Array<() => void>,
  ready: (cb: () => void) => void,
};

const storyReader: storyReaderInit = (function () {
  const self = (window.storyReader || {}) as storyReaderInit;
  self._e = self._e || [];
  if (self._e) {
    for (let i = 0; i < self._e.length; i++) {
      setTimeout(self._e[i], 0);
    }
  }
  self.ready = function (cb) {
    cb();
  };

  Object.assign(self, WStoriesReader);

  return self;
}());

window.storyReader = storyReader;