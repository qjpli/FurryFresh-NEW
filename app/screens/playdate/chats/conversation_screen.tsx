import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useState, useMemo } from 'react';
import { useConversations } from '../../../realtime/conversations';
import { useMessages } from '../../../realtime/messages';
import MainContPlain from '../../../components/general/background_plain';
import AppbarDefault from '../../../components/bars/appbar_default';
import { useSession } from '../../../context/sessions_context';
import { usePet } from '../../../context/pet_context';
import dimensions from '../../../utils/sizing';
import Spacer from '../../../components/general/spacer';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';
import { router } from 'expo-router';

const ConversationScreen = () => {
    const { pets } = usePet();
    const { newConversations } = useConversations();
    const { newMessages } = useMessages();
    const { session } = useSession();

    const myPetIds = pets.map((pet) => pet.id);
    const [filterType, setFilterType] = useState<'all' | 'fresh' | 'messaged'>('all');

    const filteredConversations = useMemo(() => {
        return [...newConversations].filter((convo) => {
            const messages = newMessages.filter((msg) => msg.conversation_id === convo.id);
            if (filterType === 'fresh') return messages.length === 0;
            if (filterType === 'messaged') return messages.length > 0;
            return true;
        }).sort((a, b) => {
            const aMessages = newMessages.filter((msg) => msg.conversation_id === a.id);
            const bMessages = newMessages.filter((msg) => msg.conversation_id === b.id);
            const aLatest = aMessages.sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())[0];
            const bLatest = bMessages.sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())[0];
            const aTime = aLatest ? new Date(aLatest.created_at).getTime() : 0;
            const bTime = bLatest ? new Date(bLatest.created_at).getTime() : 0;
            return bTime - aTime;
        });
    }, [newConversations, newMessages, filterType]);

    return (
        <View style={{ flex: 1 }}>
            <AppbarDefault session={session} titleSize={0} leadingChildren={null} showLeading={false} />
            <MainContPlain>
                <Spacer height={dimensions.screenHeight * 0.01} />
                <View style={styles.convoBox}>
                    <Text style={styles.convoTitle}>Conversations</Text>
                    <View style={styles.menuRow}>
                        <TouchableOpacity onPress={() => setFilterType('all')}>
                            <Text style={[styles.menuText, filterType === 'all' && styles.menuTextActive]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilterType('fresh')}>
                            <Text style={[styles.menuText, filterType === 'fresh' && styles.menuTextActive]}>Fresh Convo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilterType('messaged')}>
                            <Text style={[styles.menuText, filterType === 'messaged' && styles.menuTextActive]}>With Messages</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={filteredConversations}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => {
                            const isPet1Mine = myPetIds.includes(item.pet_1_id);
                            const myPetProfile = isPet1Mine ? item.pet_1_profile : item.pet_2_profile;
                            const otherPetProfile = isPet1Mine ? item.pet_2_profile : item.pet_1_profile;
                            const conversationMessages = newMessages.filter((msg) => msg.conversation_id === item.id);
                            const latestMessage = conversationMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                            const isUnread = latestMessage && latestMessage.read_at === null && !myPetIds.includes(latestMessage.sender_pet_id);

                            return (
                                <TouchableOpacity onPress={() => router.push(`./message_screen?conversationId=${item.id}&otherPetAvatar=${otherPetProfile.pet_avatar}`)}>
                                    <View style={styles.convoBoxItem}>
                                        <View style={noConvoStyles.petImagesCont}>
                                            <Image source={{ uri: myPetProfile.pet_avatar }} style={noConvoStyles.pet1image} />
                                            <Image source={{ uri: otherPetProfile.pet_avatar }} style={noConvoStyles.pet2image} />
                                        </View>
                                        <View style={styles.chatDetails}>
                                            <Text numberOfLines={1} style={[styles.chatTitle, isUnread && { fontWeight: 'bold' }]}>
                                                {otherPetProfile.name}
                                            </Text>
                                            <Spacer height={dimensions.screenHeight * 0.002} />
                                            <Text numberOfLines={1} style={[styles.chatMessage, isUnread && { fontFamily: 'Poppins-SemiBold', color: '#000' }]}>
                                                {latestMessage
                                                    ? `${myPetIds.includes(latestMessage.sender_pet_id) ? 'You: ' : ''}${latestMessage.content}`
                                                    : "Say hi!"
                                                }
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                            {latestMessage && (
                                                <>
                                                    <Text style={styles.chatTime}>
                                                        {moment(latestMessage.created_at).format('h:mm A')}
                                                    </Text>
                                                    {isUnread && <View style={styles.unreadDot} />}
                                                </>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </MainContPlain>
        </View>
    );
};

export default ConversationScreen;

const noConvoStyles = StyleSheet.create({
    petImagesCont: {
        position: 'relative',
        width: dimensions.screenWidth * 0.17,
        // backgroundColor: 'red',
        height: dimensions.screenHeight * 0.083
    },
    pet1image: {
        width: dimensions.screenWidth * 0.11,
        height: dimensions.screenWidth * 0.11,
        borderRadius: 100,
        borderColor: 'white',
        borderWidth: 2,
        position: 'absolute'
    },
    pet2image: {
        width: dimensions.screenWidth * 0.11,
        height: dimensions.screenWidth * 0.11,
        borderRadius: 100,
        borderColor: 'white',
        borderWidth: 2,
        bottom: 0,
        right: 0,
        position: 'absolute'
    },
});

const styles = StyleSheet.create({
    convoBox: {
        paddingHorizontal: dimensions.screenWidth * 0.05
    },
    convoTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: dimensions.screenWidth * 0.055
    },
    menuRow: {
        flexDirection: 'row',
        marginVertical: dimensions.screenHeight * 0.015,
        justifyContent: 'space-around',
    },
    menuText: {
        fontFamily: 'Poppins-Regular',
        fontSize: dimensions.screenWidth * 0.04,
        color: '#aaa',
    },
    menuTextActive: {
        color: '#4A90E2',
        fontFamily: 'Poppins-SemiBold',
    },
    convoBoxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: dimensions.screenHeight * 0.02,
    },
    chatDetails: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        flex: 1,
        marginLeft: dimensions.screenWidth * 0.03
    },
    chatTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: dimensions.screenWidth * 0.043
    },
    chatMessage: {
        fontFamily: 'Poppins-Regular',
        fontSize: dimensions.screenWidth * 0.038,
        color: '#888'
    },
    chatTime: {
        fontFamily: 'Poppins-Regular',
        fontSize: dimensions.screenWidth * 0.032,
        color: '#666'
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ED7964',
        marginTop: 4,
    }
});
