import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import supabase from '../utils/supabase';
import { usePet } from '../context/pet_context';

interface TypingStatus {
    id: string;
    conversation_id: string;
    sender_pet_id: string;
    is_typing: boolean;
    created_at: string;
    updated_at: string;
}

interface TypingContextType {
    typingStatuses: TypingStatus[];
    setTypingStatus: (conversationId: string, senderPetId: string, isTyping: boolean) => Promise<void>;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export const TypingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { pets } = usePet();
    const [typingStatuses, setTypingStatuses] = useState<TypingStatus[]>([]);

    const typingTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

    useEffect(() => {
        if (pets.length === 0) return;

        const fetchTypingStatuses = async () => {
            const { data, error } = await supabase
                .from('typing')
                .select('*');

            if (error) {
                console.error('Failed to fetch typing statuses:', error);
            } else {
                setTypingStatuses(data as TypingStatus[]);
            }
        };

        fetchTypingStatuses();

        const channel = supabase.channel('global_typing');

        channel
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'typing' },
                (payload) => {
                    const incoming = payload.new as TypingStatus;
                    setTypingStatuses((prev) => {
                        const existing = prev.find(
                            (status) =>
                                status.conversation_id === incoming.conversation_id &&
                                status.sender_pet_id === incoming.sender_pet_id
                        );
                        if (existing) {
                            return prev.map((status) =>
                                status.id === incoming.id ? incoming : status
                            );
                        } else {
                            return [...prev, incoming];
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [pets]);

    const setTypingStatus = async (conversationId: string, senderPetId: string, isTyping: boolean) => {
        try {
            const { error } = await supabase
                .from('typing')
                .upsert(
                    {
                        conversation_id: conversationId,
                        sender_pet_id: senderPetId,
                        is_typing: isTyping,
                        updated_at: new Date()
                    },
                    { onConflict: 'conversation_id,sender_pet_id' }
                );

            if (error) throw error;

            const key = `${conversationId}-${senderPetId}`;

            if (isTyping) {
                if (typingTimeouts.current[key]) {
                    clearTimeout(typingTimeouts.current[key]);
                }

                typingTimeouts.current[key] = setTimeout(() => {
                    setTypingStatus(conversationId, senderPetId, false);
                    delete typingTimeouts.current[key];
                }, 10000); 
            } else {
                if (typingTimeouts.current[key]) {
                    clearTimeout(typingTimeouts.current[key]);
                    delete typingTimeouts.current[key];
                }
            }
        } catch (err) {
            console.error('Failed to set typing status:', err);
        }
    };

    return (
        <TypingContext.Provider value={{ typingStatuses, setTypingStatus }}>
            {children}
        </TypingContext.Provider>
    );
};

export function useTyping() {
    const context = useContext(TypingContext);
    if (!context) {
        throw new Error('useTyping must be used within a TypingProvider');
    }
    return context;
}
