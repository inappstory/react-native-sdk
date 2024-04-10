import {Message} from "./index.h";

export interface IWorkerServer {

  sendMessage(message: Message): void;

  set onmessage(cb: (event: MessageEvent) => void);

  destructor(): void;

}