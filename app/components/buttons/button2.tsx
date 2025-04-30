import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import dimensions from '../../utils/sizing';

interface ButtonProps {
  title: string;
  onPress?: ((event: GestureResponderEvent) => void) | null;
  isPrimary: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  borderRadius?: number;
  loading?: boolean;
  customStyle?: any;
  paddingVertical?: number;
}

const Button1: React.FC<ButtonProps> = ({
  title,
  onPress,
  isPrimary,
  backgroundColor = null,
  style,
  textStyle,
  borderRadius,
  customStyle,
  loading = false,
  paddingVertical
}) => {
  const isDisabled = loading || !onPress;

  return (
    <View style={[styles.buttonContainer, style ]}>
      <TouchableOpacity
        style={[customStyle ?? styles.button,
          { backgroundColor: backgroundColor },
          backgroundColor == null ? isPrimary ? styles.primaryButton : styles.secondaryButton : null,
          isDisabled && styles.disabledButton,
          borderRadius ? { borderRadius } : null,
          { paddingVertical: paddingVertical ?? dimensions.screenHeight * 0.017 } 
        ]}
        onPress={onPress ?? undefined}
        disabled={isDisabled}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={{
              paddingVertical: dimensions.screenHeight * 0.008,
              transform: [{ scale: 1.5 }],
            }}
          />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: dimensions.screenHeight * 0.012,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#466AA2',
  },
  secondaryButton: {
    backgroundColor: '#ED7964',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: '#fff',
    fontSize: dimensions.screenWidth * 0.045,
    textAlign: 'center', 
    fontFamily: 'Poppins-SemiBold',
  },
});

export default Button1;
