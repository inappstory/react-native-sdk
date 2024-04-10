import AbstractModel from "./AbstractModel";


export default class NarrativeContext extends AbstractModel {
    public style: string = '';
    public script: string = '';

    public static fetch(ids: Array<number>): Promise<NarrativeContext> {
        return this._fetch(NarrativeContext, 'story-context', {id: ids.join(',')});
    }

    public attributes(): Array<string> {
        return super.attributes().concat([
            'style',
            'script'
        ]);
    }

}

















