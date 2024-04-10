// import {createStore, createEffect} from 'effector'

// export const fetchUsersFx = createEffect()
//
// //imagine initially we have users list as a key-value store
// export const $usersMap = createStore({})
//
// //we need array representation for our UI tasks
// export const $users = $usersMap.map(usersMap => Object.values(usersMap))

import { createApi, createEffect, createStore, createEvent } from "effector";
import {
    STORY_FEED_LIST,
    STORY_LIST_TYPE,
    StoryFeedType,
    StoryListUserKey,
} from "../../types";
import { $session } from "../session";
import { StoryManager } from "../../index";
import { isArray } from "../../../helpers/isArray";
import { isEmpty } from "../../../helpers/isEmpty";
import APIInstance from "../../api";

export type StoryModel = {
    id: number;
    string_id: number;
    title: string;
    title_color: string;
    background: string; // img/video
    background_color: string;
    image: string;
    display_to: number;
    display_from: number;
    slides_html: Array<number>; // expand
    slides_duration: Array<number>;
    slides_screenshot_share: Array<number>; // expand
    favorite: boolean;
    like: boolean;
    slides_count: number;
    deeplink: string;
    hide_in_reader: boolean;
    disable_close: boolean;
    like_functional: boolean;
    favorite_functional: boolean;
    share_functional: boolean;
    is_opened: boolean;
    tags: Array<string>;
    has_audio: boolean;
    video_cover: string;
    need_placeholders: boolean;
    has_swipe_up: boolean;
    sharePath: string;
    slides_payload: Array<{
        slide_index: number;
        payload: string;
    }>;
    slidesLoaded: boolean;
};

const $storiesRaw = createStore<Record<StoryListUserKey, Array<StoryModel>>>({
    default: [],
});
const $stories = $storiesRaw.map((stories) => {
    let key = APIInstance.userKey;
    return stories[key] || [];
});

// user(default|any) -> feeds, favorite
export enum StoriesIdsUserEntities {
    FEEDS = "feeds",
    FAVORITE = "favorite",
}
type StoriesIdsEntities = {
    [StoriesIdsUserEntities.FAVORITE]: Array<number>;
    [StoriesIdsUserEntities.FEEDS]: Record<string, Array<number>>;
    // [key in StoriesIdsUserEntities]: Array<number>;
};

// type record
// user(default|any) -> feed(default|onboarding|any) -> listInFeed(list, favorite)
type StoriesIdsRawStore = Record<StoryListUserKey, StoriesIdsEntities>;
const $storiesIdsRaw = createStore<StoriesIdsRawStore>({
    default: {
        [StoriesIdsUserEntities.FEEDS]: {},
        [StoriesIdsUserEntities.FAVORITE]: [],
    },
});

// feed(default|onboarding|any) -> listInFeed(list, favorite)
const $storiesIds = $storiesIdsRaw.map((storiesIdsRaw) => {
    let key = APIInstance.userKey;
    return storiesIdsRaw[key] || {};
});

// todo Record
const $storiesFeeds = createStore<Record<StoryFeedType, Array<StoryModel>>>({});
const $storiesOnboardingFeeds = createStore<
    Record<StoryFeedType, Array<StoryModel>>
>({});
const $storiesFavorite = createStore<Array<StoryModel>>([]);

// feed -> listInFeed -> Array<Story>
$storiesFeeds.on<any>([$storiesIds, $stories], (state, ids) => {
    // get state - use from reducer

    const feedsStoriesIds = $storiesIds.getState();
    const feeds: Record<StoryFeedType, Array<StoryModel>> = {};
    const stories = $stories.getState();

    for (const feedSlug in feedsStoriesIds[StoriesIdsUserEntities.FEEDS]) {
        feeds[feedSlug] = [];

        if (
            feedsStoriesIds[StoriesIdsUserEntities.FEEDS][feedSlug] &&
            Array.isArray(
                feedsStoriesIds[StoriesIdsUserEntities.FEEDS][feedSlug]
            )
        ) {
            const ids = feedsStoriesIds[StoriesIdsUserEntities.FEEDS][feedSlug];
            for (const id of ids) {
                const story = stories.find((model) => model.id === id);
                if (story) {
                    feeds[feedSlug].push(story);
                }
            }
        }
    }

    return feeds;
});

