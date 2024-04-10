import Vue from "vue";
import {GetterTree, Module as VuexModule} from "vuex";
import RootState from "./rootState";
import Article from "../models/Article";
import IssueArticle from "../models/IssueArticle";


export interface ArticleState {
    articles: Array<Article>;
    issueArticles: Array<IssueArticle>;
    articlesIds: Array<number>;
    issueArticlesIds: Array<number>;
}

interface ArticleAction {
    commit: any;
    state: ArticleState;
}

const module: VuexModule<ArticleState, RootState> = {
    namespaced: true,
    state: {
        articles: [],
        issueArticles: [],
        articlesIds: [],
        issueArticlesIds: [],
    },
    getters: {

        articles: (state: ArticleState, getters: GetterTree<ArticleState, RootState>): Array<Article> => {
            return state.articlesIds.map((id: number) => state.articles[id]).filter((_: any) => _)
        },

        issueArticles: (state: ArticleState, getters: GetterTree<ArticleState, RootState>): Array<IssueArticle> => {
            return state.issueArticlesIds.map((id: number) => state.issueArticles[id]).filter((_: any) => _)
        }

        // // deviceId: state => state.deviceId,
        // storyId: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): number | null => state.storyId,
        // activeStories: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => {
        //     return state.storiesIds.map((id: number) => state.stories[id]).filter((_: any) => _)
        //     // return state.stories.filter(_ => _)
        //
        //     //return state.stories;
        // },
        // activeStoriesIds(state: StoriesState) {
        //     return state.storiesIds;
        // },
        // loadedStories: (state: StoriesState, getters: GetterTree<StoriesState, RootState>) => { // todo объединить , просто при загрузке данных stories - добавлять их к оснонвому хранидищзу
        //     return state.storiesIds.map((id: number) => state.stories[id])
        //     // filter убирает все undefined из массива
        //     // return getters.activeStoriesIds.map(id => state.storiesData[id]).filter(_ => _)
        // },
        // items: (state: StoriesState) => state.stories,
        //
        // activeStoryIndex: (state: StoriesState, getters: GetterTree<StoriesState, RootState>): number | null => state.activeStoryIndex

    },
    /** ns https://morningstar.engineering/managing-your-vue-js-applications-state-with-vuex-part-2-5e5c3a0cd507 */
    /** https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit */

    // synchronous and freeze frontend
    mutations: {

        // setOptions: (state: StoriesState, options: IWidgetStoriesOptions) => {
        //     state.options = options;
        // },
        //
        // setSharedShowStoriesView: (state: StoriesState, status: boolean) => {
        //     if (isBoolean(status)) {
        //         state.showStoriesView = status;
        //     } else {
        //         // debug msg
        //     }
        // },
        //
        // setStoriesSlides: (state: StoriesState, models: Array<StoriesItem>) => {
        //     for (let key in models) {
        //         let item = models[key];
        //         if (item) {
        //             item.slidesLoaded = true;
        //             Vue.set(state.stories, item.id, item);
        //             // state.storiesIds.push(item.id)
        //         }
        //     }
        // },
        //
        // setStories: (state: StoriesState, models: Array<StoriesItem>) => {
        //     for (let key in models) {
        //         // let item: StoriesItem = StoriesItem.createInstance(StoriesItem, stories[key]);
        //         let item = models[key];
        //         if (item) {
        //             Vue.set(state.stories, item.id, item);
        //             state.storiesIds.push(item.id)
        //         }
        //
        //
        //     }
        //
        // },
        //
        // SET_ACTIVE_STORY: (state: StoriesState, id: number) => {
        //     state.storyId = id;
        //     state.showStoriesView = true
        // },
        //
        // UPDATE_STORIES_ACTIVE_INDEX: (state: StoriesState, activeStoryIndex) => {
        //     state.activeStoryIndex = activeStoryIndex
        // },

        SET_ARTICLES: (state: ArticleState, models: Array<Article>) => {
            for (let key in models) {
                let item = models[key];
                if (item) {
                    Vue.set(state.articles, item.id, item);
                    state.articlesIds.push(item.id)
                }
            }
        },

        SET_ISSUE_ARTICLES: (state: ArticleState, models: Array<IssueArticle>) => {
            for (let key in models) {
                let item = models[key];
                if (item) {
                    Vue.set(state.issueArticles, item.id, item);
                    state.issueArticlesIds.push(item.id)
                }
            }
        },


    },
    // async
    actions: {

        FETCH_ARTICLES: ({commit, state}: ArticleAction, ids: Array<number>) => {

            const now = new Date().getTime();

            ids = ids.filter(id => {
                // const item = state.storiesData[id]
                // if (!item) {
                //     return true
                // }
                const item = state.articles[id];
                if (item !== undefined && now - item.receiveTime > 1000 * 60 * 60) { // 1 hour
                    return true
                } else if (item === undefined) {
                    return true;
                }

                return false
            });



            if (ids.length > 0) {
                return Article.fetchAll(ids).then(items => commit('SET_ARTICLES', items))
            } else {
                return Promise.resolve()
            }

        },

        FETCH_ISSUE_ARTICLES: ({commit, state}: ArticleAction, ids: Array<number>) => {

            const now = new Date().getTime();

            ids = ids.filter(id => {
                // const item = state.storiesData[id]
                // if (!item) {
                //     return true
                // }
                const item = state.issueArticles[id];
                if (item !== undefined && now - item.receiveTime > 1000 * 60 * 60) { // 1 hour
                    return true
                } else if (item === undefined) {
                    return true;
                }


                return false
            });

            if (ids.length > 0) {
                return IssueArticle.fetchAll(ids).then(items => commit('SET_ISSUE_ARTICLES', items))
            } else {
                return Promise.resolve()
            }

        },


        // emailupdate(context, email) {
        //     context.commit('updatemail', email);
        // },
        // updateDeviceId(context, deviceId) {
        //     context.commit('updateDeviceId', deviceId);
        // }
        //
        //
        //
        //
        // /** загрузка всей стркутуры данных stories */
        // FETCH_STORY: ({commit, state}: StoriesAction, id: number) => {
        //     // если story не загружена или нету слайдов
        //     if (!state.stories[id] || !state.stories[id].slidesLoaded) {
        //         return StoriesItem.fetch(id).then((val) => commit('setStoriesSlides', [val]));
        //     } else {
        //         return Promise.resolve();
        //     }
        //
        //
        //     // if (!state.storiesData[id]) {
        //     // return StoriesItem.fetch(id).then((val) => commit('setStoriesSlides', [val]));
        //     // } else {
        //     //     return Promise.resolve()
        //     // }
        // },
        //
        // /**
        //  * Список нарративов без слайдов
        //  * @param commit
        //  * @param state
        //  * @constructor
        //  */
        // FETCH_STORIES: ({commit, state}: StoriesAction) => {
        //     return StoriesItem.fetchList().then((dataProvider) => {
        //         // commit('SET_STORIES', { stories: val });
        //         commit('setStories', dataProvider.models);
        //     })
        // },
        //
        // /**
        //  * Загружает сразу все нарратиавы со слайдами (по одному)
        //  * @param commit
        //  * @param state
        //  * @param ids
        //  * @constructor
        //  */
        // FETCH_STORIES_SLIDES: ({commit, state}: StoriesAction, ids: Array<number>) => {
        //
        //     console.log('FETCH_STORIES_SLIDES')
        //     console.dir(ids)
        //
        //     const now = new Date().getTime();
        //
        //     ids = ids.filter(id => {
        //         // const item = state.storiesData[id]
        //         // if (!item) {
        //         //     return true
        //         // }
        //         const item = state.stories[id];
        //         if (now - item.receiveTime > 1000 * 60 * 60) { // 1 hour
        //             return true
        //         }
        //
        //         if (!item.slidesLoaded) {
        //             return true;
        //         }
        //
        //         return false
        //     });
        //     console.dir(ids)
        //
        //     if (ids.length > 0) {
        //         return StoriesItem.fetchWithSlides(ids).then(items => commit('setStoriesSlides', items))
        //     } else {
        //         return Promise.resolve()
        //     }
        //
        // },
        //
        // UPDATE_STORIES_ACTIVE_INDEX: ({commit, state}: StoriesAction, activeStoryIndex) => commit('UPDATE_STORIES_ACTIVE_INDEX', activeStoryIndex)
        //

    }
};

export default module;