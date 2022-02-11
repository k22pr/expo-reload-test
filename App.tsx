import React from "reactn";
import { AppState, StyleSheet } from "react-native";
import { setGlobal, useGlobal, useState, useDispatch } from "reactn";
import { NativeBaseProvider, Box, useToast } from "native-base";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Updates from "expo-updates";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

setGlobal<any>({
  initLoaded: false,
  mqttMessageList: [],
  tokenObject: {},
});

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const toast = useToast();
  const [initLoaded, initLoadedSetter] = React.useGlobal<any>("initLoaded");

  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(appState.current);

  React.useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = async (nextAppState: any) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      console.log("App has come to the foreground!");
      await Updates.reloadAsync();
    } else {
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  React.useEffect(() => {
    (async () => {
      if (!__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (e) {}
      }

      await initLoadedSetter(true);
    })();
  }, []);

  if (!isLoadingComplete || !initLoaded) {
    return null;
  } else {
    return (
      <NativeBaseProvider>
        <Navigation colorScheme={colorScheme} />
      </NativeBaseProvider>
    );
  }
}
