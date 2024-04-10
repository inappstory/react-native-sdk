import {$storyContext, fetchStoryContextFx, storyContextChanged} from './';
import API, {ApiRequestConfig} from './../../api';
import {forward} from "effector";
import {Option} from "../../../../global.h";
import {isObject} from "../../../helpers/isObject";

// после запроса создать модель ?
// can pass params


export function getRequestConfig(ids: Array<number | string>, compositeSessionIdRef?: Option<string>): ApiRequestConfig {
  const config: ApiRequestConfig = {
    url: `story-context`,
    method: "get",
    params: {
      id: ids.join(',')
    },
  };
  if (compositeSessionIdRef != null && config.params) {
    config.params.session_id = compositeSessionIdRef;
  }
  return config;
}

fetchStoryContextFx.use(async ({ids}) => API.request(getRequestConfig(ids)));

forward({from: fetchStoryContextFx.done.filterMap(payload => {
    const context = payload.result.data;
    if (context && isObject(context)) {
      return {...context, ids: payload.params.ids};
    }
    return undefined;
  }), to: $storyContext});
forward({from: storyContextChanged, to: $storyContext});