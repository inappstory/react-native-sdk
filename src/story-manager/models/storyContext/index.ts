

// context - for list ids





// import {createStore, createEffect} from 'effector'

// export const fetchUsersFx = createEffect()
//
// //imagine initially we have users list as a key-value store
// export const $usersMap = createStore({})
//
// //we need array representation for our UI tasks
// export const $users = $usersMap.map(usersMap => Object.values(usersMap))


import {createStore, createEvent, createEffect, createDomain, forward} from 'effector';
import {Option} from "../../../../global.h";
import {ApiResponse} from "../../api";

export type StoryContextModel = Option<{
  style: string,
  script: string,
  ids: Array<number>
}>;

const $storyContext = createStore<StoryContextModel>(null);
// реализацию надо здесь же и писать
const fetchStoryContextFx = createEffect<{ids: Array<number>}, ApiResponse<StoryContextModel>, Error>();
const storyContextChanged = createEvent<StoryContextModel>();

// $storyContext.watch((s, p) => console.log(`$storyContext.watch}`, s, p));

export {$storyContext, fetchStoryContextFx, storyContextChanged};
