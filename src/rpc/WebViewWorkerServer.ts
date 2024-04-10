import {IWorkerServer} from "./IWorkerServer";
import {Option, Dict} from "../../global.h";

import {Message} from "./index.h";
import WebView from "react-native-webview";
import {isFunction} from "../helpers/isFunction";


export class WebViewWorkerServer implements IWorkerServer {

  private readonly _destructor;
  constructor(private webview: WebView) {
    // const messageListener = (event: MessageEvent) => this.messageListener(event);
    //   rpcOnMessage = (event: MessageEvent) => this.messageListener(event);
    // @ts-ignore

    // webview.onMessage = messageListener;
    // console.log("WebViewWorkerServer set onMessage method");

      // webview.addEventListener("message", messageListener, false);
    // this._destructor = () => webview.removeEventListener("message", this.messageListener);
    this._destructor = () => {};
  }

  public createOnMessage() {
      return (event: MessageEvent) => {
          this.messageListener(event);
      };
  }

  public destructor() {
    this._destructor();
  }


  messageListener(event: MessageEvent) {
    //@ts-ignore
    // console.log("messageListener server", {"event.nativeEvent.data": event.nativeEvent.data, "this": this});

    let data = {};
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch (e) {
      console.error(e);
    }

    // TODO  check из какого webview пришло сообщение

    if (isFunction(this.onMessageCb)) {
      //@ts-ignore
      // console.log("messageListener server 3", {data});
      //@ts-ignore
      this.onMessageCb(data);
    }

  }

  sendMessage(message: Message) {
    // console.log('sendMessage from server', {message});
    // this.contentWindow?.postMessage(message, this.origin);
      try {
          this.webview.postMessage(JSON.stringify(message));
      } catch (e) {
          // invariant error - this.webview.webViewRef is null
          console.log(e);
      }
  }

  private onMessageCb: Option<(data: Dict) => void> = null;
  set onmessage(cb: (data: Dict) => void) {
    this.onMessageCb = cb;
  }

}