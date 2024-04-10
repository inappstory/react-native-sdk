// this is aliased in webpack config based on server/client build
import {createAPI} from 'create-api'
import {ensureSessionId} from '~/src/stories_widget/models/Session'
import {debug} from "../../stories_widget/util/debug";


// todo  config model ts
// const config;



const config = global.widgetConfig || window.widgetConfig;

// const logRequests = process.env.DEBUG_API
const logRequests = process.env.NODE_ENV !== 'production'

debug(`Creating API with config ${config}`)

/** @type {AxiosInstance} */
const api = createAPI({
  config: {
    baseURL:  `${config.api.url}/${config.api.version}/`,
    headers: {
      Authorization: `Bearer ${config.api.token}`
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
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),

  }
})

const sessionIdInterceptor = api.interceptors.request.use(async function (config) {
  // Do something before request is sent


  if (config.method !== 'options') {
    if (config.method === 'get') {
      if (config.params === undefined) {
        config.params = {};
      }
      config.params['session_id'] = await ensureSessionId()
    } else {
      if (config.data === undefined) {
        config.data = {};
      }
      config.data['session_id'] = await ensureSessionId()
    }
  }


  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});
// api.interceptors.request.eject(sessionIdInterceptor);


// Override timeout default for the library
// Now all requests using this instance will wait 2.5 seconds before timing out
api.defaults.timeout = 2500;


// warm the front page cache every 15 min (if this server side - make in php)
// make sure to do this only once across all requests
// if (api.onServer) {
//   warmCache()
// }
//
// function warmCache () {
//   fetchItems((api.cachedIds.top || []).slice(0, 30))
//   setTimeout(warmCache, 1000 * 60 * 15)
// }

function fetch(child, params) {
  logRequests && debug(`fetching ${child}...`)
  const cache = api.cachedItems
  if (cache && cache.has(child)) {
    logRequests && debug(`cache hit for ${child}.`)
    return Promise.resolve(cache.get(child))
  } else {
    return new Promise((resolve, reject) => {

      // Make a request for a user with a given ID
      // resolve child with api path
      api.get(child, {params})
        .then(function(response) {
          const val = response.data; // get val from data snapshot
          // mark the timestamp when this item is cached
          if (val) val.__lastUpdated = Date.now()
          cache && cache.set(child, val)
          logRequests && debug(`fetched ${child}.`)
          resolve(
            val
            // totalCount: Number(response.headers["x-pagination-total-count"]),
            // currentPage: Number(response.headers["x-pagination-current-page"])
          )
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
}

function fetchList(child) {
  logRequests && debug(`fetching list ${child}...`)
  const cache = api.cachedItems
  if (cache && cache.has(child)) {
    logRequests && debug(`cache hit for ${child}.`)
    return Promise.resolve(cache.get(child))
  } else {
    return new Promise((resolve, reject) => {

      // Make a request for a user with a given ID
      // resolve child with api path
      api.get(child)
        .then(function(response) {
          const val = response.data; // get val from data snapshot


          // mark the timestamp when this item is cached
          // if (val) val.__lastUpdated = Date.now()
          // cache && cache.set(child, val)
          logRequests && debug(`fetched list ${child}.`)
          resolve({
            val,
            totalCount: Number(response.headers["x-pagination-total-count"]),
            currentPage: Number(response.headers["x-pagination-current-page"])
          })
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
}

export function fetchStories() {
  return fetchList(`story`)
}

// todo cache
export function fetchStory(id) {
  return fetch(`story/${id}`, {expand: 'slides_html'})
}

export function fetchStoriesData(ids) {
  return Promise.all(ids.map(id => fetchStory(id)))
}


export function fetchIdsByType(type) {
  return api.cachedIds && api.cachedIds[type]
    ? Promise.resolve(api.cachedIds[type])
    : fetch(`${type}-feed`)
}

export function fetchListItemsByTypeAndPage(type, page) {
  return fetch(`${type}-feed?page=${page}`);
}

export function fetchItem(id) {
  return fetch(`item/${id}`)
}

export function fetchItems(ids) {
  return Promise.all(ids.map(id => fetchItem(id)))
}

export function fetchUser(id) {
  return fetch(`user/${id}`)
}

// TODO сделать watch list
export function watchList(type, cb) {
  let first     = true
  const ref     = api.get(`${type}-feed`)
  const handler = snapshot => {
    if (first) {
      first = false
//
      cb(snapshot.data)
      //
    } else {
      // cb(snapshot.val())
      cb(snapshot.data)
    }
  }

  // ref.on('value', handler)
  ref.then(handler)
  return () => {
    ref.off('value', handler)
  }
}

export function fetchArticles(ids) {
  return Promise.all(ids.map(id => fetchArticle(id)))
}

export function fetchArticle(id) {
  return fetch(`article/${id}`)
}


function emitEvent({type, event, eventData}) {
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
      .then(function(response) {
        const val = response.data; // get val from data snapshot
        logRequests && debug(`emitted ${type}/${event} with value`, val)
        resolve(val)
      })
      .catch(reject)
  })
}

export function emitStoriesOpen(data) {
  return emitEvent({type: 'stories', event: 'open', eventData: data})
}

export function emitStoriesStatUpdate(data) {
  return emitEvent({type: 'stories', event: 'update', eventData: data})
}

export function emitStoriesStatClose(data) {
  return emitEvent({type: 'stories', event: 'close', eventData: data})
}



export function fetchSession({platform, device_id, model, manufacturer, brand, screen_width, screen_height, screen_dpi, os_version, os_sdk_version, app_package_id, app_version, app_build}) {
  return new Promise((resolve, reject) => {
    api.post('session/open', {platform: platform, device_id: device_id})
      .then(function(response) {
        const val = response.data; // get val from data snapshot
        logRequests && debug(`session/open response with value`, val)
        resolve(val)
      })
      .catch(reject)
  })
}


// TODO + https://github.com/Microsoft/typed-rest-client

// Want to use async/await? Add the `async` keyword to your outer function/method.
// async function getUser() {
//   try {
//     const response = await axios.get('/user?ID=12345');
//     debug(response);
//   } catch (error) {
//     console.error(error);
//   }
// }




