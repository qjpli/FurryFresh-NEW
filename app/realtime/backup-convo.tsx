import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePet } from '../context/pet_context';
import { Message } from '../interfaces/message';
import supabase from '../utils/supabase';

interface MessagesContextType {
  newMessages: Message[];
  setNewMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pets } = usePet();
  const [newMessages, setNewMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchExistingMessages = async () => {
      const myPetIds = pets.map((pet) => pet.id);

      if (myPetIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('playdate_messages')
          .select('*')
          .not('sender_pet_id', 'in', `(${myPetIds.join(',')})`);

        if (error) throw error;

        setNewMessages(data as Message[]);
      } catch (err) {
        console.error('Failed to fetch existing messages:', err);
      }
    };

    fetchExistingMessages();

    const myPetIds = pets.map((pet) => pet.id);

    if (myPetIds.length === 0) return;

    const channel = supabase
      .channel('global_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'playdate_messages',
        },
        (payload) => {
          const message = payload.new as Message;

          if (!myPetIds.includes(message.sender_pet_id)) {
            setNewMessages((prev) => [...prev, message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pets]);

  return (
    <MessagesContext.Provider value={{ newMessages, setNewMessages }}>
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
