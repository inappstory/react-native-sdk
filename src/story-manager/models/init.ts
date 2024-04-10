import "./storyManagerConfig/init";
import "./session/init";
import "./story/init";

import API, { ApiRequestConfig } from "./../api";
import { createApi, createEffect, Event, forward, sample } from "effector";
import { $session, SessionModel } from "./session";
import { getRequestConfig as sessionGetRequestConfig } from "./session/init";
import { getRequestConfig as storyContextGetRequestConfig } from "./storyContext/init";
import {
    getFavoriteListRequestConfig,
    getFeedRequestConfig,
    getOnboardingRequestConfig,
    storySlidesGetRequestConfig,
} from "./story/init";
import { $storiesIdsRaw, $storiesRaw, StoriesIdsUserEntities, storyCheckLocalIsOpened, StoryModel } from "./story";
import { $storyContext, StoryContextModel } from "./storyContext";
import { replaceAll } from "../../stories_widget/util/string";
import { $placeholders, addDefaultPlaceholders } from "./placeholder";
import { STORY_LIST_TYPE, StoryListUserKey } from "../types";
import { Option, Dict } from "../../../global.h";
import { isEmpty } from "../../helpers/isEmpty";
import { isObject } from "../../helpers/isObject";
import { isString } from "../../helpers/isString";
import { isNumber } from "../../helpers/isNumber";
import APIInstance from "./../api";

// TODO перед обработкой сторис из апи - запросить асинхронно storyCheckLocalIsOpened

type CompositeResponseData<T = Dict> = {
    success: boolean;
    compositeResponse: Array<{
        ref: string;
        body: T;
        status: number;
    }>;
};

const fetchSessionAndStoriesCompositeFx = createEffect<
    {
        defaultList: boolean | string;
        favoriteList: boolean;
        onboardingList: boolean | string;
        onboardingTags?: Array<string>;
        testKey?: Option<string>;
        limit?: Option<number>;
    },
    Array<Dict>,
    {
        name: string;
        networkStatus: Option<number>;
        networkMessage: Option<string>;
    }
>(async ({ defaultList, onboardingList, favoriteList, onboardingTags, testKey, limit }): Promise<Array<Dict>> => {
    // TODO custom tags for each list requests

    const compositeRequest: Array<CompositeSubRequestData> = [];

    const sessionId = $session.getState()?.session?.id;
    let compositeSessionIdRef: Option<string> = null;
    if (isEmpty(sessionId)) {
        compositeRequest.push(getCompositeSubRequestDataFromRequestConfig(await sessionGetRequestConfig(), "session"));
        compositeSessionIdRef = "@{session.session.id}";
    }

    if (defaultList !== false && isString(defaultList)) {
        compositeRequest.push(
            getCompositeSubRequestDataFromRequestConfig(
                getFeedRequestConfig(defaultList as string, compositeSessionIdRef, [], testKey),
                `storyList_${defaultList}`
            )
        );
    }

    if (favoriteList) {
        compositeRequest.push(
            getCompositeSubRequestDataFromRequestConfig(
                getFavoriteListRequestConfig(compositeSessionIdRef),
                "storyFavoriteList"
            )
        );
    }

    if (onboardingList !== false && isString(onboardingList) && typeof onboardingList === "string") {
        compositeRequest.push(
            getCompositeSubRequestDataFromRequestConfig(
                getOnboardingRequestConfig(onboardingList, compositeSessionIdRef, onboardingTags, limit),
                `storyOnboardingList_${onboardingList}`
            )
        );
    }

    let effectError: Option<{
        name: string;
        networkStatus: Option<number>;
        networkMessage: Option<string>;
    }> = null;
    try {
        const response = await API.post<CompositeResponseData<Array<StoryModel>>>("composite", { compositeRequest });

        if (response.status >= 200 && response.status <= 299) {
            if (response.data && response.data.compositeResponse && Array.isArray(response.data.compositeResponse)) {
                if (response.data.success) {
                    return response.data.compositeResponse;
                } else {
                    for (const compositeResponseElement of response.data.compositeResponse) {
                        const status = compositeResponseElement.status;
                        if (isNumber(status) && !(status >= 200 && status <= 299)) {
                            effectError = {
                                name: "networkError",
                                networkStatus: status,
                                networkMessage: String(compositeResponseElement.body),
                            };
                            break;
                        }
                    }
                }
            } else {
                // @ts-ignore
                if (
                    response.data &&
                    isObject(response.data) &&
                    response.data.name != null &&
                    response.data.message != null &&
                    response.data.status != null
                ) {
                    effectError = {
                        // @ts-ignore
                        name: response.data.name,
                        // @ts-ignore
                        networkStatus: response.data.status,
                        // @ts-ignore
                        networkMessage: response.data.message,
                    };
                } else {
                    effectError = {
                        name: "networkError",
                        networkStatus: null,
                        networkMessage:
                            "Invalid data in API response, data from response as json: " +
                            JSON.stringify(response.data),
                    };
                }
            }
        } else {
            // @ts-ignore
            if (
                response.data &&
                isObject(response.data) &&
                response.data.name != null &&
                response.data.message != null &&
                response.data.status != null
            ) {
                effectError = {
                    // @ts-ignore
                    name: response.data.name,
                    // @ts-ignore
                    networkStatus: response.data.status,
                    // @ts-ignore
                    networkMessage: response.data.message,
                };
            } else {
                effectError = {
                    name: "networkError",
                    networkStatus: response.status,
                    networkMessage:
                        "Invalid data in API response, data from response as json: " + JSON.stringify(response.data),
                };
            }
        }
    } catch (e: any) {
        try {
            const error = e;
            if (error.response && error.response.status) {
                effectError = {
                    name: "networkError",
                    networkStatus: error.response.status,
                    networkMessage: error.response.statusText,
                };
            } else {
                let networkStatus = "";
                if (window.navigator && window.navigator.onLine != null) {
                    networkStatus = " net::ERR_INTERNET_DISCONNECTED";
                }
                effectError = {
                    name: "error",
                    networkStatus: null,
                    networkMessage: e.toString() + networkStatus,
                };
                console.error(e);
            }
        } catch (e: any) {
            effectError = {
                name: "error",
                networkStatus: null,
                networkMessage: e.toString(),
            };
        }
    }

    if (effectError !== null) {
        throw effectError;
    }

    return [];
});

