import {Option, Dict} from "../../global.h";


export type StoryFavoriteReaderOptions = {
  title?: {
    content: string;
    font: string;
    color: string;
  }
};

const StoryFavoriteReaderOptionsDefault: StoryFavoriteReaderOptions = {
    title: {
        content: 'Favorite',
        font: '1.4rem/1.2 InternalPrimaryFont',
        color: "white"
    }
};

export {StoryFavoriteReaderOptionsDefault};