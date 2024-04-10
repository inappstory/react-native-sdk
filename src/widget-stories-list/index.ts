import {ListLoadStatus, StoriesListOptions, StoriesListDimensions} from "./index.h";
import {AppearanceCommonOptions} from "../story-manager/appearanceCommon.h";
import {IWidget} from "../widget/IWidget";
import WebView from "react-native-webview";
import {Dict, Option} from "../../global.h";

export interface IWidgetStoriesList extends IWidget {

    get feedSlug(): string;

    get testKey(): Option<string>;

    get listLoadStatus(): ListLoadStatus;

    setListLoadStatusField(key: keyof ListLoadStatus, value: any): void;

  mount(mountSelector: string, storiesListOptions: StoriesListOptions & Pick<AppearanceCommonOptions, "hasFavorite">): Promise<boolean>;

  get containerOptions(): Dict<any>;

  get viewOptions(): Dict<any>;

  createRpcServer<T = HTMLIFrameElement | WebView>(worker: T): void;

  get widgetSrcFile(): string | URL;
  get widgetEntrypoint(): string;



  setStories(payload: any): void;

  setFonts(payload: any): void;

    checkWebPSupport(): Promise<boolean>;


  onStoryOpened(payload: { id: number }): void;

    destructor(): void;

    forUnsubscribe: Array<Function>;

    load(): Promise<ListLoadStatus>;
    reload(): Promise<ListLoadStatus>;

    get storiesListDimensions(): StoriesListDimensions;

}
