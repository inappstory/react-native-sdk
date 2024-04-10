export enum MessageType {
  REQUEST,
  RESPONSE
}

export enum MessageStatus {
  SUCCESS,
  ERROR
}

export type Message = {
  type: MessageType,
  id: number,
  sid: string,
  params?: any,
  status?: MessageStatus,
  error?: any,
  result?: any,
};
