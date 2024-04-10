import Vue from "vue";
import StoriesItem from "../models/StoriesItem";
import {GetterTree, Module as VuexModule} from "vuex";
import RootState from "./rootState";
import AbstractModel from "../models/AbstractModel";
import {debug} from "../util/debug";
import {Session} from "../models/Session";
import {STORY_LIST_TYPE} from "../../story-manager/common.h";
import {Option} from "../../../global.h";
import {StoriesListOptions, StoriesListOptionsDefault} from "../../widget-stories-list/index.h";
import {AppearanceCommonOptions, AppearanceCommonOptionsDefault} from "../../story-manager/appearanceCommon.h";
import {isNumber} from "../../helpers/isNumber";
import {isBoolean} from "../../helpers/isBoolean";
import {mergeObjects} from "../../helpers/mergeObjects";
import {head} from "../../helpers/head";



export interface SharedState {
  stories: Map<number, StoriesItem>;
  storiesIds: Array<Array<number>>; // зависимость от типа списка
  storyId: number | null;
  showStoriesView: boolean;
  options: StoriesListOptions & Pick<AppearanceCommonOptions, "hasFavorite">;
  hasShare: boolean;
  activeListType: STORY_LIST_TYPE;
  session: Option<Session>;
}


interface StoriesAction {
  commit: any;
  state: SharedState;
}

