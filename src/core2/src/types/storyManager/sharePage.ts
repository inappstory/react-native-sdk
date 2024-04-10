import {Optional, Dict} from "../index";

export enum SharePageEvents {
  START_LOADING = 'startLoading',
  END_LOADING = 'endLoading',
  CLOSE_STORY_READER = 'closeStoryReader',
}


export type SharePageOptions = {

  handleStartLoading?: () => void;
  handleStopLoading?: (result: boolean) => void;

  handleStoryReaderClose?: () => void;
}