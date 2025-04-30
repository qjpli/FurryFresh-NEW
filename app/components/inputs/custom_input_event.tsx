import { StyleSheet, Text, View, Pressable, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons'; // or 'react-native-vector-icons/Ionicons' if not using Expo
import dimensions from '../../utils/sizing';

type CustomInputEventProps = {
  title: string;
  onPress: () => void;
  trailing?: React.ReactNode;
  iconOnEnd?: {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
  };
  paddingHorizontal?: number;
  paddingVertical?: number;
  backgroundColor?: string;
  fontStyle?: TextStyle;
  fontFamily?: string;
  fontColor?: string;
  fontSize?: number;
  borderRadius?: number;
  trailingStyle?: ViewStyle;
  iconStyle?: ViewStyle;
};

const CustomInputEvent = ({
  title,
  onPress,
  trailing,
  iconOnEnd,
  paddingHorizontal = dimensions.screenWidth * 0.04,
  paddingVertical = dimensions.screenHeight * 0.015,
  backgroundColor = '#f5f5f5',
  fontStyle,
  fontFamily = 'Poppins-Regular',
  fontColor = '#333',
  fontSize = dimensions.screenWidth * 0.04,
  borderRadius = 8,
  trailingStyle,
  iconStyle,
}: CustomInputEventProps) => {
  return (
    <Pressable
      style={[
        styles.container,
        {
          paddingHorizontal,
          paddingVertical,
          backgroundColor,
          borderRadius,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.title, { color: fontColor, fontSize, fontFamily }, fontStyle]}>{title}</Text>
      <View style={styles.rightContent}>
        {trailing && <View style={[styles.trailing, trailingStyle]}>{trailing}</View>}
        {iconOnEnd && (
          <View style={[styles.icon, iconStyle]}>
            <Ionicons
              name={iconOnEnd.name as any}
              size={iconOnEnd.size ?? 20}
              color={iconOnEnd.color ?? '#888'}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default CustomInputEvent;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  title: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailing: {
    marginRight: 8,
  },
  icon: {},
});
