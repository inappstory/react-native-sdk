import React, {useEffect, useRef, useState} from "react";
import {WebView, RNWebView} from './components/WebView';
import {SafeAreaView, View, StyleSheet, StatusBar, ActivityIndicator, Platform, LayoutChangeEvent} from "react-native";

import {Option} from "../../global.h";
import {IWidgetStoryFavoriteReader} from "../widget-story-favorite-reader";
import {StoryFavoriteReaderComponentProps} from "./StoryFavoriteReaderComponent.h";

function StoryFavoriteReaderComponent({storyManager}: StoryFavoriteReaderComponentProps) {

    // props - StoryManager
    // создать инстанс WidgetStoriesList

    const [widgetStoryFavoriteReader, setWidgetStoryFavoriteReader] = useState<Option<IWidgetStoryFavoriteReader>>(null);

    const [needFirstRender, setNeedFirstRender] = useState(false);
    const [needLoaderRender, setNeedLoaderRender] = useState(false);


    // get documentSrc && init fn

    const viewRef = useRef<RNWebView>(null);
    const [rpcBind, setRpcBind] = useState<Option<boolean>>(null);


    // useFirstRender

    useEffect(() => {
        // передали опции, создали объект

        // hook, not first render
        // only when Some(storyManager)
        if (widgetStoryFavoriteReader === null) {
            if (storyManager != null) {

                setWidgetStoryFavoriteReader(storyManager.createWidgetStoryFavoriteReader(setNeedFirstRender, setNeedLoaderRender, widget => {

                    // destroy RPC
                    widget?.destroyRpcServer();

                    widget?.destructor();
                    setRpcBind(null);
                    setWidgetStoryFavoriteReader(null);
                    setNeedFirstRender(false);
                }));
                setRpcBind(false);
            }
        }

        // bind rpc
        if (rpcBind === false && viewRef.current !== null) {
            // console.log("bind rpc");
            widgetStoryFavoriteReader?.createRpcServer<RNWebView>(viewRef.current);
            setRpcBind(true);

            // widgetLoaded

        }


        // привязали транспорт и события

        // получили cb от виджета - готовы грузить сторис
        // mounted()

    },);

    // useEffect(() => {
    // console.log('options [widgetStoryFavoriteReader]', widgetStoryFavoriteReader?.viewOptions);
    // });


    // get view options

    // bind rpc


    // render if options exists
    // onMessage={handler}

    const [attachedToLayout, setAttachedToLayout] = useState(false);
    const onLayout = ({nativeEvent}: LayoutChangeEvent) => {
        if (nativeEvent?.layout?.width) {
            setAttachedToLayout(true);
        } else {
            setAttachedToLayout(false);
        }
    };

    return (
        <>
            {widgetStoryFavoriteReader && needFirstRender &&
                <SafeAreaView style={{...styles.container, backgroundColor: "#000"}}>
                    <StatusBar barStyle="light-content" backgroundColor="#000"/>
                    <View {...widgetStoryFavoriteReader?.containerOptions} onLayout={onLayout}>
                        {attachedToLayout && <WebView {...widgetStoryFavoriteReader?.viewOptions} ref={viewRef} />}
                    </View>
                </SafeAreaView>
            }
            {needLoaderRender && <View style={{...styles.container, backgroundColor: "#000"}}>
                <ActivityIndicator size="large" color={Platform.select({ios: "#999999", android: "#ffffff"})}/>
            </View>}

            {/*<View style={{position: 'relative', height: 200}}>

        <MyInlineWeb style={{width: '100%', height: webviewHeight,
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
          // backgroundColor: 'transparent',
        }}
                     setScrollEnabled={setScrollEnabled} setWebviewHeight={setWebviewHeight} screenHeight={ScreenHeight}
                     setWebViewStyle={setWebViewStyle}

                     inputStoryState={inputStoryState}
                     $storyState={$storyState}

                     inputSessionState={inputSessionState}
                     $sessionState={$sessionState}
                     inputOpenStoryId={inputOpenStoryId}
        />

      </View>*/}

        </>);

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        width: "100%",
        height: "100%",
    },
});

export {StoryFavoriteReaderComponent};
