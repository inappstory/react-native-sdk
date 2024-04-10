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