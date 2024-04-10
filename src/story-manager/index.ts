import { Dict, Option } from "../../global.h";
import { EventEmitter } from "events";
import {
    AndroidWindowSoftInputMode,
    CTAGameReaderPayload,
    CTASource,
    CTAStoryListPayload,
    CTAStoryReaderPayload,
    DeviceInformation,
    StoryManagerConfig,
} from "./index.h";
import {
    ClickOnButtonPayload,
    ClickOnFavoriteCellInternalPayload,
    ClickOnStoryInternalPayload,
    ClickOnSwipeUpPayload,
    StoriesEvents,
    STORY_LIST_TYPE,
    STORY_READER_WINDOW_REFERER,
    StoryActionSource,
} from "./common.h";
import {
    $storyManagerConfig,
    configDeviceIdChanged,
    DeviceId,
    storyManagerConfigApiKeyChanged,
    storyManagerConfigChanged,
    storyManagerConfigIsSandboxChanged,
    storyManagerConfigLangChanged,
    storyManagerConfigPlaceholdersChanged,
    storyManagerConfigTagsChanged,
    storyManagerConfigUserIdChanged,
} from "./models/storyManagerConfig";
import { sdkPlaceholdersChanged } from "./models/placeholder";

import { IWidgetStoriesList } from "../widget-stories-list";

// import _StoryReader from "./widget/_StoryReader";

// import {GoodsWidget} from "~/src/storyManager/goodsWidget/GoodsWidget";
//
// import _StoryFavorite from "~/src/storyManager/widget/_StoryFavorite";

class _StoryReader {}
class GoodsWidget {}
class _StoryFavorite {}

// import {StoriesListClickEvent, StoriesListEvents} from "./storiesList.h";

import {
    fetchSessionAndStoriesCompositeFx,
    fetchSessionAndStoryDataCompositeFx,
    fetchStoriesContextAndStorySlidesCompositeFx,
    fetchStoriesSlidesCompositeFx,
    storiesListIdsChanged,
    waitForSessionLoad,
} from "./models/init";
import { ObjectId } from "../widget";
import { createEffect, sample, Subscription } from "effector";
import {
    $stories,
    $storiesFavorite,
    $storiesFeeds,
    $storiesIdsWithoutLoadedSlides,
    $storiesOnboardingFeeds,
    StoriesIdsUserEntities,
    storyItemFavoriteChanged,
    storyItemIsOpenedChanged,
    storyItemLikeChanged,
    StoryModel,
} from "./models/story";
import API, { ApiRequestConfig, ApiRequestConfigMethod, APISendBeacon } from "./api";
import { Utility } from "../helpers/utility";
import { $session, CacheResourceModel, sessionFlushed, sessionThumbViewsChanged } from "./models/session";
import { $storyContext, fetchStoryContextFx } from "./models/storyContext";
import { AppearanceManager } from "./AppearanceManager";
import { SharePageEvents, SharePageOptions } from "./sharePage.h";
import { StoryReaderOptions } from "../widget-story-reader/index.h";
import { ISessionInitData } from "./models/Session2";
import { IWidgetStoryReader } from "../widget-story-reader";
import { isArray } from "../helpers/isArray";
import { isFunction } from "../helpers/isFunction";
import { isString } from "../helpers/isString";
import { isEmpty } from "../helpers/isEmpty";
import { isObject } from "../helpers/isObject";
import { isNumber } from "../helpers/isNumber";
import { uniq } from "../helpers/uniq";
import { ClickOnStoryPayload } from "./types";
import { IWidgetStoryFavoriteReader } from "../widget-story-favorite-reader";
import { ListLoadStatus, StoriesListClickEvent, StoriesListEvents } from "../widget-stories-list/index.h";
import { fetchDeviceInfo } from "./api/getDeviceInfo";
import { defineDomains } from "./api/domains";
import { StoryManagerSdkConfigChecker } from "./StoryManagerSdkConfigChecker";
import APIInstance from "./api";

class StoriesList extends EventEmitter {
    public feedSlug: string = "default";
    public _listLoadStatus: {
        feed: string | number;
        defaultListLength: number;
        favoriteListLength: number;
        success: boolean;
        error: Option<{
            name: string;
            networkStatus: number;
            networkMessage: string;
        }>;
    } = {
        feed: "default",
        defaultListLength: 0,
        favoriteListLength: 0,
        success: true,
        error: {
            name: "",
            networkStatus: 200,
            networkMessage: "",
        },
    };
}

class SharePage extends EventEmitter {}

const getStoryListByType = (listType: STORY_LIST_TYPE, feedSlug?: Option<string>): Array<StoryModel> => {
    switch (listType) {
        case STORY_LIST_TYPE.default:
            return feedSlug ? $storiesFeeds.getState()[feedSlug] : [];
        case STORY_LIST_TYPE.favorite:
            return $storiesFavorite.getState();
        case STORY_LIST_TYPE.onboarding:
            return feedSlug ? $storiesOnboardingFeeds.getState()[feedSlug] : [];
    }
    return [];
};

const getFontResources = () => $session.getState().cache.filter((item) => item.type === "font-face");

const _showStory = async (
    id: number | string,
    storyReaderInstance: IWidgetStoryReader,
    platform: "android" | "ios" | "unknown",
    soundOn: boolean
) => {
    // try catch if 200 - загружено а не 404

    // ctx по идее можно через поля style script сторис забирать
    // const resp = await fetchSessionAndStoryDataCompositeFx({id});
    // console.log("fetchStoryContextFx", id, {ctx: Object.keys($storyContext.getState())})

    // wait for slidesLoaded: true and concurrent memory set

    const storyGetter = (state: StoryModel[], id: string | number) =>
        state.find((item) => item.id === id || item.string_id === id);
    const slidesLoadedChecker = (story: StoryModel) => story.slidesLoaded;

    const slidesLoadedWaiter = async (id: string | number): Promise<StoryModel | undefined> => {
        return new Promise((resolve) => {
            let watcher: Subscription;
            const resolver = (state: StoryModel[]) => {
                const story = storyGetter(state, id);
                if (story == null) {
                    resolve(undefined);
                    watcher?.unsubscribe();
                    return true;
                } else if (slidesLoadedChecker(story)) {
                    resolve(story);
                    watcher?.unsubscribe();
                    return true;
                }
                return false;
            };
            if (!resolver($stories.getState())) {
                watcher = $stories.watch((state) => resolver(state));
            }
        });
    };

    // debug - console.log (if active)
    const story = await slidesLoadedWaiter(id);
    if (story != null) {
        await waitForSessionLoad();
        storyReaderInstance.setFonts(getFontResources());

        const openReaderData = {
            windowReferer: STORY_READER_WINDOW_REFERER.default,
            listType: STORY_LIST_TYPE.default,
            id: story.id,
            storyContext: $storyContext.getState(),
            storyList: [story],
            hasShare: $session.getState().share,
            platform,
            soundOn,
        };

        // TODO закрыть если что то открыто
        // storyReaderInstance.closeReader(); // не успевает открыться следующий тогда
        storyReaderInstance.openReader(openReaderData, {
            listType: STORY_LIST_TYPE.direct,
            feed: null,
        });

        return true;
    }

    return false;
};

function byteLength(str: string) {
    // returns the byte length of an utf8 string
    let s = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
        const code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s += 2;
        if (code >= 0xdc00 && code <= 0xdfff) i--;
    }
    return s;
}

export abstract class StoryManager extends EventEmitter {
    private static instance?: StoryManager;

    private _soundOn!: boolean;

    public get soundOn(): boolean {
        return this._soundOn;
    }

    public set soundOn(value: boolean) {
        this._soundOn = value;

        if (this.storyReaderInstance != null) {
            this.storyReaderInstance.setSoundOn(this._soundOn);
        }
    }

    //Assign "new StoryManager()" here to avoid lazy initialisation

    protected constructor(config: StoryManagerConfig, callbacks?: Dict<Function>) {
        super();

        if (!StoryManager.instance) {
            if (!isEmpty(config.userId)) {
                config.userId = String(config.userId);
            }

            StoryManagerSdkConfigChecker.getInstance().checkUserIdLength(config.userId);
            StoryManagerSdkConfigChecker.getInstance().checkTagsLength(config.tags);

            if (config.defaultMuted == null || typeof config.defaultMuted !== "boolean") {
                // default value
                config.defaultMuted = true;
            }

            this._soundOn = !config.defaultMuted;

            storyManagerConfigChanged(config);

            // и вынести в дополнение в отдельный метод для StoryManager
            if (config.placeholders) {
                sdkPlaceholdersChanged(config.placeholders);
            }

            if (callbacks && isObject(callbacks)) {
                this._callbacks = callbacks;
            }

            API.deviceInfoPromise = new Promise((resolve, reject) =>
                fetchDeviceInfo(this.getDeviceInformation, API, resolve, reject)
            );

            API.userId = config.userId;

            defineDomains(config.apiKey);

            StoryManager.instance = this;
        }

        return StoryManager.instance;
    }

