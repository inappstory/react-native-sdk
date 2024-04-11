import React, { ForwardedRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { WebView as RNWebView, WebViewProps } from "react-native-webview";

// This is to prevent a crash on specific Android versions,
// see https://github.com/react-native-webview/react-native-webview/issues/429
// for all versions
const SHOULD_USE_OPACITY_HACK = Platform.OS === "android"; /* && Platform.Version >= 28*/

export { RNWebView };

export const WebView = React.forwardRef(
    ({ style, ...passThroughProps }: WebViewProps, ref: ForwardedRef<RNWebView>) => {
        return (
            <RNWebView
                nativeConfig={{ props: { webviewDebuggingEnabled: true, allowsInlineMediaPlayback: true } }}
                scalesPageToFit={false}
                originWhitelist={["*"]}
                automaticallyAdjustContentInsets={false}
                keyboardDisplayRequiresUserAction={false}
                {...passThroughProps}
                style={SHOULD_USE_OPACITY_HACK ? [style, styles.opacityHack] : style}
                ref={ref}
                forceDarkOn={false}
                mediaPlaybackRequiresUserAction={false}
                textZoom={100} // https://stackoverflow.com/questions/49749440/webview-stop-using-device-font-setting-and-use-style-specified-in-the-html
            />
        );
    }
);

// export type WebView = typeof WebView;

const styles = StyleSheet.create({
    opacityHack: {
        opacity: 0.9999,
    },
});
