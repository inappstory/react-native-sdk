import {fetchStoriesFx, StoryModel} from './';
import API, {ApiRequestConfig} from './../../api';
import {$storyManagerConfig} from "../storyManagerConfig";
import {STORY_LIST_TYPE} from "../../types";
import {Option} from "../../../../global.h";
import {isArray} from "../../../helpers/isArray";


// import {fetchUsersFx, $usersMap} from './';

// fetchUsersFx.use(async () => fetch('/users'))
//
// addUserFx.use(async user =>
//     fetch('/users', {
//         method: 'POST',
//         body: JSON.stringify(user),
//     }),
// )
//
// $usersMap.on(fetchUsersFx.doneData, (_, users) => users)
//
// forward({
//     from: addUserFx.doneData,
//     to: fetchUsersFx,
// })


// после запроса создать модель ?
// can pass params

export function getFavoriteListRequestConfig(compositeSessionIdRef?: Option<string>): ApiRequestConfig {
    const {params} = configForListRequest(compositeSessionIdRef);
    return {
        method: "GET",
        url: "story",
        params: {...params, favorite: 1}
    } as ApiRequestConfig;
}

export function getFeedRequestConfig(feedSlug: string, compositeSessionIdRef?: Option<string>, customTags?: Array<string>, testKey?: Option<string>): ApiRequestConfig {
    const {params} = configForListRequest(compositeSessionIdRef, customTags, testKey);
    return {
        method: "GET",
        url: `feed/${feedSlug}`,
        params,
    } as ApiRequestConfig;
}

export function getOnboardingRequestConfig(feedSlug: string = "onboarding", compositeSessionIdRef?: Option<string>, customTags?: Array<string>, limit?: Option<number>): ApiRequestConfig {
    const {params} = configForListRequest(compositeSessionIdRef, customTags, null, limit);
    return {
        method: "GET",
        url: `feed/${feedSlug}/onboarding`, // get feed `onboarding` as onboarding (feedSlug can be any, default - onboarding)
        params,
    } as ApiRequestConfig;
}

export function storySlidesGetRequestConfig(id: number | string, allFields = false, compositeSessionIdRef?: Option<string>): ApiRequestConfig {
    const config: ApiRequestConfig = {
        url: `story/${id}`,
        method: "GET",
        params: {expand: ['slides_html', 'slides_duration', 'slides_screenshot_share'].join(',')},
    };
    if (!allFields) {
        if (config.params) {
            config.params.fields = ['id', 'slides_html', 'slides_duration', 'slides_screenshot_share'].join(',');
        }
    }
    if (compositeSessionIdRef !== null) {
        if (config.params) {
            config.params.session_id = compositeSessionIdRef;
        }
    }
    return config;
}



fetchStoriesFx.use(async ({listType}) => (API.get('story', configForListRequest()) as any));

const configForListRequest = (compositeSessionIdRef?: Option<string>, customTags?: Array<string>, testKey?: Option<string>, limit?: Option<number>) => {
    let tags = $storyManagerConfig.getState()?.tags;
    const params: {tags?: Option<string>, favorite?: number, session_id?: string, test?: string, limit?: number} = {};
    if (tags && isArray(tags) && tags.length > 0) {
        params.tags = tags.join(',');
    }
    if (customTags !== undefined && isArray(customTags) && customTags.length > 0) {
        params.tags = customTags.join(',');
    }

    const isNumeric = (n: string|number) => {
        return !isNaN(parseFloat(n as string)) && isFinite(n as number);
    }

    if (limit != null && (typeof limit === 'number' || isNumeric(limit))) {
        params.limit = limit;
    }

    if (compositeSessionIdRef) {
        params.session_id = compositeSessionIdRef;
    }

    if (testKey != null) {
        params.test = testKey;
    }

    return {params};
};


// forward({
//     from: fetchSessionFx.doneData,
//     to: $session
// });

// fetchSessionFx({});