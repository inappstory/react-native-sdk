import {Store} from "vuex";
import RootState from "~/src/stories_widget/store/rootState";
import {debug} from "./debug";

export const isProduction = process.env.NODE_ENV === 'production';

let _needSession: boolean = true;

export function setNeedSession(value: boolean) {
    debug(value)
    _needSession = value;
}

export function needSession(): boolean {
    debug(_needSession)
        return _needSession;
}