// $session.on(fetchSessionFx.doneData, (_, session: Dict) => session);

// const configChanged = createEvent<WidgetStoriesConfig>();
// forward({
//     from: configChanged,
//     to: $config
// });
//

// forward({
//     from: fetchSessionFx.doneData,
//     to: $session
// });

type CompositeSubRequestData = Pick<ApiRequestConfig, "method"> & {
    path?: string;
    qs?: Option<Dict>;
    body?: Option<Dict>;
    ref: string;
};

const getCompositeSubRequestDataFromRequestConfig = (
    config: ApiRequestConfig,
    ref: string
): CompositeSubRequestData => {
    const requestData: CompositeSubRequestData = {
        path: config.url,
        qs: config.params,
        body: config.data,
        ref,
        method: config.method,
    };
    return requestData;
};

const has = Object.prototype.hasOwnProperty;

const replacePlaceholders = (value: string): string => {
    const placeholders = $placeholders.getState();

    for (let key in placeholders.user) {
        if (has.call(placeholders.user, key)) {
            value = replaceAll(value, `%${key}%`, placeholders.user[key]);
        }
    }

    for (let key in placeholders.default) {
        if (has.call(placeholders.default, key)) {
            value = replaceAll(value, `%${key}%`, placeholders.default[key]);
        }
    }
    return value;
};

const processStories = (list: Array<StoryModel> | undefined) =>
    Array.isArray(list)
        ? list.map(
              (item) =>
                  ({
                      ...item,
                      title: item.need_placeholders ? replacePlaceholders(item.title) : item.title,
                      slidesLoaded: false,
                      is_opened: storyCheckLocalIsOpened(item),
                  } as StoryModel)
          )
        : [];

// продумать как проверять наличие полей в моделях
forward({
    from: fetchSessionAndStoriesCompositeFx.doneData.filterMap(
        (list) => list.find((item) => item.ref === "session")?.body
    ),
    to: $session,
});

// default placeholders
forward({
    from: fetchSessionAndStoriesCompositeFx.doneData.filterMap(
        (list) => list.find((item) => item.ref === "session")?.body?.placeholders
    ),
    to: addDefaultPlaceholders,
});

// при изменениях в сессии - обновляем поля в моделях сторис
// placeholders for title and every user
sample({
    source: $storiesRaw,
    clock: $session,
    fn: (source, clock) => {
        const result: Record<StoryListUserKey, Array<StoryModel>> = {};
        for (const key in source) {
            if (has.call(source, key)) {
                result[key] = source[key].map((item) => ({
                    ...item,
                    is_opened: storyCheckLocalIsOpened(item, clock.user_key),
                    title: item.need_placeholders ? replacePlaceholders(item.title) : item.title,
                }));
            }
        }
        return result;
    },
    target: $storiesRaw,
});

