import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions
} from "react-native/Libraries/NewAppScreen";
import {Dimensions, SafeAreaView, ScrollView, Text, View, StyleSheet, ImageBackground} from "react-native";
import MyInlineWeb from "./MyInlineWeb";
import StoryReader from "./StoryReader";
import {createEvent, createStore} from "effector";
import {StoriesList} from "ias-rn";
import {createAppearanceManager, createStoryManager} from "./StoriesHelper";


const inputStoryState = createEvent();
const $storyState = createStore({}).on(inputStoryState, (state, payload) => payload);




// export default function App() {
//   const isLoadingComplete = useCachedResources();
//   const colorScheme = useColorScheme();
//
//   if (!isLoadingComplete) {
//     return null;
//   } else {
//     return (
//       <SafeAreaProvider>
//         <Navigation colorScheme={colorScheme} />
//         <StatusBar />
//       </SafeAreaProvider>
//     );
//   }
// }


const Section = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
      <View style={styles.sectionContainer}>
        <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.white : Colors.black,
              },
            ]}>
          {title}
        </Text>
        <Text
            style={[
              styles.sectionDescription,
              {
                color: isDarkMode ? Colors.light : Colors.dark,
              },
            ]}>
          {children}
        </Text>
      </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#222' : Colors.lighter,
  };

    const ScreenHeight = Dimensions.get("window").height;

    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [webviewHeight, setWebviewHeight] = useState(200);
    const [webViewStyle, setWebViewStyle] = useState({flex: 1});



  // можно кастомный хук сделать

  const [storyManager, setStoryManager] = useState(null);
  const [appearanceManager, setAppearanceManager] = useState(null);
  useEffect(() => {
    setStoryManager(createStoryManager());
    setAppearanceManager(createAppearanceManager());

    return () => {
      storyManager.destructor();
    };
  }, []);

  return (

      // <MyInlineWeb/>

      <SafeAreaView style={Object.assign({}, backgroundStyle, {        flex: 1,
        position: 'relative'})}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"

            // contentContainerStyle={{       alignItems: 'center',
            //   justifyContent: 'center'}}

            // contentContainerStyle={styles.outer}

            // style={Object.assign({}, backgroundStyle, {        position: 'absolute',
            //   top: 0,
            //   bottom: 0,
            //   left: 0,
            //   right: 0,
            //   paddingTop: 200})}
            style={Object.assign({}, backgroundStyle, {backgroundColor: 'transparent'})}
            scrollEnabled={scrollEnabled}
        >
          <Header />

          {/*ScreenHeight  and block scroll in ScrollView*/}
          {/*style={webViewStyle}*/}

          <StoriesList storyManager={storyManager} appearanceManager={appearanceManager}/>

            {/* это все внутрь переносить*/}
{/*        <View style={{position: 'relative', height: 200}}>
            <MyInlineWeb style={{width: '100%', height: webviewHeight,
                backgroundColor: isDarkMode ? Colors.black : Colors.white,
                // backgroundColor: 'transparent',
            }}
                         setScrollEnabled={setScrollEnabled} setWebviewHeight={setWebviewHeight} screenHeight={ScreenHeight}
                         setWebViewStyle={setWebViewStyle}

                         inputStoryState={inputStoryState}
                         $storyState={$storyState}
            />
        </View>*/}

          <View
              style={{
                backgroundColor: isDarkMode ? Colors.black : Colors.white
                // backgroundColor: 'transparent'
              }}>

            {/*<WebViewScreen />*/}

            <Section title="Step One">
              Edit <Text style={styles.highlight}>App.js</Text> to change this
              screen and then come back to see your edits.
            </Section>
            <Section title="See Your Changes">
              <ReloadInstructions />
            </Section>
            <Section title="Debug">
              <DebugInstructions />
            </Section>
            <Section title="Learn More">
              Read the docs to discover what to do next:
            </Section>
            <LearnMoreLinks />
          </View>

        </ScrollView>
          <ImageBackground source={require('./assets/images/CommonBackground.jpg')} style={[styles.fixed, styles.container, {zIndex: 1}]} resizeMode="cover"/>

          <View style={[{width: '100%', height: ScreenHeight,
              backgroundColor: isDarkMode ? Colors.black : Colors.white,
              // backgroundColor: 'transparent',
          }, {zIndex: 100}]}>
              <StoryReader style={[styles.fixed, styles.container]}
                           inputStoryState={inputStoryState}
                           $storyState={$storyState} />
          </View>


      </SafeAreaView>
  );
};

const styles = StyleSheet.create({

    container: {
        width: Dimensions.get("window").width, //for full screen
        height: Dimensions.get("window").height //for full screen
    },
    fixed: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    bgImage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },

  outer: {
    flex: 1,
  },
  inner: {
    flex: 1
  },



});

export default App;
