import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useMessages } from '../realtime/messages';
import { usePathname } from 'expo-router';
import dimensions from '../utils/sizing';

const GlobalMessageListener = () => {
  const { lastReceivedMessage } = useMessages();
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string>('');
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const [lastShownMessageId, setLastShownMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (lastReceivedMessage && lastReceivedMessage.id !== lastShownMessageId) {
      if (pathname.includes('message_screen')) {
        return; 
      }

      const message = `${lastReceivedMessage.sender_pet_profile.name}: ${lastReceivedMessage.content}`;
      setPopupMessage(message);
      setShowPopup(true);
      setLastShownMessageId(lastReceivedMessage.id);

      Animated.sequence([
        Animated.timing(popupOpacity, { 
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(popupOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowPopup(false);
        setPopupMessage('');
      });
    }
  }, [lastReceivedMessage, pathname]);

  if (!showPopup) return null;

  return (
    <Animated.View style={[styles.popupContainer, { opacity: popupOpacity }]}>
      <Text style={styles.popupText}>{popupMessage}</Text>
    </Animated.View>
  );
};

export default GlobalMessageListener;

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    top: dimensions.screenHeight * 0.07,
    alignSelf: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  popupText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.04,
    textAlign: 'center',
  },
});
