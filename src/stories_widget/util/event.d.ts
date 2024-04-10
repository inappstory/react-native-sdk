export function emitEvent(vnode: any, eventName: string, eventDetail: any): void;
export function addEventListeners(el: EventTarget, events: Array<string>, handler: EventListenerOrEventListenerObject, passive?: boolean): void;
export function removeEventListeners(el: EventTarget, events: Array<string>, handler: EventListenerOrEventListenerObject): void;
export function addOnceEventListener(el: EventTarget, eventName: string, cb: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;