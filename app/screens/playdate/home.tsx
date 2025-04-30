import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import dimensions from '../../utils/sizing';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import Pets from '../../interfaces/pets';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal, PortalProvider } from '@gorhom/portal';
import { usePet } from '../../context/pet_context';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { petsStyles } from '../pets/components/petsStyles';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import SvgValue from '../../hooks/fetchSvg';
import supabase from '../../utils/supabase';
import { useSession } from '../../context/sessions_context';
import TinderCard from 'react-tinder-card';
import { GestureHandlerRootView, GestureDetector, Gesture, PanGestureHandler } from 'react-native-gesture-handler';
import moment from 'moment';
import Spacer from '../../components/general/spacer';
import { Heart, HeartHandshake, PawPrint, MessageCircle, MessageCircleMore, HomeIcon } from "lucide-react-native";
import { useMessages } from '../../realtime/messages';
import { useConversations } from '../../realtime/conversations';

const screenWidth = dimensions.screenWidth;
const screenHeight = dimensions.screenHeight;

const Home = () => {
  const alreadyRemoved = useRef<string[]>([]);
  const [currentPet, setCurrentPet] = useState<Pets | null>(null);

  const router = useRouter();
  const { session } = useSession();
  const { pets } = usePet();
  const [isStartUp, setStartUp] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchedPets, setFetchedPets] = useState<Pets[]>([]);
  const [allSwiped, setAllSwiped] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pets | null>(null);
  const selectPetRef = useRef<BottomSheet>(null);
  const selectPetSnapPoints = useMemo(() => ["50%"], []);

  const petDetailsRef = useRef<BottomSheet>(null);
  const petDetailsSnapPoints = useMemo(() => ["80%"], []);



  const { newMessages } = useMessages();

  useEffect(() => {
    console.log('New incoming messages:', newMessages);
  }, [newMessages]);

  const { newConversations } = useConversations();

  useEffect(() => {
    console.log('New incoming conversation:', newConversations);
  }, [newConversations]);


  const dataToMap = [
    { label: 'Friendly' },
    { label: 'Playful' },
    { label: 'Energetic' },
    { label: 'Loyal' },
  ];


  const childRefs = useMemo(
    () =>
      Array(fetchedPets.length)
        .fill(0)
        .map(() => React.createRef<any>()),
    [fetchedPets]
  );

  const [isSwiping, setIsSwiping] = useState(false);


  const swiped = async (direction: string, idToDelete: string) => {
    const storeRemovedForAWhile = fetchedPets.find((pet) => pet.id == idToDelete);

    setCurrentPet(null);

    console.log('removing: ' + idToDelete + ' to the ' + direction);
    alreadyRemoved.current.push(idToDelete);

    if (alreadyRemoved.current.length === fetchedPets.length) {
      setAllSwiped(true);
    }


    if (direction === 'right') {
      const { data: insertedMatch, error } = await supabase
        .from('playdate_matches')
        .insert({
          user_id: session?.user.id,
          used_pet_id: selectedPet?.id,
          to_match_pet_id: idToDelete,
          created_at: new Date()
        })
        .select();

      if (error) {
        console.error('Error inserting match:', error);
        return;
      }

      const { data: mutualMatch, error: mutualError } = await supabase
        .from('playdate_matches')
        .select()
        .eq('used_pet_id', idToDelete)
        .eq('to_match_pet_id', selectedPet?.id)
        .single();

      if (mutualError && mutualError.code !== 'PGRST116') {
        console.error('Error checking for mutual match:', mutualError);
        return;
      }

      if (mutualMatch) {
        console.log('Mutual match found! 🎉', mutualMatch);

        const { data: insertedConversation, error: conversationError } = await supabase
          .from('playdate_conversations')
          .insert({
            pet_1_id: selectedPet?.id,
            pet_2_id: idToDelete,
            created_at: new Date()
          })
          .select()
          .single();

        if (conversationError) {
          console.error('Error creating conversation:', conversationError);
          // You can choose to continue anyway or show error
        } else {
          console.log('Conversation created:', insertedConversation);
        }

        router.push({
          pathname: './matched',
          params: {
            mutualMath: JSON.stringify(mutualMatch),
            insertedMatch: JSON.stringify(insertedMatch),
            insertedConversation: JSON.stringify(insertedConversation), // maybe you want to pass it
            usedPet: JSON.stringify(selectedPet),
            matchedPet: JSON.stringify(storeRemovedForAWhile)
          }
        });
      }
      else {
        console.log('No match found!');

      }
    }
  };

  const swipe = async (dir: 'left' | 'right') => {
    const cardsLeft = fetchedPets.filter((pet) => !alreadyRemoved.current.includes(pet.id));
    if (cardsLeft.length) {
      setIsSwiping(true);
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].id;
      const index = fetchedPets.map(pet => pet.id).indexOf(toBeRemoved);
      await childRefs[index]?.current?.swipe(dir);
      setTimeout(() => {
        setIsSwiping(false);
      }, 100);
    }
  };

  const openSheet = () => selectPetRef.current?.expand();

  const filterMyPetsData = () => {
    const val = pets.filter((pet) => pet.is_playdate_allowed);
    return val;
  };

  const selectPetBackDrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const petDetailsBackDrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        zIndex={2}
      />
    ),
    []
  );

  const selectPetHandleSheetChange = (index: number) => {
    if (index === 0) {
      selectPetRef.current?.close();
    }
  };

  const petDetailsHandleSheetChange = (index: number) => {
    if (index === 0) {
      petDetailsRef.current?.close();
    }
  };

  const handlePress = () => router.push('../../screens/(tabs)/home');

  const fetchPets = useCallback(async () => {
    setAllSwiped(false);

    const { data: matchesMade, error: matchesError } = await supabase
      .from('playdate_matches')
      .select('to_match_pet_id')
      .eq('used_pet_id', selectedPet?.id);

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return;
    }

    const alreadyMatchedIds = matchesMade?.map(match => match.to_match_pet_id) || [];

    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_playdate_allowed', true)
      .neq('user_id', session?.user.id)
      .not('id', 'in', `(${alreadyMatchedIds.join(',')})`);

    if (error) {
      console.error('Error fetching pets:', error);
      return;
    }

    if (data) {
      setFetchedPets(data as Pets[]);
      alreadyRemoved.current = [];
      setCurrentPet((data as Pets[])[data.length - 1]);
    }
  }, [selectedPet, session?.user.id]);



  useEffect(() => {
    if (!isStartUp) {
    }
  }, [fetchPets]);

  useEffect(() => {
    if (selectedPet) {
      alreadyRemoved.current = [];
      setFetchedPets([]);
      fetchPets();
    }
  }, [selectedPet]);



  useEffect(() => {
    if (selectedPet === null) {
      console.log('nullll')

      setTimeout(function () {
        openSheet();
      }, 500);
    }
  }, []);

  return (
    <PortalProvider>
      <View style={styles.container}>
        <Ionicons name='paw' color="#bdcde4" size={dimensions.screenWidth * 0.45}
          style={{
            position: 'absolute',
            top: dimensions.screenHeight * 0.05,
            right: -dimensions.screenWidth * 0.15,
            transform: 'rotate(-60deg)'
          }}
        />
        <Ionicons name='paw' color="#bdcde4" size={dimensions.screenWidth * 0.45}
          style={{
            position: 'absolute',
            bottom: dimensions.screenHeight * 0.05,
            left: -dimensions.screenWidth * 0.15,
            transform: 'rotate(60deg)'
          }}
        />
        <View style={styles.topLeftWrapper}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.coloredBox} onPress={handlePress}>
              <HomeIcon size={dimensions.screenWidth * 0.07} color="#fff" />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.backText}>Back to Home</Text>
              <Text style={styles.pageText}>Page</Text>
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={() => openSheet()}>
              <Image
                source={{ uri: selectedPet?.pet_avatar ?? '' }}
                style={{
                  width: dimensions.screenWidth * 0.14,
                  height: dimensions.screenWidth * 0.14,
                  borderRadius: 100,
                  borderColor: 'white',
                  borderWidth: 2,
                  backgroundColor: '#d1d1d1'
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleWrapper}>
          <Text style={[styles.title, styles.blueText]}>FIND YOUR PLAY </Text>
          <Text style={[styles.title, styles.orangeText]}>DATE</Text>
        </View>

        <View style={styles.line} />

        {fetchedPets.length > 0 && fetchedPets.map((pet, index) => (
          <TinderCard
            ref={childRefs[index]}
            key={pet.id}
            onSwipe={(dir) => swiped(dir, pet.id)}
            onCardLeftScreen={() => {
              const nextIndex = index - 1;
              if (nextIndex >= 0 && fetchedPets[nextIndex]) {
                setCurrentPet(fetchedPets[nextIndex]);
              } else {
                setCurrentPet(null); // no more pets
              }
            }}
            preventSwipe={['up', 'down']}
          >
            <View key={index} style={[styles.whiteContainer]}>
              <Image
                source={{ uri: pet.pet_avatar }}
                style={styles.petImage}
              />
              <View style={styles.infoRow}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={styles.containerTitle}>
                    {pet.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                  <Text numberOfLines={1} style={styles.containerSubtitle}>
                    {pet.breed.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                </View>
                {
                  pet.gender.toLowerCase() == 'male'
                    ? <Ionicons name='male' size={dimensions.screenWidth * 0.1} color="#466AA2" />
                    : <Ionicons name='female' size={dimensions.screenWidth * 0.1} color="#ED7964" />
                }
              </View>
            </View>
          </TinderCard>
        ))}

        {(allSwiped) && (
          <View style={[styles.whiteContainer, { position: 'relative', justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
            <Ionicons
              name="checkmark-circle"
              size={dimensions.screenWidth * 0.3}
              color="#ED7964"
              style={{ marginBottom: dimensions.screenHeight * 0.0 }}
            />
            <Text style={{
              fontSize: 24,
              color: '#121F63',
              fontFamily: 'Poppins-Bold',
              textAlign: 'center',
              marginBottom: 10
            }}>
              No More Playmates!
            </Text>
            <Text style={{
              fontSize: dimensions.screenWidth * 0.033,
              color: '#808080',
              fontFamily: 'Poppins-Light',
              textAlign: 'center',
              lineHeight: 22,
              maxWidth: '90%'
            }}>
              All pets have been swiped!
              Come back later for more furry friends. 🐾
            </Text>
          </View>
        )}


        {
          fetchedPets.length == 0 &&
          <View style={[styles.whiteContainer, { position: 'relative' }]}>
            <View style={[styles.petImage, { backgroundColor: '#F5F5F5' }]}></View>
            <View style={[styles.petImage, { backgroundColor: '#F5F5F5', height: dimensions.screenHeight * 0.03 }]}></View>
          </View>
        }

        {
          fetchedPets.length > 0 &&
          <TouchableOpacity disabled={isSwiping} style={styles.detailsContainer} onPress={() => petDetailsRef.current?.expand()}>
            <View style={styles.detailsContent}>
              <Ionicons name='information-circle' color="#fff" size={dimensions.screenWidth * 0.05} />
              <Spacer width={dimensions.screenWidth * 0.02} />
              <Text style={styles.detailsText}>PlayDate Details</Text>
            </View>
          </TouchableOpacity>
        }

        {
          fetchedPets.length > 0 &&
          <View style={styles.containerRow}>
            <TouchableOpacity disabled={isSwiping} style={styles.skipContainer} onPress={() => swipe('left')}>
              <Ionicons name='close' color="#fff" size={dimensions.screenWidth * 0.1} />
            </TouchableOpacity>
            <TouchableOpacity disabled={isSwiping} style={styles.checkContainer} onPress={() => {
              swipe('right');
            }}>
              <Ionicons name='checkmark' color="#fff" size={dimensions.screenWidth * 0.1} />
            </TouchableOpacity>
          </View>
        }

        <TouchableOpacity style={styles.matchesButton} onPress={() => router.push('./chats/conversation_screen')}>
          <MessageCircleMore size={dimensions.screenWidth * 0.07} color="white" />
        </TouchableOpacity>
      </View>
      <Portal>
        <BottomSheet
          ref={selectPetRef}
          snapPoints={selectPetSnapPoints}
          index={-1}
          enablePanDownToClose={true}
          handleComponent={null}
          backgroundStyle={{ backgroundColor: "transparent" }}
          backdropComponent={selectPetBackDrop}
          onChange={selectPetHandleSheetChange}
        >
          <BottomSheetView style={selectPetBS.mainCont}>
            <View style={selectPetBS.header}>
              <Text style={selectPetBS.headTitle}>Select a Pet that you want to use</Text>
            </View>
            <FlatList
              data={filterMyPetsData()}
              style={{ flex: 1, }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.petItemCont}
                  onPress={() => {
                    setSelectedPet(item);
                    selectPetRef.current?.close();
                  }}
                >
                  <View style={{
                    position: "relative",
                    width: dimensions.screenWidth * 0.18,
                    alignItems: "center",
                    justifyContent: "center",
                    height: dimensions.screenWidth * 0.16,
                    marginRight: dimensions.screenWidth * 0.03,
                  }}>
                    {item.pet_avatar ? (
                      <Image source={{ uri: item.pet_avatar }} style={petsStyles.petImage} />
                    ) : (
                      <View style={[petsStyles.petImage, {
                        backgroundColor: "#D1D1D1",
                        alignItems: 'center',
                        justifyContent: 'center'
                      }]}>
                        <SvgValue
                          svgIcon={item.pet_type == 'Dog' ? "dog" : "cat"}
                          color="#fff"
                          width={dimensions.screenWidth * 0.07}
                          height={dimensions.screenWidth * 0.07}
                        />
                      </View>
                    )}
                    <View style={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      alignItems: "center",
                    }}>
                      <View style={[
                        petsStyles.genderTag,
                        item.gender === "Male" ? petsStyles.maleTag : petsStyles.femaleTag,
                        { flexDirection: "row", gap: dimensions.screenWidth * 0.01 }
                      ]}>
                        <Ionicons
                          name={item.gender == "Male" ? "male" : "female"}
                          size={dimensions.screenWidth * 0.03}
                          color="#fff"
                        />
                        <Text style={petsStyles.genderText}>{item.gender}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={petsStyles.petInfo}>
                    <Text style={petsStyles.petName}>{item.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <FontAwesome5
                        name={item.pet_type.toLowerCase() === "dog" ? "dog" : "cat"}
                        size={12}
                        color="#777"
                      />
                      <Text style={petsStyles.petType}> {item.pet_type}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </BottomSheetView>
        </BottomSheet>

        <BottomSheet
          ref={petDetailsRef}
          snapPoints={petDetailsSnapPoints}
          index={-1}
          enablePanDownToClose={true}
          handleComponent={null}
          backgroundStyle={{ backgroundColor: "transparent" }}
          backdropComponent={petDetailsBackDrop}
          onChange={petDetailsHandleSheetChange}
        >
          <BottomSheetView style={petDetailsBS.mainCont}>
            <ScrollView bounces={false}>
              <View style={petDetailsBS.header}>
                <Image
                  source={{ uri: currentPet?.pet_avatar }}
                  style={petDetailsBS.image}
                />
                <View style={{
                  position: 'absolute',
                  zIndex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  bottom: dimensions.screenHeight * 0.01,
                  left: dimensions.screenWidth * 0.03
                }}>
                  <View style={petDetailsBS.ownerImageCont}>
                    {
                      currentPet?.profiles?.avatar_url ?
                        <Image
                          source={{ uri: currentPet?.profiles?.avatar_url }}
                          style={petDetailsBS.ownerImage}
                        /> :
                        (
                          <Ionicons name='person' size={dimensions.screenWidth * 0.06} color="#fff"></Ionicons>
                        )
                    }
                  </View>
                  <Text style={petDetailsBS.ownerName}>{currentPet?.profiles?.first_name}</Text>
                </View>
              </View>
              <View style={petDetailsBS.body}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: dimensions.screenWidth * 0.03, width: dimensions.screenWidth * .85 }}>
                    <Text numberOfLines={2} style={[petDetailsBS.petName]}>
                      {currentPet?.name}
                    </Text>
                    {
                      currentPet?.gender?.toLowerCase() == 'male' ?
                        <Ionicons name='male' size={dimensions.screenWidth * 0.06} color="#466AA2" /> :
                        <Ionicons name='female' size={dimensions.screenWidth * 0.06} color="#ED7964" />
                    }
                  </View>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: dimensions.screenHeight * 0.01 }}>
                    {/* {dataToMap.map((item, index) => (
                    <View key={index} style={{
                      padding: 8,
                      backgroundColor: '#eee',
                      borderRadius: 8,
                      marginRight: 8,
                      marginBottom: 8,
                    }}>
                      <Text>{item.label}</Text>
                    </View>
                  ))} */}
                    <View style={{
                      padding: 8,
                      backgroundColor: '#b88c33',
                      borderRadius: 8,
                      marginRight: 8,
                      marginBottom: 8,
                      paddingHorizontal: dimensions.screenWidth * 0.04,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Ionicons name='paw' color="#fff" size={dimensions.screenWidth * 0.032} />
                      <Spacer width={dimensions.screenWidth * 0.01} />
                      <Text style={{ fontFamily: 'Poppins-Medium', color: 'white', fontSize: dimensions.screenWidth * 0.035 }}>
                        {currentPet?.breed.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Text>
                    </View>
                    {
                      currentPet?.birthday && <View style={{
                        padding: 8,
                        backgroundColor: '#d47163',
                        borderRadius: 8,
                        marginRight: 8,
                        marginBottom: 8,
                        paddingHorizontal: dimensions.screenWidth * 0.04,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}>
                        <Ionicons name='balloon' color="#fff" size={dimensions.screenWidth * 0.032} />
                        <Spacer width={dimensions.screenWidth * 0.01} />
                        <Text style={{ fontFamily: 'Poppins-Medium', color: 'white', fontSize: dimensions.screenWidth * 0.035 }}>
                          {moment(currentPet?.birthday).format('MMM D, YYYY')}
                        </Text>
                      </View>
                    }
                  </View>
                  <View style={{ marginTop: dimensions.screenHeight * 0.01 }}>
                    <Text style={{ fontFamily: 'Poppins-Medium' }}>What to know about
                      {' ' + currentPet?.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}?
                    </Text>
                    <View style={{ marginTop: dimensions.screenHeight * 0.01, backgroundColor: '#F1F1F1', paddingHorizontal: dimensions.screenWidth * 0.04, paddingVertical: dimensions.screenHeight * 0.012, borderRadius: 10 }}>
                      <Text style={{ fontFamily: 'Poppins-Regular', color: (currentPet?.bio ?? '').length > 0 ? 'black' : '#808080' }}>
                        {(currentPet?.bio ?? '').length > 0 ? currentPet?.bio : 'No bio added for this pet'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </PortalProvider>
  );
};


export default Home;

const styles = StyleSheet.create({
  matchesButton: {
    position: 'absolute',
    bottom: dimensions.screenHeight * 0.05,
    right: dimensions.screenWidth * 0.06,
    backgroundColor: '#466AA2',
    padding: dimensions.screenWidth * 0.045,
    borderRadius: 100
  },
  container: {
    flex: 1,
    backgroundColor: '#D0DFF4',
    paddingTop: dimensions.screenHeight * 0.05,
    paddingHorizontal: 20,
    position: 'relative',
  }, 
  petItemCont: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedPetItemCont: {
    borderColor: '#466AA2',
    borderWidth: 2,
    backgroundColor: '#ebf0f7'
  },
  topLeftWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 0,
  },
  coloredBox: {
    width: dimensions.screenWidth * 0.14,
    height: dimensions.screenWidth * 0.14,
    backgroundColor: '#466AA2',
    borderRadius: 30,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIcon: {
    width: 28,
    height: 28,
  },
  textContainer: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  backText: {
    color: '#121F63',
    fontSize: dimensions.screenWidth * 0.03,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  pageText: {
    color: '#121F63',
    fontSize: dimensions.screenWidth * 0.04,
    fontFamily: 'Poppins-Medium',
    marginTop: -3,
  },
  titleWrapper: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: dimensions.screenWidth * 0.07,
    fontFamily: 'Baloo-Regular',
    textAlign: 'center',
  },
  blueText: { color: '#121F63' },
  orangeText: { color: '#E94C30' },
  line: {
    marginTop: 10,
    width: '27%',
    height: 8,
    backgroundColor: '#121F63',
    alignSelf: 'center',
    borderRadius: 30
  },
  whiteContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 30,
    width: dimensions.screenWidth * 0.66,
    height: dimensions.screenHeight * 0.35,
    marginTop: dimensions.screenHeight * 0.05,
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    position: 'absolute',
    paddingVertical: dimensions.screenHeight * 0.02,
    justifyContent: 'space-between',
    resizeMode: 'cover',
  },
  petImage: {
    width: dimensions.screenWidth * 0.5,
    height:  dimensions.screenHeight * 0.2,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  containerTitle: {
    fontSize: dimensions.screenSize * 0.016,
    color: '#121F63',
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
    lineHeight: dimensions.screenSize * 0.02,
  },
  containerSubtitle: {
    fontSize: dimensions.screenSize * 0.011,
    color: '#828282',
    fontFamily: 'Poppins-Regular',
    marginTop: 0,
  },
  genderIcon: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
  },
  detailsContainer: {
    backgroundColor: '#466AA2',
    borderRadius: 30,
    marginTop: dimensions.screenHeight * 0.45,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 25,
  },
  detailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  detailsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  skipContainer: {
    backgroundColor: '#DA8474',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 78,
    height: 78,
    marginRight: 15,
  },
  checkContainer: {
    backgroundColor: '#96AFD5',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 78,
    height: 78,
  },
  skipImage: {
    width: 28,
    height: 28,
  },
  checkImage: {
    width: 37,
    height: 37,
  },
  paw1Image: {
    position: 'absolute',
    bottom: 10,
    left: -10,
    width: 150,
    height: 150,
  },
  paw2Image: {
    position: 'absolute',
    top: 0,
    right: -30,
    width: 200,
    height: 200,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalLogo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#121F63',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#466AA2',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 25,
  },
  modalButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
});

const selectPetBS = StyleSheet.create({
  mainCont: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    position: "relative",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  header: {
    alignItems: 'center',
    marginTop: screenHeight * 0.02,
    marginBottom: screenHeight * 0.02
  },
  headTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: dimensions.screenWidth * 0.04,
  }
});

const petDetailsBS = StyleSheet.create({
  mainCont: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    position: "relative",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  header: {
    alignItems: 'center',
    position: 'relative'
  },
  headTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: dimensions.screenWidth * 0.04,
  },
  image: {
    width: dimensions.screenWidth,
    height: dimensions.screenHeight * 0.4,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23
  },
  ownerImage: {
    width: dimensions.screenWidth * 0.13,
    height: dimensions.screenWidth * 0.13,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
  },
  ownerImageCont: {
    backgroundColor: '#E0E0E0',
    borderRadius: 100,
    height: dimensions.screenWidth * 0.13,
    width: dimensions.screenWidth * 0.13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: dimensions.screenWidth * 0.03
  },
  ownerName: {
    backgroundColor: 'white',
    paddingHorizontal: dimensions.screenWidth * 0.035,
    borderRadius: 15,
    fontFamily: 'Poppins-Medium',
    paddingVertical: dimensions.screenHeight * 0.005
  },

  body: {
    paddingTop: dimensions.screenHeight * 0.015,
    paddingHorizontal: dimensions.screenWidth * 0.05
  },
  petName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.07
  }
});
