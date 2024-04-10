import { DeviceInformation } from "../index.h";

export async function fetchDeviceInfo(
    getDeviceInformation: () => Promise<DeviceInformation>,
    APIInstance: any,
    resolve: (result: boolean) => void,
    reject: (e: any) => void
) {
    // console.log({StoryManager})
    // const info = await StoryManager.getInstance().getDeviceInformation();
    const info = await getDeviceInformation();

    // userAgent = "InAppStorySDK/" + BuildConfig.VERSION_CODE
    //     + " " + System.getProperty("http.agent") + " " + " Application/" + appVersion + " (" + appPackageName + " " + appVersionName + ")";

    // InAppStorySDK/115 Dalvik/2.1.0 (Linux; U; Android 8.0.0; Android SDK built for x86 Build/OSR1.180418.026)  Application/1 (com.inappstory.sdk.demo 1.0)

    APIInstance.baseHeaders = {
        "X-Sdk-Version": info.sdkVersion,
        "X-App-Package-Id": info.applicationBundleId,
        "X-User-Agent": info.userAgent,
        "X-Device-Id": info.deviceId,
    };

    APIInstance.deviceId = info.deviceId;

    resolve(true);

    // deviceId
    // let uniqueId = DeviceInfo.getUniqueId();
    // iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
    // Android: "dd96dec43fb81c97"

    // getVersion()
    // Gets the application version. Take into account that a version string is device/OS formatted and can contains any additional data (such as build number etc.). If you want to be sure about version format, you can use a regular expression to get the desired portion of the returned version string.
    //
    //     Examples
    // let version = DeviceInfo.getVersion();

    // iOS: "1.0"
    // Android: "1.0" or "1.0.2-alpha.12"

    // DeviceInfo.getUserAgent().then((userAgent) => {
    //     // iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143"
    //     // tvOS: not available
    //     // Android: ?
    //     // Windows: ?
    // });
}
