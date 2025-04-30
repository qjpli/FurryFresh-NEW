import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import dimensions from "../../utils/sizing";
import { GestureDetector, GestureHandlerRootView, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const tips = [
  {
    id: 1,
    title: "Regular Vet Check-ups",
    text:
      "Schedule annual veterinary visits to monitor your pet’s health and catch any issues early.",
    image: require("../../assets/images/others/healthTips1.png"),
  },
  {
    id: 2,
    title: "Vaccinations",
    text:
      "Keep your pet’s vaccinations up to date to protect against common diseases.",
    image: require("../../assets/images/others/healthTips2.png"),
  },
  {
    id: 3,
    title: "Parasite Prevention",
    text:
      "Use preventive treatments for fleas, ticks, and worms to keep your pet safe and healthy.",
    image: require("../../assets/images/others/healthTips3.png"),
  },
  {
    id: 4,
    title: "Healthy Weight Management",
    text:
      "Expose your pet to different environments, people, and other animals to promote good behavior and reduce anxiety.",
    image: require("../../assets/images/others/healthTips4.png"),
  },
  {
    id: 5,
    title: "Observe Behavior Changes",
    text:
      "Be attentive to any changes in your pet’s behavior, appetite, or energy levels, and consult your vet if you notice anything unusual.",
    image: require("../../assets/images/others/healthTips5.png"),
  },
];

const HealthTipsScreen = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const translateX = useSharedValue(0);

  const handleBackPress = () => {
    router.push("../tips/home");
  };

  const handleSwipe = (direction: "left" | "right") => {
    const total = tips.length;
    const nextIndex =
      direction === "left"
        ? (currentTipIndex + 1) % total
        : (currentTipIndex - 1 + total) % total;
    setCurrentTipIndex(nextIndex);
  };

  const swipeGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationX < -50) {
        translateX.value = withTiming(-dimensions.screenWidth, {}, () => {
          runOnJS(handleSwipe)("left");
          translateX.value = 0;
        });
      } else if (e.translationX > 50) {
        translateX.value = withTiming(dimensions.screenWidth, {}, () => {
          runOnJS(handleSwipe)("right");
          translateX.value = 0;
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value) }],
  }));

  const tip = tips[currentTipIndex];

  return (
    <View style={styles.container}>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={require("../../assets/images/general/furry-fresh-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>
              You can swipe sideways to browse through the tips!
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)} 
            >
              <Text style={styles.modalButtonText}>Noted!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.circle} onPress={handleBackPress}>
        <Image
          source={require("../../assets/images/others/arrowBack.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <GestureHandlerRootView>
        <GestureDetector gesture={swipeGesture}>
        <Animated.View style={animatedStyle}>
  {tips.map((item, index) => {
    if (index !== currentTipIndex) return null;

    return (
      <View key={item.id}>
        <View style={styles.centerBox}>
          <Text style={styles.centerText}>Tip #{item.id}</Text>
        </View>

        {item.id === 1 && (
          <Image
            source={item.image}
            style={[styles.bathingImage, { borderRadius: 20 }]} 
            resizeMode="contain"
          />
        )}

        {item.id === 2 && (
          <Image
            source={item.image}
            style={[styles.bathingImage, { width: dimensions.screenWidth * 0.7 }]} 
            resizeMode="contain"
          />
        )}

        {item.id === 3 && (
          <Image
            source={item.image}
            style={[styles.bathingImage, { width: dimensions.screenWidth * 0.7 }]} 
            resizeMode="contain"
          />
        )}
  
  
        {item.id === 4 && (
          <Image
            source={item.image}
            style={[styles.bathingImage, { width: dimensions.screenWidth * 0.6 }]} 
            resizeMode="contain"
          />
        )}
  

         {item.id === 5 && (
          <Image
            source={item.image}
            style={[styles.bathingImage, { width: dimensions.screenWidth * 0.5 }]} 
            resizeMode="contain"
          />
            )}

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.subtitleText}>{item.text}</Text>
        </View>
      </View>
    );
  })}
</Animated.View>

        </GestureDetector>
      </GestureHandlerRootView>

      <Image
        source={require("../../assets/images/others/paw1.png")}
        style={styles.paw1Image}
        resizeMode="contain"
      />
      <Image
        source={require("../../assets/images/others/paw2.png")}
        style={styles.paw2Image}
        resizeMode="contain"
      />
    </View>
  );
};

export default HealthTipsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D0DFF4",
    padding: 20,
  },
  circle: {
    width: dimensions.screenWidth * 0.13,
    height: dimensions.screenWidth * 0.13,
    backgroundColor: "#466AA2",
    borderRadius: (dimensions.screenWidth * 0.13) / 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: dimensions.screenWidth * 0.07,
    marginLeft: dimensions.screenWidth * 0.03,
  },
  image: {
    width: dimensions.screenWidth * 0.05,
    height: dimensions.screenWidth * 0.05,
  },
  centerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 9,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: dimensions.screenWidth * 0.13,
    marginBottom: dimensions.screenWidth * 0.030,
    width: dimensions.screenWidth * 0.3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  centerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#466AA2",
  },
  bathingImage: {
    width: dimensions.screenWidth * 0.7,
    height: dimensions.screenWidth * 0.7,
    alignSelf: "center",
    marginTop: dimensions.screenWidth * 0.1,
    marginBottom: dimensions.screenWidth * 0.070,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  titleText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#466AA2",
    textAlign: "center",
  },
  subtitleText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#466AA2",
    marginTop: 5,
    textAlign: "center",
  },
  paw1Image: {
    position: "absolute",
    bottom: 10,
    left: -10,
    width: 150,
    height: 150,
  },
  paw2Image: {
    position: "absolute",
    top: 0,
    right: -30,
    width: 200,
    height: 200,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: dimensions.screenWidth * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  modalText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#466AA2",
    textAlign: "center",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#466AA2",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
});
