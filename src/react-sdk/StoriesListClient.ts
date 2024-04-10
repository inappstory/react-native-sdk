import {Dict, Option} from "../../global.h";

(window as any).cur = {};


import {clientFxDomain, serverFxDomain, rpcDomains, widgetLoaded} from "../widget-stories-list/rpc";
import {create as createRpcClient} from "../rpc/remoteFX/client";
import {IframeWorkerClient} from "../rpc/IframeWorkerClient";


const initRpcClient = () => new Promise<void>((resolve, reject) => {
  _initRpcClient(resolve, reject);
});

const _initRpcClient = (resolve: () => void, reject: (reason: string) => void, iter = 0) => {


  console.log({
    _rpcServerSourceWindow: window._rpcServerSourceWindow,
    _rpcServerSourceWindowOrigin: window._rpcServerSourceWindowOrigin
  });

  if (!(window._rpcServerSourceWindow && window._rpcServerSourceWindowOrigin)) {

    if (iter > 10) {
      reject('_rpcServerSourceWindow and _rpcServerSourceWindowOrigin is undefined');
    }
    setTimeout(() => {
      _initRpcClient(resolve, reject, iter + 1);
    }, 100);
    return;

  } else {

    // connect rpc
    createRpcClient(rpcDomains, new IframeWorkerClient(window._rpcServerSourceWindow, window._rpcServerSourceWindowOrigin));
    // console.log('createRpcClient as Client');

    resolve();



  }

}

(window as any)._initRpcClient = initRpcClient;

// @ts-ignore
window.widgetLoaded = widgetLoaded;

// export {default as storiesList} from "../stories_widget/stories-slider";

// common core part
import "../stories_widget/stories-slider";


// import App from "../stories_widget/App.vue";
// export {App};

/* eslint-disable import/prefer-default-export */
// export { default as SfcTestSample } from './sfc-test-sample.vue';


//@ts-ignore
// import "./StoriesListClientDist.js";
// import storiesList from "./StoriesListClientDist.js";
// const storiesList = require("./StoriesListClientDist.js").default;
// (window as any).storiesList = storiesList;


// export default storiesList;
// export default class StoriesListClient {};