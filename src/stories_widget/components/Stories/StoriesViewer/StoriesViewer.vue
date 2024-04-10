<template>
    <!--<transition name="fade" appear>-->
    <div
        class="stories-viewer slider3d"
        ref="storiesViewer"
        :style="rootVars"
        :class="{
            '_paused-ui': pausedUI,
            '_close-gesture': closeGestureInAction,
            '_desktop-mode': desktopMode,
            '_with-bottom-panel': needBottomPanel,
        }"
    >
        <div
            class="stories-viewer-background"
            v-if="desktopMode"
            :style="{
                'background-image': `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(${displayedSlideImage})`,
            }"
        ></div>
        <div
            class="slider3d__wrapper"
            :style="{
                '-webkit-perspective': `${perspective}px`,
                'perspective': `${perspective}px`,
                'width': storiesSlideWidth(currentStory),
                'padding': viewportSafeAreaSize(),
            }"
            @click.stop.prevent="slideClick"
            ref="innerSlider"
        >
            <div class="slider3d__inner" :style="{ transform: `translateZ(-${depth}px)` }" ref="slider3dInner">
                <div class="stories-face slider3d__rotater" ref="rotater">
                    <template v-for="(item, index) in displayedItems">
                        <stories-slider-blank
                            v-if="isBlankStories(item)"
                            :key="item.id"
                            :id="item.id"
                            :style="{
                                display: Math.abs(index - currentIndex) <= 1 ? 'block' : 'none',
                                transition: transformStyle === 'flat' || transformStyle === 'cover' ? 'inherit' : '',
                                transform:
                                    transformStyle === 'flat'
                                        ? `translateZ(0) translateX(${-100 + index * 100}%)`
                                        : transformStyle === 'cover'
                                        ? `translateZ(0) translateX(${index === 0 ? -10 : -100 + index * 100}%) scale(${
                                              index === 0 ? 0.9 : 1
                                          })` // cover
                                        : 'rotateY(' + index * angle + `deg) translateZ(${depth}px)`, // cube
                            }"
                            :class="storiesItemClass({ id: item.id, index })"
                            :timerPaused="timerPaused"
                            :storiesSlideOffset="storiesSlideOffset(item)"
                            :storiesSlideOffsetX="storiesSlideOffsetX(item)"
                            :storiesSlideOffsetY="storiesSlideOffsetY(item)"
                            :slideFontSize="slideFontSize(item)"
                            :storiesSlideHeight="storiesSlideHeight(item)"
                            :storiesSlideWidth="storiesSlideWidth(item)"
                        />
                        <stories-slider
                            class="stories-item slider3d__item"
                            ref="storiesSlide"
                            v-else
                            :item="item"
                            :key="item.id"
                            :id="item.id"
                            :timeout="timeout"
                            :activeSlide="storyActiveSlide[index]"
                            :activeStory="id"
                            :style="{
                                display: Math.abs(index - currentIndex) <= 1 ? 'block' : 'none',
                                transition: transformStyle === 'flat' || transformStyle === 'cover' ? 'inherit' : '',
                                transform:
                                    transformStyle === 'flat'
                                        ? `translateZ(0) translateX(${-100 * currentIndex + index * 100}%)`
                                        : transformStyle === 'cover'
                                        ? `translateZ(0) translateX(${
                                              index === 0 ? -10 : -100 * currentIndex + index * 100
                                          }%) scale(${index === 0 ? 0.9 : 1})` // cover
                                        : 'rotateY(' + index * angle + `deg) translateZ(${depth}px)`, // cube
                                bottom: `${storiesSlideBottomPosition(item)}px`,
                            }"
                            :class="storiesItemClass({ id: item.id, index })"
                            :timerPaused="timerPaused"
                            :storiesSlideOffset="storiesSlideOffset(item)"
                            :storiesSlideOffsetX="storiesSlideOffsetX(item)"
                            :storiesSlideOffsetY="storiesSlideOffsetY(item)"
                            :slideFontSize="slideFontSize(item)"
                            :storiesSlideHeight="storiesSlideHeight(item)"
                            :storiesSlideWidth="storiesSlideWidth(item)"
                            @slideReady="onSlideReady"
                            @slideSwipeUpExists="slideSwipeUpExists"
                            @slideSwipeUpGoodsExists="slideSwipeUpGoodsExists"
                            :slideStartEvent="slideStartEvent"
                            :slideStartEventLayerIndex="slideStartEventLayerIndex"
                        >
                            <button
                                slot="header"
                                class="stories-viewer__close"
                                :style="closeButtonPosition === 'left' ? { left: '15px' } : { right: '15px' }"
                                @click.stop.prevent="() => closeViewer('closeReaderByCloseBtn')"
                                v-if="!item.disable_close"
                                v-html="options.closeButton.svgSrc.baseState"
                            />

                            <template #bottom>
                                <div
                                    class="stories-button-panel"
                                    :style="{
                                        height: `${storiesSlideBottomPosition(item)}px`,
                                        transform: `translateY(${storiesSlideBottomPosition(item)}px)`,
                                    }"
                                >
                                    <div class="stories-button-panel-actions" v-if="needBottomPanel">
                                        <span v-if="hasLike(item)">
                                            <template v-if="sdkHasLikeButton">
                                                <span
                                                    class="button-panel-action like-up"
                                                    v-if="item.like === 0 || item.like === -1"
                                                    v-html="options.likeButton.svgSrc.baseState"
                                                />
                                                <span
                                                    v-else-if="item.like === 1"
                                                    class="button-panel-action like-up-filled"
                                                    v-html="options.likeButton.svgSrc.activeState"
                                                />
                                            </template>
                                            <template v-if="sdkHasDislikeButton">
                                                <span
                                                    v-if="item.like === 0 || item.like === 1"
                                                    class="button-panel-action like-down"
                                                    v-html="options.dislikeButton.svgSrc.baseState"
                                                />
                                                <span
                                                    v-else-if="item.like === -1"
                                                    class="button-panel-action like-down-filled"
                                                    v-html="options.dislikeButton.svgSrc.activeState"
                                                />
                                            </template>
                                        </span>
                                        <span v-if="hasFavorite(item)">
                                            <span
                                                v-if="!item.favorite"
                                                class="button-panel-action bookmark"
                                                v-html="options.favoriteButton.svgSrc.baseState"
                                            />
                                            <span
                                                v-else
                                                class="button-panel-action bookmark-filled"
                                                v-html="options.favoriteButton.svgSrc.activeState"
                                            />
                                        </span>

                                        <span class="right-container">
                                            <span v-if="item.has_audio">
                                                <span
                                                    class="button-panel-action muted-icon"
                                                    v-if="muted"
                                                    v-html="options.muteButton.svgSrc.baseState"
                                                />
                                                <span
                                                    class="button-panel-action sound-icon"
                                                    v-else
                                                    v-html="options.muteButton.svgSrc.activeState"
                                                />
                                            </span>

                                            <span v-if="hasShare(item)">
                                                <span
                                                    class="button-panel-action share"
                                                    v-html="options.shareButton.svgSrc.baseState"
                                                />
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </stories-slider>
                    </template>
                </div>
            </div>

            <game-reader
                class="game-reader-wrapper"
                v-if="gameReaderVisible"
                :game-data="gameReaderData"
                :desktopMode="desktopMode"
                :story-manager-proxy="storyManagerProxy"
            />

            <SharePanel :share-link="shareLink" v-model="sharePanelOpen" @shareComplete="sharePanelComplete" />

            <InputModal
                :config="inputModalConfig"
                v-model="inputModalOpen"
                @inputComplete="$emit('inputModalComplete', $event)"
            />
        </div>

        <template v-if="displayedItems.length > 1">
            <div class="slider3d__btn_next" :style="{ transform: desktopBtnNextPosition }">
                <button
                    class="btn-icon"
                    @click.stop.prevent="!_rotating && nextStory(1)"
                    :disabled="nextStoryBlank || pausedUI"
                >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12.1924 25.1924L22.799 14.5858L24.2132 16L13.6066 26.6066L12.1924 25.1924Z"
                            fill="currentColor"
                        />
                        <path
                            d="M13.6066 5.3934L24.2132 16L22.799 17.4142L12.1924 6.80761L13.6066 5.3934Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            </div>
            <div class="slider3d__btn_prev" :style="{ transform: desktopBtnPrevPosition }">
                <button
                    class="btn-icon"
                    @click.stop.prevent="!_rotating && nextStory(-1)"
                    :disabled="prevStoryBlank || pausedUI"
                >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M19.8076 6.80761L9.20101 17.4142L7.7868 16L18.3934 5.3934L19.8076 6.80761Z"
                            fill="currentColor"
                        />
                        <path
                            d="M18.3934 26.6066L7.7868 16L9.20101 14.5858L19.8076 25.1924L18.3934 26.6066Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            </div>
        </template>

        <article-viewer
            v-if="articleViewerVisible"
            :id="articleId"
            :type="articleType"
            :uid="articleUid"
        ></article-viewer>

        <screen-orientation-lock v-if="wrongScreenOrientation" />
    </div>
    <!--</transition>-->
</template>

<script lang="ts">
// TODO utils or lodash
import StoriesItem from "../../../models/StoriesItem";
import { Component, Emit, Inject, Prop, Vue, Watch } from "vue-property-decorator";
import StoriesSlider from "../../Stories/StoriesViewer/StoriesSlider.vue";
import StoriesSliderBlank from "../../Stories/StoriesViewer/StoriesSliderBlank.vue";
import { _winHeight, _winWidth } from "../../../util/window-size";
import { animate } from "../../../util/animation";
import { ReaderOptions, WidgetStoriesOptions } from "../../../models/WidgetStoriesOptions";
import { Getter } from "vuex-class";
import ArticleViewer from "../../Article/ArticleViewer.vue";
import { IssueArticleOptions } from "../../../models/IssueArticle";
import { ArticleOptions } from "../../../models/Article";

import { Dict, Option } from "../../../../../global.h";

import {
    EVENT_ARTICLE_CLOSE,
    EVENT_ISSUE_ARTICLE_CLOSE,
    EVENT_STORIES_NEXT_SLIDE,
    EVENT_STORIES_TRANSITION_FROM_SLIDE,
    StoriesStatistic,
    TransitionFromSlideEvent,
} from "../../StoriesStatistic";
import { NarrativeData } from "../../../models/NarrativeData";
import NarrativeContext from "../../../models/NarrativeContext";

import { debug } from "../../../util/debug";
import { needSession } from "../../../util/env";
import GameReader from "../../GameReader/GameReader.vue";
import SharePanel from "../../SharePanel/SharePanel.vue";
import InputModal from "../../InputModal/InputModal.vue";

import { getOrientation, SCREEN_ORIENTATIONS } from "../../../helpers/o9n";
import ScreenOrientationLock from "../../Stories/StoriesViewer/ScreenOrientationLock.vue";

const orientation = getOrientation();

import { debugLog } from "../../../common_widget/common";
import { AppearanceCommonOptions } from "../../../../story-manager/appearanceCommon.h";
import { StoryReaderOptions } from "../../../../widget-story-reader/index.h";
import { isFunction } from "../../../../helpers/isFunction";
import { isObject } from "../../../../helpers/isObject";
import * as ScreenShotGenerator from "../../../helpers/ScreenShotGenerator";
import { InputModalCompletePayload, InputModalConfig } from "../../InputModal/InputModal.h";
import { StoriesState } from "../../../store/vuex-stories-module";
import eventBusInstance, { STORY_READER_INTERNAL_EVENTS } from "./EventBus";

type GameData = {
    gameFile: string;
    coverFile: string;
    gameConfig: string;
    addResources: string;
};

const sliderOptions = {
    speed: 350, // 350
    dragSpeedCoef: 1,
    easing: "linear",
    persMult: 1.6,
    allowDragDuringAnim: false,
};

export interface BlankStoriesItem {
    blank: boolean;
    id: number;
}

const namespace: string = "stories";

@Component({
    name: "StoriesViewer",
    components: {
        ScreenOrientationLock,
        ArticleViewer,
        StoriesSlider,
        StoriesSliderBlank,
        GameReader,
        SharePanel,
        InputModal,
    },
})
export default class StoriesViewer extends Vue {
    /** property значения которые получает компонент */
    @Prop({ type: Number }) id!: number; // story id for view
    @Prop({ type: Boolean, default: false }) timerEnabled!: boolean;
    @Prop({
        type: Function,
        default: (name: string, data: any) => new Promise((resolve) => resolve(undefined)),
    })
    storyManagerProxy!: (name: string, data: any) => Promise<any>;

    /** Component data */
    data() {
        return {
            activeStory: this.$store.getters["stories/storyId"],
        };
    }

    gameReaderVisible: boolean = false;
    gameReaderData: Option<GameData> = null;

    articleViewerVisible: boolean = false;
    articleId: string = "";
    articleType: string = "";
    articleUid: string = "";

    activeSlide: number = 0;
    storyActiveSlide: Array<number> = [0];
    loaded: boolean = false;
    activeStory!: number;
    // displayedItems: Array<StoriesItem | BlankStoriesItem> = []; // todo - одновременно монтировать только 3 stories
    // displayedItemsIndexes: Array<number> = [];
    loadedItemsIndexes: Array<number> = [];
    anim: boolean = false;
    opened: boolean = false;
    leftSlideEl!: HTMLElement | null;
    centralSlideEl!: HTMLElement | null;
    rightSlideEl!: HTMLElement | null;

    sliderWidth: number = 0;
    perspective: number = 0;
    angle: number = 0;
    depth: number = 0;
    rotationTransform: string = "";
    rotationTransition: string = "";
    timerPaused: boolean = false;

    pausedUI: boolean = false;
    closeGestureInAction: boolean = false;
    swipeUpGestureInAction: boolean = false;

    readyForRendering: boolean = false;

    currentIndex: number = 1;

    private _timer!: any;

    private _html!: HTMLElement | null;
    private _body!: HTMLElement | HTMLBodyElement | null;
    private _globalWrapper!: HTMLElement | HTMLDivElement | null;
    private _slider!: Element | HTMLElement | HTMLDivElement | null;
    private _innerSlider!: HTMLElement | HTMLDivElement | null;
    private _backdrop!: HTMLElement | HTMLDivElement | null;

    private _progressBeforePause!: number;
    private _currentProgress!: number;
    private _pausedStory!: number | null;
    private _pausedSlide!: number | null;
    private _timerForceEnd!: boolean;

    private _rotating!: boolean;
    private _currentAngle!: number;

    private _pausedTimerId!: any;
    private _pausedUITimerId!: any;
    // private _sliderWidth!: number;

    private _statistic: StoriesStatistic | null = null;

    private defaultDuration = 10000;

    private _animationEndPromise!: null | Promise<number>;
    private _animationEndPromiseDelta!: null | number;

    needBottomPanel: boolean = false;
    slideStartEvent: boolean = false;
    slideStartEventLayerIndex: number | null = null;

    private _swipeUpLinkTarget: { swipeUpLinkTarget?: string; swipeUpElementId?: string } = {};
    private _swipeUpGoodsLinkTarget: { swipeUpLinkTarget?: string; swipeUpElementId?: string } = {};

    private getSwipeUpGeometry() {
        return {
            width: (this.$refs["slider3dInner"] as HTMLDivElement)?.clientWidth,
            height: (this.$refs["slider3dInner"] as HTMLDivElement)?.clientHeight,
            modeDesktop: this.desktopMode,
            verticalMargin: this.desktopMode ? 50 : 0,
        };
    }

    slideStart(layerIndex?: number) {
        debug("load - call slideStartEvent");
        this.slideStartEvent = true;
        this.$nextTick(() => (this.slideStartEvent = false));
        if (layerIndex !== undefined) {
            this.$nextTick(() => {
                this.slideStartEventLayerIndex = layerIndex;
                this.$nextTick(() => (this.slideStartEventLayerIndex = null));
            });
        }
    }

    /** Getters from vuex state */
    @Getter("modeDesktop", { namespace }) desktopMode!: boolean;
    @Getter("activeSlideElementQuiz", { namespace }) activeSlideElementQuiz!: any;
    @Getter("activeSlideElementQuizGrouped", { namespace }) activeSlideElementQuizGrouped!: any;
    @Getter("activeSlideElementTest", { namespace }) activeSlideElementTest!: any;
    @Getter("activeSlideElementQuest", { namespace }) activeSlideElementQuest!: any;
    @Getter("activeSlideElementRangeSlider", { namespace }) activeSlideElementRangeSlider!: any;
    @Getter("activeSlideDisableNavigation", { namespace }) activeSlideDisableNavigation!: boolean;

    @Getter("transformStyle", { namespace }) transformStyle!: string;
    @Getter("closeButtonPosition", { namespace }) closeButtonPosition!: string;
    @Getter("readerOptions", { namespace }) readerOptions!: ReaderOptions;
    @Getter("activeStories", { namespace }) items!: Array<StoriesItem>;
    @Getter("items", { namespace }) allStories!: Map<number, StoriesItem>;

