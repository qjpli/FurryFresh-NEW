import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  TextInput, 
  StyleSheet,
  Image,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MainContPlain from '../../components/general/background_plain';
import dimensions from '../../utils/sizing';
import { router, useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import Spacer from '../../components/general/spacer';
import { usePet } from '../../context/pet_context';
import { useGrooming } from '../../context/grooming_context';
import SvgValue from '../../hooks/fetchSvg';
import TitleValue from '../../components/list/title_value';
import Button1 from '../../components/buttons/button1';

interface ReviewComponentProps {
  onSubmit?: (rating: number, comment: string) => void;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const starPosition = new Animated.Value(0);

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
    
    Animated.timing(starPosition, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setShowComment(true);
    });
  };

  const starTranslateY = starPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={reviewStyles.container}>
      <Animated.View style={[reviewStyles.starsContainer, { transform: [{ translateY: starTranslateY }] }]}>
        <Text style={reviewStyles.promptText}>How was your experience?</Text>
        <View style={reviewStyles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={`star-${star}`}
              onPress={() => handleStarPress(star)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FFD700' : '#CCCCCC'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {showComment && (
        <Animated.View 
          style={[
            reviewStyles.commentContainer,
            {
              opacity: starPosition,
              transform: [
                {
                  translateY: starPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={reviewStyles.commentPrompt}>Tell us more about your experience</Text>
          <TextInput
            style={reviewStyles.commentInput}
            multiline
            numberOfLines={4}
            placeholder="What did you like or dislike?"
            value={comment}
            onChangeText={setComment}
          />
          <Button1
            title="Submit Review"
            isPrimary={true}
            borderRadius={15}
            onPress={() => onSubmit?.(rating, comment)}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default ReviewComponent;

const reviewStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: dimensions.screenWidth * 0.06,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  starsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  promptText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.045,
    color: '#466AA2',
    marginBottom: 15,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  commentContainer: {
    marginTop: 10,
  },
  commentPrompt: {
    fontFamily: 'Poppins-Regular',
    fontSize: dimensions.screenWidth * 0.035,
    color: '#808080',
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
    fontSize: dimensions.screenWidth * 0.035,
  },
});