type StoriesListChangedEvent = {
    storiesIdsUserEntity: StoriesIdsUserEntities;
    feedSlug: Option<string>;
    storyList: Array<StoryModel>;
};

const storyModelMerge = (lhs: StoryModel, rhs: StoryModel): StoryModel => {
    if (lhs.slidesLoaded) {
        return { ...rhs, ...lhs };
    } else {
        return { ...lhs, ...rhs };
    }
};

const { storiesListItemsAdded } = createApi($storiesRaw, {
    storiesListItemsAdded: (state, { storiesIdsUserEntity, feedSlug, storyList }: StoriesListChangedEvent) => {
        let key = APIInstance.userKey;

        const _state = state[key] || [];
        const ids = _state.map((_) => _.id);

        const list: Array<StoryModel> = [];
        for (const story of _state) {
            const newModel = storyList.find((model) => model.id === story.id);
            if (newModel != null) {
                list.push(storyModelMerge(story, newModel));
            } else {
                list.push(story);
            }
        }

        return {
            ...state,
            [key]: [...list, ...storyList.filter((item) => ids.indexOf(item.id) === -1)],
        };
        // return {...state, [key]: storyList};
    },
});

const { storiesListIdsChanged } = createApi($storiesIdsRaw, {
    storiesListIdsChanged: (state, { storiesIdsUserEntity, feedSlug, storyList }: StoriesListChangedEvent) => {
        let key = APIInstance.userKey;
        const entities = state[key] || {};
        if (entities[StoriesIdsUserEntities.FAVORITE] === undefined) {
            entities[StoriesIdsUserEntities.FAVORITE] = [];
        }
        if (entities[StoriesIdsUserEntities.FEEDS] === undefined) {
            entities[StoriesIdsUserEntities.FEEDS] = {};
        }

        if (storiesIdsUserEntity === StoriesIdsUserEntities.FEEDS && feedSlug) {
            entities[StoriesIdsUserEntities.FEEDS][feedSlug] = storyList.map((item) => item.id);

            // console.log({storiesIdsUserEntity, feedSlug, entities})
        }

        if (storiesIdsUserEntity === StoriesIdsUserEntities.FAVORITE) {
            entities[StoriesIdsUserEntities.FAVORITE] = storyList.map((item) => item.id);
        }

        // console.log("changed", JSON.stringify({...state, [key]: entities}))

        return { ...state, [key]: entities };
    },
});

forward({
    from: fetchSessionAndStoriesCompositeFx.doneData.filterMap((list) => {
        let data: Option<StoriesListChangedEvent> = null;

        for (const listElement of list) {
            if (listElement.ref && isString(listElement.ref)) {
                const match = listElement.ref.match(/^storyList_(.+)/);

                if (match && Array.isArray(match) && match[1]) {
                    // body: hasFavorite: boolean, stories: []

                    const storyList = processStories(listElement.body?.stories);
                    data = {
                        storiesIdsUserEntity: StoriesIdsUserEntities.FEEDS,
                        feedSlug: match[1],
                        storyList,
                    };
                }
            }
        }

        if (!data) {
            return undefined;
        }
        return data;
    }),
    to: [storiesListItemsAdded, storiesListIdsChanged],
});

forward({
    from: fetchSessionAndStoriesCompositeFx.doneData.filterMap((list) => {
        const response = list.find((item) => item.ref === "storyFavoriteList");
        if (response === undefined) {
            return undefined;
        }
        const storyList = processStories(response.body);
        return {
            storiesIdsUserEntity: StoriesIdsUserEntities.FAVORITE,
            feedSlug: null,
            storyList,
        };
    }),
    to: [storiesListItemsAdded, storiesListIdsChanged],
});

forward({
    from: fetchSessionAndStoriesCompositeFx.doneData.filterMap((list) => {
        let data: Option<StoriesListChangedEvent> = null;

        for (const listElement of list) {
            if (listElement.ref && isString(listElement.ref)) {
                const match = listElement.ref.match(/^storyOnboardingList_(.+)/);

                if (match && Array.isArray(match) && match[1]) {
                    // body: hasFavorite: boolean, stories: []

                    const storyList = processStories(listElement.body?.stories);
                    data = {
                        storiesIdsUserEntity: StoriesIdsUserEntities.FEEDS,
                        feedSlug: `onboarding_${match[1]}`,
                        storyList,
                    };
                }
            }
        }

        if (!data) {
            return undefined;
        }
        return data;
    }),
    to: [storiesListItemsAdded, storiesListIdsChanged],
});

