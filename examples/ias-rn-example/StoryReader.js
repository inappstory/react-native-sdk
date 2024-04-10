import React, {Component, useRef} from 'react';
import {WebView} from 'react-native-webview';
import {Colors} from "react-native/Libraries/NewAppScreen";

class StoryReader extends Component {

//     constructor() {
//         // super(props);
// //        this.state = {loaded: false};
//     }

    constructor(props) {
        super(props);

        props.$storyState.watch(state => {

            // console.log('apply: ' + state['mutation']['type']);
            // console.log('apply1: ' + JSON.stringify(state));

            if (state) {

                console.log('call watch');
                let cb = () => {
                    console.log('run cb');
                    this.webview.injectJavaScript(
                        `
        const state = ${JSON.stringify(state)};
        console.log('call onSyncStore');
        console.log('apply2: ' + state.mutation.type);
        try {
              window.cur.RpcMethods.onSyncStore(state);
          } catch(e) {
            console.log('err: ' + JSON.stringify(e));
          }
      console.log('call onSyncStore2: ' + state.mutation.type);
      true;
    `
                    );
                };

                if (!this.webview) {
                    setTimeout(() => cb(), 1000);
                } else {
                    cb();
                }
            }

        });

    }

    webViewMessageHandler = (event) => {
        console.log('log event: ' + event.nativeEvent.data);
        try {

            if (event.nativeEvent.data) {
                const data = JSON.parse(event.nativeEvent.data);
                if (Array.isArray(data)) {
                    if (data[0] === 'event') {

                        if (data[1] === 'clickOnStory') {
                            console.log('clickOnStory', data);
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

    handleOpen = (payload) => {
        const data = {
            id: 5333,
            index: 0,
            isDeepLink: false
        };
//  (<any>window).cur.RpcMethods
        // onOpenReader
    }

    // console.log('render storyReader');
    render() {
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
                scrollStyle: 'flat',
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
        <link rel="stylesheet" type="text/css" href="${baseUrl}/css/storiesReader.css?v=${buildVersion}"/>
        
        <script type="text/javascript">
        ${debugging}
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
<script type="text/javascript" src="${baseUrl}/js/storiesReader.js?v=${buildVersion}"></script>
<div id="app"><div id="_app"></div></div>
<script type="text/javascript">
    WStoriesReader.init(${JSON.stringify(widgetParams)});
    console.log('after init');
    window.cur.Rpc = {};
    window.cur.Rpc.callMethod = (...args) => {
         window.ReactNativeWebView.postMessage(JSON.stringify(args));
    };
    true;
</script>`;

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


        const run = `
        console.log('run2');
        console.log(window.innerHeight);
        console.log(window.innerWidth);
        
        // WStories.init(_params);
        
        // console.log(JSON.stringify(window.cur.RpcMethods));
        const data = {
            id: 5333,
            index: 0,
            isDeepLink: false
        };
        // window.cur.RpcMethods.onOpenReader(data);
      // document.body.style.backgroundColor = 'blue';
      window.cur.RpcMethods.onOpenReader(data);
      
      
      
      
      

      
      true;
    `;


        setTimeout(() => {
            console.log('run1');
            this.webview.injectJavaScript(run);
        }, 3000);


        return (
            <WebView
                ref={(ref) => (this.webview = ref)}
                style={this.props.style}
                nativeConfig={{props: {webContentsDebuggingEnabled: true}}}
                // scalesPageToFit={false}
                originWhitelist={['*']}
                onMessage={this.webViewMessageHandler}
                source={{
                    baseUrl: 'https://test.inappstory.com',
                    html,
                }}
            />
        );
    }


}

export default StoryReader;
