import {Optional, Dict} from "../index";
import {ReaderCloseButtonPosition, ReaderSwipeStyle} from "~/src/storyManager/WidgetStoriesConfig";



export enum StoryReaderCloseButtonPosition {
  LEFT = 'left',
  RIGHT = 'right'
}

export enum StoryReaderSwipeStyle {
  FLAT = 'flat',
  COVER = 'cover',
  CUBE = 'cube'
}


export type StoryReaderOptions = {
  closeButtonPosition: StoryReaderCloseButtonPosition,
  scrollStyle: StoryReaderSwipeStyle,
  loader?: {
    default: {
      color: Optional<string>,
      accentColor: Optional<string>,
    },
    custom: Optional<string>
  },
  recycleStoriesList?: boolean,
  closeOnLastSlideByTimer?: boolean,
};

const StoryReaderOptionsDefault: StoryReaderOptions = {
  closeButtonPosition: StoryReaderCloseButtonPosition.RIGHT,
  scrollStyle: StoryReaderSwipeStyle.FLAT,
  loader: {
    default: {
      color: null,
      accentColor: null,
    },
    custom: null
  },
  recycleStoriesList: false,
  closeOnLastSlideByTimer: true
};

export {StoryReaderOptionsDefault};