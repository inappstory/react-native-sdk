<template>
  <div class="favorite-images-wrapper">
    <div v-for="(item, index) in images" class="favorite-image-wrapper">
      <div class="favorite-image" :style="favoriteImageStyle" :class='{"circle_style": isCircleStyle}'>
        <div class="favorite-image-item" :style="bgStyle(item)"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import StoriesItem from "~/src/stories_widget/models/StoriesItem"
import {PropType} from "vue";
import {mapGetters} from "vuex";
import {WidgetStoriesOptions} from "~/src/stories_widget/models/WidgetStoriesOptions";

interface StylesObject {
  [key: string]: string
}


const StoryCardItemFavoriteCells = Vue.extend({
  name: 'StoryCardItemFavoriteCells',
  props: {
    StoriesItem: {
      type: Object as PropType<StoriesItem>,
      required: true
    }
  },
  methods: {
    bgStyle({src, color}: {src: Optional<string>, color: string}) {
      const style: Dict = {};
      if (src) {
        style.backgroundImage = `url('${src}')`;
      } else {
        style.backgroundColor = color;
      }
      return style;
    }
  },

  computed: {
    ...mapGetters('shared', {
      favoriteLoadedStories: 'favoriteLoadedStories',
      storiesStyle: 'storiesStyle',
    }),
    // allow video to
    images() {
      // в зависимости от размера ячейки или всегда 4 ?
      return this.favoriteLoadedStories.map((item: StoriesItem) => ({
        src: item.imageSrc,
        color: item.background_color
      })).slice(0, 4);
    },

    favoriteImageStyle() {
      let styles = {
        paddingTop: this.storiesStyle === WidgetStoriesOptions.STYLE_RECTANGLE ? '125%' : '100%',
      };
      return styles;
    },

    isCircleStyle() {
      return this.storiesStyle === WidgetStoriesOptions.STYLE_CIRCLE
    }


  },


});
export default StoryCardItemFavoriteCells;

</script>

<style lang="scss" scoped>
.favorite-images-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  padding: var(--storiesListItemTitlePadding, 1rem);
  margin: -5px;

}

.favorite-image-wrapper {
  width: 50%;
  position: relative;
}

.favorite-image {
  position: relative;
}

.favorite-image-item {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  right: 3px;
  border-radius: calc(var(--storiesListInnerBorderRadiusRead, 0) / 4);
  background-position: 50% 50%;
  background-size: cover;
}
.circle_style {
  .favorite-image-item {
    border-radius: 50%;
  }
}

</style>
