import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Checkbox from 'expo-checkbox';
import dimensions from '../../utils/sizing';

interface CustomCheckboxProps {
  label: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const CustomCheckbox1: React.FC<CustomCheckboxProps> = ({
  label,
  value,
  onValueChange,
  labelStyle,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Checkbox
        style={[styles.checkbox, { borderWidth: value ? 4 : 1 }]}
        value={value}
        onValueChange={onValueChange}
        color={value ? '#466AA2' : undefined}
      />
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: dimensions.screenWidth * 0.045,
    height: dimensions.screenWidth * 0.045,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: dimensions.screenHeight * 0.002,
    borderWidth: 3, 
    borderColor: '#ccc',
  },
  label: {
    fontSize: dimensions.screenWidth * 0.036,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
});

export default CustomCheckbox1;
