import { Text, TextProps, StyleSheet } from "react-native";

const fontMapping: Record<string, string> = {
  "100": "Poppins-Light",
  "200": "Poppins-Light",
  "300": "Poppins-Light",
  "400": "Poppins-Regular",
  "500": "Poppins-Medium",
  "600": "Poppins-SemiBold",
  "700": "Poppins-Bold",
  "800": "Poppins-Bold",
  "900": "Poppins-Bold",
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ThemeProvider;