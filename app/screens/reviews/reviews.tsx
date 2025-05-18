import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dimensions from '../../utils/sizing';
import Button1 from '../../components/buttons/button1';
import supabase from '../../utils/supabase';
import { useSession } from '../../context/sessions_context';
import ReviewIcon from '../../components/svgs/reviews/ReviewIcon';
import { router, useLocalSearchParams } from 'expo-router';

interface ReviewComponentProps {
  refId: number;
  serviceProductId: number;
  type: string;
  onSuccess?: () => void;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ReviewComponent = () => {
  const { refId, serviceProductId, type } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const starPosition = useState(new Animated.Value(0))[0];

  const { session } = useSession();
  const userId = session?.user?.id;

  const ratingTexts = [
    'Very disappointing experience.',
    'Needs significant improvement.',
    'Average, but could be better.',
    'Good, but with some room for improvement.',
    'Excellent service, highly satisfied!'
  ];

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowComment(true);

    Animated.timing(starPosition, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      Alert.alert('Incomplete Review', 'Please provide both a rating and comment.');
      return;
    }

    if (!userId || !refId || !serviceProductId || !type) {
      console.log('User ID: ', userId);
      console.log('Ref ID: ', refId);
      console.log('Service Product ID: ', serviceProductId);
      console.log('Ty[e]: ', type);
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('review_ratings').insert([
      {
        user_id: userId,
        ref_id: refId,
        service_product_id: serviceProductId,
        type: type,
        rating: rating,
        review_text: comment,
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Review submission failed', error.message);
    } else {
      router.back();
    }
  };

  const starTranslateY = starPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
        <View style={reviewStyles.container}>
          <Animated.View
            style={[
              reviewStyles.starsContainer,
              { transform: [{ translateY: starTranslateY }] },
            ]}
          >
            <ReviewIcon width={dimensions.screenWidth * 0.2} height={dimensions.screenWidth * 0.2} style={{ alignSelf: 'center', marginBottom: 20 }} />
            <Text style={reviewStyles.promptText}>
              {showComment ? 'How was your experience?' : ratingTexts[rating - 1] || 'How was your experience?'}
            </Text>
            <Text style={reviewStyles.promptSubtitle}>
              {showComment ? ratingTexts[rating - 1] || 'Rate your experience with the service' : 'How was your experience?'}
            </Text>
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
                    color={star <= rating ? 'orange' : '#CCCCCC'}
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
                placeholder=""
                value={comment}
                onChangeText={setComment}
              />
              <Button1
                title={loading ? 'Submitting...' : 'Submit Review'}
                isPrimary={false}
                borderRadius={15}
                onPress={() => {
                  if (!loading) handleSubmit();
                }}
              />
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  },
  starsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  promptText: {
    fontFamily: 'Poppins-Bold',
    fontSize: dimensions.screenWidth * 0.055,
    color: '#466AA2',
  },
  promptSubtitle: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    fontSize: dimensions.screenWidth * 0.03,
    color: '#808080',
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
    marginBottom: 5,
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