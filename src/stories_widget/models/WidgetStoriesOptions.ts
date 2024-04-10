export enum ReaderCloseButtonPosition {
    LEFT = 'left',
    RIGHT = 'right'
}
export enum ReaderSwipeStyle {
    FLAT = 'flat',
    COVER = 'cover',
    CUBE = 'cube'
}


export interface IWidgetStoriesOptions {

    hasLike: boolean;
    hasFavorite: boolean;

    slider: SliderOptions;
    reader: ReaderOptions;
    placeholders: Dict;

    userId: Nullable<string | number>;
    tags: Nullable<string>;

    favorite: FavoriteOptions;

    lang: Nullable<string>;

}

export type FavoriteOptions = {
    title: {
        content: string;
    }
};

export type SliderOptions = {
    title: SliderTitleOptions;
    card: SliderCardOptions;
    favoriteCard: SliderFavoriteCardOptions;
    layout: {
        height: number;
        backgroundColor: string;
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
        // nextEl - html link ???
        // prevEl
    };

}

export type SliderTitleOptions = {
    content: string;
    color: string;
    font: string;
    marginBottom: number;
}
export enum SliderCardViewVariant {
    CIRCLE = 'circle',
    QUAD = 'quad',
    RECTANGLE = 'rectangle'
}
export type SliderCardOptions = {
    title: {
        color: string;
        padding: string | number;
        font: string;
    };
    gap: number;
    height: number;
    variant: SliderCardViewVariant;
    border: {
        radius: number;
        color: string;
        width: number;
        gap: number;
    };
    boxShadow: Nullable<string>;
    opacity: Nullable<number>;
    mask: {
        color: Nullable<string>;
    };
    read: {
        border: {
            radius: Nullable<number>;
            color: Nullable<string>;
            width: Nullable<number>;
            gap: Nullable<number>;
        };
        boxShadow: Nullable<string>;
        opacity: Nullable<number>;
        mask: {
            color: Nullable<string>;
        };
    };

}

export type SliderFavoriteCardOptions = SliderCardOptions & {
    title: {
        content: string;
        color: string;
        padding: string | number;
        font: string;
    }
};

export type ReaderOptions = {
    closeButtonPosition: ReaderCloseButtonPosition,
    scrollStyle: ReaderSwipeStyle,
    loader: {
        default: {
            color: Nullable<string>,
            accentColor: Nullable<string>,
        },
        custom: Nullable<string>
    },
    faviconApiUrl: string,
    slideBorderRadius?: number
};


export module WidgetStoriesOptions {
    export const STYLE_CIRCLE = 'circle';
    export const STYLE_QUAD = 'quad';
    export const STYLE_RECTANGLE = 'rectangle';

    export const SWIPE_CUBE = 'cube';
    export const SWIPE_FLAT = 'flat';
    export const SWIPE_COVER = 'cover';

    export const CLOSE_BUTTON_LEFT = 'left';
    export const CLOSE_BUTTON_RIGHT = 'right';
}
