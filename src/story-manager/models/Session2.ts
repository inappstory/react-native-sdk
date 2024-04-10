import AbstractModel from "../../stories_widget/models/AbstractModel";
import {Store} from "vuex";
import RootState from "../../stories_widget/store/rootState";
import {debug} from "../../stories_widget/util/debug";
import ProjectResourceCacheSet from "../../stories_widget/models/ProjectResourceCacheSet";

import {Option, Dict} from "../../../global.h";
import {isArray} from "../../helpers/isArray";
import {isObject} from "../../helpers/isObject";



let storeLink!: Store<RootState>;

let sessionInitInProcess: boolean = false;
let sessionReInitInProcess: boolean = false;

interface Window {
    widgetConfig: any;
}

const config = (<any>window).widgetConfig;

export interface ISessionInitData {
    platform: string;
    device_id: string;
    model?: string;
    manufacturer?: string;
    brand?: string;
    screen_width?: number;
    screen_height?: number;
    screen_dpi?: string;
    os_version?: string;
    os_name?: string;
    os_sdk_version?: string;
    app_package_id?: string;
    app_version?: string;
    app_build?: string;
    features?: string;
    user_id?: string | number;
    tags?: string;
}

export async function ensureSessionId(): Promise<string | null> {
    if (storeLink !== null) {
        debug(storeLink.getters['shared/session'])
        let session: Session2 = storeLink.getters['shared/session'];
        debug(session)
        if (!session.closed) {
            return Promise.resolve(session.id);
        } else {
            if (storeLink) {
                return (await Session2.init(storeLink)).id; // re init after close
            }
        }
    }

    return Promise.resolve(null);

}

export async function ensureSession(): Promise<Option<Session2>> {
    if (storeLink !== null) {
        debug(storeLink.getters['shared/session'])
        let session: Session2 = storeLink.getters['shared/session'];
        debug(session)
        if (!session.closed) {
            return Promise.resolve(session);
        } else {
            if (storeLink) {
                return (await Session2.init(storeLink)); // re init after close
            }
        }
    }

    return Promise.resolve(null);

}


export function getSessionId(): string | null {
    if (storeLink) {
        return storeLink.getters['shared/session']?.id;
    }
    return null;
}

type SessionFieldsInResponse = {id: string, expire_in: number};

export class Session2 extends AbstractModel {

    public id: string | null = null;
    public expire_in: number | null = null;
    public closed: boolean = false;
    public share!: boolean;
    public user_key!: string;
    public server_timestamp!: number;
    public is_allow_profiling: boolean = false;
    private _placeholders: Dict = {};
    private _projectResourceCache!: Option<ProjectResourceCacheSet>;
    private _session!: SessionFieldsInResponse;


    constructor() {
        super();
    }

    public singleModelWrapper(): string {
        return '';
    }

    public attributes(): Array<string> {
        return super.attributes().concat(['server_timestamp', 'session', 'cache', 'share', 'user_key', 'placeholders', 'is_allow_profiling']);
    }


    public static fetch(data: ISessionInitData): Promise<Session2> {
        return this._fetch(Session2, 'session/open?expand=cache', data, 'post');
    }

    public static setStoreLink(store: Store<RootState>) {
        storeLink = store;
    }

    public static init(store: Store<RootState>): Promise<Session2> {

        // save link
        storeLink = store;

        return new Promise((resolve, reject) => {

            if (!store.getters['needSession']) {
                resolve(store.getters['shared/session']);
                return;
            }

            if (sessionInitInProcess) {
                // reject('sessionInitInProcess');
                return;
            }
            sessionInitInProcess = true;

            this.getDeviceId().then((data: ISessionInitData) => {

                if (data.os_name === 'iOS') {
                    (window as any).isIos = true;
                } else if (data.os_name === 'Android') {
                    (window as any).Android = true;
                }

                if (store.getters['shared/options']?.userId) {
                    data.user_id = store.getters['shared/options']?.userId;
                }

                // переехали в запрос списков
                // if (store.getters['stories/options']?.tags) {
                //     data.tags = store.getters['stories/options']?.tags;
                // }

                data.features = 'animation,data,deeplink,placeholder,resetTimers,gameReader';

                // dispatch an action
                // не нужно ?
                store.dispatch('user/updateDeviceId', data.device_id);

                debug(data)

                Session2.fetch(data).then(session => {
                    sessionInitInProcess = false;
                    // TODO activeModel - set
                    if (!session) {
                        reject(`Key session not exists in response ${session}`)
                    }

                    // sync
                    store.commit('shared/setSession', {session})


                    //

                    ///,  и в Reader виджет вынести

                    if (session.rawData && session.rawData.share) {
                        store.commit('shared/setHasShare', {status: true})
                    }

                    store.commit('shared/addDefaultPlaceholders', {value: session.placeholders});


                    resolve(session)

                    // save all to store

                    //   "session": {
                    //     "id": "3edd5f192dd39045c05f26f450205426",
                    //     "expire_in": 3600
                    //   },
                    //   "server_timestamp": 1531471495

                    // resolve(val)
                }, error => {
                    sessionInitInProcess = false;
                    debug(error);
                })

            });

        })

    }

    private static getDeviceId(): Promise<ISessionInitData> {

      return Promise.reject('unsupported');

    }


    public static reInitSession(): Promise<string> {

        sessionReInitInProcess = true;

        return new Promise((resolve, reject) => {

            if (sessionReInitInProcess) {
                reject('sessionReInitInProcess');
            }

            if (!storeLink) {
                reject('storeLink is undefined');
            }

            const data: ISessionInitData = {
                platform: 'web',
                device_id: storeLink.getters['user/deviceId']
            };

            Session2.fetch(data).then(session => {

                sessionReInitInProcess = false;

                // TODO activeModel - set
                if (!session) {
                    reject(`Key session not exists in response ${session}`)
                }

                // sync
                storeLink.commit('session/update', session);

                resolve(storeLink.getters['session/id'])

            }, error => {

                sessionReInitInProcess = false;

                debug(error)
            })


        })

    }


    public static updateSession(data: Dict) {
        return this.update('session/update', data);
    }

    public static closeSession(data: Dict) {
        let session: Session2 = storeLink.getters['shared/session'];
        if (!session.closed) {
            session.closed = true;
            return this.update('session/close', data).then(() => storeLink.commit('session/update', session));
        }
        return Promise.resolve();
    }

    public static get userKey(): Option<string>
    {
        let session: Session2 = storeLink.getters['shared/session'];
        if (session) {
            return session.user_key;
        }
        return null;
    }


    public set session(value: SessionFieldsInResponse) {
        this.id = value.id;
        this.expire_in = value.expire_in;
        if ((<any>value).closed !== undefined) {
            this.closed = (<any>value).closed;
        }

    }

    public set cache(value: any) {
        this._projectResourceCache = ProjectResourceCacheSet.createFromArray(value);
    }

    public get cache(): Option<ProjectResourceCacheSet> | any {
        return this._projectResourceCache;
    }

    public set placeholders(values) {
        if (isArray(values)) {
            values.forEach((item: {name: string, default_value: string}) => {
                if (isObject(item) && item['name'] !== undefined && item['default_value'] !== undefined) {
                    this._placeholders[item['name']] = item['default_value'];
                }
            });
        }
    }

    // в менеджер - state объединять два объекта и через getter забирать где надо
    public get placeholders(): Dict
    {
        return this._placeholders;
    }


}




