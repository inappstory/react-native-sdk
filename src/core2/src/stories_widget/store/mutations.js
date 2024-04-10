import Vue from 'vue'
import isArray from 'lodash/isArray'

export default {
    SET_ACTIVE_TYPE: (state, {type}) => {
    state.activeType = type
  },

  SET_LIST: (state, {type, ids}) => {
    state.lists[type] = ids
  },

  UPDATE_LIST_AND_ITEMS: (state, {type, listItems, totalCount, currentPage}) => {
    Vue.set(state.pagination[type], "totalCount", totalCount);
    Vue.set(state.pagination[type], "currentPage", currentPage);
    listItems.forEach(item => {
      if (item) {
        state.lists[type].push(item.id);
        Vue.set(state.items, item.id, item);
      }
    });
  },

  SET_ITEMS: (state, {items}) => {
    items.forEach(item => {
      if (item) {
        Vue.set(state.items, item.id, item)
      }
    })
  },

  SET_USER: (state, {id, user}) => {
    Vue.set(state.users, id, user || false)
    /* false means user not found */
  },

  SET_ARTICLES: (state, {articles}) => {
    articles.forEach(article => {
      if (article) {
        Vue.set(state.articles, article.slug_or_id, article)
      }
    })
  },

  SET_ARTICLE: (state, {article}) => {
    if (article) {
      Vue.set(state.articles, article.slug_or_id, article)
    }
  },

  SET_ACTIVE_STORY: (state, {storyId}) => {
    state.storyId         = storyId
    state.showStoriesView = true
  },

  SET_STORY_DATA: (state, {item}) => {
    if (item) {
      Vue.set(state.storiesData, item.id, item)
    }
  },

    SET_STORIES: (state, {stories}) => {
        // state.stories = stories
        if (isArray(stories)) {
            stories.forEach(item => {
                if (item) {
                    Vue.set(state.stories, item.id, item)

                    state.lists['stories'].push(item.id)

                }
            })
        }
    },

  SET_STORIES_DATA: (state, {items}) => {
    items.forEach(item => {
      if (item) {
        Vue.set(state.storiesData, item.id, item)
      }
    })
  },


  UPDATE_STORIES_READED_AND_STAT: (state, {readedIds, dataLength}) => {

    readedIds.forEach(id => {
      // state.storiesData[id]['is']
      state.stories[id]['isOpened'] = true
    })

    for (let i = 0; i < dataLength; ++i) {
      state.storiesStatistic.data.shift()
    }
  },

  UPDATE_STORIES_ORDER: (state) => {
    let storiesList = state.lists['stories'].map(id => state.stories[id]).filter(_ => _)

    storiesList.sort((a, b) => {
      if (a.isOpened === true && b.isOpened === false) {
        return 1
      } else if (a.isOpened === false && b.isOpened === true) {
        return -1
      } else {
        if (a.display_from < b.display_from) {
          return 1
        } else if (a.display_from > b.display_from) {
          return -1
        } else {
          return 0
        }
      }
    })

    let newStoriesList = []
    let lastFreeIndex = 0
    storiesList.forEach((value, key) => {
      let fixedPosition = value.fixed_position
      if (fixedPosition >= 0 && key !== fixedPosition) {
        newStoriesList[fixedPosition] = value
      }
    })

    storiesList.forEach((value, key) => {
      let fixedPosition = value.fixed_position
      if (fixedPosition === null) {
        if (newStoriesList[lastFreeIndex] !== undefined) {
          while (newStoriesList[lastFreeIndex] !== undefined) {
            lastFreeIndex++
          }
        }
        newStoriesList[lastFreeIndex] = value
        lastFreeIndex++
      }
    })

    storiesList = newStoriesList


    state.lists['stories'] = storiesList.map(item => item.id)
  },

  UPDATE_STORIES_ACTIVE_INDEX: (state, {activeStoryIndex}) => {
    state.activeStoryIndex = activeStoryIndex
  },

  UPDATE_NEED_SESSION: (state, {needSession}) => {
    state.needSession = needSession
  },





}
