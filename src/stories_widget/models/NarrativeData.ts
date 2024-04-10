import AbstractModel from "./AbstractModel";
import {Dict, Option} from "../../../global.h";

export class NarrativeData extends AbstractModel {

    public static sentData(narrativeId: number, data: Dict, storyManagerProxy: Function) {
        return new Promise(resolve => {
            storyManagerProxy('apiRequest', {url: 'story-data/' + narrativeId, method: 'put', params: null, data, headers: null})
                .then((data: {data: Dict, status: number, headers: Array<Dict>}) => {
                        resolve({
                            data: data.data, status: 200, headers: [{}]
                        });
                    }
                ).catch((e: any) => {
                resolve({
                    data: e, status: 400, headers: [{}]
                });
            });
        });

    }

    public static sendApiRequest({url, method, params, headers, data, profilingKey}: {url: string, method: string, params: Option<Dict>, headers: Option<Dict>, data: Option<Dict>, profilingKey?:string}, storyManagerProxy: Function) {
        return new Promise(resolve => {
            storyManagerProxy('apiRequest', {url, method, params, data, headers})
                .then((data: {data: Dict, status: number, headers: Array<Dict>}) => {
                        resolve({
                            data: data.data, status: 200, headers: [{}]
                        });
                    }
                ).catch((e: any) => {
                resolve({
                    data: e, status: 400, headers: [{}]
                });
            });
        });
    }

    public static sendApiRequestPromise(configPlain: string, resolve: Function, storyManagerProxy: Function) {

        const {id, url, method, params, headers, data, cb} = JSON.parse(configPlain);

        return storyManagerProxy('apiRequest', {url, method, params, data, headers}).then((data: {data: Dict, status: number, headers: Array<Dict>}) => {
            let respString = JSON.stringify({
                requestId: id, data: JSON.stringify(data.data), status: data.status, headers: data.headers}
            );
            resolve(cb, respString);


        }, (e: any) => {
            // api or network error
            let respString = JSON.stringify({
                requestId: id, data: JSON.stringify(e), status: 400, headers: [{}]
            });
            resolve(cb, respString);
        });

    }

}




