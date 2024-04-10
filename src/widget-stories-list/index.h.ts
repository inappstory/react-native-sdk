import {Option, Dict} from "../../global.h";
import {StoriesListFavoriteCardOptions} from "../widget-story-favorite-reader/index.h";
import {StoriesListSliderAlign, StoriesListCardTitleTextAlign, StoriesListCardTitlePosition} from "../story-manager/types/storyManager/storiesList";

export {StoriesListSliderAlign, StoriesListCardTitleTextAlign, StoriesListCardTitlePosition};

export type StoriesListOptions = {
    title: StoriesListTitleOptions;
    card: StoriesListCardOptions;
    favoriteCard: StoriesListFavoriteCardOptions;
    layout: {
        storiesListInnerHeight: number | null;
        height: number;
        backgroundColor: string;
        sliderAlign: StoriesListSliderAlign;
    };
    sidePadding: number;
    topPadding: number;
    bottomPadding: number;
    bottomMargin: number;

    navigation: {
        showControls: boolean;
        controlsSize: number;
        controlsBackgroundColor: string;
        controlsColor: string;
    };

    extraCss?: string;

    // setCallback ?
    handleStoryLinkClick?: (payload: StoriesListClickEvent) => void;

    handleStartLoad?: (loaderContainer: HTMLElement) => void;
    handleStopLoad?: (loaderContainer: HTMLElement) => void;


    // handleClickOnStory?: (event: StoriesListClickEvent) => void,

}

export type StoriesListTitleOptions = {
    content: string;
    color: string;
    font: string;
    marginBottom: number;
}

export enum StoriesListCardViewVariant {
    CIRCLE = 'circle',
    QUAD = 'quad',
    RECTANGLE = 'rectangle'
}


export type StoriesListCardOptions = {
    title: {
        color: string;
        padding: string | number;
        font: string;
        display: boolean;
        textAlign: StoriesListCardTitleTextAlign;
        position: StoriesListCardTitlePosition;
        lineClamp: number;
    };
    gap: number;
    height: number;
    variant: StoriesListCardViewVariant;
    border: {
        radius: number;
        color: string;
        width: number;
        gap: number;
    };
    boxShadow: Option<string>;
    dropShadow?: Option<string>;
    opacity: Option<number>;
    mask: {
        color: Option<string>;
    };
    svgMask?: Option<{
        cardMask: Option<string>;
        overlayMask: Array<{
            mask: Option<string>;
            background: Option<string>;
        }>;
    }>;
    opened: {
        border: {
            radius: Option<number>;
            color: Option<string>;
            width: Option<number>;
            gap: Option<number>;
        };
        boxShadow: Option<string>;
        dropShadow?: Option<string>;
        opacity: Option<number>;
        mask: {
            color: Option<string>;
        };
        svgMask?: Option<{
            cardMask: Option<string>;
            overlayMask: Array<{
                mask: Option<string>;
                background: Option<string>;
            }>;
        }>;
    };
}



export type StoriesListClickEvent = {
    id: number,
    index: number,
    isDeeplink: boolean,
    url: string|undefined,
};



export enum StoriesListEvents {
    START_LOADER = 'startLoad',
    END_LOADER = 'endLoad',
}

export type ListLoadStatus = {
    feed: string|number,
    defaultListLength: number,
    favoriteListLength: number,
    success: boolean,
    error: Option<{
        name: string,
        networkStatus: number,
        networkMessage: string
    }>
};


const StoriesListOptionsDefault: StoriesListOptions =
    {
        title: {
            content: '',
            color: '#ffffff',
            font: 'normal',
            marginBottom: 20,
        },
        card: {
            title: {
                font: 'normal',
                color: '#ffffff',
                padding: 15,
                textAlign: StoriesListCardTitleTextAlign.LEFT,
                position: StoriesListCardTitlePosition.CARD_INSIDE_BOTTOM,
                display: true,
                lineClamp: 3,
            },
            gap: 10,
            height: 70,
            variant: StoriesListCardViewVariant.CIRCLE,
            border: {
                radius: 0,
                color: 'black',
                width: 2,
                gap: 3,
            },
            boxShadow: null,
            dropShadow: null,
            opacity: null,
            mask: {
                color: null,
            },
            svgMask: null,
            opened: {
                border: {
                    radius: null,
                    color: null,
                    width: null,
                    gap: null,
                },
                boxShadow: null,
                dropShadow: null,
                opacity: null,
                mask: {
                    color: null,
                },
                svgMask: null,
            },
        },
        favoriteCard: {
            title: {
                content: 'Favorite',
                font: 'normal',
                color: '#000',
                padding: 15,
                textAlign: StoriesListCardTitleTextAlign.LEFT,
                position: StoriesListCardTitlePosition.CARD_INSIDE_BOTTOM,
                display: true,
                lineClamp: 3,
            },
            gap: 10,
            height: 70,
            variant: StoriesListCardViewVariant.CIRCLE,
            border: {
                radius: 0,
                color: 'black',
                width: 2,
                gap: 3,
            },
            boxShadow: null,
            dropShadow: null,
            opacity: null,
            mask: {
                color: null,
            },
            svgMask: null,
            opened: {
                border: {
                    radius: null,
                    color: null,
                    width: null,
                    gap: null,
                },
                boxShadow: null,
                dropShadow: null,
                opacity: null,
                mask: {
                    color: null,
                },
                svgMask: null,
            },
        },
        sidePadding: 20,
        topPadding: 20,
        bottomPadding: 20,
        bottomMargin: 17,
        layout: {
            height: 0,
            storiesListInnerHeight: null,
            backgroundColor: 'transparent',
            sliderAlign: StoriesListSliderAlign.LEFT
        },
        navigation: {
            showControls: false,
            controlsSize: 48,
            controlsBackgroundColor: 'white',
            controlsColor: 'black'
        },
    };

export {StoriesListOptionsDefault};

export type StoriesListDimensions = {
    totalHeight: number;
}
