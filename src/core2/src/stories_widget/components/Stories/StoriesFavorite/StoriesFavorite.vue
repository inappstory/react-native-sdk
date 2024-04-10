<template>
  <StoryCardsWrapper class="container" :style="rootVars">
    <div class="header">
      <p class="title">{{ favoriteOptions.title.content }}</p>
      <button class="stories-favorite__close"
              @click.stop.prevent="closeReader">
        <span></span></button>
    </div>

    <div class="stories-list-wrapper">
      <div class="stories-list-container">
        <StoryCardItem v-for="(item, index) in displayedItems" :key="item.id" :item="item" :index="index"
                       class="card-item"
                       :style="slideWrapperStyle(index)"
                       :dragScrollStartAt="null"
                       :list-type="listType"
                       :window-referer="storyReaderWindowReferer"
                       @clickOnStory="$emit('clickOnStory', $event)"
                       @clickOnStoryInternal="$emit('clickOnStoryInternal', $event)"
                       @sessionInitInternal="$emit('sessionInitInternal', $event)"
        />
      </div>
    </div>
    <div class="footer">

    </div>
  </StoryCardsWrapper>

</template>

<script lang="ts">

import Vue from 'vue';
import {mapGetters} from "vuex";
import StoryCardItem from "~/src/stories_widget/components/Stories/StoryCardItem.vue"
import {debug} from "~/src/stories_widget/util/debug";
import {WidgetStoriesOptions} from "~/src/stories_widget/models/WidgetStoriesOptions";
import StoryCardsWrapper from "~/src/stories_widget/components/Stories/StoryCardsWrapper.vue"
import {STORY_LIST_TYPE, STORY_READER_WINDOW_REFERER} from "~/src/types";


const StoriesFavorite = Vue.extend({
  name: "StoriesFavorite",
  components: {StoryCardItem, StoryCardsWrapper},
  provide: function (): any {
    return {
      // reOrderItems: this.reOrderItems
      reOrderItems: () => {
      },
    }
  },
  data: () => ({
    listType: STORY_LIST_TYPE.favorite,
    storyReaderWindowReferer: STORY_READER_WINDOW_REFERER.favorite,
  }),
  computed: {
    ...mapGetters('shared', {
      storiesGap: 'storiesGap',
      storiesHeight: 'storiesHeight',
      storiesStyle: 'storiesStyle',
    }),

    ...mapGetters('stories', { // связать с данными хранилища
      displayedItems: 'loadedStories',
      activeStoryIndex: 'activeStoryIndex',
      modeDesktop: 'modeDesktop',
      sliderOptions: 'sliderOptions',
      favoriteOptions: 'favoriteOptions',
    }),

    cardWidth() {
      if (this.storiesStyle === WidgetStoriesOptions.STYLE_CIRCLE || this.storiesStyle === WidgetStoriesOptions.STYLE_QUAD) {
        return this.storiesHeight + 'px';
      } else if (this.storiesStyle === WidgetStoriesOptions.STYLE_RECTANGLE) {
        return (this.storiesHeight * .8) + 'px';
      }
    },

    rootVars() {
      return {
        "--card-width": this.cardWidth,
        "--card-gap": this.storiesGap + 'px',


      };
    },


  },

  created() {
  },
  methods: {

    closeReader() {
      this.$emit('close');
    },

    reOrderItems() {
      debug('call reOrderItems')
    },

    slideWrapperStyle(index: number): Dict<any> {
      return {};
      //
      // let styles = {
      //     'margin-right': '0',
      //     'margin-bottom': '0',
      //     'padding-left': '0',
      //     'padding-right': '0'
      // };
      //
      // styles['margin-right'] = this.storiesGap + 'px';
      // styles['margin-bottom'] = this.storiesGap + 'px';

      // return styles;

    },
  },

})

export default StoriesFavorite;


</script>
<style lang="scss">

.container {
  background: rgba(51, 51, 51, 1);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background: rgba(51, 51, 51, 1);
  z-index: 100;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .14), 0 2px 1px -1px rgba(0, 0, 0, .12), 0 1px 3px 0 rgba(0, 0, 0, .2);

  .title {
    color: white;
    margin: {
      top: 1rem;
      bottom: 1rem;
    };
    font-size: 1.2em;
    @media (min-width: 640px) {
      margin: {
        top: 25px;
        bottom: 25px;
      };
      font-size: 1.4em;
    }


    //color: var(--storiesListItemTitleColor, white);
    //font-family: var(--storiesListItemTitleFontFamily);
    font-family: InternalPrimaryFont;
    font-weight: normal;
    //font-size: 1rem;
    line-height: normal;
    //font: var(--storiesListItemTitleFont, normal);
  }

  margin-bottom: 25px;
  @media (min-width: 640px) {
    margin-bottom: 50px;
  }
}

.footer {
  width: 100%;
  height: 25px;
  @media (min-width: 640px) {
    height: 50px;
  }
}

.stories-favorite__close {
  border: 0;
  padding: 0;
  background: transparent;
  position: absolute;
  right: 15px;
  z-index: 1140;
  pointer-events: all;
  cursor: pointer;
  outline: none;

  &:focus {
    outline: none;
  }

  span {
    display: block;
    width: 25px;
    height: 25px;
    fill: white;
    stroke: white;
    background-image: url("closer.svg");
  }
}

.stories-slide-wrapper .stories-slide {
  width: auto !important;
  @media (min-width: 640px) {
    width: unset;
  }
}

.stories-list-wrapper {
  padding: {
    left: var(--card-gap, 1rem);
    right: var(--card-gap, 1rem);
  }
}

.stories-list-container {

  display: grid;
  grid-template-columns: repeat(2, 1fr);

  grid-gap: var(--card-gap);
  justify-content: center;

  // desktop
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, var(--card-width));
  }

  margin: 0 auto;

  .card-item {
    margin: 0 !important;
  }

  // container
  width: 100%;

  @media (min-width: 640px) {
    max-width: 640px;
  }
  @media (min-width: 768px) {
    max-width: 768px;
  }
  @media (min-width: 1024px) {
    max-width: 1024px;
  }
  @media (min-width: 1280px) {
    max-width: 1280px;
  }


}

</style>
