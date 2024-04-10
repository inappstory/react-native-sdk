import {rpcDomains, widgetLoaded} from "../widget-story-reader/rpc";
import {create as createRpcClient} from "../rpc/remoteFX/client";
// common core part
import "../stories_widget/stories-reader";
import {WebViewWorkerClient} from "../rpc/WebViewWorkerClient";

(window as any).cur = {};


const initRpcClient = () => new Promise<void>((resolve, reject) => {
  _initRpcClient(resolve, reject);
});

const _initRpcClient = (resolve: () => void, reject: (reason: string) => void) => {
  // connect rpc
  createRpcClient(rpcDomains, new WebViewWorkerClient());
  // console.log('createRpcClient as Client');
  resolve();
}

(window as any)._initRpcClient = initRpcClient;

// @ts-ignore
window.widgetLoaded = widgetLoaded;

// export {default as storiesList} from "../stories_widget/stories-slider";


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