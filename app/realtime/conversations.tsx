import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePet } from '../context/pet_context';
import { Conversation } from '../interfaces/conversation';
import supabase from '../utils/supabase';

interface ConversationsContextType {
  newConversations: Conversation[];
  setNewConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pets } = usePet();
  const [newConversations, setNewConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (pets.length === 0) return;

    const myPetIds = pets.map((pet) => pet.id);

    const fetchExistingConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('playdate_conversations')
          .select(`
            *,
            pet_1_profile:pet_1_id (*, profiles: user_id (*)),
            pet_2_profile:pet_2_id (*, profiles: user_id (*))
          `)
          .or(
            myPetIds
              .map(id => `pet_1_id.eq.${id}`)
              .concat(myPetIds.map(id => `pet_2_id.eq.${id}`))
              .join(',')
          );

        if (error) throw error;

        setNewConversations(data as Conversation[]);
      } catch (err) {
        console.error('Failed to fetch existing conversations:', err);
      }
    };

    const fetchSingleConversation = async (conversationId: string) => {
      try {
        const { data, error } = await supabase
          .from('playdate_conversations')
          .select(`
            *,
            pet_1_profile:pet_1_id (*, profiles: user_id (*)),
            pet_2_profile:pet_2_id (*, profiles: user_id (*))
          `)
          .eq('id', conversationId)
          .single();

        if (error) throw error;

        return data as Conversation;
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
        return null;
      }
    };

    fetchExistingConversations();

    const channel = supabase.channel('global_conversations');

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'playdate_conversations' },
        async (payload) => {
          const newConversation = payload.new as Conversation;
          const involved = myPetIds.includes(newConversation.pet_1_id) || myPetIds.includes(newConversation.pet_2_id);
          if (!involved) return;

          const fullConversation = await fetchSingleConversation(newConversation.id);
          if (fullConversation) {
            setNewConversations((prev) => [...prev, fullConversation]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'playdate_conversations' },
        async (payload) => {
          const updatedConversation = payload.new as Conversation;
          const involved = myPetIds.includes(updatedConversation.pet_1_id) || myPetIds.includes(updatedConversation.pet_2_id);

          if (!involved) return;

          const fullConversation = await fetchSingleConversation(updatedConversation.id);
          if (fullConversation) {
            setNewConversations((prev) =>
              prev.map((conv) => (conv.id === fullConversation.id ? fullConversation : conv))
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'playdate_conversations' },
        async (payload) => {
          const deletedConversation = payload.old as Conversation;
          const involved = myPetIds.includes(deletedConversation.pet_1_id) || myPetIds.includes(deletedConversation.pet_2_id);
          if (!involved) return;

          setNewConversations((prev) => prev.filter((conv) => conv.id !== deletedConversation.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pets]);

  return (
    <ConversationsContext.Provider value={{ newConversations, setNewConversations }}>
      {children}
    </ConversationsContext.Provider>
  );
};

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
}