const fetchStoriesSlidesCompositeFx = createEffect<{ ids: Array<number> }, Array<{ body: StoryModel }>, Error>();

fetchStoriesSlidesCompositeFx.use(async (params): Promise<Array<{ body: StoryModel }>> => {
    const compositeRequest = params.ids.map((id) =>
        getCompositeSubRequestDataFromRequestConfig(storySlidesGetRequestConfig(id), `storySlides_${id}`)
    );

    // todo try catch
    const response = await API.post<CompositeResponseData<StoryModel>>("composite", { compositeRequest });

    // console.log({data: response.data}, response.data.compositeResponse[0]);

    if (
        response.data &&
        response.data.success &&
        response.data.compositeResponse &&
        Array.isArray(response.data.compositeResponse)
    ) {
        return response.data.compositeResponse;
    }
    return [];
});

const isStoryModel = (x: any): x is StoryModel => x && isObject(x) && "id" in x;
const storySlidesReducer = (
    state: Record<StoryListUserKey, Array<StoryModel>>,
    data: Array<{ body: StoryModel | StoryContextModel }>
): Record<StoryListUserKey, Array<StoryModel>> => {
    if (Array.isArray(data)) {
        const userKey = APIInstance.userKey;
        const models = (state[userKey] || []).slice(0);
        const newModels = models.map((item) => {
            for (let i = 0; i < data.length; i++) {
                // @ts-ignore
                if (isStoryModel(data[i]?.body) && data[i]?.body?.id === item.id) {
                    return Object.assign({}, item, {
                        // @ts-ignore
                        slides_html: item.need_placeholders
                            ? Array.from(data[i]?.body?.slides_html).map((item) => replacePlaceholders(item))
                            : Array.from(data[i]?.body?.slides_html),
                        // @ts-ignore
                        slides_duration: data[i]?.body?.slides_duration,
                        // @ts-ignore
                        slides_screenshot_share: data[i]?.body?.slides_screenshot_share,
                        slidesLoaded: true,
                        is_opened: storyCheckLocalIsOpened(item),
                    });
                }
            }
            return item;
        });

        return { ...state, [userKey]: newModels };
    }
    return state;
};

const fetchStoriesContextAndStorySlidesCompositeFx = createEffect<
    { ids: Array<number>; id: number },
    Array<{ ref: string; body: StoryModel | StoryContextModel }>,
    Error
>();
fetchStoriesContextAndStorySlidesCompositeFx.use(
    async ({ ids, id }): Promise<Array<{ ref: string; body: StoryModel | StoryContextModel }>> => {
        const compositeRequest = [
            getCompositeSubRequestDataFromRequestConfig(storySlidesGetRequestConfig(id), "storySlides"),
            getCompositeSubRequestDataFromRequestConfig(storyContextGetRequestConfig(ids), "storyContext"),
        ];

        // todo try catch
        const response = await API.post<CompositeResponseData<StoryModel | StoryContextModel>>("composite", {
            compositeRequest,
        });

        // console.log({data: response.data});

        if (
            response.data &&
            response.data.success &&
            response.data.compositeResponse &&
            Array.isArray(response.data.compositeResponse)
        ) {
            return response.data.compositeResponse;
        }
        return [];
    }
);

// slides
// $storiesRaw - with many users
$storiesRaw.on<any>(
    [fetchStoriesSlidesCompositeFx.doneData, fetchStoriesContextAndStorySlidesCompositeFx.doneData],
    storySlidesReducer
);

forward({
    from: fetchStoriesContextAndStorySlidesCompositeFx.done.filterMap((list) => {
        const context = list.result.find((item) => item.ref === "storyContext")?.body;
        if (context && isObject(context)) {
            return { ...context, ids: list.params.ids };
        }
        return undefined;
    }) as Event<Option<StoryContextModel>>,
    to: $storyContext,
});

// context and slides composite

// split({
//     source: fetchSessionAndStoriesCompositeFx,
//     match: {
//         session:
//     }
//
// });

/**
 * For load session, context, slides
 */
const fetchSessionAndStoryDataCompositeFx = createEffect<
    { id: number | string },
    Array<{ ref: string; body: SessionModel | StoryModel | StoryContextModel }>,
    Error
