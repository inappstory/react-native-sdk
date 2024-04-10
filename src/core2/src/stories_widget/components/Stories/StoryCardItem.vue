<template>
    <div class="stories-slide-wrapper">
        <div class="stories-slide" :class="classList" :style="styleList">
            <a class="stories-slide__link" rel="noreferrer" :style="{paddingTop: `${(1 / cardAspectRatio) * 100}%`}" v-on:click.stop.prevent="$emit('click:item', story, index)">
                <div class="stories-slide-image"
                     :style="{'background-color': story.background_color ? story.background_color : 'transparent'}">
                    <div class="stories-slide-image__wrap">
                        <div class="stories-slide-image__image _mode_list" :style="imageStyle">
                            <video v-if="hasVideoCover" :src="story.videoCoverSrc" :poster="story.imageSrc" loop muted playsinline webkit-playsinline autobuffer autoplay />
                            <StoriesCardItemFavoriteCells v-if="story.favorite_cell" :stories-item="story" />
                        </div>
                    </div>
                </div>
                <div class="stories-slide__mask"></div>
                <div class="stories-slide__content">
                    <div class="stories-slide__title clamp _line-count_2" :style="titleStyle">{{ story.title }}</div>
                    <div class="stories-slide__bottom">
                        <div
                            class="stories-slide__source-name stories-slide-source-name _size_small text-footnote-mobile">
                            {{ story.magazine_name }}
                        </div>
                    </div>
                </div>
            </a>
            <!--<div class="stories-slide__inner-border"></div>-->
            <!--<div class="stories-slide__outer-border"></div>-->
        </div>
    </div>
</template>

<script lang="ts">

import {Component, Inject, Prop, Vue, Watch} from "vue-property-decorator"
import {Getter} from 'vuex-class';
import StoriesItem from "~/src/stories_widget/models/StoriesItem"
import {WidgetStoriesOptions} from "~/src/stories_widget/models/WidgetStoriesOptions"
import isString from 'lodash/isString'
import {ClickOnStoryInternalPayload, STORY_LIST_TYPE, STORY_READER_WINDOW_REFERER} from "~/src/types";
import {StoriesStatistic} from "~/src/stories_widget/components/StoriesStatistic";
// import {ensureSession, Session} from "~/src/stories_widget/models/Session";
import StoriesCardItemFavoriteCells from "~/src/stories_widget/components/Stories/StoriesCardItemFavoriteCells.vue";
import {StoriesListFavoriteCardOptions} from "~/src/types/storyManager/storiesList";

interface StylesObject {
    [key: string]: string
}

const namespace: string = 'shared';

@Component({
    name: "StoryCardItem",
    components: {
        StoriesCardItemFavoriteCells
    }
})
export default class StoriesListItem extends Vue {
    // name: "stories-list-item",
    @Prop({required: true}) readonly item!: StoriesItem;
    @Prop({required: true}) readonly index!: number;
    @Prop({required: false}) readonly dragScrollStartAt!: Nullable<Date>;
    @Prop({required: false, default: () => STORY_LIST_TYPE.default}) readonly listType!: STORY_LIST_TYPE;
    @Prop({required: false, default: () => STORY_READER_WINDOW_REFERER.default}) readonly windowReferer!: STORY_READER_WINDOW_REFERER;
    // inject: ['reOrderItems'],
    @Inject('reOrderItems') reOrderItems!: Function

    // @State('stories') stories: StoriesState;
    // @Action()

    @Getter('storiesStyle', {namespace}) storiesStyle!: string;
    @Getter('storiesHeight', {namespace}) storiesHeight!: number;

    @Getter('storiesListItemBoxShadow', {namespace}) storiesListItemBoxShadow!: Nullable<string>;
    @Getter('storiesListItemBoxShadowRead', {namespace}) storiesListItemBoxShadowRead!: Nullable<string>;
    @Getter('storiesListItemOpacity', {namespace}) storiesListItemOpacity!: Nullable<number>;
    @Getter('storiesListItemOpacityRead', {namespace}) storiesListItemOpacityRead!: Nullable<number>;
    @Getter('items', {namespace}) items!: Map<number, StoriesItem>;

    @Getter('storiesListItemFavoriteOptions', {namespace}) storiesListItemFavoriteOptions!: StoriesListFavoriteCardOptions;