    public destructor() {
        // TODO
        // close reader and others

        delete StoryManager.instance;
    }

    protected _callbacks: Dict<any> = {};

    public set storyLinkClickHandler(callback: Function) {
        if (isFunction(callback)) {
            this._callbacks.storyLinkClickHandler = callback;
        }
    }

    protected defaultLinking(url?: string) {
        if (url) {
            window.open(url, "_self");
        }
    }

    private clickOnButtonAction = ({
        src,
        payload,
    }: {
        src: CTASource;
        payload: CTAStoryListPayload | CTAStoryReaderPayload | CTAGameReaderPayload;
    }) => {
        if (isFunction(this._callbacks.storyLinkClickHandler) || this.listenerCount(StoriesEvents.CLICK_ON_STORY) > 0) {
            const cbPayload = { src, srcRef: "default", data: payload };
            try {
                if (isFunction(this._callbacks.storyLinkClickHandler)) {
                    this._callbacks.storyLinkClickHandler(cbPayload);
                }
                this.emit(StoriesEvents.CLICK_ON_STORY, cbPayload);
            } catch (e) {
                console.error(e);
            }
        } else {
            this.defaultLinking(payload.url);
        }
    };

    // SkuList => SkuFilledList
    public set openGoodsWidgetHandler(callback: (skuList: Array<Dict>) => Promise<Array<Dict>>) {
        if (isFunction(callback)) {
            this._callbacks.openGoodsWidgetHandler = callback;
        }
    }

    public get openGoodsWidgetHandler() {
        return this._callbacks.openGoodsWidgetHandler;
    }

    static getInstance(): StoryManager {
        if (!StoryManager.instance) {
            throw new Error("Error - use new IAS.StoryManager(). For first init - with config");
            // или разрешить в getInstance передавтаь конфиг для первого вызова
        }
        // StoryManager.instance = StoryManager.instance || new StoryManager();
        return StoryManager.instance;
    }

    public abstract createWidgetStoriesList(
        appearanceManager: AppearanceManager,
        feedSlug?: string,
        testKey?: string
    ): { widget: IWidgetStoriesList; widgetLoadedPromise: Promise<void> };

    public abstract loadStoriesListData(
        storyListWidget: IWidgetStoriesList,
        appearanceManager: AppearanceManager
    ): Promise<ListLoadStatus>;

    public abstract createWidgetStoryReader(
        setNeedFirstRender: (value: boolean) => void,
        setNeedLoaderRender: (value: boolean) => void,
        detachComponent: (widget: IWidgetStoryReader) => void
    ): IWidgetStoryReader;

    public abstract createWidgetStoryFavoriteReader(
        setNeedFirstRender: (value: boolean) => void,
        setNeedLoaderRender: (value: boolean) => void,
        detachComponent: (widget: IWidgetStoryFavoriteReader) => void
    ): IWidgetStoryFavoriteReader;

    public abstract getDeviceInfo(configDeviceIdChanged: (device_id: DeviceId) => void): Promise<ISessionInitData>;

    public abstract getDevicePlatform(): "android" | "ios" | "unknown";

    public abstract getDeviceInformation(): Promise<DeviceInformation>;

    public abstract localStorageGet<T extends object>(key: string): Promise<Option<T>>;
    // data - object like model or simple value, not JSON encoded string
    public abstract localStorageSet(key: string, data: object): Promise<void>;

    public abstract localStorageGetArray<T extends any>(key: string): Promise<Option<Array<T>>>;
    // data - object like model or simple value, not JSON encoded string
    public abstract localStorageSetArray(key: string, data: Array<any>): Promise<void>;

    /**
     * StoriesList
     *
     * интерфейс для DOM-sdk
     */
    public StoriesList = class extends EventEmitter {
        private storyListWidget!: IWidgetStoriesList;
        private appearanceManager!: AppearanceManager;

        public _listLoadStatus = {
            feed: "default",
            defaultListLength: 0,
            favoriteListLength: 0,
            success: true,
            error: {
                name: "",
                networkStatus: 200,
                networkMessage: "",
            },
        };

        constructor(mountSelector: string, appearanceManager: AppearanceManager, private feedSlug: string = "default") {
            super();

            // Factory

            // StoryManager.instance,some = this.factoryMethod

            // StoryManager.instance._storiesList(mountSelector, appearanceManager, this).then(({
            //                                                                                    storyListWidget,
            //                                                                                    appearanceManager
            //                                                                                  }) => {
            //   this.storyListWidget = storyListWidget;
            //   this.appearanceManager = appearanceManager;
            // });
            // return this;
        }

        public async reload(options: { needLoader: boolean } = { needLoader: true }) {
            let needLoader = true;
            if (options?.needLoader === false) {
                needLoader = false;
            }
            try {
                //@ts-ignore
                return await StoryManager.instance._loadStoriesList(
                    this.storyListWidget,
                    this.appearanceManager,
                    this,
                    false,
                    needLoader
                );
            } catch (e) {
                throw Error(e as string);
            }
        }
    };

    public setTags(tags: Array<string>): void {
        if (isArray(tags)) {
            StoryManagerSdkConfigChecker.getInstance().checkTagsLength(tags);
            storyManagerConfigTagsChanged({ tags });
        } else {
            // throw Error;
        }
    }

    public getTags(): Array<string> {
        return $storyManagerConfig.getState().tags ?? [];
    }

    public setUserId(_userId: string | number | null): void {
        let userId: string | number | null = null;
        if (!isEmpty(_userId) && (isString(_userId) || isNumber(_userId))) {
            userId = String(_userId);
            StoryManagerSdkConfigChecker.getInstance().checkUserIdLength(userId);
        }
        sessionFlushed();
        API.userId = userId;
        storyManagerConfigUserIdChanged({ userId });
    }

    public getUserId(): Option<string | number> {
        return $storyManagerConfig.getState().userId;
    }

    public setLang(lang: string): void {
        if (isString(lang)) {
            storyManagerConfigLangChanged({ lang });
        }
    }

    public getLang(): Option<string> {
        return $storyManagerConfig.getState().lang;
    }

    public setPlaceholders(placeholders: Dict<string>): void {
        if (isObject(placeholders)) {
            storyManagerConfigPlaceholdersChanged({ placeholders });
        }
    }

    public getPlaceholders(): Dict<string> {
        return $storyManagerConfig.getState().placeholders;
    }

    public setIsSandbox(isSandbox: boolean) {
        storyManagerConfigIsSandboxChanged({ isSandbox });
    }

    public setApiKey(apiKey: string) {
        storyManagerConfigApiKeyChanged({ apiKey });
        sessionFlushed();
    }

    // story Builder ?
    // update config (set new user or tags)
    // основная установка через init + возможность update каждого параметра

    // tags - для каждого списка - свои теги
    // идея с разными списками сторис

    //

    private _appearanceManager: Option<AppearanceManager> = null;
    protected get appearanceManager() {
        return this._appearanceManager;
    }
    protected set appearanceManager(_: Option<AppearanceManager>) {
        this._appearanceManager = _;
    }

    private storyListInstance: Option<IWidgetStoriesList> = null;

    private _storyReaderInstance: Option<IWidgetStoryReader> = null;
    private storyReaderInstancePromise: Option<Promise<IWidgetStoryReader>> = null;
    private storyReaderInstancePromiseResolver: Option<(value: IWidgetStoryReader) => void> = null;

    private _goodsWidgetInstance: Option<GoodsWidget> = null;

    private _storyReaderNeedFirstRender: Option<(value: boolean) => void> = null;
    protected set storyReaderNeedFirstRender(cb: (value: boolean) => void) {
        this._storyReaderNeedFirstRender = cb;
    }

    private _storyReaderNeedLoaderRenderResolver: (cd: (value: boolean) => void) => void = null!;
    private _storyReaderNeedLoaderRender: Promise<(value: boolean) => void> = new Promise<(value: boolean) => void>(
        (resolve, reject) => {
            this._storyReaderNeedLoaderRenderResolver = resolve;
        }
    );
    protected set storyReaderNeedLoaderRender(cb: (value: boolean) => void) {
        this._storyReaderNeedLoaderRenderResolver(cb);
    }

    // (value: boolean) => void>

    private _storyReaderDetachComponent: Option<(widget: IWidgetStoryReader) => void> = null;
    protected set storyReaderDetachComponent(cb: (widget: IWidgetStoryReader) => void) {
        this._storyReaderDetachComponent = cb;
    }

    public get storyReaderInstance(): Option<IWidgetStoryReader> {
        return this._storyReaderInstance;
    }

