import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import dimensions from '../../utils/sizing';

interface TitleProps {
  text: string;
  style?: TextStyle;
  fontSize?: number; // fontSize parameter (optional)
  lineHeight?: number;
}

const Title1: React.FC<TitleProps> = ({ text, style, fontSize, lineHeight }) => {
  return (
    <Text style={[styles.title, style, fontSize ? { fontSize } : null, lineHeight ? {lineHeight} : null]}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: '#466AA2',
    textAlign: 'center',
    fontFamily: "Poppins-SemiBold",
    margin: 0,
    padding: 0,
    lineHeight: 27,
    backgroundColor: 'transparent'
  },
});

export default Title1;
