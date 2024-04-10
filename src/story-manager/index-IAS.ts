// https://github.com/zloirock/core-js
import "core-js/features/object/from-entries";

import "regenerator-runtime/runtime.js";

import './models/init';
import {AppearanceManager} from "~/src/storyManager/AppearanceManager";
import {StoryManager} from "~/src/storyManager/StoryManager";

// import init, {greet} from "~/wasm-lib/pkg/wasm_lib";
// init().then(_ => {
//   (<any>window).greet = greet;
// });

export default class IAS {

  /**
   * Old api
   */
    // static Stories = class Stories extends EventEmitter {
    //   constructor(rootId: string, config: WidgetStoriesConfig) {
    //     super();
    //     // configChanged(config);
    //
    //     // old api
    //     // set config, create StoryManager, show List
    //
    //
    //     const storiesList = new StoriesList();
    //
    //     const storyManager = new IAS.StoryManager(config);
    //     // parse old format
    //     // loader events
    //     // new storyManager.StoriesList(rootId, {}, storiesList);
    //
    //     // storyList.handleLoader - emit event on
    //
    //
    //     return storiesList as Stories;
    //   }
    //
    // }


    // config builder
    // appearance config
    // can change some params

  static AppearanceManager = AppearanceManager;

  static StoryManager = StoryManager;
}

declare global {
  interface Window {
    IASReady: {_e: Array<any>};
    scrollNode: any; // browser env
    IAS: any;
    fastXDM: any;
    iasAsyncInitCallbacks: Array<() => void>;
  }
}


// only if not umd
// Init asynchronous library loading
if (window.IASReady && window.IASReady._e) {
  for (let i = 0; i < window.IASReady._e.length; i++) {
    setTimeout(window.IASReady._e[i], 0);
  }
}

// window.IAS = IAS;

