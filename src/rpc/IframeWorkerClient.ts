import {IWorkerClient} from "./IWorkerClient";
import {Option} from "../../global.h";

import {Message} from "./index.h";
import {isFunction} from "../helpers/isFunction";


export class IframeWorkerClient implements IWorkerClient {

  private readonly _destructor;
  constructor(private contentWindow: Window, private origin: string) {
    const messageListener = (event: MessageEvent) => this.messageListener(event);
    window.addEventListener("message", messageListener, false);
    this._destructor = () => window.removeEventListener("message", this.messageListener);
  }

  public destructor() {
    this._destructor();
  }


  messageListener(event: MessageEvent) {
    // console.log("messageListener client", {event, "this": this});
    if (event.origin !== this.origin)
      return;

    const data = event.data;

    if (isFunction(this.onMessageCb)) {
      this.onMessageCb(data);
    }
    return;

  }

  sendMessage(message: Message) {
    this.contentWindow?.postMessage(message, this.origin);
  }

  receiveMessage() {
  }

  private onMessageCb: Option<(event: MessageEvent) => void> = null;
  set onmessage(cb: (event: MessageEvent) => void) {
    this.onMessageCb = cb;
  }



}