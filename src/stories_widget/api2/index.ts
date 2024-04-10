
// import {ensureSessionId, getSessionId, needSession, Session} from '~/src/stories_widget/models/Session'
import {debug} from "../util/debug";

// import {getSessionId, Session} from "~/src/stories_widget/models/Session";

import {needSession} from "../util/env";
const getSessionId = () => '';


// let http = require('http');
// let https = require('https');

function createAPI ({ config }: {config: AxiosRequestConfig}) {
    // let api = axios.create(config)
    // api.cachedItems = false;
    // return api

  return {};
}


// todo  config model ts
// const config;

interface Window {
    widgetConfig: any;
}

let config = (window as any).widgetConfig;

// const logRequests = process.env.DEBUG_API

debug && debug(`Creating API2 with config ${config}`)

if (!config || !config.api) {

    if (!config) {
        config = {};
    }
    if (!config.api) {
        config.api = {};
    }
    config.api.url = process.env.API_URL;
    config.api.version = 'v2';
}
const apiConfig = {
    config: {
        baseURL:  `${config?.api.url}/${config?.api.version}/`,
        headers: {
            Authorization: `Bearer ${config?.api.token}`
        },
        // `transformRequest` allows changes to the request data before it is sent to the server
        // This is only applicable for request methods 'PUT', 'POST', and 'PATCH'
        // The last function in the array must return a string or an instance of Buffer, ArrayBuffer,
        // FormData or Stream
        // You may modify the headers object.
        // transformRequest: [function (data, headers) {
        //   // Do whatever you want to transform the data
        //
        //   return data;
        // }],

        // `transformResponse` allows changes to the response data to be made before
        // it is passed to then/catch
        // transformResponse: [function (data) {
        //   // Do whatever you want to transform the data
        //
        //   return data;
        // }],
        // `paramsSerializer` is an optional function in charge of serializing `params`
        // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
        // paramsSerializer: function(params) {
        //   return Qs.stringify(params, {arrayFormat: 'brackets'})
        // },

        // `withCredentials` indicates whether or not cross-site Access-Control requests
        // should be made using credentials
        withCredentials: false, // передача cookie или http auth headers

        // `httpAgent` and `httpsAgent` define a custom agent to be used when performing http
        // and https requests, respectively, in node.js. This allows options to be added like
        // `keepAlive` that are not enabled by default.
        // httpAgent: new http.Agent({ keepAlive: true }),
        // httpsAgent: new https.Agent({ keepAlive: true }),

    }
};
if (config?.api?.lang) {
    apiConfig.config.headers = Object.assign({}, apiConfig.config.headers, {"accept-language": config.api.lang});
}
const api = createAPI(apiConfig);

    /*const sessionIdInterceptor = api.interceptors.request.use(function (config) {
        // Do something before request is sent

      if (!config.headers) {
        config.headers = {};
      }
        config.headers.Authorization = `Bearer ${(window as any).widgetConfig?.api?.token}`

        if (config.method !== 'options') {
            if (config.method === 'get') {
                if (config.params === undefined) {
                    config.params = {};
                }
                config.params['session_id'] = getSessionId()
            } else {
                if (config.data === undefined) {
                    config.data = {};
                }
                config.data['session_id'] = getSessionId()
            }
        }


        return config;
    }, function (error) {
        // Do something with request error

        if (typeof error.response !== 'undefined') {
            //Setup Generic Response Messages
            if (error.response.status === 401) {
                // message.html = 'UnAuthorized'
                // vm.$emit('logout') //Emit Logout Event
            } else if (error.response.status === 404) {
                // message.html = 'API Route is Missing or Undefined'
            } else if (error.response.status === 405) {
                // message.html = 'API Route Method Not Allowed'
            } else if (error.response.status === 422) {
                //Validation Message
            } else if (error.response.status === 424) { // Умерла или неверно указана сессия, нужно открыть заново перед тем как продолжить
                // Session.reInitSession();
            } else if (error.response.status >= 500) {
                // message.html = 'Server Error'
            }

        }


        return Promise.reject(error);
    });
// api.interceptors.request.eject(sessionIdInterceptor);

// Override timeout default for the library
// Now all requests using this instance will wait 60 seconds before timing out
api.defaults.timeout = 60 * 1000;*/


export default api;





