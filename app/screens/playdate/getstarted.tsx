import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router'; 
import dimensions from '../../utils/sizing';

const GetStarted = () => {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      {/* Left Center Paws */}
      <Image
        source={require("../../assets/images/general/paw-watermark.png")}
        style={[styles.paw, styles.leftPaw]}
      />

      {/* Bottom Right Paw */}
      <Image
        source={require("../../assets/images/general/paw-watermark.png")}
        style={[styles.paw, styles.rightPaw]}
      />

      {/* Top Right Circle */}
      <View style={styles.topRightCircleMain}>
        <View
          style={{
            borderRadius: 100,
            position: 'absolute',
            width: dimensions.screenWidth * 0.45,
            height: dimensions.screenWidth * 0.45,
            backgroundColor: '#BDCEE4'
          }}
        />
        <View
          style={{
            borderRadius: 100,
            position: 'absolute',
            width: dimensions.screenWidth * 0.33,
            height: dimensions.screenWidth * 0.33,
            top: dimensions.screenHeight * 0.08,
            right: -dimensions.screenWidth * 0.22,
            backgroundColor: '#ACBFDB'
          }}
        />
        <View
          style={{
            borderRadius: 100,
            position: 'absolute',
            width: dimensions.screenWidth * 0.13,
            height: dimensions.screenWidth * 0.13,
            top: dimensions.screenHeight * 0.22,
            right: -dimensions.screenWidth * 0.13,
            backgroundColor: '#B6C8E2'
          }}
        />
      </View>

      {/* Logo */}
      <Image
        source={require('../../assets/images/general/furry-fresh-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Dog */}
      <Image
        source={require('../../assets/images/others/dog-hd.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Colored Title */}
      <View style={[styles.titleRow, styles.compactTitleRow]}>
        <Text style={[styles.title, styles.orange]}>FURRY </Text>
        <Text style={[styles.title, styles.blue]}>FRESH</Text>
      </View>
      <View style={styles.titleRow}>
        <Text style={[styles.title, styles.blue]}>PLAY </Text>
        <Text style={[styles.title, styles.orange]}>DATE</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Unleash the fun! Dive into Furry Fresh's Playdate feature and connect your pet with new furry friends today!
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.getStartedBox}
        onPress={() => {

          router.push('./playdate-setup/select_pets')
          
          // router.push('../playdate/home')
        }} 
      >
        <Text style={styles.getStartedText}>Get Started</Text>
        <Image
          source={require('../../assets/images/others/arrow.png')}
          style={styles.arrowLogo}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default GetStarted;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: '100%',
    position: 'relative',
    backgroundColor: '#D0DFF4',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  paw: {
    position: "absolute",
    width: dimensions.screenWidth * 0.35,
    height: dimensions.screenWidth * 0.4,
    tintColor: '#BDCEE4'
  },
  topRightCircleMain: {
    position: "absolute",
    top: dimensions.screenHeight * 0.1,
    right: dimensions.screenWidth * 0.26
  },
  leftPaw: {
    top: dimensions.screenHeight * 0.4,
    left: -dimensions.screenWidth * 0.1,
    transform: [{ rotate: "40deg" }],
  },
  rightPaw: {
    width: dimensions.screenWidth * 0.3,
    height: dimensions.screenWidth * 0.35,
    bottom: -dimensions.screenHeight * 0.05,
    right: -dimensions.screenWidth * 0.1,
    transform: [{ rotate: "-40deg" }],
  },
  logo: {
    width: 85,
    height: 85,
    marginBottom: -5,
    marginTop: 20,
  },
  image: {
    width: dimensions.screenWidth * 0.75,
    height: dimensions.screenWidth * 0.7,
    marginBottom: dimensions.screenHeight * 0.02,
    marginTop: dimensions.screenHeight * 0.04,
  },
  paws: {
    position: 'absolute',
    left: 0,
    top: '30%',
    width: 100,
    height: 200,
  },
  pawBottomRight: {
    position: 'absolute',
    bottom: -5,
    right: 0,
    width: 120,
    height: 120,
  },
  circle: {
    position: 'absolute',
    bottom: 500,
    right: -30,
    width: 250,
    height: 250,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  compactTitleRow: {
    marginBottom: -15,
  },
  title: {
    fontSize: dimensions.screenWidth * 0.11,
    fontFamily: 'Baloo-Regular',
    textAlign: 'center',
  },
  orange: {
    color: '#E94C30',
  },
  blue: {
    color: '#121F63',
  },
  description: {
    fontSize: 13,
    color: '#466AA2',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 20,
  },
  getStartedBox: {
    marginTop: 20,
    backgroundColor: '#466AA2',
    paddingVertical: dimensions.screenHeight * 0.018,
    paddingHorizontal: dimensions.screenWidth * 0.01,
    paddingLeft: dimensions.screenWidth * 0.08,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 180,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: dimensions.screenWidth * 0.033,
    fontFamily: 'Poppins-Regular',
  },
  arrowLogo: {
    height: dimensions.screenWidth * 0.11,
    width: dimensions.screenWidth * 0.11,
    marginTop: -10,
    marginBottom: -10,
  },
});
