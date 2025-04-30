import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button1 from '../../../components/buttons/button1';
import dimensions from '../../../utils/sizing';

interface Props {
  isCarting: boolean;
  onAddToCart: () => void;
}

const AddNewToCartBar: React.FC<Props> = ({ isCarting, onAddToCart }) => (
  <View style={styles.container}>
    <LinearGradient
      colors={['#FFFFFF', 'transparent']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.gradient}
    >
      <Button1
        isPrimary
        title="Add to Cart"
        loading={isCarting}
        onPress={() => onAddToCart()}
        customStyle={styles.button}
      />
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: dimensions.screenWidth * 0.06,
    width: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    paddingBottom: dimensions.screenHeight * 0.04,
    paddingTop: dimensions.screenHeight * 0.02,
  },
  button: {
    backgroundColor: '#466AA2',
    paddingVertical: dimensions.screenHeight * 0.018,
    width: '100%',
    borderRadius: 15,
    elevation: 10,
  },
});

export default AddNewToCartBar;
