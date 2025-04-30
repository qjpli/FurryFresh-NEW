import { StyleSheet, Text, View, Animated, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import dimensions from '../../utils/sizing';
import { router, useLocalSearchParams } from 'expo-router';
import { useSession } from '../../context/sessions_context';
import { usePet } from '../../context/pet_context';
import Pets from '../../interfaces/pets';
import { Ionicons } from '@expo/vector-icons';

type Props = {};

const MatchedScreen = (props: Props) => {
    const { session } = useSession();
    const { pets } = usePet();

    const moveAnim = useRef(new Animated.Value(0)).current;
    const detailsOpacity = useRef(new Animated.Value(0)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;

    const { mutualMath, insertedMatch, usedPet, matchedPet } = useLocalSearchParams();

    const parsedMutualMatch = mutualMath ? JSON.parse(mutualMath as string) : null;
    const parsedInsertedMatch = insertedMatch ? JSON.parse(insertedMatch as string) : null;
    const parsedUsedPet = usedPet ? JSON.parse(usedPet as string) as Pets : null;
    const parsedMatchedPet = matchedPet ? JSON.parse(matchedPet as string) as Pets : null;

    const petUsed = pets.find((pet) => pet.id == parsedInsertedMatch?.used_pet_id);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.sequence([
                Animated.timing(moveAnim, {
                    toValue: -dimensions.screenHeight * 0.1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(detailsOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.delay(500),
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        console.log('Continue pressed!');

        router.back();
    };

    return (
        <View style={styles.mainCont}>
            <Ionicons name='paw' size={dimensions.screenWidth * 0.5} color="#f29430" style={[styles.pawStyle, styles.topPaw]} />
            <Ionicons name='paw' size={dimensions.screenWidth * 0.5} color="#f29430" style={[styles.pawStyle, styles.bottomPaw]} />

            <Image 
              source={require('../../assets/images/others/PetBGMatch.png')}
              style={styles.petBGMatch}
            />

            <Animated.View style={[styles.headerCont, { transform: [{ translateY: moveAnim }] }]}>
                <Text style={styles.headerTitle}>It's a Match</Text>
            </Animated.View>

            <Animated.View style={[styles.detailsCont, { opacity: detailsOpacity }]}>
                <View style={styles.petImageCont}>
                    <Image
                        source={{ uri: parsedUsedPet?.pet_avatar ?? '' }}
                        style={styles.petImage}
                    />
                    <Image
                        source={{ uri: parsedMatchedPet?.pet_avatar ?? '' }}
                        style={[styles.petImage,
                        {
                            position: 'absolute',
                            marginLeft: dimensions.screenWidth * 0.23
                        }
                        ]}
                    />
                </View>
                <Text style={styles.detailsText}>{parsedUsedPet?.name} has found a playmate!</Text>
            </Animated.View>

            <Animated.View style={[styles.buttonCont, { opacity: buttonOpacity }]}>
                <TouchableOpacity style={styles.button} onPress={() => router.push('./chats/conversation_screen')}>
                    <Text style={styles.buttonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleContinue}>
                    <Text style={styles.notNowButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default MatchedScreen;

const styles = StyleSheet.create({
    pawStyle: {
        position: 'absolute',
    },
    topPaw: {
        top: -dimensions.screenHeight * 0.045,
        left: -dimensions.screenWidth * 0.06,
        transform: 'rotate(120deg)'
    },
    bottomPaw: {
        bottom: -dimensions.screenHeight * 0.045,
        right: -dimensions.screenWidth * 0.06,
        transform: 'rotate(-30deg)'
    },
    petBGMatch: {
        position: 'absolute',
        top: dimensions.screenHeight * 0.25,
        left: 0,
        right: 0,
        bottom: 0,
        width: dimensions.screenWidth * 1,
        height: dimensions.screenHeight * 0.5
    },
    mainCont: {
        backgroundColor: '#ffa545',
        flex: 1,
        width: dimensions.screenWidth,
        alignItems: 'center',
        // justifyContent: 'center',
        paddingTop: dimensions.screenHeight * 0.3,
        position: 'relative'
    },
    headerCont: {
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor:'green'
    },
    headerTitle: {
        fontFamily: 'HipsterScriptPro',
        color: '#fff',
        fontSize: dimensions.screenWidth * 0.15,
    },
    detailsCont: {
        marginTop: 0,
        padding: 0,
        alignItems: 'center',
        // backgroundColor:'red'
    },
    detailsText: {
        fontFamily: 'Poppins-Regular',
        fontSize: dimensions.screenWidth * 0.044,
        textAlign: 'center',
        color: '#fff',
    },
    petImageCont: {
        flexDirection: 'row',
        marginBottom: dimensions.screenHeight * 0.025,
        // backgroundColor: 'red',
        alignItems: 'center',
        width: dimensions.screenWidth * 0.49
    },
    petImage: {
        width: dimensions.screenWidth * 0.26,
        height: dimensions.screenWidth * 0.26,
        borderRadius: 100,
        borderColor: 'white',
        borderWidth: 2,
    },
    buttonCont: {
        position: 'absolute',
        bottom: dimensions.screenHeight * 0.1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: 'white',
        paddingVertical: dimensions.screenHeight * 0.02,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: dimensions.screenWidth * 0.8,
        alignItems: 'center'
    },
    buttonText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: dimensions.screenWidth * 0.05,
        color: '#ffa545',
    },
    notNowButtonText: {
        fontFamily: 'Poppins-SemiBold',
        marginTop: dimensions.screenHeight * 0.03,
        color: '#fff',
        fontSize: dimensions.screenWidth * 0.04
    }
});
