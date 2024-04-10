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
import {Session} from "./models/Session"
import {createStore} from './store'

import 'es6-promise/auto'
import 'es6-object-assign/auto'
import 'array.prototype.find/auto'
import 'classlist-polyfill'
import 'element-closest-polyfill';

import Vue, {CreateElement, VNode} from 'vue'
import StoriesFavorite from './components/Stories/StoriesFavorite/StoriesFavorite.vue'


import {mapGetters, mapState, MutationPayload} from "vuex"
/// <reference path="./bowser.d.ts" />
import bowser from 'bowser/es5'
import {debugLog, extend} from "~/common_widget/common"
import {StoriesState} from "./store/vuex-stories-module";
import {IWidgetStoriesOptions} from "./models/WidgetStoriesOptions";
import {debug} from "~/src/stories_widget/util/debug";
import {setNeedSession} from "~/src/stories_widget/util/env";
import {
  ClickOnFavoriteCellInternalPayload,
  ClickOnStoryInternalPayload,
  STORY_READER_WINDOW_REFERER,
  SyncStoreEvent
} from "~/src/types";
import AbstractModel from "~/src/stories_widget/models/AbstractModel";
import RootState from "~/src/stories_widget/store/rootState";
const isObject = require("lodash/isObject");
import {keyCodes} from "~/src/stories_widget/helpers/events";
import {fontFaceAsCss, initFontStyle} from "~/src/stories_widget/helpers/media";
import {StoryFavoriteReaderOptions} from "~/src/types/storyManager/storyFavoriteReader";
import {StoriesListOptions} from "~/src/types/storyManager/storiesList";
import ScrollbarHelper from "~/src/storyManager/widget/ScrollbarHelper";

// setNeedSession(true);

// import './app.scss'


// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

// const syncStore = function (mutation: MutationPayload, sharedState: RootState["shared"]) {
//   if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('event', 'syncStore', {mutation});
// }

const store = createStore();
// const storeUnsubscribe = store.subscribe((mutation, state) => {
//   if (mutation.type.substr(0, "shared".length) === "shared" && isObject(mutation.payload) && mutation.payload.__sync === undefined) {
//     mutation.payload.__sync = true;
//     syncStore(mutation);
//   }
// });

// store.commit('UPDATE_NEED_SESSION', {needSession: true});

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


