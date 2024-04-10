import BackgroundModel from "./BackgroundModel";
import AbstractModel, {IDataProvider} from "./AbstractModel";
import ImageSet from "./ImageSet";
import Image from "./Image";
import {Store} from "vuex";
import RootState from "../../stories_widget/store/rootState";
import {Session} from "../../stories_widget/models/Session";
import {replaceAll} from "../../stories_widget/util/string";
import {Dict, Option} from "../../../global.h";
import {StoryManager} from "../index";
import {isArray} from "../../helpers/isArray";
import {isEmpty} from "../../helpers/isEmpty";
import {uniq} from "../../helpers/uniq";

let storeLink!: Store<RootState>;

export default class StoriesItem extends AbstractModel {
    private _title: string = '';
    public title_color: string = '';
    public magazine_name: string = '';
    public is_opened: boolean = false;
    public background!: BackgroundModel;
    public background_color!: string;
    public id!: number;
    private _slides_html: Array<string> = [];
    public slides_duration: Array<string> = [];
    public source: string = '';
    public favorite: boolean = false;
    public like: number = 0;
    public slides_count: number | null = null;
    public deeplink: string|null = null;
    public hide_in_reader: boolean|null = null;
    public blank: boolean = false;
    public disable_close: boolean = false;
    public sharePath!: Option<string>;
    public like_functional!: Option<boolean>;
    public favorite_functional!: Option<boolean>;
    public share_functional!: Option<boolean>;
    public need_placeholders: Option<boolean> = null;

    public tags!: Array<string>;
    public has_audio!: Option<boolean>;
    public has_placeholder!: Option<boolean>;
    public has_swipe_up!: Option<boolean>;

    public static placeholders: Dict = {};
    public _placeholders: Dict = {};

    public favorite_cell: boolean = false;



    // устанавливаем сами состояние модели
    public slidesLoaded: boolean = false;

    private _image!: ImageSet | null;
    private _imageSrc: string | false | null = null;

    private _parsedIssueArticleIds: Array<number> | null = null;
    private _parsedArticleIds: Array<number> | null = null;
    private _parsedSlideImage: Array<string> | null = null;

    public _video_cover: Option<ImageSet> = null;
    private _videoCoverSrc: string | false | null = null;

    public static fetch(id: number | string, placeholders: Dict): Promise<StoriesItem> {
        this.placeholders = placeholders;
        return this._fetch(StoriesItem, `story/${id}`, {expand: 'slides_html,slides_duration'});
    }

    public static fetchList(placeholders: Dict, tags: Option<string>, favorite?: boolean): Promise<IDataProvider<StoriesItem>> {
        this.placeholders = placeholders;
        const params: {tags: Option<string>, favorite?: number} = {tags};
        if (favorite !== undefined) {
            params.favorite = Number(favorite);
        }
        return this._fetchList(StoriesItem, 'story', params);
    }

    public static fetchWithSlides(ids: Array<number>, placeholders: Dict): Promise<Array<StoriesItem>> {
        this.placeholders = placeholders;
        return Promise.all(ids.map(id => this.fetch(id, placeholders)));
    }


    public static fetchOnboardingList(placeholders: Dict, tags: Option<string>): Promise<IDataProvider<StoriesItem>> {
        this.placeholders = placeholders;
        return this._fetchList(StoriesItem, 'story-onboarding', {tags});
    }

    public static fetchOnboardingListWithSlides(ids: Array<number>, placeholders: Dict): Promise<Array<StoriesItem>> {
        this.placeholders = placeholders;
        return Promise.all(ids.map(id => this.fetch(id, placeholders)));
    }




    public attributes(): Array<string> {
        return super.attributes().concat([
            'title',
            'title_color',
            'source',
            'magazine_name',
            'background',
            'background_color',
            'id',
            'image',
            'display_to',
            'display_from',
            'slides_html',
            'slides_duration',
            'favorite',
            'like',
            'slides_count',
            'deeplink',
            'hide_in_reader',
            'disable_close',
            'like_functional',
            'favorite_functional',
            'share_functional',
            'is_opened',
            'tags',
            'has_audio',
            'has_placeholder',
            'video_cover',
            'need_placeholders',
            'has_swipe_up',
            'sharePath'
        ]);
    }

    public set image(value: any) {
        this._image = ImageSet.createFromArray(value);
    }

    public get image(): any | ImageSet {
        return this._image;
    }

    public get imageSrc(): Option<string> {
        if (this._imageSrc === false) {
            return null;
        } else if (this._imageSrc === null) {
            const imageSet: ImageSet | null = this.image;
            if (imageSet === null || imageSet === undefined) {
                this._imageSrc = false;
                return null;
            }

            const image: Image | null = imageSet.findOneByType('h');
            if (image !== null) {
                return image.url;
            }
        }

        if (typeof this._imageSrc === "string") {
            return this._imageSrc;
        }
        return null;
    }

    public get issueArticleIds(): Array<number> {
        this.parseHtmlSlidesForLinks();
        if (this._parsedIssueArticleIds !== null) {
            return this._parsedIssueArticleIds;
        } else {
            return [];
        }
    }

