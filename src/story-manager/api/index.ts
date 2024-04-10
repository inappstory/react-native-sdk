import { v4 as uuidV4 } from "uuid";
import { Dict, Option } from "../../../global.h";
import { isNil } from "../../helpers/isNil";
import { isObject } from "../../helpers/isObject";
import { mergeObjects } from "../../helpers/mergeObjects";
import { trimStartSlash } from "../../helpers/trimStartSlash";
import { trimEndSlash } from "../../helpers/trimEndSlash";

import { $storyManagerConfig, $configDeviceId } from "../models/storyManagerConfig";
import { $session } from "../models/session";

import { Utility } from "../../helpers/utility";
import { domains } from "./domains";
import { StoryManagerSdkConfigChecker } from "../StoryManagerSdkConfigChecker";
import { isEmpty } from "../../helpers/isEmpty";
import { isString } from "../../helpers/isString";
import { isNumber } from "../../helpers/isNumber";

// import {stringify as qsStringify} from "qs";
function qsStringify(elements: Dict) {
    return "";
}

export type ApiRequestConfigMethod = "get" | "post" | "patch" | "put" | "delete";

export type ApiRequestConfig = {
    url: string;
    method: ApiRequestConfigMethod | Uppercase<ApiRequestConfigMethod>;
    params?: Dict;
    data?: Dict;
    headers?: Dict;
};

export type ApiResponse<ResponseData = {}> = {
    data: ResponseData;
    headersRaw: Headers;
    headers: Dict<string>;
    status: number;
    statusText: string;
    ok: boolean;
};

class API {
    private _deviceInfoPromise: Option<Promise<boolean>> = null;

    set deviceInfoPromise(promise: Promise<boolean>) {
        this._deviceInfoPromise = promise;
    }

    private _baseHeaders: Dict = {};
    public set baseHeaders(headers: Dict) {
        this._baseHeaders = headers;
    }

    private _userInfo: { deviceId: string | null; userId: string | null } = {
        deviceId: null,
        userId: null,
    };
    public set deviceId(deviceId: string) {
        this._userInfo.deviceId = deviceId;
    }
    public set userId(userId: string | number | null | undefined) {
        let _userId: string | number | null = null;
        if (!isEmpty(userId) && (isString(userId) || isNumber(userId))) {
            _userId = String(userId);
            if (_userId.length == 0) {
                _userId = null;
            }
        }

        this._userInfo.userId = _userId;
    }
    public get userKey() {
        // console.log("get userKey", this._userInfo.userId || this._userInfo.deviceId || "default");

        if (this._userInfo.userId) {
            return this._userInfo.userId;
        }

        if (this._userInfo.deviceId) {
            return this._userInfo.deviceId;
        }

        return "default";
    }

    public get baseURL() {
        return `${domains.apiUrl}/v2/`;
    }

    private requestInterceptors: Array<(config: ApiRequestConfig) => void> = [];

    public interceptors = {
        request: {
            use: (cb: (config: ApiRequestConfig) => void) => {
                this.requestInterceptors.push(cb);
            },
        },
    };

    public async request<ResponseData>(config: ApiRequestConfig): Promise<ApiResponse<ResponseData>> {
        return new Promise((resolve, reject) => {
            if (this._deviceInfoPromise) {
                this._deviceInfoPromise.finally(async () => {
                    try {
                        if (!isObject(config.headers) || config.headers == null) {
                            config.headers = {};
                        }
                        config.headers = mergeObjects(this._baseHeaders, config.headers);

                        if (this.requestInterceptors.length) {
                            for (const interceptor of this.requestInterceptors) {
                                interceptor(config);
                            }
                        }

                        let search = "";
                        if (!isNil(config.params) && isObject(config.params)) {
                            search = new URLSearchParams(Object.entries(config.params)).toString();
                        }

                        let url = new URL(`${trimStartSlash(config.url)}${search ? "?" + search : ""}`, this.baseURL);

                        let method = "get";
                        if (!isNil(config.method)) {
                            method = config.method;
                        }

                        let headers: Dict = {};
                        if (!isNil(config.headers) && isObject(config.headers)) {
                            headers = config.headers;
                        }

                        let body = null;
                        if (!isNil(config.data) && isObject(config.data)) {
                            body = JSON.stringify(config.data);
                            headers["Content-Type"] = "application/json";
                        }

                        // debug
                        // console.log({...{url: url.toString()}, ...{method, body, headers}});

                        try {
                            if (StoryManagerSdkConfigChecker.getInstance().sdkConfigIsIncorrect) {
                                resolve({
                                    data: {
                                        name: "SDK config is incorrect",
                                        message:
                                            StoryManagerSdkConfigChecker.getInstance().sdkConfigErrorsAsArray.join(
                                                ". "
                                            ),
                                        status: 400,
                                    } as unknown as ResponseData,
                                    // @ts-ignore
                                    headersRaw: {},
                                    headers: {},
                                    status: 400,
                                    statusText: "SDK config is incorrect",
                                    ok: false,
                                });

                                return;
                            }
                        } catch (e) {
                            console.error(e);
                        }

                        const response = await fetch(url.toString(), {
                            method,
                            body,
                            headers,
                            credentials: "omit",
                        });
                        const json = await response.json();

                        // await (() => {
                        //     return new Promise<void>((resolve) => {
                        //         setTimeout(() => resolve(), 1000);
                        //     });
                        // })();

                        resolve({
                            data: json as ResponseData,
                            headersRaw: response.headers,
                            headers: Object.fromEntries([...response.headers]),
                            status: response.status,
                            statusText: response.statusText,
                            ok: response.ok,
                        });
                    } catch (e) {
                        reject(e);
                    }
                });
            } else {
                reject(new Error("Invalid device info Promise"));
            }
        });
    }

