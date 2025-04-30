import { useCallback, useEffect, useState } from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the splash screen animation options (optional)
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState<boolean>(false); // Add type annotation
  const [fontLoaded, setFontLoaded] = useState<boolean>(false); // Track font load status

  useEffect(() => {
    async function prepare() {
      try {
        // Load the Poppins font from the assets/fonts folder
        await Font.loadAsync({
          'poppins-regular': require('./assets/fonts/Poppins-Regular.ttf'),
          'poppins-bold': require('./assets/fonts/Poppins-Bold.ttf'), // If you have a bold version
        });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay (optional)
      } catch (e) {
        console.warn(e);
      } finally {
        setFontLoaded(true); // Mark font as loaded
        setAppIsReady(true); // Set app as ready
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady || !fontLoaded) {
    return null; // Show nothing while app is not ready or font is still loading
  }

  // Define the styles
  const containerStyle: ViewStyle = { flex: 1, alignItems: 'center', justifyContent: 'center' };
  const textStyle: TextStyle = {
    fontFamily: 'poppins-regular', // Use the custom Poppins font here
    fontSize: 20,
  };
  const boldTextStyle: TextStyle = {
    fontFamily: 'poppins-bold', // Use the bold version of Poppins
    fontSize: 20,
  };

  return (
    <View style={containerStyle} onLayout={onLayoutRootView}>
      <Text style={textStyle}>SplashScreen Demo! 👋</Text>
      <Text style={boldTextStyle}>This is Poppins Bold!</Text>
    </View>
  );
}
