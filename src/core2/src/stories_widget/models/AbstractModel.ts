import api from "../api2";
import {AxiosRequestConfig, Method} from "axios";
import {debug} from "~/src/stories_widget/util/debug";
import trimEnd from 'lodash/trimEnd';
import trimStart from 'lodash/trimStart';

// import {getSessionId} from "~/src/stories_widget/models/Session";

import {Utility} from "~/src/stories_widget/helpers/utility";
import {IData} from "~/src/types";
const getSessionId = () => '';

const logRequests = process.env.NODE_ENV !== 'production'

export interface IModelValues {
    [index: string]: any;
}

interface IAbstractModel {
    [key: string]: any
}

export interface IDataProvider<A extends AbstractModel> {
    models: Array<A>,
    totalCount: number,
    currentPage: number
}

export interface IEmitEvent {
    type: string;
    event: string;
    eventData: IData;
}

// Here you are saying that map is something that when accessed by a string returns a string
// var map: {[key:string]:string} = {};

export default abstract class AbstractModel implements IAbstractModel {

    get receiveTime(): number {
        return this._receiveTime;
    }

    protected __lastUpdated: string | false | null = null;

    private _receiveTime: number = 0;
    private _serverTimestamp: number = 0;

    public rawData: IData = {};


    public singleModelWrapper(): string {
        return '';
    }

    public attributes(): Array<string> {
        return ['__lastUpdated'];
    }

    public static prepareFromResponse(): void {
    }

    myDictionary: { [index: string]: any; } = {};

    public setAttributes<A extends AbstractModel>(values: IModelValues): void {
        const attributes: Array<string> = this.attributes();

        let self: IAbstractModel = this;

        for (let key in values) {
            let value = values[key];
            if (attributes.indexOf(key) !== -1) {
                self[key] = value;
            } else {
                // console.warn(`key ${key} does\`t exists in safe attributes`);
            }
        }
    }

    public static createInstance<A extends AbstractModel>(c: new () => A, data: IModelValues): A {
        const model: A = new c();
        let attributes = data;
        if (model.singleModelWrapper() !== '' && data[model.singleModelWrapper()] !== undefined) {
            attributes = data[model.singleModelWrapper()];
        }
        model.rawData = data;
        model.setAttributes(attributes);
        model._receiveTime = new Date().getTime();
        if (data.server_timestamp !== undefined) {
            model._serverTimestamp = data.server_timestamp;
        }
        return model;
    }


    // TODO cache
// TODO async client https://github.com/Microsoft/typed-rest-client/blob/master/lib/RestClient.ts
    protected static _fetch<A extends AbstractModel>(c: new () => A, resource: string, payLoad: { [index: string]: any }, method: Method = 'get'): Promise<A> {
        logRequests && debug(`fetching ${resource}...`);

        return new Promise((resolve, reject) => {

            // Make a request for a user with a given ID
            // resolve child with api path

            let config: AxiosRequestConfig = {
                url: resource,
                method: method
            };
            if (['post', 'put', 'path'].indexOf(method) !== -1) {
                config.data = payLoad;
            } else {
                config.params = payLoad;
            }

            const execute = function () {
                api.request(config)
                    .then(function (response) {
                        let obj: any;

                        obj = response.data; // get val from data snapshot
                        // mark the timestamp when this item is cached
                        if (obj) obj.__lastUpdated = Date.now();
                        // cache && cache.set(child, val)
                        logRequests && debug(`fetched ${resource} with data.`);
                        // logRequests && debug(obj);

                        let result: A;

                        result = AbstractModel.createInstance(c, obj);

                        resolve(
                            result
                            // totalCount: Number(response.headers["x-pagination-total-count"]),
                            // currentPage: Number(response.headers["x-pagination-current-page"])
                        )
                    })
                    .catch(reject)
            };

            execute();
            // let sessionId = ensureSessionId();
            // if (sessionId instanceof Promise && resource !== 'session/open') {
            //     sessionId.then((_sessionId: string) => {
            //         debug('reInit session with id' + _sessionId);
            //         execute();
            //     }, (reason: any) => {
            //
            //     });
            // } else {
            //     execute();
            // }


        })
    }


