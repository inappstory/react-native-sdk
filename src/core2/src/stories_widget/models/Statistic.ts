import AbstractModel, {IModelValues} from "~/src/stories_widget/models/AbstractModel";
import {IDataProvider} from "./AbstractModel";
import {IData} from "~/src/types";

export class Statistic extends AbstractModel {

    public static emitStoriesOpen(data: IData) {
        return AbstractModel.emitEvent({type: 'stories', event: 'open', eventData: data})
    }

    public static emitStoriesStatUpdate(data: IData) {
        return AbstractModel.emitEvent({type: 'stories', event: 'update', eventData: data})
    }

    public static emitStoriesStatClose(data: IData) {
        return AbstractModel.emitEvent({type: 'stories', event: 'close', eventData: data})
    }

}




