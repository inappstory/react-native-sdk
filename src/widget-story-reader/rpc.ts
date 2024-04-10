import {createDomain, Effect} from 'effector';

import {
  ClickOnStoryInternalWithDataPayload,
  FontResource,
  STORY_LIST_TYPE,
  STORY_READER_WINDOW_REFERER
} from "../story-manager/common.h";
import {Dict} from "../../global.h";

// use name|sid or  "effector/babel-plugin"
const domainPrefix = "FxDomainWidgetStory";
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

export const setSoundOn = toClientFxDomain.effect<boolean, void>(domainPrefix+"setSoundOn");

export const onOpenReader = toClientFxDomain.effect<ClickOnStoryInternalWithDataPayload & {hasShare: boolean, soundOn: boolean}, void>(domainPrefix+"onOpenReader");
export const onCloseReader = toClientFxDomain.effect<void, void>(domainPrefix+"onCloseReader");

export const onPauseUI = toClientFxDomain.effect<void, void>(domainPrefix+"onPauseUI");
export const onResumeUI = toClientFxDomain.effect<void, void>(domainPrefix+"onResumeUI");

export const widgetLoaded = toServerFxDomain.effect<void, void>(domainPrefix+"widgetLoaded");
export const onReaderOpened = toServerFxDomain.effect<{windowReferer: STORY_READER_WINDOW_REFERER}, void>(domainPrefix+"onReaderOpened");
export const onReaderClosed = toServerFxDomain.effect<{windowReferer: STORY_READER_WINDOW_REFERER}, void>(domainPrefix+"onReaderClosed");

export const widgetEvent = toServerFxDomain.effect<{name: string, payload: Dict, cb?: {id: string}}, void>(domainPrefix+"widgetEvent");
export const widgetEventCb = toClientFxDomain.effect<{requestId: string, success: boolean, data: Dict, err: any}, void>(domainPrefix+"widgetEventCb");

export const onShareStoryInternal = toServerFxDomain.effect<{title?: string, text?: string, url?: string, files?: Array<string>}, void>(domainPrefix+"shareStoryInternal");

export const debug = toServerFxDomain.effect<string, void>(domainPrefix+"debug");