import { StoryManager as AbstractStoryManager } from "../story-manager";
import { IWidgetStoriesList } from "../widget-stories-list";
import { WidgetStoriesList } from "../widget-stories-list/rn";
import { Dict, Option } from "../../global.h";
import { AppearanceManager } from "../story-manager/AppearanceManager";
import * as DeviceInfo from "react-native-device-info";
import { ISessionInitData } from "../story-manager/models/Session2";
import { DeviceId } from "../story-manager/models/storyManagerConfig/index.h";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IWidgetStoryReader } from "../widget-story-reader";
import { WidgetStoryReader } from "../widget-story-reader/rn";
import { CacheResourceModel } from "../story-manager/models/session";
import { StoryReaderOptions } from "../widget-story-reader/index.h";
import {
    ClickOnButtonPayload,
    ClickOnFavoriteCellInternalPayload,
    ClickOnStoryInternalPayload,
    StoriesEvents,
    STORY_READER_WINDOW_REFERER,
} from "../story-manager/common.h";
import { InteractionManager, Linking, StatusBar } from "react-native";
import { DeviceInformation, StoryManagerConfig } from "../story-manager/index.h";
import { isFunction } from "../helpers/isFunction";
import { IWidgetStoryFavoriteReader } from "../widget-story-favorite-reader";
import { WidgetStoryFavoriteReader } from "../widget-story-favorite-reader/rn";

import * as AndroidKeyboardAdjust from "rn-android-keyboard-adjust";
import { ListLoadStatus } from "../widget-stories-list/index.h";

export class StoryManager extends AbstractStoryManager {
    constructor(config: StoryManagerConfig, callbacks?: Dict<Function>) {
        super(config, callbacks);

        // hide status bar before reader opened
        this.on("openStoryReader", (payload: ClickOnStoryInternalPayload) => {
            StatusBar.setHidden(true);

            if (this.getDevicePlatform() === "android") {
                AndroidKeyboardAdjust.getSoftInputMode((softInputMode) => {
                    this._innerAndroidDefaultWindowSoftInputIntegerMode = softInputMode;

                    AndroidKeyboardAdjust.setAdjustNothing();
                });
            }

            // gesteure back
        });

        // hide status bar before favorite reader opened
        this.on("openStoryFavoriteReader", (payload: ClickOnFavoriteCellInternalPayload) => {
            StatusBar.setHidden(true);
        });
    }

    createWidgetStoriesList(
        appearanceManager: AppearanceManager,
        feedSlug?: string,
        testKey?: string
    ): { widget: IWidgetStoriesList; widgetLoadedPromise: Promise<void> } {
        const widget = new WidgetStoriesList(this, appearanceManager, feedSlug, testKey);

        this.appearanceManager = appearanceManager;

        const widgetLoadedPromise = new Promise<void>((resolve, reject) => {
            widget.on("widgetLoaded", () => {
                this._storiesListWidgetLoaded(widget, appearanceManager);
                resolve();
            });
        });

        return { widget, widgetLoadedPromise };
    }

    // Load data - for call from React component (without await for WebView load done)
    loadStoriesListData(
        storyListWidget: IWidgetStoriesList,
        appearanceManager: AppearanceManager
    ): Promise<ListLoadStatus> {
        return this._loadStoriesListData(storyListWidget, appearanceManager);
    }

    createWidgetStoryReader(
        setNeedFirstRender: (value: boolean) => void,
        setNeedLoaderRender: (value: boolean) => void,
        detachComponent: (widget: IWidgetStoryReader) => void
    ): IWidgetStoryReader {
        const widget = new WidgetStoryReader(() => this.appearanceManager);

        this.storyReaderNeedFirstRender = setNeedFirstRender;
        this.storyReaderNeedLoaderRender = setNeedLoaderRender;
        this.storyReaderDetachComponent = detachComponent;

        widget.on("widgetLoaded", () => {
            this._storyReaderWidgetLoaded(widget);
        });

        return widget;
    }

    createWidgetStoryFavoriteReader(
        setNeedFirstRender: (value: boolean) => void,
        setNeedLoaderRender: (value: boolean) => void,
        detachComponent: (widget: IWidgetStoryFavoriteReader) => void
    ): IWidgetStoryFavoriteReader {
        const widget = new WidgetStoryFavoriteReader(() => this.appearanceManager);

        this.storyFavoriteReaderNeedFirstRender = setNeedFirstRender;
        this.storyFavoriteReaderNeedLoaderRender = setNeedLoaderRender;
        this.storyFavoriteReaderDetachComponent = detachComponent;

        widget.on("widgetLoaded", () => {
            this._storyFavoriteReaderWidgetLoaded(widget);
        });

        return widget;
    }

    getDeviceInfo(configDeviceIdChanged: (device_id: DeviceId) => void): Promise<ISessionInitData> {
        return new Promise<ISessionInitData>(async (resolve) => {
            // DeviceInfo before v10.0.0 return string, v10.0.0+ return Promise<string>
            const uuid: Promise<string> = Promise.resolve(DeviceInfo.getUniqueId());

            // currently without cache to localStorage
            const data: ISessionInitData = {
                device_id: await uuid,
                platform: this.getDevicePlatform(),
                // todo - platform values from enum
            };

            resolve(data);
        });
    }

    getDevicePlatform(): "android" | "ios" | "unknown" {
        return DeviceInfo.getSystemName() === "Android" ? "android" : "ios";
    }

