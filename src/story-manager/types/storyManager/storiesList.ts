import {Optional, Dict} from "../index";

export enum StoriesListSliderAlign {
    CENTER = "center",
    LEFT = "left",
    RIGHT = "right"
}

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

export enum StoriesListCardTitleTextAlign {
    LEFT = "left",
    CENTER = "center",
    RIGHT = "right"
}

export enum StoriesListCardTitlePosition {
    CARD_INSIDE_BOTTOM = "cardInsideBottom",
    CARD_OUTSIDE_TOP = "cardOutsideTop",
    CARD_OUTSIDE_BOTTOM = "cardOutsideBottom"
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
  boxShadow: Optional<string>;
  opacity: Optional<number>;
  mask: {
    color: Optional<string>;
  };
  opened: {
    border: {
      radius: Optional<number>;
      color: Optional<string>;
      width: Optional<number>;
      gap: Optional<number>;
    };
    boxShadow: Optional<string>;
    opacity: Optional<number>;
    mask: {
      color: Optional<string>;
    };
  };
}

export type StoriesListFavoriteCardOptions = StoriesListCardOptions & {
  title: {
    content: string;
    color: string;
    padding: string | number;
    font: string;
  }
};

export type StoriesListClickEvent = {
  id: number,
  index: number,
  isDeeplink: boolean,
  url: string|undefined,
};



export enum StoriesListEvents {
  START_LOADER = 'startLoader',
  END_LOADER = 'endLoader',
}



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
      opacity: null,
      mask: {
        color: null,
      },
      opened: {
        border: {
          radius: null,
          color: null,
          width: null,
          gap: null,
        },
        boxShadow: null,
        opacity: null,
        mask: {
          color: null,
        },
      },
    },
    favoriteCard: {
      title: {
        content: 'Избранное',
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
      opacity: null,
      mask: {
        color: null,
      },
      opened: {
        border: {
          radius: null,
          color: null,
          width: null,
          gap: null,
        },
        boxShadow: null,
        opacity: null,
        mask: {
          color: null,
        },
      },
    },
    sidePadding: 20,
    topPadding: 20,
    bottomPadding: 20,
    bottomMargin: 17,
    layout: {
        storiesListInnerHeight: null,
      height: 0,
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
