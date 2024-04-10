import {IWorkerClient} from "./IWorkerClient";
import {Option, Dict} from "../../global.h";

import {Message} from "./index.h";
import {isFunction} from "../helpers/isFunction";


export class WebViewWorkerClient implements IWorkerClient {

  private readonly _destructor;
  constructor() {
    const messageListener = (event: MessageEvent) => this.messageListener(event);
    // if(navigator.appVersion.includes('Android')){
    //
    // }
    // @ts-ignore
    document.addEventListener("message", messageListener, false); // android
    window.addEventListener("message", messageListener, false);  // ios
    this._destructor = () => {
      // @ts-ignore
      document.removeEventListener("message", this.messageListener);
      window.removeEventListener("message", this.messageListener);
    };
  }

  public destructor() {
    this._destructor();
  }


  messageListener(event: MessageEvent) {
    // console.log("messageListener client", {event, "this": this});
    // if (event.origin !== this.origin)
    //   return;

    let data = {};
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error(e);
    }

    if (isFunction(this.onMessageCb)) {
      this.onMessageCb(data);
    }
    return;

  }

  sendMessage(message: Message) {
    // @ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }

  receiveMessage() {
  }

  private onMessageCb: Option<(data: Dict) => void> = null;
  set onmessage(cb: (data: Dict) => void) {
    this.onMessageCb = cb;
  }



}