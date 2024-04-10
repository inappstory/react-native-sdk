<template>
  <div class="stories-slide" :class="`_position_${this.index + 1}`">
    <!-- tap, long tap, удержание пальца, swipe, swipe вниз с протяжкой - закрыть все -->
    <div class="stories-pager">
      <div class="stories-pager__ticks">
        <div class="stories-pager__tick" v-for="i in count">
          <div class="stories-pager__tick-progress" :class="{'_active': i <= activeSlide}"></div>
          <div class="stories-pager__tick-progress-loader" @pointerdown="" ref="tick"
               v-show="i === activeSlide+1 && activeStory === currentStory"></div>
          <!--<slider-timer-tick class="stories-pager__tick-progress-loader" v-bind:paused="timerPaused" v-bind:duration="duration" v-if="i === activeSlide+1 && activeStory === currentStory"></slider-timer-tick>-->
        </div>
      </div>
    </div>
    <div class="stories-slide-offset"
         :style="{margin: storiesSlideOffset, width: storiesSlideWidth, height: storiesSlideHeight, '--y-offset': storiesSlideOffsetY, '--x-offset': storiesSlideOffsetX }">
      <div class="stories-slide-box">
        <div ref="slideContent" v-html="item" class="stories-slide-content narrative-slide"
             :style="{fontSize: slideFontSize, opacity: slideStateVisible ? 1 : 0}"></div>
      </div>
    </div>
    <div class="load-mask" v-if="needLoadingMask()">
      <!--            <span style="color: white">{{ state }}</span>-->
      <div class="loading-spinner-default" v-if="needLoaderAnim()"></div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Inject, Emit, Watch, Vue, Provide} from "vue-property-decorator"
import {onAllMediaLoaded} from "~/src/stories_widget/helpers/media";
import {Getter} from "vuex-class";
import {debug} from "~/src/stories_widget/util/debug";
import {finished} from "stream";

@Component({
  name: "StoriesSlideItem",
})
export default class StoriesSlideItem extends Vue {

  /** property значения которые получает компонент */
  @Prop({type: Number}) id!: number; // story id for view
  @Prop({type: Boolean, default: false}) timerEnabled!: boolean;

  @Prop({type: String}) item!: string;
  @Prop({type: Number}) index!: number;
  @Prop({type: Number}) count!: string;
  @Prop({type: Number}) activeSlide!: number;
  @Prop({type: Number}) duration!: string;
  @Prop({type: Boolean}) timerPaused!: string;
  @Prop({type: String}) storiesSlideOffset!: string;
  @Prop({type: String}) storiesSlideOffsetX!: string;
  @Prop({type: String}) storiesSlideOffsetY!: string;
  @Prop({type: String}) slideFontSize!: string;
  @Prop({type: String}) storiesSlideHeight!: string;
  @Prop({type: String}) storiesSlideWidth!: string;
  @Prop({type: Number}) activeStory!: number;
  @Prop({type: Number}) currentStory!: number;
  @Prop({type: Boolean}) slideStartEvent: boolean = false;
  @Prop({type: Number}) slideStartEventLayerIndex: number | null = null;

  @Getter('muted', {namespace: 'stories'}) muted!: boolean;
  @Getter('nextFlippingStoryId', {namespace: 'stories'}) nextFlippingStoryId!: Nullable<number>;

  private _slideStarted: boolean = false;

  /** Computed */
  get classList() {
    const background = (<any>this.item).background;
    let backgroundClass = `_background-color-${background.color}` + (background.gradient === true ? '-gradient' : '');
    return [
      backgroundClass,
    ]
  }

  get slideStateVisible() {
    return this.state === SlideState.loaded || this.state === SlideState.started;
  }

  /** Methods */
  // onTouch
  onStoriesItemClick(id: number) {
    // this.$store.commit('SET_ACTIVE_STORY', {storyId: id})
  }

