<template>
    <div id="app">

    <!--<header class="header">-->
        <!--<nav class="inner">-->
            <!--<router-link to="/" exact>-->
                <!--&lt;!&ndash;<img class="logo" src="~public/logo.png" alt="logo">&ndash;&gt;-->
                <!--<img src=".././assets/logo.png">-->
            <!--</router-link>-->
            <!--<router-link to="/top">Top</router-link>-->
            <!--<router-link to="/new">New</router-link>-->
            <!--<router-link to="/show">Show</router-link>-->
            <!--<router-link to="/ask">Ask</router-link>-->
            <!--<router-link to="/job">Jobs</router-link>-->
            <!--<router-link-->
                    <!--:to="{ name: 'article', params: { id: 'gen-pobedy-dla-cego-susestvuet-celovek-otvet-na-etot-vopros-tebe-mozet-ne-ponravitsa' }}">-->
                <!--Article item-->
            <!--</router-link>-->
            <!--<router-link tag="li" to="/bar" :event="['mousedown', 'touchstart']">-->
                <!--<a>/bar</a>-->
            <!--</router-link>-->
            <!--<a class="github" href="https://github.com/vuejs/vue-hackernews-2.0" target="_blank" rel="noopener">-->
                <!--Built with Vue.js-->
            <!--</a>-->
        <!--</nav>-->
    <!--</header>-->
    <transition name="fade" mode="out-in">
        <router-view class="view"></router-view>
    </transition>
    </div>
</template>

<script>
  export default {
    name: 'App',

    data: () => ({
      loading: true,
      isSuspendSubscription: this.user && this.user.isSuspendSubscription
      // blocked: !this.user.hasAccess
    }),

    computed: {
      user() {
        return this.$store.state.user
        // save initial data in hidden textarea
      }
    },


  }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>

<style scoped lang="scss">

    /*@import "~bootstrap/dist/css/bootstrap";*/

    @import 'styles/main.scss';
    /*h1, h2 {*/
    /*font-weight: normal;*/
    /*}*/

    /*ul {*/
    /*list-style-type: none;*/
    /*padding: 0;*/
    /*}*/

    /*li {*/
    /*display: inline-block;*/
    /*margin: 0 10px;*/
    /*}*/

    /*a {*/
    /*color: #42b983;*/
    /*}*/
</style>
