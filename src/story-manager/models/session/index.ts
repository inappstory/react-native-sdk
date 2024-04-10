// import {createStore, createEffect} from 'effector'

// export const fetchUsersFx = createEffect()
//
// //imagine initially we have users list as a key-value store
// export const $usersMap = createStore({})
//
// //we need array representation for our UI tasks
// export const $users = $usersMap.map(usersMap => Object.values(usersMap))

import API from './../../api';
import {createStore, createEvent, createEffect, createDomain, forward} from 'effector';

export type CacheResourceModel = {
  url: string,
  weight: string,
  style: string,
  title: string,
  family: string,
  type: 'font-face' | 'file',
  format: string
};

export type SessionPlaceholderModel = {
  name: string,
  default_value: string
};

export type SessionInnerModel = {
  id: string,
  expire_in: number
};

export type SessionModel = {
  session: SessionInnerModel,
  server_timestamp: number,
  content_base_url: string,
  user_key: string, // Anonymized user id
  share: boolean, // Flag allow user share or not
  is_allow_profiling: boolean, // Flag allow collect profiling for this session
  cache: Array<CacheResourceModel>,
  placeholders: Array<SessionPlaceholderModel>,
};

const $session = createStore<SessionModel>({
  session: {id: '', expire_in: 0},
  server_timestamp: 0,
  content_base_url: '',
  user_key: '',
  share: false,
  is_allow_profiling: false,
  cache: [],
  placeholders: []
});

const fetchSessionFx = createEffect<{}, SessionModel, Error>();

$session.on(fetchSessionFx.doneData, (_, session: SessionModel) => session);

const sessionFlushed = createEvent<void>();
$session.on(sessionFlushed, (_) => ({..._, session: {id: '', expire_in: 0}}));


const sessionChanged = createEvent<SessionModel>();

// const configChanged = createEvent<WidgetStoriesConfig>();
// forward({
//     from: configChanged,
//     to: $config
// });
//
// $session.watch(s => console.log(s));


const sessionHandleFlushThumbViewsFx = createEffect((payload: {data: Array<any>}) => {
    // console.log("sessionHandleFlushThumbViewsFx", payload.data);
  API.post('session/update', payload);
});

const sessionThumbViewsChanged = sessionHandleFlushThumbViewsFx.prepend((ids: Array<number>) => ({
    // state.data.push([
    //     action,
    //     state.lastIndex,
    //     storyId,
    //     slideIndex,
    //     slideDuration
    // ]);
    // state.lastIndex++
    data: [[
      5, //action: 5, // Прочтение
      0, // lastIndex
      ...ids,  // ids story,
    ]]
  })
);





export {$session, fetchSessionFx, sessionChanged, sessionThumbViewsChanged, sessionFlushed};
