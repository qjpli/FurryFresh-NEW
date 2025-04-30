import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import dimensions from '../../utils/sizing';

interface PaginatorProps {
  data: any[];
  scrollX: Animated.Value;
}

const Paginator: React.FC<PaginatorProps> = ({ data, scrollX }) => {
  const dotPosition = Animated.divide(scrollX, dimensions.screenWidth);
  
  return (
    <View style={styles.dotsContainer}>
      {data.map((_, index) => {
        const dotOpacity = dotPosition.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        const dotScale = dotPosition.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0.8, 1.2, 0.8],
          extrapolate: "clamp",
        });

        const isActive = dotPosition.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0], 
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: dotOpacity,
                transform: [{ scale: dotScale }],
                width: isActive.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 20],
                }),
                height: isActive.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 8],
                }),
                borderRadius: isActive.interpolate({
                  inputRange: [0, 1],
                  outputRange: [5, 4],
                }),
                backgroundColor: isActive.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#ED7964", "#ED7964"],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dot: {
    margin: 5,
  },
});

export default Paginator;
