import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  const [catImageOpen] = useState(require('../../assets/images/others/miniGameCatOpen.png'));
  const [catImageClose] = useState(require('../../assets/images/others/miniGameCatClose.png'));
  const [catImage, setCatImage] = useState(catImageOpen);

  const [fishImage] = useState(require('../../assets/images/others/miniGameFish.png'));
  const [logoImage] = useState(require('../../assets/images/general/furry-fresh-logo.png'));
  const [heartImage] = useState(require('../../assets/images/others/miniGameHeartThree.png'));

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-dimensions.screenHeight * 0.1);
  const fishPosX = useSharedValue(0);
  const fallDuration = useSharedValue(2000);

  const [score, setScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [gamePaused, setGamePaused] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  const catContainerWidth = dimensions.screenWidth * 0.2;
  const platformWidth = dimensions.screenWidth * 0.8;
  const platformHeight = dimensions.screenHeight * 0.02;
  const platformStartX = (dimensions.screenWidth - platformWidth) / 2;

  const fishWidth = dimensions.screenWidth * 0.15;
  const fishHeight = dimensions.screenHeight * 0.05;

  const calculateFallDuration = (score: number) => {
    const speedLevel = Math.floor(score / 5);
    return Math.max(800, 2000 - speedLevel * 200);
  };

  const startFishFall = () => {
    if (gamePaused || countdown !== null) return;
    fallDuration.value = calculateFallDuration(score);
    translateY.value = withTiming(
      dimensions.screenHeight - platformHeight - dimensions.screenHeight * 0.07,
      {
        duration: fallDuration.value,
        easing: Easing.linear,
      }
    );
  };

  const resetFish = () => {
    if (gamePaused || countdown !== null) return;
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
    if (gamePaused || countdown !== null) return;
    runOnJS(setScore)(prev => prev + 1);
    resetFish();
    onCatEatFish();
  };

  const handleFishMissed = () => {
    if (gamePaused || countdown !== null) return;
    runOnJS(setLastScore)(score);
    resetFish();
    runOnJS(setGamePaused)(true);
  };

  useEffect(() => {
    if (!gamePaused && countdown === null) {
      resetFish();
    }
  }, [gamePaused, countdown]);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (gamePaused || countdown !== null) return;
    const { translationX } = event.nativeEvent;
    const maxTranslationX = platformWidth - catContainerWidth;
    const minTranslationX = 0;
    let newTranslationX = translationX;

    if (newTranslationX < minTranslationX) newTranslationX = minTranslationX;
    else if (newTranslationX > maxTranslationX) newTranslationX = maxTranslationX;

    translateX.value = newTranslationX;
  };

  const onHandlerStateChange = (event: any) => {
    if (gamePaused || countdown !== null) return;
    if (event.nativeEvent.state === 5) {
      translateX.value = withSpring(translateX.value);
    }
  };

  const catContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fishStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    position: 'absolute',
    left: fishPosX.value,
  }));

  useAnimatedReaction(
    () => ({
      fishY: translateY.value,
      catX: translateX.value,
    }),
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

      if (isTouchingX && isTouchingY) runOnJS(handleFishEaten)();
      else if (isMissed) runOnJS(handleFishMissed)();
    }
  );

  const handleBackHome = () => {
    router.push('../../screens/(tabs)/home');
  };

  const startCountdown = () => {
    const sequence = ['3', '2', '1', 'GO!'];
    let index = 0;
    setCountdown(sequence[index]);
    const interval = setInterval(() => {
      index++;
      if (index >= sequence.length) {
        clearInterval(interval);
        setCountdown(null);
        setGamePaused(false);
        setScore(0);
        resetFish();
      } else {
        setCountdown(sequence[index]);
      }
    }, 1000);
  };

  const restartGame = () => {
    setScore(0);
    setLastScore(0);
    setGamePaused(false);
    setCountdown('3');
    startCountdown();
  };

  return (
    <View style={styles.container}>
      <Image source={heartImage} style={styles.heart} />

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
          <Image source={catImage} style={styles.cat} resizeMode="contain" />
        </Animated.View>
      </PanGestureHandler>

            <Image
              source={require('../../assets/images/others/designPaw1.png')}
              style={styles.paw1Image}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/images/others/designPaw2.png')}
              style={styles.paw2Image}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/images/others/designPaw1.png')}
              style={styles.paw3Image}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/images/others/designPaw2.png')}
              style={styles.paw4Image}
              resizeMode="contain"
            />

      {gamePaused && (
        <View style={styles.overlay}>
          <View style={styles.centeredBox}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            <Text style={styles.congratsText}>Congrats! Your Score is:</Text>
            <Text style={styles.scoreTextCongrats}>{lastScore}</Text>
            <View style={styles.smallBoxRow}>
              <TouchableWithoutFeedback onPress={handleBackHome}>
                <View style={styles.coloredBox}>
                  <Text style={styles.smallBoxText}>Back To Home</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={restartGame}>
                <View style={[styles.coloredBox, styles.restartBox]}>
                  <Text style={styles.smallBoxText}>Restart</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      )}

      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
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
  heart: {
    width: dimensions.screenWidth * 0.,
    height: dimensions.screenHeight * 0.06,
    position: 'absolute',
    top: 40,
    left: 20,
    resizeMode: 'contain',
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
    backgroundColor: '#D0DFF4',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '70%',
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
  smallBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: dimensions.screenWidth * 0.06,
    width: '100%',
  },
  coloredBox: {
    backgroundColor: '#466AA2',
    borderRadius: dimensions.screenWidth * 0.03,
    padding: 10,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartBox: {
    backgroundColor: '#DA8474',
  },
  smallBoxText: {
    fontSize: dimensions.screenWidth * 0.03,
    color: '#fff',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: 'white',
  },
  paw1Image: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 80,
    height: 80,
  },
  paw2Image: {
    position: 'absolute',
    top: 0,
    right: -30,
    width: 200,
    height: 200,
  },
  paw3Image: {
    position: 'absolute',
    bottom: 300,
    left: 10,
    width: 100,
    height: 200,
  },
  paw4Image: {
    position: 'absolute',
    top: 530,
    right: -30,
    width: 150,
    height: 150,
  },

});

export default Minigame;