    get story() {
        // fallback for favorite cell
        return this.items.get(this.item.id) as StoriesItem || this.item;
    }

    get hasVideoCover(): boolean {
        return this.story.videoCoverSrc !== null;
    }

    get classList(): Array<string | object> {
        const background = this.story.background;
        let backgroundClass = '';
        if (background !== undefined) {
            backgroundClass = `_background-color-${background.color}` + (background.gradient === true ? '-gradient' : '')
        }
        return [
            backgroundClass,
            {'_is-read': this.story.isOpened},

            {'_format-rectangle': this.storiesStyle === WidgetStoriesOptions.STYLE_RECTANGLE},
            {'_format-circle': this.storiesStyle === WidgetStoriesOptions.STYLE_CIRCLE},
            {'_format-quad': this.storiesStyle === WidgetStoriesOptions.STYLE_QUAD},
            {'_favorite-cell': this.story.favorite_cell}
        ]
    }

    get cardAspectRatio(): number {
        if (this.storiesStyle === WidgetStoriesOptions.STYLE_CIRCLE || this.storiesStyle === WidgetStoriesOptions.STYLE_QUAD) {
           return 1;
        } else if (this.storiesStyle === WidgetStoriesOptions.STYLE_RECTANGLE) {
            return .8;
        }
        return 1;
    }

    get styleList(): Dict<any> {

        let styles = {
            width: '0px',
            opacity: 1,
            boxShadow: 'unset',
        };

        styles.width = `${this.cardAspectRatio * this.storiesHeight}px`;

        if (this.storiesListItemBoxShadow !== null) {
            styles.boxShadow = this.storiesListItemBoxShadow;
        }
        if (this.storiesListItemOpacity !== null) {
            styles.opacity = this.storiesListItemOpacity;
        }
        if (this.story.isOpened) {
            if (this.storiesListItemBoxShadowRead !== null) {
                styles.boxShadow = this.storiesListItemBoxShadowRead;
            }
            if (this.storiesListItemOpacityRead !== null) {
                styles.opacity = this.storiesListItemOpacityRead;
            }
        }



        return styles;
    }

    get imageStyle(): Object {
        let styles: StylesObject = {};
        if (this.story.imageSrc !== null && !this.hasVideoCover) {
            (<any>Object).assign(styles, {"background-image": `url('${this.story.imageSrc}')`})
        }
        return styles
    }

    get titleStyle(): Object {
        let styles: StylesObject = {};
        if (this.story.title_color) {
            (<any>Object).assign(styles, {"color": this.story.title_color})
        }
        return styles
    }

    get isReaded(): boolean {
        return this.story.isOpened
    }

    // onStoriesItemClick(id) {
    //     this.$store.commit('SET_ACTIVE_STORY', {storyId: id})
    // }

    @Watch('isReaded')
    onIsReadedChanged(to: boolean, from: boolean) {
        if (to === true && from === false) {
            this.reOrderItems()
        }
    }

    mounted() {
        this.$on('click:item', (item: StoriesItem, index: number): void => {

            if (this.dragScrollStartAt !== null && this.dragScrollStartAt.getTime() <= (new Date()).getTime()) {
                return;
            }

            // first load data and context

            const validDeeplink = isString(item.deeplink) && item.deeplink.trim().length > 0;

            if (item.hide_in_reader && !validDeeplink) {
                console.error('Cannot open hidden narrative id' + item.id);
                return;
            }

            const clickEvent = {
                id: item.id,
                index,
                isDeeplink: false,
                url: item.deeplink ?? undefined,
            };

            if (validDeeplink && item.deeplink !== null) {
                clickEvent.isDeeplink = true;
                clickEvent.url = item.deeplink as string;

              this.$emit('clickOnStoryDeepLink', clickEvent);
              return;
            }

            this.$emit('clickOnStory', clickEvent);

            const clickOnStoryInternalPayload =
                {
                    id: item.id,
                    listType: this.listType,
                    windowReferer: this.windowReferer,
                } as ClickOnStoryInternalPayload;
            this.$emit('clickOnStoryInternal', clickOnStoryInternalPayload);

            // const ids: Array<number> = [];
            // this.$store.getters['stories/activeStories'].forEach((item: StoriesItem) => {
            //     ids.push(item.id)
            // });
            //
            // this.$store.dispatch('stories/FETCH_STORIES_CONTEXT', ids).then(() => {
            //     debug('stories context loaded');
            //     this.$store.dispatch('stories/FETCH_STORY', item.id).then((): void => this.$store.commit('stories/SET_ACTIVE_STORY', item.id))
            //     // fullScreen(document.querySelector('#app_bottom'))
            //
            // });


        })

    }


}
</script>

