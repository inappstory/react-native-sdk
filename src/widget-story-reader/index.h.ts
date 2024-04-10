import {Option, Dict} from "../../global.h";

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
      color: Option<string>,
      accentColor: Option<string>,
    },
    custom: Option<string>
  },
  recycleStoriesList?: boolean,
  closeOnLastSlideByTimer?: boolean,
    faviconApiUrl: string,
    slideBorderRadius?: number
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
  closeOnLastSlideByTimer: true,
    faviconApiUrl: "",
    slideBorderRadius: 0
};

export {StoryReaderOptionsDefault};