  initQuiz(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-quiz');
    if (("_narrative_quiz" in window) && widget) {
      try {
        (<any>window)._narrative_quiz.initWidget(widget);
        (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', widget)
      } catch (e) {
      }
    } else {
      (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', undefined)
    }
    return false;
  }

  initQuizGrouped(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-quiz-grouped');
    if (("_narrative_quiz_grouped" in window) && widget) {
      try {
        (<any>window)._narrative_quiz_grouped.initWidget(widget);
        (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ_GROUPED', widget)
      } catch (e) {
      }
    } else {
      (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ_GROUPED', undefined)
    }
    return false;
  }

  initMultiSlide(cb: (finishRender: boolean) => void) {
    let slides = (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide');
    if (("_narrative_multi_slide" in window) && slides.length) {
      try {
        (<any>window)._narrative_multi_slide.init(slides);
      } catch (e) {
        console.error(e)
      }
    }
    return false;
  }

  initDataInput(cb: (finishRender: boolean) => void) {
    let widgets = (<any>this.$refs).slideContent.querySelectorAll('.narrative-element-data-input');
    if (("_narrative_data_input" in window) && widgets.length > 0) {
      (<any>window)._narrative_data_input_element = widgets;
      try {
        (<any>window)._narrative_data_input.initWidget(widgets);
      } catch (e) {
      }
    } else {
    }
    return false;
  }

  initRangeSlider(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-range-slider');
    if (("_narrative_range_slider" in window) && widget) {
      try {
        (<any>window)._narrative_range_slider.initWidget(widget);
        // (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', widget)
      } catch (e) {
      }
    } else {
      // (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', undefined)
    }
    return false;
  }

  initPoll(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-poll');
    if (("_narrative_poll" in window) && widget) {
      (<any>window)._narrative_poll_element = widget;
      try {
        (<any>window)._narrative_poll.initWidget(widget);
      } catch (e) {
      }
    } else {
    }
    return false;
  }

  initPollLayers(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-poll-layers');
    if (("_narrative_poll_layers" in window) && widget) {
      (<any>window)._narrative_poll_layers_element = widget;
      try {
        (<any>window)._narrative_poll_layers.initWidget(widget, undefined, (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide'));
      } catch (e) {
      }
    } else {
    }
    return false;
  }

  initVote(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-vote');
    if (("_narrative_vote" in window) && widget) {
      try {
        (<any>window)._narrative_vote.initWidget(widget);
      } catch (e) {
      }
    } else {
    }
    return false;
  }

  initRate(cb: (finishRender: boolean) => void) {
    let widgets = (<any>this.$refs).slideContent.querySelectorAll('.narrative-element-rate');
    if (("_narrative_rate" in window) && widgets.length > 0) {
      (<any>window)._narrative_rate_element = widgets;
      try {
        (<any>window)._narrative_rate.initWidget(widgets);
        // (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', widget)
      } catch (e) {
      }
    } else {
      // (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', undefined)
    }
    return false;
  }

  initTest(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-test');
    if (("_narrative_test" in window) && widget) {
      try {
        (<any>window)._narrative_test.initWidget(widget);
        (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_TEST', widget)
      } catch (e) {
      }
    } else {
      (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_TEST', undefined)
    }
    return false;
  }

  initCopy(cb: (finishRender: boolean) => void) {
    let widgets = (<any>this.$refs).slideContent.querySelectorAll('.narrative-element-copy');
    if (("_narrative_copy" in window) && widgets.length > 0) {
      try {
        (<any>window)._narrative_copy.initWidget(widgets);
      } catch (e) {
      }
    } else {
    }
    return false;
  }

  initShare(cb: (finishRender: boolean) => void) {
    let widgets = (<any>this.$refs).slideContent.querySelectorAll('.narrative-element-share');
    if (("_narrative_share" in window) && widgets.length > 0) {
      try {
        (<any>window)._narrative_share.initWidget(widgets, undefined, (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide'));
      } catch (e) {
      }
    } else {
    }
    return false;
  }

  initGame(cb: (finishRender: boolean) => void) {
    let widgets = (<any>this.$refs).slideContent.querySelectorAll('.narrative-element-game');
    if (("_narrative_game" in window) && widgets.length > 0) {
      try {
        (<any>window)._narrative_game.initWidget(widgets, undefined, (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide'));
      } catch (e) {
      }
    } else {
    }
    return false;
  }

  initQuest(cb: (finishRender: boolean) => void) {
    let widget = (<any>this.$refs).slideContent.querySelector('.narrative-element-quest');
    const slide = (<any>this.$refs).slideContent.querySelector('.narrative-slide');
    const quest = slide?.getAttribute('data-quest-count');
    if (!widget && quest !== null) {
      widget = slide;
    }
    if (("_narrative_quest" in window) && widget) {
      try {
        setTimeout(function () {
          cb((<any>window)._narrative_quest.initWidget(widget));
        });
        (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUEST', widget)
        return true;
      } catch (e) {
      }
    } else {
      (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUEST', undefined)
    }
    return false;
  }

  slideLoad(storyId: number, slideIndex: number) {
    // this.$emit('slideStartLoad');
    // start load screen
    const cb = () => {
      debug(`StoriesSlideItem.vue: load - slideReady:internal:${storyId}:${slideIndex}`)
      this.$emit('slideReady', storyId, slideIndex);
      this.state = SlideState.loaded;
      // this.slideLoaded = true;
    };

    debug(`StoriesSlideItem.vue: start_load - slideReady:internal:${storyId}:${slideIndex}`)
    if ((<HTMLElement>this.$refs['slideContent']).querySelector('.narrative-slide__with-video')) {
      this.state = SlideState.loading;
      onAllMediaLoaded((<any>this.$refs).slideContent, cb);
      this.initVideo((<any>this.$refs).slideContent);
    } else {
      cb();
    }

  }

  initVideo(slideBox: HTMLElement) {
    const videos = slideBox.querySelectorAll('video');
    let i;
    let video;
    for (i = 0; i < videos.length; ++i) {
      video = videos[i];

      // only on first time
      if (video.getAttribute('data-default-muted') === null) {
        if (video.muted) {
          video.setAttribute('data-default-muted', '1');
        } else {
          video.setAttribute('data-default-muted', '0');
        }
      }
    }
  }

  pauseVideo() {
    const videos = (<HTMLElement>this.$refs['slideContent']).querySelectorAll('video');
    let i;
    for (i = 0; i < videos.length; ++i) {
      videos[i].pause();
    }
  }

  resumeVideo() {
    const videos = (<HTMLElement>this.$refs['slideContent']).querySelectorAll('video');
    let i;
    for (i = 0; i < videos.length; ++i) {
      videos[i].play();
    }
  }


  @Watch('muted')
  onMuteChanged(muted: boolean) {
    this.$nextTick(() => {
      if (this.activeStory === this.currentStory && this.index === 0) {

        var videos = (<any>this.$refs).slideContent.querySelectorAll('video'), i, video;
        for (i = 0; i < videos.length; ++i) {
          video = videos[i];
          if (video.getAttribute('data-default-muted') !== '1') {
            video.muted = muted;
          }
        }
      }
    })
  }

  slideStart() {

    var containsCurrent = false;
    if ((<any>this.$refs).slideContent && (<any>this.$refs).slideContent.classList && (<any>this.$refs).slideContent.querySelector('.narrative-slide').classList.contains('current')) {
      containsCurrent = true;
    }

    let slides = (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide');
    if (slides.length > 0) {
      this._slideStarted = true;
    }

    if (!containsCurrent && slides.length === 0) {

      if (("_narrative_animation" in window)) {
        try {
          this._slideStarted = true;
          (<any>window)._narrative_animation.start((<any>this.$refs).slideContent.querySelector('.narrative-slide'), true);
          if (("narrative_slide_start" in window)) {
            (<any>window).narrative_slide_start((<any>this.$refs).slideContent.querySelector('.narrative-slide'));
          } else if (("story_slide_start" in window)) {
            (<any>window).story_slide_start({}, (<any>this.$refs).slideContent.querySelector('.narrative-slide'));
          }
        } catch (e) {
        }
      }

      var videos = (<any>this.$refs).slideContent.querySelectorAll('video'), i, video;
      for (i = 0; i < videos.length; ++i) {
        video = videos[i];

        video.pause();
        video.currentTime = 0;

        if (video.getAttribute('data-default-muted') !== '1') {
          video.muted = this.muted;
        }

        var playPromise = video.play();

        (function (videoScoped) {
          if (playPromise !== undefined) {
            playPromise.then(function () {
              videoScoped.currentTime = 0;
            })
              .catch(function (error: any) {
                console.error(error);
              });
          } else {
            setTimeout(function () {
              videoScoped.currentTime = 0;
            }, 0)
          }
        })(video);


      }


      // swipe up
      let element = (<any>this.$refs).slideContent.querySelector('.narrative-element-swipe-up');
      let swipeUpLinkTarget = undefined;
      let swipeUpElementId = undefined;
      if (element) {
        swipeUpLinkTarget = decodeURIComponent(element.getAttribute('data-link-target'));
        swipeUpElementId = element.getAttribute('data-element-id');
      }
      this.$emit('slideSwipeUpExists', {swipeUpLinkTarget, swipeUpElementId});

      // swipe up goods
      element = (<any>this.$refs).slideContent.querySelector('.narrative-element-swipe-up-items');
      swipeUpLinkTarget = undefined;
      swipeUpElementId = undefined;
      if (element) {
        swipeUpLinkTarget = decodeURIComponent(element.getAttribute('data-link-target'));
        swipeUpElementId = element.getAttribute('data-element-id');
      }
      this.$emit('slideSwipeUpGoodsExists', {swipeUpLinkTarget, swipeUpElementId});

    }
  }

  slideResume() {
    var containsCurrent = false;
    if ((<any>this.$refs).slideContent && (<any>this.$refs).slideContent.classList && (<any>this.$refs).slideContent.querySelector('.narrative-slide').classList.contains('current')) {
      containsCurrent = true;
    }

    let slides = (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide');
    if (slides.length > 0) {
      this._slideStarted = true;
    }

    if (!containsCurrent && slides.length === 0) {

      var currentSlide = (<any>this.$refs).slideContent;
      var videos = currentSlide.querySelectorAll('video'), i, video;
      for (i = 0; i < videos.length; ++i) {
        video = videos[i];
        video.play();
      }

    }

  }

  slidePause() {
    var containsCurrent = false;
    if ((<any>this.$refs).slideContent && (<any>this.$refs).slideContent.classList && (<any>this.$refs).slideContent.querySelector('.narrative-slide').classList.contains('current')) {
      containsCurrent = true;
    }

    let slides = (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide');
    if (slides.length > 0) {
      this._slideStarted = true;
    }

    if (!containsCurrent && slides.length === 0) {

      var currentSlide = (<any>this.$refs).slideContent;
      var videos = currentSlide.querySelectorAll('video'), i, video;
      for (i = 0; i < videos.length; ++i) {
        video = videos[i];
        video.pause();
      }

    }

  }

  slideStop() {

    var currentSlide = (<any>this.$refs).slideContent;

    this._slideStarted = false;
    if (("_narrative_animation" in window)) {
      try {
        (<any>window)._narrative_animation.stop((<any>this.$refs).slideContent.querySelector('.narrative-slide'), true);
        if (("narrative_slide_stop" in window)) {
          (<any>window).narrative_slide_stop((<any>this.$refs).slideContent.querySelector('.narrative-slide'));
        }
      } catch (e) {
      }
    }

    var videos = currentSlide.querySelectorAll('video'), i, video;
    for (i = 0; i < videos.length; ++i) {
      video = videos[i];
      video.pause();
      video.currentTime = 0;
    }

  }

  ready() {
  }

  stopAnimation() {
    var containsCurrent = false;
    if ((<any>this.$refs).slideContent && (<any>this.$refs).slideContent.classList && (<any>this.$refs).slideContent.querySelector('.narrative-slide')?.classList.contains('current')) {
      containsCurrent = true;
    }

    if (("_narrative_animation" in window) && containsCurrent) {
      try {
        this._slideStarted = true;
        (<any>window)._narrative_animation.stop((<any>this.$refs).slideContent.querySelector('.narrative-slide'), true);

        if (("narrative_slide_stop" in window)) {
          (<any>window).narrative_slide_stop((<any>this.$refs).slideContent.querySelector('.narrative-slide'));
        }

      } catch (e) {
      }
    }
  }

  @Watch('item')
  onItemChanged(to: number, from: number) {
    // call after updated
    this.$nextTick(() => {
      if (this.activeStory === this.currentStory && this.index === 0) {
        // смена сладйа на теккущей активной сторис (смена отображаемого item в компоненте)
        // вызываем init, смену статуса на preload и т.д.
        // + лоадер для видео запустится
        this.state = SlideState.none;
        this.itemShouldVisible();
      } else {
        // this.itemShouldHide();
      }
    })
  }


  @Watch('activeStory')
  onActiveStoryChanged(to: number, from: number) {
    // call after updated
    this.$nextTick(() => {
      // неактивные уже слайды
      if (this.state === SlideState.started && this.activeStory !== this.currentStory) {
        this.state = SlideState.none;
        if ((<HTMLElement>this.$refs['slideContent']).querySelector('.narrative-slide__with-video')) {
          this.state = SlideState.preloadWithVideo;
        }
        // и останавливаем слайд
        this.itemShouldHide();
        // console.log('active itemShouldHide', this.currentStory, this.state)
      }

      // if (this.activeStory === this.currentStory && this.index === 0) {
      //
      //     debug(`onActiveStoryChanged load - slideReady, to: ${to} from: ${from}`)
      //
      //     this.itemShouldVisible();
      // } else {
      //     this.itemShouldHide();
      // }
    })

    // if (to === true && from === false) {
    //     this.onPause();
    // } else if (to === false && from === true) {
    //     this.onResume();
    // }

  }


  @Watch('nextFlippingStoryId')
  onNextFlippingStoryIdChanged(to: Nullable<number>, from: Nullable<number>) {
    // call after updated
    this.$nextTick(() => {
      if (to === this.currentStory && this.index === 0) {
        debug('nextFlippingStoryId load - slideReady story: ' + to)
        // только если статус - черный экран без лоадера или none
        if (this.state === SlideState.preloadWithVideo || this.state === SlideState.none) {
          this.itemShouldVisible();
        } else {

        }
      }
    })
  }

  itemShouldVisible() {
    // this.slideLoaded = false;

    this.stopAnimation();

    // для session store (getNarrativeData)
    (<any>window).__activeNarrativeId = this.currentStory;


    // this.slideStart();

    new Promise((resolve, reject) => {

      const cb = (finishRender: boolean) => resolve({finishRender});

      let needWait = false;
      this.initQuiz(cb) && (needWait = true);
      this.initQuizGrouped(cb) && (needWait = true);
      this.initMultiSlide(cb) && (needWait = true);
      this.initDataInput(cb) && (needWait = true);
      this.initRangeSlider(cb) && (needWait = true);
      this.initPoll(cb) && (needWait = true);
      this.initPollLayers(cb) && (needWait = true);
      this.initVote(cb) && (needWait = true);
      this.initRate(cb) && (needWait = true);
      this.initTest(cb) && (needWait = true);
      this.initCopy(cb) && (needWait = true);
      this.initShare(cb) && (needWait = true);
      this.initGame(cb) && (needWait = true);
      this.initQuest(cb) && (needWait = true);

      if (!needWait) {
        resolve({finishRender: true});
      }

    }).then(finishRender => {
      finishRender && this.slideLoad(this.currentStory, this.index);
    });

  }

  itemShouldHide() {
    this.slideStop();
  }

  @Watch('slideStartEvent')
  onSlideStartEvent(to: boolean, from: boolean) {
    if (to) {

      if (this.state === SlideState.loaded) {
        debug(`load on slideStartEvent story: ${this.currentStory} index: ${this.index}`)
        this.slideStart() // todo call from parent
        this.state = SlideState.started;
      }

    }
  }

  @Watch('slideStartEventLayerIndex')
  onSlideStartEventLayerIndex(to: number | null, from: number | null) {
    if (to !== null) {
      debug('currentStory:', this.currentStory, 'activeStory:', this.activeStory, 'currentSlide:', this.index, 'activeSlide:', this.activeSlide);
      if (this.currentStory === this.activeStory /*&& this.index === this.activeSlide*/) {

        var layers = (<any>this.$refs).slideContent.querySelectorAll('.narrative-slide.narrative-multi-slide');
        layers = Array.prototype.slice.call(layers);
        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i];
          if (i === to) {
            layer.classList.remove('hidden');
            if (('_narrative_animation' in (<any>window))) {
              (<any>window)._narrative_animation.start(layer);
            }
            // self._statEventLayoutShow(selectIndex)
          } else {
            layer.classList.add('hidden');
          }
        }
      }

    }
  }

  @Watch('timerPaused')
  onSlideTimerChanged(to: boolean, from: boolean) {
    if (this.state === SlideState.started) {
      if ((<HTMLElement>this.$refs['slideContent']).querySelector('.narrative-slide__with-video')) {
        if (to === true) {
          this.pauseVideo();
        } else {
          this.resumeVideo();
        }
      }

      if (("_narrative_animation" in window)) {
        try {
          if (to === true) {
            (<any>window)._narrative_animation.pause((<any>this.$refs).slideContent.querySelector('.narrative-slide'), true);
          } else {
            (<any>window)._narrative_animation.resume((<any>this.$refs).slideContent.querySelector('.narrative-slide'), true);
          }

        } catch (e) {
        }
      }


    }
  }

  updated() {

  }

  beforeDestroy() {
    this.slideStop();
  }

  destroyed() {
    // if (this._slideStarted) {
    //     this.slideStop();
    // }
  }

  mounted() {
    if ((<HTMLElement>this.$refs['slideContent']).querySelector('.narrative-slide__with-video')) {
      this.state = SlideState.preloadWithVideo;
    }
  }

  public state: SlideState = SlideState.none;

  needLoadingMask() {
    return this.state === SlideState.preloadWithVideo || this.state === SlideState.loading;
  }

  needLoaderAnim() {
    return this.state === SlideState.loading;
  }


}

enum SlideState {
  none = 'none',
  preload = 'preload',
  preloadWithVideo = 'preload-with-video',
  loading = 'loading',
  loaded = 'loaded',
  started = 'started'
}

</script>

<style lang="scss">

.stories-viewer {

  &._paused-ui {
    .stories-pager, .stories-viewer__close {
      opacity: 0;
    }
  }

  .stories-pager, .stories-viewer__close {
    transition: opacity .3s ease-in;
  }

  .stories-item {
    pointer-events: none;
  }

  .stories-slide {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    overflow: hidden;
    /*will-change: transform;*/
    /*transform-origin: right center;*/

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    /*pointer-events: none;*/

    &._dummy {
      background-color: white;
    }

    .load-mask {
      position: absolute;
      background-color: black;
      z-index: 2000;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

  }

  .loading-spinner-default {
    -ms-flex-negative: 0;
    flex-shrink: 0;
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: solid 2px var(--loaderBackgroundColor, #343741);
    border-color: var(--loaderBackgroundAccentColor, #1BA9F5) var(--loaderBackgroundColor, #343741) var(--loaderBackgroundColor, #343741) var(--loaderBackgroundColor, #343741);
    -webkit-animation: loading-spinner .6s infinite linear;
    animation: loading-spinner .6s infinite linear;
  }

  @keyframes loading-spinner {
    from {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(359deg);
      transform: rotate(359deg);
    }
  }


  .stories-pager {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: inherit;
    /*height: 32px;*/
    /*background-image: linear-gradient(0deg, transparent, rgba(0, 0, 0, .01) 16%, rgba(0, 0, 0, .05) 32%, rgba(0, 0, 0, .1) 46%, rgba(0, 0, 0, .15) 56%, rgba(0, 0, 0, .2) 65%, rgba(0, 0, 0, .35) 90%, rgba(0, 0, 0, .4));*/

    height: 100px;
    background-image: linear-gradient(0deg, transparent, rgba(34, 34, 34, 0.4));

  }

  .stories-pager__ticks {
    height: 2px;
    display: flex;
    margin: 5px 5px;
  }

  .stories-pager__tick {
    background-color: hsla(0, 0%, 100%, .4);
    width: 100%;
    margin: 0 1px;
    overflow: hidden;
    position: relative;

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  .stories-pager__tick-progress {
    width: 100%;
    height: 2px;

    &._active {
      background-color: hsla(0, 0%, 100%, .9);
    }
  }

  .stories-pager__tick-progress-loader {
    width: 100%;
    height: 2px;
    position: absolute;
    top: 0;
    left: 0;
    // var color --root ???
    background: linear-gradient(to right, hsla(0, 0%, 100%, .9) var(--tick), transparent 0);
    /*background-color: hsla(0, 0%, 100%, .9);*/
    /*transition: width 0.2s;*/
  }

  .stories-slide {
    z-index: 1100;
    /*will-change: transform;*/
    /*transition: transform .3s linear;*/

    &._position_1 {
      /*&, &.shift-enter-to, &.shift-leave {
          transform: translateX(0%);
      }
      &.shift-enter, &.shift-leave-to {
          transform: translateX(-100%);
      }*/
      z-index: 1130;

    }

    &._position_2 {
      /*                &.shift-enter-to, &.shift-leave {
                          transform: translateX(100%);
                      }
                      &, &.shift-enter, &.shift-leave-to {
                          transform: translateX(0%);
                      }*/
      z-index: 1120;
    }
  }

  // aspect ratio
  .stories-slide-offset {
    position: relative;
    height: 100%;
  }

  .stories-slide-box {
    position: relative;
    padding: 154.838709677% 0 0 0;
  }

  .stories-slide-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    //will-change: transform;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

  }

  .stories-slide._position_1 {
    .narrative-element-link {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-quiz-answer {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    // расширенная область клика на весь виджет - для неточных снайперов
    .narrative-element-data-input {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-range-slider-input-container {
      pointer-events: all;
      cursor: pointer;
    }

    .narrative-element-poll-button {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-vote-answer {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-rate-input {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-range-slider-next-button {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-test-answer {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-quiz-next-button, .narrative-element-test-next-button {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-copy {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-share {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-story-repeat {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-game {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-image[data-link-target] {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-swipe-up {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

    .narrative-element-swipe-up-items {
      pointer-events: all;
      cursor: pointer;

      * {
        pointer-events: none;
      }
    }

  }
}


</style>