    private async getStoryReaderInstance(): Promise<IWidgetStoryReader> {
        // если есть контейнер - инициализируем в нем

        // if (this.storyReaderInstancePromise === null) {
        //   this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, fontResources);
        // }

        return new Promise((resolve, reject) => {
            if (this._storyReaderInstance == null) {
                if (this.storyReaderInstancePromise == null) {
                    if (this._storyReaderNeedFirstRender != null) {
                        this._storyReaderNeedFirstRender(true);
                    }
                    // create promise
                    // wait for widgetLoaded
                    this.storyReaderInstancePromise = new Promise<IWidgetStoryReader>(
                        (resolve, reject) => (this.storyReaderInstancePromiseResolver = resolve)
                    );
                    // this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, getFontResources());
                }

                this.storyReaderInstancePromise.then((_) => {
                    this._storyReaderInstance = _;
                    resolve(_);
                });
            } else {
                resolve(this._storyReaderInstance);
            }
        });
    }

    private async showStoryReaderLoader(show: boolean) {
        (await this._storyReaderNeedLoaderRender)(show);
    }

    // вынести в отдельный класс это все
    protected _storyReaderWidgetLoaded = async (storyReaderWidget: IWidgetStoryReader) => {
        await waitForSessionLoad();
        this.completeInitStoryReader(storyReaderWidget, getFontResources());
        if (this.storyReaderInstancePromiseResolver != null) {
            this.storyReaderInstancePromiseResolver(storyReaderWidget);
        }
    };

    /** Favorite reader */

    private _storyFavoriteReaderInstance: Option<IWidgetStoryFavoriteReader> = null;
    private storyFavoriteReaderInstancePromise: Option<Promise<IWidgetStoryFavoriteReader>> = null;
    private storyFavoriteReaderInstancePromiseResolver: Option<(value: IWidgetStoryFavoriteReader) => void> = null;

    private _storyFavoriteReaderNeedFirstRender: Option<(value: boolean) => void> = null;
    protected set storyFavoriteReaderNeedFirstRender(cb: (value: boolean) => void) {
        this._storyFavoriteReaderNeedFirstRender = cb;
    }

    private _storyFavoriteReaderNeedLoaderRender: Option<(value: boolean) => void> = null;
    protected set storyFavoriteReaderNeedLoaderRender(cb: (value: boolean) => void) {
        this._storyFavoriteReaderNeedLoaderRender = cb;
    }

    private _storyFavoriteReaderDetachComponent: Option<(widget: IWidgetStoryFavoriteReader) => void> = null;
    protected set storyFavoriteReaderDetachComponent(cb: (widget: IWidgetStoryFavoriteReader) => void) {
        this._storyFavoriteReaderDetachComponent = cb;
    }

    public get storyFavoriteReaderInstance(): Option<IWidgetStoryFavoriteReader> {
        return this._storyFavoriteReaderInstance;
    }

    private async getStoryFavoriteReaderInstance(): Promise<IWidgetStoryFavoriteReader> {
        // если есть контейнер - инициализируем в нем

        // if (this.storyReaderInstancePromise === null) {
        //   this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, fontResources);
        // }

        return new Promise((resolve, reject) => {
            if (this._storyFavoriteReaderInstance == null) {
                if (this.storyFavoriteReaderInstancePromise == null) {
                    if (this._storyFavoriteReaderNeedFirstRender != null) {
                        this._storyFavoriteReaderNeedFirstRender(true);
                    }
                    // create promise
                    // wait for widgetLoaded
                    this.storyFavoriteReaderInstancePromise = new Promise<IWidgetStoryFavoriteReader>(
                        (resolve, reject) => (this.storyFavoriteReaderInstancePromiseResolver = resolve)
                    );
                    // this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, getFontResources());
                }

                this.storyFavoriteReaderInstancePromise.then((_) => {
                    this._storyFavoriteReaderInstance = _;
                    resolve(_);
                });
            } else {
                resolve(this._storyFavoriteReaderInstance);
            }
        });
    }

    private showStoryFavoriteReaderLoader(show: boolean) {
        if (this._storyFavoriteReaderNeedLoaderRender != null) {
            this._storyFavoriteReaderNeedLoaderRender(show);
        }
    }

    // вынести в отдельный класс это все
    protected _storyFavoriteReaderWidgetLoaded = async (storyFavoriteReaderWidget: IWidgetStoryFavoriteReader) => {
        await waitForSessionLoad();
        this.completeInitStoryFavoriteReader(storyFavoriteReaderWidget, getFontResources());
        if (this.storyFavoriteReaderInstancePromiseResolver != null) {
            this.storyFavoriteReaderInstancePromiseResolver(storyFavoriteReaderWidget);
        }
    };

    // private _storyFavoriteReaderInstance: Option<_StoryFavorite> = null;
    // private storyFavoriteReaderInstancePromise: Option<Promise<_StoryFavorite>> = null;
    //
    // private async getStoryFavoriteReaderInstance(): Promise<_StoryFavorite> {
    //   return new Promise((resolve, reject) => {
    //     if (this._storyFavoriteReaderInstance === null) {
    //       if (this.storyFavoriteReaderInstancePromise !== null) {
    //         this.storyFavoriteReaderInstancePromise.then(_ => {
    //           this._storyFavoriteReaderInstance = _;
    //           resolve(_);
    //         });
    //       } else {
    //         reject('_storyFavoriteReaderInstance not inited yet');
    //       }
    //     } else {
    //       resolve(this._storyFavoriteReaderInstance);
    //     }
    //   });
    // }

    private _loadedStoriesLength = {
        defaultListLength: 0,
        favoriteListLength: 0,
    };

    private _listLoadStatus = {
        feed: "default",
        defaultListLength: 0,
        favoriteListLength: 0,
        success: true,
        error: {
            name: "",
            networkStatus: 200,
            networkMessage: "",
        },
    };

    // версия для dom-sdk - с loader
    // private _loadStoriesList = async (storyListWidget: IWidgetStoriesList, appearanceManager: AppearanceManager, storiesList: StoriesList, needFavorite = true, needLoader = true) => {
    //
    //   const storiesListOptions = appearanceManager.storiesListOptions;
    //
    //   if (needLoader) {
    //     // loader
    //     if (storiesListOptions.handleStartLoad && isFunction(storiesListOptions.handleStartLoad) || storiesList.listenerCount(StoriesListEvents.START_LOADER) !== 0) {
    //       if (storiesListOptions.handleStartLoad && isFunction(storiesListOptions.handleStartLoad)) {
    //         storiesListOptions.handleStartLoad(storyListWidget.loaderContainer);
    //       } else {
    //         storiesList.emit(StoriesListEvents.START_LOADER, storyListWidget.loaderContainer);
    //       }
    //     } else {
    //       storyListWidget.startLoader();
    //     }
    //   }
    //
    //   const favoriteList = (appearanceManager.commonOptions.hasFavorite === true ? true : false) && needFavorite;
    //
    //   await fetchSessionAndStoriesCompositeFx({defaultList: true, onboardingList: false, favoriteList});
    //
    //
    //
    //   if (needLoader) {
    //     // stop loader
    //     // emit все равно делать
    //     // и самим стопать если нет подписки
    //     if (storiesListOptions.handleStopLoading && isFunction(storiesListOptions.handleStopLoading) || storiesList.listenerCount(StoriesListEvents.END_LOADER) !== 0) {
    //       if (storiesListOptions.handleStopLoading && isFunction(storiesListOptions.handleStopLoading)) {
    //         storiesListOptions.handleStopLoading(storyListWidget.loaderContainer, this._loadedStoriesLength);
    //       } else {
    //         storiesList.emit(StoriesListEvents.END_LOADER, storyListWidget.loaderContainer, this._loadedStoriesLength);
    //       }
    //     } else {
    //       storyListWidget.stopLoader();
    //     }
    //   }
    // }

    private _loadStoriesList = async (
        storyListWidget: IWidgetStoriesList,
        appearanceManager: AppearanceManager,
        needFavorite = true,
        needLoader = true
    ) => {
        const storiesListOptions = appearanceManager.storiesListOptions;

        // if (needLoader) {
        //     // loader
        //     // @ts-ignore
        //     if (storiesListOptions.handleStartLoad && isFunction(storiesListOptions.handleStartLoad) || storiesList.listenerCount(StoriesListEvents.START_LOADER) !== 0) {
        //         if (storiesListOptions.handleStartLoad && isFunction(storiesListOptions.handleStartLoad)) {
        //             storiesListOptions.handleStartLoad(storyListWidget.loaderContainer);
        //         } else {
        //             storiesList.emit(StoriesListEvents.START_LOADER, storyListWidget.loaderContainer);
        //         }
        //     } else {
        //         storyListWidget.startLoader();
        //     }
        // }

        const favoriteList = (appearanceManager.commonOptions.hasFavorite === true ? true : false) && needFavorite;

        try {
            await fetchSessionAndStoriesCompositeFx({
                defaultList: storyListWidget.feedSlug,
                onboardingList: false,
                favoriteList,
                testKey: storyListWidget.testKey,
            });

            // wait for $storiesFeeds updates
            await new Promise((resolve) => setTimeout(resolve, 100));

            storyListWidget.setListLoadStatusField("feed", storyListWidget.feedSlug);
            storyListWidget.setListLoadStatusField("success", true);
            storyListWidget.setListLoadStatusField("error", null);
        } catch (e: any) {
            storyListWidget.setListLoadStatusField("success", false);
            storyListWidget.setListLoadStatusField("error", {
                name: e.name,
                networkMessage: e.networkMessage,
                networkStatus: e.networkStatus,
            });
        }

        // if (needLoader) {
        //     // stop loader
        //     // emit все равно делать
        //     // и самим стопать если нет подписки
        //     if (storiesListOptions.handleStopLoad && isFunction(storiesListOptions.handleStopLoad) || storiesList.listenerCount(StoriesListEvents.END_LOADER) !== 0) {
        //         if (storiesListOptions.handleStopLoad && isFunction(storiesListOptions.handleStopLoad)) {
        //             storiesListOptions.handleStopLoad(storyListWidget.loaderContainer, storiesList._listLoadStatus);
        //         } else {
        //             storiesList.emit(StoriesListEvents.END_LOADER, storyListWidget.loaderContainer, storiesList._listLoadStatus);
        //         }
        //     } else {
        //         storyListWidget.stopLoader();
        //     }
        // }

        return storyListWidget.listLoadStatus;
    };

