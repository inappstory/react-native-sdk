<template>
    <StoryCardsWrapper class="stories-list-wrapper"
                       :class="{loaded, 'mode-desktop': modeDesktop, 'with-list-controls': withListControls}" :style="rootVars">
        <div class="stories-list">
            <div class="stories-list__title" v-if="sliderOptions.title.content" :style="{
        'margin-bottom': `${sliderOptions.title.marginBottom}px`,
        }">
                <h3 :style="{
        'color': sliderOptions.title.color,
        'font-family': 'InternalPrimaryFont',
        'font-size': '20px',
        'font-weight': 'bold',
        'line-height': '20px',
        'font': sliderOptions.title.font,
        }">{{ sliderOptions.title.content }}</h3>
            </div>
            <div class="stories-list__actions" v-if="false">
                <a href="#" class="text-header-additional text-no-decoration text-color-white"
                   @click.stop.prevent="onShowAll">Посмотреть все <i class="small-arrow"></i></a>
            </div>
            <div class="stories-list__viewport" v-if="displayedItems.length > 0" :style="{
            'margin-left': -storiesListSidePadding + 'px',
            'margin-right': -storiesListSidePadding + 'px',
            'height': (parseFloat(storiesHeight) + parseFloat(storiesListBottomMargin)) + 'px'
            }">
                <div class="stories-list__viewport-inner mode-desktop" :class="{'with-list-controls': withListControls}"
                     ref="viewportInner" v-if="modeDesktop" v-dragscroll.x="{positionX:scrollPositionX}"
                     v-on:dragscrollstart="scrollStart" v-on:dragscrollend="scrollEnd($event.detail)">
                    <StoryCardItem v-for="(item, index) in displayedItems" :key="item.id" :item="item" :index="index"
                                   :data-id="item.id"
                                   :style="slideWrapperStyle(index)" :dragScrollStartAt="dragScrollStartAt"
                                   @clickOnStory="$emit('clickOnStory', $event)"
                                   @clickOnStoryDeepLink="$emit('clickOnStoryDeepLink', $event)"
                                   @clickOnStoryInternal="$emit(item.favorite_cell ? 'clickOnFavoriteCellInternal' : 'clickOnStoryInternal', $event)"
                                   @sessionInitInternal="$emit('sessionInitInternal', $event)"
                    />
                </div>
                <div class="stories-list__viewport-inner" ref="viewportInner" v-else>
                    <StoryCardItem v-for="(item, index) in displayedItems" :key="item.id" :item="item" :index="index"
                               :data-id="item.id"
                               :style="slideWrapperStyle(index)" :dragScrollStartAt="null"
                               @clickOnStory="$emit('clickOnStory', $event)"
                               @clickOnStoryDeepLink="$emit('clickOnStoryDeepLink', $event)"
                               @clickOnStoryInternal="$emit(item.favorite_cell ? 'clickOnFavoriteCellInternal' : 'clickOnStoryInternal', $event)"
                               @sessionInitInternal="$emit('sessionInitInternal', $event)"
                    />
                </div>
            </div>
        </div>
        <div class="stories-list-controls">
            <div @click.stop="scrollLeft" class="control control-left" :class="{active: scrollLeftActive}"
                 :style="{bottom: ((parseFloat(storiesHeight) / 2) + parseFloat(storiesListBottomMargin)) + 'px', left: (-1 * parseFloat(storiesListSidePadding)) + 'px'}">
                <div class="control-icon"></div>
            </div>
            <div @click.stop="scrollRight" class="control control-right" :class="{active: scrollRightActive}"
                 :style="{bottom: ((parseFloat(storiesHeight) / 2) + parseFloat(storiesListBottomMargin)) + 'px', right: (-1 * parseFloat(storiesListSidePadding)) + 'px'}">
                <div class="control-icon"></div>
            </div>
        </div>
    </StoryCardsWrapper>
</template>

<script lang="ts">

// import {
//   fetchStories
// } from '../api'
import StoryCardItem from "~/src/stories_widget/components/Stories/StoryCardItem.vue"
import StoryCardsWrapper from "~/src/stories_widget/components/Stories/StoryCardsWrapper.vue"
import {mapGetters} from 'vuex'
import Vue from 'vue'
// import {dragscroll} from 'vue-dragscroll'
import {dragscroll} from '~/src/stories_widget/components/dragscroll'
import {WidgetStoriesOptions} from "~/src/stories_widget/models/WidgetStoriesOptions";
import StoriesItem from "~/src/stories_widget/models/StoriesItem";
import AbstractModel from "~/src/stories_widget/models/AbstractModel";
import debounce from 'lodash/debounce'


