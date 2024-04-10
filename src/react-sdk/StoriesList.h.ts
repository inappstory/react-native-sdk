import {StoryManager} from "./StoryManager";
import {AppearanceManager} from "../story-manager/AppearanceManager";
import {Option} from "../../global.h";


export type StoriesListProps = {
    storyManager: Option<StoryManager>,
    appearanceManager: Option<AppearanceManager>
};


