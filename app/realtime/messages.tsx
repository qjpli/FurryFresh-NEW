import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePet } from '../context/pet_context';
import { Message } from '../interfaces/message';
import supabase from '../utils/supabase';

interface MessagesContextType {
  newMessages: Message[];
  setNewMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (conversationId: string, senderPetId: string, user_id: string, content: string) => Promise<void>;
  markMessagesAsRead: (conversationId: string, yourOwnUserId: string) => Promise<void>;
  lastReceivedMessage: Message | null;
  clearLastReceivedMessage: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pets } = usePet();
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [lastReceivedMessage, setLastReceivedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (pets.length === 0) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('playdate_messages')
          .select(`
            *,
            sender_pet_profile:sender_pet_id (*, profiles: user_id (*))
          `);

        if (error) throw error;

        setNewMessages(data as Message[]);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    const fetchSingleMessage = async (messageId: string) => {
      try {
        const { data, error } = await supabase
          .from('playdate_messages')
          .select(`
            *,
            sender_pet_profile:sender_pet_id (*, profiles: user_id (*))
          `)
          .eq('id', messageId)
          .single();

        if (error) throw error;
        return data as Message; 
      } catch (err) {
        console.error('Failed to fetch single message:', err);
        return null;
      }
    };

    fetchMessages();

    const channel = supabase.channel('global_messages');

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'playdate_messages' },
        async (payload) => {
          const incomingMessage = payload.new as Message;
          const fullMessage = await fetchSingleMessage(incomingMessage.id);
          if (fullMessage) {
            setNewMessages((prev) => [...prev, fullMessage]);
            setLastReceivedMessage(fullMessage);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'playdate_messages' },
        async (payload) => {
          const updatedMessage = payload.new as Message;
          const fullMessage = await fetchSingleMessage(updatedMessage.id);
          if (fullMessage) {
            setNewMessages((prev) =>
              prev.map((msg) => (msg.id === fullMessage.id ? fullMessage : msg))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pets]);

  const sendMessage = async (conversationId: string, senderPetId: string, user_id: string, content: string) => {
    try {
      const { error } = await supabase
        .from('playdate_messages')
        .insert({
          conversation_id: conversationId,
          sender_pet_id: senderPetId,
          user_id,
          content
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const markMessagesAsRead = async (conversationId: string, yourOwnUserId: string) => {
    try {
      const unreadMessages = newMessages.filter(
        (msg) => 
          msg.conversation_id === conversationId &&
          msg.read_at === null &&
          msg.user_id !== yourOwnUserId // 🛠 only mark messages not sent by me
      );
  
      if (unreadMessages.length === 0) return;
  
      const unreadMessageIds = unreadMessages.map((msg) => msg.id);
  
      const { error } = await supabase
        .from('playdate_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessageIds);
  
      if (error) throw error;
  
      setNewMessages((prev) =>
        prev.map((msg) =>
          unreadMessageIds.includes(msg.id)
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };
  

  const clearLastReceivedMessage = () => {
    setLastReceivedMessage(null);
  };

  return (
    <MessagesContext.Provider value={{ 
      newMessages, 
      setNewMessages, 
      sendMessage, 
      markMessagesAsRead, 
      lastReceivedMessage, 
      clearLastReceivedMessage 
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
