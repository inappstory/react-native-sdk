import React, {Component} from 'react';
import {WebView} from 'react-native-webview';
import {Colors} from "react-native/Libraries/NewAppScreen";

const MyInlineWebBackup = (props) => {

    // constructor() {
    //     super();
    //     this.state = {loaded: false};
    // }


    const webViewMessageHandler = (event) => {
        try {
            if (event.nativeEvent.data) {
                const data = JSON.parse(event.nativeEvent.data);
                if (Array.isArray(data)) {
                    if (data[0] === 'clickOnStory') {
                        this.props.setScrollEnabled(false);
                        this.props.setWebviewHeight(this.props.screenHeight);

                        this.props.setWebViewStyle({
                            // flex: 1,
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            // bottom: 0,

                            // width: '100%',
                            height: this.props.screenHeight,
                            // height: webviewHeight,
                        });

                    } else if (data[0] === 'closeStory') {
                        this.props.setScrollEnabled(true);
                        this.props.setWebviewHeight(200);

                        this.props.setWebViewStyle({
                            flex: 1,
                            // width: '100%',
                            // height: 200,
                        });
                    }

                }

            }
        } catch (e) {
            console.error(e);
        }

        // if (event.nativeEvent.data === 'clickOnStory') {
        //     this.setState({
        //         loaded: true
        //     })
        // }
    }


    console.log('render')

    return (






        <WebView
            style={props.style}
            // nativeConfig={{props: {webContentsDebuggingEnabled: true}}}

            scalesPageToFit={false}
            originWhitelist={['*']}
            onMessage={webViewMessageHandler}
            source={{
                baseUrl: 'https://test.inappstory.com',
                html: '' +
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
}

export default MyInlineWebBackup
