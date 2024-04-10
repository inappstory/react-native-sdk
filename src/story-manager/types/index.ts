import {MutationPayload} from "vuex";

import {StoryContextModel} from "~/src/storyManager/models/storyContext";
import {StoryModel} from "~/src/storyManager/models/story";

export type Url = Brand<string, "url">;

export type ClickOnStoryInternalPayload = {
    id: number;
    listType: STORY_LIST_TYPE;
    windowReferer: STORY_READER_WINDOW_REFERER
};
export type ClickOnStoryInternalWithDataPayload = ClickOnStoryInternalPayload & {
  storyContext: StoryContextModel,
  storyList: Array<StoryModel>,
};



export type ClickOnButtonPayload = {
    id: number;
    index: number;
    url: Url;
    elementId: string;
};

export type ClickOnStoryPayload = ClickOnButtonPayload & {
    isDeeplink: boolean;
};

export type ClickOnFavoriteCellInternalPayload = {
    id: number;
  storyList: Array<StoryModel>;
  listType: STORY_LIST_TYPE;
};

export type SyncStoreEvent = {
    mutation: MutationPayload;
};

export enum STORY_READER_WINDOW_REFERER {
    default,
    favorite
}

export type FontResource = {
  type: 'font-face',
  weight: string,
  style: string,
  title: string,
  family: string,
  url: string,
};

export enum STORY_LIST_TYPE {
    default,
    onboarding,
    favorite,
    direct,
}

export enum STORY_FEED_LIST {
    list = "list",
    favorite = "favorite"
}

export type StoryFeedType = "default" | "onboarding" | string;
export type StoryListUserKey = "default" | string;

export interface IData {
  [key: string]: any;
}

export type Optional<T> = T | null;

export type Dict<T = any> = {
  [key: string]: T;
}


export enum StoriesEvents {
  CLICK_ON_STORY = 'clickOnStoryLink',
}

export type ClickOnSwipeUpPayload = ClickOnButtonPayload & {
  modeDesktop: boolean;
  width: number;
  height: number;
  verticalMargin: number;
};