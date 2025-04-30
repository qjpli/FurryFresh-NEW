import React from 'react';
import { Text, TextStyle, GestureResponderEvent, TouchableOpacity, StyleSheet } from 'react-native';

interface ClickableTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  fontSize?: number;
  isUnderlined?: boolean;
  color?: string; 
  onPress: (event: GestureResponderEvent) => void;
}

const ClickableText: React.FC<ClickableTextProps> = ({
  children,
  style,
  fontSize,
  isUnderlined,
  color,
  onPress,
}) => {
  const textStyle: TextStyle = {
    fontSize: fontSize ?? 14,
    textDecorationLine: isUnderlined ? 'underline' : 'none',
    color: color ?? 'blue',
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.link, textStyle, style]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    fontFamily: 'Poppins-Regular',
  },
});

export default ClickableText;
