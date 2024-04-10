<template>
  <div class="game-reader" :class="{loading: isLoading}"
       :style="{backgroundImage: coverFile ? `url(${coverFile})` : false}">

    <button @click.stop.prevent="closeGameReader" class="game-reader__close" style="pointer-events: all">
      <span></span>
    </button>

    <iframe ref="gameReaderIframe"
            height="100%"
            width="100%"
            frameborder="0"
            style="
                overflow: auto;
                -webkit-overflow-scrolling: touch;
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                height: 100%;
                z-index: 1;"

            :src="gameFile"
            @load="iframeOnLoad"
            :style="{opacity: isGameInited ? 1 : 0}"
    ></iframe>
    <SharePanel :share-link="shareLink" v-model="sharePanelOpen" @shareComplete="sharePanelComplete"/>
  </div>
</template>

<script lang="ts">


import {Component, Prop, Vue} from "vue-property-decorator";
import StoriesViewer from '../../components/Stories/StoriesViewer/StoriesViewer.vue';
import {PropType} from "vue";
import SharePanel from "../../components/SharePanel/SharePanel.vue";
import {Option} from "../../../../global.h";
import {NarrativeData} from "../../models/NarrativeData";

export type GameData = {
  gameFile: string;
  coverFile: string;
  gameConfig: string;
  addResources: string;
};

@Component({
  name: "GameReader",
  components: {SharePanel},
})
export default class GameReader extends Vue {

  @Prop({type: Object as PropType<Option<GameData>>}) gameData!: Option<GameData>;
  @Prop({type: Boolean}) desktopMode!: boolean;
    @Prop({
        type: Function,
        default: (name: string, data: any) => new Promise((resolve => resolve(undefined)))
    }) storyManagerProxy!: (name: string, data: any) => Promise<any>;

  isLoading: boolean = true;
  isGameInited: boolean = false;
  iframeElement!: HTMLIFrameElement;
  shareLink: Option<string> = null;
  sharePanelOpen = false;

  get coverFile(): Option<string> {
    if (this.gameData !== null) {
      return this.gameData.coverFile;
    }
    return null;
  }

  get gameFile(): Option<string> {
    if (this.gameData && this.gameData.gameFile) {
      // replace for https://games.test.inappstory.com/fifteen-puzzle/v1/build/fifteen-puzzle-game_v1.zip

      // https://stackoverflow.com/questions/51568821/works-in-chrome-but-breaks-in-safari-invalid-regular-expression-invalid-group
      // Looks like Safari doesn't support lookbehind yet https://caniuse.com/js-regexp-lookbehind
      // return this.gameData.gameFile.replace(/(?<=build\/).+\.zip$/, 'index.html');
      return this.gameData.gameFile.replace(/(build\/).+\.zip$/, 'build/index.html');

    }
    return null;
  }

  get gameFileOrigin(): Option<string> {
    if (this.gameFile !== null) {
      return new URL(this.gameFile).origin;
    }
    return null;
  }

  get gameConfig() {
    const config = this.gameData?.gameConfig;
    const resources = this.gameData?.addResources;

    if (config && resources) {
      if (Array.isArray(resources) && resources.length > 0) {
        for (let key of Object.keys(config)) {
          if (config.hasOwnProperty(key)) {
            for (let i = 0; i < resources.length; i++) {
              if (resources[i]['key'] === (config as any)[key]) {
                (config as any)[key] = resources[i]['url'];
              }
            }
          }
        }
      }
    }
    return config;
  }

  created() {
    window.addEventListener("message", this.messageListener, false);
  }

  destroyed() {
    window.removeEventListener("message", this.messageListener);
  }

  messageListener(event: MessageEvent) {
    if (event.origin !== this.gameFileOrigin)
      return;

    const data = event.data;
    if (Array.isArray(data)) {
      switch (data[0]) {
        case "gameLoaded": {
          this.isLoading = false;
          this.isGameInited = true;

          // todo сфдд only after image render complete
          // inited = true - for close X
          // window.initGame(data[1]);
        }
          break;
        case "gameComplete": {
          let payload = undefined;
          try {
            if (data[1] !== undefined) {
              payload = data[1];
              // payload = JSON.parse(data[1]);
            }
          } catch (e) {
            console.error(e);
          }
          this._closeGameReader(payload);
        }
          break;
        case "share": {
          let id = undefined;
          let config = undefined;
          try {
            if (data[1] !== undefined) {
              id = data[1];
            }
            if (data[2] !== undefined) {
              config = data[2];
            }
          } catch (e) {
            console.error(e);
          }
          this._shareAction(id, config);
        }
          break;
          case "sendApiRequest": {
              try {
                  if (data[1] !== undefined) {
                      let payload = data[1];
                      // if (needSession()) {
                      NarrativeData.sendApiRequestPromise(payload, (cb: string, plainData: string) => this.sendEventToGame('cb', {cb, plainData}), this.storyManagerProxy);
                      // }

                      // payload = JSON.parse(data[1]);
                  }
              } catch (e) {
                  console.error(e);
              }
          } break;

      }


    }

  }

