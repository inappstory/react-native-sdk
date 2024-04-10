<template>
    <div class="news-view">
        <!--<div class="news-list-nav">-->
            <!--<router-link v-if="page > 1" :to="'/' + (page - 1)">&lt; prev</router-link>-->
            <!--<a v-else class="disabled">&lt; prev</a>-->
            <!--<span>{{ page }}/{{ maxPage }}</span>-->
            <!--<router-link v-if="hasMore" :to="'/'  + (page + 1)">more &gt;</router-link>-->
            <!--<a v-else class="disabled">more &gt;</a>-->
        <!--</div>-->
        <!--<transition :name="transition">-->
            <div class="feed-list" :key="displayedPage" v-if="displayedPage > 0">

                <!--<infinite-list :container-height="containerHeight" :item-height="itemHeight" :items="displayedItems" @onInfiniteLoad="load()" :loading="loading">-->
                <!--</infinite-list>-->

                <!--&lt;!&ndash;<transition-group tag="div" name="item" class="feed-list">&ndash;&gt;-->
            <scroller style="padding-top: 44px;"
                      :on-refresh="refresh"
                      :on-infinite="infinite"
                      ref="my_scroller">
                    <feed-list-item v-for="item in displayedItems" :key="item.id" :item="item">
                    </feed-list-item>
            </scroller>

                <!--<div v-infinite-scroll="infinite" infinite-scroll-disabled="busy" infinite-scroll-distance="10">-->
                    <!--<feed-list-item v-for="item in displayedItems" :key="item.id" :item="item">-->
                    <!--</feed-list-item>-->
                <!--</div>-->
                <!--</transition-group>-->
            </div>
        <!--</transition>-->
    </div>
</template>

<script>
  import { watchList } from '../api'
  import FeedListItem from '../components/FeedListItem.vue'
  // import InfiniteList from '../components/InfiniteList.vue'

  // let base = 1

  export default {
    name: "FeedListView",

    title: "FeedView",

    components: {
      // InfiniteList,
      FeedListItem
    },

    props: {
      type: String
    },

    asyncData ({ store }) {
      return store.dispatch('FETCH_LIST_ITEMS', { type, page: this.page})
    },

    data () {
      return {
        transition: 'slide-right',
        displayedPage: this.$store.state.pagination[this.type].page || 1,
        displayedItems: this.$store.getters.activeItems,

        loading: false,
        busy: false
      }
    },

    computed: {
      page () {
        // return Number(this.$route.params.page) || 1
        return this.$store.state.pagination[this.type].page || 1
      },
      maxPage () {
        const { itemsPerPage, lists, pagination } = this.$store.state
        // return Math.ceil(lists[this.type].length / itemsPerPage)
        return Math.ceil((pagination[this.type].totalCount || 0) / itemsPerPage)
      },
      hasMore () {
        return this.page < this.maxPage
      }
    },

    beforeMount () {
      // if (this.$root._isMounted) {
      // this.loadItems(this.page)
      // this.load()

      // TODO похоже еще scroller дергает load для первой страницы

      // }
      // watch the current list for realtime updates
      // this.unwatchList = watchList(this.type, ids => {
      //   this.$store.commit('SET_LIST', { type: this.type, ids })
      //   this.$store.dispatch('ENSURE_ACTIVE_ITEMS').then(() => {
      //     this.displayedItems = this.$store.getters.activeItems
      //   })
      // })
    },

    mounted(){
      this.top = 1
      this.bottom = this.$store.state.itemsPerPage // 30
    },

    // beforeDestroy () {
    //   this.unwatchList()
    // },

    // watch: {
    //   page (to, from) {
    //     this.loadItems(to, from)
    //   }
    // },

    methods: {

      refresh(done) {
        // todo обновлять всю ленту ???
        // setTimeout(() => {
        //   let start = this.top - 1
        //   for (let i = start; i > start - 10; i--) {
        //     this.items.splice(0, 0, i + ' - keep walking, be 2 with you.')
        //   }
        //   this.top = this.top - 10;
        //   done()
        // }, 1500)

        const {pagination} = this.$store.state
        this.$store.dispatch('FETCH_LIST_ITEMS', {
          type: this.type,
          page: 1
        }).then(() => {
          this.displayedPage  = pagination[this.type].currentPage
          this.displayedItems = this.$store.getters.activeItems
        }).then(() => {
          this.top = 1
          this.bottom = this.$store.state.itemsPerPage
          // todo обновлять все а не только первую страницу ???
          done()
        })
      },

      infinite(done) {

        let start = this.bottom + 1
        this.busy = true
        this.load().then(() => {
          this.bottom = this.bottom + this.$store.state.itemsPerPage
          done()
          this.busy = false;
        })

      },

      load () {
        // console.log('start load')
        const {pagination} = this.$store.state
        // this.loading = true
        return this.$store.dispatch('FETCH_LIST_ITEMS', {
          type: this.type,
          page: (pagination[this.type].currentPage || 0) + 1
        }).then(() => {
          this.displayedPage = pagination[this.type].currentPage
          this.displayedItems = this.$store.getters.activeItems
          // this.loading = false;
        })
      },

      // @deprecated
      loadItems (to = this.page, from = -1) {
        this.$bar.start()
        this.$store.dispatch('FETCH_LIST_ITEMS', {
          type: this.type,
          page: to
        }).then(() => {
          if (this.page < 0 || this.page > this.maxPage) {
            this.$router.replace(`/${this.type}/1`)
            return
          }
          this.transition = from === -1
            ? null
            : to > from ? 'slide-left' : 'slide-right'
          this.displayedPage = to
          this.displayedItems = this.$store.getters.activeItems
          this.$bar.finish()
        })
      }
    }
  }
</script>

<style lang="stylus">
.news-view
  padding-top 45px

.news-list-nav, .news-list
  background-color #fff
  border-radius 2px

.news-list-nav
  padding 15px 30px
  position fixed
  text-align center
  top 55px
  left 0
  right 0
  z-index 998
  box-shadow 0 1px 2px rgba(0,0,0,.1)
  a
    margin 0 1em
  .disabled
    color #ccc

.news-list
  position absolute
  margin 30px 0
  width 100%
  transition all .5s cubic-bezier(.55,0,.1,1)
  ul
    list-style-type none
    padding 0
    margin 0

.slide-left-enter, .slide-right-leave-to
  opacity 0
  transform translate(30px, 0)

.slide-left-leave-to, .slide-right-enter
  opacity 0
  transform translate(-30px, 0)

.item-move, .item-enter-active, .item-leave-active
  transition all .5s cubic-bezier(.55,0,.1,1)

.item-enter
  opacity 0
  transform translate(30px, 0)

.item-leave-active
  position absolute
  opacity 0
  transform translate(30px, 0)

@media (max-width 600px)
  .news-list
    margin 10px 0
</style>