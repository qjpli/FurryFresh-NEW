import { StyleSheet, View, Image, ScrollView } from "react-native";
import dimensions from "../../utils/sizing";
import React from "react";

interface MainContPawProps {
  children: React.ReactNode;
  showPetImage?: boolean;
  paddingHorizontal?: number | null;
  paddingVertical?: number | null;
  allowScroll?: boolean;
}

const MainContPaw: React.FC<MainContPawProps> = ({
  children,
  showPetImage = false,
  paddingHorizontal = null,
  paddingVertical = null,
  allowScroll = true
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/general/paw-watermark.png")}
        style={[styles.paw, styles.topLeftCircle]}
      />

      <Image
        source={require("../../assets/images/general/paw-watermark.png")}
        style={[styles.paw, styles.middleRightCircle]}
      />

      <Image
        source={require("../../assets/images/general/paw-watermark.png")}
        style={[styles.paw, styles.bottomLeftCircle]}
      />

      {showPetImage && (
        <Image
          source={require("../../assets/images/general/paw-watermark.png")}
          style={styles.petenjoy}
        />
      )}

      {allowScroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingHorizontal, paddingVertical }}>{children}</View>
        </ScrollView>
      ) : (
        <View style={{ paddingHorizontal, paddingVertical }}>{children}</View>
      )}


    </View>
  );
};

export default MainContPaw;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    position: "relative",
  },
  paw: {
    position: "absolute",
    width: dimensions.screenWidth * 0.45,
    height: dimensions.screenWidth * 0.5,
  },
  topLeftCircle: {
    top: -dimensions.screenHeight * 0.11,
    left: -dimensions.screenWidth * 0.15,
    transform: [{ rotate: "40deg" }],
  },
  middleRightCircle: {
    top: dimensions.screenHeight * 0.25,
    right: -dimensions.screenWidth * 0.16,
    transform: [{ rotate: "-40deg" }],
  },
  bottomLeftCircle: {
    bottom: -dimensions.screenHeight * 0.055,
    left: -dimensions.screenWidth * 0.03,
    transform: [{ rotate: "30deg" }],
  },
  petenjoy: {
    position: "absolute",
    width: dimensions.screenWidth * 0.42,
    height: dimensions.screenWidth * 0.42,
    bottom: -dimensions.screenHeight * 0.04,
    left: dimensions.screenWidth * 0.28,
    right: dimensions.screenWidth * 0.28,
  },
});
