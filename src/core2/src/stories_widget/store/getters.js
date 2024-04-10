export default {
  // ids of the items that should be currently displayed based on
  // current list type and current pagination
  activeIds (state) {
    const { activeType, itemsPerPage, lists } = state

    if (!activeType) {
      return []
    }

    // const page = Number(state.route.params.page) || 1
    // const start = (page - 1) * itemsPerPage
    // const end = page * itemsPerPage
    //
    // return lists[activeType].slice(start, end)

    // TODO отдавать не весь список, а только активную часть, верх и низ скпывать ???
    return lists[activeType];


  },

  activeStoriesIds (state) {
    const { lists } = state

    // if (!activeType) {
    //   return []
    // }

    return lists['stories'];

  },

  // items that should be currently displayed.
  // this Array may not be fully fetched.
  activeItems (state, getters) {
    return getters.activeIds.map(id => state.items[id]).filter(_ => _)
  },

  activeStories (state, getters) {
    return getters.activeStoriesIds.map(id => state.stories[id]).filter(_ => _)
    // return state.stories.filter(_ => _)

    //return state.stories;
  },

  loadedStories (state, getters) { // todo объединить , просто при загрузке данных stories - добавлять их к оснонвому хранидищзу
    return getters.activeStoriesIds.map(id => state.storiesData[id])
    // filter убирает все undefined из массива
    // return getters.activeStoriesIds.map(id => state.storiesData[id]).filter(_ => _)
  },

  activeStoryIndex (state, getters) {
    return state.activeStoryIndex;
  },
  needSession (state, getters) {
    return state.needSession;
  },


  // todo грузить только list id и в сулчае необходиммости - подгружать данные по этим ids
}
