import {Message} from "./index.h";

export interface IWorkerClient {



  sendMessage(message: Message): void;

  set onmessage(cb: (event: MessageEvent) => void);

  destructor(): void;

}