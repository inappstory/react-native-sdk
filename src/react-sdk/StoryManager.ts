import {StoryManager as AbstractStoryManager} from "../story-manager";
import {IWidgetStoriesList} from "../widget-stories-list";
import {WidgetStoriesList} from "../widget-stories-list/react";
import {Dict, Option} from "../../global.h";
import {AppearanceManager} from "../story-manager/AppearanceManager";
import Fingerprint2 from "fingerprintjs2";
import {ISessionInitData} from "../story-manager/models/Session2";
import {DeviceId} from "../story-manager/models/storyManagerConfig/index.h";
import {localStorageGet, localStorageSet} from "../helpers/localStorage";
import {isString} from "../helpers/isString";

export class StoryManager extends AbstractStoryManager {

    createWidgetStoriesList(appearanceManager: AppearanceManager, feedSlug?: string): { widget: IWidgetStoriesList, widgetLoadedPromise: Promise<void> } {
        const widget = new WidgetStoriesList(appearanceManager);

        this.appearanceManager = appearanceManager;

        const widgetLoadedPromise = new Promise<void>((resolve, reject) => {
            widget.on("widgetLoaded", () => {
                this._storiesListWidgetLoaded(widget, appearanceManager);
                resolve();
            });
        });

        return {widget, widgetLoadedPromise};
    }


  getDeviceInfo(configDeviceIdChanged: (device_id: DeviceId) => void): Promise<ISessionInitData> {

    return new Promise<ISessionInitData>(async (resolve, reject) => {
      let device_data: Option<ISessionInitData> = await this.localStorageGet('device_data');
      let device_id = null;
      if (device_data != null) {
        device_id = device_data.device_id;
      }

      if (device_data != null && device_id && isString(device_id) && device_id.trim().length > 0) {
        configDeviceIdChanged(device_id as DeviceId);
        resolve(device_data);
      } else {

        // const start = new Date().getTime();
        Fingerprint2.get({}, (components: any) => {

          const values = components.map( (component: any) => {
            return component.value
          });
          const hash = Fingerprint2.x64hash128(values.join(''), 31);

          // debug(hash); // a hash, representing your device fingerprint
          // debug(components); // an array of FP components

          // debug(new Date().getTime() - start);

          const data: ISessionInitData = {
            platform: 'web',
            device_id: hash,
          };

          for (let i = 0; i < components.length; i++) {
            if (components[i].key !== undefined && components[i].value !== undefined) {
              let key = components[i].key;
              let value = components[i].value;
              if (key === 'screenResolution') {
                if (Array.isArray(value) && value[0] !== undefined && value[1] !== undefined) {
                  data.screen_height = value[0];
                  data.screen_width = value[1];
                }
              } else if (key === 'userAgent') {

                // todo использовать bowser
                // let ua = new UAParser(value);
                // data.model = ua.getDevice().model;
                // data.manufacturer = ua.getDevice().vendor;
                // data.brand = ua.getDevice().vendor;
                // data.os_name = ua.getOS().name;
                // data.os_version = ua.getOS().name + ' ' + ua.getOS().version;
              }
            }
          }

          this.localStorageSet('device_data', data);

          configDeviceIdChanged(data.device_id as DeviceId);
          resolve(data);

        });


      }

    });

  }

  localStorageGet<T extends object>(key: string): Promise<Option<T>> {
    return Promise.resolve(localStorageGet<T>(key));
  }

  localStorageSet(key: string, data: object): Promise<void> {
    localStorageSet(key, data);
    return Promise.resolve();
  }

  localStorageGetArray<T extends any>(key: string): Promise<Option<Array<T>>> {
    return this.localStorageGet(key);
  }

  localStorageSetArray(key: string, data: Array<any>): Promise<void> {
    return this.localStorageSet(key, data);
  }

}
