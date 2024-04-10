// import Firebase from 'firebase/app'
// import 'firebase/database'
//
// export function createAPI ({ config, version }) {
//   Firebase.initializeApp(config)
//   return Firebase.database().ref(version)
// }

import axios from 'axios';

export function createAPI ({ config }) {

  let api = axios.create(config)

  api.cachedItems = false;

  return api
}