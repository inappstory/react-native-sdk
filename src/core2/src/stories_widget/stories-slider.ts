// @ts-nocheck

// https://github.com/zloirock/core-js

// todo включить обратно
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
import {createStore} from './store'






import Vue, {CreateElement, VNode} from 'vue'
import StoriesList from './components/Stories/StoriesList/StoriesList.vue'


import {MutationPayload} from "vuex"
/// <reference path="./bowser.d.ts" />
import bowser from 'bowser/es5'
import {debugLog, extend} from "~/common_widget/common"
import {IWidgetStoriesOptions} from "./models/WidgetStoriesOptions";
import {debug} from "~/src/stories_widget/util/debug";
import {setNeedSession} from "~/src/stories_widget/util/env";
import {
  ClickOnFavoriteCellInternalPayload,
  ClickOnStoryInternalPayload,
  STORY_LIST_TYPE,
  SyncStoreEvent
} from "~/src/types";
import {fontFaceAsCss, initFontStyle} from "~/src/stories_widget/helpers/media";
import {StoriesListOptions} from "~/src/types/storyManager/storiesList";
import {AppearanceCommonOptions} from "~/src/types/storyManager/appearanceCommon";

const needSession = false;
setNeedSession(needSession);

// import './app.scss'

// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

// const syncStore = function (mutation: MutationPayload) {
//   if ((<any>window).cur.Rpc) (<any>window).cur.Rpc.callMethod('event', 'syncStore', {mutation});
// }

const store = createStore();
// const storeUnsubscribe = store.subscribe((mutation, state) => {
//   if (mutation.type.substr(0, "shared".length) === "shared" && isObject(mutation.payload) && mutation.payload.__sync === undefined) {
//     mutation.payload.__sync = true;
//     syncStore(mutation);
//   }
// });


store.commit('UPDATE_NEED_SESSION', {needSession});

Vue.config.productionTip = false
Vue.config.performance = true

// Vue.config.devtools = true
const browser = bowser.getParser(window.navigator.userAgent);
const ua = browser.parse();


async function initStoryList(): Promise {
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
      (<any>window).cur?.Rpc?.callMethod('hideLoader');

      // initStoryList().then(() => {
      //     this.storyListLoaded = true;
      // }).finally(() => {
      //     (<any>window).cur?.Rpc?.callMethod('hideLoader');
      // });

    },
    destroyed() {
      storeUnsubscribe();
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
          clickOnStory: (event) => {
            (<any>window).cur?.Rpc?.callMethod('event', 'clickOnStory', event);
          },
          clickOnStoryDeepLink: (event) => {
            (<any>window).cur?.Rpc?.callMethod('event', 'clickOnStoryDeepLink', event);
          },
          clickOnStoryInternal: (payload: ClickOnStoryInternalPayload) => {
            (<any>window).cur?.Rpc?.callMethod('event', 'clickOnStoryInternal', payload);
          },
          flushThumbViews: (payload: ClickOnStoryInternalPayload) => {
            (<any>window).cur?.Rpc?.callMethod('event', 'flushThumbViews', payload);
          },
          /** @deprecated */
          sessionInitInternal: (payload: any) => { // Session.rawData
            (<any>window).cur?.Rpc?.callMethod('event', 'sessionInitInternal', payload);
          },

          clickOnFavoriteCellInternal: (payload: ClickOnFavoriteCellInternalPayload) => {
            // we always need pass items
            // if (this.itemsPassedToFavoriteReader) {
            //     payload.items = null;
            // }
            // if (!this.itemsPassedToFavoriteReader) {
            //     this.itemsPassedToFavoriteReader = true;
            // }
            (<any>window).cur?.Rpc?.callMethod('event', 'clickOnFavoriteCellInternal', payload);
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

  // (<any>window).cur?.Rpc?.callMethod('event', 'sessionInitInternal', session?.rawData);


  if ((<any>window)['app']) {
    (<any>window)['app_'] = createApp()
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



declare global {
  interface Window {
    storiesList: any;
  }
}


const WStories = {

  init: function (options: IWidgetStoriesOptions) {
    options = options || {};
    (<any>window).cur.options = options;
    extend((<any>window).cur, {});

    (<any>window).cur.appTopStartMarginTop = 0;

    (<any>window).cur.RpcMethods = {
      onInit: function () {
        debug(`Widget init with options`, options);
      },

      onStoryOpened: async function (payload: { id: number }) {
        // await store.dispatch('stories/UPDATE_STORY_OPENED', {id: payload.id, value: true});

        // dirty hack
        try {
          if ((<any>window)['app_']) {
            (<any>window)['app_'].$refs?.storiesList?.onStoryOpened(payload.id);
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

      setStories: function ({listType, storyList}: {listType: STORY_LIST_TYPE, storyList: Array<Dict>}) {
        // console.log('_Stories.setStories', {listType, storyList});
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



      },

      setFonts: (payload) => {
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


};


// (<any>global).WStories = WStories;

export default WStories;
