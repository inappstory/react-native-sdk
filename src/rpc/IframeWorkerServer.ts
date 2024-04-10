import {IWorkerServer} from "./IWorkerServer";
import {Option} from "../../global.h";

import {Message} from "./index.h";
import {isFunction} from "../helpers/isFunction";


export class IframeWorkerServer implements IWorkerServer {

  private readonly _destructor;
  private readonly contentWindow: Option<Window>;
  constructor(private iframe: HTMLIFrameElement, private origin: string) {
    this.contentWindow = iframe.contentWindow;

    const messageListener = (event: MessageEvent) => this.messageListener(event);
    window.addEventListener("message", messageListener, false);
    this._destructor = () => window.removeEventListener("message", this.messageListener);
  }

  public destructor() {
    this._destructor();
  }


  messageListener(event: MessageEvent) {
    // console.log("messageListener server", {event, "this": this});

    if (event.origin !== this.origin) {
      return;
    }

    // from another iframe
    if (event.source !== this.contentWindow) {
      return;
    }

    const data = event.data;

    if (isFunction(this.onMessageCb)) {
      // console.log("messageListener server 3", {event, "this": this});
      this.onMessageCb(data);
    }

  }

  sendMessage(message: Message) {
    // console.log('sendMessage from server', {message});
    this.contentWindow?.postMessage(message, this.origin);
  }

  receiveMessage() {
  }

  private onMessageCb: Option<(event: MessageEvent) => void> = null;
  set onmessage(cb: (event: MessageEvent) => void) {
    this.onMessageCb = cb;
  }



}