const module: VuexModule<SharedState, RootState> = {
  namespaced: true,
  state: {
    stories: new Map(),
    storiesIds: [[], [], []],
    storyId: null,
    showStoriesView: false,
    hasShare: false,
    options: {...StoriesListOptionsDefault, hasFavorite: AppearanceCommonOptionsDefault.hasFavorite},
    activeListType: STORY_LIST_TYPE.default,
    session: null,
  },
  getters: {

    // options: (state: SharedState, getters: GetterTree<SharedState, RootState>): IWidgetStoriesOptions => state.options,
    //
    sliderOptions: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options,
    // readerOptions: (state: SharedState, getters: GetterTree<SharedState, RootState>): ReaderOptions => state.options.reader,
    // favoriteOptions: (state: SharedState, getters: GetterTree<SharedState, RootState>): FavoriteOptions => state.options.favorite,

    storiesGap: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.gap,
    storiesHeight: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.height,

    storiesStyle: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.variant,

    storiesListSidePadding: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.sidePadding,
    storiesListTopPadding: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.topPadding,
    storiesListBottomPadding: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.bottomPadding,
    storiesListBottomMargin: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.bottomMargin,

    storiesBackgroundColor: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.layout.backgroundColor,
      storiesListSliderAlign: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.layout.sliderAlign,

    storiesListItemOptions: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card,
    storiesListItemFavoriteOptions: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.favoriteCard,

    storiesBorderNotReadColor: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.border.color,
    storiesBorderReadColor: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.opened.border.color,
    storiesListBorderNotReadWidth: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.border.width,
    storiesListBorderReadWidth: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.opened.border.width,
    storiesListBorderGapNotRead: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.border.gap,
    storiesListBorderGapRead: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.opened.border.gap,
    storiesListBorderRadiusNotRead: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.border.radius,
    storiesListBorderRadiusRead: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.opened.border.radius,

    storiesListItemBoxShadow: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.boxShadow,
    storiesListItemBoxShadowRead: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.opened.boxShadow,
    storiesListItemOpacity: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.opacity,
    storiesListItemOpacityRead: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.card.opened.opacity,

    //
    // transformStyle: (state: SharedState, getters: GetterTree<SharedState, RootState>): ReaderSwipeStyle => state.options.reader.scrollStyle,
    // closeButtonPosition: (state: SharedState, getters: GetterTree<SharedState, RootState>): ReaderCloseButtonPosition => state.options.reader.closeButtonPosition,
    // hasLike: (state: SharedState, getters: GetterTree<SharedState, RootState>): boolean => state.options.hasLike,
    hasFavorite: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.hasFavorite,
    // hasShare: (state: SharedState, getters: GetterTree<SharedState, RootState>): boolean => state.hasShare,
    //
    storiesListControls: (state: SharedState, getters: GetterTree<SharedState, RootState>) => state.options.navigation.showControls,
    storiesListControlsSize: (state: SharedState, getters: GetterTree<SharedState, RootState>): number => state.options.navigation.controlsSize,
    storiesListControlsBackgroundColor: (state: SharedState, getters: GetterTree<SharedState, RootState>): string => state.options.navigation.controlsBackgroundColor,
    storiesListControlsColor: (state: SharedState, getters: GetterTree<SharedState, RootState>): string => state.options.navigation.controlsColor,


    // deviceId: state => state.deviceId,
    storyId: (state: SharedState, getters: GetterTree<SharedState, RootState>): number | null => state.storyId,
    activeStories: (state: SharedState, getters: GetterTree<SharedState, RootState>) => {
      // console.log('activeStories', state.storiesIds, state.activeListType, state.stories)
      return state.storiesIds[state.activeListType].map((id: number) => state.stories.get(id)).filter((item?: StoriesItem) => item && item.hide_in_reader !== true)
    },
    onboardingActiveStories: (state: SharedState, getters: GetterTree<SharedState, RootState>) => {
      return state.storiesIds[STORY_LIST_TYPE.onboarding].map((id: number) => state.stories.get(id)).filter((item?: StoriesItem) => item && item.hide_in_reader !== true)
    },
    activeStoriesIds: (state: SharedState): Array<number> => {
      return state.storiesIds[state.activeListType];
    },
    onboardingActiveStoriesIds: (state: SharedState): Array<number> => {
      return state.storiesIds[STORY_LIST_TYPE.onboarding];
    },
    firstActiveStoryId: (state: SharedState, getters: GetterTree<SharedState, RootState>): number | null => {
      const value = head(state.storiesIds[state.activeListType]);
      if (isNumber(value)) {
        return value;
      }
      return null;
    },
    loadedStories: (state: SharedState, getters: GetterTree<SharedState, RootState>) => { // todo объединить , просто при загрузке данных stories - добавлять их к оснонвому хранидищзу
      return state.storiesIds[state.activeListType].map((id: number) => state.stories.get(id)).filter(_ => _)
    },
    defaultLoadedStories: (state: SharedState, getters: GetterTree<SharedState, RootState>) => { // todo объединить , просто при загрузке данных stories - добавлять их к оснонвому хранидищзу
        return state.storiesIds[STORY_LIST_TYPE.default].map((id: number) => state.stories.get(id)).filter(_ => _)
    },
    onboardingLoadedStories: (state: SharedState, getters: GetterTree<SharedState, RootState>) => { // todo объединить , просто при загрузке данных stories - добавлять их к оснонвому хранидищзу
      return state.storiesIds[STORY_LIST_TYPE.onboarding].map((id: number) => state.stories.get(id)).filter(_ => _)
    },
    favoriteLoadedStories: (state: SharedState, getters: GetterTree<SharedState, RootState>) => { // todo объединить , просто при загрузке данных stories - добавлять их к оснонвому хранидищзу
      return state.storiesIds[STORY_LIST_TYPE.favorite].map((id: number) => state.stories.get(id)).filter(_ => _)
    },


    // общий список всех сторис
    items: (state: SharedState): Map<number, StoriesItem> => state.stories,
    itemIds: (state: SharedState): Array<Array<number>> => state.storiesIds,

  },
  /** ns https://morningstar.engineering/managing-your-vue-js-applications-state-with-vuex-part-2-5e5c3a0cd507 */
  /** https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit */

  // synchronous and freeze frontend
  // in shared module - payload must be an Object
  mutations: {

    setOptions: (state: SharedState, {options}: { options: StoriesListOptions & Pick<AppearanceCommonOptions, "hasFavorite"> }) => {
      state.options = mergeObjects(state.options, options);
    },

    setHasShare: (state: SharedState, {status}: { status: boolean }) => {
      if (isBoolean(status)) {
        state.hasShare = status;
      } else {
        // debug msg
      }
    },

    // не нужно здесь
    setSharedShowStoriesView: (state: SharedState, {status}: { status: boolean }) => {
      if (isBoolean(status)) {
        state.showStoriesView = status;
      } else {
        // debug msg
      }
    },

    setStoriesSlides: (state: SharedState, {models}: { models: Array<StoriesItem | Dict<any>> }) => {
      const stories = new Map(state.stories);
      const newStories = models.map(item => !(item instanceof StoriesItem) ? AbstractModel.createInstance(StoriesItem, item.rawData) : item);
      newStories.forEach(item => {
        item.slidesLoaded = true;
        stories.set(item.id, item);
      });
      Vue.set(state, 'stories', stories);
    },

    setStories: (state: SharedState, {models}: { models: Array<StoriesItem | Dict<any>> }) => {
      // clone
      const stories = new Map(state.stories);
      // const ids = state.storiesIds[STORY_LIST_TYPE.default].slice(0);
      const ids: Array<number> = [];
      const newStories = models.map(item => !(item instanceof StoriesItem) ? AbstractModel.createInstance(StoriesItem, item.rawData) : item);
      newStories.forEach(item => {
        // if (!state.storiesIds[STORY_LIST_TYPE.default].includes(item.id)) {
        stories.set(item.id, item);
        ids.push(item.id);
        // }
      });
      Vue.set(state, 'stories', stories);
      Vue.set(state.storiesIds, STORY_LIST_TYPE.default, ids);
    },

    // не нужно
    SET_ACTIVE_STORY: (state: SharedState, {id}: { id: number }) => {
      state.storyId = id;
      state.showStoriesView = true;
    },

    setStoryLike: (state: SharedState, {id, like}) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.like = like;
        story.rawData['like'] = story.like;
        Vue.set(state, 'stories', stories);
      }
    },

    setStoryFavorite: (state: SharedState, {id, favorite}) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.favorite = !!favorite;
        story.rawData['favorite'] = story.favorite;
        // stories.set(id, story);
        Vue.set(state, 'stories', stories);
      }
    },

    setStorySharePath: (state: SharedState, {id, path}) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.sharePath = path;
        story.rawData['sharePath'] = story.sharePath;
        Vue.set(state, 'stories', stories);
      }
    },

    setOnboardingStories: (state: SharedState, models: Array<StoriesItem | Dict<any>>) => {
      const stories = new Map(state.stories); // clone
      const ids = state.storiesIds[STORY_LIST_TYPE.onboarding].slice(0);
      const newStories = models.map(item => !(item instanceof StoriesItem) ? AbstractModel.createInstance(StoriesItem, item.rawData) : item);
      newStories.forEach(item => {
        if (!state.storiesIds[STORY_LIST_TYPE.onboarding].includes(item.id)) {
          stories.set(item.id, item);
          ids.push(item.id);
        }
      });
      Vue.set(state, 'stories', stories);
      Vue.set(state.storiesIds, STORY_LIST_TYPE.onboarding, ids);
    },

    setFavoriteStories: (state: SharedState, {models}: { models: Array<StoriesItem | Dict<any>> }) => {
      const stories = new Map(state.stories); // clone
      // const ids = state.storiesIds[STORY_LIST_TYPE.favorite].slice(0);
      const ids: Array<number> = [];
      const newStories = models.map(item => !(item instanceof StoriesItem) ? AbstractModel.createInstance(StoriesItem, item.rawData) : item);
      newStories.forEach(item => {
        // if (!state.storiesIds[STORY_LIST_TYPE.favorite].includes(item.id)) {
        stories.set(item.id, item);
        ids.push(item.id);
        // }
      });
      Vue.set(state, 'stories', stories);
      Vue.set(state.storiesIds, STORY_LIST_TYPE.favorite, ids);
    },

    // part update of list
    updateFavoriteStoriesList: (state: SharedState, {id, favorite}) => {
      if (favorite && state.storiesIds[STORY_LIST_TYPE.favorite].indexOf(id) === -1) {
        const ids = [id, ...state.storiesIds[STORY_LIST_TYPE.favorite]];
        Vue.set(state.storiesIds, STORY_LIST_TYPE.favorite, ids);
      } else if (!favorite && state.storiesIds[STORY_LIST_TYPE.favorite].indexOf(id) !== -1) {
        const ids = state.storiesIds[STORY_LIST_TYPE.favorite].filter(value => value !== id);
        Vue.set(state.storiesIds, STORY_LIST_TYPE.favorite, ids);
      }
    },


    setStoryListType: (state: SharedState, {type}: { type: STORY_LIST_TYPE }) => {
      state.activeListType = type;
    },
    setStoryOpened: (state: SharedState, {id, value}: { id: number, value: boolean }) => {
      const stories = new Map(state.stories);
      let story = stories.get(id);
      if (story !== undefined) {
        story.isOpened = value;
        Vue.set(state, 'stories', stories);
      }
    },

    setSession: (state: SharedState, {session}: { session: Session | Dict<any> }) => {
      if (session instanceof Session) {
        state.session = session;
      } else {
        state.session = AbstractModel.createInstance(Session, session.rawData);
      }

    },
  },

  // async
  actions: {

    /** загрузка всей стркутуры данных stories */
    FETCH_STORY: ({commit, state}: StoriesAction, id: number) => {
      return new Promise((resolve, reject) => {
        resolve();


      });
    },

    /**
     * Список нарративов без слайдов
     * @param commit
     * @param state
     * @constructor
     */
    FETCH_STORIES: ({commit, state}: StoriesAction) => {
      return new Promise((resolve, reject) => {
        resolve();
      });
    },

    /**
     * Список избранных сторис
     * @param commit
     * @param state
     * @constructor
     */
    FETCH_FAVORITE_STORIES: ({commit, state}: StoriesAction) => {
      return new Promise((resolve, reject) => {
        resolve();
      });
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
      return;
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


    UPDATE_STORY_OPENED: ({
                            commit,
                            state
                          }: StoriesAction, payload: { id: number, value: boolean }) =>
      commit('setStoryOpened', payload),


    // не нужно
    UPDATE_STORY_FAVORITE_INTERNAL: ({commit, state}: StoriesAction, payload: { id: number, value: boolean }) => {
      commit('setStoryFavorite', {id: payload.id, favorite: payload.value});
      commit('updateFavoriteStoriesList', {id: payload.id, favorite: payload.value});
    },


    UPDATE_STORY_LIKE: ({commit, state}: StoriesAction, {id, like}) => {
      StoriesItem.update(`story-like/${id}`, {value: like}).then((data: any) => {
        if (data.like !== undefined) {
          commit('setStoryLike', {id, like: data.like})
        }

      }, () => {
        // api or network error
      })
    },

    GET_SHARE_PATH: ({commit, state}: StoriesAction, {id}) => {
      return StoriesItem.update(`story-share/${id}`, {}, 'get').then((data: any) => {
        if (data.url !== undefined) {
          commit('setStorySharePath', {id, path: data.url})
        }

      }, () => {
        // api or network error
      })
    },


  }
};

export default module;