    // private _storiesList = async (mountSelector: string, appearanceManager: AppearanceManager, storiesList: StoriesList):
    //   Promise<{ storyListWidget: IWidgetStoriesList, appearanceManager: AppearanceManager }> => {
    //
    //
    //   const storiesListOptions = appearanceManager.storiesListOptions;
    //
    //   // await create and mount widget -- after inited - we can pass data them
    //   const storyListWidget = this.createWidgetStoriesList(mountSelector, {});
    //
    //   // init widget
    //   await storyListWidget.init(mountSelector as ObjectId, {
    //     ...storiesListOptions,
    //     hasFavorite: appearanceManager.commonOptions.hasFavorite
    //   });
    //
    //   sample({
    //     source: $storiesDefault,
    //     clock: $storiesDefault,
    //     target: createEffect((storyList: Array<StoryModel>) => {
    //       this._loadedStoriesLength.defaultListLength = storyList.length;
    //       storyListWidget.setStories({
    //         listType: STORY_LIST_TYPE.default,
    //         storyList
    //       });
    //     })
    //   });
    //
    //   if (appearanceManager.commonOptions.hasFavorite) {
    //     sample({
    //       source: $storiesFavorite,
    //       clock: $storiesFavorite,
    //       target: createEffect(async (storyList: Array<StoryModel>) => {
    //         this._loadedStoriesLength.favoriteListLength = storyList.length;
    //         storyListWidget.setStories({
    //           listType: STORY_LIST_TYPE.favorite,
    //           storyList
    //         });
    //         (await this.getStoryFavoriteReaderInstance()).setStories({
    //           listType: STORY_LIST_TYPE.favorite,
    //           storyList
    //         });
    //       })
    //     });
    //   }
    //
    //   // session - init if empty
    //   // load and render
    //
    //   // if not opened
    //   // Session.open
    //
    //   // config - move to models/config
    //
    //   // placeholders -- мерджить с конфигом и применять к моделям
    //   // from common config (not from storyList config)
    //
    //   await this._loadStoriesList(storyListWidget, appearanceManager, storiesList, true, true);
    //
    //   const fontResources = getFontResources();
    //   storyListWidget.setFonts(fontResources);
    //
    //   const params = $storyManagerConfig.getState();
    //   storyListWidget.setCallbacks({
    //     // deeplink from list
    //     handleClickOnStoryDeepLink: (payload: StoriesListClickEvent) => {
    //
    //       // public event
    //
    //       // просто клик на ячейку
    //       // if (config?.handleClickOnStory && isFunction(config?.handleClickOnStory)) {
    //       //   config?.handleClickOnStory(payload);
    //       // }
    //
    //
    //       const dataForSending = {
    //         // state.data.push([
    //         //     action,
    //         //     state.lastIndex,
    //         //     storyId,
    //         //     slideIndex,
    //         //     slideDuration
    //         // ]);
    //         // state.lastIndex++
    //         data: [[
    //           1, //action: 1, // Прочтение
    //           0, // lastIndex
    //           payload.id, // storyId: e.storyId, // id story,
    //           0, // slideIndex: 0, // индекс слайда
    //           0, //slideDuration: 0
    //         ]]
    //       };
    //
    //       APISendBeacon('session/update', dataForSending, Utility.createFunctionWithTimeout(() => {
    //
    //
    //         if (payload.isDeeplink && payload.url) {
    //
    //           // или событие
    //           if (storiesListOptions?.handleStoryLinkClick && isFunction(storiesListOptions?.handleStoryLinkClick)) {
    //             storiesListOptions?.handleStoryLinkClick(payload);
    //           } else {
    //             window.open(payload.url, '_self');
    //           }
    //         }
    //
    //       }));
    //     },
    //
    //     // public event
    //     handleClickOnStory: (payload: any) => {
    //       // if (storiesListOptions?.handleClickOnStory && isFunction(storiesListOptions?.handleClickOnStory)) {
    //       //   storiesListOptions?.handleClickOnStory(payload);
    //       // }
    //     },
    //
    //     handleFlushThumbViews: (payload: Array<number>) => {
    //       // console.log('handleFlushThumbViews', payload);
    //       sessionThumbViewsChanged(payload);
    //     },
    //
    //
    //     handleClickOnStoryInternal: (payload: ClickOnStoryInternalPayload) => this.handleClickOnStoryInternal(payload)
    //
    //
    //   });
    //
    //
    //   storyListWidget.on('clickOnFavoriteCellInternal', async (payload: ClickOnFavoriteCellInternalPayload) => {
    //     const openReaderData = {
    //       ...payload,
    //       // storyContext: $storyContext.getState(),
    //       storyList: getStoryListByType(STORY_LIST_TYPE.favorite),
    //     };
    //     (await this.getStoryFavoriteReaderInstance()).openReader(openReaderData);
    //   });
    //
    //
    //   // await fetchSessionFx({});
    //   //
    //   // // fetch default list
    //   // await fetchStoriesFx({listType: STORY_LIST_TYPE.default});
    //
    //
    //   // components api interface
    //   // глобальный флаг - выбираем фабрику для интерфейса
    //   // сами компоненты уже используют abstract functions
    //   // и здесь отвтеная часть реагется
    //   // storyListWidget object
    //   // storyReaderWidget object etc
    //   // favoriteReaderWidget object
    //   // msgpack
    //   // story manager хранит у себя виджеты и их rpc (внутри виджетов ?) (в parent class - field)
    //
    //
    //   // все же грузить вместе с лентой
    //   // let storyReaderInstancePromise: Option<Promise<_StoryReader>> = null;
    //   // if (this.storyReaderInstance === null) {
    //   //   storyReaderInstancePromise = this.initStoryReader($config.getState(), fontResources);
    //   // }
    //
    //   this.storyListInstance = storyListWidget;
    //
    //   if (this.storyReaderInstancePromise === null) {
    //     this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, fontResources);
    //   }
    //
    //   if (this.storyFavoriteReaderInstancePromise === null) {
    //     this.storyFavoriteReaderInstancePromise = this.initStoryFavoriteReader(appearanceManager, fontResources);
    //   }
    //
    //   return {storyListWidget, appearanceManager};
    //
    // }

    // базовая версия без лоадера

    protected _loadStoriesListData = async (
        storyListWidget: IWidgetStoriesList,
        appearanceManager: AppearanceManager
    ): Promise<ListLoadStatus> => {
        storyListWidget.emit(StoriesListEvents.START_LOADER);

        // load list
        // needFavorite
        const listLoadStatus = await this._loadStoriesList(storyListWidget, appearanceManager, true);

        // // перенести в создание виджета (ViewModel)
        // storyListWidget.forUnsubscribe.push($storiesFeeds.watch((storyFeeds: Record<string, Array<StoryModel>>) => {
        //
        //     const storyList = storyFeeds[storyListWidget.feedSlug] ?? [];
        //
        //     // TODO 3 раза вызывается, неправильно
        //     storyListWidget.setListLoadStatusField("defaultListLength", storyList.length);
        //
        //
        // }));
        // if (appearanceManager.commonOptions.hasFavorite) {
        //     storyListWidget.forUnsubscribe.push($storiesFavorite.watch(async (storyList: Array<StoryModel>) => {
        //         storyListWidget.setListLoadStatusField("favoriteListLength", storyList.length);
        //     }));
        // }

        setTimeout(() => {
            storyListWidget.emit(StoriesListEvents.END_LOADER, listLoadStatus);
        });

        return listLoadStatus;
    };

    public isWebPSupported = false;

