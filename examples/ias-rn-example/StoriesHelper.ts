import {StoryManager, AppearanceManager} from "ias-rn";


export const storyManagerConfig = {
  // apiKey: "test-key",
  apiKey: "JCPo0hB5l2efXrfWi9anB5Zmqa5rienq", // gmail
  // apiKey: "wKQWqaxRE53uczlrLGO_a4UiFDiZhFWO", // kiozk
  userId: "cs_kdijhud4454dd5a1",
  // userId: "2760",
  tags: [],
  placeholders: {
    user: "Guest"
  },
  lang: "ru"
};

export const createStoryManager = () => new StoryManager(storyManagerConfig);

export const createAppearanceManager = () => {
  return new AppearanceManager()
    .setCommonOptions({
      hasLike: true,
      hasFavorite: true
    })
    .setStoriesListOptions({
      title: {
        content: 'The best stories',
        color: '#000',
        font: 'normal',
        marginBottom: 20,
      },
      card: {
        title: {
          color: 'black',
          font: '14px/16px "Segoe UI Semibold"',
          padding: 8
        },
        gap: 10,
        height: 100,
        variant: 'quad',
        border: {
          radius: 20,
          color: 'blue',
          width: 2,
          gap: 3,
        },
        boxShadow: null,
        opacity: 1,
        mask: {
          color: 'rgba(34, 34, 34, 0.3)'
        },
        opened: {
          border: {
            radius: null,
            color: 'red',
            width: null,
            gap: null,
          },
          boxShadow: null,
          opacity: null,
          mask: {
            color: 'rgba(34, 34, 34, 0.1)'
          },
        },
      },
      favoriteCard: {},
      layout: {
        height: 0,
        backgroundColor: 'transparent'
      },
      sidePadding: 20,
      topPadding: 20,
      bottomPadding: 20,
      bottomMargin: 17,
      navigation: {
        showControls: false,
        controlsSize: 48,
        controlsBackgroundColor: 'white',
        controlsColor: 'black'
      },
    })
    .setStoryReaderOptions({
      closeButtonPosition: 'right',
      scrollStyle: 'flat',
    }).setStoryFavoriteReaderOptions({
      title: {
        content: 'Избранное'
      }
    })
}