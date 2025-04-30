import { useFonts } from "expo-font";

const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins/Poppins-Italic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Baloo-Regular": require("../assets/fonts/Baloo/Baloo-Regular.ttf"),
    "HipsterScriptPro": require("../assets/fonts/HipsterScript/HipsterScriptPro.ttf"),
  });

  return fontsLoaded;
};

export default useCustomFonts;