    // вынести в отдельный класс эт овсе
    protected _storiesListWidgetLoaded = async (
        storyListWidget: IWidgetStoriesList,
        appearanceManager: AppearanceManager
    ) => {
        // checkWebPSupport
        this.isWebPSupported = await storyListWidget.checkWebPSupport();

        storyListWidget.forUnsubscribe.push(
            $storiesFeeds.watch((storyFeeds: Record<string, Array<StoryModel>>) => {
                const storyList = storyFeeds[storyListWidget.feedSlug] ?? [];

                // TODO 3 раза вызывается, неправильно
                storyListWidget.setListLoadStatusField("defaultListLength", storyList.length);
                storyListWidget.setStories({
                    listType: STORY_LIST_TYPE.default,
                    storyList,
                });
            })
        );

        if (appearanceManager.commonOptions.hasFavorite) {
            storyListWidget.forUnsubscribe.push(
                $storiesFavorite.watch(async (storyList: Array<StoryModel>) => {
                    // TODO 3 раза вызывается, неправильно
                    storyListWidget.setListLoadStatusField("favoriteListLength", storyList.length);
                    storyListWidget.setStories({
                        listType: STORY_LIST_TYPE.favorite,
                        storyList,
                    });

                    // todo and if reader opened
                    if (this._storyFavoriteReaderInstance) {
                        this._storyFavoriteReaderInstance.setStories({
                            listType: STORY_LIST_TYPE.favorite,
                            storyList,
                        });
                    }

                    // (await this.getStoryFavoriteReaderInstance()).setStories({
                    //     listType: STORY_LIST_TYPE.favorite,
                    //     storyList
                    // });
                })
            );
        }

        // session - init if empty
        // load and render

        // if not opened
        // Session.open

        // config - move to models/config

        // placeholders -- мерджить с конфигом и применять к моделям
        // from common config (not from storyList config)

        await waitForSessionLoad();
        const fontResources = getFontResources();
        storyListWidget.setFonts(fontResources);
        // console.log({fontResources});

        const params = $storyManagerConfig.getState();

        storyListWidget.setCallbacks({
            // deeplink from list
            handleClickOnStoryDeepLink: (payload: StoriesListClickEvent) => {
                // public event

                // просто клик на ячейку
                // if (config?.handleClickOnStory && isFunction(config?.handleClickOnStory)) {
                //   config?.handleClickOnStory(payload);
                // }

                const dataForSending = {
                    // state.data.push([
                    //     action,
                    //     state.lastIndex,
                    //     storyId,
                    //     slideIndex,
                    //     slideDuration
                    // ]);
                    // state.lastIndex++
                    data: [
                        [
                            1, //action: 1, // Прочтение
                            0, // lastIndex
                            payload.id, // storyId: e.storyId, // id story,
                            0, // slideIndex: 0, // индекс слайда
                            0, //slideDuration: 0
                        ],
                    ],
                };

                APIInstance.post("session/update", dataForSending);

                if (payload.isDeeplink && payload.url) {
                    const storiesListOptions = appearanceManager.storiesListOptions;

                    // storiesListOptions?.handleStoryLinkClick - @deprecated
                    if (
                        storiesListOptions?.handleStoryLinkClick &&
                        isFunction(storiesListOptions?.handleStoryLinkClick)
                    ) {
                        storiesListOptions?.handleStoryLinkClick(payload);
                    } else {
                        this.clickOnButtonAction({ src: CTASource.STORY_LIST, payload });
                    }
                }
            },

            // public event
            handleClickOnStory: (payload: ClickOnStoryPayload) => {
                if (payload.id === 0) {
                    this.emit("clickOnFavoriteCell", {
                        feed: storyListWidget.feedSlug,
                    });
                } else {
                    // id, title, tags, slidesCount, feed
                    const additionalPayload: {
                        title: Option<string>;
                        tags: Array<string>;
                        slidesCount: Option<number>;
                        feed: Option<string>;
                        source: Option<string>;
                    } = {
                        title: null,
                        tags: [],
                        slidesCount: null,
                        feed: null,
                        source: null,
                    };

                    const story: StoryModel | undefined = $stories.getState().find((item) => item.id === payload.id);
                    if (story) {
                        additionalPayload.title = story.title;
                        additionalPayload.tags = story.tags;
                        additionalPayload.slidesCount = story.slides_count;
                    }

                    additionalPayload.feed = storyListWidget.feedSlug;
                    additionalPayload.source = StoryActionSource.list;

                    this.emit("clickOnStory", {
                        ...payload,
                        ...additionalPayload,
                    });
                }
            },

            handleFlushThumbViews: (payload: Array<number>) => {
                sessionThumbViewsChanged(payload);
            },

            handleClickOnStoryInternal: (payload: ClickOnStoryInternalPayload) =>
                this.handleClickOnStoryInternal(payload, storyListWidget.feedSlug),
        });

        storyListWidget.on("clickOnFavoriteCellInternal", async (payload: ClickOnFavoriteCellInternalPayload) => {
            let storyFavoriteReaderInstance;
            try {
                this.emit("openStoryFavoriteReader", payload);
                storyFavoriteReaderInstance = await this.getStoryFavoriteReaderInstance();
                storyFavoriteReaderInstance.emit("openStoryFavoriteReader", payload); // for BackHandler

                // start load, show layout
                this.showStoryFavoriteReaderLoader(true);

                // if (this._storyReaderNeedFirstRender != null) {
                //   this._storyReaderNeedFirstRender(true);
                // }

                // console.log('clickOnStoryInternalEvent 4', storyReaderInstance);

                const openReaderData = {
                    ...payload,
                    // storyContext: $storyContext.getState(),
                    storyList: getStoryListByType(STORY_LIST_TYPE.favorite),
                    soundOn: this.soundOn,
                };

                // console.log("clickOnFavoriteCellInternal");

                storyFavoriteReaderInstance.openReader(openReaderData, {
                    listType: payload.listType,
                    feed: storyListWidget.feedSlug,
                });

                // set stories
                // storyFavoriteReaderInstance.setStories({listType: payload.listType, storyList: getStoryListByType(payload.listType, storyListWidget.feedSlug)});
            } catch (e) {
                this.showStoryFavoriteReaderLoader(false);
                storyFavoriteReaderInstance && storyFavoriteReaderInstance.closeReader();
                console.log(e);
            }
        });

        // public event
        // storyListWidget.on('clickOnStory', (payload: ClickOnStoryPayload) => {
        //
        //     if (payload.id === 0) {
        //         this.emit("clickOnFavoriteCell", {feed: storyListWidget.feedSlug});
        //     } else {
        //
        //         // id, title, tags, slidesCount, feed
        //         const additionalPayload: {
        //             title: Option<string>,
        //             tags: Array<string>,
        //             slidesCount: Option<number>,
        //             feed: Option<string>,
        //             source: Option<string>
        //         } = {
        //             title: null,
        //             tags: [],
        //             slidesCount: null,
        //             feed: null,
        //             source: null
        //         };
        //
        //         const story: StoryModel|undefined = $stories.getState().find(item => item.id === payload.id);
        //         if (story) {
        //             additionalPayload.title = story.title;
        //             additionalPayload.tags = story.tags;
        //             additionalPayload.slidesCount = story.slides_count;
        //         }
        //
        //         additionalPayload.feed = storyListWidget.feedSlug;
        //         additionalPayload.source = StoryActionSource.list;
        //
        //
        //         this.emit("clickOnStory", {...payload, ...additionalPayload});
        //     }
        // });

        // await fetchSessionFx({});
        //
        // // fetch default list
        // await fetchStoriesFx({listType: STORY_LIST_TYPE.default});

        // components api interface
        // глобальный флаг - выбираем фабрику для интерфейса
        // сами компоненты уже используют abstract functions
        // и здесь отвтеная часть реагется
        // storyListWidget object
        // storyReaderWidget object etc
        // favoriteReaderWidget object
        // msgpack
        // story manager хранит у себя виджеты и их rpc (внутри виджетов ?) (в parent class - field)

        // все же грузить вместе с лентой
        // let storyReaderInstancePromise: Option<Promise<_StoryReader>> = null;
        // if (this.storyReaderInstance === null) {
        //   storyReaderInstancePromise = this.initStoryReader($config.getState(), fontResources);
        // }

        this.storyListInstance = storyListWidget;

        // не будем сразу инициализировать

        // if (this.storyReaderInstancePromise == null) {
        //   this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, fontResources);
        // }
        //
        // if (this.storyFavoriteReaderInstancePromise == null) {
        //   this.storyFavoriteReaderInstancePromise = this.initStoryFavoriteReader(appearanceManager, fontResources);
        // }

        return { storyListWidget, appearanceManager };
    };

