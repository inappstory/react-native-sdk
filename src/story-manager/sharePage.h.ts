import {Option, Dict} from "../../global.h";

export enum SharePageEvents {
  START_LOADING = 'startLoad',
  END_LOADING = 'endLoad',
  CLOSE_STORY_READER = 'closeStoryReader',
}


export type SharePageOptions = {

  handleStartLoad?: () => void;
  handleStopLoad?: (result: boolean) => void;

  handleStoryReaderClose?: () => void;
}
