import { Dict, Option } from "../../global.h";

export type StoryManagerConfig = {
    apiKey: string;
    userId?: Option<string | number>;
    tags?: Option<Array<string>>;
    placeholders?: Option<Dict<string>>;
    lang?: Option<"ru" | "en">;
    defaultMuted?: boolean;
};

const StoryManagerConfigDefault: StoryManagerConfig = {
    apiKey: "",
};

export type DeviceInformation = {
    sdkVersion: string;
    applicationBundleId: string;
    deviceId: string;
    applicationVersion: string;
    applicationVersionCode: string;
    userAgent: string;
};

export { StoryManagerConfigDefault };

export enum AndroidWindowSoftInputMode {
    AdjustNothing = "AdjustNothing",
    AdjustPan = "AdjustPan",
    AdjustResize = "AdjustResize",
    AdjustUnspecified = "AdjustUnspecified",
    AlwaysHidden = "AlwaysHidden",
    AlwaysVisible = "AlwaysVisible",
    Visible = "Visible",
    Hidden = "Hidden",
    Unchanged = "Unchanged",
}

export enum CTASource {
    STORY_LIST = "storyList",
    STORY_READER = "storyReader",
    GAME_READER = "gameReader",
}

export type CTAGameReaderPayload = { url: string; gameInstanceId: string };
export type CTAStoryReaderPayload = {
    id: number;
    index: number;
    url: string;
    elementId: string;
};
export type CTAStoryListPayload = {
    id: number;
    index: number;
    isDeeplink: boolean;
    url: string | undefined;
};