    // запуск ридера
    private async handleClickOnStoryInternal(payload: ClickOnStoryInternalPayload, feedSlug: Option<string>) {
        // load expand story, img resources,
        // create story reader instance
        // open story reader

        // console.log('clickOnStoryInternalEvent 3');
        // console.log('[handleClickOnStoryInternal] -- open Reader', payload);

        let storyReaderInstance;
        try {
            this.emit("openStoryReader", payload);

            storyReaderInstance = await this.getStoryReaderInstance();
            storyReaderInstance.emit("openStoryReader", payload); // for BackHandler

            // start load, show layout
            this.showStoryReaderLoader(true);

            // state - loading

            // open / close iframe container
            // with - sbHelper.setScrollbar(); (open)

            // load all slides
            // await fetchStoriesSlidesCompositeFx({ids: $storiesIdsWithoutLoadedSlides.getState()});

            // load expand target story and list context

            // context и ids slides -- грузить только для нужного списка
            const storyContext = $storyContext.getState();
            // неправильно, нужно - сравиниать со спиком, который щас открываем
            let storyContextExists =
                storyContext !== null; /* && storyContext.ids === $storiesIdsWithoutLoadedSlides.getState()*/
            if (storyContext && $storiesIdsWithoutLoadedSlides.getState().length > 0) {
                if (storyContext.ids !== $storiesIdsWithoutLoadedSlides.getState()) {
                    storyContextExists = false;
                }
            }

            // если сначла открыть из сингла
            // то потом в списке нет данных по виджетам
            // поэтому качаем при каждом открытии
            storyContextExists = false;

            // TODO  $storiesIdsWithoutLoadedSlides.getState() -- для нужного списка фильтровать или для каждой сторис грузить отдельно layout
            // у каждой сторис просто хранить ее layout (ее кастомная часть, а общую - в context стили общие и проетка) частная -- стили и виджеты)
            const story = $stories.getState().find((_) => _.id === payload.id);

            let contextIds = getStoryListByType(payload.listType, feedSlug).map((item) => item.id);

            await fetchStoriesContextAndStorySlidesCompositeFx({
                // ids: $storiesIdsWithoutLoadedSlides.getState(),
                ids: contextIds,
                id: payload.id,
            });

            // if (!storyContextExists && (story && !story.slidesLoaded)) {
            //     await fetchStoriesContextAndStorySlidesCompositeFx({
            //         ids: $storiesIdsWithoutLoadedSlides.getState(),
            //         id: payload.id
            //     });
            // } else {
            //     if (!storyContextExists) {
            //         if ($storiesIdsWithoutLoadedSlides.getState().length) {
            //             await fetchStoryContextFx({ids: $storiesIdsWithoutLoadedSlides.getState()});
            //         }
            //     } else if (!story || !story.slidesLoaded) {
            //         await fetchStoriesSlidesCompositeFx({ids: [payload.id]});
            //     }
            // }

            // beforehand - open reader with loader screen

            // list type
            // this.storyReaderInstance.setStories($stories.getState());
            // this.storyReaderInstance.setStoriesContext($storyContext.getState());

            const openReaderData = {
                ...payload,
                storyContext: $storyContext.getState(),
                storyList: getStoryListByType(payload.listType, feedSlug),
                hasShare: $session.getState().share,
                platform: this.getDevicePlatform(),
                soundOn: this.soundOn,
            };

            // run example app - in server env + README
            // without chrome server

            // try catch

            // if (this._storyReaderNeedFirstRender != null) {
            //   this._storyReaderNeedFirstRender(true);
            // }
            // console.log('clickOnStoryInternalEvent 4', storyReaderInstance);

            storyReaderInstance.openReader(openReaderData, {
                listType: payload.listType,
                feed: feedSlug,
            });

            // fetch other slides
            const ids = $storiesIdsWithoutLoadedSlides.getState();
            if (ids.length > 0) {
                await fetchStoriesSlidesCompositeFx({ ids });
            }

            // set stories
            storyReaderInstance.setStories({
                listType: payload.listType,
                storyList: getStoryListByType(payload.listType, feedSlug),
            });

            // console.log({storyList: getStoryListByType(payload.listType)})
        } catch (e) {
            this.showStoryReaderLoader(false);
            storyReaderInstance && storyReaderInstance.closeStoryReaderOrLoader();
            console.log(e);
        }
    }

    // composite для expand сторис
    // react library
    // add method - close reader из вне

