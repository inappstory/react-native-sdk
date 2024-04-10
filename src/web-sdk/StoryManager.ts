import {StoryManager as AbstractStoryManager} from "../story-manager";
import {IWidgetStoriesList} from "../widget-stories-list";
import {WidgetStoriesList} from "../widget-stories-list/web";
import {Dict} from "../../global.h";
import {AppearanceManager} from "../story-manager/AppearanceManager";

export class StoryManager extends AbstractStoryManager {


    createWidgetStoriesList(appearanceManager: AppearanceManager): IWidgetStoriesList {
        return new WidgetStoriesList(appearanceManager);
    }
}
