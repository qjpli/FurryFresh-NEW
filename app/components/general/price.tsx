import React from 'react';
import { Text, StyleSheet } from 'react-native';
import dimensions from '../../utils/sizing';

type PriceProps = {
  value: string | number;
  color?: string;
  lineHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  currencySize?: number;
};

const Price: React.FC<PriceProps> = ({ value, color, lineHeight, fontSize, fontFamily, currencySize }) => {
  const formattedValue = Number(value).toFixed(2); 

  return (
    <Text style={[styles.price, { color, lineHeight, fontFamily, fontSize }]}>
      <Text style={{ fontSize: currencySize ?? dimensions.screenWidth * 0.032 }}>{'₱'}</Text>{formattedValue}
    </Text>
  );
};

const styles = StyleSheet.create({
  price: {
    fontSize: dimensions.screenWidth * 0.05,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    lineHeight: dimensions.screenWidth * 0.05,
  },
});

export default Price;
