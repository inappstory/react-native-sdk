import React, {Component, useEffect, useRef, useState} from 'react';


import {Option} from "../../global.h";
import {StoriesListProps} from "./StoriesList.h";
import {IWidgetStoriesList} from "../widget-stories-list";

import {widgetLoaded} from "../widget-stories-list/rpc";
import {isNil} from "../helpers/isNil";

console.log("sdk React.version: ", React.version, isNil(125));


function StoriesList({storyManager, appearanceManager}: StoriesListProps) {

  // props - StoryManager
  // создать инстанс WidgetStoriesList

  const [widgetStoriesList, setWidgetStoriesList] = useState<Option<IWidgetStoriesList>>(null);

  // get documentSrc && init fn

  const viewRef = useRef<Option<HTMLIFrameElement>>(null);
  const [rpcBind, setRpcBind] = useState<Option<boolean>>(null);

  useEffect(() => {
    // передали опции, создали объект

    // hook, not first render
    // only when Some(storyManager)
    if (widgetStoriesList === null) {
      if (storyManager != null && appearanceManager != null) {
        setWidgetStoriesList(storyManager.createWidgetStoriesList(appearanceManager));
        setRpcBind(false);
      }
    }

    // bind rpc
    if (rpcBind === false && viewRef.current !== null) {
      console.log('bind rpc');
      widgetStoriesList?.createRpcServer(viewRef.current);
      setRpcBind(true);

      // widgetLoaded

    }





    // привязали транспорт и события

    // получили cb от виджета - готовы грузить сторис
    // mounted()

  }, );

  useEffect(() => {
    console.log('options', widgetStoriesList?.viewOptions);
  });


  // get view options

  // bind rpc




  // render if options exists
  return (
    <>
      {widgetStoriesList &&
        <>
          <div {...widgetStoriesList?.containerOptions}>
            <iframe {...widgetStoriesList?.viewOptions} ref={viewRef}/>
          </div>
        </>
      }

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


/*const MyInlineWeb = (props) => {

    // constructor() {
    //     super();
    //     this.state = {loaded: false};
    // }


    const webViewMessageHandler = (event) => {
        // console.log('log event list: ' + event.nativeEvent.data);
        try {

            if (event.nativeEvent.data) {
                const data = JSON.parse(event.nativeEvent.data);
                if (Array.isArray(data)) {
                    if (data[0] === 'event') {

                        if (data[1] === 'syncStore') {
                            props.inputStoryState(data[2]);
                            console.log('start sync: ' + data[2]['mutation']['type']);
                        }
                        if (data[1] === 'sessionInitInternal') {
                            props.inputSessionState(data[2]);
                            console.log('start sync: ' + data[2]);
                        }

                        if (data[1] === 'clickOnStoryInternal') {
                            props.inputOpenStoryId(data[2]['id']);


                            console.log('clickOnStoryInternal', data);
                        }

                    }


                    // if (data[0] === 'clickOnStory') {
                    //     this.props.setScrollEnabled(false);
                    //     this.props.setWebviewHeight(this.props.screenHeight);
                    //
                    //     this.props.setWebViewStyle({
                    //         // flex: 1,
                    //         position: 'absolute',
                    //         left: 0,
                    //         right: 0,
                    //         top: 0,
                    //         // bottom: 0,
                    //
                    //         // width: '100%',
                    //         height: this.props.screenHeight,
                    //         // height: webviewHeight,
                    //     });
                    //
                    // } else if (data[0] === 'closeStory') {
                    //     this.props.setScrollEnabled(true);
                    //     this.props.setWebviewHeight(200);
                    //
                    //     this.props.setWebViewStyle({
                    //         flex: 1,
                    //         // width: '100%',
                    //         // height: 200,
                    //     });
                    // }


                }

            }
        } catch (e) {
            // console.error(e);
        }

        // if (event.nativeEvent.data === 'clickOnStory') {
        //     this.setState({
        //         loaded: true
        //     })
        // }
    }


    console.log('render');

    const debugging = `
     // Debug
     console = new Object();
     console.log = function(log) {
        window.ReactNativeWebView.postMessage(log);
     };
     console.debug = console.log;
     console.info = console.log;
     console.warn = console.log;
     console.error = console.log;
     `;

    const baseUrl = 'https://sdk.test.inappstory.com';
    // const baseUrl = 'http://localhost:8887';
    const apiUrl = 'https://api.test.inappstory.com';
    const buildVersion = 'v1.2.4';

    const widgetParams = {
        apiKey: 'test-key',
        lang: 'en',

        // apiKey: "kDVSi0aLNaooemZ7bHrQJQdTqmOObvzH", // prod
        userId: null,

        tags: "producthunt",
        hasLike: true,
        slider: {
            title: {
                content: 'The best stories',
                color: '#222',
                font: 'normal',
                marginBottom: 20,
            },
            card: {
                title: {
                    color: 'black',
                    font: '14px/16px "Segoe UI Semibold"',
                    padding: 8
                },
                gap: 10,
                height: 100,
                variant: 'quad',
                border: {
                    radius: 20,
                    color: 'blue',
                    width: 2,
                    gap: 3,
                },
                boxShadow: null,
                opacity: 1,
                mask: {
                    color: 'rgba(34, 34, 34, 0.3)'
                },
                read: {
                    border: {
                        radius: null,
                        color: 'green',
                        width: null,
                        gap: null,
                    },
                    boxShadow: null,
                    opacity: null,
                    mask: {
                        color: 'rgba(34, 34, 34, 0.1)'
                    },
                },
            },
            layout: {
                height: 0,
                backgroundColor: 'transparent'
            },
            sidePadding: 20,
            topPadding: 20,
            bottomPadding: 20,
            bottomMargin: 17,
            navigation: {
                showControls: false,
                controlsSize: 48,
                controlsBackgroundColor: 'white',
                controlsColor: 'black'
            },
        },
        reader: {
            closeButtonPosition: 'right',
            scrollStyle: 'cube',
        },
        placeholders: {
            user: 'Guest'
        },
        // optional handler
        storyLinkHandleClick: function (payload) {
            // default behaviour
            window.open(payload.url, '_self');
        },

    };

    // this.on('sessionInitInternal', (payload: any) => storyReader.sessionInit(payload));

    const html = `

    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, shrink-to-fit=no">
        <link rel="stylesheet" type="text/css" href="${baseUrl}/css/storiesSlider.css?v=${buildVersion}"/>

        <script type="text/javascript">
            window.widgetConfig = {
                "api":{
                    "url": "${apiUrl}",
                    "version": "v2",
                    "token": "${widgetParams.apiKey}",
                    "lang": "${widgetParams.lang}"
                },
                "userId":"",
                "tags":""
            };
            true;
        </script>
<script type="text/javascript" src="${baseUrl}/js/storiesSlider.js?v=${buildVersion}"></script>
</head>
<body>
<div id="app"><div id="_app"></div></div>
<script type="text/javascript">
    WStories.init(${JSON.stringify(widgetParams)});
    window.cur.Rpc = {};
    window.cur.Rpc.callMethod = (...args) => {
         window.ReactNativeWebView.postMessage(JSON.stringify(args));
    };
    true;
</script>
</body>
`;

    const events = `
                        '        // 4. Override default loading animation\\n' +
                    '        stories.on(\\'startLoader\\', function (widget) {\\n' +
                    '            widget.style.background = \\'url("https://inappstory.com/stories/loader.gif") center / 45px auto no-repeat transparent\\';\\n' +
                    '        });\\n' +
                    '        stories.on(\\'endLoader\\', function (widget) {\\n' +
                    '            widget.style.background = \\'none\\';\\n' +
                    '        });\\n' +
                    '        stories.on(\\'clickOnStory\\', (data) => {\\n' +
                    '        window.ReactNativeWebView.postMessage(JSON.stringify(["clickOnStory", data]));' +
                    '                })\\n' +
                    '        stories.on(\\'closeStory\\', (data) => {\\n' +
                    '        window.ReactNativeWebView.postMessage(JSON.stringify(["closeStory", data]));' +
                    '                })\\n' +`;

    return (
        <WebView
            style={props.style}
            // nativeConfig={{props: {webContentsDebuggingEnabled: true}}}

            scalesPageToFit={false}
            originWhitelist={['*']}
            onMessage={webViewMessageHandler}
            // nativeConfig={{webContentsDebuggingEnabled: true}}
            source={{
                baseUrl: 'https://test.inappstory.com',
                html,

                html2: '' +
                    '<div>' +


                    '<!-- 1. The <iframe> (and Stories` widget) will be mounted to this <div> tag -->\n' +
                    '<div id="stories_widget"></div>\n' +
                    '\n' +
                    '<script>\n' +
                    '    // 2. This code loads the web-sdk API code asynchronously \n' +
                    '    // and create queue in global var window.IASReady.\n' +
                    '\n' +
                    '    window.IASReady = (function (d, s, id) {\n' +
                    '        var js, fjs = d.getElementsByTagName(s)[0], st = window.IASReady || {};\n' +
                    '        if (d.getElementById(id)) return st;\n' +
                    '        js = d.createElement(s);\n' +
                    '        js.id = id;\n' +
                    '        js.src = "https://sdk.inappstory.com/js/iframe_api.js?v=1";\n' +
                    '        js.async = true;\n' +
                    '        fjs.parentNode.insertBefore(js, fjs);\n' +
                    '        st._e = [];\n' +
                    '        st.ready = function (f) {\n' +
                    '            st._e.push(f);\n' +
                    '        };\n' +
                    '        return st;\n' +
                    '    }(document, "script", "ias-wjss"));\n' +
                    '\n' +
                    '    // 3. This function creates an <iframe> (and Stories` widget)\n' +
                    '    //    after the API code downloads.\n' +
                    '    window.IASReady.ready(function () {\n' +
                    '        var stories = new window.IAS.Stories("stories_widget", {\n' +
                    '            apiKey: "kDVSi0aLNaooemZ7bHrQJQdTqmOObvzH",\n' +
                    '            userId: null,\n' +
                    '            tags: "producthunt",\n' +
                    '            hasLike: true,\n' +
                    '            slider: {\n' +
                    '                title: {\n' +
                    '                    content: \'The best stories\',\n' +
                    '                    color: \'#fff\',\n' +
                    '                    font: \'normal\',\n' +
                    '                    marginBottom: 20,\n' +
                    '                },\n' +
                    '                card: {\n' +
                    '                    title: {\n' +
                    '                        color: \'black\',\n' +
                    '                        font: \'14px/16px "Segoe UI Semibold"\',\n' +
                    '                        padding: 8\n' +
                    '                    },\n' +
                    '                    gap: 10,\n' +
                    '                    height: 100,\n' +
                    '                    variant: \'quad\',\n' +
                    '                    border: {\n' +
                    '                        radius: 20,\n' +
                    '                        color: \'blue\',\n' +
                    '                        width: 2,\n' +
                    '                        gap: 3,\n' +
                    '                    },\n' +
                    '                    boxShadow: null,\n' +
                    '                    opacity: 1,\n' +
                    '                    mask: {\n' +
                    '                        color: \'rgba(34, 34, 34, 0.3)\'\n' +
                    '                    },\n' +
                    '                    read: {\n' +
                    '                        border: {\n' +
                    '                            radius: null,\n' +
                    '                            color: \'green\',\n' +
                    '                            width: null,\n' +
                    '                            gap: null,\n' +
                    '                        },\n' +
                    '                        boxShadow: null,\n' +
                    '                        opacity: null,\n' +
                    '                        mask: {\n' +
                    '                            color: \'rgba(34, 34, 34, 0.1)\'\n' +
                    '                        },\n' +
                    '                    },\n' +
                    '                },\n' +
                    '                layout: {\n' +
                    '                    height: 0,\n' +
                    '                    backgroundColor: \'transparent\'\n' +
                    '                },\n' +
                    '                sidePadding: 20,\n' +
                    '                topPadding: 20,\n' +
                    '                bottomPadding: 20,\n' +
                    '                bottomMargin: 17,\n' +
                    '                navigation: {\n' +
                    '                    showControls: false,\n' +
                    '                    controlsSize: 48,\n' +
                    '                    controlsBackgroundColor: \'white\',\n' +
                    '                    controlsColor: \'black\'\n' +
                    '                },\n' +
                    '            },\n' +
                    '            reader: {\n' +
                    '                closeButtonPosition: \'right\',\n' +
                    '                scrollStyle: \'flat\',\n' +
                    '            },\n' +
                    '            placeholders: {\n' +
                    '                user: \'Guest\'\n' +
                    '            },\n' +
                    '            // optional handler\n' +
                    '            storyLinkHandleClick: function (payload) {\n' +
                    '                // default behaviour\n' +
                    '                window.open(payload.url, \'_self\');\n' +
                    '            },\n' +
                    '        });\n' +
                    '\n' +
                    '        // 4. Override default loading animation\n' +
                    '        stories.on(\'startLoader\', function (widget) {\n' +
                    '            widget.style.background = \'url("https://inappstory.com/stories/loader.gif") center / 45px auto no-repeat transparent\';\n' +
                    '        });\n' +
                    '        stories.on(\'endLoader\', function (widget) {\n' +
                    '            widget.style.background = \'none\';\n' +
                    '        });\n' +
                    '        stories.on(\'clickOnStory\', (data) => {\n' +
                    '        window.ReactNativeWebView.postMessage(JSON.stringify(["clickOnStory", data]));' +
                    '                })\n' +
                    '        stories.on(\'closeStory\', (data) => {\n' +
                    '        window.ReactNativeWebView.postMessage(JSON.stringify(["closeStory", data]));' +
                    '                })\n' +
                    '' +
                    '' +
                    '\n' +
                    '    });\n' +
                    '</script>\n' +
                    ''
            }}
        />
    );
}*/

export {StoriesList};
