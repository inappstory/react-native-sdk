import AbstractModel, {IDataProvider} from "./AbstractModel";
import ImageSet from "./ImageSet";
import Image from "./Image";
import BackgroundModel from "./BackgroundModel";

export module ArticleOptions {
    export const TYPE = 'article';
}

export default class Article extends AbstractModel {

    public id!: number;
    public title: string = '';
    public description: string = '';
    public magazine_id: string = '';
    public magazine_name: string = '';
    public read_time: number = 0;
    public timestamp: number = 0;
    public type: string = '';
    public content: string = '';
    public slug_or_id: string = '';

    private _image!: ImageSet | null;
    private _imageSrc: string | false | null = null;

    public attributes(): Array<string> {
        return super.attributes().concat(['id', 'title', 'description', 'content', 'image', 'magazine_id', 'magazine_name', 'read_time', 'timestamp', 'type', 'slug_or_id']);
    }

    constructor() {
        super();
    }


    public set image(value: any) {
        this._image = ImageSet.createFromArray(value);
    }

    public get image(): any | ImageSet {
        return this._image;
    }

    public get imageSrc(): string {
        if (this._imageSrc === false) {
            return '';
        } else if (this._imageSrc === null) {
            const imageSet: ImageSet | null = this.image;
            if (imageSet === null) {
                this._imageSrc = false;
                return '';
            }

            const image: Image | null = imageSet.findOneByType('h');
            if (image !== null) {
                return image.url;
            }
        }

        if (typeof this._imageSrc === "string") {
            return this._imageSrc;
        }
        return '';
    }


    public static fetch(id: number|string): Promise<Article> {
        return this._fetch(Article, `article/${id}`, {fields: 'id,magazine_name,title,type', expand: 'content,slug_or_id'});
    }


    public static fetchAll(ids: Array<number>): Promise<Array<Article>> {
        return Promise.all(ids.map(id => this.fetch(id)));
    }
}