    public async post<ResponseData>(path: string, data: Dict) {
        return this.request<ResponseData>({ method: "post", url: path, data });
    }

    public async get<ResponseData>(path: string, params: Dict) {
        return this.request<ResponseData>({ method: "get", url: path, params });
    }
}

const APIInstance = new API();

APIInstance.interceptors.request.use((config) => {
    config.headers = mergeObjects(config.headers, {
        "Authorization": `Bearer ${$storyManagerConfig.getState().apiKey}`,
        "Accept-Language": $storyManagerConfig.getState().lang || "en",
        "Auth-Session-Id": $session.getState()?.session?.id,
        "X-User-Id": $storyManagerConfig.getState().userId ? $storyManagerConfig.getState().userId : "",
        "X-Request-Id": uuidV4(),
    });

    return config;
});

export function APISendBeacon(path: string, data: Dict, cb: () => void): void {
    if ("sendBeacon" in navigator) {
        const url = `${trimEndSlash(APIInstance.baseURL)}/${trimStartSlash(path)}?access_token=${
            $storyManagerConfig.getState().apiKey
        }&session_id=${$session.getState()?.session?.id}`;

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            Utility.convertModelToFormData(formData, data[key], key);
        });

        navigator.sendBeacon(url, formData);

        cb();
    } else {
        APIInstance.post(path, data).then(
            () => cb(),
            () => cb()
        );
    }
}

export default APIInstance;