    @Getter("hasLike", { namespace }) sdkHasLike!: boolean;
    @Getter("hasLikeButton", { namespace }) sdkHasLikeButton!: boolean;
    @Getter("hasDislikeButton", { namespace }) sdkHasDislikeButton!: boolean;
    @Getter("hasFavorite", { namespace }) sdkHasFavorite!: boolean;
    @Getter("hasShare", { namespace }) sessionHasShare!: boolean;
    @Getter("platform", { namespace }) platform!: StoriesState["platform"];

    @Getter("muted", { namespace }) muted!: boolean;
    @Getter("sliderWidth", { namespace }) _sliderWidth!: Option<number>;
    @Getter("options", { namespace }) options!: StoryReaderOptions & { appearanceCommon: AppearanceCommonOptions };

    @Getter("nextFlippingStoryId", { namespace: "stories" }) nextFlippingStoryId!: Option<number>;

    /** Computed */

    get rootVars(): object {
        return {
            "--loaderBackgroundColor": this.readerOptions.loader.default.color,
            "--loaderBackgroundAccentColor": this.readerOptions.loader.default.accentColor,
            "--slideBorderRadius":
                this.readerOptions.slideBorderRadius != null ? this.readerOptions.slideBorderRadius : 0,
        };
    }

    private displayedItemIds: Array<number> = [];

    createDisplayedItems() {
        // нужно чтобы при снятии состояния favorite - список не менялся
        this.displayedItemIds = this.items.map((item) => item.id);
    }

    get displayedItems(): Array<StoriesItem | BlankStoriesItem> {
        // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
        const isStories = (
            item: StoriesItem | BlankStoriesItem | undefined
        ): item is StoriesItem | BlankStoriesItem => {
            return !!item;
        };
        return [
            { blank: true, id: -1 },
            ...(this.displayedItemIds.map((id) => this.allStories.get(id)).filter((_) => _) as Array<
                StoriesItem | BlankStoriesItem
            >),
            { blank: true, id: -2 },
        ];
    }

    get displayedItemsIndexes(): Array<number> {
        return this.displayedItems.map((item: StoriesItem | BlankStoriesItem) => item.id);
    }

    get currentStory(): StoriesItem | undefined {
        return this.$store.getters["stories/items"].get(this.id);
    }

    get activeStoryIndex() {
        return this.fetchStoryIndex(this.id);
    }

    get prevStoryBlank() {
        return (
            this.displayedItems[this.currentIndex - 1] === undefined ||
            this.isBlankStories(this.displayedItems[this.currentIndex - 1])
        );
    }

    get nextStoryBlank() {
        return (
            this.displayedItems[this.currentIndex + 1] === undefined ||
            this.isBlankStories(this.displayedItems[this.currentIndex + 1])
        );
    }

    get timeout() {
        return this.fetchSlideDuration();
    }

    get desktopBtnPrevPosition() {
        let width = 0;
        if (this.desktopMode) {
            width = parseFloat(this.storiesSlideWidth(this.currentStory));
        } else {
            width = _winWidth();
        }
        return `translateY(-50%) translateX(calc(-${width / 2}px - 200%))`;
    }

    get desktopBtnNextPosition() {
        let width = 0;
        if (this.desktopMode) {
            width = parseFloat(this.storiesSlideWidth(this.currentStory));
        } else {
            width = _winWidth();
        }
        return `translateY(-50%) translateX(calc(${width / 2}px + 100%))`;
    }

    get displayedSlideImage(): Option<string> {
        let story = this.displayedItems[this.currentIndex];
        if (story && !this.isBlankStories(story) && story instanceof StoriesItem) {
            return story.imagePerSlide(this.storyActiveSlide[this.currentIndex]);
        }
        return null;
    }

    hasLike(story: StoriesItem | BlankStoriesItem): boolean {
        if (story instanceof StoriesItem) {
            if (!story.like_functional) {
                return false;
            }
            return this.sdkHasLike;
        }
        return false;
    }

    hasShare(story: StoriesItem | BlankStoriesItem): boolean {
        if (story instanceof StoriesItem) {
            if (!story.share_functional) {
                return false;
            }
            return this.sessionHasShare;
        }
        return false;
    }

    hasFavorite(story: StoriesItem | BlankStoriesItem): boolean {
        // to many calls at render
        if (story instanceof StoriesItem) {
            if (!story.favorite_functional) {
                return false;
            }
            return this.sdkHasFavorite;
        }
        return false;
    }

    hasAudio(story: StoriesItem | BlankStoriesItem): boolean {
        if (story instanceof StoriesItem) {
            if (story.has_audio) {
                return true;
            }
        }
        return false;
    }

    @Inject("setVisible") setVisible!: Function;
    @Inject("setHidden") setHidden!: Function;

    // @Provide('timerPaused')
    // resumeAndEnableViewerUI(): void {
    //     this.timerPaused = true;
    //     this.pausedUI = true;
    // }

    /** Methods */

    storiesSlideTransform(index: number) {
        if (this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT) {
            return { transform: `translateZ(0)`, transition: "inherit" };
        } else if (this.transformStyle === WidgetStoriesOptions.SWIPE_COVER) {
            return { transform: `translateZ(0) scale(1)`, transition: "inherit" };
        } else {
            // cube
            return { transform: "rotateY(" + index * this.angle + `deg) translateZ(${this.depth}px)` };
        }
    }

    lockVerticalScroll(): void {
        // if ((window as any).WStories) {
        //     (window as any).WStories.switchToFullScreen();
        // }
        return;
        /*        if (this._body !== null) {
                this._body.style.setProperty('user-select', 'none')
                this._body.style.setProperty('-webkit-user-select', 'none')
            }

            if (this._globalWrapper !== null) {
                this._globalWrapper.style.setProperty('overflow', 'hidden');
            }

            if (this._body !== null) {
                this._body.style.setProperty('overflow', 'hidden');
                this._body.style.setProperty('-webkit-overflow-scrolling', 'touch');
            }
            if (this._html) {
                this._html.style.setProperty('position', 'fixed');
                this._html.style.setProperty('overflow', 'hidden');
            }*/
    }

    unlockVerticalScroll(): void {
        // if ((window as any).WStories) {
        //     (window as any).WStories.switchFromFullScreen();
        // }
        return;
        /*        if (this._body !== null) {
                this._body.style.setProperty('user-select', '')
                this._body.style.setProperty('-webkit-user-select', '') // todo ios перенести в reader
            }

              if (this._globalWrapper) {
                  this._globalWrapper.style['overflow'] = ''
              }
              if (this._body !== null) {
                  this._body.style.setProperty('overflow', '')
                  this._body.style.setProperty('-webkit-overflow-scrolling', '')
              }
              if (this._html !== null) {
                  this._html.style.setProperty('position', '')
                  this._html.style.setProperty('overflow', '')
              }*/
    }

    removeAllEventListeners(): void {
        window.removeEventListener("resize", this.init3DSlider);
        window.removeEventListener("resize", this.initSlidesAspectRatio);

        if (this._slider !== null) {
            /* Feature detection */
            let passiveSupported = false;
            try {
                window.addEventListener(
                    "abort",
                    (_) => _,
                    Object.defineProperty({}, "passive", {
                        get: function () {
                            passiveSupported = true;
                        },
                    }) as EventListenerOptions
                );
            } catch (err) {}

            this._slider.removeEventListener("mousedown", this.dragRotationHandler);
            this._slider.removeEventListener(
                "touchstart",
                this.dragRotationHandler,
                passiveSupported ? ({ passive: true } as EventListenerOptions) : false
            );
        }

        const rotater: HTMLElement = this.$refs.rotater as HTMLElement;

        if (rotater !== null) {
            rotater.removeEventListener("transitionend", this.onTransitionEnd);
        }

        (orientation as any).removeEventListener("change", this.checkScreenOrientation);
    }

    updateDisplayedItems(count?: number): void {
        this.$nextTick(() => {
            this.refreshSlidesLinks();
        });

        // this.currentIndex++;

        return;

        let items: Array<StoriesItem> = this.$store.getters["stories/loadedStories"];
        let displayedItems: Array<StoriesItem | BlankStoriesItem> = [];
        let displayedItemsIndexes: Array<number> = [];

        const storyId = this.$store.getters["stories/storyId"];

        debug(`updateDisplayedItems storyId:${storyId}`);

        const indexInItems = this.$store.getters["stories/activeStoriesIds"].indexOf(storyId);
        // debug(`indexInItems ${this.$store.getters.activeStoriesIds.indexOf(storyId)}`, items, this.$store.getters.activeStoriesIds)

        if (indexInItems !== -1) {
            if (indexInItems === 0 || items[indexInItems - 1] === undefined) {
                displayedItems[0] = {
                    blank: true,
                    id: -1,
                };
            } else {
                displayedItems[0] = items[indexInItems - 1];
            }

            displayedItems[1] = items[indexInItems];

            if (indexInItems === items.length - 1 || items[indexInItems + 1] === undefined) {
                displayedItems[2] = {
                    blank: true,
                    id: -2,
                };
            } else {
                displayedItems[2] = items[indexInItems + 1];
            }

            displayedItems.forEach((item) => {
                if (item) {
                    displayedItemsIndexes.push(item.id);
                }
            });
        }

        // this.displayedItems = displayedItems;
        this.$nextTick(() => {
            this.refreshSlidesLinks();
        });

        // debug(`updated items for storyId ${storyId}`)
        debug(displayedItems);

        // this.displayedItemsIndexes = displayedItemsIndexes;

        let loadedItemsIndexes: Array<number> = [];
        items.forEach((item, index) => {
            if (item) {
                loadedItemsIndexes[index] = item.id;
            }
        });

        this.loadedItemsIndexes = loadedItemsIndexes;
    }

