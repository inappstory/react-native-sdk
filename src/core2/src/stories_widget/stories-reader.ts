// @ts-nocheck

// https://github.com/zloirock/core-js
import "core-js/features/object/from-entries";

import "regenerator-runtime/runtime.js";

// import 'bootstrap/scss/_functions.scss';
// import 'bootstrap/scss/_variables.scss';
// import 'bootstrap/scss/_mixins.scss';
// import 'bootstrap/scss/_root.scss';
// import 'bootstrap/scss/_reboot.scss';

// import 'bootstrap/dist/css/bootstrap-reboot.min.css';

import 'normalize.css';
import {ensureSessionId, Session} from "./models/Session"
import {createStore} from './store'

import 'es6-promise/auto'
import 'es6-object-assign/auto'
import 'array.prototype.find/auto'
import 'classlist-polyfill'
import 'element-closest-polyfill';

import Vue, {CreateElement, VNode} from 'vue'
import StoriesViewer from './components/Stories/StoriesViewer/StoriesViewer.vue'


import {mapState, MutationPayload} from "vuex"
/// <reference path="./bowser.d.ts" />
import bowser from 'bowser/es5'
import {debugLog, extend} from "~/common_widget/common"
import {StoriesState} from "./store/vuex-stories-module";
import {IWidgetStoriesOptions} from "./models/WidgetStoriesOptions";
import {debug} from "~/src/stories_widget/util/debug";
import {setNeedSession} from "~/src/stories_widget/util/env";
import {
  ClickOnStoryInternalWithDataPayload,
  STORY_LIST_TYPE,
  STORY_READER_WINDOW_REFERER,
  SyncStoreEvent
} from "~/src/types";
import StoriesItem from "~/src/stories_widget/models/StoriesItem";
import AbstractModel from "~/src/stories_widget/models/AbstractModel";
import RootState from "~/src/stories_widget/store/rootState";
const isObject = require("lodash/isObject");
import {keyCodes} from "~/src/stories_widget/helpers/events";
import {fontFaceAsCss, initFontStyle} from "~/src/stories_widget/helpers/media";

const uuid = require('uuid');

setNeedSession(true);

// import './app.scss'


// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

const store = createStore();