function isNumeric(n: string | number): boolean {
    return !isNaN(parseFloat((<string>n))) && isFinite((<number>n));
}

const initThumbViews = (emit: (event: string, ...args: any[]) => void, viewport: HTMLElement) => {
    try {
        const viewportPositions = viewport.getBoundingClientRect();
        const viewportWidth = viewportPositions.x + viewportPositions.width;
        const positions: Map<number, number> = new Map();

        Array.prototype.slice.call(viewport.children).forEach((item) => {
            const id = parseInt(item.dataset['id']);
            const positionX = item.getBoundingClientRect().x;
            if (id) {
                positions.set(positionX, id);
            }
        });

        const scrollHandler = debounce((scrollLeft: number) => {
            const scrolledPosition = viewportWidth + scrollLeft;
            const newThumbViews: Array<number> = [];
            positions.forEach((id, position) => {
                if (!viewThumbsSet.has(id)) {
                    if (position <= scrolledPosition) {
                      viewThumbsSet.add(id);
                        newThumbViews.push(id);
                    }
                }
            });
            if (newThumbViews.length > 0) {
              emit('flushThumbViews', newThumbViews);
            }

            return;
        }, 1000, {leading: true});

        scrollHandler(0);

        return scrollHandler;

        // (scrollLeft + width) >= position - set read
        // if all readed - remove listener


    } catch (e) {
        console.error(e);
    }
};

let viewThumbsScrollHandler: ((scrollLeft: number) => void) | undefined;
const viewThumbsSet: Set<number> = new Set();

