import {GetterTree, Module as VuexModule} from "vuex";
import RootState from "./rootState";
import {Session} from "~/src/stories_widget/models/Session";

export interface StatisticsState {
    lastIndex: number;
    data: Array<any>;

    session: string;
}

interface StatisticsAction {
    commit: any;
    state: StatisticsState;
}

const module: VuexModule<StatisticsState, RootState> = {
    namespaced: true,
    state: {
        session: '',
        lastIndex: 0,
        data: []
    },
    getters: {

        data: (state: StatisticsState, getters: GetterTree<StatisticsState, RootState>): Array<any> => state.data,
        lastInsertedIndex: (state: StatisticsState, getters: GetterTree<StatisticsState, RootState>): number => state.lastIndex - 1,
    },
    /** ns https://morningstar.engineering/managing-your-vue-js-applications-state-with-vuex-part-2-5e5c3a0cd507 */
    /** https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit */

    // synchronous and freeze frontend
    mutations: {

        PUT_STORIES_STAT: (state: StatisticsState, {action, storyId, slideIndex, slideDuration}: any) => {
            state.data.push([
                action,
                state.lastIndex,
                storyId,
                slideIndex,
                slideDuration
            ]);
            state.lastIndex++
        },

        PUT_STORIES_ARTICLE_STAT: (state: StatisticsState, {action, associatedEventIndex, id, spendTime}: any) => {
            state.data.push([
                action,
                state.lastIndex,
                associatedEventIndex,
                id,
                spendTime
            ]);
            state.lastIndex++
        },

        UPDATE_STORIES_STAT: (state: StatisticsState, dataLength: number) => {
            for (let i = 0; i < dataLength; ++i) {
                state.data.shift()
            }
        },

    },

    // async
    actions: {

        FLUSH_STORIES_STAT: ({commit, state}, {storyManagerProxy, data, dataLength}) => {



          return storyManagerProxy('updateStoriesStat', {data}).then((val: any) => commit('UPDATE_STORIES_STAT', dataLength))
        },

        FLUSH_STORIES_STAT_ON_CLOSE: ({commit, state}, {storyManagerProxy, data, dataLength}) => {
            // don`t use close more
            // just send data on reader close
            return storyManagerProxy('updateStoriesStat', {data}).then((val: any) => commit('UPDATE_STORIES_STAT', dataLength))
        },



    }
};

export default module;
