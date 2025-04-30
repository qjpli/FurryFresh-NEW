import { StyleSheet, View, Image } from 'react-native';
import dimensions from '../../utils/sizing';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface MainContCircleProps {
  children: React.ReactNode;
  showPetImage?: boolean;
  paddingHorizontal?: number | null;
  paddingVertical?: number | null;
}

const MainContCircle: React.FC<MainContCircleProps> = ({
  children,
  showPetImage = false,
  paddingHorizontal = null,
  paddingVertical = null,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', '#466AA2']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
        style={[styles.circle, styles.topRightCircle]}
      />

      <LinearGradient
        colors={['transparent', '#466AA2']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
        style={[styles.circle, styles.bottomLeftCircle]}
      />

      {showPetImage && (
        <Image 
          source={require('../../assets/images/general/pet-enjoy.png')}
          style={styles.petenjoy} 
        />
      )}

      <View style={{ paddingHorizontal, paddingVertical }}>
        {children}
      </View>
    </View>
  );
};

export default MainContCircle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    width: dimensions.screenWidth * 0.45,
    height: dimensions.screenWidth * 0.45,
    borderRadius: 1000,
  },
  topRightCircle: {
    top: -dimensions.screenWidth * 0.28,
    right: -dimensions.screenWidth * 0.15,
  },
  bottomLeftCircle: {
    bottom: -dimensions.screenWidth * 0.2,
    left: -dimensions.screenWidth * 0.15,
  },
  petenjoy: {
    position: 'absolute',
    width: dimensions.screenWidth * 0.42,
    height: dimensions.screenWidth * 0.42,
    bottom: -dimensions.screenHeight * 0.04,
    left: dimensions.screenWidth * 0.28,
    right: dimensions.screenWidth * 0.28,
  }
});