// width filter by ```is_opened```
// feed -> listInFeed -> Array<Story>
$storiesOnboardingFeeds.on<any>([$storiesIds, $stories], (state, ids) => {
    const feedsStoriesIds = $storiesIds.getState();
    const feeds: Record<StoryFeedType, Array<StoryModel>> = {};
    const stories = $stories.getState();

    for (const feedSlug in feedsStoriesIds[StoriesIdsUserEntities.FEEDS]) {
        if (feedSlug.substring(0, "onboarding_".length) === "onboarding_") {
            const cleanFeedSlug = feedSlug.substring("onboarding_".length);
            feeds[cleanFeedSlug] = [];
            if (
                feedsStoriesIds[StoriesIdsUserEntities.FEEDS][feedSlug] &&
                Array.isArray(
                    feedsStoriesIds[StoriesIdsUserEntities.FEEDS][feedSlug]
                )
            ) {
                feeds[cleanFeedSlug] = stories.filter(
                    (item) =>
                        feedsStoriesIds[StoriesIdsUserEntities.FEEDS][
                            feedSlug
                        ].indexOf(item.id) !== -1 && !item.is_opened
                );
            }
        }
    }

    return feeds;
});

$storiesFavorite.on<any>([$storiesIds, $stories], (state, ids) => {
    const feedsStoriesIds = $storiesIds.getState();
    const stories = $stories.getState();

    return stories.filter(
        (item) =>
            feedsStoriesIds[StoriesIdsUserEntities.FAVORITE]?.indexOf(
                item.id
            ) !== -1
    );
});

const fetchStoriesFx = createEffect<
    { listType: STORY_LIST_TYPE },
    Array<StoryModel>,
    Error
>();

// localData isOpened
// $stories.on(fetchStoriesFx.doneData, (_, stories: Array<StoryModel>) => stories);

const storyCheckLocalIsOpened = (story: StoryModel, userKey: string = "") => {
    if (story.is_opened) {
        return story.is_opened;
    }
    // const key = `u/${$session.getState().user_key}/s_opened` || userKey;

    // TODO async
    /*  if (!isEmpty(key)) {
    let data = await StoryManager.getInstance().localStorageGetArray<number>(key);
    if (!isArray(data)) {
      data = [];
    }
    if (data.indexOf(story.id) !== -1) {
      return true;
    }
  }*/
    return story.is_opened;
};

// const configChanged = createEvent<WidgetStoriesConfig>();
// forward({
//     from: configChanged,
//     to: $config
// });
//
// $stories.watch(s => console.log(`$stories.watch}`, s));
// $storiesIds.watch(s => console.log(`$storiesIds.watch}`, s));
// $storiesDefault.watch(s => console.log(`$storiesDefault.watch}`, s));
// $storiesFavorite.watch(s => console.log(`$storiesFavorite.watch}`, s));
// $storiesOnboarding.watch(s => console.log(`$storiesOnboarding.watch}`, s));

const $storiesIdsWithoutLoadedSlides = $stories.map((items) =>
    items.filter((item) => !item.slidesLoaded).map((item) => item.id)
);

const has = Object.prototype.hasOwnProperty;

const {
    storyItemFavoriteChanged,
    storyItemLikeChanged,
    storyItemIsOpenedChanged,
} = createApi($storiesRaw, {
    storyItemFavoriteChanged: (state, { id, favorite }) => {
        const userKey = APIInstance.userKey;
        const models = (state[userKey] || []).slice(0);

        const story = models.find((_) => _.id === id);
        if (story !== undefined) {
            story.favorite = favorite;
        }
        return { ...state, [userKey]: models };
    },
    storyItemLikeChanged: (state, { id, like }) => {
        const userKey = APIInstance.userKey;
        const models = (state[userKey] || []).slice(0);
        const story = models.find((_) => _.id === id);
        if (story !== undefined) {
            story.like = like;
        }
        return { ...state, [userKey]: models };
    },
    storyItemIsOpenedChanged: (state, { id }) => {
        const userKey = APIInstance.userKey;
        const models = (state[userKey] || []).slice(0);
        const story = models.find((_) => _.id === id);
        if (story !== undefined) {
            story.is_opened = true;
        }
        return { ...state, [userKey]: models };
    },
});

// const {storyFavoriteAdded, storyFavoriteDeleted} = createApi($storiesFavorite, {
//     storyFavoriteAdded: (state, story: StoryModel) => state.concat([story]),
//     storyFavoriteDeleted: (state, story: StoryModel) => state.filter(item => item.id !== story.id),
//   }
// );

export {
    $stories,
    $storiesIds,
    $storiesIdsRaw,
    $storiesRaw,
    fetchStoriesFx,
    $storiesIdsWithoutLoadedSlides,
    $storiesOnboardingFeeds,
    $storiesFeeds,
    $storiesFavorite,
    storyItemFavoriteChanged,
    storyItemLikeChanged,
    storyItemIsOpenedChanged,
    storyCheckLocalIsOpened,
};
