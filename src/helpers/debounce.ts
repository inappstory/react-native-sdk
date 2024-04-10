import {Option} from "../../global.h";

// Возвращает функцию, которая, пока она продолжает вызываться,
// не будет запускаться.
// Она будет вызвана один раз через N миллисекунд после последнего вызова.
// Если передано аргумент `immediate` (true), то она запустится сразу же при
// первом запуске функции.

export function debounce(func: Function, wait: number, immediate: boolean) {
    let timeout:Option<number> = null;

    return function executedFunction() {
        // @ts-ignore
        const context = this;
        const args = arguments;

        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;

        if (timeout)
            clearTimeout(timeout);

        timeout = window.setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}