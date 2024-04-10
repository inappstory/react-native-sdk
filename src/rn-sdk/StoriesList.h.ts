import {StoryManager} from "./StoryManager";
import {AppearanceManager} from "../story-manager/AppearanceManager";
import {ListLoadStatus} from "../widget-stories-list/index.h";
import {IWidgetStoriesList} from "../widget-stories-list";


export type StoriesListProps = {
    storyManager: StoryManager,
    appearanceManager: AppearanceManager,
    feed?: string,
    onLoadStart?: () => void,
    onLoadEnd?: (listLoadStatus: ListLoadStatus) => void,
    testKey?: string,
    viewModelExporter?: (viewModel: IWidgetStoriesList) => void,
};