    initStoriesStyle(): void {
        const id = "stories-slider-style";
        let style: HTMLElement | null = document.getElementById(id);
        let css = "";
        let storiesContext: NarrativeContext | null = this.$store.getters["stories/storiesContext"];
        if (storiesContext !== null) {
            css = storiesContext.style;
        }

        if (style === null) {
            style = document.createElement("style");
            (style as HTMLStyleElement).type = "text/css";
            style.id = id;
            style.attributes.setNamedItem(document.createAttribute("scoped"));

            if ((style as any).styleSheet) {
                (style as any).styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            this.$el.appendChild(style);
        } else {
            if ((style as any).styleSheet) {
                (style as any).styleSheet.cssText = css;
            } else {
                style.textContent = "";
                style.appendChild(document.createTextNode(css));
            }
        }
    }

    initStoriesScript(): void {
        // выполняем если еще не был запущен в контектсе этого окна
        // предотвращаем переписывание narrative_saved_data при повторном открытии ридера
        if (!("_narrative_common" in window)) {
            try {
                let script = "";
                let storiesContext: NarrativeContext | null = this.$store.getters["stories/storiesContext"];
                if (storiesContext !== null) {
                    script = storiesContext.script;
                }

                if (script.length > 0) {
                    let F = new Function(script);
                    F();
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    // TODO вынести через композицию, а то слишком много кода
    initDataFeature() {
        (window as any).isWeb = true;
        const self = this;

        (window as any)._getNarrativeLocalData = function () {
            if ((window as any).__activeNarrativeId !== undefined) {
                let localData = sessionStorage.getItem("narrative_" + (window as any).__activeNarrativeId + "_data"); // user_id (реализуется через сессию)
                if (localData) {
                    return JSON.parse(localData);
                }
            }
            return {};
        };

        (window as any)._setNarrativeLocalData = function (keyValue: any, sendToServer?: boolean) {
            if ((window as any).__activeNarrativeId !== undefined) {
                let data = JSON.stringify(keyValue);
                sessionStorage.setItem("narrative_" + (window as any).__activeNarrativeId + "_data", data);

                if (sendToServer) {
                    if (needSession()) {
                        NarrativeData.sentData(
                            (window as any).__activeNarrativeId,
                            { data: data },
                            self.storyManagerProxy
                        );
                    }
                }
            }
        };

        (window as any)._sendNarrativeData = function (keyValue: string) {
            if ((window as any).__activeNarrativeId !== undefined) {
                NarrativeData.sentData(
                    (window as any).__activeNarrativeId,
                    { data: JSON.stringify(keyValue) },
                    self.storyManagerProxy
                );
            }
        };

        (window as any)._showNarrativeSlide = function (index: number, layerIndex?: number) {
            // with slide index ?
            self.__afterStartInitQueuePush(() => {
                self.toSlide(index, { renewTimer: true }, layerIndex);
            });
        };

        (window as any)._showNarrativeNextSlide = function (delay: string) {
            self.__afterStartInitQueuePush(() => {
                self.stopTimer();
                if (delay) {
                    self.setTimer({
                        remainingTimeout: parseInt(delay) || 0,
                        clearProgressBeforePause: true,
                        forceStartTimer: true,
                        isAutoTransition: false,
                    });
                } else {
                    self.nextSlide({ renewTimer: true, isAutoTransition: false });
                }
            });
        };

        (window as any)._showNextStoryExists = true;
        (window as any)._storyShowPrev = function () {
            self.stopTimer();
            // slide to the next story
            self.nextStory(-1);
        };

        (window as any)._storyShowNext = function () {
            self.stopTimer();
            // slide to the next story
            self.nextStory(1);
        };

        (window as any)._showNarrativeTextInput = async function (id: string, config: InputModalConfig) {
            let story = self.displayedItems[self.currentIndex];
            if (story && !self.isBlankStories(story) && story instanceof StoriesItem && self.$refs["slider3dInner"]) {
                config.size.fontSize = parseFloat(self.slideFontSize(story));
                config.size.viewportWidth = self._slideWidth(story);
                const slideRect = (self.$refs["slider3dInner"] as HTMLDivElement).getBoundingClientRect();
                config.size.slideOffsetX = slideRect.x;
                config.size.slideOffsetY = slideRect.y;

                let userText = await (window as any)._widgetInputModal(id, config);

                if ("narrative_send_text_input_result" in window) {
                    (window as any).narrative_send_text_input_result(id, userText);
                }
            }
        };

        (window as any).narrative_send_text_input_result = function (id: string, text: string | null | undefined) {
            if (
                "_narrative_data_input" in window &&
                (window as any)._narrative_data_input_element &&
                (window as any)._narrative_data_input_element.length
            ) {
                (window as any)._narrative_data_input.setUserData(id, text);
            }
            if ("_narrative_poll" in window && (window as any)._narrative_poll_element) {
                (window as any)._narrative_poll.setUserData(id, text);
            }
            if (
                "_narrative_rate" in window &&
                (window as any)._narrative_rate_element &&
                (window as any)._narrative_rate_element.length
            ) {
                (window as any)._narrative_rate.setUserData(id, text);
            }
        };

        (window as any)._showNarrativeLink = function (target: string) {
            if (target) {
                let event: { storyId: number; transitionToType: string; transitionToId: number } = {
                    storyId: this.$store.getters["stories/storyId"],
                    transitionToType: "",
                    transitionToId: 0,
                };

                this.$emit("transitionFromSlide", event);

                // TODO overload
                /** External url **/
                window.open(target, "_parent");
            }
            return true;
        };

        (window as any)._openGameReader = function (
            gameFile: string,
            coverFile: string,
            gameConfig: string,
            addResources: string
        ) {
            self.pauseAndBlockReaderUIForGameReader({ gameFile, coverFile, gameConfig, addResources });
            return true;
        };

        (window as any).sendApiRequestPromise = function (payload: string, cb: Function) {
            return NarrativeData.sendApiRequestPromise(payload, cb, self.storyManagerProxy);
        };

        (window as any)._sendApiRequest = function (
            url: string,
            method: string,
            params: Option<Dict<any>>,
            headers: Option<Dict<any>>,
            data: Option<Dict<any>>,
            profilingKey?: string
        ) {
            return NarrativeData.sendApiRequest(
                { url, method, params, headers, data, profilingKey },
                self.storyManagerProxy
            );
        };
        (window as any)._sendApiRequestSupported = true;

        const widgetShare = (id: string, config: { url: string }) => {
            const sharePath = config?.url;

            const openSharePanel = () => {
                this.shareLink = sharePath;
                this.sharePanelOpen = true;
                this.shareId = id;
            };

            const pauseUI = () => {
                this.timerPaused = true;
                this.pausedUI = true;
            };
            const resumeUI = () => {
                this.timerPaused = false;
                this.pausedUI = false;
            };

            if (this.desktopMode || !(navigator as any).share) {
                openSharePanel();
                pauseUI();
            } else {
                try {
                    (navigator as any)
                        .share({
                            url: sharePath,
                        })
                        .then(() => {
                            resumeUI();
                            (window as any).share_complete(id, true);
                        })
                        .catch((error: any) => {
                            resumeUI();
                            (window as any).share_complete(id, false);
                        });

                    pauseUI();
                } catch (e) {
                    // navigator.share есть но не срабатывает на win 7 например
                    openSharePanel();
                    pauseUI();
                }
            }
        };
        (window as any)._share = (id: string, config: { url: string }) => widgetShare(id, config);

        (window as any).share_complete = function (id: string, isSuccess: boolean) {
            if ((window as any)._narrative_share) {
                (window as any)._narrative_share.complete(id, isSuccess);
            }
        };

        (window as any).goods_widget_complete = function (id: string) {
            self.setOpacityByElementId(id, 1);
            self.resumeAndEnableViewerUI();
        };

        const widgetInputModal = (id: string, config: InputModalConfig) => {
            return new Promise<string>((resolve, reject) => {
                const openInputModalConfig = () => {
                    this.inputModalConfig = config;
                    this.inputModalOpen = true;
                    this.inputModalId = id;
                };

                const pauseUI = () => {
                    this.timerPaused = true;
                    this.pausedUI = true;
                };
                const resumeUI = () => {
                    this.timerPaused = false;
                    this.pausedUI = false;
                };

                this.$once("inputModalComplete", (payload: InputModalCompletePayload) => {
                    resumeUI();
                    self.inputModalId = "";

                    resolve(payload.result ? payload.value : "");
                });

                openInputModalConfig();
                pauseUI();
            });
        };
        (window as any)._widgetInputModal = (id: string, config: InputModalConfig) => widgetInputModal(id, config);
    }

    setOpacityByElementId(id: string, opacity: number) {
        const element = document.querySelector<HTMLDivElement>('[data-element-id="' + id + '"]');
        if (element) {
            try {
                // element.style.setProperty('opacity', String(opacity));
                // for disable animation on swipe up element
                element.style.setProperty("display", opacity > 0 ? "block" : "none");
            } catch (e) {
                console.error(e);
            }
        }
    }

    processRedirectToSlide(linkTarget: string | undefined) {
        let story = this.displayedItems[this.currentIndex];
        if (!this.isBlankStories(story) && story instanceof StoriesItem && linkTarget != null) {
            const __slideIndex = parseInt(linkTarget);
            const __slideCount = story.slides_count;
            if (__slideCount !== null && __slideIndex >= 0 && __slideIndex < __slideCount) {
                (window as any)._showNarrativeSlide(__slideIndex, 0);
                return true;
            }
        }
        return false;
    }

    slideClick(event: Event): void | boolean {
        if (this.pausedUI) {
            return;
        }

        if (this._rotating) {
            return;
        }

        let continueClick: boolean = true;

        const target = event.target;
        let url: string | null = null;
        let elementId = null;
        let actionType = null;
        let actionTarget = null;
        let id: any = "";
        let requireCustomAction = false;
        const dataSet = (target as HTMLElement).dataset;

        actionTarget = dataSet.linkTarget;
        const actionTargetIos = dataSet.linkTargetIos;
        const actionTargetAndroid = dataSet.linkTargetAndroid;

        if (this.platform === "android" && actionTargetAndroid) {
            actionTarget = actionTargetAndroid;
        }
        if (this.platform === "ios" && actionTargetIos) {
            actionTarget = actionTargetIos;
        }

        if (target && (target as HTMLElement).classList.contains("narrative-element-link")) {
            actionType = dataSet.linkType;
            elementId = dataSet.elementId;
            if (dataSet.linkType === "article" && actionTarget) {
                id = actionTarget;
                url = id;
                // url = `article/${actionTarget}`;
                // const parsedId = parseInt(actionTarget);
                // if (isNumber(parsedId) && isFinite(parsedId)) {
                //     id = parsedId;
                // }
                // if (dataSet.articleSlug) {
                //     url = `article/${dataSet.articleSlug}`;
                //     id = dataSet.articleSlug;
                // }
            } else if (dataSet.linkType === "issue-article" && actionTarget) {
                id = actionTarget;
                url = id;
                // url = `article/${dataSet.magazineId || 0}/${actionTarget}`;
                // const parsedId = parseInt(actionTarget);
                // if (isNumber(parsedId) && isFinite(parsedId)) {
                //     id = parsedId;
                // }
                // if (dataSet.issueArticleSlug && dataSet.magazineSlug) {
                //     url = `article/${dataSet.magazineSlug}/${dataSet.issueArticleSlug}`;
                //     id = dataSet.issueArticleSlug;
                // }
            } else if (dataSet.linkType === "url" || !dataSet.linkType) {
                /** External link - open direct */
                url = actionTarget as string;
            } else if (dataSet.linkType === "customAction") {
                /** Custom action */
                requireCustomAction = true;
                url = actionTarget as string;
            } else if (dataSet.linkType === "slide") {
                if (this.processRedirectToSlide(dataSet.linkTarget)) {
                    return true;
                }
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-image")) {
            elementId = dataSet.elementId;
            /** External link - open direct */
            if (dataSet.linkType === "url" || !dataSet.linkType) {
                url = actionTarget as string;
                actionType = "url";
            } else if (dataSet.linkType === "slide") {
                if (this.processRedirectToSlide(dataSet.linkTarget)) {
                    return true;
                }
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-swipe-up")) {
            elementId = dataSet.elementId;
            /** External link - open direct */
            if (dataSet.linkType === "url" || !dataSet.linkType) {
                url = decodeURIComponent(actionTarget as string);
                actionType = "url";
            } else if (dataSet.linkType === "slide") {
                if (this.processRedirectToSlide(dataSet.linkTarget)) {
                    return true;
                }
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-swipe-up-items")) {
            elementId = dataSet.elementId;
            if (actionTarget) {
                url = decodeURIComponent(actionTarget as string);
                actionType = "swipeUpGoods";
            }
        } else if (
            target &&
            ((target as HTMLElement).classList.contains("narrative-element-quiz-next-button") ||
                (target as HTMLElement).classList.contains("narrative-element-test-next-button"))
        ) {
            if ("_showNarrativeNextSlide" in window) {
                (window as any)._showNarrativeNextSlide(0);
                return;
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-quiz-answer")) {
            if ((target as HTMLElement).closest(".narrative-element-quiz")) {
                /* quiz */
                if ("_narrative_quiz" in window) {
                    continueClick = (window as any)._narrative_quiz.select(target);
                    continueClick = false; // по клику на варианты ответа(даже на законченной викторине) не делаем клик на слайде
                }
            } else if ((target as HTMLElement).closest(".narrative-element-quiz-grouped")) {
                /* quiz-grouped */
                if ("_narrative_quiz_grouped" in window) {
                    continueClick = (window as any)._narrative_quiz_grouped.select(target);
                    continueClick = false; // по клику на варианты ответа(даже на законченной викторине) не делаем клик на слайде
                }
            }
            // расширенная область клика на весь виджет - для неточных снайперов
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-data-input")) {
            /* _narrative_data_input */
            if ("_narrative_data_input" in window) {
                (window as any)._narrative_data_input.click(target);

                continueClick = false;
            }
        } else if (
            target &&
            ((target as HTMLElement).classList.contains("rangeslider") ||
                (target as HTMLElement).closest(".rangeslider"))
        ) {
            /** Range slider */
            continueClick = false;
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-range-slider-next-button")) {
            /** Range slider complete button */

            if ("_narrative_range_slider" in window) {
                continueClick = (window as any)._narrative_range_slider.click(target);
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-poll-button")) {
            /* _narrative_poll or _narrative_poll_layers */
            if ((window as any)._narrative_poll_element) {
                if ("_narrative_poll" in window) {
                    (window as any)._narrative_poll.select(target);
                    continueClick = false;
                }
            }
            if ((window as any)._narrative_poll_layers_element) {
                if ("_narrative_poll_layers" in window) {
                    (window as any)._narrative_poll_layers.select(target);
                    continueClick = false;
                }
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-vote-answer")) {
            /* _narrative_vote */
            if ("_narrative_vote" in window) {
                (window as any)._narrative_vote.select(target);
                continueClick = false;
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-rate-input")) {
            /* _narrative_rate */
            if ("_narrative_rate" in window) {
                (window as any)._narrative_rate.select(target);
                continueClick = false;
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-test-answer")) {
            if ((target as HTMLElement).closest(".narrative-element-test")) {
                /* test */
                if ("_narrative_test" in window) {
                    continueClick = (window as any)._narrative_test.select(target);
                    continueClick = false; // по клику на варианты ответа(даже на законченном тесте) не делаем клик на слайде
                }
            } else if ((target as HTMLElement).closest(".narrative-element-quest")) {
                /* quest */
                if ("_narrative_quest" in window) {
                    continueClick = (window as any)._narrative_quest.select(target);
                    continueClick = false; // по клику на варианты ответа(даже на законченной викторине) не делаем клик на слайде
                }
            }
            // расширенная область клика на весь виджет - для неточных снайперов
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-test-answer")) {
            /* test */
            if ("_narrative_test" in window) {
                continueClick = (window as any)._narrative_test.select(target);
                continueClick = false; // по клику на варианты ответа(даже на законченном тесте) не делаем клик на слайде
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-copy")) {
            /* copy */
            if ("_narrative_copy" in window) {
                continueClick = (window as any)._narrative_copy.click(target);
                continueClick = false;
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-share")) {
            /* copy */
            if ("_narrative_share" in window) {
                continueClick = (window as any)._narrative_share.click(target);
                continueClick = false;
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-game")) {
            if ("_narrative_game" in window) {
                continueClick = (window as any)._narrative_game.click(target);
                continueClick = false;
            }
        } else if (target && (target as HTMLElement).classList.contains("narrative-element-story-repeat")) {
            let savedData = {};

            // не удаляем счетчик повторов из игры cat trap

            let data = (window as any)._getNarrativeLocalData();
            if (
                "_narrative_saved_data" in (window as any) &&
                (window as any)._narrative_saved_data[(window as any).__activeNarrativeId] !== undefined &&
                isObject((window as any)._narrative_saved_data[(window as any).__activeNarrativeId])
            ) {
                data = Object.assign(
                    {},
                    (window as any)._narrative_saved_data[(window as any).__activeNarrativeId],
                    data
                );
            }

            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (/^_gm_[A-z0-9-_]+_attempts$/.test(key)) {
                        //@ts-ignore
                        savedData[key] = data[key];
                    }
                }
            }

            if (
                "_narrative_saved_data" in (window as any) &&
                (window as any)._narrative_saved_data[(window as any).__activeNarrativeId] !== undefined &&
                isObject((window as any)._narrative_saved_data[(window as any).__activeNarrativeId])
            ) {
                (window as any)._narrative_saved_data[(window as any).__activeNarrativeId] = savedData;
            }

            (window as any)._setNarrativeLocalData(savedData, true);
            (window as any)._showNarrativeSlide(0, 0);

            eventBusInstance.emit(STORY_READER_INTERNAL_EVENTS.REFRESH_WIDGETS_STATE);

            continueClick = false;
        } else if (target && (target as HTMLElement).classList.contains("button-panel-action")) {
            let classList: DOMTokenList = (target as HTMLElement).classList;
            let currentItem: StoriesItem | BlankStoriesItem | undefined = this.displayedItems[this.currentIndex];

            if (currentItem !== undefined && currentItem instanceof StoriesItem) {
                if (classList.contains("like-up")) {
                    this.setLike(currentItem, 1);
                } else if (classList.contains("like-up-filled")) {
                    this.setLike(currentItem, 0);
                } else if (classList.contains("like-down")) {
                    this.setDislike(currentItem, -1);
                } else if (classList.contains("like-down-filled")) {
                    this.setDislike(currentItem, 0);
                } else if (classList.contains("bookmark")) {
                    this.setBookmark(currentItem, 1);
                } else if (classList.contains("bookmark-filled")) {
                    this.setBookmark(currentItem, 0);
                } else if (classList.contains("share")) {
                    this.actionShare(currentItem);
                } else if (classList.contains("sound-icon")) {
                    this.onMute();
                } else if (classList.contains("muted-icon")) {
                    this.onUnmute();
                }

                continueClick = false;
            }
        }

        if (url !== null) {
            continueClick = false;

            let event: { storyId: number; transitionToType: string; transitionToId: number } = {
                storyId: this.$store.getters["stories/storyId"],
                transitionToType: "",
                transitionToId: 0,
            };
            if (actionType === "article") {
                event.transitionToType = ArticleOptions.TYPE;
                event.transitionToId = parseInt(id);
            } else if (actionType === "issue-article") {
                event.transitionToType = IssueArticleOptions.TYPE;
                event.transitionToId = parseInt(id);
            }

            this.$emit("transitionFromSlide", event);

            /** External url **/
            if (actionType === "url") {
                // pass event to parent widget (with overload fn)

                this.$emit("clickOnButton", {
                    id: this.$store.getters["stories/storyId"],
                    index: this.storyActiveSlide[this.currentIndex],
                    url,
                    elementId,
                });

                // window.open(url, '_parent');

                // window.open(url, '_blank');
            } else {
                if (actionType === "article") {
                    this.articleId = id;
                    this.articleType = ArticleOptions.TYPE;
                    this.articleUid = actionType + (id as string);

                    this.pauseAndBlockViewerUIForArticleViewer();
                } else if (actionType === "issue-article") {
                    this.articleId = id;
                    this.articleType = IssueArticleOptions.TYPE;
                    this.articleUid = actionType + (id as string);

                    this.pauseAndBlockViewerUIForArticleViewer();
                }
                if (actionType === "swipeUpGoods") {
                    // clickOnButton
                    this.$emit("clickOnSwipeUpGoods", {
                        id: this.$store.getters["stories/storyId"],
                        index: this.storyActiveSlide[this.currentIndex],
                        url,
                        elementId,
                        ...this.getSwipeUpGeometry(),
                        // modeDesktop:
                        // width:
                        // height:
                        // verticalMargin
                    });
                    if (elementId) {
                        this.setOpacityByElementId(elementId, 0);
                    }
                    this.pauseAndBlockViewerUI();
                } else {
                    debugLog(`unsupported type ${actionType}`);
                }
            }
        }

        if (!continueClick) {
            return;
        }

        /** can tap to next slide */
        let quizElement = this.activeSlideElementQuiz;
        if (quizElement && "_narrative_quiz" in window) {
            continueClick = (window as any)._narrative_quiz.slideQuizIsDone(quizElement);
        }

        /** can tap to next slide */
        let quizGroupedElement = this.activeSlideElementQuizGrouped;
        if (quizGroupedElement && "_narrative_quiz_grouped" in window) {
            continueClick = (window as any)._narrative_quiz_grouped.slideQuizIsDone(quizGroupedElement);
        }

        /** can tap to next slide */
        let testElement = this.activeSlideElementTest;
        if (testElement && "_narrative_test" in window) {
            continueClick = (window as any)._narrative_test.slideTestIsDone(testElement);

            // TODO  роутинг кликов перенаправить в виджеты
            if ((window as any)._narrative_test.slideTestWithTimer(testElement) && !continueClick) {
                return; // disable all clicks
            }
        }

        /** can tap to next slide */
        let rangeSliderElement = this.activeSlideElementRangeSlider;
        if (rangeSliderElement && "_narrative_range_slider" in window) {
            continueClick = !(window as any)._narrative_range_slider.isClickCapturedBySlider(rangeSliderElement);
            if (!continueClick) {
                return; // disable all clicks, else _clickNext allow prevSlide even if continueClick = false
            }
        }

        if (this.activeSlideDisableNavigation) {
            return; // disable slide tap navigation
        }

        let width = 0,
            xCoord = 0;
        if (this.desktopMode) {
            width = parseFloat(this.storiesSlideWidth(this.currentStory));
            xCoord = (event as MouseEvent).offsetX;
        } else {
            width = _winWidth();
            xCoord = (event as any).pageX || ((event as TouchEvent).touches && (event as TouchEvent).touches[0].pageX);
        }

        const xPercent = xCoord / width;

        const _clickNext = (_continueClick: boolean, _xPercent: number) => {
            if (_xPercent <= 0.3) {
                this.prevSlide({ renewTimer: true });
            } else {
                if (!_continueClick) {
                    return;
                }
                this.nextSlide({ renewTimer: true, isAutoTransition: false });
            }
        };

        /** can tap to next slide */
        let questElement = this.activeSlideElementQuest;
        if (questElement && "_narrative_quest" in window) {
            let story = this.displayedItems[this.currentIndex];
            if (!this.isBlankStories(story) && story instanceof StoriesItem) {
                const slideIndex = this.storyActiveSlide[this.currentIndex];
                const slideCount = story.slides_count;
                (window as any)._narrative_quest.handleRouteClick(questElement, {
                    direction: xPercent >= 0.3 ? "forward" : "backward",
                    slideIndex: slideIndex,
                    slideCount: slideCount,
                    click: () => _clickNext(continueClick, xPercent),
                });
                return;
            }
        }

        _clickNext(continueClick, xPercent);
    }

    hideViewer(): void {
        this.timerPaused = true;
        this.setHidden();
        if (this._backdrop !== null) {
            this._backdrop.style.setProperty("display", "none");
        }
        this.unlockVerticalScroll();
        this.$emit("hideViewer");
    }

    showViewerAfterHide(): void {
        this.timerPaused = false;
        // this.init3DSlider()

        this.setVisible();
        if (this._backdrop !== null) {
            this._backdrop.style.setProperty("display", "");
        }
        this.lockVerticalScroll();
        this.$emit("showViewerAfterHide");
    }

    closeViewer(action: string): void {
        let currentItem: StoriesItem | BlankStoriesItem | undefined = this.displayedItems[this.currentIndex];
        let disable_close = false;
        if (!this.isBlankStories(currentItem) && currentItem instanceof StoriesItem) {
            disable_close = currentItem.disable_close;
        }
        if (disable_close) {
            return;
        }

        this.closeViewerImportant(action);
    }

    /**
     * @param action closeReaderByCloseBtn closeReaderByEscBtn swipeDown swipe lastSlideClick auto externalCloseReader
     */
    closeViewerImportant(action: string): void {
        if (this._timer) {
            this._timerForceEnd = true;
            clearTimeout(this._timer);
        }
        this.$store.commit("stories/setNextFlippingStory", null);
        // после закртыия скидываем тип списка в default ``
        // this.$store.commit('shared/setStoryListType', {type: STORY_LIST_TYPE.default});
        this.$emit("close");
        this.$emit("closeStory", {
            id: this.$store.getters["stories/storyId"],
            index: this.storyActiveSlide[this.currentIndex],
            action,
        });
    }

    onPause(): void {
        // save paused story and slide
        this.stopTimer();
        this._progressBeforePause = this._currentProgress;
        this._pausedStory = this.activeStory;
        this._pausedSlide = this.storyActiveSlide[this.currentIndex];
        debug(`onPause: t--${this.timeout * this._progressBeforePause} p--${this._progressBeforePause * 100}%`);
    }

    onResume(): void {
        // check paused slide and story
        this.pausedUI = false;

        if (this._pausedStory === this.activeStory && this._pausedSlide === this.storyActiveSlide[this.currentIndex]) {
            let remainingProgress = 1 - this._progressBeforePause;
            let remainingTimeout = this.timeout * remainingProgress;
            debug(
                `onResume: timeoutT--${this.timeout} remainingT--${remainingTimeout} remainingP--${
                    remainingProgress * 100
                }%`
            );
            this.setTimer({ remainingTimeout, clearProgressBeforePause: false });
        } else {
            // debug(`on resume with another slide or story`)
        }
    }

    setTimer(
        {
            remainingTimeout,
            clearProgressBeforePause,
            forceStartTimer,
            isAutoTransition,
        }: {
            remainingTimeout: number;
            clearProgressBeforePause: boolean;
            forceStartTimer?: boolean;
            isAutoTransition?: boolean;
        } = {
            remainingTimeout: this.timeout,
            clearProgressBeforePause: true,
            forceStartTimer: false,
            isAutoTransition: true,
        }
    ) {
        if (this._timer !== null) {
            clearTimeout(this._timer);
        }
        this._timer = null;
        if ((this.timerEnabled || forceStartTimer) && remainingTimeout > 0) {
            debug(
                `timer ${forceStartTimer} ${remainingTimeout}`,
                this.$store.getters["stories/storyId"],
                this.currentIndex,
                this.storyActiveSlide[this.currentIndex]
            );

            if (this._timerForceEnd === true) {
                this._timerForceEnd = false;
            }

            // для анимации перехода, чтобы не увеличивать ее скорость + используем startProgress
            let defaultDuration = this.timeout || this.defaultDuration;

            if (forceStartTimer) {
                defaultDuration = remainingTimeout;
            }

            this._timer = setTimeout(
                () => this.nextSlide({ renewTimer: false, isAutoTransition: Boolean(isAutoTransition) }),
                remainingTimeout
            );

            // try {
            //   this._slideTick = this.$children[1].$children[0].$refs.tick[this.storyActiveSlide[this.currentIndex]]
            // } catch (e) {
            //   this._slideTick = null
            // }
            // debug(this.$children[1], this.$children)
            // debug(this.storyActiveSlide, this.currentIndex)
            // debug(this._slideTick)

            // start progress bar
            this._currentProgress = 0;
            if (clearProgressBeforePause) {
                this._progressBeforePause = 0;
            }

            animate({
                duration: defaultDuration,
                timing: (timeFraction) => timeFraction,
                draw: (progress) => {
                    const rotater: HTMLElement = this.$refs.rotater as HTMLElement;
                    if (rotater !== null) {
                        const percents = (this._progressBeforePause + progress) * 100;
                        rotater.style.setProperty("--tick", percents + "%");
                        rotater.style.setProperty("--tickOpacity", String(percents > 0 ? 1 : 0));
                        this._currentProgress = this._progressBeforePause + progress;
                        if (progress === 1) {
                            this.$nextTick(() => {
                                if (this._currentProgress === 0) {
                                    rotater.style.setProperty("--tick", "0%");
                                    rotater.style.setProperty("--tickOpacity", "0");
                                    // this._currentProgress = 0;
                                }
                            });
                        }
                    }
                },
                paused: () => this.timerPaused,
                forceEnd: () => this._timerForceEnd,
            });
        } else if (remainingTimeout === 0) {
            this._timerForceEnd = true;
        }
    }

    stopTimer(): void {
        if (this._timer !== null) {
            this._timerForceEnd = true;
            clearTimeout(this._timer);
        }
    }

    nextSlide({ renewTimer, isAutoTransition } = { renewTimer: false, isAutoTransition: false }): void {
        let slides = [];
        if (this.currentStory !== undefined) {
            slides = this.currentStory.slides_html;
        }

        const storyIndex = this.currentIndex;
        // if (this.storyActiveSlide[storyIndex] === undefined) {
        //   this.$set(this.storyActiveSlide, storyIndex, 0)
        // }

        debug(`nextSlide call storyIndex: ${storyIndex}`);

        this._progressBeforePause = 0;
        this.pausedUI = false;

        if (this.storyActiveSlide[storyIndex] === slides.length - 1) {
            this.stopTimer();
            // slide to the next story

            debug("slide to the next story");

            this.nextStory(1, isAutoTransition);
        } else {
            debug(
                `slide to the next story else storyIndex: ${storyIndex} this.storyActiveSlide[storyIndex]: ${
                    this.storyActiveSlide[storyIndex]
                } (slides.length - 1): ${slides.length - 1}`
            );
            this.toSlide(this.storyActiveSlide[storyIndex] + 1, { renewTimer });
        }
    }

    prevSlide({ renewTimer } = { renewTimer: false }): void {
        const storyIndex = this.currentIndex;

        this._progressBeforePause = 0;
        this.pausedUI = false;

        if (this.storyActiveSlide[storyIndex] === 0) {
            this.stopTimer();
            // slide to the next story

            this.nextStory(-1);
        } else {
            this.toSlide(this.storyActiveSlide[storyIndex] - 1, { renewTimer });
        }
    }

    toSlide(index: number, { renewTimer } = { renewTimer: false }, layerIndex?: number): void {
        const storyIndex = this.currentIndex;
        const currentStoryId = this.$store.getters["stories/storyId"];
        const currentSlideIndex = this.storyActiveSlide[storyIndex];
        const sameSlide = currentSlideIndex === index;
        this.$set(this.storyActiveSlide, storyIndex, index);

        if (renewTimer) {
            this.stopTimer();
        }

        const cb = () => {
            debug("timer - prev/next slide");
            this.setTimer();
            this.slideStart(layerIndex);
            this.$emit("nextSlide", { fromStoryId: currentStoryId, fromSlideIndex: currentSlideIndex });
            this.$emit("showSlide", { id: currentStoryId, index });
        };

        if (sameSlide) {
            debug("SAME SLIDE");
            cb();
        } else {
            // if slide index changed
            this.waitForSlideLoaded(currentStoryId).then((result) => {
                if (result) {
                    cb();
                } else {
                    debug(`slide don\`t loaded: ${currentStoryId}`);
                }
            });
        }
    }

    fetchSlideDuration(): number {
        const slidesDuration =
            this.$store.getters["stories/items"].get(this.$store.getters["stories/storyId"] || this.id) !== undefined
                ? this.$store.getters["stories/items"].get(this.$store.getters["stories/storyId"] || this.id)
                      ?.slides_duration
                : [];
        const index =
            this.storyActiveSlide[this.currentIndex] !== undefined ? this.storyActiveSlide[this.currentIndex] : 0;

        if (slidesDuration !== undefined) {
            if (slidesDuration[index] === 0) {
                return 0;
            }
            return slidesDuration[index] || this.defaultDuration;
        }
        return this.defaultDuration;
    }

    fetchStoryIndex(id: number): number {
        return this.displayedItemsIndexes.indexOf(id);
    }

    fetchStoryIndexInLoaded(id: number): number {
        return this.loadedItemsIndexes.indexOf(id);
    }

    activateStoryAfterSwipe(rotatedCnt: number, slideLoadPromise: Option<Promise<boolean>>): void {
        if (rotatedCnt !== 0) {
            const currentStoryIndex = this.currentIndex;
            let nextStoryIndex = -1,
                nextStoryId: number | undefined;

            nextStoryIndex = currentStoryIndex + rotatedCnt;
            if (nextStoryIndex >= this.displayedItems.length) {
                // не должно быть
                nextStoryIndex = nextStoryIndex - this.displayedItems.length;
            } else if (nextStoryIndex < 0) {
                // не должно быть
                nextStoryIndex = this.displayedItems.length + nextStoryIndex;
            }

            this.currentIndex = nextStoryIndex;

            nextStoryId = this.displayedItems[nextStoryIndex].id;

            this.$emit("closeStory", { id: this.id, index: this.storyActiveSlide[this.currentIndex], action: "swipe" });

            debug(
                `activateStoryAfterSwipe -  currentStoryIndex: ${currentStoryIndex} currentStoryId: ${this.id} slidesRotated: ${rotatedCnt} nextStoryIndex: ${nextStoryIndex} nextStoryId: ${nextStoryId} this.loadedItemsIndexes: `,
                this.loadedItemsIndexes
            );

            if (nextStoryId !== undefined) {
                const currentStory = this.$store.getters["stories/storyId"];
                const currentSlideIndex = this.storyActiveSlide[currentStoryIndex];

                // TODO странный артефакт  !!! commit return void
                // this.$store.commit('SET_ACTIVE_STORY', {storyId: nextStoryId}).then(() => this.$set(this.storyActiveSlide, nextStoryIndex, 0))
                this.$store.commit("stories/SET_ACTIVE_STORY", nextStoryId);
                this.activeStory = nextStoryId;
                this._currentProgress = 0;
                this._progressBeforePause = 0;

                if (this._timer) {
                    this.stopTimer();
                }

                if (slideLoadPromise !== null) {
                    slideLoadPromise.then((result) => {
                        if (result) {
                            this.setTimer();
                            this.slideStart();
                        } else {
                            debug(`slide don\`t loaded: ${nextStoryId}`);
                        }
                    });
                } else {
                    this.setTimer();
                    this.slideStart();
                }

                // возвращаем позицию снова на  центральный сторис
                // if (this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT) {
                //     this.rotateSliderFlat(-1 * rotatedCnt, true)
                // } else if (this.transformStyle === WidgetStoriesOptions.SWIPE_COVER) {
                //     this.rotateSliderCover(-1 * rotatedCnt, true)
                // } else {
                //     this.rotateSlider(-1 * rotatedCnt, true)
                // }
                this.updateDisplayedItems();

                this.$emit("nextStories", {
                    toStoryId: this.$store.getters["stories/storyId"],
                    fromStoryId: currentStory,
                    fromSlideIndex: currentSlideIndex,
                });
                this.$emit("nextSlide", { fromStoryId: currentStory, fromSlideIndex: currentSlideIndex });
                this.$emit("showStory", { id: nextStoryId, index: this.storyActiveSlide[nextStoryIndex] });
                this.$emit("showSlide", { id: nextStoryId, index: this.storyActiveSlide[nextStoryIndex] });

                // this.activeSlide = 0
                // this.$set(this.storyActiveSlide, nextStoryIndex, 0)
                // пока что здесь обнуляем таймер при ручном переходе на следующий сторис

                // this.$set(this.storyActiveSlide, nextStoryIndex, 0)
            } else {
                this.closeViewerImportant("swipe");
            }
        }
    }

    nextStory(direction: number = 1, isAutoTransition: boolean = false) {
        const currentStoryIndex = this.currentIndex;

        const storyIndex = this.currentIndex;

        const currentStory = this.$store.getters["stories/storyId"];
        const currentSlideIndex = this.storyActiveSlide[storyIndex];

        let nextStoryId: number | null = null,
            nextStoryIndex = -1;
        if (direction > 0) {
            if (
                currentStoryIndex !== -1 &&
                this.displayedItems[currentStoryIndex + 1] !== undefined &&
                !this.isBlankStories(this.displayedItems[currentStoryIndex + 1])
            ) {
                nextStoryIndex = currentStoryIndex + 1;
                nextStoryId = this.displayedItems[nextStoryIndex].id;
            }
        } else if (direction < 0) {
            if (
                currentStoryIndex !== -1 &&
                this.displayedItems[currentStoryIndex - 1] !== undefined &&
                !this.isBlankStories(this.displayedItems[currentStoryIndex - 1])
            ) {
                nextStoryIndex = currentStoryIndex - 1;
                nextStoryId = this.displayedItems[nextStoryIndex].id;
            }
        }

        let waitForSlideLoadedPromise: Option<Promise<boolean>> = null;
        if (nextStoryId !== null) {
            this.$emit("closeStory", {
                id: currentStory,
                index: this.storyActiveSlide[this.currentIndex],
                action: isAutoTransition ? "auto" : "lastSlideClick",
            });
            waitForSlideLoadedPromise = this.waitForSlideLoaded(nextStoryId);

            this._nextStory(direction).then(() => {
                if (waitForSlideLoadedPromise !== null) {
                    waitForSlideLoadedPromise.then((result) => {
                        if (result) {
                            const index = nextStoryIndex ? this.storyActiveSlide[nextStoryIndex] : currentSlideIndex;
                            this.$emit("nextSlide", { fromStoryId: currentStory, fromSlideIndex: currentSlideIndex });
                            this.$emit("showStory", { id: nextStoryId, index });
                            this.$emit("showSlide", { id: nextStoryId, index });
                            this.setTimer();
                            this.slideStart();
                        } else {
                            debug(`slide don\`t loaded: ${nextStoryId}`);
                        }
                    });
                }
            });
        } else {
            if (this.options.recycleStoriesList === true) {
                if (direction < 0) {
                    // recycle to the end
                    let slides = [];
                    if (this.currentStory !== undefined) {
                        slides = this.currentStory.slides_html;
                    }

                    this.$set(this.storyActiveSlide, storyIndex, slides.length - 1);

                    this.waitForSlideLoaded(currentStory).then((result) => {
                        if (result) {
                            this.setTimer();
                            this.slideStart();
                        } else {
                            debug(`slide don\`t loaded: ${currentStory}`);
                        }
                        // this.$emit('nextSlide', {fromStoryId: currentStory, fromSlideIndex: currentSlideIndex})
                    });
                } else {
                    // recycle to begin
                    this.$set(this.storyActiveSlide, storyIndex, 0);
                    this.waitForSlideLoaded(this.$store.getters["stories/storyId"]).then((result) => {
                        if (result) {
                            this.setTimer();
                            this.slideStart();
                        } else {
                            debug(`slide don\`t loaded: ${this.$store.getters["stories/storyId"]}`);
                        }
                        // this.$emit('nextSlide', {fromStoryId: currentStory, fromSlideIndex: currentSlideIndex})
                    });
                }
            } else {
                if (isAutoTransition === true) {
                    if (this.options.closeOnLastSlideByTimer === false) {
                        // for share page
                        // just stop timer
                    } else {
                        // default bh
                        // this.$emit('closeStoryByScrolling', {id: currentStory});
                        this.closeViewerImportant("auto");
                    }
                } else {
                    // this.$emit('closeStoryByScrolling', {id: currentStory});
                    this.closeViewerImportant("lastSlideClick");
                }
            }
        }
    }

    _nextStory(direction: number = 1): Promise<number> {
        const currentStoryIndex = this.currentIndex;

        let nextStoryId: number | null = null,
            nextStoryIndex = -1;
        if (direction > 0) {
            if (
                currentStoryIndex !== -1 &&
                this.displayedItems[currentStoryIndex + 1] !== undefined &&
                !this.isBlankStories(this.displayedItems[currentStoryIndex + 1])
            ) {
                nextStoryIndex = currentStoryIndex + 1;
                nextStoryId = this.displayedItems[nextStoryIndex].id;
            }
        } else if (direction < 0) {
            if (
                currentStoryIndex !== -1 &&
                this.displayedItems[currentStoryIndex - 1] !== undefined &&
                !this.isBlankStories(this.displayedItems[currentStoryIndex - 1])
            ) {
                nextStoryIndex = currentStoryIndex - 1;
                nextStoryId = this.displayedItems[nextStoryIndex].id;
            }
        }

        debug(`nextStory: direction=>${direction} nextStoryId=>${nextStoryId} nextStoryIndex=>${nextStoryIndex}`);

        if (nextStoryId !== null) {
            const currentStory = this.$store.getters["stories/storyId"];
            const currentSlideIndex = this.storyActiveSlide[currentStoryIndex];

            // reset next story active slide
            // this.$set(this.storyActiveSlide, nextStoryIndex, 0);

            return new Promise((resolve, reject) => {
                this.$store.dispatch("stories/FETCH_STORY", nextStoryId).then(() => {
                    // чтобы начать загрузку слайда в этот момент (лоадер крутилка)
                    this.$store.commit("stories/setNextFlippingStory", nextStoryId);

                    this[direction > 0 ? "navigateSliderNext" : "navigateSliderPrev"](direction).then(() => {
                        // reset current story
                        // this.$set(this.storyActiveSlide, currentStoryIndex, 0);

                        this.$store.commit("stories/SET_ACTIVE_STORY", nextStoryId);
                        if (nextStoryId !== null) {
                            this.activeStory = nextStoryId;
                        }

                        this.currentIndex += direction;

                        debug(`this.currentIndex is: ${this.currentIndex}`);

                        // this.$set(this.storyActiveSlide, nextStoryIndex, 0)

                        // возвращаем позицию снова на  центральный сторис
                        // if (this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT) {
                        //     this.rotateSliderFlat(-1 * direction, true)
                        // } else if (this.transformStyle === WidgetStoriesOptions.SWIPE_COVER) {
                        //     this.rotateSliderCover(-1 * direction, true)
                        // } else {
                        //     this.rotateSlider(-1 * direction, true)
                        // }
                        this.updateDisplayedItems();

                        this.$emit("nextStories", {
                            toStoryId: this.$store.getters["stories/storyId"],
                            fromStoryId: currentStory,
                            fromSlideIndex: currentSlideIndex,
                        });

                        // todo fetch storyIndex in disaplayed items or in all items if needed

                        if (nextStoryId !== null) {
                            resolve(nextStoryId);
                        } else {
                            reject();
                        }
                    });
                });
            });
        } else {
            return Promise.reject("stories end");
        }
    }

    onSlideReady(storyId: number, slideIndex: number) {
        this.$emit(`slideReady:internal:${storyId}:${slideIndex}`);
        debug(`load - slideReady:internal:${storyId}:${slideIndex}`);
    }

    slideSwipeUpExists(payload: Dict) {
        this._swipeUpLinkTarget = payload;
        debug("slideSwipeUpExists: ", payload);
    }

    slideSwipeUpGoodsExists(payload: Dict) {
        this._swipeUpGoodsLinkTarget = payload;
        debug("slideSwipeUpGoodsExists: ", payload);
    }

    waitForSlideLoaded(storyId: number): Promise<boolean> {
        debug(`listener load - slideReady ${storyId}`);
        return new Promise((resolve, reject) => {
            this.$once(`slideReady:internal:${storyId}:0`, () => {
                debug("load - slideReady:internal", storyId);

                clearTimeout(timeout);
                this.slideState = "showed";
                resolve(true);
            });
            const timeout = setTimeout(() => resolve(false), 60 * 1000);
            this.slideState = "init";
        });
    }

    // global stateBySlide - init/showed
    private slideState: string = "init";

    // on start loading - init / else - showed

    __afterStartInitQueuePush(cb: () => void): boolean {
        if (!isFunction(cb)) {
            return false;
        }

        if (this.slideState === "init") {
            this.__afterStartInitQueue.push(cb);
        } else {
            cb();
        }

        return true;
    }

    isBlankStories(item: StoriesItem | BlankStoriesItem): boolean {
        return item.blank;
    }

    storiesItemClass({ id, index }: { id: number; index: number }): {} {
        // const activeStoryId = this.$store.getters['stories/storyId'];
        let activeStoryIndex = this.currentIndex;
        // let activeStoryIndex = null;

        // for (let prop in this.displayedItems) {
        //   if (this.displayedItems.hasOwnProperty(prop)) {
        //     let item = this.displayedItems[prop]
        //
        //     if (item.id === activeStoryId) {
        //       activeStoryIndex = prop
        //     }
        //   }
        // }
        // this.displayedItems.forEach((item, index) => {
        //     if (item && item.id === activeStoryId) {
        //         activeStoryIndex = index
        //     }
        //     if (item instanceof StoriesItem) {
        //         // debug(`slider_item ${item.id} ${item.title}`)
        //     }
        // })

        const centerSlider = index === activeStoryIndex;
        const leftSlider = index + 1 === activeStoryIndex;
        const rightSlider = index - 1 === activeStoryIndex;

        return {
            // '_active': centerSlider || leftSlider || rightSlider,
            _active: true,
            _transform_front: centerSlider,
            _transform_left: leftSlider,
            _transform_right: rightSlider,

            // '_position_left': index < activeStoryIndex,
            // '_position_right': index > activeStoryIndex
        };
    }

    pauseAndBlockViewerUI(): void {
        this.timerPaused = true;
        this.pausedUI = true;
    }

    resumeAndEnableViewerUI(): void {
        this.timerPaused = false;
        this.pausedUI = false;
    }

    pauseAndBlockViewerUIForArticleViewer(): void {
        this.articleViewerVisible = true;
        this.pauseAndBlockViewerUI();
    }

    resumeAndEnableViewerUIForArticleViewer(): void {
        this.articleViewerVisible = false;
        this.resumeAndEnableViewerUI();

        /** Чтобы при клике на ту же самую статью - изменился проперти articleUid */
        this.articleUid = "";
    }

    /**
     * Закрыли article viewer
     **/
    closeArticleViewer(): void {
        // articleViewerVisible = false;

        if (this.articleType === ArticleOptions.TYPE) {
            this._statistic !== null && this._statistic.emit(EVENT_ARTICLE_CLOSE, { id: this.articleId });
        } else if (this.articleType === IssueArticleOptions.TYPE) {
            this._statistic !== null && this._statistic.emit(EVENT_ISSUE_ARTICLE_CLOSE, { id: this.articleId });
        }
    }

    pauseAndBlockReaderUIForGameReader(gameData: GameData): void {
        this.gameReaderData = gameData;
        this.gameReaderVisible = true;
        this.pauseAndBlockViewerUI();
    }

    resumeAndEnableReaderUIForGameReader(): void {
        this.gameReaderVisible = false;
        this.resumeAndEnableViewerUI();

        /** Чтобы при клике на ту же самую статью - изменился проперти articleUid */
        this.gameReaderData = null;
    }

    /**
     * Закрыли game reader
     **/
    closeGameReader(): void {
        if (this.articleType === ArticleOptions.TYPE) {
            this._statistic !== null && this._statistic.emit(EVENT_ARTICLE_CLOSE, { id: this.articleId });
        } else if (this.articleType === IssueArticleOptions.TYPE) {
            this._statistic !== null && this._statistic.emit(EVENT_ISSUE_ARTICLE_CLOSE, { id: this.articleId });
        }
    }

    _updateRotaterAnimation() {}

    updateRotater({ touchmove } = { touchmove: false }): void {
        // if (!touchmove) {
        const rotater: HTMLElement = this.$refs.rotater as HTMLElement;
        if (rotater !== null && rotater !== undefined) {
            rotater.style.setProperty("transition", this.rotationTransition);
            rotater.style.setProperty("transform", this.rotationTransform);
        }
        // } else {

        /*          if (!this._rotaterAnimationHandled) {
                this._rotaterAnimationHandled = true
                const vm                      = this
                requestAnimationFrame(function rotaterAnimate(time) {
                  if (vm._rotating) {
                    vm.$refs.rotater.style.setProperty('transition', vm.rotationTransition)
                    vm.$refs.rotater.style.setProperty('transform', vm.rotationTransform)
                    requestAnimationFrame(rotaterAnimate)
                  } else {
                    vm._rotaterAnimationHandled = false
                  }
                })

              }
            }*/
    }

    rotateSlider(delta: number, hidden: boolean = false): Promise<number> {
        // start slideLoading here

        // const started = Date.now()
        // let operations = []

        this._rotating = true;
        const newAngle = this._currentAngle + delta * this.angle;
        const rotate = newAngle * -1;
        const transitionTime = sliderOptions.speed / 1000;
        if (this.transformStyle === WidgetStoriesOptions.SWIPE_CUBE) {
            this.rotationTransform = `rotateY(${rotate}deg)`;
        }
        this._currentAngle = newAngle;
        if (hidden) {
            this.rotationTransition = "transform 0s";
            this.updateRotater();
            this._rotating = false;
            return Promise.resolve(delta);
        }

        // setTimeout(() => {
        //     this._rotating = false
        // }, transitionTime);

        return new Promise((resolve, reject) => {
            let callback = ({ propertyName, elapsedTime }: { propertyName: string; elapsedTime: number }) => {
                debug(
                    `transitionend:rotater elapsedTime: ${elapsedTime} transitionTime: ${transitionTime} propertyName: ${propertyName}`
                );

                if (Math.round(elapsedTime * 100) / 100 === transitionTime && propertyName === "transform") {
                    // operations.push(Date.now() - started)
                    this.rotationTransition = "transform 0s";
                    this.updateRotater();
                    this._rotating = false;

                    debug(`release this._rotating is: ${this._rotating}`);

                    // debug('stop manual rotating')

                    // debug(operations)
                    resolve(delta);
                    this.$off("transitionend:rotater", callback);
                }
            };
            this.$on("transitionend:rotater", callback);
            /*          setTimeout(() => {
                  operations.push(Date.now() - started)
                  this.rotationTransition = 'transform 0s'
                  this.updateRotater()
                  this._rotating = false

                  // debug('stop manual rotating')

                  debug(operations)
                  resolve(delta)
                }, sliderOptions.speed)*/

            this.rotationTransition = `transform ${transitionTime}s ${sliderOptions.easing}`;
            this.updateRotater();
        });
    }

    rotateSliderFlat(delta: number, hidden: boolean = false): Promise<number> {
        // const started = Date.now()
        // let operations = []

        this._rotating = true;

        let centralStoriesTransform: string = "",
            rightStoriesTransform: string = "",
            leftStoriesTransform: string = "";

        if (delta === 0) {
            leftStoriesTransform = `translateZ(0) translateX(-100%)`;
            centralStoriesTransform = `translateZ(0) translateX(0%)`;
            rightStoriesTransform = `translateZ(0) translateX(100%)`;
        } else if (delta > 0) {
            leftStoriesTransform = `translateZ(0) translateX(-200%)`;
            centralStoriesTransform = `translateZ(0) translateX(-100%)`; // 0 => -100%
            rightStoriesTransform = `translateZ(0) translateX(0%)`; // 100% => 0
        } else {
            centralStoriesTransform = `translateZ(0) translateX(100%)`; // 0 => 100%
            leftStoriesTransform = `translateZ(0) translateX(0%)`; // -100% => 0
            rightStoriesTransform = "translateZ(0) translateX(200%)";
        }

        if (hidden) {
            this.rotationTransition = "transform 0s";
            this.updateRotater();

            this.centralSlideEl !== null && this.centralSlideEl.style.setProperty("transform", centralStoriesTransform);
            this.rightSlideEl !== null && this.rightSlideEl.style.setProperty("transform", rightStoriesTransform);
            this.leftSlideEl !== null && this.leftSlideEl.style.setProperty("transform", leftStoriesTransform);

            this._rotating = false;
            return Promise.resolve(delta);
        }

        const transitionTime = sliderOptions.speed / 1000;
        return new Promise((resolve, reject) => {
            let callback = ({ propertyName, elapsedTime }: { propertyName: string; elapsedTime: number }) => {
                if (Math.round(elapsedTime * 100) / 100 === transitionTime && propertyName === "transform") {
                    // operations.push(Date.now() - started)
                    this.rotationTransition = "transform 0s";
                    this.updateRotater();
                    this._rotating = false;

                    // debug('stop manual rotating')

                    // debug(operations)
                    this.$off("transitionend:rotater", callback);
                    resolve(delta);
                }
            };
            this.$on("transitionend:rotater", callback);
            /*          setTimeout(() => {
                  operations.push(Date.now() - started)
                  this.rotationTransition = 'transform 0s'
                  this.updateRotater()
                  this._rotating = false

                  // debug('stop manual rotating')

                  debug(operations)
                  resolve(delta)
                }, sliderOptions.speed)*/

            this.rotationTransition = `transform ${transitionTime}s ${sliderOptions.easing}`;
            this.updateRotater();

            this.centralSlideEl !== null && this.centralSlideEl.style.setProperty("transform", centralStoriesTransform);
            this.rightSlideEl !== null && this.rightSlideEl.style.setProperty("transform", rightStoriesTransform);
            this.leftSlideEl !== null && this.leftSlideEl.style.setProperty("transform", leftStoriesTransform);
        });
    }

    rotateSliderCover(delta: number, hidden: boolean = false): Promise<number> {
        // const started = Date.now()
        // let operations = []

        this._rotating = true;

        let centralStoriesTransform: string = "",
            rightStoriesTransform: string = "",
            leftStoriesTransform: string = "";

        if (delta === 0) {
            leftStoriesTransform = `translateZ(0) translateX(-10%) scale(.9)`;
            centralStoriesTransform = `translateZ(0) translateX(0%) scale(1)`;
            rightStoriesTransform = `translateZ(0) translateX(100%) scale(1)`;
        } else if (delta > 0) {
            leftStoriesTransform = `translateZ(0) translateX(-20%) scale(.8)`;
            centralStoriesTransform = `translateZ(0) translateX(-10%) scale(.9)`; // 0 => -100%
            rightStoriesTransform = `translateZ(0) translateX(0%) scale(1)`; // 100% => 0
        } else {
            centralStoriesTransform = `translateZ(0) translateX(100%) scale(1)`; // 0 => 100%
            leftStoriesTransform = `translateZ(0) translateX(0%) scale(1)`; // -100% => 0
            rightStoriesTransform = `translateZ(0) translateX(200%)`;
        }

        if (hidden) {
            this.rotationTransition = "transform 0s";
            this.updateRotater();

            this.centralSlideEl !== null && this.centralSlideEl.style.setProperty("transform", centralStoriesTransform);
            this.rightSlideEl !== null && this.rightSlideEl.style.setProperty("transform", rightStoriesTransform);
            this.leftSlideEl !== null && this.leftSlideEl.style.setProperty("transform", leftStoriesTransform);

            this._rotating = false;
            return Promise.resolve(delta);
        }

        const transitionTime = sliderOptions.speed / 1000;
        return new Promise((resolve, reject) => {
            let callback = ({ propertyName, elapsedTime }: { propertyName: string; elapsedTime: number }) => {
                if (Math.round(elapsedTime * 100) / 100 === transitionTime && propertyName === "transform") {
                    // operations.push(Date.now() - started)
                    this.rotationTransition = "transform 0s";
                    this.updateRotater();
                    this._rotating = false;

                    // debug('stop manual rotating')

                    // debug(operations)
                    this.$off("transitionend:rotater", callback);
                    resolve(delta);
                }
            };
            this.$on("transitionend:rotater", callback);
            /*          setTimeout(() => {
                  operations.push(Date.now() - started)
                  this.rotationTransition = 'transform 0s'
                  this.updateRotater()
                  this._rotating = false

                  // debug('stop manual rotating')

                  debug(operations)
                  resolve(delta)
                }, sliderOptions.speed)*/

            this.rotationTransition = `transform ${transitionTime}s ${sliderOptions.easing}`;
            this.updateRotater();

            this.centralSlideEl !== null && this.centralSlideEl.style.setProperty("transform", centralStoriesTransform);
            this.rightSlideEl !== null && this.rightSlideEl.style.setProperty("transform", rightStoriesTransform);
            this.leftSlideEl !== null && this.leftSlideEl.style.setProperty("transform", leftStoriesTransform);
        });
    }

    navigateSliderNext(delta: number): Promise<number> {
        if (this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT) {
            return this.rotateSliderFlat(delta);
        } else if (this.transformStyle === WidgetStoriesOptions.SWIPE_COVER) {
            return this.rotateSliderCover(delta);
        } else {
            return this.rotateSlider(delta);
        }
    }

    navigateSliderPrev(delta: number): Promise<number> {
        if (this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT) {
            return this.rotateSliderFlat(delta);
        } else if (this.transformStyle === WidgetStoriesOptions.SWIPE_COVER) {
            return this.rotateSliderCover(delta);
        } else {
            return this.rotateSlider(delta);
        }
    }

    dragRotationHandler(e: Event) {
        let widgetSliderElement: HTMLElement | null = null,
            target: any = e.target;
        if (target.classList.contains("narrative-element-range-slider")) {
            widgetSliderElement = target;
        } else {
            widgetSliderElement = target.closest(".narrative-element-range-slider");
        }

        if (widgetSliderElement !== null) {
            // e.preventDefault();
            return;
        }

        if (this.desktopMode) return;

        // проверить что _rotating по завершении устанавливается в false
        // и что выполняются предыдущие promise

        debug(`this._rotating is: ${this._rotating}`);
        if (this._rotating && !sliderOptions.allowDragDuringAnim) return;
        if (this.pausedUI) {
            return;
        }
        e.stopPropagation();

        // разрешаем предыдущий promise
        if (this._animationEndPromise) {
            debug(this._animationEndPromise);
            // this._animationEndPromise.resolve(this._animationEndPromiseDelta)

            this.activateStoryAfterSwipe(this._animationEndPromiseDelta as number, null);
            this._animationEndPromise = null;
        }

        let startAt = Date.now();

        if (this._pausedTimerId) {
            clearTimeout(this._pausedTimerId);
            this._pausedTimerId = null;
        }
        this._pausedTimerId = setTimeout(() => {
            this.timerPaused = true;
        }, 200);

        if (this._pausedUITimerId) {
            clearTimeout(this._pausedUITimerId);
            this._pausedUITimerId = null;
        }
        this._pausedUITimerId = setTimeout(() => {
            if (this.timerPaused === true) {
                this.pausedUI = true;
            }
        }, 1500);

        // TODO also stop video and gif

        this._rotating = true;
        if (this._slider !== null) {
            this._slider.classList.add("no-select");
        }

        // let pageWidth = _winWidth();
        // let treshold  = Math.max(1, Math.floor(0.01 * (pageWidth)))
        let treshold = 0;
        const limit = Math.tan(((45 * 1.5) / 180) * Math.PI);

        let startVal: number, startValY: number;
        startVal = (e as any).pageX || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageX);
        startValY = (e as any).pageY || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageY);

        let sliderS: number = this._innerSlider !== null ? this._innerSlider.clientWidth : 0;
        let windowHeight: number = this._slider !== null ? this._slider.clientHeight : 0;
        let deltaVal: number = 0;
        let newAngle: number;
        let angleDelta: number;
        let rotationCoef: number;
        rotationCoef = sliderOptions.dragSpeedCoef;

        let deltaValY = 0;

        let globalHorizontalSwipeGesture = false;
        let globalVerticalSwipeGesture = false;

        const storiesViewer: HTMLElement = this.$refs.storiesViewer as HTMLElement;
        storiesViewer.style.setProperty("transition", "");

        let touchmoveListener = (e: Event): void => {
            if (this.pausedUI) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            let val, valY;

            // TODO y rotation + detect close swipe
            val = (e as any).pageX || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageX);
            valY = (e as any).pageY || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageY);

            // если еще не успели войти в pausedUI и начали двигать - то отменяем переход в pausedUI
            if (Math.abs(startVal - val) > 0 && this.pausedUI === false && this._pausedUITimerId) {
                clearTimeout(this._pausedUITimerId);
                this._pausedUITimerId = null;
                return;
            }

            let x = val - startVal;
            let y = valY - startValY;
            let xy = Math.abs(x / y);
            let yx = Math.abs(y / x);

            let horizontalSwipeGesture = false;
            let verticalSwipeGesture = false;
            let tapGesture = false;

            // debug(xy, limit, xy <= limit)

            if (Math.abs(x) > treshold || Math.abs(y) > treshold) {
                // if (yx <= limit) {
                if (x < 0) {
                    horizontalSwipeGesture = true;
                    // debug("left");
                } else {
                    horizontalSwipeGesture = true;
                    // debug("right");
                }
                // }
                if (xy <= limit) {
                    if (y < 0) {
                        verticalSwipeGesture = true;
                        // debug("top");
                    } else {
                        verticalSwipeGesture = true;
                        // debug("bottom");
                    }
                }
            } else {
                tapGesture = true;
                // debug("tap");
            }

            /** swipe down on 20% */
            if (verticalSwipeGesture && !globalHorizontalSwipeGesture) {
                globalVerticalSwipeGesture = true;

                // если есть swipe_up - пауза у таймера
                // никакой трансформации у сторис
                // открыть поверх iframe с контентом (протянуть снизу вверх)
                // независимо от пальца

                if (y > 10 || this.closeGestureInAction) {
                    this.closeGestureInAction = true;
                    deltaValY = y / windowHeight;

                    // max scale = .9
                    // max translateY = 45%

                    let scaleFactor = 1 - (1 - 0.9) * deltaValY;
                    if (scaleFactor >= 1) {
                        scaleFactor = 1;
                    }

                    let translateY = deltaValY * 100 * (45 / 100); // in percent
                    if (translateY <= 0) {
                        translateY = 0;
                    }

                    // todo ограничить fps 60

                    // _debounce(() => {
                    const storiesViewer: HTMLElement = this.$refs.storiesViewer as HTMLElement;
                    storiesViewer.style.setProperty("transform", `scale(${scaleFactor}) translateY(${translateY}%)`);
                    // }, 150, {
                    //   'leading': true,
                    //   'trailing': false
                    // })
                } else if (y < -10 || this.swipeUpGestureInAction) {
                    this.swipeUpGestureInAction = true;
                    deltaValY = y / windowHeight;
                }
            } else if (horizontalSwipeGesture && !globalVerticalSwipeGesture) {
                this.closeGestureInAction = false;

                globalHorizontalSwipeGesture = true;

                deltaVal = ((startVal - val) / sliderS) * rotationCoef;

                newAngle = this._currentAngle + deltaVal * this.angle;
                angleDelta = newAngle - this._currentAngle;

                if (
                    this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT ||
                    this.transformStyle === WidgetStoriesOptions.SWIPE_COVER
                ) {
                    // set swipe limit for blank stories
                    if (this.nextStoryBlank || this.prevStoryBlank) {
                        if (deltaVal >= 0.05 && this.nextStoryBlank) {
                            deltaVal = 0.05;
                        } else if (deltaVal <= -0.05 && this.prevStoryBlank) {
                            deltaVal = -0.05;
                        }
                    }
                } else {
                    // set swipe limit for blank storis
                    if (this.nextStoryBlank || this.prevStoryBlank) {
                        if (angleDelta >= 5 && this.nextStoryBlank) {
                            newAngle = this._currentAngle + 5;
                        } else if (angleDelta <= -5 && this.prevStoryBlank) {
                            newAngle = this._currentAngle - 5;
                        }
                    }
                }

                let rotate = newAngle * -1;
                // debug(`rotateY(${rotate}deg)`)

                if (this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT) {
                    let centralStoriesTransform: string = "",
                        rightStoriesTransform: string = "",
                        leftStoriesTransform: string = "";

                    leftStoriesTransform = `translateZ(0) translateX(${(1 + deltaVal) * -100}%)`; // -100% => 0 when delta 0 => -1 && -100 => -200 when delta 0 => 1
                    centralStoriesTransform = `translateZ(0) translateX(${deltaVal * -100}%)`; // 0 => -100%
                    rightStoriesTransform = `translateZ(0) translateX(${(1 - deltaVal) * 100}%)`; // 100% => 0

                    this.centralSlideEl !== null &&
                        this.centralSlideEl.style.setProperty("transform", centralStoriesTransform);
                    this.rightSlideEl !== null &&
                        this.rightSlideEl.style.setProperty("transform", rightStoriesTransform);
                    this.leftSlideEl !== null && this.leftSlideEl.style.setProperty("transform", leftStoriesTransform);
                } else if (this.transformStyle === WidgetStoriesOptions.SWIPE_COVER) {
                    let centralStoriesTransform: string = "",
                        rightStoriesTransform: string = "",
                        leftStoriesTransform: string = "";

                    // scale
                    // .9 => 1 when delta 0 => -1 (swipe to right)
                    // 1 => .9 when delta 0 => 1 (swipe to left)

                    // transformX
                    // -10% when delta 0 => -.9
                    // -10% - 0 when  delta -.9 => -1
                    // 0% => -10% when delta 0 => .1
                    // -10% when delta .1 => 1

                    // (1 + deltaVal) * -100
                    // Math.min((1 + deltaVal) * 100, 10) * -1
                    leftStoriesTransform = `translateZ(0) translateX(${
                        (0.1 - (-1 * deltaVal) / 10) * -100
                    }%) scale(${Math.min(0.9 + (-1 * deltaVal) / 10, 1.0)})`; // -100% => 0 when delta 0 => -1 && -100 => -200 when delta 0 => 1
                    centralStoriesTransform = `translateZ(0) translateX(${
                        deltaVal <= 0 ? deltaVal * -100 : (0 - (-1 * deltaVal) / 10) * -100
                    }%) scale(${deltaVal <= 0 ? 1 : 1 + (-1 * deltaVal) / 10})`;
                    rightStoriesTransform = `translateZ(0) translateX(${(1 - deltaVal) * 100}%) scale(1)`; // 100% => 0

                    this.centralSlideEl !== null &&
                        this.centralSlideEl.style.setProperty("transform", centralStoriesTransform);
                    this.rightSlideEl !== null &&
                        this.rightSlideEl.style.setProperty("transform", rightStoriesTransform);
                    this.leftSlideEl !== null && this.leftSlideEl.style.setProperty("transform", leftStoriesTransform);
                } else {
                    // SWIPE_CUBE
                    this.rotationTransform = `rotateY(${rotate}deg)`;
                }

                this.updateRotater({ touchmove: true }); // animation frame
            }
        };

        if (this._slider !== null) {
            this._slider.addEventListener("mousemove", touchmoveListener, false);
            this._slider.addEventListener("touchmove", touchmoveListener, false);
        }

        let touchendListener = (e: Event | TouchEvent) => {
            debug("touchendListener", e);
            if (this._slider !== null) {
                this._slider.removeEventListener("mousemove", touchmoveListener);
                this._slider.removeEventListener("touchmove", touchmoveListener);
                this._slider.removeEventListener("mouseup", touchendListener);
                this._slider.removeEventListener("touchend", touchendListener);
            }

            // если не успели перейти в режим paused
            if (this.timerPaused === false && this._pausedTimerId) {
                clearTimeout(this._pausedTimerId);
                this._pausedTimerId = null;
            }

            if (this._slider !== null) {
                this._slider.classList.remove("no-select");
            }

            if (!deltaVal) {
                if (this.timerPaused) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                this._rotating = false;
                this.timerPaused = false;
                this.pausedUI = false;

                if (globalVerticalSwipeGesture && deltaValY) {
                    const storiesViewer: HTMLElement = this.$refs.storiesViewer as HTMLElement;

                    let currentItem: StoriesItem | BlankStoriesItem | undefined =
                        this.displayedItems[this.currentIndex];
                    let disable_close = false;
                    if (!this.isBlankStories(currentItem) && currentItem instanceof StoriesItem) {
                        disable_close = currentItem.disable_close;
                    }

                    // swipe_down
                    if (deltaValY >= 0) {
                        if (deltaValY <= 0.15 || disable_close) {
                            storiesViewer.style.setProperty("transition", "all .3s");
                            storiesViewer.style.setProperty("transform", "scale(1) translateY(0%)");
                        } else {
                            // TODO animation here
                            storiesViewer.style.setProperty("transition", "opacity .3s");
                            storiesViewer.style.setProperty("opacity", "0");
                            if (this._backdrop !== null) {
                                this._backdrop.style.setProperty("transition", "opacity .3s");
                                this._backdrop.style.setProperty("opacity", "0");
                            }
                            setTimeout(() => {
                                this.closeViewer("swipeDown");
                            }, 400);
                        }
                    } else {
                        // if swipe_up available on this slide
                        if (
                            this._swipeUpLinkTarget &&
                            isObject(this._swipeUpLinkTarget) &&
                            this._swipeUpLinkTarget.swipeUpLinkTarget
                        ) {
                            this.$emit("clickOnButton", {
                                id: this.$store.getters["stories/storyId"],
                                index: this.storyActiveSlide[this.currentIndex],
                                url: this._swipeUpLinkTarget.swipeUpLinkTarget,
                                elementId: this._swipeUpLinkTarget.swipeUpElementId,
                            });
                        }

                        // if swipe_up goods available on this slide
                        if (
                            this._swipeUpGoodsLinkTarget &&
                            isObject(this._swipeUpGoodsLinkTarget) &&
                            this._swipeUpGoodsLinkTarget.swipeUpLinkTarget
                        ) {
                            this.$emit("clickOnSwipeUpGoods", {
                                id: this.$store.getters["stories/storyId"],
                                index: this.storyActiveSlide[this.currentIndex],
                                url: this._swipeUpGoodsLinkTarget.swipeUpLinkTarget,
                                elementId: this._swipeUpGoodsLinkTarget.swipeUpElementId,
                                ...this.getSwipeUpGeometry(),
                                // modeDesktop:
                                // width:
                                // height:
                                // verticalMargin
                            });
                            if (this._swipeUpGoodsLinkTarget.swipeUpElementId) {
                                this.setOpacityByElementId(this._swipeUpGoodsLinkTarget.swipeUpElementId, 0);
                            }
                            this.pauseAndBlockViewerUI();
                        }
                    }

                    globalVerticalSwipeGesture = false;
                    this.closeGestureInAction = false;
                }

                return;
            }

            const endAt = Date.now();
            let slidesRotated = Math.round(angleDelta / this.angle);

            if (slidesRotated === 0) {
                // fast swipe
                if (endAt - startAt <= 500) {
                    slidesRotated = deltaVal < 0 ? -1 : 1;
                }
            }

            if (slidesRotated < 0 && this.prevStoryBlank) {
                slidesRotated = 0;
            } else if (slidesRotated > 0 && this.nextStoryBlank) {
                slidesRotated = 0;
            }

            debug("before rotate", Date.now());
            const started = Date.now();

            let animationEndPromise: Promise<number> | null = null;

            if (this.transformStyle === WidgetStoriesOptions.SWIPE_FLAT) {
                animationEndPromise = this.rotateSliderFlat(slidesRotated);
            } else if (this.transformStyle === WidgetStoriesOptions.SWIPE_COVER) {
                animationEndPromise = this.rotateSliderCover(slidesRotated);
            } else {
                // SWIPE_CUBE
                animationEndPromise = this.rotateSlider(slidesRotated);
            }

            if (animationEndPromise !== null) {
                const currentStoryIndex = this.currentIndex;

                let nextStoryId: number | null = null,
                    nextStoryIndex = -1;
                if (slidesRotated > 0) {
                    if (
                        currentStoryIndex !== -1 &&
                        this.displayedItems[currentStoryIndex + 1] !== undefined &&
                        !this.isBlankStories(this.displayedItems[currentStoryIndex + 1])
                    ) {
                        nextStoryIndex = currentStoryIndex + 1;
                        nextStoryId = this.displayedItems[nextStoryIndex].id;
                    }
                } else if (slidesRotated < 0) {
                    if (
                        currentStoryIndex !== -1 &&
                        this.displayedItems[currentStoryIndex - 1] !== undefined &&
                        !this.isBlankStories(this.displayedItems[currentStoryIndex - 1])
                    ) {
                        nextStoryIndex = currentStoryIndex - 1;
                        nextStoryId = this.displayedItems[nextStoryIndex].id;
                    }
                }

                let slideLoadPromise: Option<Promise<boolean>> = null;
                if (nextStoryId !== null) {
                    slideLoadPromise = this.waitForSlideLoaded(nextStoryId);
                    // чтобы начать загрузку слайда в этот момент (лоадер крутилка)
                    this.$store.commit("stories/setNextFlippingStory", nextStoryId);
                }

                this._animationEndPromise = animationEndPromise;
                this._animationEndPromiseDelta = slidesRotated;
                animationEndPromise.then((direction: number) => {
                    this._animationEndPromise = null;

                    debug("activateStoryAfterSwipe call", Date.now(), Date.now() - started);

                    // debug(`slide direction ${direction}, angleDelta ${angleDelta}, angle ${this.angle}, slidesRotated ${slidesRotated} deltaVal ${deltaVal} ` )
                    // не давать прокручивать больше одного
                    // если индекс слайда не поменялся - значит не dspsdnm и rotateSlider
                    // start next story fnc

                    this.timerPaused = false;
                    this.pausedUI = false;
                    // reset current story
                    // this.$set(this.storyActiveSlide, this.fetchStoryIndex(this.id), 0)

                    this.activateStoryAfterSwipe(slidesRotated, slideLoadPromise);
                });
            }

            deltaVal = 0;
        };

        if (this._slider !== null) {
            this._slider.addEventListener("mouseup", touchendListener, false);
        }
        if (this._slider !== null) {
            this._slider.addEventListener("touchend", touchendListener, false);
        }
    }

    // load() {
    //   return fetchStories().then(({val, totalCount, currentPage}) => {
    //     this.displayedItems = val
    //   })
    // }

    init3DSlider() {
        // TODO if visible and other resize handler

        if (this._slider && this._innerSlider) {
            // если viewer скрыт - то this._slider.clientWidth === 0
            let sliderWidth = this._innerSlider.clientWidth;
            if (sliderWidth > 0) {
                this.$store.commit("stories/setSliderWidth", sliderWidth);
            }
            if (!this._innerSlider.clientWidth && this._sliderWidth) {
                sliderWidth = this._sliderWidth;
            }

            this.angle = 360 / 8;
            if (this.transformStyle === WidgetStoriesOptions.SWIPE_CUBE) {
                this.perspective = sliderWidth * sliderOptions.persMult;
                this.depth = sliderWidth / 2 / Math.tan(((this.angle / 2) * Math.PI) / 180);
            }
        }
    }

    // в setup START
    private _slideRatio = 0.64516129032; // 310/480
    private _viewportWidth: number = _winWidth();
    private __viewportHeight: number = _winHeight();
    private _viewportHeight: number = this.__viewportHeight;
    private _viewportSafeAreaSize: string = "0";
    private _viewportRatio: number = this._viewportWidth / this._viewportHeight;

    public viewportSafeAreaSize() {
        return this._viewportSafeAreaSize;
    }

    private initViewPortSafeArea() {
        this._viewportWidth = _winWidth();
        this.__viewportHeight = _winHeight();
        this._slideRatio = 0.64516129032; // 310/480

        const realSlideHeight = (): number => {
            if (this.desktopMode) {
                return this.__viewportHeight;
            }
            // correct for slide aspect ratio 16:9 (0.5625)
            const ratio = 0.5625;

            let slideHeight = this._viewportWidth / ratio;
            slideHeight += this.needBottomPanel ? 50 : 0;

            return slideHeight;
        };

        this._viewportHeight = realSlideHeight();
        this._viewportRatio = this._viewportWidth / this._viewportHeight;

        if (this.desktopMode) {
            this._viewportSafeAreaSize = `50px 0`;
        } else {
            this._viewportSafeAreaSize = `${(this.__viewportHeight - this._viewportHeight) / 2}px 0`;
        }
    }

    public storiesSlideBottomPosition(story?: StoriesItem | BlankStoriesItem): number {
        if (typeof story !== "undefined" && story instanceof StoriesItem) {
            if (this.needBottomPanel) {
                return 50;
            }
        }
        return 0;
    }

    private _slideViewportHeight(story?: StoriesItem | BlankStoriesItem): number {
        // debug('_viewportHeight', this._viewportHeight)
        let slideViewportHeight = this._viewportHeight;
        // отступы сверху и снизу
        if (this.desktopMode) {
            slideViewportHeight -= 100;
        }
        // 50 if hasLike or favorite
        slideViewportHeight -= this.storiesSlideBottomPosition(story);

        return slideViewportHeight;
    }

    private _slideWidth(story?: StoriesItem | BlankStoriesItem): number {
        return Math.ceil(this._slideHeight(story) * this._slideRatio);
    }

    public storiesSlideWidth(story?: StoriesItem | BlankStoriesItem): string {
        // default auto
        let mql = undefined;

        /** для viewportRatio близких к _ratio **/
        if (
            this._viewportRatio > this._slideRatio &&
            this._viewportRatio - this._slideRatio <= 0.1
            // ||
            // (('matchMedia' in window) && ((mql = window.matchMedia("(orientation: portrait)")) !== undefined) && mql.matches)
        ) {
            return "auto";
        }

        if (this._viewportRatio > this._slideRatio) {
            return `${this._slideWidth(story)}px`;
        } else {
            return "auto";
        }
    }

    private _slideHeight(story?: StoriesItem | BlankStoriesItem): number {
        return this._slideViewportHeight(story);
    }

    public storiesSlideHeight(story?: StoriesItem | BlankStoriesItem): string {
        // default auto
        let mql = undefined;

        /** для viewportRatio близких к _ratio **/
        if (
            (this._viewportRatio > this._slideRatio && this._viewportRatio - this._slideRatio <= 0.1) ||
            ("matchMedia" in window &&
                (mql = window.matchMedia("(orientation: portrait)")) !== undefined &&
                mql.matches)
        ) {
            return "100%";
        }

        if (this._viewportRatio > this._slideRatio) {
            return `${this._slideHeight(story)}px`;
        } else {
            return "100%";
        }
    }

    public storiesSlideOffsetY(story?: StoriesItem | BlankStoriesItem): string {
        if (this._viewportRatio > this._slideRatio) {
            return `${-1 * (Math.ceil(this._slideHeight(story) - this._slideViewportHeight(story)) / 2)}px`;
        } else {
            return "0px";
        }
    }

    public storiesSlideOffsetX(story?: StoriesItem | BlankStoriesItem): string {
        if (this._viewportRatio > this._slideRatio) {
            return "0px";
        } else {
            return `${-1 * (Math.ceil(this._slideWidth(story) - this._viewportWidth) / 2)}px`;
        }
    }

    public storiesSlideOffset(story?: StoriesItem | BlankStoriesItem): string {
        if (this._viewportRatio > this._slideRatio) {
            return `${-1 * (Math.ceil(this._slideHeight(story) - this._slideViewportHeight(story)) / 2)}px auto`;
        } else {
            return `0 ${-1 * (Math.ceil(this._slideWidth(story) - this._viewportWidth) / 2)}px`;
        }
    }

    public slideFontSize(story?: StoriesItem | BlankStoriesItem): string {
        return this._slideWidth(story) / 20 + "px";
    }

    // в setup END

    onTransitionEnd(e: Event | TransitionEvent) {
        this.$emit("transitionend:rotater", {
            propertyName: (e as TransitionEvent).propertyName,
            elapsedTime: (e as TransitionEvent).elapsedTime,
        });
    }

    initSlidesAspectRatio() {
        // this._viewportWidth = _winWidth();
        // this._viewportHeight = _winHeight();
        // this._viewportRatio = this._viewportWidth / this._viewportHeight;

        this.initViewPortSafeArea();

        // без него не хочет по viewportRatio обновлять slideWidth в разметеке
        this.$forceUpdate();
    }

    wrongScreenOrientation: Option<boolean> = null;

    checkScreenOrientation() {
        if (this.desktopMode) return;

        this.wrongScreenOrientation = orientation.type !== SCREEN_ORIENTATIONS.PORTRAIT_PRIMARY;

        const ratioUpdate = () => {
            this.initSlidesAspectRatio();
            this.$forceUpdate();
            this.$nextTick(() => this.init3DSlider());
        };
        setTimeout(ratioUpdate, 0);
        setTimeout(ratioUpdate, 10);
        setTimeout(ratioUpdate, 300);
    }

    initBaseHandlers() {
        this.$on(
            "transitionFromSlide",
            ({
                storyId,
                transitionToType,
                transitionToId,
            }: {
                storyId: number;
                transitionToType: string;
                transitionToId: number;
            }) => {
                this.$store.dispatch("stories/UPDATE_STORY_OPENED", {
                    storyManagerProxy: this.storyManagerProxy,
                    id: storyId,
                    value: true,
                });
                // this.$store.getters['stories/items'][storyId].isOpened = true
                this.$emit("storyOpenedInternal", { id: storyId });
            }
        );

        this.$on("close", () => {
            this.$store.dispatch("stories/UPDATE_STORY_OPENED", {
                storyManagerProxy: this.storyManagerProxy,
                id: this.id,
                value: true,
            });
            // this.$store.getters['stories/items'][this.id].isOpened = true;
            this.$emit("storyOpenedInternal", { id: this.id });

            this.$store.dispatch("stories/UPDATE_STORIES_ACTIVE_INDEX", this.fetchStoryIndexInLoaded(this.id));
            // this.$store.dispatch('UPDATE_STORIES_ORDER')
            const fromStoryId = this.id;
            const fromSlideIndex = this.storyActiveSlide[this.currentIndex];
        });

        this.$on("openViewer", function ({ storiesId }: { storiesId: number }) {
            (window as any).__activeNarrativeId = storiesId;
        });

        this.$on(
            "nextStories",
            ({
                toStoryId,
                fromStoryId,
                fromSlideIndex,
            }: {
                toStoryId: number;
                fromStoryId: number;
                fromSlideIndex: number;
            }) => {
                (window as any).__activeNarrativeId = toStoryId;
            }
        );

        this.$on("nextSlide", ({ fromStoryId, fromSlideIndex }: { fromStoryId: number; fromSlideIndex: number }) => {
            debug(`fromSlideIndex: ${fromSlideIndex}`);
            if (this.$store.getters["stories/items"].get(fromStoryId) !== undefined) {
                this.$store.dispatch("stories/UPDATE_STORY_OPENED", {
                    storyManagerProxy: this.storyManagerProxy,
                    id: fromStoryId,
                    value: true,
                });
                // this.$store.getters['stories/items'][fromStoryId].isOpened = true
                this.$emit("storyOpenedInternal", { id: fromStoryId });
            }
        });
    }

    /**
     * initStatistic
     */
    initStatistic() {
        this.$on(
            "transitionFromSlide",
            ({
                storyId,
                transitionToType,
                transitionToId,
            }: {
                storyId: number;
                transitionToType: string;
                transitionToId: number;
            }) => {
                const event: TransitionFromSlideEvent = {
                    storyId: storyId,
                    slideIndex: this.storyActiveSlide[this.currentIndex],
                    transitionToType: transitionToType,
                    transitionToId: transitionToId,
                };
                this._statistic !== null && this._statistic.emit(EVENT_STORIES_TRANSITION_FROM_SLIDE, event);

                this.$store.dispatch("stories/UPDATE_STORY_OPENED", {
                    storyManagerProxy: this.storyManagerProxy,
                    id: storyId,
                    value: true,
                });
                // this.$store.getters['stories/items'][storyId].isOpened = true
            }
        );

        const actionOnClose = () => {
            this._statistic !== null &&
                this._statistic.emit("closeStoriesViewer", {
                    storyId: this.id,
                    slideIndex: this.storyActiveSlide[this.currentIndex],
                });
        };

        /** скрытие на время перехода в статью **/
        // this.$on('hideViewer', actionOnClose);

        this.$on("close", actionOnClose);

        this.$on("openViewer", function ({ storiesId }: { storiesId: number }) {
            "ga" in window &&
                (window as any).ga("main.send", {
                    hitType: "pageview",
                    page: "NarrativeViewer",
                });
            "ga" in window &&
                (window as any).ga("main.send", "event", "NarrativeViewer", "show", "Open viewer", storiesId);
        });

        this.$on(
            "nextStories",
            ({
                toStoryId,
                fromStoryId,
                fromSlideIndex,
            }: {
                toStoryId: number;
                fromStoryId: number;
                fromSlideIndex: number;
            }) => {
                this._statistic !== null &&
                    this._statistic.emit("nextStory", { toStoryId, fromStoryId, fromSlideIndex });
            }
        );

        this.$on("nextSlide", ({ fromStoryId, fromSlideIndex }: { fromStoryId: number; fromSlideIndex: number }) => {
            this._statistic !== null &&
                this._statistic.emit(EVENT_STORIES_NEXT_SLIDE, {
                    fromStoryId,
                    fromSlideIndex,
                });
        });

        this.$on("showViewerAfterHide", () => {
            this._statistic !== null && this._statistic.emit("showStoriesViewerAfterHide");
        });

        let _doAjaxBeforeUnloadEnabled: boolean = true;
        const _doAjaxBeforeUnload = (e: Event): void => {
            if (!_doAjaxBeforeUnloadEnabled) {
                return;
            }
            _doAjaxBeforeUnloadEnabled = false;

            // не закрываем на unload ничего
            // плохо на share page когда кликаем на карточку товара и уходим со страницы
            /** Запущен article viewer - закрываем и вызываем событие закрытия для статистики */
            // if (this.articleViewerVisible) {
            //   this.closeArticleViewer();
            // }
            //
            // /** Закрываем основной viewer */
            // this.closeViewerImportant();

            return;
        };

        window.onbeforeunload = _doAjaxBeforeUnload;
        window.addEventListener("unload", (e: Event) => {
            _doAjaxBeforeUnload(e);
        });
    }

    refreshSlidesLinks(): void {
        if (this.$refs.storiesSlide !== undefined) {
            this.leftSlideEl = (this.$refs.rotater as HTMLElement).querySelector("._transform_left");
            this.centralSlideEl = (this.$refs.rotater as HTMLElement).querySelector("._transform_front");
            this.rightSlideEl = (this.$refs.rotater as HTMLElement).querySelector("._transform_right");
        }
    }

    setLike(item: StoriesItem, like: number): void {
        this.$store.dispatch("stories/UPDATE_STORY_LIKE", {
            storyManagerProxy: this.storyManagerProxy,
            id: item.id,
            like,
        });
        this.$emit("likeStory", { id: item.id, index: this.storyActiveSlide[this.currentIndex], value: like === 1 });
    }

    setDislike(item: StoriesItem, like: number): void {
        this.$store.dispatch("stories/UPDATE_STORY_LIKE", {
            storyManagerProxy: this.storyManagerProxy,
            id: item.id,
            like,
        });
        this.$emit("dislikeStory", {
            id: item.id,
            index: this.storyActiveSlide[this.currentIndex],
            value: like === -1,
        });
    }

    private _blockFavoriteBtn = false;

    setBookmark(item: StoriesItem, favorite: number): void {
        if (!this._blockFavoriteBtn) {
            this._blockFavoriteBtn = true;

            this.$store
                .dispatch("stories/UPDATE_STORY_FAVORITE", {
                    storyManagerProxy: this.storyManagerProxy,
                    id: item.id,
                    favorite,
                })
                .then((value) => {
                    // this.$emit('favoriteStoryInternal', {id: item.id, value});
                })
                .catch((e) => {
                    console.error("UPDATE_STORY_FAVORITE", e);
                })
                .finally(() => {
                    this._blockFavoriteBtn = false;
                });

            // just click
            // todo add favorite success and fail events
            this.$emit("favoriteStory", {
                id: item.id,
                index: this.storyActiveSlide[this.currentIndex],
                value: favorite === 1,
            });
        }
    }

    pauseUI() {
        this.timerPaused = true;
        this.pausedUI = true;
    }
    resumeUI() {
        this.timerPaused = false;
        this.pausedUI = false;
    }

    inputModalConfig: Option<InputModalConfig> = null;
    inputModalOpen = false;
    inputModalId: string = "";

    shareLink: Option<string> = null;
    sharePanelOpen = false;
    shareId: string = "";

    isShareAsScreenshot(item: StoriesItem): boolean {
        const slidesShareAsScreenshot =
            this.$store.getters["stories/items"].get(item.id)?.slides_screenshot_share ?? [];
        const index =
            this.storyActiveSlide[this.currentIndex] !== undefined ? this.storyActiveSlide[this.currentIndex] : 0;

        if (slidesShareAsScreenshot !== undefined && slidesShareAsScreenshot[index] !== undefined) {
            return Boolean(slidesShareAsScreenshot[index]);
        }
        return false;
    }

    async actionShare(item: StoriesItem) {
        this.$emit("shareStory", { id: item.id, index: this.storyActiveSlide[this.currentIndex] });

        const performShareAction = () => {
            let sharePath = this.$store.getters["stories/items"].get(item.id)?.sharePath;
            if (sharePath) {
                this.$emit("shareStoryWithPath", {
                    id: item.id,
                    index: this.storyActiveSlide[this.currentIndex],
                    url: sharePath,
                });

                const openSharePanel = () => {
                    this.shareLink = sharePath;
                    this.sharePanelOpen = true;
                };
                const pauseUI = () => {
                    this.timerPaused = true;
                    this.pausedUI = true;
                };
                const resumeUI = () => {
                    this.timerPaused = false;
                    this.pausedUI = false;
                };

                this.$emit("shareStoryInternal", {
                    title: this.$store.getters["stories/items"].get(item.id)?.title,
                    text: "",
                    url: sharePath,
                });

                // if (this.desktopMode || !(navigator as any).share) {
                //     openSharePanel();
                //     pauseUI();
                // } else {
                //     try {
                //         (navigator as any).share({
                //             title: this.$store.getters['stories/items'].get(item.id)?.title,
                //             text: '',
                //             url: sharePath,
                //         })
                //             .then(() => resumeUI())
                //             .catch((error: any) => resumeUI());
                //         pauseUI();
                //     } catch (e) {
                //         // navigator.share есть но не срабатывает на win 7 например
                //         openSharePanel();
                //         pauseUI();
                //     }
                // }
            }
        };

        const performScreenShotShareAction = async () => {
            const slide = this.centralSlideEl?.querySelector(
                ".stories-slide._position_1 .stories-slide-content.narrative-slide"
            );

            if (slide) {
                const file = await ScreenShotGenerator.processSlideElement(
                    ScreenShotGenerator.ENV.ANDROID,
                    slide,
                    ScreenShotGenerator.extractStyles(function (styleRule) {
                        return true;
                    })
                );

                // const directDownload = (file: File) => {
                //     const onFocus = () => {
                //         resumeUI();
                //         window.removeEventListener('blur', onBlur);
                //         window.removeEventListener('focus', onFocus);
                //     };
                //     const onBlur = () => {
                //         pauseUI();
                //         window.addEventListener('focus', onFocus, false);
                //     };
                //     window.addEventListener('blur', onBlur, false);
                //
                //     const imageURL = URL.createObjectURL(file);
                //     const link = document.createElement('a');
                //     link.href = imageURL;
                //     link.download = 'image.jpeg';
                //     document.body.appendChild(link);
                //     link.click();
                //     document.body.removeChild(link);
                // }
                const pauseUI = () => {
                    this.timerPaused = true;
                    this.pausedUI = true;
                };
                const resumeUI = () => {
                    this.timerPaused = false;
                    this.pausedUI = false;
                };

                this.$emit("shareStoryInternal", { files: [file] });

                // @ts-ignore
                // if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                //     try {
                //         (navigator as any).share({files: [file]})
                //             .then(() => resumeUI())
                //             .catch(() => resumeUI());
                //         pauseUI();
                //     } catch (e) {
                //         console.error(e)
                //         // navigator.share есть но не срабатывает на win 7 например
                //         directDownload(file);
                //     }
                // } else {
                //     directDownload(file);
                // }
            }
        };

        // TODO если !needSession - это share_page и sharePath уже есть в сторе
        if (this.isShareAsScreenshot(item)) {
            performScreenShotShareAction();
        } else {
            if (needSession()) {
                try {
                    await this.$store.dispatch("stories/GET_SHARE_PATH", {
                        storyManagerProxy: this.storyManagerProxy,
                        id: item.id,
                    });
                    performShareAction();
                } catch (e) {
                    console.error(e);
                }
            } else {
                performShareAction();
            }
        }
    }

    sharePanelComplete(isSuccess: boolean) {
        this.timerPaused = false;
        this.pausedUI = false;
        if (this.shareId) {
            (window as any).share_complete(this.shareId, isSuccess);
            this.shareId = "";
        }
    }

    async onMute(): Promise<void> {
        await this.$store.dispatch("stories/MUTE");
        this.$emit("changeSoundOnInternal", { value: false });
    }

    async onUnmute(): Promise<void> {
        await this.$store.dispatch("stories/UNMUTE");
        this.$emit("changeSoundOnInternal", { value: true });
    }

    beforeCreate() {}

    created() {
        this.createDisplayedItems();

        // push history state

        this._body = document.querySelector("body");

        this._backdrop = document.createElement("div");
        this._backdrop.classList.add("stories-viewer-backdrop");

        this._currentProgress = 0;
        this._progressBeforePause = 0;

        this._pausedSlide = null;
        this._pausedStory = null;

        this._currentAngle = 0;
        this._rotating = false;

        this._slider = null;
        this._innerSlider = null;

        this.sliderWidth = 0;

        this._pausedUITimerId = null;
        this._pausedTimerId = null;
        this._timerForceEnd = false;

        // todo focus and blur

        // window.addEventListener("pageshow", () => {
        //   debug('pageshow')
        // }, false);
        // window.addEventListener("pagehide", () => {
        //   debug('pagehide')
        // }, false);

        // let storiesList = this.$store.state.stories.filter(_ => _),
        //     list        = []
        // storiesList.forEach(item => {
        //   list.push(item.id)
        //   this.storyActiveSlide.push(0)
        // })

        // this.updateDisplayedItems();

        /*this.$store.watch(
      (state) => {
        return this.$store.state.showStoriesView // could also put a Getter here
      },
      (newValue, oldValue) => {

        //something changed do something
        const html = document.querySelector('html')
        if (newValue) {
          html.style['overflow'] = 'hidden'
        } else {
          html.style['overflow'] = null
        }

        // debug(oldValue)
        // debug(newValue)
      },
//Optional Deep if you need it
      {
        deep: true
      }
    )*/

        this._html = document.querySelector("html");
        this._globalWrapper = document.querySelector("body > .wrapper");

        this.lockVerticalScroll();

        this.initBaseHandlers();
        if (needSession()) {
            this.initStatistic();
        }

        // this._viewportWidth = _winWidth();
        // this._viewportHeight = _winHeight();
        // this._viewportRatio = this._viewportWidth / this._viewportHeight;
        this.initViewPortSafeArea();
    }

    ready() {}

    beforeDestroy() {
        if (this._backdrop !== null && this._body !== null) {
            this._body.removeChild(this._backdrop);
        }

        // fullScreenCancel();

        this.removeAllEventListeners();

        this.timerPaused = true;

        // const html = document.querySelector('html')
        // html.style['overflow'] = ''
        // html.style['height'] = ''
        //
        // const body = document.querySelector('body')
        // body.style['overflow'] = ''

        this.unlockVerticalScroll();

        // if (this.screenOrientationLocked) {
        //     orientation.unlock();
        // }
    }

    screenOrientationLocked = false;

    beforeMount() {
        // this._viewportWidth = _winWidth();
        // this._viewportHeight = _winHeight();
        // this._slideRatio = 0.64516129032;

        this.initViewPortSafeArea();

        this.needBottomPanel = this.items.some((item) => {
            return this.hasLike(item) || this.hasFavorite(item) || this.hasShare(item) || this.hasAudio(item);
        });

        // this.initStoriesStyle();
        this.initStoriesScript();
        this.initDataFeature();

        // try {
        //     orientation.lock(SCREEN_ORIENTATIONS.PORTRAIT_PRIMARY);
        //     this.screenOrientationLocked = true;
        // } catch (error) {
        //     this.screenOrientationLocked = false;
        //     debug(error);
        // }
    }

    __afterStartInitQueue: Array<() => void> = [];

    mounted() {
        if (needSession()) {
            this._statistic = new StoriesStatistic(this.$store, this.storyManagerProxy);
        }

        this.currentIndex = this.activeStoryIndex;
        debug(`mounted this.currentIndex: ${this.currentIndex}`);

        this.updateDisplayedItems();
        // this.refreshSlidesLinks();

        if (this._backdrop !== null && this._body !== null) {
            this._body.appendChild(this._backdrop);
        }

        this.initStoriesStyle();

        // todo если окно уходит из mainActivity - ставить на паузу
        const currentStoryId = this.id;
        // при старте share-page не ставит этот параметр
        this.$store.commit("stories/SET_ACTIVE_STORY", currentStoryId);
        this.waitForSlideLoaded(currentStoryId).then((result) => {
            if (result) {
                this.$emit("showStory", { id: currentStoryId, index: 0 });
                this.$emit("showSlide", { id: currentStoryId, index: 0 });
                this.setTimer();
                this.slideStart();
            } else {
                debug(`slide don\`t loaded: ${currentStoryId}`);
            }
        });

        // чтобы начать загрузку слайда в этот момент (лоадер крутилка)
        if (this.nextFlippingStoryId === this.id) {
            this.$store.commit("stories/setNextFlippingStory", null);
        }
        this.$store.commit("stories/setNextFlippingStory", this.id);

        const rotater: HTMLElement = this.$refs.rotater as HTMLElement;

        if (rotater !== null) {
            rotater.addEventListener("transitionend", this.onTransitionEnd, false);
        }

        // готовим весь список
        const ids: Array<number> = [];

        this.items.forEach((item: StoriesItem | BlankStoriesItem) => {
            if (item instanceof StoriesItem) {
                ids.push(item.id);
            }
        });

        const FETCH_STORIES_SLIDES_cb = () => {
            // debug('all stories fetched')

            this.displayedItems.forEach(() => this.storyActiveSlide.push(0));

            // this.updateDisplayedItems();

            this.$nextTick(() => {
                this._slider = this.$el;
                this._innerSlider = this.$refs["innerSlider"] as HTMLDivElement;
                this.init3DSlider();

                window.addEventListener("resize", this.init3DSlider);

                this.rotateSlider(this.currentIndex, true);

                if (this._slider !== null) {
                    /* Feature detection */
                    let passiveSupported = false;
                    try {
                        window.addEventListener(
                            "abort",
                            (_) => _,
                            Object.defineProperty({}, "passive", {
                                get: function () {
                                    passiveSupported = true;
                                },
                            })
                        );
                    } catch (err) {}

                    this._slider.addEventListener("mousedown", this.dragRotationHandler, false);
                    this._slider.addEventListener(
                        "touchstart",
                        this.dragRotationHandler,
                        passiveSupported ? ({ passive: true } as EventListenerOptions) : false
                    );
                }
            });

            // this.$store.getters['stories/loadedStories'].forEach((storiesItem: StoriesItem) => {
            //
            //   const articleIds = storiesItem.articleIds,
            //     issueArticleIds = storiesItem.issueArticleIds;
            //
            //   this.$store.dispatch('article/FETCH_ARTICLES', articleIds);
            //   this.$store.dispatch('article/FETCH_ISSUE_ARTICLES', issueArticleIds);
            // });
        };
        FETCH_STORIES_SLIDES_cb();
        // this.$store.dispatch('stories/FETCH_STORIES_SLIDES', ids).then(FETCH_STORIES_SLIDES_cb);

        this.initSlidesAspectRatio();

        window.addEventListener("resize", this.initSlidesAspectRatio);

        (orientation as any).addEventListener("change", this.checkScreenOrientation);
        this.checkScreenOrientation();

        this.$emit("openViewer", { storiesId: this.id });
        this.$emit("nextStories", { toStoryId: this.id });

        // this.$on('nextStories', () => {
        //     this.initStoriesStyle();
        // });

        this.__afterStartInitQueue = [];
        this.$on("showSlide", ({ index }: { index: number }) => {
            if (Array.isArray(this.__afterStartInitQueue)) {
                for (let i = 0; i < this.__afterStartInitQueue.length; i++) {
                    if (isFunction(this.__afterStartInitQueue[i])) {
                        this.__afterStartInitQueue[i]();
                    }
                }
                this.__afterStartInitQueue = [];
            }
        });
    }

    /** Watch */
    @Watch("timerPaused")
    onTimerPausedChanged(to: boolean, from: boolean) {
        if (to === true && from === false) {
            this.onPause();
        } else if (to === false && from === true) {
            this.onResume();
        }
    }
}
</script>
<!--<script src="./my-component.js"></script>-->
<!--<style src="./my-component.css"></style>-->
<style lang="scss">
// @import variables
// типография и прочее

/*@import "~components/MdAnimation/variables";*/
/*@import "~components/MdElevation/mixins";*/
/*@import "~components/MdLayout/mixins";*/

body {
    max-width: 100vw;
}

.btn-icon {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &:focus {
        outline: 0;
    }

    background-color: transparent;
    border: none;
    color: white;
    cursor: pointer;

    &:disabled {
        color: rgb(70, 70, 70);
        cursor: not-allowed;
    }
}

.stories-viewer-backdrop {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1040;
    //background-color: rgba(255, 255, 255, .1);
    background-color: transparent;
}

.stories-viewer {
    position: fixed;
    z-index: 1100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;

    /*display: table;*/
    display: block;
    transition: opacity 0.3s ease;

    text-align: center;
    /*-webkit-backface-visibility: hidden;*/
    /*-moz-backface-visibility: hidden;*/
    /*-ms-backface-visibility: hidden;*/
    /*backface-visibility: hidden;*/

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    &:-webkit-full-screen,
    &:-moz-full-screen,
    &:-ms-fullscreen,
    :fullscreen {
        width: 100% !important;
        height: 100% !important;
    }
}

.stories-viewer__close {
    border: 0;
    padding: 0;
    background: transparent;
    position: absolute;
    top: 25px;
    /*right: 15px;*/
    z-index: 1140;
    pointer-events: all;
    cursor: pointer;
    outline: none;

    &:focus {
        outline: none;
    }

    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.stories-item {
    visibility: hidden;
    position: absolute;
    width: 100%;
    height: auto;
    bottom: 0;

    backface-visibility: hidden;

    /*overflow: hidden;*/

    &._active {
        visibility: visible;
        /*overflow: hidden;*/
    }

    &._transform_left {
        /*z-index: 10;*/
    }

    &._transform_front {
        /*z-index: 20;*/
    }

    &._transform_right {
        /*z-index: 30;*/
    }
}

.stories-viewer {
    &._close-gesture {
        .stories-item {
            &._transform_left,
            &._transform_right {
                visibility: hidden;
            }
        }
    }
}

.stories-button-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #000;
}
button {
    // prevent btn click bgColor
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}
.stories-button-panel-actions {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;

    color: white;
    align-items: center;

    > span {
        display: flex;
    }

    .right-container {
        margin-left: auto;
    }
}

.button-panel-action {
    cursor: pointer;
    pointer-events: all;

    > * {
        pointer-events: none;
    }

    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    width: 50px;

    // prevent btn click bgColor
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/**
* for desktop view
**/

.slider3d__btn_next,
.slider3d__btn_prev {
    display: none;
}

.stories-viewer {
    .slider3d__wrapper {
        left: 50%;
        transform: translateX(-50%);
        overflow: hidden;
    }

    .game-reader-wrapper,
    .share-panel-wrapper {
        overflow: hidden;
    }

    &._desktop-mode {
        .stories-pager {
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }

        .slider3d__wrapper {
            padding: 50px 0;

            &,
            .stories-slide,
            .narrative-slide-background,
            .narrative-slide-elements {
                border-radius: 5px;
            }

            .game-reader-wrapper,
            & > .share-panel-wrapper {
                top: 50px;
                bottom: 50px;
                border-radius: 5px;

                &.share-panel-wrapper {
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                }
            }
        }

        .slider3d__btn_next,
        .slider3d__btn_prev {
            display: block;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: 50%;
        }

        &._with-bottom-panel {
            .slider3d__wrapper {
                &,
                .stories-slide,
                .narrative-slide-background,
                .narrative-slide-elements {
                    border-bottom-right-radius: 0;
                    border-bottom-left-radius: 0;
                }
            }
        }
    }
}

.stories-slide {
    border-radius: calc(var(--slideBorderRadius, 0) * 1px);
    overflow: hidden;
}

.stories-viewer-background {
    position: fixed;
    top: -60px;
    left: -60px;
    width: calc(100% + 120px);
    height: calc(100% + 120px);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    filter: blur(30px);
    opacity: 0.56;
}

/**
* For 3d
**/

.stories-face {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    // fix in FF && chrome on mac M1: in case rotater 90 degrees - pointer events vanish
    width: calc(100% + 0.01px);
    height: 100%;
}

.slider3d__rotater {
    --tick: 0%;
    --tickOpacity: 0;
}

@keyframes stories_spin {
    from {
        transform: rotateY(0);
    }
    to {
        transform: rotateY(360deg);
    }
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: 300px;
    margin: 0 auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    /*transition: all .3s ease;*/
    font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.modal-body {
    margin: 20px 0;
}

.modal-default-button {
    float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}

.slider3d {
    $sliderHeight: 100vh;
    position: fixed !important;

    &.no-select {
        user-select: none;
    }

    &__wrapper {
        z-index: 1;
        position: relative;
        height: 100%;
    }

    &__inner {
        @extend %fullHeightEl;
    }

    &__rotater {
        @extend %fullHeightEl;
    }

    &__item {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        /*height: 100%;*/
        backface-visibility: hidden;
        transform-style: preserve-3d;
    }
}

.fade-enter-active,
.fade-leave-active {
    /*transition: opacity .5s;*/
}

.fade-enter,
.fade-leave-to {
    /*opacity: 0;*/
}

/** 3D Swiper */
%fullHeightEl {
    position: relative;
    height: 100%;
    transform-style: preserve-3d;
}

@media (prefers-color-scheme: dark) {
    .stories-viewer {
        background-color: #000;
    }

    .stories-button-panel {
        background-color: #000;
    }
}
</style>
