import React from "react";
import {LeaveEventType, RouterContext, RouterContextState} from "./context"
import {Route} from "./route";
import {Link} from "./link";
import isFunction from "lodash/isFunction";

// TODO hook api
// https://stackoverflow.com/questions/37949981/call-child-method-from-parent

type State = {
    defaultRoute: { path: string },
    route: { path: string },
    toRoute: (path: string) => {},
    registerLeaveEventInterceptor: (cb: (type: LeaveEventType) => boolean) => void,
    unregisterLeaveEventInterceptor: () => void,
    onInterceptLeaveEventCb: Option<(type: LeaveEventType) => boolean>,
    pausedUI: boolean,
    pauseUI: () => void,
    resumeUI: () => void,
    back: () => void,
    close: () => void,
    registerOnPauseUI: (cb: () => void) => void,
    registerOnResumeUI: (cb: () => void) => void,
    onPauseUIEventCb: Option<() => void>,
    onResumeUIEventCb: Option<() => void>,
};

class Router extends React.Component<{}, State> {
    private routes: Array<string> = [];
    private readonly toRoute: (path: string) => boolean;
    private readonly back: () => void;
    private readonly close: () => void;
    private readonly pauseUI: () => void;
    private readonly resumeUI: () => void;

    constructor(props: Dict) {

        super(props);

        // Convert our routes into an array for easy 404 checking
        this.routes = Object.keys(props.routes).map((key) => props.routes[key].path);

        this.toRoute = (path) => {
            // prevent navigation
            if (this.onInterceptLeaveEvent(LeaveEventType.LEAVE_BACK)) {
                return true;
            }

            if (this.state.route.path === path) {
                return true;
            }
            this.setState(state => ({
                route: {path},
                // clean up all route cb
                onInterceptLeaveEventCb: null,
                onPauseUIEventCb: null,
                onResumeUIEventCb: null,
            }));

            // clean up onInterceptLeaveEventCb
            // this.onInterceptLeaveEventCb = null;

            return true;
        };

        this.back = () => {
            if (this.state.route.path === this.state.defaultRoute.path) {

                // prevent navigation
                if (this.onInterceptLeaveEvent(LeaveEventType.LEAVE_BACK)) {
                    return;
                }

                this.close();

            } else {
                this.toRoute(this.state.defaultRoute.path);
            }
        }

        this.close = () => {
            // prevent navigation
            if (this.onInterceptLeaveEvent(LeaveEventType.LEAVE_CLOSE)) {
                return;
            }

            (window as any).closeGameReader();
        }

        this.pauseUI = () => {
            this.setState(state => {
                if (state.pausedUI === false) {
                    if (state.onPauseUIEventCb && isFunction(state.onPauseUIEventCb())) {
                        state.onPauseUIEventCb();
                    }
                }
                return {pausedUI: true};
            });
        }

        this.resumeUI = () => {
            this.setState(state => {
                if (state.pausedUI === true) {
                    if (state.onResumeUIEventCb && isFunction(state.onResumeUIEventCb())) {
                        state.onResumeUIEventCb();
                    }
                }
                return {pausedUI: false};
            });
        }


        // Состояние хранит функцию для обновления контекста,
        // которая будет также передана в Provider-компонент.
        // Define the initial RouterContext value
        this.state = {
            defaultRoute: {path: props.defaultPath || '/'},
            route: {path: props.defaultPath || '/'},
            toRoute: this.toRoute,
            registerLeaveEventInterceptor: (cb: (type: LeaveEventType) => boolean) => {
                this.setState(state => ({
                    onInterceptLeaveEventCb: cb
                }))
            },
            unregisterLeaveEventInterceptor: () => {
                this.setState(state => ({onInterceptLeaveEventCb: null}))
            },
            onInterceptLeaveEventCb: null,
            pausedUI: false,
            pauseUI: this.pauseUI,
            resumeUI: this.resumeUI,

            // event for activity
            registerOnPauseUI: (cb: () => void) => {
                this.setState(state => ({onPauseUIEventCb: cb}))
            },
            onPauseUIEventCb: null,
            onResumeUIEventCb: null,

            // event for activity
            registerOnResumeUI: (cb: () => void) => {
                this.setState(state => ({onResumeUIEventCb: cb}))
            },

            // back nav
            back: this.back,

            // close nav
            close: this.close,


        };
    }

    private onInterceptLeaveEvent(type: LeaveEventType) {

        // console.log('check', isFunction(this.state.onInterceptLeaveEventCb))

        if (isFunction(this.state.onInterceptLeaveEventCb)) {
            // true - prevent event
            // false - continue event
            return this.state.onInterceptLeaveEventCb(type);
        }
        return false;
    }

    render() {

        // Define our variables
        // @ts-ignore
        const {children, NotFound} = this.props;

        // Check if 404 if no route matched
        // @ts-ignore
        const is404 = this.routes.indexOf(this.state.route.path) === -1;

        return (
            <RouterContext.Provider value={{
                route: this.state.route,
                toRoute: this.state.toRoute,
                registerLeaveEventInterceptor: this.state.registerLeaveEventInterceptor,
                unregisterLeaveEventInterceptor: this.state.unregisterLeaveEventInterceptor,
                registerOnPauseUI: this.state.registerOnPauseUI,
                registerOnResumeUI: this.state.registerOnResumeUI,
                pauseUI: this.state.pauseUI,
                resumeUI: this.state.resumeUI,
                back: this.state.back,
                close: this.state.close,
            }}>
                {is404 ? <NotFound/> : children}
            </RouterContext.Provider>
        );

    }

}

export {RouterContext, Router, Route, Link, RouterContextState, LeaveEventType}
