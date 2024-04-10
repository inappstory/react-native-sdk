import {IWorkerServer} from "./IWorkerServer";


export abstract class RPC {
  abstract createWorker(): IWorkerServer;



}