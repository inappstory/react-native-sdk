<template>
    <div class="stories-slide" :class="`_position_${this.index + 1}`">
        <!-- tap, long tap, удержание пальца, swipe, swipe вниз с протяжкой - закрыть все -->
        <div class="stories-pager">
            <div class="stories-pager__ticks" :class="{ hiddenTimeline }">
                <div class="stories-pager__tick" v-for="i in count">
                    <div class="stories-pager__tick-progress" :class="{ _active: i <= activeSlide }"></div>
                    <div
                        class="stories-pager__tick-progress-loader"
                        @pointerdown=""
                        ref="tick"
                        v-show="i === activeSlide + 1 && activeStory === currentStory"
                    ></div>
                    <!--<slider-timer-tick class="stories-pager__tick-progress-loader" v-bind:paused="timerPaused" v-bind:duration="duration" v-if="i === activeSlide+1 && activeStory === currentStory"></slider-timer-tick>-->
                </div>
            </div>
        </div>
        <div
            class="stories-slide-offset"
            :style="{
                'margin': storiesSlideOffset,
                'width': storiesSlideWidth,
                'height': storiesSlideHeight,
                '--y-offset': storiesSlideOffsetY,
                '--x-offset': storiesSlideOffsetX,
            }"
        >
            <div class="stories-slide-box">
                <div
                    ref="slideContent"
                    v-html="item"
                    class="stories-slide-content narrative-slide"
                    :style="{ fontSize: slideFontSize, opacity: slideStateVisible ? 1 : 1 }"
                ></div>
            </div>
        </div>
        <div class="load-mask" v-if="needLoadingMask()">
            <!--            <span style="color: white">{{ state }}</span>-->
            <div class="loading-spinner-default" v-if="needLoaderAnim()"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Inject, Emit, Watch, Vue, Provide } from "vue-property-decorator";
import { onAllMediaLoaded } from "../../../helpers/media";
import { Getter } from "vuex-class";
import { debug } from "../../../util/debug";
import { finished } from "stream";
import eventBusInstance, { STORY_READER_INTERNAL_EVENTS } from "./EventBus";

@Component({
    name: "StoriesSlideItem",
})
export default class StoriesSlideItem extends Vue {
    /** property значения которые получает компонент */
    @Prop({ type: Number }) id!: number; // story id for view
    @Prop({ type: Boolean, default: false }) timerEnabled!: boolean;

    @Prop({ type: String }) item!: string;
    @Prop({ type: Number }) index!: number;
    @Prop({ type: Number }) count!: string;
    @Prop({ type: Boolean }) hiddenTimeline!: boolean;
    @Prop({ type: Number }) activeSlide!: number;
    @Prop({ type: Number }) duration!: string;
    @Prop({ type: Boolean }) timerPaused!: string;
    @Prop({ type: String }) storiesSlideOffset!: string;
    @Prop({ type: String }) storiesSlideOffsetX!: string;
    @Prop({ type: String }) storiesSlideOffsetY!: string;
    @Prop({ type: String }) slideFontSize!: string;
    @Prop({ type: String }) storiesSlideHeight!: string;
    @Prop({ type: String }) storiesSlideWidth!: string;
    @Prop({ type: Number }) activeStory!: number;
    @Prop({ type: Number }) currentStory!: number;
    @Prop({ type: Boolean }) slideStartEvent: boolean = false;
    @Prop({ type: Number }) slideStartEventLayerIndex: number | null = null;

    @Getter("muted", { namespace: "stories" }) muted!: boolean;
    @Getter("nextFlippingStoryId", { namespace: "stories" }) nextFlippingStoryId!: Nullable<number>;

    @Getter("activeSlideElementDateCountdown", { namespace: "stories" }) activeSlideElementDateCountdown!: any;

    private _slideStarted: boolean = false;

