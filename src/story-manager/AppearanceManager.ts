import {AppearanceCommonOptions, AppearanceCommonOptionsDefault} from "./appearanceCommon.h";
import {StoriesListOptions, StoriesListOptionsDefault} from "../widget-stories-list/index.h";
import {StoryReaderOptions, StoryReaderOptionsDefault} from "./types/storyManager/storyReader";
import {StoryFavoriteReaderOptions, StoryFavoriteReaderOptionsDefault} from "./types/storyManager/storyFavoriteReader";

import {GoodsWidgetOptions, GoodsWidgetOptionsDefault} from "./types/storyManager/goodsWidget";
import deepmerge from "deepmerge";

export class AppearanceManager {
  constructor() {
  }

  private _commonOptions: AppearanceCommonOptions = AppearanceCommonOptionsDefault;

  public setCommonOptions(options: AppearanceCommonOptions): AppearanceManager {
    // + fonts
    this._commonOptions = deepmerge(this._commonOptions, options);
    return this;
  }

  public get commonOptions(): AppearanceCommonOptions {
    return this._commonOptions;
  }

  private _storiesListOptions: StoriesListOptions = StoriesListOptionsDefault;

  public setStoriesListOptions(options: StoriesListOptions): AppearanceManager {
    // validator
    this._storiesListOptions = deepmerge(this._storiesListOptions, options);
    return this;
  }

  public get storiesListOptions(): StoriesListOptions {
    return this._storiesListOptions;
  }

  private _storyReaderOptions: StoryReaderOptions = StoryReaderOptionsDefault;

  public setStoryReaderOptions(options: StoryReaderOptions): AppearanceManager {
    // + icons overload

    this._storyReaderOptions = deepmerge(this._storyReaderOptions, options);
    return this;
  }

  public get storyReaderOptions(): StoryReaderOptions {
    return this._storyReaderOptions;
  }

  private _storyFavoriteReaderOptions: StoryFavoriteReaderOptions = StoryFavoriteReaderOptionsDefault;

  public setStoryFavoriteReaderOptions(options: StoryFavoriteReaderOptions): AppearanceManager {
    this._storyFavoriteReaderOptions = deepmerge(this._storyFavoriteReaderOptions, options);
    return this;
  }

  public get storyFavoriteReaderOptions(): StoryFavoriteReaderOptions {
    return this._storyFavoriteReaderOptions;
  }

  private _goodsWidgetOptions: GoodsWidgetOptions = GoodsWidgetOptionsDefault;

  public setGoodsWidgetOptions(options: GoodsWidgetOptions): AppearanceManager {
    this._goodsWidgetOptions = deepmerge(this._goodsWidgetOptions, options);
    return this;
  }

  public get goodsWidgetOptions(): GoodsWidgetOptions {
    return this._goodsWidgetOptions;
  }

}