    // TODO Promise with DataProvider
    protected static _fetchList<A extends AbstractModel>(c: new () => A, resource: string, params?: { [index: string]: any }): Promise<IDataProvider<A>> {
        logRequests && debug(`fetching list ${resource}...`)
        // const cache = api.cachedItems
        // if (cache && cache.has(child)) {
        //     logRequests && debug(`cache hit for ${child}.`)
        //     return Promise.resolve(cache.get(child))
        // } else {
        return new Promise((resolve, reject) => {

            // Make a request for a user with a given ID
            // resolve child with api path
            api.get(resource, {params})
                .then(function (response) {
                    const val = response.data; // get val from data snapshot


                    // mark the timestamp when this item is cached
                    // if (val) val.__lastUpdated = Date.now()
                    // cache && cache.set(child, val)
                    logRequests && debug(`fetched list ${resource}.`);

                    let models: Array<A> = [];
                    (<Array<IModelValues>>val).forEach((values: IModelValues) => {
                        models.push(AbstractModel.createInstance(c, values));
                    });

                    let result: IDataProvider<A> = {
                        models: models,
                        totalCount: Number(response.headers["x-pagination-total-count"]),
                        currentPage: Number(response.headers["x-pagination-current-page"])
                    };

                    resolve(result)
                })
                .catch(reject)

            // api.child(child).once('value', snapshot => {
            //   const val = snapshot.val()
            //   // mark the timestamp when this item is cached
            //   if (val) val.__lastUpdated = Date.now()
            //   cache && cache.set(child, val)
            //   logRequests && debug(`fetched ${child}.`)
            //   resolve(val)
            // }, reject)
        })
    }

    // }


    public static emitEvent({type, event, eventData}: IEmitEvent) {
        logRequests && debug(`emit ${type}/${event}...`)
        return new Promise((resolve, reject) => {

            // const options = {
            //   method: 'POST',
            //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
            //   data: qs.stringify(data),
            //   url,
            // };
            // axios(options);

            // api.post(`${type}/event/${event}`, qs.stringify(eventData))
            api.post(`${type}/event/${event}`, eventData)
                .then(function (response) {
                    const val = response.data; // get val from data snapshot
                    logRequests && debug(`emitted ${type}/${event} with value`, val)
                    resolve(val)
                })
                .catch(reject)
        })
    }

    /**
     *
     * @param resource- for example - session/update
     * @param payLoad
     * @param method
     */
    public static update(resource: string, payLoad: IData, method: Method = 'post') {

        let config: AxiosRequestConfig = {
            url: resource,
            method: method
        };
        if (['post', 'put', 'path'].indexOf(method) !== -1) {
            config.data = payLoad;
        } else {
            config.params = payLoad;
        }

        return new Promise((resolve, reject) => {
            api.request(config)
                .then(function (response) {


                    let obj: any;

                    obj = response.data; // get val from data snapshot
                    logRequests && debug(`update ${resource} with data.`);

                    resolve(
                        obj
                    )
                })
                .catch(reject)
        })


    }

    public static sendBeacon(path: string, data: IData, cb: () => void): void {
        if ("sendBeacon" in navigator) {

            const url = `${trimEnd(api.defaults.baseURL, '/')}/${trimStart(path, '/')}?access_token=${trimStart(String((<any>api.defaults.headers)?.Authorization), 'Bearer ')}&session_id=${getSessionId()}`;

            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                Utility.convertModelToFormData(formData, data[key], key);
            });

            navigator.sendBeacon(url, formData);

            cb();

        } else {
            this.update(path, data).then(() => cb(), () => cb());
        }
    }


}
