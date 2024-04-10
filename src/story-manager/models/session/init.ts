import {forward} from 'effector';
import {$session, fetchSessionFx, sessionChanged, SessionModel} from './';
import API, {ApiRequestConfig} from './../../api';
import {debug} from "../../../stories_widget/util/debug";
import {ISessionInitData} from "../Session2";
import {$storyManagerConfig, configDeviceIdChanged} from "../storyManagerConfig";
import {Option} from "../../../../global.h";
import {StoryManager} from "../../index";
import {addDefaultPlaceholders} from "../placeholder";


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

export async function getRequestConfig(): Promise<ApiRequestConfig> {

    const [deviceData, _hasLossyWebP] = await Promise.all([getDeviceData(), getIsSupportWebP()]);

    return {
        method: "post",
        url: "session/open",
        params: {expand: "cache"},
        data: completeDeviceData(deviceData, _hasLossyWebP)
    } as ApiRequestConfig;
}


// после запроса создать модель ?
// can pass params
fetchSessionFx.use(async () => {
    // todo try catch

    const [deviceData, _hasLossyWebP] = await Promise.all([getDeviceData(), getIsSupportWebP()]);

    const response = await API.post<SessionModel>('session/open?expand=cache', completeDeviceData(deviceData, _hasLossyWebP));
    // create instance via Abstract model ?
  // или взять только поля из типа и их сохранить
    return response.data;
});

// @depecated
forward({
    from: sessionChanged,
    to: $session
});

// forward({
//     from: fetchSessionFx.doneData,
//     to: $session
// });

// fetchSessionFx({});

const completeDeviceData = (data: ISessionInitData, hasLossyWebP: boolean) => {
    if (data.os_name === 'iOS') {
        (window as any).isIos = true;
    } else if (data.os_name === 'Android') {
        (window as any).Android = true;
    }

    const configData = $storyManagerConfig.getState();
    if (configData && configData.userId) {
        data.user_id = configData.userId;
    }

    data.features = 'animation,data,deeplink,placeholder,resetTimers,gameReader,swipeUpItems';

    if (hasLossyWebP) {
        data.features += ',webp';
    }

    // dispatch an action
    // не нужно ?
    // store.dispatch('user/updateDeviceId', data.device_id);

    // debug(data)
    return data;
};

// this.getDeviceId().then((data: ISessionInitData) => {
//
//     if (data.os_name === 'iOS') {
//         (<any>window).isIos = true;
//     } else if (data.os_name === 'Android') {
//         (<any>window).Android = true;
//     }
//
//     if (store.getters['shared/options']?.userId) {
//         data.user_id = store.getters['shared/options']?.userId;
//     }
//
//     // переехали в запрос списков
//     // if (store.getters['stories/options']?.tags) {
//     //     data.tags = store.getters['stories/options']?.tags;
//     // }
//
//     data.features = 'animation,data,deeplink,placeholder,resetTimers,gameReader';
//
//     // dispatch an action
//     // не нужно ?
//     store.dispatch('user/updateDeviceId', data.device_id);
//
//     debug(data)
//
//     Session2.fetch(data).then(session => {
//         sessionInitInProcess = false;
//         // TODO activeModel - set
//         if (!session) {
//             reject(`Key session not exists in response ${session}`)
//         }
//
//         // sync
//         store.commit('shared/setSession', {session})
//
//
//         //
//
//         ///,  и в Reader виджет вынести
//
//         if (session.rawData && session.rawData.share) {
//             store.commit('shared/setHasShare', {status: true})
//         }
//
//         store.commit('shared/addDefaultPlaceholders', {value: session.placeholders});
//
//
//         resolve(session)
//
//         // save all to store
//
//         //   "session": {
//         //     "id": "3edd5f192dd39045c05f26f450205426",
//         //     "expire_in": 3600
//         //   },
//         //   "server_timestamp": 1531471495
//
//         // resolve(val)
//     }, error => {
//         sessionInitInProcess = false;
//         debug(error);
//     })
//
// });

// move to helper
const getDeviceData = (): Promise<ISessionInitData> => {
  return StoryManager.getInstance().getDeviceInfo(configDeviceIdChanged);
}

const getIsSupportWebP = (): Promise<boolean> => {
    return Promise.resolve(StoryManager.getInstance().isWebPSupported);
}