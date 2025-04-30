import { View, Text, Alert, StyleSheet, FlatList, Animated, ViewToken } from "react-native";
import React, { useState, useRef } from "react";
import { useRouter } from 'expo-router';
import MainContCircle from "../../components/general/background_circle";
import Title1 from "../../components/texts/title1";
import dimensions from "../../utils/sizing";
import Subtitle1 from "../../components/texts/subtitle1";
import Button1 from "../../components/buttons/button1";
import OnboardingItem from "./onboardingitem";
import Paginator from "./paginator";
import slides from "./slides";
import AsyncStorage from '@react-native-async-storage/async-storage';

const GetStarted = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < slides.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex });
    }
  };

  const handleGetStarted = async () => {
    if (currentIndex === slides.length - 1) {
      await AsyncStorage.setItem('getStarted7', 'false');
      router.replace('../auth/sign_in'); 
    } else {
      handleNext();
    }
  };

  return (
    <MainContCircle paddingHorizontal={dimensions.screenWidth * 0.0}>
      <View style={styles.top}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={viewableItemsChanged}
        />
        <Paginator data={slides} scrollX={scrollX} />
      </View>
      <View style={styles.bottom}>
        <Button1
          title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          isPrimary={false}
          borderRadius={15}
          onPress={handleGetStarted}
        />
      </View>
    </MainContCircle>
  );
};

export default GetStarted;

const styles = StyleSheet.create({
  top: {
    marginTop: dimensions.screenHeight * 0.1,
    marginBottom: dimensions.screenHeight * 0.1,
    alignContent: "flex-start",
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "column"
  },
  mid: {},
  bottom: {
    marginTop: dimensions.screenHeight * 0.02,
    marginHorizontal: dimensions.screenWidth * 0.05
  }
});
