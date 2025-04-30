import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing, 
  useAnimatedReaction,
  runOnJS
} from 'react-native-reanimated';
import dimensions from '../../utils/sizing';

const Minigame = () => {
  const [catImageOpen] = useState(require('../../assets/images/others/miniGameCatOpen.png'));
  const [catImageClose] = useState(require('../../assets/images/others/miniGameCatClose.png'));
  const [catImage, setCatImage] = useState(catImageOpen);

  const [fishImage] = useState(require('../../assets/images/others/miniGameFish.png'));
  const [logoImage] = useState(require('../../assets/images/general/furry-fresh-logo.png')); // Furry Fresh logo

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-dimensions.screenHeight * 0.1);
  const fishPosX = useSharedValue(0);

  const [score, setScore] = useState(0);
  const [gamePaused, setGamePaused] = useState(false); // Game paused state

  const catContainerWidth = dimensions.screenWidth * 0.2;
  const platformWidth = dimensions.screenWidth * 0.8;
  const platformHeight = dimensions.screenHeight * 0.02;
  const platformStartX = (dimensions.screenWidth - platformWidth) / 2;
  const platformY = dimensions.screenHeight * 0.05;

  const fishWidth = dimensions.screenWidth * 0.15;
  const fishHeight = dimensions.screenHeight * 0.05;

  const startFishFall = () => {
    if (gamePaused) return; // Prevent fish fall if the game is paused
    translateY.value = withTiming(
      dimensions.screenHeight - platformHeight - dimensions.screenHeight * 0.07,
      {
        duration: 2000,
        easing: Easing.linear,
      }
    );
  };

  const resetFish = () => {
    if (gamePaused) return; // Prevent fish reset if the game is paused
    const maxLeft = platformWidth - fishWidth;
    const randomLeftWithinPlatform = Math.random() * maxLeft;
    fishPosX.value = platformStartX + randomLeftWithinPlatform;
    translateY.value = -dimensions.screenHeight * 0.1;
    startFishFall();
  };

  const onCatEatFish = () => {
    setCatImage(catImageClose);
    setTimeout(() => {
      setCatImage(catImageOpen);
    }, 300);
  };

  const handleFishEaten = () => {
    if (gamePaused) return; // Prevent score change if the game is paused
    runOnJS(setScore)(prev => prev + 1);
    resetFish();
    onCatEatFish();
  };

  const handleFishMissed = () => {
    if (gamePaused) return; // Prevent score change if the game is paused
    runOnJS(setScore)(0);
    resetFish();
    runOnJS(setGamePaused)(true); // Pause the game
  };

  useEffect(() => {
    resetFish();
  }, []);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (gamePaused) return; // Prevent gestures if the game is paused
    const { translationX } = event.nativeEvent;
    const maxTranslationX = platformWidth - catContainerWidth;
    const minTranslationX = 0;
    let newTranslationX = translationX;

    if (newTranslationX < minTranslationX) {
      newTranslationX = minTranslationX;
    } else if (newTranslationX > maxTranslationX) {
      newTranslationX = maxTranslationX;
    }

    translateX.value = newTranslationX;
  };

  const onHandlerStateChange = (event: any) => {
    if (gamePaused) return; // Prevent gesture state changes if the game is paused
    if (event.nativeEvent.state === 5) {
      translateX.value = withSpring(translateX.value);
    }
  };

  const catContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const fishStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      position: 'absolute',
      left: fishPosX.value,
    };
  });

  useAnimatedReaction(
    () => {
      return {
        fishY: translateY.value,
        catX: translateX.value,
      };
    },
    (values) => {
      const fishCenterX = fishPosX.value + fishWidth / 2;
      const catLeftX = platformStartX + values.catX;
      const catRightX = catLeftX + catContainerWidth;
      const catTopY = dimensions.screenHeight - dimensions.screenHeight * 0.07 - dimensions.screenHeight * 0.12;

      const fishBottomY = values.fishY + fishHeight;
      const platformTopY = dimensions.screenHeight - dimensions.screenHeight * 0.05 - platformHeight;

      const isTouchingX = fishCenterX >= catLeftX && fishCenterX <= catRightX;
      const isTouchingY = fishBottomY >= catTopY;

      const isMissed = fishBottomY >= platformTopY;

      if (isTouchingX && isTouchingY) {
        runOnJS(handleFishEaten)();
      } else if (isMissed) {
        runOnJS(handleFishMissed)();
      }
    }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>{score}</Text>

      <Animated.Image
        source={fishImage}
        style={[styles.fish, fishStyle]}
        resizeMode="contain"
      />

      <View style={styles.platformContainer} />

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={[styles.catContainer, catContainerStyle]}>
          <Image
            source={catImage}
            style={styles.cat}
            resizeMode="contain"
          />
        </Animated.View>
      </PanGestureHandler>

      {/* Dark Overlay and Centered Message when Game is Paused */}
      {gamePaused && (
        <View style={styles.overlay}>
          <View style={styles.centeredBox}>
            <Image
              source={logoImage}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.congratsText}>Congrats! Your Score is: </Text>
            <Text style={styles.scoreTextCongrats}>{score}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0DFF4',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
  },
  platformContainer: {
    width: dimensions.screenWidth * 0.8,
    height: dimensions.screenHeight * 0.02,
    backgroundColor: '#466AA2',
    borderRadius: dimensions.screenWidth * 0.03,
    alignSelf: 'center',
    position: 'absolute',
    bottom: dimensions.screenHeight * 0.05,
  },
  catContainer: {
    position: 'absolute',
    bottom: dimensions.screenHeight * 0.07,
    left: dimensions.screenWidth * 0.1,
    width: dimensions.screenWidth * 0.2,
    height: dimensions.screenHeight * 0.12,
    backgroundColor: '#F1C1C1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: dimensions.screenWidth * 0.02,
  },
  cat: {
    width: '100%',
    height: '100%',
  },
  fish: {
    width: dimensions.screenWidth * 0.15,
    height: dimensions.screenHeight * 0.05,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darkened overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '60%', // Adjust as needed
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  congratsText: {
    fontSize: dimensions.screenWidth * 0.04,
    marginTop: dimensions.screenWidth * 0.03,
  },
  scoreTextCongrats: {
    fontSize: dimensions.screenWidth * 0.04,
    fontWeight: 'bold',
    color: '#333',
    marginTop: dimensions.screenWidth * 0.02,
    textAlign: 'center',
  },
});

export default Minigame;
