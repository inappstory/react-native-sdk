<template>
    <div class="article-view" v-if="article">
        <template v-if="article">

            <div class="header-container-fluid article-back-link-container">
                <div class="row">
                    <div class="col-12 d-flex">
                        <button class="d-flex m-auto m-md-0 soggy-asphalt-link article-back-link"
                                onclick="return false;"><span class="back-icon"><BackIcon/></span>&nbsp;&nbsp;Back
                        </button>
                        <p class="soggy-asphalt article-title d-none d-md-block">{{ article.description }}</p>
                    </div>
                </div>
            </div>

            <div class="main-grid-wrapper article-container" v-bind:class="{blocked: blocked}"
                 :data-article-source-id="article.article_source_id"
                 :data-in-favorite="article.in_favorite" onmousedown="return false">
                <div class="main-grid-container-fluid" v-html="article.content"></div>
            </div>


        </template>
    </div>
</template>

<script>
  import BackIcon from '../.././assets/back.svg';

  export default {
    name: "ArticleView",
    components: {
      BackIcon
    },
    data: () => ({
      loading: true,
      blocked: !this.article.hasAccess
    }),

    computed: {
      article() {
        return this.$store.state.articles[this.$route.params.id]
      }
    },

    // We only fetch the item itself before entering the view, because
    // it might take a long time to load threads with hundreds of comments
    // due to how the HN Firebase API works.
    asyncData({store, route: {params: {id}}}) {
      return store.dispatch('FETCH_ARTICLES', {ids: [id]})
    },

    title() {
      return this.article.title
    }


  }
</script>

<style scoped>

</style>