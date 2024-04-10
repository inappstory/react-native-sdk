<template>
    <div :style="rootVars">
        <slot/>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {mapGetters} from "vuex";

function isNumeric(n: string | number): boolean {
    return !isNaN(parseFloat((<string>n))) && isFinite((<number>n));
}

const StoryCardsWrapper = Vue.extend({
    computed: {
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

            storiesBorderNotReadColor: 'storiesBorderNotReadColor',
            storiesBorderReadColor: 'storiesBorderReadColor',
            storiesListBorderNotReadWidth: 'storiesListBorderNotReadWidth',
            storiesListBorderReadWidth: 'storiesListBorderReadWidth',
            storiesListBorderGapNotRead: 'storiesListBorderGapNotRead',
            storiesListBorderGapRead: 'storiesListBorderGapRead',
            storiesListBorderRadius: 'storiesListBorderRadiusNotRead',
            storiesListBorderRadiusRead: 'storiesListBorderRadiusRead',

            withListControls: 'storiesListControls',
            storiesListControlsSize: 'storiesListControlsSize',
            storiesListControlsBackgroundColor: 'storiesListControlsBackgroundColor',
            storiesListControlsColor: 'storiesListControlsColor',

            storiesStyle: 'storiesStyle',

            sliderOptions: 'sliderOptions',

        }),

        rootVars(): Dict<string> {
            // todo проверить - вызывается много раз
            let styles = {
                '--storiesBorderNotReadColor': this.storiesBorderNotReadColor,
                '--storiesBorderReadColor': (this.storiesBorderReadColor ?? this.storiesBorderNotReadColor),
                '--storiesGap': this.storiesGap + 'px',
                '--storiesHeight': this.storiesHeight + 'px',

                '--storiesListSidePadding': this.storiesListSidePadding + 'px',
                '--storiesListBottomMargin': this.storiesListBottomMargin + 'px',

                '--storiesListBorderNotReadWidth': this.storiesListBorderNotReadWidth + 'px',
                '--storiesListBorderReadWidth': (this.storiesListBorderReadWidth ?? this.storiesListBorderNotReadWidth) + 'px',
                '--storiesListBorderGapNotRead': this.storiesListBorderGapNotRead + 'px',
                '--storiesListBorderGapRead': (this.storiesListBorderGapRead ?? this.storiesListBorderGapNotRead) + 'px',
                '--storiesListBorderRadius': this.storiesListBorderRadius + 'px',
                '--storiesListBorderRadiusRead': (this.storiesListBorderRadiusRead ?? this.storiesListBorderRadius) + 'px',

                '--storiesListItemMaskColor': this.sliderOptions.card.mask.color,
                '--storiesListItemMaskColorRead': (this.sliderOptions.card.opened.mask.color ?? this.sliderOptions.card.mask.color),

                '--storiesListItemTitleColor': this.sliderOptions.card.title.color,
                '--storiesListItemTitleFontFamily': 'InternalPrimaryFont',
                '--storiesListItemTitleFont': this.sliderOptions.card.title.font,
                '--storiesListItemTitlePadding': isNumeric(this.sliderOptions.card.title.padding) ? this.sliderOptions.card.title.padding + 'px' : this.sliderOptions.card.title.padding,


                '--storiesListControlsSize': isNumeric(this.storiesListControlsSize) ? this.storiesListControlsSize + 'px' : this.storiesListControlsSize,
                '--storiesListControlsBackgroundColor': this.storiesListControlsBackgroundColor,
                '--storiesListControlsColor': this.storiesListControlsColor,

                '--storiesListInnerBorderRadiusNotRead': this.storiesListBorderRadiusNotRead() + 'px',
                '--storiesListInnerBorderRadiusRead': this.storiesListBorderRadiusReadFn() + 'px',

            };
            return styles;
        },
    },
    methods: {
        storiesListBorderRadiusNotRead(): number {
            return this.storiesListBorderRadius - (parseFloat(this.storiesListBorderNotReadWidth) / 2) - parseFloat(this.storiesListBorderGapNotRead);
        },
        storiesListBorderRadiusReadFn(): number {
            return (this.storiesListBorderRadiusRead ?? this.storiesListBorderRadius) - (parseFloat((this.storiesListBorderReadWidth ?? this.storiesListBorderNotReadWidth)) / 2) - parseFloat((this.storiesListBorderGapRead ?? this.storiesListBorderGapNotRead));
        },
    },

});

export default StoryCardsWrapper;
</script>