    protected completeInitStoryReader(
        storyReaderInstance: IWidgetStoryReader /*, appearanceManager: AppearanceManager*/,
        fonts: Array<CacheResourceModel>,
        overrideStoryReaderOptions: Pick<StoryReaderOptions, "recycleStoriesList" | "closeOnLastSlideByTimer"> = {}
    ) {
        // инстанс виджета создается через JSX
        // const storyReaderInstance = new _StoryReader('body', {});

        // await storyReaderInstance.init('body' as ObjectId, {
        //   ...appearanceManager.storyReaderOptions,
        //   appearanceCommon: appearanceManager.commonOptions,
        //   ...overrideStoryReaderOptions
        // });

        storyReaderInstance.setSoundOn(this._soundOn);

        storyReaderInstance.on("changeSoundOnInternal", ({ value }: { value: boolean }) => {
            this._soundOn = value;
        });

        storyReaderInstance.setFonts(fonts);

        // set all callbacks
        storyReaderInstance.setCallbacks({
            // public events
        });

        // todo избавиться от этой связи -- storyListInstance
        // т.к. может быть мнго списоков в менеджере

        storyReaderInstance.on("storyOpenedInternal", (payload: { id: number }) =>
            this.storyListInstance?.onStoryOpened(payload)
        );

        storyReaderInstance.on(
            "setStoryOpened",
            async (payload: { listType: STORY_LIST_TYPE; id: number; __cb: { id: string } }) => {
                // console.log({"setStoryOpened": payload});
                // update store and localStorage

                if (!isEmpty($session.getState().user_key)) {
                    const key = `u/${$session.getState().user_key}/s_opened`;
                    let data = await this.localStorageGetArray<number>(key);
                    if (!isArray(data)) {
                        data = [];
                    }
                    data.push(payload.id);
                    data = uniq(data);
                    this.localStorageSetArray(key, data);
                }

                // @ts-ignore
                storyItemIsOpenedChanged({ id: payload.id });

                // посмотерть что ему требуется в ответе  (data: payload or data: data)
                storyReaderInstance.rpcCb({
                    requestId: payload.__cb.id,
                    success: true,
                    data: payload,
                    err: "",
                });
            }
        );

        storyReaderInstance.on(
            "updateStoryFavorite",
            async (payload: { listTYpe: STORY_LIST_TYPE; id: number; favorite: number; __cb: { id: string } }) => {
                // console.log('updateStoryFavorite', payload);
                // call api and update model in store
                let success = false;
                const data: { favorite: undefined | boolean } = {
                    favorite: undefined,
                };
                let err = "";
                try {
                    const response = await API.post<Dict>(`story-favorite/${payload.id}`, { value: payload.favorite });
                    if (response.data.favorite !== undefined) {
                        success = true;
                        data.favorite = Boolean(response.data.favorite);

                        // @ts-ignore
                        storyItemFavoriteChanged({
                            id: payload.id,
                            favorite: data.favorite,
                        });
                        if (data.favorite === false) {
                            // @ts-ignore
                            storiesListIdsChanged({
                                storiesIdsUserEntity: StoriesIdsUserEntities.FAVORITE,
                                storyList: $storiesFavorite.getState().filter((_) => _.id !== payload.id),
                            });
                        } else {
                            // @ts-ignore
                            storiesListIdsChanged({
                                storiesIdsUserEntity: StoriesIdsUserEntities.FAVORITE,
                                storyList: [
                                    ...$storiesFavorite.getState(),
                                    ...$stories.getState().filter((_) => _.id === payload.id),
                                ],
                            });
                        }
                    } else {
                        err = "response.data.favorite is undefined";
                    }
                } catch (e) {
                    // @ts-ignore
                    err = e.toString();
                }

                storyReaderInstance.rpcCb({
                    requestId: payload.__cb.id,
                    success,
                    data,
                    err,
                });
            }
        );

        storyReaderInstance.on(
            "updateStoryLike",
            async (payload: { listType: STORY_LIST_TYPE; id: number; like: number; __cb: { id: string } }) => {
                // console.log('updateStoryLike', payload);
                // call api and update model in store
                let success = false;
                const data: { like: undefined | number } = {
                    like: undefined,
                };
                let err = "";
                try {
                    const response = await API.post<Dict<any>>(`story-like/${payload.id}`, { value: payload.like });
                    // console.log({"updateStoryLike": response});
                    if (response.data.like !== undefined) {
                        success = true;
                        data.like = response.data.like;

                        storyItemLikeChanged({
                            id: payload.id,
                            like: data.like,
                        });
                    } else {
                        err = "response.data.like is undefined";
                    }
                } catch (e) {
                    // @ts-ignore
                    err = e.toString();
                }

                // console.log({"updateStoryLike": data, err});

                storyReaderInstance.rpcCb({
                    requestId: payload.__cb.id,
                    success,
                    data,
                    err,
                });
            }
        );

        storyReaderInstance.on(
            "getStorySharePath",
            async (payload: { listType: STORY_LIST_TYPE; id: number; __cb: { id: string } }) => {
                let success = false;
                const data: { url: undefined | number } = {
                    url: undefined,
                };
                let err = "";
                try {
                    const response = await API.get<Dict<any>>(`story-share/${payload.id}`);
                    if (response.data.url !== undefined) {
                        success = true;
                        data.url = response.data.url;

                        // storyItemLikeChanged({id: payload.id, url: data.url});
                    } else {
                        err = "response.data.url is undefined";
                    }
                } catch (e) {
                    // @ts-ignore
                    err = e.toString();
                }

                storyReaderInstance.rpcCb({
                    requestId: payload.__cb.id,
                    success,
                    data,
                    err,
                });
            }
        );

        storyReaderInstance.on(
            "apiRequest",
            async (payload: {
                data: Option<{
                    data: Option<Dict>;
                }>;
                url: string;
                method: ApiRequestConfigMethod;
                params: Option<Dict>;
                headers: Option<Dict>;
                __cb: { id: string };
            }) => {
                let success = false;
                let err = "";

                let config: ApiRequestConfig = {
                    url: payload.url as string,
                    method: payload.method as ApiRequestConfigMethod,
                };

                if (["post", "put", "path"].indexOf(payload.method as string) !== -1) {
                    if (payload.data) {
                        config.data = payload.data;
                    }
                } else {
                    config.params = payload.params as Dict;
                }

                const responsePayload: Dict = {};
                try {
                    const response = await API.request(config);
                    responsePayload.data = response.data;
                    responsePayload.status = response.status;
                    responsePayload.headers = response.headers;

                    success = true;
                } catch (e) {
                    // TODO если сетевая ошибка - как вытащить status
                    responsePayload.data = e;
                    responsePayload.status = 400;
                    responsePayload.headers = [{}];
                    // @ts-ignore
                    err = e.toString();
                }

                storyReaderInstance.rpcCb({
                    requestId: payload.__cb.id,
                    success,
                    data: responsePayload,
                    err,
                });
            }
        );

        storyReaderInstance.on(
            "updateStoriesStat",
            async (payload: { listType: STORY_LIST_TYPE; data: any; __cb: { id: string } }) => {
                // console.log('updateStoryLike', payload);
                // call api and update model in store
                let success = false;
                let data: Dict = {};
                let err = "";
                try {
                    const response = await API.post<Dict<any>>(`session/update`, payload.data);
                    if (response.data !== undefined) {
                        success = true;
                        data = response.data;
                    } else {
                        err = "response.data is undefined";
                    }
                } catch (e) {
                    // @ts-ignore
                    err = e.toString();
                }

                // console.log("response", data, err)

                storyReaderInstance.rpcCb({
                    requestId: payload.__cb.id,
                    success,
                    data,
                    err,
                });
            }
        );

        // button from slide
        if (storyReaderInstance.listenerCount("clickOnButton") === 0) {
            storyReaderInstance.on("clickOnButton", (payload: ClickOnButtonPayload) => {
                // prevent setTimeout - we need pass user gesture to handler (prevent popup block for target _blank)
                // @ts-ignore
                // console.log(navigator.userActivation.hasBeenActive, navigator.userActivation.isActive, new Date().getTime());

                /** call after send stat */
                const cb = () => this.clickOnButtonAction({ src: CTASource.STORY_READER, payload });

                // APIInstance.post("session/update", payload.dataForSending);

                cb();
            });
        }

        // SwipeUpGoods
        // map - по названи. события - какой тип payload
        storyReaderInstance.on("clickOnSwipeUpGoods", (payload: ClickOnSwipeUpPayload) => {
            if (storyReaderInstance) {
                this._goodsWidgetInstance = new GoodsWidget(this, appearanceManager, storyReaderInstance, payload);

                this._goodsWidgetInstance.once("close", (data: { elementId: string }) => {
                    this._goodsWidgetInstance = null;

                    if (storyReaderInstance) {
                        // on close - for resumeUI
                        storyReaderInstance.closeGoodsWidget(data);
                    }
                });
            }
        });

        // StatusBar
        storyReaderInstance.on("openedStoryReader", () => {
            this.showStoryReaderLoader(false);
        });

        // StatusBar
        storyReaderInstance.on("openStoryReader", (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {});

        storyReaderInstance.on("closeStoryReader", (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
            StoryManager.instance?.closeGoodsWidget();

            // setTimeout(() => {

            // detach View
            if (this._storyReaderDetachComponent != null) {
                this._storyReaderDetachComponent(storyReaderInstance);
            }
            this.storyReaderInstancePromise = null;
            this._storyReaderInstance = null;

            this.showStoryReaderLoader(false);

            storyReaderInstance.emit("modalClosed");

            // }, 100);
        });

        const publicEvents = [
            "showSlide",
            "showStory",
            "closeStory",
            "clickOnButton",
            "likeStory",
            "dislikeStory",
            "favoriteStory",
            "shareStory",
            "shareStoryWithPath",
        ];

        publicEvents.forEach((eventName) =>
            storyReaderInstance.on(eventName, (payload) => {
                const listType = storyReaderInstance.sourceInfo.listType as STORY_LIST_TYPE;
                const feed = storyReaderInstance.sourceInfo.feed as string;

                // id, title, tags, slidesCount, feed
                const additionalPayload: {
                    title: Option<string>;
                    tags: Array<string>;
                    slidesCount: Option<number>;
                    feed: Option<string>;
                    source: Option<string>;
                } = {
                    title: null,
                    tags: [],
                    slidesCount: null,
                    feed: null,
                    source: null,
                };

                const story: StoryModel | undefined = $stories.getState().find((item) => item.id === payload.id);
                if (story) {
                    additionalPayload.title = story.title;
                    additionalPayload.tags = story.tags;
                    additionalPayload.slidesCount = story.slides_count;
                }

                additionalPayload.feed = feed;
                if (listType === STORY_LIST_TYPE.direct) {
                    additionalPayload.source = StoryActionSource.direct;
                } else if (listType === STORY_LIST_TYPE.default) {
                    additionalPayload.source = StoryActionSource.list;
                } else if (listType === STORY_LIST_TYPE.onboarding) {
                    additionalPayload.source = StoryActionSource.onboarding;
                } else if (listType === STORY_LIST_TYPE.favorite) {
                    additionalPayload.source = StoryActionSource.favorite;
                }

                // Slide payload - only for events with field `index` (slide index)
                if (payload.index != null) {
                    payload.payload = null;
                    if (story && story.slides_payload && Array.isArray(story.slides_payload)) {
                        const slidePayload = story.slides_payload.find((item) => item.slide_index === payload.index);
                        if (slidePayload != null && slidePayload.payload) {
                            payload.payload = slidePayload.payload;
                        }
                    }
                }

                this.emit(eventName, { ...payload, ...additionalPayload });
            })
        );

        storyReaderInstance.on("changeSoundOnInternal", ({ value }) => {
            this.emit("soundOnChangedByUser", { value });
        });

        return storyReaderInstance;
    }

    protected completeInitStoryFavoriteReader(
        storyFavoriteReaderInstance: IWidgetStoryFavoriteReader /*, appearanceManager: AppearanceManager*/,
        fonts: Array<CacheResourceModel>
    ) {
        // options: appearanceManager.storyFavoriteReaderOptions,
        //     storiesListOptions: appearanceManager.storiesListOptions

        // инстанс виджета создается через JSX
        // const storyReaderInstance = new _StoryReader('body', {});

        // await storyReaderInstance.init('body' as ObjectId, {
        //   ...appearanceManager.storyReaderOptions,
        //   appearanceCommon: appearanceManager.commonOptions,
        //   ...overrideStoryReaderOptions
        // });

        storyFavoriteReaderInstance.setFonts(fonts);

        // set all callbacks
        storyFavoriteReaderInstance.setCallbacks({
            // public events
        });

        // StatusBar
        storyFavoriteReaderInstance.on("openedStoryFavoriteReader", () => {
            this.showStoryFavoriteReaderLoader(false);
        });

        // для esc на browser
        // storyFavoriteReaderInstance.on('closeReader', () => {
        //     try {
        //         window.focus()
        //     } catch (e) {
        //         console.error(e)
        //     }
        // });

        // todo impl

        storyFavoriteReaderInstance.on("clickOnStoryInternal", (payload: ClickOnStoryInternalPayload) => {
            // id, title, tags, slidesCount, feed
            const additionalPayload: {
                title: Option<string>;
                tags: Array<string>;
                slidesCount: Option<number>;
                feed: Option<string>;
                source: Option<string>;
            } = {
                title: null,
                tags: [],
                slidesCount: null,
                feed: null,
                source: null,
            };

            const story: StoryModel | undefined = $stories.getState().find((item) => item.id === payload.id);
            if (story) {
                additionalPayload.title = story.title;
                additionalPayload.tags = story.tags;
                additionalPayload.slidesCount = story.slides_count;
            }

            additionalPayload.feed = storyFavoriteReaderInstance.sourceInfo.feed;
            additionalPayload.source = StoryActionSource.favorite;

            this.emit("clickOnStory", {
                id: payload.id,
                index: payload.index,
                isDeeplink: payload.isDeeplink,
                ...additionalPayload,
            });

            this.handleClickOnStoryInternal(payload, storyFavoriteReaderInstance.sourceInfo.feed);
        });

        // Scrollbar helper
        // (await this.getStoryReaderInstance()).on('openStoryReader', (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => storyFavoriteReaderInstance.openStoryReader(options));
        // (await this.getStoryReaderInstance()).on('closeStoryReader', (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => storyFavoriteReaderInstance.closeStoryReader(options));

        storyFavoriteReaderInstance.on(
            "closeStoryFavoriteReader",
            (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
                // setTimeout(() => {

                // detach View
                if (this._storyFavoriteReaderDetachComponent != null) {
                    this._storyFavoriteReaderDetachComponent(storyFavoriteReaderInstance);
                }
                this.storyFavoriteReaderInstancePromise = null;
                this._storyFavoriteReaderInstance = null;

                this.showStoryFavoriteReaderLoader(false);

                storyFavoriteReaderInstance.emit("modalClosed");

                // }, 100);
            }
        );

        return storyFavoriteReaderInstance;
    }

    // tags ref appearanceManager
    public async showOnboardingStories(
        appearanceManager: AppearanceManager,
        options?: {
            feed?: Option<string>;
            customTags?: Array<string>;
            limit?: Option<number>;
        }
    ) {
        let onboardingList = "onboarding";
        if (options && options.feed && isString(options.feed)) {
            onboardingList = options.feed;
        }

        const result: {
            feed: string | number;
            defaultListLength: number;
            favoriteListLength: number;
            success: boolean;
            error: Option<{
                name: string;
                networkStatus: number;
                networkMessage: string;
            }>;
        } = {
            feed: onboardingList,
            defaultListLength: 0,
            favoriteListLength: 0,
            success: true,
            error: {
                name: "",
                networkStatus: 200,
                networkMessage: "",
            },
        };
        // const fontResources = getFontResources();

        try {
            await fetchSessionAndStoriesCompositeFx({
                defaultList: false,
                onboardingList: onboardingList,
                favoriteList: false,
                onboardingTags: options ? options.customTags : undefined,
                limit: options ? options.limit : undefined,
            });

            result.feed = onboardingList;
            result.success = true;
            result.error = null;

            result.defaultListLength = getStoryListByType(STORY_LIST_TYPE.onboarding, onboardingList).length;
        } catch (e: any) {
            result.feed = onboardingList;
            result.success = false;
            result.error = {
                name: e.name,
                networkMessage: e.networkMessage,
                networkStatus: e.networkStatus,
            };
        }

        // if (this.storyReaderInstancePromise === null) {
        //   // TODO config - sepaarte
        //   this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, fontResources);
        // }

        // стор может не успеть обновиться ?
        const onboardingStories = getStoryListByType(STORY_LIST_TYPE.onboarding, onboardingList);

        if (onboardingStories.length > 0) {
            const payload: ClickOnStoryInternalPayload = {
                windowReferer: STORY_READER_WINDOW_REFERER.default,
                listType: STORY_LIST_TYPE.onboarding,
                id: onboardingStories[0].id,
            };
            await this.handleClickOnStoryInternal(payload, onboardingList);

            return result;
        }

        return result;
    }

    public async showStory(
        id: number | string,
        appearanceManager: AppearanceManager,
        ref: string = "default"
    ): Promise<{ loaded: boolean }> {
        // appearanceManager  как его в ридер передать ?

        // const fontResources = getFontResources();
        //   console.log("showStory 2: ", id);
        // if (this.storyReaderInstancePromise === null) {
        //     console.log("showStory 3: ", id);
        //   // TODO config - sepaarte
        //   // this.storyReaderInstancePromise = this.initStoryReader(appearanceManager, fontResources);
        // }

        let result = false;
        let storyReaderInstance;
        try {
            this.emit("openStoryReader", {});

            // start load, show layout
            this.showStoryReaderLoader(true);

            // first load session - need for widget init
            await fetchSessionAndStoryDataCompositeFx({ id });

            storyReaderInstance = await this.getStoryReaderInstance();
            storyReaderInstance.emit("openStoryReader", {}); // for BackHandler

            //
            // const storyReaderInstance = await this.getStoryReaderInstance();
            //
            // console.log("showStory: storyReaderInstance created 5: ", id);
            //
            //
            result = await _showStory(id, storyReaderInstance, this.getDevicePlatform(), this.soundOn);

            // console.log("showStory: _showStory result 5: ", result);
        } catch (e) {
            result = false;
        }

        if (!result) {
            this.showStoryReaderLoader(false);
            storyReaderInstance && storyReaderInstance.closeStoryReaderOrLoader();
        }

        return {
            loaded: result,
        };

        // result - network status array
        // await this._openStoryReader(id);
    }

    public async closeStoryReader() {
        if (this.storyReaderInstancePromise === null) {
            return false;
        }
        const storyReaderInstance = await this.getStoryReaderInstance();
        this.closeGoodsWidget();

        // for BackHandler and API method
        storyReaderInstance.closeStoryReaderOrLoader();
    }

    public closeGoodsWidget() {
        if (this._goodsWidgetInstance) {
            this._goodsWidgetInstance.close();
            this._goodsWidgetInstance = null;
        }
    }

    /** @deprecated */
    protected _androidDefaultWindowSoftInputMode: Option<AndroidWindowSoftInputMode> = null;

    /** @deprecated */
    public set androidDefaultWindowSoftInputMode(mode: AndroidWindowSoftInputMode) {
        this._androidDefaultWindowSoftInputMode = mode;
    }

    protected _innerAndroidDefaultWindowSoftInputIntegerMode: Option<number> = null;

    public SharePage = class extends EventEmitter {
        private storyReaderWidget!: Option<_StoryReader>;
        private appearanceManager!: AppearanceManager;
        private options: SharePageOptions = {};

        constructor(
            storyId: number | string,
            appearanceManager: AppearanceManager,
            options?: SharePageOptions,
            ref: string = "default"
        ) {
            super();

            if (options) this.options = options;

            StoryManager.instance
                ._showSharePage(storyId, appearanceManager, this.options, this)
                .then(({ storyReaderInstance, appearanceManager, result }) => {
                    this.storyReaderWidget = storyReaderInstance;
                    this.appearanceManager = appearanceManager;
                });

            return this;
        }

        public async closeStoryReader() {
            if (this.storyReaderWidget) {
                StoryManager.instance.closeGoodsWidget();
                this.storyReaderWidget.closeReader();
            }
        }
    };

    private _showSharePage = async (
        storyId: number | string,
        appearanceManager: AppearanceManager,
        sharePageOptions: SharePageOptions,
        sharePage: SharePage
    ) => {
        setTimeout(() => {
            sharePage.emit(SharePageEvents.START_LOADING);
            if (isFunction(sharePageOptions.handleStartLoad)) sharePageOptions.handleStartLoad();
        });

        let result = false;
        let storyReaderInstance: Option<_StoryReader> = null;
        try {
            await waitForSessionLoad();
            storyReaderInstance = await this.initStoryReader(appearanceManager, getFontResources(), {
                closeOnLastSlideByTimer: false,
                recycleStoriesList: false,
            });

            storyReaderInstance.on("closeStoryReader", (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
                if (
                    isFunction(sharePageOptions.handleStoryReaderClose) ||
                    sharePage.listenerCount(SharePageEvents.CLOSE_STORY_READER) > 0
                ) {
                    // const cbPayload = {src: 'storyReader', srcRef: 'default'};
                    try {
                        if (isFunction(sharePageOptions.handleStoryReaderClose)) {
                            sharePageOptions.handleStoryReaderClose();
                        }
                        sharePage.emit(SharePageEvents.CLOSE_STORY_READER);
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    const isIframe = window.location != window.parent.location;
                    const location = isIframe ? window.parent.location : window.location;
                    // window.location = `${location.protocol}//${location.host}`
                    window.open(`${location.protocol}//${location.host}`, "_parent");
                }
            });

            // show story inner
            result = await _showStory(storyId, storyReaderInstance, this.getDevicePlatform(), this.soundOn);
        } catch (e) {}
        sharePage.emit(SharePageEvents.END_LOADING, { result });
        if (isFunction(sharePageOptions.handleStopLoad)) sharePageOptions.handleStopLoad(result);

        return { storyReaderInstance, appearanceManager, result };
    };

    public get sdkVersionName(): string {
        const sdkVersionName = process.env.SDK_VERSION;
        return sdkVersionName || "0.0.0";
    }

    public get sdkVersionCode(): number {
        const sdkVersionCode = process.env.SDK_VERSION_CODE;
        return sdkVersionCode ? parseInt(sdkVersionCode) : 0;
    }
}