    getDeviceInformation(): Promise<DeviceInformation> {
        return new Promise(async (resolve, reject) => {
            const data: DeviceInformation = {
                sdkVersion: "",
                applicationBundleId: "",
                deviceId: "",
                applicationVersion: "",
                applicationVersionCode: "",
                userAgent: "",
            };

            const sdkVersion = process.env.SDK_VERSION;
            const sdkVersionCode = process.env.SDK_VERSION_CODE;

            // userAgent = "InAppStorySDK/" + BuildConfig.VERSION_CODE
            //     + " " + System.getProperty("http.agent") + " " + " Application/" + appVersion + " (" + appPackageName + " " + appVersionName + ")";

            // InAppStorySDK/115 Dalvik/2.1.0 (Linux; U; Android 8.0.0; Android SDK built for x86 Build/OSR1.180418.026)  Application/1 (com.inappstory.sdk.demo 1.0)

            // DeviceInfo before v10.0.0 return string, v10.0.0+ return Promise<string>
            const uuid: Promise<string> = Promise.resolve(DeviceInfo.getUniqueId());

            data.sdkVersion = sdkVersion as string;
            data.applicationBundleId = DeviceInfo.getBundleId();
            data.deviceId = await uuid;
            data.applicationVersion = DeviceInfo.getVersion();
            data.applicationVersionCode = DeviceInfo.getBuildNumber();

            DeviceInfo.getUserAgent().then((userAgent) => {
                data.userAgent = `InAppStoryRNSDK/${sdkVersionCode} ${userAgent} Application/${data.applicationVersionCode} (${data.applicationBundleId} ${data.applicationVersion})`;
                resolve(data);
            });
        });

        // deviceId
        // let uniqueId = DeviceInfo.getUniqueId();
        // iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
        // Android: "dd96dec43fb81c97"

        // getVersion()
        // Gets the application version. Take into account that a version string is device/OS formatted and can contains any additional data (such as build number etc.). If you want to be sure about version format, you can use a regular expression to get the desired portion of the returned version string.
        //
        //     Examples
        // let version = DeviceInfo.getVersion();

        // iOS: "1.0"
        // Android: "1.0" or "1.0.2-alpha.12"

        // DeviceInfo.getUserAgent().then((userAgent) => {
        //     // iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143"
        //     // tvOS: not available
        //     // Android: ?
        //     // Windows: ?
        // });

        // "X-Sdk-Version": sdkVersion,
        //     "X-App-Package-Id": "com.inappstory.ios",
        //     "X-User-Agent": `InAppStoryRNSDK/${sdkVersion} ${navigator.userAgent}`
    }

    async localStorageGet<T extends object>(key: string): Promise<Option<T>> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async localStorageSet<T extends object>(key: string, data: T): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
            return;
        } catch (e) {
            console.error(e);
            return;
        }
    }

    async localStorageGetArray<T extends any>(key: string): Promise<Option<Array<T>>> {
        return this.localStorageGet(key);
    }

    async localStorageSetArray(key: string, data: Array<any>): Promise<void> {
        return this.localStorageSet(key, data);
    }

    protected defaultLinking(url?: string) {
        if (url) {
            Linking.openURL(url);
        }
    }

    protected completeInitStoryReader(
        storyReaderInstance: IWidgetStoryReader /*, appearanceManager: AppearanceManager*/,
        fonts: Array<CacheResourceModel>,
        overrideStoryReaderOptions: Pick<StoryReaderOptions, "recycleStoriesList" | "closeOnLastSlideByTimer"> = {}
    ) {
        // storyReaderInstance.on('openedStoryReader', (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
        //     StatusBar.setHidden(true);
        // });

        // storyReaderInstance.on('closeStoryReader', (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
        //     StatusBar.setHidden(false);
        // });

        storyReaderInstance.on("closeStoryReader", (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
            InteractionManager.runAfterInteractions(() => {
                // ...long-running synchronous task...

                if (this.getDevicePlatform() === "android") {
                    if (
                        this._androidDefaultWindowSoftInputMode != null &&
                        AndroidKeyboardAdjust[`set${this._androidDefaultWindowSoftInputMode}`] != null
                    ) {
                        AndroidKeyboardAdjust[`set${this._androidDefaultWindowSoftInputMode}`]();
                    } else if (this._innerAndroidDefaultWindowSoftInputIntegerMode != null) {
                        AndroidKeyboardAdjust.setSoftInputMode(this._innerAndroidDefaultWindowSoftInputIntegerMode);
                    }
                }
            });

            // skip StatusBar (set visible) for STORY_READER_WINDOW_REFERER.favorite
            if (options.windowReferer === STORY_READER_WINDOW_REFERER.favorite) {
                return;
            }

            // set StatusBar visible for other cases
            InteractionManager.runAfterInteractions(() => {
                // ...long-running synchronous task...
                StatusBar.setHidden(false);
            });
        });

        // add closed

        return super.completeInitStoryReader(storyReaderInstance, fonts, overrideStoryReaderOptions);
    }

    protected completeInitStoryFavoriteReader(
        storyFavoriteReaderInstance: IWidgetStoryFavoriteReader,
        fonts: Array<CacheResourceModel>
    ): IWidgetStoryFavoriteReader {
        storyFavoriteReaderInstance.on(
            "closeStoryFavoriteReader",
            (options: { windowReferer: STORY_READER_WINDOW_REFERER }) => {
                // set StatusBar visible
                InteractionManager.runAfterInteractions(() => {
                    // ...long-running synchronous task...
                    StatusBar.setHidden(false);
                });
            }
        );

        return super.completeInitStoryFavoriteReader(storyFavoriteReaderInstance, fonts);
    }

    // back gesture
    // set network additional timeout
}
