

export default {


  UPDATE_STORIES_ORDER: ({commit, state}) => commit('UPDATE_STORIES_ORDER'),

  UPDATE_STORIES_ACTIVE_INDEX: ({commit, state}, {activeStoryIndex}) => commit('UPDATE_STORIES_ACTIVE_INDEX', {activeStoryIndex}),

  UPDATE_NEED_SESSION: ({commit, state}, {needSession}) => commit('UPDATE_NEED_SESSION', {needSession})


}
