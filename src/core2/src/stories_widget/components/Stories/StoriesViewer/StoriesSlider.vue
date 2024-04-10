<template>
  <div class="stories-item" ref="storiesItem">
    <slot name="header"></slot>
    <stories-slide-item :count="slidesCount" v-for="(slide, index) in displayedItems" :key="index"
                        :item="slide"
                        :index="index"
                        :activeSlide="activeSlide"
                        :duration="timeout"
                        :timerPaused="timerPaused"
                        :storiesSlideOffset="storiesSlideOffset"
                        :storiesSlideOffsetX="storiesSlideOffsetX"
                        :storiesSlideOffsetY="storiesSlideOffsetY"
                        :slideFontSize="slideFontSize"
                        :storiesSlideHeight="storiesSlideHeight"
                        :storiesSlideWidth="storiesSlideWidth"
                        :activeStory="activeStory"
                        :currentStory="id"
                        @slideReady="onSlideReady"
                        @slideSwipeUpExists="onSlideSwipeUpExists"
                        @slideSwipeUpGoodsExists="onSlideSwipeUpGoodsExists"
                        :slideStartEvent="slideStartEvent"
                        :slideStartEventLayerIndex="slideStartEventLayerIndex"
    >
    </stories-slide-item>
    <slot name="bottom" v-bind:story="item"></slot>
  </div>
</template>

<script lang="ts">

// import {
//   fetchStories
// } from '../api'
import StoriesSlideItem from "./StoriesSlideItem.vue";
import StoriesItem from "../../../models/StoriesItem";
import {Vue} from "vue-property-decorator";
import {debug} from "~/src/stories_widget/util/debug";
import {PropType} from "vue";


const StoriesSlider = Vue.extend({
  name: "StoriesSlider",
  props: {
    item: {type: Object as PropType<StoriesItem>, required: true},
    id: {type: Number},
    timeout: {type: Number},
    activeSlide: {type: Number, default: 0},
    activeStory: {type: Number},
    timerPaused: {type: Boolean},
    storiesSlideOffset: {type: String},
    storiesSlideOffsetX: {type: String},
    storiesSlideOffsetY: {type: String},
    slideFontSize: {type: String},
    storiesSlideHeight: {type: String},
    storiesSlideWidth: {type: String},
    slideStartEvent: {type: Boolean},
    slideStartEventLayerIndex: {type: Number},
  },
  components: {StoriesSlideItem},

  computed: {
    // story: function (): StoriesItem|undefined {
    //     return this.$store.getters['shared/items'].get(this.id)
    // },
    slidesCount: function (): number | null {
      if (this.item === undefined) {
        return null;
      }
      return this.item.slides_count;
    },
    displayedItems: function (): Array<String> {
      // не монтируем, пока сторис не будет на экране
      // if (this.id !== this.activeStory) {
      //     return [];
      // } else {
      //     return this.story.slides_html.slice(this.activeSlide, (this.activeSlide + 2))
      // }
      // return this.story.slides_html
      if (this.item === undefined) {
        return [];
      }
      if (!Array.isArray(this.item.slides_html)) {
        return [];
      }
      return this.item.slides_html.slice(this.activeSlide, (this.activeSlide + 2))
    }
  },

  watch: {
    displayedItems: function (to, from) {
      debug(`watch displayedItems for id: ${this.id}`, this.displayedItems, this.item, this.activeSlide)
    },


    activeSlide: function (to, from) {

      // уже не нужно, т.к. парметр хранится отдельной для кадой сторис
      // if (this.activeStory === this.id) {
      // this.updateActiveSlides()
      // } else {
      // this.activeSlide = 0
      // }


    }
  },

  beforeMount() {

    debug(`before mount: activeSlide: ${this.activeSlide} activeStory: ${this.activeStory}`)
    debug(this.$store.getters['shared/items'].get(this.id))
    // this.load().then(() => {
    //   this.loaded = true
    // })

  },
  mounted() {

    debug(`id: ${this.id}  displayedItems`, this.displayedItems)
    debug(this.$store.getters['shared/items'])
    debug(this.$store.getters['shared/items'].get(this.id), this.id)

  },
  methods: {

    updateActiveSlides() {
      return new Promise<void>((resolve, reject) => {
        // const storiesItems: Map<number, StoriesItem> = this.$store.getters['shared/items'];
        // const storiesItem = storiesItems.get(this.id);

        if (this.item !== undefined) {
          this.displayedItems = this.item.slides_html.slice(this.activeSlide, (this.activeSlide + 2))
        } else {
          console.error(this.id, this.item)
        }
        resolve()
      })

    },
    onSlideReady(storyId: number, slideIndex: number) {
      debug(`StoriesSlider.vue: load - slideReady:internal:${storyId}:${slideIndex}`)
      this.$emit('slideReady', storyId, slideIndex);
    },
    onSlideSwipeUpExists(payload: Dict) {
      this.$emit('slideSwipeUpExists', payload);
    },
    onSlideSwipeUpGoodsExists(payload: Dict) {
      this.$emit('slideSwipeUpGoodsExists', payload);
    }

    // load() {
    //   return fetchStories().then(({val, totalCount, currentPage}) => {
    //     this.displayedItems = val
    //   })
    // }

  }

});

export default StoriesSlider;


</script>
<!--<script src="./my-component.js"></script>-->
<!--<style src="./my-component.css"></style>-->
<style lang="scss">
// @import variables
// типография и прочее


</style>