    /** Computed */
    get classList() {
        const background = (this.item as any).background;
        let backgroundClass =
            `_background-color-${background.color}` + (background.gradient === true ? "-gradient" : "");
        return [backgroundClass];
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
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-quiz");
        if ("_narrative_quiz" in window && widget) {
            try {
                (window as any)._narrative_quiz.initWidget(widget);
                (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_QUIZ", widget);
            } catch (e) {}
        } else {
            (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_QUIZ", undefined);
        }
        return false;
    }

    initQuizGrouped(cb: (finishRender: boolean) => void) {
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-quiz-grouped");
        if ("_narrative_quiz_grouped" in window && widget) {
            try {
                (window as any)._narrative_quiz_grouped.initWidget(widget);
                (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_QUIZ_GROUPED", widget);
            } catch (e) {}
        } else {
            (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_QUIZ_GROUPED", undefined);
        }
        return false;
    }

    initMultiSlide(cb: (finishRender: boolean) => void) {
        let slides = (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide");
        if ("_narrative_multi_slide" in window && slides.length) {
            try {
                (window as any)._narrative_multi_slide.init(slides);
            } catch (e) {
                console.error(e);
            }
        }
        return false;
    }

    initDataInput(cb: (finishRender: boolean) => void) {
        let widgets = (this.$refs as any).slideContent.querySelectorAll(".narrative-element-data-input");
        if ("_narrative_data_input" in window && widgets.length > 0) {
            (window as any)._narrative_data_input_element = widgets;
            try {
                (window as any)._narrative_data_input.initWidget(widgets);
            } catch (e) {}
        } else {
        }
        return false;
    }

    initRangeSlider(cb: (finishRender: boolean) => void) {
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-range-slider");
        if ("_narrative_range_slider" in window && widget) {
            try {
                (window as any)._narrative_range_slider.initWidget(widget);
                (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_RANGE_SLIDER", widget);
            } catch (e) {}
        } else {
            (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_RANGE_SLIDER", undefined);
        }
        return false;
    }

    initPoll(cb: (finishRender: boolean) => void) {
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-poll");
        if ("_narrative_poll" in window && widget) {
            (window as any)._narrative_poll_element = widget;
            try {
                (window as any)._narrative_poll.initWidget(widget);
            } catch (e) {}
        } else {
        }
        return false;
    }

    initPollLayers(cb: (finishRender: boolean) => void) {
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-poll-layers");
        if ("_narrative_poll_layers" in window && widget) {
            (window as any)._narrative_poll_layers_element = widget;
            try {
                (window as any)._narrative_poll_layers.initWidget(
                    widget,
                    undefined,
                    (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide")
                );
            } catch (e) {}
        } else {
        }
        return false;
    }

    initVote(cb: (finishRender: boolean) => void) {
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-vote");
        if ("_narrative_vote" in window && widget) {
            try {
                (window as any)._narrative_vote.initWidget(widget);
            } catch (e) {}
        } else {
        }
        return false;
    }

    initRate(cb: (finishRender: boolean) => void) {
        let widgets = (this.$refs as any).slideContent.querySelectorAll(".narrative-element-rate");
        if ("_narrative_rate" in window && widgets.length > 0) {
            (window as any)._narrative_rate_element = widgets;
            try {
                (window as any)._narrative_rate.initWidget(widgets);
                // (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', widget)
            } catch (e) {}
        } else {
            // (<any>this.$store).dispatch('stories/SET_ACTIVE_ELEMENT_QUIZ', undefined)
        }
        return false;
    }

    initTest(cb: (finishRender: boolean) => void) {
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-test");
        if ("_narrative_test" in window && widget) {
            try {
                (window as any)._narrative_test.initWidget(widget);
                (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_TEST", widget);
            } catch (e) {}
        } else {
            (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_TEST", undefined);
        }
        return false;
    }

    initCopy(cb: (finishRender: boolean) => void) {
        let widgets = (this.$refs as any).slideContent.querySelectorAll(".narrative-element-copy");
        if ("_narrative_copy" in window && widgets.length > 0) {
            try {
                (window as any)._narrative_copy.initWidget(widgets);
            } catch (e) {}
        } else {
        }
        return false;
    }

    initShare(cb: (finishRender: boolean) => void) {
        let widgets = (this.$refs as any).slideContent.querySelectorAll(".narrative-element-share");
        if ("_narrative_share" in window && widgets.length > 0) {
            try {
                (window as any)._narrative_share.initWidget(
                    widgets,
                    undefined,
                    (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide")
                );
            } catch (e) {}
        } else {
        }
        return false;
    }

    initGame(cb: (finishRender: boolean) => void) {
        let widgets = (this.$refs as any).slideContent.querySelectorAll(".narrative-element-game");
        if ("_narrative_game" in window && widgets.length > 0) {
            try {
                (window as any)._narrative_game.initWidget(
                    widgets,
                    undefined,
                    (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide")
                );
            } catch (e) {}
        } else {
        }
        return false;
    }

    initQuest(cb: (finishRender: boolean) => void) {
        let widget = (this.$refs as any).slideContent.querySelector(".narrative-element-quest");
        const slide = (this.$refs as any).slideContent.querySelector(".narrative-slide");
        const quest = slide?.getAttribute("data-quest-count");
        if (!widget && quest !== null) {
            widget = slide;
        }
        if ("_narrative_quest" in window && widget) {
            try {
                setTimeout(function () {
                    cb((window as any)._narrative_quest.initWidget(widget));
                });
                (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_QUEST", widget);
                return true;
            } catch (e) {}
        } else {
            (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_QUEST", undefined);
        }
        return false;
    }

    initDateCountdown() {
        let widgets = (this.$refs as any).slideContent.querySelectorAll(".narrative-element-date-countdown");
        if ("_narrative_date_countdown" in window && widgets.length > 0) {
            try {
                (window as any)._narrative_date_countdown.initWidget(
                    widgets,
                    (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide")
                );
                (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_DATE_COUNTDOWN", widgets);
            } catch (e) {}
        } else {
            (this.$store as any).dispatch("stories/SET_ACTIVE_ELEMENT_DATE_COUNTDOWN", undefined);
        }
        return false;
    }

    initSlideHasDisabledNavigation() {
        const slide = (this.$refs as any).slideContent.querySelector(".narrative-slide");
        let disableNavigation = false;
        if (slide != null) {
            disableNavigation = slide.dataset["disableNavigation"] === "1";
        }
        (this.$store as any).dispatch("stories/SET_ACTIVE_SLIDE_DISABLE_NAVIGATION", disableNavigation);
    }

    widgetsRefreshUserData() {
        const cb = (className: string, widgetClass: string) => {
            let widgets = (this.$refs as any).slideContent.querySelectorAll(`.${className}`);
            if (widgetClass in window && widgets.length > 0 && (window as any)[widgetClass].refreshUserData != null) {
                try {
                    (window as any)[widgetClass].refreshUserData(widgets);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        const widgetsMap = [
            ["narrative-element-quiz", "_narrative_quiz"],
            ["narrative-element-quiz-grouped", "_narrative_quiz_grouped"],
            ["narrative-element-data-input", "_narrative_data_input"],
            ["narrative-element-range-slider", "_narrative_range_slider"],
            ["narrative-element-poll", "_narrative_poll"],
            ["narrative-element-poll-layers", "_narrative_poll_layers"],
            ["narrative-element-vote", "_narrative_vote"],
            ["narrative-element-rate", "_narrative_rate"],
            ["narrative-element-test", "_narrative_test"],
            ["narrative-element-copy", "_narrative_copy"],
            ["narrative-element-share", "_narrative_share"],
            ["narrative-element-quest", "_narrative_quest"],
            ["narrative-element-date-countdown", "_narrative_date_countdown"],
        ];

        if (this.activeStory === this.currentStory && this.index === 0) {
            widgetsMap.forEach((widget) => cb(widget[0], widget[1]));
        }
    }

    widgetsRefreshUserDataListener = this.widgetsRefreshUserData.bind(this);

    slideLoad(storyId: number, slideIndex: number) {
        // this.$emit('slideStartLoad');
        // start load screen
        const _cb = () => {
            this.slideHasHeight((this.$refs as any).slideContent as HTMLElement).then((_) => {
                const textLines = Array.prototype.slice.call(
                    (this.$refs as any).slideContent.querySelectorAll(
                        ".narrative-element-text-wrapper>.narrative-element-text-lines"
                    )
                );
                TextFit(textLines, {});

                debug(`StoriesSlideItem.vue: load - slideReady:internal:${storyId}:${slideIndex}`);
                this.$emit("slideReady", storyId, slideIndex);
                this.state = SlideState.loaded;
                // this.slideLoaded = true;

                this._resumeWidgets();
            });
        };

        const cb = () => {
            // wait for fonts load
            if ("fonts" in document) {
                document.fonts.ready && document.fonts.ready.then(_cb).catch(_cb);
            } else {
                _cb();
            }
        };

        debug(`StoriesSlideItem.vue: start_load - slideReady:internal:${storyId}:${slideIndex}`);
        if ((this.$refs["slideContent"] as HTMLElement).querySelector(".narrative-slide__with-video")) {
            this.state = SlideState.loading;
            onAllMediaLoaded((this.$refs as any).slideContent, cb);
            this.initVideo((this.$refs as any).slideContent);
        } else {
            // monitor imagePlaceholder loading
            onAllMediaLoaded((this.$refs as any).slideContent, () => {});
            cb();
        }
    }

    initVideo(slideBox: HTMLElement) {
        const videos = slideBox.querySelectorAll("video");
        let i;
        let video;
        for (i = 0; i < videos.length; ++i) {
            video = videos[i];

            // only on first time
            if (video.getAttribute("data-default-muted") === null) {
                if (video.muted) {
                    video.setAttribute("data-default-muted", "1");
                } else {
                    video.setAttribute("data-default-muted", "0");
                }
            }
        }
    }

    pauseVideo() {
        const videos = (this.$refs["slideContent"] as HTMLElement).querySelectorAll("video");
        let i;
        for (i = 0; i < videos.length; ++i) {
            videos[i].pause();
        }
    }

    resumeVideo() {
        const videos = (this.$refs["slideContent"] as HTMLElement).querySelectorAll("video");
        let i;
        for (i = 0; i < videos.length; ++i) {
            videos[i].play();
        }
    }

    _pauseWidgets() {
        if (this.activeSlideElementDateCountdown) {
            if ("_narrative_date_countdown" in window && this.activeSlideElementDateCountdown.length) {
                try {
                    (window as any)._narrative_date_countdown.pause(this.activeSlideElementDateCountdown);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    _resumeWidgets() {
        if (this.activeSlideElementDateCountdown) {
            if ("_narrative_date_countdown" in window && this.activeSlideElementDateCountdown.length) {
                try {
                    (window as any)._narrative_date_countdown.resume(this.activeSlideElementDateCountdown);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    @Watch("muted")
    onMuteChanged(muted: boolean) {
        this.$nextTick(() => {
            if (this.activeStory === this.currentStory && this.index === 0) {
                var videos = (this.$refs as any).slideContent.querySelectorAll("video"),
                    i,
                    video;
                for (i = 0; i < videos.length; ++i) {
                    video = videos[i];
                    if (video.getAttribute("data-default-muted") !== "1") {
                        video.muted = muted;
                    }
                }
            }
        });
    }

    slideStart() {
        var containsCurrent = false;
        if (
            (this.$refs as any).slideContent &&
            (this.$refs as any).slideContent.classList &&
            (this.$refs as any).slideContent.querySelector(".narrative-slide").classList.contains("current")
        ) {
            containsCurrent = true;
        }

        let slides = (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide");
        if (slides.length > 0) {
            this._slideStarted = true;
        }

        if (!containsCurrent && slides.length === 0) {
            this.slideHasHeight((this.$refs as any).slideContent as HTMLElement).then((_) => {
                var textLines = Array.prototype.slice.call(
                    (this.$refs as any).slideContent.querySelectorAll(
                        ".narrative-element-text-wrapper>.narrative-element-text-lines"
                    )
                );
                TextFit(textLines, {});

                if ("_narrative_animation" in window) {
                    try {
                        this._slideStarted = true;
                        (window as any)._narrative_animation.start(
                            (this.$refs as any).slideContent.querySelector(".narrative-slide"),
                            true
                        );
                        if ("narrative_slide_start" in window) {
                            (window as any).narrative_slide_start(
                                (this.$refs as any).slideContent.querySelector(".narrative-slide")
                            );
                        } else if ("story_slide_start" in window) {
                            (window as any).story_slide_start(
                                {},
                                (this.$refs as any).slideContent.querySelector(".narrative-slide")
                            );
                        }
                    } catch (e) {}
                }

                var videos = (this.$refs as any).slideContent.querySelectorAll("video"),
                    i,
                    video;
                for (i = 0; i < videos.length; ++i) {
                    video = videos[i];

                    video.pause();
                    video.currentTime = 0;

                    if (video.getAttribute("data-default-muted") !== "1") {
                        video.muted = this.muted;
                    }

                    var playPromise = video.play();

                    (function (videoScoped) {
                        if (playPromise !== undefined) {
                            playPromise
                                .then(function () {
                                    videoScoped.currentTime = 0;
                                })
                                .catch(function (error: any) {
                                    console.error(error);
                                });
                        } else {
                            setTimeout(function () {
                                videoScoped.currentTime = 0;
                            }, 0);
                        }
                    })(video);
                }

                // swipe up
                let element = (this.$refs as any).slideContent.querySelector(".narrative-element-swipe-up");
                let swipeUpLinkTarget = undefined;
                let swipeUpElementId = undefined;
                if (element) {
                    swipeUpLinkTarget = decodeURIComponent(element.getAttribute("data-link-target"));
                    swipeUpElementId = element.getAttribute("data-element-id");
                }
                this.$emit("slideSwipeUpExists", { swipeUpLinkTarget, swipeUpElementId });

                // swipe up goods
                element = (this.$refs as any).slideContent.querySelector(".narrative-element-swipe-up-items");
                swipeUpLinkTarget = undefined;
                swipeUpElementId = undefined;
                if (element) {
                    swipeUpLinkTarget = decodeURIComponent(element.getAttribute("data-link-target"));
                    swipeUpElementId = element.getAttribute("data-element-id");
                }
                this.$emit("slideSwipeUpGoodsExists", { swipeUpLinkTarget, swipeUpElementId });
                this._resumeWidgets();
            });
        }
    }

    slideResume() {
        var containsCurrent = false;
        if (
            (this.$refs as any).slideContent &&
            (this.$refs as any).slideContent.classList &&
            (this.$refs as any).slideContent.querySelector(".narrative-slide").classList.contains("current")
        ) {
            containsCurrent = true;
        }

        let slides = (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide");
        if (slides.length > 0) {
            this._slideStarted = true;
        }

        if (!containsCurrent && slides.length === 0) {
            var currentSlide = (this.$refs as any).slideContent;
            var videos = currentSlide.querySelectorAll("video"),
                i,
                video;
            for (i = 0; i < videos.length; ++i) {
                video = videos[i];
                video.play();
            }
        }
    }

    slidePause() {
        var containsCurrent = false;
        if (
            (this.$refs as any).slideContent &&
            (this.$refs as any).slideContent.classList &&
            (this.$refs as any).slideContent.querySelector(".narrative-slide").classList.contains("current")
        ) {
            containsCurrent = true;
        }

        let slides = (this.$refs as any).slideContent.querySelectorAll(".narrative-slide.narrative-multi-slide");
        if (slides.length > 0) {
            this._slideStarted = true;
        }

        if (!containsCurrent && slides.length === 0) {
            var currentSlide = (this.$refs as any).slideContent;
            var videos = currentSlide.querySelectorAll("video"),
                i,
                video;
            for (i = 0; i < videos.length; ++i) {
                video = videos[i];
                video.pause();
            }
        }
    }

    slideStop() {
        var currentSlide = (this.$refs as any).slideContent;

        this._slideStarted = false;
        if ("_narrative_animation" in window) {
            try {
                (window as any)._narrative_animation.stop(
                    (this.$refs as any).slideContent.querySelector(".narrative-slide"),
                    true
                );
                if ("narrative_slide_stop" in window) {
                    (window as any).narrative_slide_stop(
                        (this.$refs as any).slideContent.querySelector(".narrative-slide")
                    );
                }
            } catch (e) {}
        }

        var videos = currentSlide.querySelectorAll("video"),
            i,
            video;
        for (i = 0; i < videos.length; ++i) {
            video = videos[i];
            video.pause();
            video.currentTime = 0;
        }

        // прилетает уже на следующий активный слайд/исправить
        // console.log('widgets stop')
        // this._pauseWidgets();
    }

    async slideHasHeight(slide: HTMLElement) {
        const limit = 10;
        let current = 0;
        const checker = () => slide.getBoundingClientRect().height > 0;
        return new Promise<void>((resolve, reject) => {
            const step = () => {
                current++;
                if (checker() || current > limit) {
                    resolve();
                } else {
                    requestAnimationFrame(step);
                }
            };
            step();
        });
    }

    ready() {}

    stopAnimation() {
        var containsCurrent = false;
        if (
            (this.$refs as any).slideContent &&
            (this.$refs as any).slideContent.classList &&
            (this.$refs as any).slideContent.querySelector(".narrative-slide")?.classList.contains("current")
        ) {
            containsCurrent = true;
        }

        if ("_narrative_animation" in window && containsCurrent) {
            try {
                this._slideStarted = true;
                (window as any)._narrative_animation.stop(
                    (this.$refs as any).slideContent.querySelector(".narrative-slide"),
                    true
                );

                if ("narrative_slide_stop" in window) {
                    (window as any).narrative_slide_stop(
                        (this.$refs as any).slideContent.querySelector(".narrative-slide")
                    );
                }
            } catch (e) {}
        }
    }

    @Watch("item")
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
        });
    }

    @Watch("activeStory")
    onActiveStoryChanged(to: number, from: number) {
        // call after updated
        this.$nextTick(() => {
            // неактивные уже слайды
            if (this.state === SlideState.started && this.activeStory !== this.currentStory) {
                this.state = SlideState.none;
                if ((this.$refs["slideContent"] as HTMLElement).querySelector(".narrative-slide__with-video")) {
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
        });

        // if (to === true && from === false) {
        //     this.onPause();
        // } else if (to === false && from === true) {
        //     this.onResume();
        // }
    }

    @Watch("nextFlippingStoryId")
    onNextFlippingStoryIdChanged(to: Nullable<number>, from: Nullable<number>) {
        // call after updated
        this.$nextTick(() => {
            if (to === this.currentStory && this.index === 0) {
                debug("nextFlippingStoryId load - slideReady story: " + to);
                // только если статус - черный экран без лоадера или none
                if (this.state === SlideState.preloadWithVideo || this.state === SlideState.none) {
                    this.itemShouldVisible();
                } else {
                }
            }
        });
    }

    itemShouldVisible() {
        // this.slideLoaded = false;

        this.stopAnimation();

        this._pauseWidgets();

        // для session store (getNarrativeData)
        (window as any).__activeNarrativeId = this.currentStory;

        // this.slideStart();

        new Promise((resolve, reject) => {
            const cb = (finishRender: boolean) => resolve({ finishRender });

            let needWait = false;
            this.initSlideHasDisabledNavigation();
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
            this.initDateCountdown() && (needWait = true);

            if (!needWait) {
                resolve({ finishRender: true });
            }
        }).then((finishRender) => {
            finishRender && this.slideLoad(this.currentStory, this.index);
        });
    }

    itemShouldHide() {
        this.slideStop();
    }

    @Watch("slideStartEvent")
    onSlideStartEvent(to: boolean, from: boolean) {
        if (to) {
            if (this.state === SlideState.loaded) {
                debug(`load on slideStartEvent story: ${this.currentStory} index: ${this.index}`);
                this.slideStart(); // todo call from parent
                this.state = SlideState.started;
            }
        }
    }

    @Watch("slideStartEventLayerIndex")
    onSlideStartEventLayerIndex(to: number | null, from: number | null) {
        if (to !== null) {
            debug(
                "currentStory:",
                this.currentStory,
                "activeStory:",
                this.activeStory,
                "currentSlide:",
                this.index,
                "activeSlide:",
                this.activeSlide
            );
            if (this.currentStory === this.activeStory /*&& this.index === this.activeSlide*/) {
                var layers = (this.$refs as any).slideContent.querySelectorAll(
                    ".narrative-slide.narrative-multi-slide"
                );
                layers = Array.prototype.slice.call(layers);
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if (i === to) {
                        layer.classList.remove("hidden");
                        if ("_narrative_animation" in (window as any)) {
                            (window as any)._narrative_animation.start(layer);
                        }
                        // self._statEventLayoutShow(selectIndex)
                    } else {
                        layer.classList.add("hidden");
                    }
                }
            }
        }
    }

    @Watch("timerPaused")
    onSlideTimerChanged(to: boolean, from: boolean) {
        if (this.state === SlideState.started) {
            if ((this.$refs["slideContent"] as HTMLElement).querySelector(".narrative-slide__with-video")) {
                if (to === true) {
                    this.pauseVideo();
                } else {
                    this.resumeVideo();
                }
            }

            if ("_narrative_animation" in window) {
                try {
                    if (to === true) {
                        (window as any)._narrative_animation.pause(
                            (this.$refs as any).slideContent.querySelector(".narrative-slide"),
                            true
                        );
                    } else {
                        (window as any)._narrative_animation.resume(
                            (this.$refs as any).slideContent.querySelector(".narrative-slide"),
                            true
                        );
                    }
                } catch (e) {}
            }

            if (to === true) {
                this._pauseWidgets();
            } else {
                this._resumeWidgets();
            }
        }
    }

    updated() {}

    beforeDestroy() {
        this.slideStop();
    }

    created() {
        eventBusInstance.addListener(
            STORY_READER_INTERNAL_EVENTS.REFRESH_WIDGETS_STATE,
            this.widgetsRefreshUserDataListener
        );
    }

    destroyed() {
        eventBusInstance.removeListener(
            STORY_READER_INTERNAL_EVENTS.REFRESH_WIDGETS_STATE,
            this.widgetsRefreshUserDataListener
        );
        // if (this._slideStarted) {
        //     this.slideStop();
        // }
    }

    mounted() {
        if ((this.$refs["slideContent"] as HTMLElement).querySelector(".narrative-slide__with-video")) {
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
    none = "none",
    preload = "preload",
    preloadWithVideo = "preload-with-video",
    loading = "loading",
    loaded = "loaded",
    started = "started",
}

const TextFit = (function () {
    "use strict";
    type Settings = {
        step: number;
        maxSteps: number;
    };

    const defaultSettings = {
        step: 0.01,
        maxSteps: 100,
    };

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    return function textFit(els: any, options: Partial<Settings>) {
        if (!options) options = {};

        // Extend options.
        var settings = {};
        for (var key in defaultSettings) {
            if (hasOwnProperty.call(options, key)) {
                // @ts-ignore
                settings[key] = options[key];
            } else {
                // @ts-ignore
                settings[key] = defaultSettings[key];
            }
        }

        // Support passing a single el
        var elType = Object.prototype.toString.call(els);
        if (elType !== "[object Array]" && elType !== "[object NodeList]" && elType !== "[object HTMLCollection]") {
            els = [els];
        }

        // Process each el we've passed.
        for (var i = 0; i < els.length; i++) {
            processItem(els[i] as HTMLElement, settings as Settings);
        }
    };

    function processItem(el: HTMLElement, settings: Settings) {
        if (!isElement(el) || el.getAttribute("textFitted")) {
            return false;
        }

        var parentHeight, parent;
        var low, high;

        parent = el.parentElement;
        if (!isElement(parent)) {
            return false;
        }

        // Get element data.
        parentHeight = innerHeight(parent);

        // Don't process if we can't find box dimensions
        if (parentHeight <= 0) {
            console.warn(
                `Set a static height and width on the target element ${el.outerHTML} before using textFit!`,
                el
            );
            return;
        }

        // Set textFitted attribute so we know this was processed.
        el.setAttribute("textFitted", "1");

        var step = settings.step;

        high = parseFloat(el.style.fontSize);
        low = high - step * settings.maxSteps;
        var size = high;
        if (size < low) return;
        while (size >= low) {
            var elBoundingClientRect = el.getBoundingClientRect();
            if (elBoundingClientRect.height > parentHeight) {
                size -= step;
                el.style.fontSize = size + "em";
            } else {
                break;
            }
        }
    }

    // Calculate height without padding.
    // @ts-ignore
    function innerHeight(el) {
        var style = window.getComputedStyle(el, null);
        return (
            el.getBoundingClientRect().height -
            parseInt(style.getPropertyValue("padding-top"), 10) -
            parseInt(style.getPropertyValue("padding-bottom"), 10)
        );
    }

    //Returns true if it is a DOM element
    // @ts-ignore
    function isElement(o) {
        return typeof HTMLElement === "object"
            ? o instanceof HTMLElement //DOM2
            : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
    }
})();
</script>

<style lang="scss">
.stories-viewer {
    &._paused-ui {
        .stories-pager,
        .stories-viewer__close {
            opacity: 0;
        }
    }

    .stories-pager,
    .stories-viewer__close {
        transition: opacity 0.3s ease-in;
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
        border-color: var(--loaderBackgroundAccentColor, #1ba9f5) var(--loaderBackgroundColor, #343741)
            var(--loaderBackgroundColor, #343741) var(--loaderBackgroundColor, #343741);
        -webkit-animation: loading-spinner 0.6s infinite linear;
        animation: loading-spinner 0.6s infinite linear;
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
        margin-top: var(--timelineBlockTopOffset, 5px);
        opacity: 1;
        &.hiddenTimeline {
            opacity: var(--tickOpacity, 0);
        }
    }

    .stories-pager__tick {
        background-color: hsla(0, 0%, 100%, 0.4);
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
            background-color: hsla(0, 0%, 100%, 0.9);
        }
    }

    .stories-pager__tick-progress-loader {
        width: 100%;
        height: 2px;
        position: absolute;
        top: 0;
        left: 0;
        // var color --root ???
        background: linear-gradient(to right, hsla(0, 0%, 100%, 0.9) var(--tick), transparent 0);
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
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
            "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
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

        .narrative-element-quiz-next-button,
        .narrative-element-test-next-button {
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

    @media (prefers-color-scheme: dark) {
        .stories-pager__tick {
            background-color: hsla(0, 0%, 100%, 0.4);
        }
        .stories-pager__tick-progress {
            &._active {
                background-color: hsla(0, 0%, 100%, 0.9);
            }
        }
        .stories-pager__tick-progress-loader {
            background: linear-gradient(to right, hsla(0, 0%, 100%, 0.9) var(--tick), transparent 0);
        }
    }
}
</style>
