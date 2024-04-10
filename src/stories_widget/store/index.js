import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'


import user from './vuex-user-module';
import session from './vuex-session-module';
import stories from './vuex-stories-module';
import article from './vuex-article-module';
import statistics from './vuex-statistics-module';
import shared from './vuex-shared-module';

Vue.use(Vuex);

export function createStore () {

  const store = new Vuex.Store({

// root module
    state: {
      showStoriesView: false,
      storyId: null,
      activeStoryIndex: 0,
      needSession: false

    },
    actions,
    mutations,
    getters
  })

  // Module
  // todo delete лишнее
  store.registerModule('user', user);
  store.registerModule('session', session);
  store.registerModule('stories', stories);
  store.registerModule('article', article);
  store.registerModule('statistics', statistics);
  store.registerModule('shared', shared);

  // store.registerModule('user', user, {preserveState: true}); // register a top level module, preserve the previous state
  // store.registerModule(['user', 'posts'], posts); // register a nested module
  //
  // store.unregisterModule('user', user); // unregister a module
  //

  return store
}
