import {Optional, Dict} from "../index";


export type StoryFavoriteReaderOptions = {
  title?: {
    content: string;
  }
};

const StoryFavoriteReaderOptionsDefault: StoryFavoriteReaderOptions = {
  title: {
    content: 'Сохраненные истории',
  }
};

export {StoryFavoriteReaderOptionsDefault};