import FeedListView from './FeedListView.vue'

const camelize = str => str.charAt(0).toUpperCase() + str.slice(1)

// This is a factory function for dynamically creating root-level list views,
// since they share most of the logic except for the type of items to display.
// They are essentially higher order components wrapping ItemList.vue.
export default function createFeedListView (type) {
  return {
    name: `${type}-stories-view`,

    asyncData ({ store, route, beforeRouteUpdate }) {
      if (beforeRouteUpdate) {
        return Promise.resolve()
      }
      return store.dispatch('FETCH_LIST_ITEMS', { type, page: 1})
    },

    title: camelize(type),

    render (h) {
      return h(FeedListView, { props: { type }})
    }
  }
}