export type StoryManager = {}
export type AppearanceManager = {}

// destructor

export type StoriesListProps = {
  storyManager: StoryManager,
  appearanceManager: AppearanceManager
};

export type StoriesList = React.FC<StoriesListProps>;