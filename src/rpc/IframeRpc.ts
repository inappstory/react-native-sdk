import {RPC} from "./index";
import {IframeWorkerServer} from "./IframeWorkerServer";
import {IWorkerServer} from "./IWorkerServer";

export class IframeRpc extends RPC {
  private readonly worker: IframeWorkerServer;
  constructor(iframe: HTMLIFrameElement, origin: string) {
    super();
    this.worker = new IframeWorkerServer(iframe, origin);
  }


  createWorker(): IWorkerServer {
    return this.worker;
  }


}