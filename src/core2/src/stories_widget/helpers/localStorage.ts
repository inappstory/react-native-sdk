const isString = require("lodash/isString");

function lsTest(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

export const lsIsAvailable = lsTest();

/**
 * BEWARE! This Modernizr approach will return false if the localStorage quota is reached.
 * If you have functions dealing with localStorage cleaning, you should edit the catch statement to launch appropriate cleaning actions
 * if the exception name e.name ==== 'QUOTA_EXCEEDED_ERR' (Chrome) or 'NS_ERROR_DOM_QUOTA_REACHED' (Firefox/Safari) or
 * if localStorage.remainingSpace === 0 in IE.
 *
 * TODO Alternative -- cookies
 */

export function localStorageGet<T extends Object>(key: string): Nullable<T>
{
    let data = null;
    if (lsIsAvailable) {
        let storageData = window.localStorage.getItem(key);
        // QuotaExceededError
        if (storageData !== null && isString(storageData) && storageData.trim().length > 0) {
            data = JSON.parse(storageData);
        }
    }

    return data;
}


export function localStorageSet(key: string, data: any): void
{
    if (lsIsAvailable) {
        window.localStorage.setItem(key, JSON.stringify(data));
    }
}