import React from "react";

export enum LeaveEventType {
    LEAVE_BACK,
    LEAVE_CLOSE
}

export type RouterContextState = {
    // current route
    route: {path: string},

    // move to route
    toRoute: (path: string) => void,

    // route leave interceptor
    // cb return true - event intercepted && propagation stop
    // cb return false - continue event
    registerLeaveEventInterceptor: (cb: (type: LeaveEventType) => boolean) => void,

    // route leave interceptor
    unregisterLeaveEventInterceptor: () => void,

    // pauseUI (from SDK or inner activity)
    pauseUI: () => void,

    // resumeUI (from SDK or inner activity)
    resumeUI: () => void,

    // event for activity
    registerOnPauseUI: (cb: () => void) => void,

    // event for activity
    registerOnResumeUI: (cb: () => void) => void,

    // navigateBack
    back: () => void,
    close: () => void,

};

export const RouterContext = React.createContext({} as RouterContextState);
