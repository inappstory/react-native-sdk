import {EventEmitter} from 'events';

export interface IWidget extends EventEmitter {

    setCallbacks(callbacks: Dict<any>): void;



}
