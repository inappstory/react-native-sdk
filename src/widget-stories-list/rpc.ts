import {createDomain, Effect} from 'effector';
import {
  ClickOnStoryInternalPayload,
    ClickOnFavoriteCellInternalPayload,
  ClickOnStoryPayload,
  FontResource,
  STORY_LIST_TYPE
} from "../story-manager/common.h";
import {Dict} from "../../global.h";

// use name|sid or  "effector/babel-plugin"
const domainPrefix = "FxDomainWidgetStoriesList";
const toServerFxDomain = createDomain(`server${domainPrefix}`);
const toClientFxDomain = createDomain(`client${domainPrefix}`);

export {toServerFxDomain as serverFxDomain, toClientFxDomain as clientFxDomain}

export const rpcDomains = {
  serverFxDomain: toServerFxDomain,
  clientFxDomain: toClientFxDomain
}

// export const workerMessage = domain.effect<string, string[]>();
// export const failure = domain.effect<void, any>();
// export const ping: Effect<{now: number}, {ping: number}> = domain.effect();

export const setStories = toClientFxDomain.effect<{listType: STORY_LIST_TYPE, storyList: Array<Dict>}, void>(domainPrefix+"setStories");
export const setFonts = toClientFxDomain.effect<Array<FontResource>, void>(domainPrefix+"setFonts");
export const checkWebPSupport = toClientFxDomain.effect<void, boolean>(domainPrefix+"checkWebPSupport");

export const widgetLoaded = toServerFxDomain.effect<void, void>(domainPrefix+"widgetLoaded");
export const clickOnStoryInternalEvent = toServerFxDomain.effect<ClickOnStoryInternalPayload, void>(domainPrefix+"clickOnStoryInternalEvent");
export const clickOnFavoriteCellInternalEvent = toServerFxDomain.effect<ClickOnFavoriteCellInternalPayload, void>(domainPrefix+"clickOnFavoriteCellInternalEvent");
export const flushThumbViewsEvent = toServerFxDomain.effect<Array<number>, void>(domainPrefix+"flushThumbViewsEvent");
export const clickOnStoryEvent = toServerFxDomain.effect<ClickOnStoryPayload, void>(domainPrefix+"clickOnStoryEvent");
export const clickOnStoryDeepLinkEvent = toServerFxDomain.effect<ClickOnStoryPayload, void>(domainPrefix+"clickOnStoryDeepLinkEvent");

export const debug = toServerFxDomain.effect<string, void>(domainPrefix+"debug");


