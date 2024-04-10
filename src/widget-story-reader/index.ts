import {StoryReaderOptions} from "./index.h";
import {AppearanceCommonOptions} from "../story-manager/appearanceCommon.h";
import {IWidget} from "../widget/IWidget";
import WebView from "react-native-webview";
import {
    ClickOnStoryInternalPayload,
    ClickOnStoryInternalWithDataPayload,
    STORY_LIST_TYPE
} from "../story-manager/common.h";
import {Option} from "../../packages/react-native-ias/types/types";
import {IModalPresentation} from "../widget/ModalPresentation";

export interface IWidgetStoryReader extends IWidget, IModalPresentation {

  destructor(): void;

  mount(mountSelector: string, storiesListOptions: any): Promise<boolean>;

  get containerOptions(): Dict<any>;

  get viewOptions(): Dict<any>;

  createRpcServer<T = HTMLIFrameElement | WebView>(worker: T): void;
  destroyRpcServer(): void;

  get widgetSrcFile(): string | URL;
  get widgetEntrypoint(): string;



  openReader(payload: ClickOnStoryInternalWithDataPayload & {hasShare: boolean, soundOn: boolean}, sourceInfo: {listType: STORY_LIST_TYPE, feed: Option<string>}): void;
    closeConnectedReaderWidget(): void;
    closeStoryReaderOrLoader(): void;
  setStories(payload: any): void;

  setFonts(payload: any): void;

  // response on event from Widget inner
    rpcCb(payload: any): void;



  // onStoryOpened(payload: { id: number }): void;


    get sourceInfo(): {listType: STORY_LIST_TYPE, feed: Option<string>};

    setSoundOn(value: boolean): void;

}