/** @deprecated */
// const syncStore = function (mutation: MutationPayload, sharedState: RootState["shared"]) {
//   if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('event', 'syncStore', {mutation});
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

          // if ((<any>window).WStories) {
          // TODO add temporal backdrop with loader
          // (<any>window).WStories.switchToFullScreen();
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
          // if ((<any>window).WStories) {
          //     (<any>window).WStories.switchFromFullScreen();
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

        if ((<any>window).storyReader) {
          (<any>window).storyReader.close();
        }
      },
      onKeydown(e) {
        if (e.keyCode === keyCodes.esc) {
          // this.onCloseStoryReader();
          try {
            this.$refs['storiesViewer']?.closeViewer();
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
              (<any>window).cur?.Rpc?.callMethod('event', 'showSlide', {id: event.id, index: event.index});
            },
            showStory: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'showStory', {id: event.id});
            },
            closeStory: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'closeStory', {id: event.id});
            },
            closeStoryByScrolling: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'closeStoryByScrolling', {id: event.id});
            },
            clickOnButton: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'clickOnButton', {
                id: event.id,
                index: event.index,
                url: event.url,
                elementId: event.elementId,
              });
            },
            clickOnSwipeUpGoods: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'clickOnSwipeUpGoods', {
                id: event.id,
                index: event.index,
                url: event.url,
                elementId: event.elementId,
                modeDesktop: event.modeDesktop,
                width: event.width,
                height: event.height,
                verticalMargin: event.verticalMargin,
              });
            },
            likeStory: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'likeStory', event);
            },
            dislikeStory: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'dislikeStory', event);
            },
            favoriteStory: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'favoriteStory', event);
            },
            favoriteStoryInternal: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'favoriteStoryInternal', event);
            },
            shareStory: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'shareStory', event);
            },
            shareStoryWithPath: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'shareStoryWithPath', event);
            },
            storyOpenedInternal: (event) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'storyOpenedInternal', event);
            },
            openViewer: (payload: { storiesId: number }) => WStoriesReader.setFixedHtmlPosition(),
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

  if ((<any>window)['app']) {
    (<any>window)['app_'] = createApp(StoryManagerProxy)
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

const WStoriesReader = {

  init: function (options: IWidgetStoriesOptions) {

    options = options || {};
    (<any>window).cur.options = options;
    extend((<any>window).cur, {});

    (<any>window).cur.appTopStartMarginTop = 0;

    (<any>window).cur.RpcMethods = {
      onInit: function () {

        debug(`Widget init with options`, options);
        // debug()

        // if (cur.Rpc) cur.Rpc.callMethod('resize', 5000); // height
        // if (cur.Rpc) cur.Rpc.callMethod('switchToFullScreen');


        // addEvent(window, 'resize', onBodyResize);
        // uiScroll.addResizeSensor(cur.heightEl, WPost.onresize)[1]();
      },

      onOpenReader: async function (payload: ClickOnStoryInternalWithDataPayload & {hasShare: boolean}) {

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

        openOptions = payload.windowReferer;
        WStoriesReader.open(payload.windowReferer);

      },

      onCloseReader: function () {

        // dirty hack
        try {
          if ((<any>window)['app_']) {
            (<any>window)['app_'].$refs?.storiesViewer?.closeViewerImportant();
          }
        } catch (e) {
          console.error(e);
        }



      },

      onCloseGoodsWidget: function(payload: {elementId: string}) {
        if ((<any>window).goods_widget_complete) {
          (<any>window).goods_widget_complete(payload.elementId);
        }
      },


      onEnterFullScreen: async function (data: any) {
        const offsetTop = data.offsetTop || 0;
        if ((<any>window)['app_top']) {
          (<any>window).cur.appTopStartMarginTop = (<any>window)['app_top'].style.getPropertyValue('margin-top');
          (<any>window)['app_top'].style.setProperty('margin-top', offsetTop + 'px');
        }

        if ((<any>window)['_app_bottom']) {
          (<any>window)['_app_bottom'].showStoriesView = true;

          await ensureSessionId();

        }

      },
      onLeaveFullScreen: function () {

        // if ((<any>window)['_app_bottom']) {
        //     (<any>window)['_app_bottom'].showStoriesView = false;
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

      setStories: function(payload) {
        // console.log('Reader setStories', payload);

        store.commit('stories/setStories', payload);
        // .map(_ => AbstractModel.createInstance(StoriesItem, _))



        // switch (payload.listType) {
        //   case STORY_LIST_TYPE.default: {
        //
        //     // только stories/ стор
        //     // set - as rawData
        //
        //     // setStories / with list type
        //     store.commit('stories/setStories', payload.storyList.map(_ => AbstractModel.createInstance(StoriesItem, _)));
        //     break;
        //   }
        //   case STORY_LIST_TYPE.favorite: {
        //     store.commit('shared/setFavoriteStories', {models: payload.storyList.map(_ => ({rawData: _}))});
        //     store.commit('stories/setFavoriteStories', payload.storyList.map(_ => AbstractModel.createInstance(StoriesItem, _)));
        //     break;
        //   }
        //   case STORY_LIST_TYPE.onboarding: {
        //     store.commit('shared/setOnboardingStories', {models: payload.storyList.map(_ => ({rawData: _}))});
        //     store.commit('stories/setOnboardingStories', payload.storyList.map(_ => AbstractModel.createInstance(StoriesItem, _)));
        //     break;
        //   }
        // }

      },

      setFonts: (payload) => {
        // console.log('onSetFonts', payload);
        // сохранять в стор ?
        // store.commit('shared/setStories', {models: payload.map(_ => ({rawData: _}))});
        const fontStyle = fontFaceAsCss(payload);
        if (fontStyle) {
          initFontStyle(fontStyle);
        }
      },


      eventCb: function ({requestId, success, data, err}) {
        if ((<any>window)._rpcCallEventWithCbQueue.has(requestId)) {
          const cb = (<any>window)._rpcCallEventWithCbQueue.get(requestId);
          cb({success, data, err});
          (<any>window)._rpcCallEventWithCbQueue.delete(requestId);
        }
      },

    };


    (<any>window)._rpcCallEventWithCbQueue = new Map();
    class StoryManagerProxy {
      public static rpcCallEventWithCb = (name: string, data: any): Promise<{data: any}> => {
        const id = uuid.v4();
        (<any>window).cur?.Rpc?.callMethod('event', name, {id, data, cb: 'eventCb'});

        return new Promise((resolve, reject) => {
          (<any>window)._rpcCallEventWithCbQueue.set(id, (resp: {success: boolean, data: any, err: string}) => resp.success ? resolve(resp.data) : reject(resp.err));
        });

      }
    }

    try {
      (<any>window).cur.Rpc = new (<any>window).fastXDM.Client((<any>window).cur.RpcMethods, {safe: true});
    } catch (e) {
      debugLog(e);
    }

    /** Detect device screen width */
    initSliderMode();
    window.addEventListener('resize', initSliderMode);

    mount(options, StoryManagerProxy);

    (<any>window).cur?.Rpc?.callMethod('event', 'widgetLoaded', {});

  },

  switchToFullScreen: function () {
    if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('switchToFullScreen');
  },
  switchFromFullScreen: function () {
    (<any>window)['app_top'].style.setProperty('margin-top', (<any>window).cur.appTopStartMarginTop);
    if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('switchFromFullScreen');
  },
  clearLocalData: function (narrativeId?: number) {
    narrativeId = narrativeId || (<any>window).__activeNarrativeId;
    if (narrativeId) {
      sessionStorage.removeItem('narrative_' + narrativeId + '_data')
    }
  },

  setFixedHtmlPosition: function () {
    if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('setFixedHtmlPosition');
  },
  open: function (windowReferer) {
    if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('open', {windowReferer});
  },
  close: function () {
    if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('close', {windowReferer: openOptions});
  },


};


// (<any>global).WStoriesReader = WStoriesReader;

export {WStoriesReader}