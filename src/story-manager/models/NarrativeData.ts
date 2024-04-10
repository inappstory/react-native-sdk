import AbstractModel from "~/src/stories_widget/models/AbstractModel";
import {IData} from "~/src/types";

export class NarrativeData extends AbstractModel {

    public static sentData(narrativeId: number, data: IData) {
        return this.update('story-data/' + narrativeId, data, 'put');
    }

}




