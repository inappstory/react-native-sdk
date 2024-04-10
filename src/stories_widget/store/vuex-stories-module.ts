import Vue from "vue";
import StoriesItem from "../models/StoriesItem";
import {GetterTree, Module as VuexModule} from "vuex";
import RootState from "./rootState";
import NarrativeContext from "../models/NarrativeContext";
import AbstractModel from "../models/AbstractModel";
import {debug} from "../util/debug";
import {STORY_LIST_TYPE} from "../../story-manager/common.h";
import {Option} from "../../../global.h";
import {StoryFavoriteReaderOptions, StoryFavoriteReaderOptionsDefault} from "../../story-manager/storyFavoriteReader.h";
import {AppearanceCommonOptions, AppearanceCommonOptionsDefault} from "../../story-manager/appearanceCommon.h";
import {StoryReaderOptions, StoryReaderOptionsDefault} from "../../widget-story-reader/index.h";
import {isNumber} from "../../helpers/isNumber";
import {isBoolean} from "../../helpers/isBoolean";
import {mergeObjects} from "../../helpers/mergeObjects";
import {head} from "../../helpers/head";

export interface StoriesState {
  stories: Map<number, StoriesItem>;
  storiesIds: Array<number>; // зависимость от типа списка
  storiesContext: NarrativeContext | null;

  storyId: number | null;
  showStoriesView: boolean;

  activeStoryIndex: number | null;
  activeSlideElementQuiz: any;
  activeSlideElementQuizGrouped: any;
  activeSlideElementTest: any;
  activeSlideElementQuest: any;
    activeSlideElementDateCountdown: any;
    activeSlideElementRangeSlider: any;
    activeSlideDisableNavigation: boolean;
  modeDesktop: boolean;

  options: StoryReaderOptions & {appearanceCommon: AppearanceCommonOptions};
  favoriteOptions: StoryFavoriteReaderOptions;

  hasShare: boolean;
  platform: "android" | "ios" | "unknown";

  muted: boolean;
  nextFlippingStoryId: Option<number>;
  activeListType: STORY_LIST_TYPE;
  sliderWidth: Option<number>;
  showStoriesFavoriteReader: boolean;
}


interface StoriesAction {
  commit: any;
  state: StoriesState;
}