>(
    async ({
        id,
    }): Promise<
        Array<{
            ref: string;
            body: SessionModel | StoryModel | StoryContextModel;
        }>
    > => {
        const compositeRequest: Array<CompositeSubRequestData> = [];

        const sessionId = $session.getState()?.session?.id;
        let compositeSessionIdRef: Option<string> = null;
        if (isEmpty(sessionId)) {
            compositeRequest.push(
                getCompositeSubRequestDataFromRequestConfig(await sessionGetRequestConfig(), "session")
            );
            compositeSessionIdRef = "@{session.session.id}";
        }

        compositeRequest.push(
            getCompositeSubRequestDataFromRequestConfig(
                storySlidesGetRequestConfig(id, true, compositeSessionIdRef),
                `story`
            )
        );
        compositeRequest.push(
            getCompositeSubRequestDataFromRequestConfig(
                storyContextGetRequestConfig([id], compositeSessionIdRef),
                "storyContext"
            )
        );

        // todo try catch
        const response = await API.post<CompositeResponseData<StoryModel | SessionModel | StoryContextModel>>(
            "composite",
            { compositeRequest }
        );

        // console.log({data: response.data});

        if (
            response.data &&
            response.data.success &&
            response.data.compositeResponse &&
            Array.isArray(response.data.compositeResponse)
        ) {
            return response.data.compositeResponse;
        }
        if (response.data && !response.data.success) {
            // todo 404 - part
            // each - find error
            throw Error("composite request error:" + JSON.stringify(response.data.compositeResponse));
        }

        return [];
    }
);

const isSessionModel = (item: any): item is SessionModel => {
    return !!item;
};
forward({
    from: fetchSessionAndStoryDataCompositeFx.doneData.filterMap((list) => {
        const sessionModel = list.find((item) => item.ref === "session")?.body;
        if (sessionModel && isObject(sessionModel) && isSessionModel(sessionModel)) {
            return sessionModel;
        }
        return undefined;
    }),
    to: $session,
});

forward({
    from: fetchSessionAndStoryDataCompositeFx.done.filterMap((list) => {
        // ctx тоже хранить с uKey
        const context = list.result.find((item) => item.ref === "storyContext")?.body;
        if (context && isObject(context)) {
            // ids from back
            return { ...context, ids: [list.params.id] };
        }
        return undefined;
    }) as Event<Option<StoryContextModel>>,
    to: $storyContext,
});

// slides
$storiesRaw.on(
    fetchSessionAndStoryDataCompositeFx.doneData.filterMap((list) => {
        // сессия еще не установилась в стор
        let userKey = null;
        const sessionModel = list.find((item) => item.ref === "session")?.body;
        if (sessionModel && isObject(sessionModel) && isSessionModel(sessionModel)) {
            userKey = sessionModel.user_key;
        }

        const story = list.find((item) => item.ref === "story")?.body;
        if (story && isObject(story)) {
            return { story, userKey };
        }
        return undefined;
    }),
    (
        state: Record<StoryListUserKey, Array<StoryModel>>,
        data
    ): Record<StoryListUserKey, Array<StoryModel>> | undefined => {
        if (
            isObject(data) &&
            data.story !== undefined &&
            // data.userKey !== undefined &&
            isStoryModel(data.story)
        ) {
            const userKey = APIInstance.userKey;
            const models: Array<StoryModel> = (state[userKey] || []).slice(0);
            let storyData = data.story as StoryModel;

            const newState = models.filter((_) => _.id !== (storyData as any)?.id).slice(0);
            storyData = Object.assign(storyData, {
                // @ts-ignore
                slides_html: storyData.need_placeholders
                    ? Array.from(storyData.slides_html).map((item) => replacePlaceholders(item))
                    : Array.from(storyData.slides_html),
                // @ts-ignore
                slides_duration: storyData.slides_duration,
                slidesLoaded: true,
                is_opened: storyCheckLocalIsOpened(storyData),
            });

            newState.push(storyData);
            return { ...state, [userKey]: newState };
        } else {
            return undefined;
        }
    }
);

let _sessionIsLoaded = false;
let _sessionIsLoadedPromise: Option<Promise<void>> = null;
const waitForSessionLoad = () => {
    if (_sessionIsLoadedPromise != null) {
        return _sessionIsLoadedPromise;
    } else {
        _sessionIsLoadedPromise = new Promise<void>((resolve) => {
            $session.watch(({ cache, session }) => {
                if (!_sessionIsLoaded && session != null && Boolean(session.id)) {
                    _sessionIsLoaded = true;
                    resolve();
                }
            });
        });

        return _sessionIsLoadedPromise;
    }
};
// $session.watch(({ cache }) => {
//     console.log({cache});
// });

export {
    fetchSessionAndStoriesCompositeFx,
    fetchStoriesSlidesCompositeFx,
    fetchStoriesContextAndStorySlidesCompositeFx,
    storiesListIdsChanged,
    fetchSessionAndStoryDataCompositeFx,
    waitForSessionLoad,
};
