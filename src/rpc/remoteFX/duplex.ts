import {createEvent, Effect} from "effector";
import {IWorkerServer} from "../IWorkerServer";
import {IWorkerClient} from "../IWorkerClient";
import {RpcDomains} from "./duplex.h";
import {Message, MessageStatus, MessageType} from "../index.h";
import {Option, Dict} from "../../../global.h";
import {RPCServer} from "./server";

let nextID = 0;

class Defer {

  public id = ++nextID;
  public rs: (data: any) => void = () => {
  };
  public rj: (error: any) => void = () => {
  };
  public req: Promise<any>;

  constructor() {
    reqMap.set(this.id, this);
    const req = new Promise((rs, rj) => {
      this.rs = rs;
      this.rj = rj;
    })
    req
      .finally(() => {
        reqMap.delete(this.id)
      })
      .catch(() => {
      })
    this.req = req;
  }
}

const reqMap = new Map<number, Defer>();

const fxMap = new Map<string, Effect<any, any, any>>();


class DuplexRpc implements RPCServer {

    private receiverEffects: Array<string> = [];
    private senderEffects: Array<Effect<any, any, any>> = [];

    constructor(domains: RpcDomains, worker: IWorkerServer | IWorkerClient) {
        const onMessage = createEvent<Dict>();

        worker.onmessage = onMessage;

        onMessage.watch((data) => {
            if (Object(data) !== data) return;
            if (!data.sid) return;
            if (!data.id) return;

            handleFxResponse(data as Message);
            handleFx(data as Message, worker);
        });


        // fx for work on this side
        domains.fxReceiverDomain.onCreateEffect((fx: Effect<any, any, any>) => {
            // fx.sid only with "effector/babel-plugin"

            // console.log('onCreateEffect', {fx});
            const sid = fx.sid || fx.shortName;
            fxMap.set(sid, fx);
            this.receiverEffects.push(sid);

        });

        // fx for send from this side
        domains.fxSenderDomain.onCreateEffect((fx: Effect<any, any, any>) => {

            // console.log('fxSenderDomain onCreateEffect', {fx});
            fx.use(params => {
                const defer = new Defer();
                worker.sendMessage({
                    id: defer.id,
                    // use (fx.sid || fx.shortName) only with "effector/babel-plugin"
                    sid: fx.sid || fx.shortName,
                    type: MessageType.REQUEST,
                    params,
                });
                return defer.req;
            });

            this.senderEffects.push(fx);

        });
    }

    destructor() {
        this.receiverEffects.forEach(sid => fxMap.delete(sid));
        this.receiverEffects = [];
        this.senderEffects.forEach(effect => effect.use(_ => _));
        this.senderEffects = [];
    }
}

export function create(domains: RpcDomains, worker: IWorkerServer | IWorkerClient): RPCServer {
    return new DuplexRpc(domains, worker);
}

function handleFxResponse(message: Message) {
  if (message.type !== MessageType.RESPONSE) return;
  const req = reqMap.get(message.id);
  if (!req) return;
  if (message.status === MessageStatus.SUCCESS) {
    req.rs(message.result);
  } else {
    if ('raw' in message.error) {
      req.rj(message.error.raw);
      return;
    }
    const error = Error('');
    if ('name' in message.error) error.name = message.error.name;
    if ('message' in message.error) error.message = message.error.message;
    if ('stack' in message.error) error.stack = message.error.stack;
    if ('code' in message.error) (error as any).code = message.error.code;
    req.rj(error);
  }
}

async function handleFx(message: Message, worker: IWorkerServer | IWorkerClient) {
  if (message.type !== MessageType.REQUEST) return;
  const fx = fxMap.get(message.sid);
  if (!fx) {
    worker.sendMessage({
      id: message.id,
      sid: message.sid,
      type: MessageType.RESPONSE,
      status: MessageStatus.ERROR,
      error: {
        name: 'RemoteFXError',
        message: `Unknown sid "${message.sid}"`,
      },
    });
    return;
  }

  // console.log({"onMessage watch": 3, message});

  await fx(message.params)
    .then(result => {
      //@ts-ignore
      worker.sendMessage({
        id: message.id,
        sid: message.sid,
        type: MessageType.RESPONSE,
        status: MessageStatus.SUCCESS,
        result,
      })
    })
    .catch(error => {
      const serialized: {
        raw?: any,
        name?: any,
        code?: any,
        message?: any,
        stack?: any,
      } = {};

      if (error instanceof Error) {
        serialized.name = (error as any).name;
        if ('code' in error) serialized.code = (error as any).code;
        if ('message' in error) serialized.message = (error as any).message;
        if ('stack' in error) serialized.stack = (error as any).stack;
      } else {
        serialized.raw = error;
      }
      worker.sendMessage({
        id: message.id,
        sid: message.sid,
        type: MessageType.RESPONSE,
        status: MessageStatus.ERROR,
        error: serialized,
      });

    })

}













