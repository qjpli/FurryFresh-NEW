import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, FlatList, Image, Animated } from 'react-native';
import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePet } from '../../../context/pet_context';
import { useSession } from '../../../context/sessions_context';
import { useMessages } from '../../../realtime/messages';
import dimensions from '../../../utils/sizing';
import AppbarDefault from '../../../components/bars/appbar_default';
import { useTyping } from '../../../realtime/typing-status';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';


const MessageScreen = () => {
  const { pets } = usePet();
  const { session } = useSession();
  const { newMessages, sendMessage, markMessagesAsRead, clearLastReceivedMessage } = useMessages();
  const { typingStatuses, setTypingStatus } = useTyping();
  const { conversationId, otherPetAvatar } = useLocalSearchParams<{ conversationId: string, otherPetAvatar: string }>();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const myPetIds = pets.map((pet) => pet.id);
  const inputPaddingBottom = useRef(new Animated.Value(dimensions.screenHeight * 0.05)).current;

  const isSomeoneTyping = typingStatuses.some(
    (status) => status.conversation_id === conversationId && status.is_typing && !myPetIds.includes(status.sender_pet_id)
  );

  const conversationMessages = useMemo(() => {
    if (!conversationId) return [];
    const sortedMessages = [
      ...newMessages.filter((msg) => msg.conversation_id === conversationId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      ...pendingMessages
    ];
    if (isSomeoneTyping) {
      sortedMessages.push({
        id: 'typing-indicator',
        conversation_id: conversationId,
        sender_pet_id: 'other',
        content: 'typing...',
        created_at: new Date().toISOString(),
        isTyping: true
      });
    }
    return sortedMessages;
  }, [newMessages, pendingMessages, conversationId, isSomeoneTyping]);

  useEffect(() => {
    if (!conversationId) return;
    const hasUnread = conversationMessages.some((msg) => !myPetIds.includes(msg.sender_pet_id) && !msg.is_read);
    if (hasUnread) {
      markMessagesAsRead(conversationId, session?.user.id ?? '');
    }
  }, [newMessages]);

  const handleSend = async () => {
    if (messageInput.trim().length === 0) return;
    const senderPetId = myPetIds[0];
    const tempMessage = {
      id: `pending-${Date.now()}`,
      conversation_id: conversationId,
      sender_pet_id: senderPetId,
      content: messageInput.trim(),
      created_at: new Date().toISOString(),
      pending: true,
    };
    setPendingMessages((prev) => [...prev, tempMessage]);
    await sendMessage(conversationId, senderPetId, session?.user.id ?? '', messageInput.trim());
    await setTypingStatus(conversationId, senderPetId, false);
    setMessageInput('');
  };

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      Animated.timing(inputPaddingBottom, {
        toValue: dimensions.screenHeight * 0.02,
        duration: 100,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100); 
    });
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      Animated.timing(inputPaddingBottom, {
        toValue: dimensions.screenHeight * 0.05,
        duration: 100,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [conversationMessages.length]);

  useEffect(() => {
    clearLastReceivedMessage(); 
    if (!pendingMessages.length) return;
    setPendingMessages((pending) =>
      pending.filter((pendingMsg) =>
        !newMessages.some((realMsg) => realMsg.content === pendingMsg.content)
      )
    );
  }, [newMessages]);

  const smallBounce = {
    0: { transform: [{ translateY: 0 }] },
    0.5: { transform: [{ translateY: -5 }] },
    1: { transform: [{ translateY: 0 }] },
  };

  const Dot = memo(({ animationDelay = 0 }: { animationDelay?: number }) => (
    <Animatable.View
      animation={smallBounce}
      iterationCount="infinite"
      direction="alternate"
      delay={animationDelay}
      style={{
        width: dimensions.screenWidth * 0.013,
        height: dimensions.screenWidth * 0.013,
        borderRadius: 5,
        backgroundColor: 'gray',
        marginHorizontal: dimensions.screenWidth * 0.005,
        marginVertical: dimensions.screenHeight * 0.01
      }}
    />
  ));

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    if (item.isTyping) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: otherPetAvatar }} style={styles.avatar} />
          </View>
          <View style={[styles.senderMessageBubble, styles.theirBubble, { borderRadius: 20, flexDirection: 'row' }]}>
            <Dot animationDelay={0} />
            <Dot animationDelay={100} />
            <Dot animationDelay={200} />
          </View>
        </View>
      );
    }
  
    const isMine = myPetIds.includes(item.sender_pet_id);
    const isPending = item.pending;
    const nextItem = conversationMessages[index + 1];
    const prevItem = conversationMessages[index - 1];
    const isLastOfBlock = !nextItem || nextItem.sender_pet_id !== item.sender_pet_id;
    const isStartOfBlock = !prevItem || prevItem.sender_pet_id !== item.sender_pet_id;
  
    const latestRealMessage = [...conversationMessages]
      .filter((msg) => !msg.pending && !msg.isTyping)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  
    const shouldShowSent = isMine && !isPending && latestRealMessage?.id === item.id;
  
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: isLastOfBlock ? 10 : 2 }}>
        {!isMine && !isLastOfBlock && <View style={{ width: dimensions.screenWidth * 0.12 }} />}
        {!isMine && isLastOfBlock && (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: otherPetAvatar }} style={styles.avatar} />
          </View>
        )}
        <View style={{ flex: 1, alignItems: isMine ? 'flex-end' : 'flex-start' }}>
          <View style={[
            { maxWidth: dimensions.screenWidth * 0.65 },
            isMine ? styles.myMessageBubble : styles.senderMessageBubble,
            isMine ? styles.myBubble : styles.theirBubble,
            isStartOfBlock && !isMine && { borderTopLeftRadius: 18, borderTopRightRadius: 20 },
            isLastOfBlock && !isMine && { borderBottomLeftRadius: 18, borderBottomRightRadius: 20 },
            isStartOfBlock && isMine && { borderTopRightRadius: 18, borderTopLeftRadius: 20 },
            isLastOfBlock && isMine && { borderBottomRightRadius: 18, borderBottomLeftRadius: 20 },
          ]}>
            <Text style={[styles.messageText, isMine ? styles.myBubbleText : styles.theirBubbleText]}>
              {item.content}
            </Text>
          </View>
  
          {isMine && (
            <View style={{ marginRight: dimensions.screenWidth * 0.01 }}>
              {isPending ? (
                <Text style={styles.sendingText}>Sending...</Text>
              ) : shouldShowSent ? (
                <Text style={styles.sendingText}>Sent</Text>
              ) : null}
            </View>
          )}
        </View>
      </View>
    );
  };
  
  

  return (
    <View style={styles.container}>
      <AppbarDefault session={session} titleSize={0} leadingChildren={null} showLeading={true} />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.contentContainer}
          renderItem={renderItem}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToOffset({ offset: 999999, animated: true });
          }}
        />
        <Animated.View style={[styles.inputContainer, { paddingBottom: inputPaddingBottom }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={messageInput}
            onChangeText={(text) => {
              setMessageInput(text);
              setTypingStatus(conversationId, myPetIds[0], text.length > 0);
            }}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  avatarContainer: { width: dimensions.screenWidth * 0.09, height: dimensions.screenWidth * 0.09, marginRight: dimensions.screenWidth * 0.03, marginBottom: 2 },
  avatar: { width: dimensions.screenWidth * 0.09, height: dimensions.screenWidth * 0.09, borderRadius: 100 },
  container: { flex: 1, backgroundColor: 'white' },
  keyboard: { flex: 1 },
  list: { flex: 1 },
  contentContainer: { paddingHorizontal: dimensions.screenWidth * 0.02, paddingTop: 10, paddingBottom: 20 },
  senderMessageBubble: { maxWidth: '70%', padding: 10, paddingHorizontal: dimensions.screenWidth * 0.03, borderRadius: 8, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
  myMessageBubble: { padding: 10, paddingHorizontal: dimensions.screenWidth * 0.03, borderRadius: 8, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#4A90E2' },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#E5E5E5' },
  myBubbleText: { color: '#fff', fontFamily: 'Poppins-Regular' },
  theirBubbleText: { color: '#000', fontFamily: 'Poppins-Regular' },
  messageText: { fontSize: dimensions.screenWidth * 0.04 },
  sendingText: { fontSize: dimensions.screenWidth * 0.03, color: '#888', marginTop: 2, fontFamily: 'Poppins-Regular' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, paddingBottom: dimensions.screenHeight * 0.05, borderTopWidth: 1, borderColor: '#ccc', backgroundColor: 'white' },
  input: { flex: 1, padding: 10, fontSize: dimensions.screenWidth * 0.04, backgroundColor: '#f0f0f0', borderRadius: 25, fontFamily: 'Poppins-Regular' },
  sendButton: { marginLeft: 10, backgroundColor: '#4A90E2', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  sendButtonText: { color: 'white', fontFamily: 'Poppins-SemiBold', fontSize: dimensions.screenWidth * 0.04 }
});
