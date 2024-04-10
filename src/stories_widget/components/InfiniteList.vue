<template>
    <div :style="containerStyle" @scroll.self="handlerScroll()">
        <div>
            <div :style="topBufferStyle"></div>
            <div class="length">{{activeItems.length}}</div>
            <feed-list-item v-for="item in activeItems" :key="item.id" :data="item" :item="item"></feed-list-item>
            <load-spinner v-show="showLoading"></load-spinner>
            <div :style="bottomBufferStyle"></div>
        </div>
    </div>
</template>

<script>
  import FeedListItem from './FeedListItem.vue'
  import LoadSpinner from './LoadSpinner.vue'
  import infiniteMix from 'vue-infinite-list/src/infiniteMix'
  export default {
    components: {
      FeedListItem,
      LoadSpinner
    },
    mixins: [infiniteMix],
    data() {
      return {}
    },
    methods: {}
  }
</script>