import AbstractModel from "./AbstractModel";

export default class Image extends AbstractModel {

    public width!: number;
    public height!: number;
    public type!: string;

    public _url: string = '';

    public attributes(): Array<string> {
        return ['width', 'height', 'type', 'url'];
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
}