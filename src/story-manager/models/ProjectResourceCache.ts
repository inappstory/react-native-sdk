import AbstractModel from "./AbstractModel";
import {styleToString} from "../../stories_widget/util/css";
import {Option} from "../../../global.h";

enum ProjectResourceCacheType {
    FONT = 'font-face'
}

type FontResource = {
    type: 'font-face',
    weight: string,
    style: string,
    title: string,
    family: string
}

type Resource = FontResource; // | ImageResource ...etc

export default class ProjectResourceCache extends AbstractModel {

    public weight!: Option<string>;
    public style!: Option<string>;
    public title!: Option<string>;
    public family!: Option<string>;
    public type!: string; // opentype
    public format!: string; // ProjectResourceCacheType.FONT

    public _url: string = '';

    public attributes(): Array<string> {
        return super.attributes().concat(['weight', 'style', 'type', 'url', 'title', 'family', 'format']);
    }

    constructor() {
        super();
    }

    set url(value: string) {
        this._url = value;
    }

    get url(): string {
        let isSecure = window.isSecureContext;
        if (isSecure === undefined) {
            if (window.location.protocol === 'https:') {
                isSecure = true;
            }
        }
        if (!isSecure) {
            return this._url.replace(/^https:\/\//, 'http://');
        }

        return this._url;
    }

    get isFont(): boolean {
        return this.type === ProjectResourceCacheType.FONT;
    }

    get fontFaceAsCss(): Option<string>
    {
        if (!this.isFont) {
            return null;
        }

        let styles = {
            'font-family': this.family ?? 'normal',
            'src': `url('${this.url}')`,
            'font-style': this.style ?? 'normal',
            'font-weight': this.weight ?? 'normal',
        };

        if (this.title) {
            styles.src += `, local('${this.title}')`;
        }

        return `@font-face {${styleToString(styles)}}\n`;
    }


}