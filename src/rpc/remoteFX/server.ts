import {createEvent, clearNode, Effect, Domain} from "effector";
import {IWorkerServer} from "../IWorkerServer";
import {Dict} from "../../../global.h";
import {IWorkerClient} from "../IWorkerClient";
import {create as createDuplex} from "./duplex";

export interface RPCServer {
    destructor(): void;
}

export function create(domains: {serverFxDomain: Domain, clientFxDomain: Domain}, worker: IWorkerClient): RPCServer {

  return createDuplex({
    fxSenderDomain: domains.clientFxDomain,
    fxReceiverDomain: domains.serverFxDomain
  }, worker);

}

