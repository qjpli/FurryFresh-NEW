import { StyleSheet, View, Image, ScrollView, StyleProp } from 'react-native';
import dimensions from '../../utils/sizing';
import React from 'react';
import { ViewStyle } from 'react-native';

interface MainContPlainProps {
  children: React.ReactNode;
  showPetImage?: boolean;
  paddingHorizontal?: number | null;
  paddingVertical?: number | null;
  floatingComponent?: React.ReactNode;
  floatingPosition?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  scrollEnabled?: boolean; // New prop
  height?: string | null;
}

const MainContPlain: React.FC<MainContPlainProps> = ({
  children,
  showPetImage = false,
  paddingHorizontal = null,
  paddingVertical = null,
  floatingComponent,
  floatingPosition = {},
  scrollEnabled = true,
  height = null
}) => {
  const ContentWrapper = scrollEnabled ? ScrollView : View;

  const contentStyle = {
    ...(paddingHorizontal !== null && { paddingHorizontal }),
    ...(paddingVertical !== null && { paddingVertical }),
    ...(height !== null && { height }),
  } as ViewStyle;
  

  return (
    <View style={styles.container}>
      {showPetImage && (
        <Image
          source={require('../../assets/images/general/pet-enjoy.png')}
          style={styles.petenjoy}
        />
      )}

      <ContentWrapper
        {...(scrollEnabled && {
          contentContainerStyle: { flexGrow: 1 },
          showsVerticalScrollIndicator: false,
          bounces: true,
          keyboardShouldPersistTaps: 'handled',
        })}
      >
        <View
          style={contentStyle}
        >
          {children}
        </View>
      </ContentWrapper>

      {floatingComponent && (
        <View
          style={[
            styles.floatingContainer,
            {
              top: floatingPosition.top,
              bottom: floatingPosition.bottom,
              left: floatingPosition.left,
              right: floatingPosition.right,
            },
          ]}
        >
          {floatingComponent}
        </View>
      )}
    </View>
  );
};

export default MainContPlain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    paddingTop: dimensions.screenHeight * 0.01,
    position: 'relative',
  },
  petenjoy: {
    position: 'absolute',
    width: dimensions.screenWidth * 0.42,
    height: dimensions.screenWidth * 0.42,
    bottom: -dimensions.screenHeight * 0.04,
    left: dimensions.screenWidth * 0.28,
    right: dimensions.screenWidth * 0.28,
  },
  floatingContainer: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
  },
});
