<template>
    <div :style="rootVars">
        <slot/>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {mapGetters} from "vuex";
import {Option} from "../../../../global.h";

function isNumeric(n: string | number): boolean {
    return !isNaN(parseFloat((n as string))) && isFinite((n as number));
}

const symbols = /[\r\n%#()<>?[\\\]^`{|}]/g;
function encodeSVG (data: string, externalQuotesValue = "double") {
    // Use single quotes instead of double to avoid encoding.
    if (externalQuotesValue === `double`) {
        data = data.replace(/"/g, `'`);
    } else {
        data = data.replace(/'/g, `"`);
    }

    data = data.replace(/>\s{1,}</g, `><`);
    data = data.replace(/\s{2,}/g, ` `);

    // Using encodeURIComponent() as replacement function
    // allows to keep result code readable
    return data.replace(symbols, encodeURIComponent);
}

const StoryCardsWrapper = Vue.extend({
    computed: {
        ...mapGetters('shared', { // связать с данными хранилища
            favoriteLoadedStories: 'favoriteLoadedStories',

            // options

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

        rootVars(): Dict<Option<string>> {
            // todo проверить - вызывается много раз
            let styles: Dict<Option<string>> = {
                '--storiesBorderNotReadColor': this.storiesBorderNotReadColor,
                '--storiesBorderReadColor': (this.storiesBorderReadColor ?? this.storiesBorderNotReadColor),
                '--storiesGap': this.storiesGap + 'px',
                '--storiesHeight': this.storiesHeight + 'px',

                '--storiesListSidePadding': this.storiesListSidePadding + 'px',

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

                '--storiesListCardDropShadow': this.sliderOptions.card.dropShadow,
                '--storiesListCardOpenedDropShadow': this.sliderOptions.card.opened.dropShadow,
                '--storiesListCardFavoriteDropShadow': this.sliderOptions.favoriteCard.dropShadow,

                '--storiesListCardMask': this.sliderOptions.card.svgMask?.cardMask ? `url("data:image/svg+xml,${encodeSVG(this.sliderOptions.card.svgMask?.cardMask)}")` : null,
                '--storiesListCardOpenedMask': this.sliderOptions.card.opened.svgMask?.cardMask ? `url("data:image/svg+xml,${encodeSVG(this.sliderOptions.card.opened.svgMask?.cardMask)}")` : null,
                '--storiesListCardFavoriteMask': this.sliderOptions.favoriteCard.svgMask?.cardMask ? `url("data:image/svg+xml,${encodeSVG(this.sliderOptions.favoriteCard.svgMask?.cardMask)}")` : null,
            };

            let cardOverlayMask = this.sliderOptions.card.svgMask?.overlayMask;
            if (cardOverlayMask != null && Array.isArray(cardOverlayMask)) {
                cardOverlayMask.forEach((item, index) => styles[`--storiesListCardOverlay${index}Mask`] = item.mask ? `url("data:image/svg+xml,${encodeSVG(item.mask)}")` : null);
            }

            cardOverlayMask = this.sliderOptions.card.opened.svgMask?.overlayMask;
            if (cardOverlayMask != null && Array.isArray(cardOverlayMask)) {
                cardOverlayMask.forEach((item, index) => styles[`--storiesListCardOpenedOverlay${index}Mask`] = item.mask ? `url("data:image/svg+xml,${encodeSVG(item.mask)}")` : null);
            }

            cardOverlayMask = this.sliderOptions.favoriteCard.svgMask?.overlayMask;
            if (cardOverlayMask != null && Array.isArray(cardOverlayMask)) {
                cardOverlayMask.forEach((item, index) => styles[`--storiesListCardFavoriteOverlay${index}Mask`] = item.mask ? `url("data:image/svg+xml,${encodeSVG(item.mask)}")` : null);
            }

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

