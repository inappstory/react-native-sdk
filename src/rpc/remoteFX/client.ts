import {Effect, Domain, createEvent, clearNode} from "effector";
import {IWorkerClient} from "../IWorkerClient";
import {create as createDuplex} from "./duplex";

// inner of iframe/webview
export function create(domains: {serverFxDomain: Domain, clientFxDomain: Domain}, worker: IWorkerClient) {

  createDuplex({
    fxSenderDomain: domains.serverFxDomain,
    fxReceiverDomain: domains.clientFxDomain
  }, worker);

}