function createApp() {
  return new Vue({
    store,
    el: '#_app',
    components: {
      StoriesFavorite
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
      showStoriesView: false,
      itemsPassedToReader: false,

    },
    computed: {
      ...mapState('stories', {
        sharedStoryId: (state: StoriesState): number | null => state.storyId,
        modeDesktop: (state: StoriesState): boolean => state.modeDesktop
      }),
      ...mapGetters('stories', {
        showStoriesFavoriteReader: 'showStoriesFavoriteReader'
      }),
    },

    watch: {
      showStoriesFavoriteReader: function (to: boolean, from: boolean): void {
        if (to) {
          this.showStoriesView = true;
          try {
            window.focus()
          } catch (e) {
            console.error(e)
          }
        } else {
          this.showStoriesView = false;
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
        this.$store.commit('stories/setShowStoriesFavoriteReader', false);
        if ((<any>window).storyFavoriteReader) {
          (<any>window).storyFavoriteReader.close();
        }
      },
      onKeydown(e) {
        if (e.keyCode === keyCodes.esc) {
          this.onCloseStoryReader();
        }
      },
    },
    render(h: CreateElement): VNode | undefined {
      if (this.showStoriesView) {

        return h('StoriesFavorite', {
          props: {
            id: this.sharedStoryId,
            timeout: 10000,
            timerEnabled: true,
          },
          style: {display: this.visible ? 'block' : 'none'},
          on: {

            clickOnStoryInternal: (payload: ClickOnStoryInternalPayload) => {
              (<any>window).cur?.Rpc?.callMethod('event', 'clickOnStoryInternal', payload);
            },

            close: this.onCloseStoryReader,


            // close: this.onCloseStoryViewer,
            // showSlide: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'showSlide', {id: event.id, index: event.index});
            // },
            // showStory: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'showStory', {id: event.id});
            // },
            // closeStory: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'closeStory', {id: event.id});
            // },
            // clickOnButton: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'clickOnButton', {id: event.id, index: event.index, url: event.url});
            // },
            // likeStory: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'likeStory', event);
            // },
            // dislikeStory: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'dislikeStory', event);
            // },
            // favoriteStory: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'favoriteStory', event);
            // },
            // shareStory: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'shareStory', event);
            // },
            // shareStoryWithPath: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'shareStoryWithPath', event);
            // },
            //
            // storyOpenedInternal: (event) => {
            //     (<any>window).cur?.Rpc?.callMethod('event', 'storyOpenedInternal', event);
            // },
            // openViewer: (payload: {storiesId: number}) => WStoriesFavorite.setFixedHtmlPosition(),

          }
        })
      } else {
        return undefined;
      }
    }
  })
}


function mount(payload: {options: StoryFavoriteReaderOptions, storiesListOptions: StoriesListOptions}) {

  // sync
  store.commit('stories/setFavoriteOptions', payload.options);
  store.commit('shared/setOptions', {options: payload.storiesListOptions});

  if ((<any>window)['app']) {
    (<any>window)['app_'] = createApp()
  }

}

function setSession(sessionData: any) {

  // if need update

  const session = AbstractModel.createInstance(Session, sessionData);


  // create model from store data
  //
  // store.commit('session/update', session);
  //
  //
  // if (session.rawData && session.rawData.share) {
  //     store.commit('stories/setHasShare', true)
  // }
  //
  // store.commit('shared/addDefaultPlaceholders', {value: session.placeholders});

  // let session: Nullable<Session> = null;
  // try {
  //     session = await Session.init(store);
  // } catch (error) {
  //     debug(`init failed with error ${error}`)
  // }
  //
  // debug(`init success with session id ${session?.id}`)

  // const fontStyle = session?.cache?.fontsCss;
  // if (fontStyle) {
  //   initFontStyle(fontStyle);
  // }

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



const WStoriesFavorite = {

  init: function (options: IWidgetStoriesOptions) {

    options = options || {};
    (<any>window).cur.options = options;
    extend((<any>window).cur, {});

    (<any>window).cur.appTopStartMarginTop = 0;

    let sbHelper;

    (<any>window).cur.RpcMethods = {
      onInit: function () {

        debug(`Widget init with options`, options);
        // debug()

        // if (cur.Rpc) cur.Rpc.callMethod('resize', 5000); // height
        // if (cur.Rpc) cur.Rpc.callMethod('switchToFullScreen');


        // addEvent(window, 'resize', onBodyResize);
        // uiScroll.addResizeSensor(cur.heightEl, WPost.onresize)[1]();


      },

      onOpenReader: async function (payload: ClickOnFavoriteCellInternalPayload) {
        // console.log('onOpenFavoriteReader payload:', payload);

        // const fontStyle = store.getters['shared/session']?.cache?.fontsCss;

        // if (fontStyle) {
        //   // TODO only on first time
        //
        //
        //   initFontStyle(fontStyle);
        // }

        store.commit('stories/setStories', payload);

        store.commit('stories/setShowStoriesFavoriteReader', true);

        // open iframe fullscreen
        WStoriesFavorite.open();

        // ensureSessionId();

        // console.log(payload)

        // setSession(payload.session);
        // Session.setStoreLink(store);


        // store.commit('stories/SET_STORY_LIST_TYPE', STORY_LIST_TYPE.default);

        // if (payload.items !== null && Array.isArray(payload.items)) {
        //     store.commit('stories/setFavoriteStories', payload.items.map(item => AbstractModel.createInstance(StoriesItem, item)));
        // }


        // const ids: Array<number> = [];
        // store.getters['stories/activeStories'].forEach((item: StoriesItem) => {
        //     ids.push(item.id)
        // });


        // store.dispatch('stories/FETCH_STORIES_CONTEXT', ids).then(() => {
        //     debug('stories context loaded');
        //     store.dispatch('stories/FETCH_STORY', payload.id).then((): void => store.commit('stories/SET_ACTIVE_STORY', payload.id))
        //     // fullScreen(document.querySelector('#app_bottom'))
        //
        //     WStoriesFavorite.open();
        // });


      },
      // экран открылся, инитим ScrollbarHelper
      onReaderOpened() {
        sbHelper = new ScrollbarHelper(window);
      },

      onOpenStoryReader: function (options: { windowReferer: STORY_READER_WINDOW_REFERER }) {
        // открылся стори ридер с этого экрана
        // console.log('открылся стори ридер с этого экрана')
        if (options.windowReferer === STORY_READER_WINDOW_REFERER.favorite) {
          sbHelper && sbHelper.setScrollbar();
        }
      },
      onCloseStoryReader: function (options: { windowReferer: STORY_READER_WINDOW_REFERER }) {
        // закрылся стори ридер, запущенный с этого экрана
        // console.log('закрылся стори ридер, запущенный с этого экрана')
        if (options.windowReferer === STORY_READER_WINDOW_REFERER.favorite) {
          sbHelper && sbHelper.resetScrollbar();
          try {
            window.focus()
          } catch (e) {
            console.error(e)
          }
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

          // await ensureSessionId();

        }

      },
      onLeaveFullScreen: function () {

        // if ((<any>window)['_app_bottom']) {
        //     (<any>window)['_app_bottom'].showStoriesView = false;
        // }

      },

      onSessionInit: async function (payload) {
        setSession(payload);
        Session.setStoreLink(store);
      },

      /**
       * @deprecated
       * @param mutation
       * @param sharedState
       */
      onSyncStore: function ({mutation, sharedState}: SyncStoreEvent) {

        // const stories = new Map(store.state.shared.stories);
        // new Map(Object.entries(sharedState.stories)).forEach((story, key, map) => {
        //     stories.set(parseInt(key), AbstractModel.createInstance(StoriesItem, story.rawData));
        // });
        // sharedState.stories = stories;
        // const state = store.state;
        // state.shared = sharedState;
        // store.replaceState(state);

        // @deprecated
        //     store.commit(mutation.type, mutation.payload);

      },

      setStories: function(payload) {
        // console.log('FavoriteReader setStories', payload);

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

    };
    try {
      (<any>window).cur.Rpc = new (<any>window).fastXDM.Client((<any>window).cur.RpcMethods, {safe: true});
    } catch (e) {
      debugLog(e);
    }

    /** Detect device screen width */
    initSliderMode();
    window.addEventListener('resize', initSliderMode);

    mount(options);

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
  open: function () {
    if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('open');
  },
  close: function () {
    if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('close');
  },


};


// (<any>global).WStoriesFavorite = WStoriesFavorite;
export {WStoriesFavorite}

// after back or load from server
// document.addEventListener('pjax:end', () => {
//   debug('dcfv')
//   mountAll()}, false)
//

// if (window['jQuery']) {
//   debug('jQuery')
//   jQuery(document).on('pjax:end', (e) => {
//     mountAll()
//   })
// }

// }


// const app = new Vue({
//   router,
//   store,
//   render: h => h(App)
// })

//
//
//
//
//
//
//
//
// import 'es6-promise/auto'
//
// import { createApp } from './app'
//
// // import './styles/main.scss';
//
// Vue.config.productionTip = false
//
//
//
// const { app, store } = createApp()
//
// // prime the store with server-initialized state.
// // the state is determined during SSR and inlined in the page markup.
// if (window.__INITIAL_STATE__) {
//   store.replaceState(window.__INITIAL_STATE__)
// }
//
// // wait until router has resolved all async before hooks
// // and async components...
// router.onReady(() => {
//   // Add router hook for handling asyncData.
//   // Doing it after initial route is resolved so that we don't double-fetch
//   // the data that we already have. Using router.beforeResolve() so that all
//   // async components are resolved.
//   router.beforeResolve((to, from, next) => {
//     const matched = router.getMatchedComponents(to)
//     const prevMatched = router.getMatchedComponents(from)
//     let diffed = false
//     const activated = matched.filter((c, i) => {
//       return diffed || (diffed = (prevMatched[i] !== c))
//     })
//     const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
//     if (!asyncDataHooks.length) {
//       return next()
//     }
//
//     bar.start()
//     Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
//       .then(() => {
//         bar.finish()
//         next()
//       })
//       .catch(next)
//   })
//
//   // actually mount to DOM
//   app.$mount('#app')
// })
//
// // service worker
// // if ('https:' === location.protocol && navigator.serviceWorker) {
// //   navigator.serviceWorker.register('/service-worker.js')
// // }