    public get articleIds(): Array<number> {
        this.parseHtmlSlidesForLinks();
        if (this._parsedArticleIds !== null) {
            return this._parsedArticleIds;
        } else {
            return [];
        }
    }

    public imagePerSlide(index: number): Option<string> {
        this.parseHtmlSlidesForMainImage();
        if (this._parsedSlideImage !== null && this._parsedSlideImage[index] !== undefined) {
            return this._parsedSlideImage[index];
        }
        return null;
    }


    // todo перенести бы на сервер
    private parseHtmlSlidesForLinks(): void {
        if (this._parsedArticleIds === null && this._parsedIssueArticleIds === null) {
            this.slides_html.forEach((slide: string) => {

                // TODO через https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
                const results = slide.match(/<[^<]*narrative-element-link.*data-link-type="([a-z-]*)".*data-link-target="(\d+)"[^<]*>/i);
                // <[^<]*narrative-element-link.*((data-link-type="issue-article|article") (data-link-target="(\d+)"))[^<]*>

                if (results !== null) {
                    const type = results[1],
                        id = parseInt(results[2]);

                    if (type === "article") {
                        if (this._parsedArticleIds === null) {
                            this._parsedArticleIds = [];
                        }

                        if (this._parsedArticleIds.indexOf(id) === -1) {
                            this._parsedArticleIds.push(id)
                        }

                    } else if (type === "issue-article") {
                        if (this._parsedIssueArticleIds === null) {
                            this._parsedIssueArticleIds = [];
                        }

                        if (this._parsedIssueArticleIds.indexOf(id) === -1) {
                            this._parsedIssueArticleIds.push(id)
                        }
                    }

                }

            });
        }
    }

    private parseHtmlSlidesForMainImage(): void {
        if (this._parsedSlideImage === null) {
            this.slides_html.forEach((slide: string, index: number) => {

                // TODO через https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
                const results = slide.match(/<[^<]*narrative-element-image.*<img[^<]*src="([^"]*)"[^<]*>/i);

                if (results !== null) {
                    if (this._parsedSlideImage === null) {
                        this._parsedSlideImage = [];
                    }
                    this._parsedSlideImage[index] = results[1];
                }
            });
        }
    }

    // на самом деле приходит Dict и конвертится в ImageSet
    public set video_cover(value: Option<ImageSet>) {
        if (value !== null) {
            this._video_cover = ImageSet.createFromArray(value);
        }
    }

    public get video_cover(): Option<ImageSet> {
        return this._video_cover;
    }

    public get videoCoverSrc(): Option<string> {
        if (this._videoCoverSrc === false) {
            return null;
        } else if (this._videoCoverSrc === null) {
            const videoCoverSet: ImageSet | null = this.video_cover;
            if (videoCoverSet === null) {
                this._videoCoverSrc = false;
                return null;
            }

            const video: Option<Image> = videoCoverSet.findOneByType('h');
            if (video !== null) {
                return video.url;
            }
        }

        if (typeof this._videoCoverSrc === "string") {
            return this._videoCoverSrc;
        }
        return null;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (this.need_placeholders === true || this.rawData.need_placeholders === true) {
            for (let placeholdersKey in StoriesItem.placeholders) {
                if (StoriesItem.placeholders.hasOwnProperty(placeholdersKey)) {
                    value = replaceAll(value, `%${placeholdersKey}%`, StoriesItem.placeholders[placeholdersKey])
                }
            }
        }
        this.rawData['title'] = value;
        this._title = value;
    }

    get slides_html(): Array<string> {
        return this._slides_html;
    }

    set slides_html(value: Array<string>) {
        if (this.need_placeholders === true || this.rawData.need_placeholders === true) {
            for (let placeholdersKey in StoriesItem.placeholders) {
                if (StoriesItem.placeholders.hasOwnProperty(placeholdersKey)) {
                    for (let i = 0; i < value.length; i++) {
                        value[i] = replaceAll(value[i],`%${placeholdersKey}%`, StoriesItem.placeholders[placeholdersKey])
                    }
                }
            }
        }

        this._slides_html = value;
    }

    async getIsOpened(): Promise<boolean>
    {
        if (!isEmpty(Session.userKey)) {
            const key = `u/${Session.userKey}/s_opened`;
            let data = await StoryManager.getInstance().localStorageGetArray<number>(key);
            if (!isArray(data)) {
                data = [];
            }
            if (data.indexOf(this.id) !== -1) {
                return true;
            }
        }
        return this.is_opened;
    }

    async setIsOpened(value: boolean)
    {
        if (Session) {
            if (!isEmpty(Session.userKey)) {
                const key = `u/${Session.userKey}/s_opened`;
                let data = await StoryManager.getInstance().localStorageGetArray<number>(key);
                if (!isArray(data)) {
                    data = [];
                }
                if (value) {
                    data.push(this.id);
                } else {
                    data = data.filter(id => id !== this.id);
                }
                data = uniq(data);

                StoryManager.getInstance().localStorageSetArray(key, data);
            }
        }

        this.is_opened = value;
        this.rawData['is_opened'] = value;
    }

}

















