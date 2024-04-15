/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from "react";
import { Platform, Text, View } from "react-native";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StoryReader } from "react-native-ias";
import { appearanceManager, storyManager } from "./services/StoryService";
import { MainScreen } from "./screen/MainScreen";
import NetworkLogger from "react-native-network-logger";
import { RNWelcome } from "./screen/RNWelcome";

// function App(): JSX.Element {
//     return <NavigationContainer />;
// }

// function HomeScreen() {
//     return (
//         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//             <Text>Home!</Text>
//         </View>
//     );
// }

function SettingsScreen() {
    useFocusEffect(() => {
        setTimeout(() => storyManager.showStory(16932, appearanceManager), 1000);
    });
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Settings!</Text>
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    animationEnabled: Platform.select({
                        ios: true,
                        android: true,
                    }),
                    animation: "default",
                    presentation: "card",
                    headerShown: true,
                    gestureEnabled: false,
                    gestureResponseDistance: 500,
                    headerStyle: {
                        backgroundColor: "#0c62f3",
                    },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}>
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="RNWelcome" component={RNWelcome} />
                <Stack.Screen name="NetworkLogger" component={NetworkLogger} />
            </Stack.Navigator>
            <StoryReader storyManager={storyManager} />
        </NavigationContainer>
    );
}

// version migrate
