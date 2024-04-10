// import isNumber from 'lodash/isNumber'
import {Module as VuexModule} from "vuex";
import RootState from "./rootState";
import {Session} from "~/src/stories_widget/models/Session";
import Vue from "vue";
import {debug} from "~/src/stories_widget/util/debug";
import ProjectResourceCacheSet from "~/src/stories_widget/models/ProjectResourceCacheSet";

export interface SessionState {
    id: string | null;
    expire_in: number | null;
    closed: boolean;
    _receiveTime: number | null;
    _serverTimestamp: number | null;
    _projectResourceCache: Nullable<ProjectResourceCacheSet>;
    _placeholders: Dict;
}

const module: VuexModule<SessionState, RootState> = {
    namespaced: true,
    state: {
        id: null,
        expire_in: null,
        closed: false,
        _receiveTime: null,
        _serverTimestamp: null,
        _projectResourceCache: null,
        _placeholders: {}

    },
    getters: {
        session: (state: SessionState): SessionState => state,
        id: (state: SessionState) => {
            debug(state);
            return state.id
        },
        expireIn: (state: SessionState) => state.expire_in,
        isExpired: (state: SessionState) => state.expire_in === null ? true : state.expire_in >= new Date().getTime()
    },
    /** ns https://morningstar.engineering/managing-your-vue-js-applications-state-with-vuex-part-2-5e5c3a0cd507 */
    /** https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit */
    // synchronous and freeze frontend
    mutations: {
        update(state, session: Session) {

            // Vue.set(state.stories, item.id, item);
            // state.storiesIds.push(item.id)

            // Vue.set()
            // state = session;

            Object.keys(session).forEach(key => {
                (<any>state)[key] = (<any>session)[key]
            })

            // state = Object.assign({}, state, Session);

            // state.id = session.id;
            // state.expire_in = session.expire_in;
        },
    },
    actions: {
        set(context, session: Session) {
            context.commit('update', session);
        },
    }
};

export default module;