<style lang="scss">

$_storiesListItem_borderNotReadWidth: 2px;
$_storiesListItem_borderReadWidth: 1px;

$_storiesListItem_borderGapNotRead: 2px;
$_storiesListItem_borderGapRead: 3px;

$_storiesListItem_borderRadius: 5px;

.stories-slide-wrapper {

    .stories-slide {
        display: block;
        box-sizing: border-box;
        text-align: left;
        position: relative;
        user-select: none;
        overflow: visible;

        border: var(--storiesListBorderNotReadWidth, $_storiesListItem_borderNotReadWidth) solid var(--storiesBorderNotReadColor, #00b956);
        padding: var(--storiesListBorderGapNotRead, $_storiesListItem_borderGapNotRead);


        &._format-quad, &._format-rectangle {
            border-radius: var(--storiesListBorderRadius, $_storiesListItem_borderRadius);

            .stories-slide-image {
                border-radius: var(--storiesListInnerBorderRadiusNotRead, $_storiesListItem_borderRadius);
            }

            .stories-slide-image__image {
                &, video {
                    border-radius: var(--storiesListInnerBorderRadiusNotRead, $_storiesListItem_borderRadius);
                }
            }

            .stories-slide__mask {
                border-radius: var(--storiesListInnerBorderRadiusNotRead, $_storiesListItem_borderRadius);
            }

            .stories-slide__content {
                border-radius: var(--storiesListInnerBorderRadiusNotRead, $_storiesListItem_borderRadius);
            }

            &._is-read {
                border: var(--storiesListBorderReadWidth, $_storiesListItem_borderReadWidth) solid var(--storiesBorderReadColor, #ededed);
                padding: var(--storiesListBorderGapRead, $_storiesListItem_borderGapRead);
                border-radius: var(--storiesListBorderRadiusRead, $_storiesListItem_borderRadius);

                .stories-slide-image {
                    border-radius: var(--storiesListInnerBorderRadiusRead, $_storiesListItem_borderRadius);
                }

                .stories-slide-image__image {
                    &, video {
                        border-radius: var(--storiesListInnerBorderRadiusRead, $_storiesListItem_borderRadius);
                    }
                }

                .stories-slide__mask {
                    border-radius: var(--storiesListInnerBorderRadiusRead, $_storiesListItem_borderRadius);
                }

                .stories-slide__content {
                    border-radius: var(--storiesListInnerBorderRadiusRead, $_storiesListItem_borderRadius);
                }
            }
        }


    }

    /** относительно этого элемента выравниваем иконку stories с маской */
    .stories-slide__link {
        display: block;
        position: relative;
        cursor: pointer;

        &:hover {
            text-decoration: none;
        }
    }

    .stories-slide {
        &._background-color-black {
            background: #000000;
        }

        &._background-color-white {
            background: #ffffff;
        }

        &._background-color-red {
            background: #ff1a36;
        }

        &._background-color-yellow {
            background: #fff000;
        }

        &._background-color-green {
            background: #0be361;
        }

        &._background-color-violet {
            background: #b300bc;
        }

        &._background-color-blue {
            background: #0761db;
        }

        &._background-color-grey {
            background: #a8a8a8;
        }

        &._background-color-black-gradient {
            background: #ffffff;
            background: linear-gradient(0deg, #c1c1c1, #000);
        }

        &._background-color-white-gradient {
            background: #ffffff;
            background: linear-gradient(180deg, #fff, #ffc800);
        }

        &._background-color-red-gradient {
            background: #ff1a36;
            background: linear-gradient(180deg, #c90174, #eb5c57);
        }

        &._background-color-yellow-gradient {
            background: #fff000;
            background: linear-gradient(0deg, #fbda61, #f76b1c);
        }

        &._background-color-green-gradient {
            background: #0be361;
            background: linear-gradient(0deg, #b4ed50, #429321);
        }

        &._background-color-violet-gradient {
            background: #b300bc;
            background: linear-gradient(180deg, #c90174, #0164fd);
        }

        &._background-color-blue-gradient {
            background: #0761db;
            background: linear-gradient(180deg, #3023ae, #53a0fe 48%, #b4ed50);
        }

        &._background-color-grey-gradient {
            background: #a8a8a8;
            background: linear-gradient(0deg, #e2e2e2, #959595);
        }
    }

    .stories-slide-image {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        //border-radius: var(--storiesListBorderRadius, $_storiesListItem_borderRadius);
    }

    .stories-slide-image__wrap {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .stories-slide-image__image {
        //border-radius: var(--storiesListBorderRadius, $_storiesListItem_borderRadius);
        position: relative;
        opacity: 1; // 0 before load - then 1
        transition: opacity .3s ease-in-out;
        overflow: hidden;

        &._mode_list {
            width: 100%;
            height: 100%;
            /*background-position: 0 -20px;*/
            /*background-size: 100% auto;*/
            background-size: cover;
            background-repeat: no-repeat;
            background-position: 50% 50%;
        }

        video {
            min-height: 100%;
            min-width: 100%;
            width: 100%;
            background-position: center center;
            background-repeat: no-repeat;
            object-fit: cover;
        }
    }

    .stories-slide__mask {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2;
        /*transition: opacity .1s ease-out;*/
        background-color: var(--storiesListItemMaskColor, rgba(0, 0, 0, 0));
        /*background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(34, 34, 34, 0.3) 70%, rgba(34, 34, 34, 0.3) 100%);*/
        opacity: 1;
        //border-radius: var(--storiesListBorderRadius, $_storiesListItem_borderRadius);
    }

    .stories-slide._is-read {
        .stories-slide__mask {
            background-color: var(--storiesListItemMaskColorRead, rgba(0, 0, 0, 0));
        }
    }

    .stories-slide__content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        height: 100%;
        max-height: 100%;
        box-sizing: border-box;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        //border-radius: var(--storiesListBorderRadius, $_storiesListItem_borderRadius);
        -webkit-box-pack: end;
        -ms-flex-pack: end;
        justify-content: flex-end;
        /*padding-bottom: 40px;*/

        // clamp 3 строчки


        color: var(--storiesListItemTitleColor, white);
        font-family: var(--storiesListItemTitleFontFamily);
        font-weight: normal;
        font-size: 1rem;
        line-height: normal;
        font: var(--storiesListItemTitleFont, normal);

        text-decoration: none;

        padding: var(--storiesListItemTitlePadding, 1rem);

    }

    .stories-slide__source-name {
        opacity: 0;
    }

    .clamp {
        /*-webkit-column-count: 3;*/
        /*column-count: 3;*/
        /*width: calc(200% - 50px);*/
        /*height: 100%;*/
        /*position: absolute;*/
        /*-webkit-column-fill: auto;*/
        /*column-fill: auto;*/
        /*-webkit-column-gap: 50px;*/
        /*column-gap: 50px;*/
        /*-webkit-column-rule: none;*/
        /*column-rule: none;*/

        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .stories-slide__title {
        white-space: pre-wrap;
    }

    .stories-slide__bottom {

        /*display: none !important;*/

        position: absolute;
        bottom: 15px;
        left: 15px;
        /*right: 18px;*/
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -ms-flex-negative: 0;
        flex-shrink: 0;
        min-height: 15px;
    }
}

// форма иконок // к .stories-slide
.stories-slide {

    &._format-quad {
        /*width: var(--storiesHeight, 175px);*/
        /*height: var(--storiesHeight, 175px);*/
    }

    &._format-rectangle {
        /*width: var(--storiesHeight, 175px); // 175 * 220px 220/175 = 1.257142857142857*/
        /*height: calc(var(--storiesHeight, 175px) * 1.257142857142857);*/
    }

    &._format-circle {
        /*width: var(--storiesHeight, 70px);*/
        /*height: var(--storiesHeight, 70px);*/

        .stories-slide__content {
            display: none;
        }

        &, .stories-slide-image__image, .stories-slide-image__image video,  .stories-slide__mask, .stories-slide-image {
            border-radius: 50%;
        }
    }

}

.stories-slide {
    &._favorite-cell {
        .stories-slide__mask {
            background-image: linear-gradient(to bottom, rgba(255,255,255,.5) 0%, rgba(255,255,255,.5) 100%);
        }
    }
}

</style>
