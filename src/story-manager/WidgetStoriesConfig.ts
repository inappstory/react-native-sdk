export enum ReaderCloseButtonPosition {
  LEFT = 'left',
  RIGHT = 'right'
}

export enum ReaderSwipeStyle {
  FLAT = 'flat',
  COVER = 'cover',
  CUBE = 'cube'
}


export type WidgetStoriesConfig = {

  apiKey: string;

  hasLike: boolean;
  hasFavorite: boolean;

  slider: SliderOptions;
  reader: ReaderOptions;
  placeholders: Dict<string>;

  userId: Nullable<string | number>;
  tags: Nullable<string>;

  favorite: FavoriteOptions;

  lang: Nullable<string>;

  storyLinkHandleClick: Optional<(payload: any) => void>;

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
  }
};

// enum ?
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


const WidgetStoriesConfigDefaultState: WidgetStoriesConfig = {

  apiKey: '',
  hasLike: false,
  hasFavorite: false,

  userId: null,
  tags: null,
  lang: null,
  storyLinkHandleClick: null,

  reader: {
    closeButtonPosition: ReaderCloseButtonPosition.RIGHT,
    scrollStyle: ReaderSwipeStyle.FLAT,
    loader: {
      default: {
        color: null,
        accentColor: null,
      },
      custom: null
    }
  },

  slider: {
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
      },
      gap: 10,
      height: 70,
      variant: SliderCardViewVariant.CIRCLE,
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
      read: {
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
      },
      gap: 10,
      height: 70,
      variant: SliderCardViewVariant.CIRCLE,
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
      read: {
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
      height: 0,
      backgroundColor: 'transparent'
    },
    navigation: {
      showControls: false,
      controlsSize: 48,
      controlsBackgroundColor: 'white',
      controlsColor: 'black'
    },
  },
  placeholders: {},
  favorite: {
    title: {
      content: 'Сохраненные истории',
    }
  }
};

export {WidgetStoriesConfigDefaultState};
