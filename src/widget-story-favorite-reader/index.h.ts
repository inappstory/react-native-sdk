import {StoriesListCardOptions} from "../widget-stories-list/index.h";

export type StoriesListFavoriteCardOptions = StoriesListCardOptions & {
    title: {
        content: string;
        color: string;
        padding: string | number;
        font: string;
    }
};