const module: VuexModule<StoriesState, RootState> = {
  namespaced: true,
  state: {

    stories: new Map(), // Map
    storiesIds: [],
    storiesContext: null,

    storyId: null,
    showStoriesView: false,
    activeStoryIndex: null,
    activeSlideElementQuiz: undefined,
    activeSlideElementQuizGrouped: undefined,
    activeSlideElementTest: undefined,
    activeSlideElementQuest: undefined,
      activeSlideElementDateCountdown: undefined,
      activeSlideElementRangeSlider: undefined,
      activeSlideDisableNavigation: false,
    modeDesktop: false,

    hasShare: false,
      platform: "unknown",

    options: {...StoryReaderOptionsDefault, appearanceCommon: AppearanceCommonOptionsDefault},
    favoriteOptions: StoryFavoriteReaderOptionsDefault,


    muted: true,


    nextFlippingStoryId: null,
    activeListType: STORY_LIST_TYPE.default,
    sliderWidth: null,
    showStoriesFavoriteReader: false,
  },
  getters: {
    options: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options,

    readerOptions: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options,

    transformStyle: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options.scrollStyle,
    closeButtonPosition: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options.closeButtonPosition,

    hasLike: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options.appearanceCommon.hasLike,
    hasLikeButton: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options.appearanceCommon.hasLikeButton,
    hasDislikeButton: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options.appearanceCommon.hasDislikeButton,
    hasFavorite: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.options.appearanceCommon.hasFavorite,
    hasShare: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): boolean => state.hasShare,
    platform: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): StoriesState["platform"] => state.platform,

    // deviceId: state => state.deviceId,
    storyId: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): number | null => state.storyId,
    activeStories: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => {
      return state.storiesIds.map((id: number) => state.stories.get(id)).filter((item?: StoriesItem) => item && item.hide_in_reader !== true)
    },
    activeStoriesIds: (state: StoriesState): Array<number> => {
      return state.storiesIds;
    },
    firstActiveStoryId: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): number | null => {
      const value = head(state.storiesIds);
      if (isNumber(value)) {
        return value;
      }
      return null;
    },

    loadedStories: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => { // todo объединить , просто при загрузке данных stories - добавлять их к оснонвому хранидищзу
      return state.storiesIds.map((id: number) => state.stories.get(id))
      // filter убирает все undefined из массива
      // return getters.activeStoriesIds.map(id => state.storiesData[id]).filter(_ => _)
    },


    // общий список всех сторис
    items: (state: StoriesState) => state.stories,

    activeStoryIndex: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): number | null => state.activeStoryIndex,

    activeSlideElementQuiz: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.activeSlideElementQuiz,
    activeSlideElementQuizGrouped: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.activeSlideElementQuizGrouped,
    activeSlideElementTest: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.activeSlideElementTest,
    activeSlideElementQuest: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.activeSlideElementQuest,
      activeSlideElementDateCountdown: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.activeSlideElementDateCountdown,
      activeSlideElementRangeSlider: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.activeSlideElementRangeSlider,
      activeSlideDisableNavigation: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.activeSlideDisableNavigation,

    modeDesktop: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): boolean => state.modeDesktop,

    storiesContext: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): NarrativeContext | null => state.storiesContext,

    muted: (state: StoriesState): boolean => state.muted,
    nextFlippingStoryId: (state: StoriesState): Option<number> => state.nextFlippingStoryId,

    sliderWidth: (state: StoriesState): Option<number> => state.sliderWidth,
    showStoriesFavoriteReader: (state: StoriesState): boolean => state.showStoriesFavoriteReader,

    favoriteOptions: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => state.favoriteOptions,
  },
  /** ns https://morningstar.engineering/managing-your-vue-js-applications-state-with-vuex-part-2-5e5c3a0cd507 */
  /** https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit */

  // synchronous and freeze frontend
  mutations: {

    setOptions: (state: StoriesState, options: StoryReaderOptions) => {
      state.options = mergeObjects(state.options, options);
    },
    setFavoriteOptions: (state: StoriesState, options: StoryFavoriteReaderOptions) => {
      state.favoriteOptions = mergeObjects(state.favoriteOptions, options);
    },

    setHasShare: (state: StoriesState, status: boolean) => {
      if (isBoolean(status)) {
        state.hasShare = status;
      } else {
        // debug msg
      }
    },

    setPlatform: (state: StoriesState, platform: "android" | "ios" | "unknown") => {
        state.platform = platform;
    },

    setSharedShowStoriesView: (state: StoriesState, status: boolean) => {
      if (isBoolean(status)) {
        state.showStoriesView = status;
      } else {
        // debug msg
      }
    },

    setStoriesSlides: (state: StoriesState, models: Array<StoriesItem>) => {
      for (let key in models) {
        let item = models[key];
        if (item) {
          item.slidesLoaded = true;
          Vue.set(state.stories, item.id, item);
          // state.storiesIds.push(item.id)
        }
      }
    },


    setStories: (state: StoriesState, {
      listType,
      storyList
    }: { listType: STORY_LIST_TYPE, storyList: Array<Dict<any>> }) => {
      // clone
      const stories = new Map(state.stories);
      const ids: Array<number> = [];

      storyList.forEach(item => {
        // if (!state.storiesIds[STORY_LIST_TYPE.default].includes(item.id)) {
        stories.set(item.id, AbstractModel.createInstance(StoriesItem, item));
        ids.push(item.id);
        // }
      });
      Vue.set(state, 'stories', stories);
      state.storiesIds = ids;
      state.activeListType = listType;
    },


    setStoriesContext: (state: StoriesState, model: NarrativeContext | Dict<any>) => {
      // activeListType ???
      state.storiesContext = !(model instanceof NarrativeContext) ? AbstractModel.createInstance(NarrativeContext, model.rawData) : model;
    },

    SET_ACTIVE_STORY: (state: StoriesState, id: number) => {
      state.storyId = id;
      state.showStoriesView = true;
    },

    UPDATE_STORIES_ACTIVE_INDEX: (state: StoriesState, activeStoryIndex) => {
      state.activeStoryIndex = activeStoryIndex;
    },

    SET_ACTIVE_ELEMENT_QUIZ: (state: StoriesState, activeSlideElementQuiz) => {
      state.activeSlideElementQuiz = activeSlideElementQuiz;
    },
    SET_ACTIVE_ELEMENT_QUIZ_GROUPED: (state: StoriesState, activeSlideElementQuiz) => {
      state.activeSlideElementQuizGrouped = activeSlideElementQuiz;
    },
    SET_ACTIVE_ELEMENT_TEST: (state: StoriesState, activeSlideElementTest) => {
      state.activeSlideElementTest = activeSlideElementTest;
    },
    SET_ACTIVE_ELEMENT_QUEST: (state: StoriesState, activeSlideElementQuest) => {
      state.activeSlideElementQuest = activeSlideElementQuest;
    },

      SET_ACTIVE_ELEMENT_DATE_COUNTDOWN: (state: StoriesState, activeSlideElementDateCountdown) => {
          state.activeSlideElementDateCountdown = activeSlideElementDateCountdown;
      },
      SET_ACTIVE_ELEMENT_RANGE_SLIDER: (state: StoriesState, activeSlideElementRangeSlider) => {
          state.activeSlideElementRangeSlider = activeSlideElementRangeSlider;
      },
      SET_ACTIVE_SLIDE_DISABLE_NAVIGATION: (state: StoriesState, activeSlideDisableNavigation) => {
          state.activeSlideDisableNavigation = activeSlideDisableNavigation;
      },

    ENABLE_DESKTOP_MODE: (state: StoriesState) => {
      state.modeDesktop = true;
    },
    DISABLE_DESKTOP_MODE: (state: StoriesState) => {
      state.modeDesktop = false;
    },

    setStoryLike: (state: StoriesState, {id, like}) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.like = like;
        Vue.set(state, 'stories', stories);
      }
    },

    setStoryFavorite: (state: StoriesState, {id, favorite}) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.favorite = Boolean(favorite);
        Vue.set(state, 'stories', stories);
      }
    },

    setStorySharePath: (state: StoriesState, {id, path}) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.sharePath = path;
        Vue.set(state, 'stories', stories);
      }
    },

    setMuted: (state: StoriesState, value: boolean) => {
      state.muted = value;
    },

    setNextFlippingStory: (state: StoriesState, value: Option<number>) => {
      state.nextFlippingStoryId = value;
    },

    // setOnboardingStories: (state: StoriesState, models: Array<StoriesItem>) => {
    //     for (let key in models) {
    //         // let item: StoriesItem = StoriesItem.createInstance(StoriesItem, stories[key]);
    //         let item = models[key];
    //
    //         // списки - делать мапой с двумя ключами - для stories и для onboarding
    //         if (item && state.storiesIds[STORY_LIST_TYPE.onboarding].indexOf(item.id) === -1) {
    //             if (!state.stories.get(item.id)) {
    //                 Vue.set(state.stories, item.id, item);
    //             }
    //             state.storiesIds[STORY_LIST_TYPE.onboarding].push(item.id)
    //         }
    //
    //         // debug(item)
    //
    //     }
    //
    //
    //     // if (isArray(stories)) {
    //     //     stories.forEach(item => {
    //     //         if (item) {
    //     //             Vue.set(state.stories, item.id, item)
    //     //
    //     //             state.lists['stories'].push(item.id)
    //     //
    //     //         }
    //     //     })
    //     // }
    //
    // },
    //
    // setFavoriteStories: (state: StoriesState, models: Array<StoriesItem>) => {
    //     const ids = models.map(item => item.id);
    //     models.forEach(item => Vue.set(state.stories, item.id, item));
    //     Vue.set(state.storiesIds, STORY_LIST_TYPE.favorite, ids);
    // },
    //
    // // part update of list
    // updateFavoriteStoriesList: (state: StoriesState, {id, favorite}) => {
    //     console.log('updateFavoriteStoriesList', {id, favorite});
    //     if (favorite && state.storiesIds[STORY_LIST_TYPE.favorite].indexOf(id) === -1) {
    //         const ids = [id, ...state.storiesIds[STORY_LIST_TYPE.favorite]];
    //         Vue.set(state.storiesIds, STORY_LIST_TYPE.favorite, ids);
    //         console.log('updateFavoriteStoriesList', {id, action: 'unshift'}, state.storiesIds[STORY_LIST_TYPE.favorite]);
    //     } else if (!favorite && state.storiesIds[STORY_LIST_TYPE.favorite].indexOf(id) !== -1) {
    //         const ids = state.storiesIds[STORY_LIST_TYPE.favorite].filter(value => value !== id);
    //         Vue.set(state.storiesIds, STORY_LIST_TYPE.favorite, ids);
    //         console.log('updateFavoriteStoriesList', {id, action: 'delete'}, state.storiesIds[STORY_LIST_TYPE.favorite]);
    //     }
    // },


    SET_STORY_LIST_TYPE: (state: StoriesState, type: STORY_LIST_TYPE) => {
      state.activeListType = type;
    },
    setSliderWidth: (state: StoriesState, sliderWidth: number) => {
      state.sliderWidth = sliderWidth;
    },
    setShowStoriesFavoriteReader: (state: StoriesState, value: boolean) => {
      state.showStoriesFavoriteReader = value;
    },
    setStoryOpened: (state: StoriesState, {id, value}: {id: number, value: boolean }) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.isOpened = value;
        Vue.set(state, 'stories', stories);
      }
    },

  },

  // async
  actions: {
    // emailupdate(context, email) {
    //     context.commit('updatemail', email);
    // },
    // updateDeviceId(context, deviceId) {
    //     context.commit('updateDeviceId', deviceId);
    // }

    /** загрузка всей стркутуры данных stories */
    FETCH_STORY: ({commit, state}: StoriesAction, id: number) => {
      return ;
    },

    /**
     * Список нарративов без слайдов
     * @param commit
     * @param state
     * @constructor
     */
    FETCH_STORIES: ({commit, state}: StoriesAction) => {
      return ;
    },

    /**
     * Загружает сразу все нарратиавы со слайдами (по одному)
     * @param commit
     * @param state
     * @param ids
     * @constructor
     */
    FETCH_STORIES_SLIDES: ({commit, state}: StoriesAction, ids: Array<number>) => {

      debug('FETCH_STORIES_SLIDES');
      debug(ids);
      return ;

    },

    UPDATE_STORIES_ACTIVE_INDEX: ({
                                    commit,
                                    state
                                  }: StoriesAction, activeStoryIndex) =>
      commit('UPDATE_STORIES_ACTIVE_INDEX', activeStoryIndex),

    SET_ACTIVE_ELEMENT_QUIZ: ({
                                commit,
                                state
                              }: StoriesAction, activeSlideElementQuiz) =>
      commit('SET_ACTIVE_ELEMENT_QUIZ', activeSlideElementQuiz),
    SET_ACTIVE_ELEMENT_QUIZ_GROUPED: ({
                                        commit,
                                        state
                                      }: StoriesAction, activeSlideElementQuiz) =>
      commit('SET_ACTIVE_ELEMENT_QUIZ_GROUPED', activeSlideElementQuiz),
    SET_ACTIVE_ELEMENT_TEST: ({
                                commit,
                                state
                              }: StoriesAction, activeSlideElementTest) =>
      commit('SET_ACTIVE_ELEMENT_TEST', activeSlideElementTest),
    SET_ACTIVE_ELEMENT_QUEST: ({
                                 commit,
                                 state
                               }: StoriesAction, activeSlideElementQuest) =>
      commit('SET_ACTIVE_ELEMENT_QUEST', activeSlideElementQuest),

      SET_ACTIVE_ELEMENT_DATE_COUNTDOWN: ({
                                              commit,
                                              state
                                          }: StoriesAction, activeSlideElementDateCountdown) =>
          commit('SET_ACTIVE_ELEMENT_DATE_COUNTDOWN', activeSlideElementDateCountdown),

      SET_ACTIVE_ELEMENT_RANGE_SLIDER: ({
                                            commit,
                                            state
                                        }: StoriesAction, activeSlideElementRangeSlider) =>
          commit('SET_ACTIVE_ELEMENT_RANGE_SLIDER', activeSlideElementRangeSlider),

      SET_ACTIVE_SLIDE_DISABLE_NAVIGATION: ({
                                                commit,
                                                state
                                            }: StoriesAction, activeSlideDisableNavigation) =>
          commit('SET_ACTIVE_SLIDE_DISABLE_NAVIGATION', activeSlideDisableNavigation),



      UPDATE_STORY_OPENED: ({
                            commit,
                            state
                          }: StoriesAction, payload: {storyManagerProxy: Function, id: number, value: boolean }) => {

      payload.storyManagerProxy('setStoryOpened', {id: payload.id});
      commit('setStoryOpened', payload);
    },


    UPDATE_STORY_FAVORITE_INTERNAL: ({commit, state}: StoriesAction, payload: { id: number, value: boolean }) => {
      commit('setStoryFavorite', {id: payload.id, favorite: payload.value});
      commit('updateFavoriteStoriesList', {id: payload.id, favorite: payload.value});
    },

    /**
     * Контекст для всех нарративов из списка
     * @param commit
     * @param state
     * @param ids
     * @constructor
     */
    FETCH_STORIES_CONTEXT: ({commit, state}: StoriesAction, ids: Array<number>) => {
      // todo могут быть разные ids для разных списков
      if (!state.storiesContext) {
        return NarrativeContext.fetch(ids).then((val) => {
          commit('setStoriesContext', val);
        })
      } else {
        return Promise.resolve();
      }
    },

    UPDATE_STORY_LIKE: ({commit, state}: StoriesAction, {storyManagerProxy, id, like}) => {
      storyManagerProxy('updateStoryLike', {listType: state.activeListType, id, like})
        .then((data: any) => {
          if (data.like !== undefined) {
            commit('setStoryLike', {id, like: data.like})
          }

        }, () => {
          // api or network error
        })
    },

    UPDATE_STORY_FAVORITE: ({commit, state}: StoriesAction, {storyManagerProxy, id, favorite}) => {
      return new Promise((resolve, reject) => {
        const story = state.stories.get(id);
        if (story) {
          const prevState = story.favorite;
          commit('setStoryFavorite', {id, favorite});
          // commit('updateFavoriteStoriesList', {id, favorite});

          storyManagerProxy('updateStoryFavorite', {listType: state.activeListType, id, favorite}).then((data: any) => {
            if (data.favorite !== undefined) {
              commit('setStoryFavorite', {id, favorite: Boolean(data.favorite)});

              // update list
              // commit('updateFavoriteStoriesList', {id, favorite: Boolean(data.favorite)});
              resolve(data.favorite);
            } else {
              // return prev state
              commit('setStoryFavorite', {id, favorite: prevState});
              // commit('updateFavoriteStoriesList', {id, favorite: prevState});
              reject(new Error('Bad response from server'));
            }
          }, (e: any) => {
            // api or network error

            // return prev state
            commit('setStoryFavorite', {id, favorite: prevState});
            // commit('updateFavoriteStoriesList', {id, favorite: prevState});
            reject(e);
          })
        } else {
          reject(new Error('Story not found in state'));
        }
      });

    },

    GET_SHARE_PATH: ({commit, state}: StoriesAction, {storyManagerProxy, id}: {storyManagerProxy: Function, id: number}) => {
      return storyManagerProxy('getStorySharePath', {listType: state.activeListType, id}).then((data: any) => {
        if (data.url !== undefined) {
          commit('setStorySharePath', {id, path: data.url})
        }

      }, () => {
        // api or network error
      })
    },

    MUTE: ({commit, state}: StoriesAction) => commit('setMuted', true),
    UNMUTE: ({commit, state}: StoriesAction) => commit('setMuted', false),

  }
};

export default module;