// usage
/**
 * import API from '../api';
 *
 * const response = await API.delete(`users/${this.state.id}`);
 * console.log(response);
 * console.log(response.data);
 *
 *
 *
 * init sdk
 * первый же запрос - open session
 * и дальше готовы к работе
 *
 *
 *  "react-native-device-info": "^10.0.2", - с этой версии ломается передача device id
 *
 *
 * {"body": "{\"compositeRequest\":[{\"path\":\"session/open\",\"qs\":{\"expand\":\"cache\"},\"body\":{\"device_id\":{\"_h\":0,\"_i\":1,\"_j\":\"16f08fd6924d9158\",\"_k\":null},\"platform\":\"android\",\"features\":\"animation,data,deeplink,placeholder,resetTimers,gameReader,swipeUpItems\"},\"method\":\"post\",\"url\":\"session/open\",\"params\":{\"expand\":\"cache\"},\"data\":{\"device_id\":{\"_h\":0,\"_i\":1,\"_j\":\"16f08fd6924d9158\",\"_k\":null},\"platform\":\"android\",\"features\":\"animation,data,deeplink,placeholder,resetTimers,gameReader,swipeUpItems\"},\"ref\":\"session\"},{\"path\":\"feed/rniasdemo\",\"qs\":{\"session_id\":\"@{session.session.id}\"},\"method\":\"GET\",\"url\":\"feed/rniasdemo\",\"params\":{\"session_id\":\"@{session.session.id}\"},\"ref\":\"storyList_rniasdemo\"},{\"path\":\"story\",\"qs\":{\"session_id\":\"@{session.session.id}\",\"favorite\":1},\"method\":\"GET\",\"url\":\"story\",\"params\":{\"session_id\":\"@{session.session.id}\",\"favorite\":1},\"ref\":\"storyFavoriteList\"}]}", "headers": {"Accept-Language": "en", "Auth-Session-Id": "", "Authorization": "Bearer BRgBAAAAAAAAAAAAABcaIThgDx0GIhFYKhdBRhlHFCMoYBgXGJDsJ8RufiGoHhBCzdv68XL94LeH77_rn_jE4DGKm3pd", "Content-Type": "application/json", "X-App-Package-Id": "com.forprofi", "X-Device-Id": {"_h": 0, "_i": 1, "_j": "16f08fd6924d9158", "_k": null}, "X-Request-Id": "75f1a7a4-1f0d-44da-a22c-073a62cd5f55", "X-Sdk-Version": "0.2.4", "X-User-Agent": "InAppStoryRNSDK/0.2.4 Mozilla/5.0 (Linux; Android 12; Build/TPP2.220218.008; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36 Application/1.0 (com.forprofi 1.0)", "X-User-Id": null}, "method": "post", "url": "https://api.inappstory.ru/v2/composite"}
 *
 *  LOG  {"response": {"data": {"code": 0, "message": "Your request was made with invalid credentials.", "name": "Unauthorized", "status": 401}, "headers": {"access-control-expose-headers": "", "content-type": "application/json; charset=UTF-8", "date": "Fri, 02 Sep 2022 13:55:57 GMT", "server": "nginx", "vary": "Accept", "www-authenticate": "Bearer realm=\"api\""}, "headersRaw": {"map": [Object]}, "ok": false, "status": 401, "statusText": ""}} 2
 *
 *
 *
 *
 *  LOG  Running "forprofi" with {"rootTag":11}
 *  LOG  {"body": "{\"compositeRequest\":[{\"path\":\"session/open\",\"qs\":{\"expand\":\"cache\"},\"body\":{\"device_id\":{\"_h\":0,\"_i\":1,\"_j\":\"16f08fd6924d9158\",\"_k\":null},\"platform\":\"android\",\"features\":\"animation,data,deeplink,placeholder,resetTimers,gameReader,swipeUpItems\"},\"method\":\"post\",\"url\":\"session/open\",\"params\":{\"expand\":\"cache\"},\"data\":{\"device_id\":{\"_h\":0,\"_i\":1,\"_j\":\"16f08fd6924d9158\",\"_k\":null},\"platform\":\"android\",\"features\":\"animation,data,deeplink,placeholder,resetTimers,gameReader,swipeUpItems\"},\"ref\":\"session\"},{\"path\":\"feed/rniasdemo\",\"qs\":{\"session_id\":\"@{session.session.id}\"},\"method\":\"GET\",\"url\":\"feed/rniasdemo\",\"params\":{\"session_id\":\"@{session.session.id}\"},\"ref\":\"storyList_rniasdemo\"},{\"path\":\"story\",\"qs\":{\"session_id\":\"@{session.session.id}\",\"favorite\":1},\"method\":\"GET\",\"url\":\"story\",\"params\":{\"session_id\":\"@{session.session.id}\",\"favorite\":1},\"ref\":\"storyFavoriteList\"}]}", "headers": {"Accept-Language": "en", "Auth-Session-Id": "", "Authorization": "Bearer BTwCAAAAAAAAAAAAABIaIThgEhYUJk9CMBlDT0RQFDwWTGqPTL3PfIKzSG9TzjEXtapK75wM9gkjMPsq4dC-QQ", "Content-Type": "application/json", "X-App-Package-Id": "com.forprofi", "X-Device-Id": {"_h": 0, "_i": 1, "_j": "16f08fd6924d9158", "_k": null}, "X-Request-Id": "fa0f3f33-ecf5-431c-a9f9-2cbab21284b9", "X-Sdk-Version": "0.2.4", "X-User-Agent": "InAppStoryRNSDK/0.2.4 Mozilla/5.0 (Linux; Android 12; Build/TPP2.220218.008; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36 Application/1.0 (com.forprofi 1.0)", "X-User-Id": null}, "method": "post", "url": "https://api.inappstory.ru/v2/composite"}
 *  LOG  {"response": {"data": {"compositeResponse": [Array], "success": false}, "headers": {"access-control-expose-headers": "", "content-type": "application/json; charset=UTF-8", "date": "Fri, 02 Sep 2022 13:58:47 GMT", "server": "nginx", "vary": "Accept, Accept, Accept, Accept"}, "headersRaw": {"map": [Object]}, "ok": true, "status": 200, "statusText": ""}} 1
 *  LOG  {"e": {"name": "networkError", "networkMessage": "Input argument \"device_id\" not transferred.", "networkStatus": 400}}
 *  LOG  {"name": "networkError", "networkMessage": "Input argument \"device_id\" not transferred.", "networkStatus": 400}
 *
 *
 */