const StoriesList = Vue.extend({
    name: "StoriesList",
    components: {StoryCardItem, StoryCardsWrapper},
    directives: {dragscroll},
    props: {
        loaded: {
            type: Boolean,
            default: () => false,
        }
    },
    data(): any {
        return {
            // displayedItems: this.$store.getters.activeStories,
            dragScrollStartAt: null,
            viewPortScrollLeft: 0,
            scrollPositionX: 0,
            thumbViewsHandlerInited: false,
        }
    },
    computed: {
        ...mapGetters('stories', {
            activeStoryIndex: 'activeStoryIndex',
            modeDesktop: 'modeDesktop',
        }),

        ...mapGetters('shared', { // связать с данными хранилища
            defaultLoadedStories: 'defaultLoadedStories',
            favoriteLoadedStories: 'favoriteLoadedStories',

            // options

            storiesListBottomMargin: 'storiesListBottomMargin',
            storiesListSidePadding: 'storiesListSidePadding',
            storiesListTopPadding: 'storiesListTopPadding',
            storiesListBottomPadding: 'storiesListBottomPadding',

            storiesBackgroundColor: 'storiesBackgroundColor',

            storiesGap: 'storiesGap',

            storiesHeight: 'storiesHeight',

            withListControls: 'storiesListControls',
            storiesListControlsSize: 'storiesListControlsSize',
            storiesListControlsBackgroundColor: 'storiesListControlsBackgroundColor',
            storiesListControlsColor: 'storiesListControlsColor',

            storiesStyle: 'storiesStyle',

            sliderOptions: 'sliderOptions',

            sdkHasFavorite: 'hasFavorite',

            storiesListItemFavoriteOptions: 'storiesListItemFavoriteOptions',

        }),

        scrollLeftActive: function (): boolean {
            return this.viewPortScrollLeft > 0;

        },
        scrollRightActive: function (): boolean {
            const itemsWidth = Math.floor((parseFloat(this.getStoriesWidth()) + parseFloat(this.storiesGap)) * this.displayedItems.length) + 2 * parseFloat(this.storiesListSidePadding) - parseFloat(this.storiesGap);
            let viewPortWidth = 0;
            if (this.$refs.viewportInner !== undefined) {
                viewPortWidth = this.$refs.viewportInner.clientWidth;
            }
            return this.viewPortScrollLeft < (itemsWidth - viewPortWidth);
        },
        favoriteCell: function(): Optional<StoriesItem> {
            const item = AbstractModel.createInstance(StoriesItem, {
                id: 0,
                title: this.storiesListItemFavoriteOptions.title.content,
                title_color: this.storiesListItemFavoriteOptions.title.color,
                is_opened: true,
                background_color: "white",
            });
            item.favorite_cell = true;

            return item;
        },
        displayedItems: function(): Array<StoriesItem> {
            const defaultLoadedStories: Array<StoriesItem> = this.defaultLoadedStories;
            if (this.sdkHasFavorite) {
                if (this.favoriteLoadedStories.length > 0 && defaultLoadedStories.length > 0) {
                    return [...defaultLoadedStories, this.favoriteCell];
                }
            }
            return defaultLoadedStories;
        },

        rootVars(): Dict<string> {
            // todo проверить - вызывается много раз
            let styles = {
                '--background-color': this.storiesBackgroundColor,

                'padding-left': this.storiesListSidePadding + 'px',
                'padding-right': this.storiesListSidePadding + 'px',
                'padding-top': this.storiesListTopPadding + 'px',
                'padding-bottom': this.storiesListBottomPadding + 'px',

                'background-color': this.storiesBackgroundColor,
            };
            return styles;
        },

    },
    watch: {
        activeStoryIndex: function (position, oldPosition) {
            if (this.$refs.viewportInner) {
                this.$refs.viewportInner.scrollLeft = ((parseFloat(this.getStoriesWidth()) + parseFloat(this.storiesGap)) * position);
            }
        },
        displayedItems: function (element, prevElement) {
            this.$nextTick(() => {
                if (this.$refs.viewportInner) {
                    if (!this.thumbViewsHandlerInited) {
                        this.thumbViewsHandlerInited = true;
                        viewThumbsScrollHandler = initThumbViews((...args) => this.$emit.apply(this, args), this.$refs.viewportInner);
                    }
                    if (!this.modeDesktop) {
                        /* Feature detection */
                        let passiveSupported = false;
                        try {
                            window.addEventListener(
                                "abort",
                                _ => _,
                                Object.defineProperty({}, "passive", {
                                    get: function () {
                                        passiveSupported = true;
                                    }
                                }) as EventListenerOptions);
                        } catch (err) {
                        }
                        this.$refs.viewportInner.addEventListener('scroll', this.viewPortOnScroll, passiveSupported ? {passive : true} as EventListenerOptions : false)
                    }
                }
            });
        }
    },
    provide: function (): any {
        return {
            reOrderItems: this.reOrderItems
        }
    },
    beforeDestroy() {
        if (this.$refs.viewportInner !== undefined) {
            this.$refs.viewportInner.removeEventListener("scroll", this.viewPortOnScroll)
        }
    },
    methods: {
        viewPortOnScroll(): void {
            // for mobile native scroller
            if (this.$refs.viewportInner !== undefined) {
                this.viewPortScrollLeft = this.$refs.viewportInner.scrollLeft;
            }
            viewThumbsScrollHandler && viewThumbsScrollHandler(this.viewPortScrollLeft);
        },
        getStoriesWidth(): number {
            if (this.storiesStyle === WidgetStoriesOptions.STYLE_CIRCLE || this.storiesStyle === WidgetStoriesOptions.STYLE_QUAD) {
                return (1 * this.storiesHeight);
            } else if (this.storiesStyle === WidgetStoriesOptions.STYLE_RECTANGLE) {
                return (this.storiesHeight * .8);
            }
            return 0;
        },
        scrollLeft() {
            const position = 1;
            this.scrollPositionX = undefined;
            this.$nextTick(() => {
                this.scrollPositionX = 1 * ((parseFloat(this.getStoriesWidth()) + parseFloat(this.storiesGap)) * position);
                this.$nextTick(() => this.scrollPositionX = undefined);
            });

        },
        scrollRight() {
            const position = 1;
            this.scrollPositionX = undefined;
            this.$nextTick(() => {
                this.scrollPositionX = -1 * ((parseFloat(this.getStoriesWidth()) + parseFloat(this.storiesGap)) * position);
                this.$nextTick(() => this.scrollPositionX = undefined);
            });

        },
        slideWrapperStyle(index: number): object {
            let styles = {
                'margin-right': '0',
                'padding-left': '0',
                'padding-right': '0'
            };

            if (index !== this.displayedItems.length - 1) {
                styles['margin-right'] = this.storiesGap + 'px';
            } else {
                styles['padding-right'] = this.storiesListSidePadding + 'px'
            }

            if (index === 0) {
                styles['padding-left'] = this.storiesListSidePadding + 'px';
            }

            return styles;

        },
        onShowAll() {
            const id = this.$store.getters['stories/firstActiveStoryId'];
            this.$refs.viewportInner.scrollLeft = 0;
            this.$store.dispatch('stories/FETCH_STORY', id).then(() => this.$store.commit('stories/SET_ACTIVE_STORY', id));

            // fullScreen(document.querySelector('#app_bottom'))

        },

        reOrderItems() {
            // console.log('call reOrderItems')
        },
        scrollStart() {
            this.dragScrollStartAt = new Date();
        },
        scrollEnd(currentPosition: any) {
            this.viewPortScrollLeft = -1 * currentPosition.x;
            if (currentPosition.mouseup) {
                setTimeout(() => this.dragScrollStartAt = null, 100);
            }
            viewThumbsScrollHandler && viewThumbsScrollHandler(this.viewPortScrollLeft);
        },

        onStoryOpened(id: number) {

          if (!viewThumbsSet.has(id)) {
              viewThumbsSet.add(id);
            this.$emit('flushThumbViews', [id]);
          }
        }

    }

});