  get gameReaderWindow(): Option<Window> {
    if (this.iframeElement) {
      if (this.iframeElement.contentWindow !== null) {
        return this.iframeElement.contentWindow;
      }
    }
    return null;
  }

  sendEventToGame(name: string, data?: any): boolean {
    if (!this.gameReaderWindow) {
      return false;
    }
    if (!this.gameFileOrigin) {
      return false;
    }
    this.gameReaderWindow.postMessage([name, data], this.gameFileOrigin);
    return true;
  }


  iframeOnLoad(el: Event): void {
    this.iframeElement = el.target as HTMLIFrameElement;
    this.sendEventToGame('initGame', this.gameConfig);
  }

  // deprecated
  updateIframeContent(content: string): void {
    if (this.$refs['gameReaderIframe'] !== null && this.$refs['gameReaderIframe'] !== undefined) {
      const iframeElement = (this.$refs['gameReaderIframe'] as HTMLFrameElement);
      if (iframeElement.contentWindow !== null && iframeElement.contentWindow.document !== null) {
        iframeElement.contentWindow.document.write(content);
        iframeElement.contentWindow.document.close();
      }
    }
  }

  closeGameReader(): void {
    if (this.isGameInited) {
      this.sendEventToGame('closeGameReader');
    } else {
      this._closeGameReader();
    }
  }

  _closeGameReader(data?: object): void {
    const iframeElement = (this.$refs['gameReaderIframe'] as HTMLFrameElement);
    if (iframeElement.contentWindow !== null) {
      iframeElement.src = 'about:blank';
    }

    // @ts-ignore
    (this.$parent as StoriesViewer).closeGameReader();
    // @ts-ignore
    (this.$parent as StoriesViewer).resumeAndEnableReaderUIForGameReader();
    this.isGameInited = false;

    // pass ev to story
    if ((window as any)._narrative_game) {
      (window as any)._narrative_game.complete(data);
    }

  }

  shareId: string = '';

  _shareAction(id: string, config: { url: string }) {
    this.shareId = id;
    const sharePath = config?.url;

    const openSharePanel = () => {
      this.shareLink = sharePath;
      this.sharePanelOpen = true;
    }

    if (this.desktopMode || !(navigator as any).share) {
      openSharePanel();
    } else {
      try {

        if ((navigator as any).share) {
          (navigator as any).share({
            url: sharePath,
          })
            .then(() => {
              this._shareComplete(id, true);
            })
            .catch((error: any) => {
                this._shareComplete(id, false);
              }
            );
        }
      } catch (e) {
        // navigator.share есть но не срабатывает на win 7 например
        openSharePanel();
      }
    }

  }

  _shareComplete(id: string, isSuccess: boolean) {
    this.sendEventToGame('shareComplete', {id, isSuccess});
  }

  sharePanelComplete(isSuccess: boolean) {
    this._shareComplete(this.shareId, isSuccess);
  }


}

</script>

<style lang="scss">

@keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}

.game-reader {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 1;
  /*background-color: rgba(255,255,255,0.8);*/
  user-select: none;
  pointer-events: all;

  background: {
    position: center center;
    size: cover;
    repeat: no-repeat;
  };


  &:after {
    display: none;
    position: absolute;
    top: calc(50% - 2rem / 2);
    left: calc(50% - 2rem / 2);
    content: '';
    width: 2rem;
    height: 2rem;
    border: solid 2px #D3DAE6;
    //border-color: var(color-primary, #006BB4) #D3DAE6 #D3DAE6 #D3DAE6;
    border-color: #006BB4 #D3DAE6 #D3DAE6 #D3DAE6;
    // #1BA9F5 #343741 #343741 #343741; for dark theme
    border-radius: 50%;
    animation: spin .6s infinite linear;
  }

  &.loading {
    &:after {
      display: inline-block;
    }
  }


}

.game-reader__close {
  border: 0;
  padding: 0;
  background: transparent;
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 1140;
  pointer-events: all;
  cursor: pointer;
  outline: none;

  &:focus {
    outline: none;
  }

  span {
    display: block;
    width: 25px;
    height: 25px;
    fill: white;
    stroke: white;
    background-image: url("closer.svg");
  }
}


</style>
