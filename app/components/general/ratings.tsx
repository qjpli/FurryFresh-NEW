import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dimensions from '../../utils/sizing';

type Props = {
  ratings: number;
};

const StarRatings = ({ ratings }: Props) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name='star' size={dimensions.screenWidth * 0.06} color='#ED7964' />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key='half' name='star-half' size={dimensions.screenWidth * 0.06} color='#ED7964' />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name='star-outline' size={dimensions.screenWidth * 0.06} color='#ED7964' />
      );
    }

    return stars;
  };

  return (
    <View style={styles.starsPlacement}>
      {renderStars(ratings)}
    </View>
  );
};

const styles = StyleSheet.create({
  starsPlacement: {
    flexDirection: 'row',
  },
});

export default StarRatings;
