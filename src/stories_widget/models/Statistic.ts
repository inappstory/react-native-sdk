import AbstractModel, {IModelValues, IDataProvider} from "./AbstractModel";
import {Dict, Option} from "../../../global.h";

export class Statistic extends AbstractModel {

    public static emitStoriesOpen(data: Dict) {
        return AbstractModel.emitEvent({type: 'stories', event: 'open', eventData: data})
    }

    public static emitStoriesStatUpdate(data: Dict) {
        return AbstractModel.emitEvent({type: 'stories', event: 'update', eventData: data})
    }

    public static emitStoriesStatClose(data: Dict) {
        return AbstractModel.emitEvent({type: 'stories', event: 'close', eventData: data})
    }

}




