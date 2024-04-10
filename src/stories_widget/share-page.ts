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
import Vue from 'vue'
import StoriesViewer from './components/Stories/StoriesViewer/StoriesViewer.vue'
import {mapState} from "vuex"
/// <reference path="./bowser.d.ts" />
import bowser from 'bowser/es5'
import {StoriesState} from "./store/vuex-stories-module";
import {debug} from "~/src/stories_widget/util/debug";
import StoriesItem from "~/src/stories_widget/models/StoriesItem";
import NarrativeContext from "~/src/stories_widget/models/NarrativeContext";
import {setNeedSession} from "~/src/stories_widget/util/env";
import {Dict} from "../../global.h";

let needSession = true;
setNeedSession(needSession);


// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

const store = createStore()
store.commit('UPDATE_NEED_SESSION', {needSession: needSession});

Vue.config.productionTip = false
Vue.config.performance = true

Vue.config.devtools = true


const browser = bowser.getParser(window.navigator.userAgent);
const ua = browser.parse();


function createAppBottom(item: StoriesItem, onReaderCloseCb: (window: Window) => {}) {

    return new Vue({
        store,
        el: '#story_mount',
        components: {
            "stories-viewer": StoriesViewer
        },
        render: function (h) {
            return this.sharedShowStoriesView ? h(
                // <stories-viewer v-bind:id="<?=$narrativeData['id']?>" v-bind:timeout="10000" :timer-enabled="true"></stories-viewer>
                'stories-viewer',   // компонент|тег
                {
                    props: {
                        id: item.id,
                        timeout: 10000,
                        "timer-enabled": true
                    },
                    on: {
                        close: () => {
                            onReaderCloseCb(window);
                            this.onCloseStoryReader()
                        },
                        clickOnButton: (payload) => {
                            window.open(payload.url, '_self');
                        },
                    },
                }
            ) : undefined;
        },
        data: {

            visible: true,
            showStoriesView: true

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
                    if ((window as any).WStories) {
                        // TODO add temporal backdrop with loader
                        (window as any).WStories.switchToFullScreen();
                    }

                    // if (!this.$store.getters['session/id']) {
                    //     Session.reInitSession().then(idSession => {});
                    // }

                    // this.showStoriesView = true;

                } else {
                    this.showStoriesView = false;
                    if ((window as any).WStories) {
                        (window as any).WStories.switchFromFullScreen();
                    }
                }


            }
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

            // this.$on('open-story-viewer', this.onOpenStoryViewer)
            // 'v-on:on-open-story-viewer' => 'onOpenStoryViewer'
        },
        methods: {
            // ...mapMutations('stories', ['setSharedShowStoriesView']),

            onCloseStoryReader() {
                this.$store.commit('stories/setSharedShowStoriesView', false);
                // this.sharedShowStoriesView = false;
            },
        }
    })
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

const WStories = {

    init: function (narrativeData: Dict, options: Dict) {

        window.widgetConfig = {
            api: {
                token: narrativeData.apiKey,
            },
        }

        let item = StoriesItem.createInstance(StoriesItem, narrativeData?.item);
        store.commit('shared/setStories', {models: [item]})
        store.commit('shared/setStoriesSlides', {models: [item]})
        store.commit('stories/setStoriesContext', NarrativeContext.createInstance(NarrativeContext, narrativeData?.context))
        store.commit('stories/setSharedShowStoriesView', true);
        if (item.share_functional) {
            store.commit('shared/setHasShare', {status: true})
        }
        debug(item)

        let onReaderCloseCb = (window: Window) => {
            const isIframe = window.location != window.parent.location;
            const location = isIframe ? window.parent.location : window.location;
            // window.location = `${location.protocol}//${location.host}`
            window.open(`${location.protocol}//${location.host}`, '_parent')
        }
        if (options?.onReaderCloseCb !== undefined && typeof options?.onReaderCloseCb === 'function') {
            onReaderCloseCb = options.onReaderCloseCb;
        }


        /** Detect device screen width */
        initSliderMode();
        window.addEventListener('resize', initSliderMode);

        if ((window as any)['story_mount']) {

            // if (_app_bottom) {
            //   _app_bottom.$destroy()
            //   window['app_bottom'].innerHTML = null
            // }

            (window as any)['_story_mount'] = createAppBottom(item, onReaderCloseCb)

        }

        if (options?._disableSession === true) {
            needSession = false;
            setNeedSession(needSession);
            store.commit('UPDATE_NEED_SESSION', {needSession: needSession});
            return;
        }

        Session.init(store).then(session => {
        }, error => {
            debug(`init failed with error ${error}`)
        });

    },

    switchToFullScreen: function () {
        if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('switchToFullScreen');
    },
    switchFromFullScreen: function () {
        if ((window as any).cur.Rpc) (window as any).cur.Rpc.callMethod('switchFromFullScreen');
    },
    clearLocalData: function(narrativeId?: number) {
        narrativeId = narrativeId || (window as any).__activeNarrativeId;
        if (narrativeId) {
            sessionStorage.removeItem('narrative_' + narrativeId + '_data')
        }
    },


};


// (<any>global).WStories = WStories;
export {WStories}
