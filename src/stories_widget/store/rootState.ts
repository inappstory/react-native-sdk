import StoriesItem from "~/src/stories_widget/models/StoriesItem";

export default interface RootState {

    showStoriesView: false,
    storyId: null,

    activeStoryIndex: 0,
    shared: {
        stories: Map<number, StoriesItem>
    }
}