export default StoriesList;


</script>
<style lang="scss">
h3 {
    margin: 0;
}

// отступы
.stories-list-wrapper {
    background-color: var(--background-color, transparent);
    opacity: 0;
    height: 0;
    padding: 0;
    transition: opacity .5s ease-in-out;

    .stories-list-controls {
        display: none;
    }

    &.mode-desktop {
        &.with-list-controls {
            position: relative;

            .stories-list-controls {
                position: relative;
                display: block;

                .control-left, .control-right {
                    cursor: pointer;
                    position: absolute;
                    background-color: var(--storiesListControlsBackgroundColor, white);
                    border-radius: 50%;
                    z-index: 10;
                    height: var(--storiesListControlsSize);
                    width: var(--storiesListControlsSize);
                    transform: translateY(50%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .control-icon {
                    width: 7px;
                    height: 12px;
                    background-color: var(--storiesListControlsColor, black);
                }

                .control-left {
                    .control-icon {
                        -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='7' height='12' viewBox='0 0 7 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 11L1 6L6 1' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                        mask-image: url("data:image/svg+xml,%3Csvg width='7' height='12' viewBox='0 0 7 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 11L1 6L6 1' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    }
                }

                .control-right {
                    .control-icon {
                        -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='7' height='12' viewBox='0 0 7 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 11L6 6L1 1' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                        mask-image: url("data:image/svg+xml,%3Csvg width='7' height='12' viewBox='0 0 7 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 11L6 6L1 1' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    }
                }
            }

        }
    }
}

.stories-list-wrapper.loaded {
    height: auto;
    opacity: 1;
}

.stories-list {
    position: relative;
    overflow: visible;
    @media (min-width: 767.99px) {
        overflow: hidden;
    }
}

.stories-list__title {
    cursor: default;

    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.stories-list__actions {
    position: absolute;
    right: 0;
    top: 0;
}

// scroll view
.stories-list__viewport {

    // скрываем scroll bar везде
    height: var(--storiesHeight, 70px); // slide + outer border
    overflow: hidden;
}

.stories-list__viewport-inner {
    display: flex;
    flex-wrap: nowrap;

    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
        display: none;
    }

    &.mode-desktop:not(.with-list-controls) {
        overflow: hidden;
        scroll-behavior: unset;
    }

    .stories-slide-wrapper {
        flex: 0 0 auto;
        // скрываем scroll bar везде

        padding-bottom: var(--storiesListBottomMargin, 17px);
    }
}

.stories-slide-wrapper:not(:last-child) {
    margin-right: var(--storiesGap, 20px);
}

.stories-slide-wrapper {
    &:first-child {
        padding-left: var(--storiesListSidePadding, 20px);
    }

    &:last-child {
        padding-right: var(--storiesListSidePadding, 20px);
    }

}


</style>
