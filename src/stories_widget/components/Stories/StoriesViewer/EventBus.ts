import {EventEmitter} from "events";

let instance: EventBus;
class EventBus extends EventEmitter {
    constructor() {
        if (instance) {
            throw new Error("New instance cannot be created!!");
        }

        super();
        instance = this;
    }

}

const eventBusInstance = new EventBus();
eventBusInstance.setMaxListeners(100);

export default eventBusInstance;


export enum STORY_READER_INTERNAL_EVENTS {
    REFRESH_WIDGETS_STATE = "REFRESH_WIDGETS_STATE",
}
