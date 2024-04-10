// import {createStore, createEffect} from 'effector'

// export const fetchUsersFx = createEffect()
//
// //imagine initially we have users list as a key-value store
// export const $usersMap = createStore({})
//
// //we need array representaion for our UI tasks
// export const $users = $usersMap.map(usersMap => Object.values(usersMap))


import {createApi, createEvent, createStore, forward, Event} from 'effector';
import {StoryManagerConfig, StoryManagerConfigDefault} from "../../types/storyManager/storyManager";
import {DeviceId} from "./index.h";

const $storyManagerConfig = createStore<StoryManagerConfig>(StoryManagerConfigDefault);

// const {storyManagerConfigChanged}: {storyManagerConfigChanged: Event<StoryManagerConfig>} = createApi($storyManagerConfig, {
//   storyManagerConfigChanged: (state, config) => config,
// });

const storyManagerConfigChanged = createEvent<StoryManagerConfig>();
$storyManagerConfig.on(storyManagerConfigChanged, (state, config) => config);

const storyManagerConfigTagsChanged = createEvent<Pick<StoryManagerConfig, "tags">>();
$storyManagerConfig.on(storyManagerConfigTagsChanged, (state, {tags}) => ({...state, tags}));

const storyManagerConfigUserIdChanged = createEvent<Pick<StoryManagerConfig, "userId">>();
$storyManagerConfig.on(storyManagerConfigUserIdChanged, (state, {userId}) => ({...state, userId}));

const storyManagerConfigPlaceholdersChanged = createEvent<Pick<StoryManagerConfig, "placeholders">>();
$storyManagerConfig.on(storyManagerConfigPlaceholdersChanged, (state, {placeholders}) => ({...state, placeholders}));

const storyManagerConfigLangChanged = createEvent<Pick<StoryManagerConfig, "lang">>();
$storyManagerConfig.on(storyManagerConfigLangChanged, (state, {lang}) => ({...state, lang}));

const storyManagerConfigIsSandboxChanged = createEvent<Pick<StoryManagerConfig, "isSandbox">>();
$storyManagerConfig.on(storyManagerConfigIsSandboxChanged, (state, {isSandbox}) => ({...state, isSandbox: Boolean(isSandbox) }));

const storyManagerConfigApiKeyChanged = createEvent<Pick<StoryManagerConfig, "apiKey">>();
$storyManagerConfig.on(storyManagerConfigApiKeyChanged, (state, {apiKey}) => ({...state, apiKey }));

// $config.watch(s => console.log(s));


const $configDeviceId = createStore<DeviceId>('' as DeviceId);
const configDeviceIdChanged = createEvent<DeviceId>();
forward({
    from: configDeviceIdChanged,
    to: $configDeviceId
});


export {$storyManagerConfig, storyManagerConfigChanged, $configDeviceId, configDeviceIdChanged, storyManagerConfigTagsChanged, storyManagerConfigPlaceholdersChanged, storyManagerConfigUserIdChanged, storyManagerConfigLangChanged, storyManagerConfigIsSandboxChanged, storyManagerConfigApiKeyChanged};
