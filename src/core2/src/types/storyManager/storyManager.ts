import {Dict, Optional} from "../index";

export type StoryManagerConfig = {
  apiKey: string;
  userId?: Optional<string|number>;
  tags?: Optional<Array<string>>;
  placeholders?: Optional<Dict<string>>;
  lang?: Optional<'ru' | 'en'>;
};


const StoryManagerConfigDefault: StoryManagerConfig = {
  apiKey: "",

};

export {StoryManagerConfigDefault};