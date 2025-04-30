import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Button, ActivityIndicator } from 'react-native';
import React, { useLayoutEffect, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MainContPlain from '../../components/general/background_plain';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import AppbarDefault from '../../components/bars/appbar_default';
import { Session } from '@supabase/supabase-js';
import dimensions from '../../utils/sizing';
import Title1 from '../../components/texts/title1';
import Subcategories from '../../interfaces/subcategories';
import DefaultListIcon from '../../components/svgs/home/services/DefaultListIcon';
import SvgValue from '../../hooks/fetchSvg';
import Spacer from '../../components/general/spacer';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import supabase from '../../utils/supabase';
import Pets from '../../interfaces/pets';
import Button1 from '../../components/buttons/button1';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal, PortalProvider } from '@gorhom/portal';
import { usePet } from '../../context/pet_context';
import { Icon } from '@rneui/themed';
import Subtitle1 from '../../components/texts/subtitle1';
import { dogSizes, getSizeCategory } from '../../hooks/fetchPetSize';
import Price from '../../components/general/price';

const BookingScheduling = () => {
  const navigation = useNavigation();
  const [session, setSession] = useState<Session | null>(null);
  const { object } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [petChosen, setPetChosen] = useState<Pets[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pets[]>([]);
  const openSheet = () => sheetRef.current?.expand();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);
  const { pets, fetchPets, addToPetContext, updatePetContext } = usePet();
  const isReady = selectedDate && selectedTime && petChosen.length > 0;
  const [isLoading, setLoading] = useState<boolean>(false);

  const handleSelectPet = useCallback(() => {
    if (selectedPet && JSON.stringify(selectedPet) !== JSON.stringify(petChosen)) {
      setPetChosen(selectedPet);
      sheetRef.current?.close();
      console.log("Now pets val", pets);
    } else {
      sheetRef.current?.close();
    }
  }, [selectedPet, petChosen, pets]);


  const backDrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const handleSheetChange = (index: number) => {
    if (index === 0) {
      sheetRef.current?.close();
    } else {

    }
  };

  if (!object) {
    return (
      <MainContPlain>
        <View style={styles.errorCont}>
          <Text style={styles.errorText}>Error: No grooming data provided.</Text>
        </View>
      </MainContPlain>
    );
  }

  let grooming: Subcategories;
  try {
    grooming = typeof object === 'string' ? JSON.parse(object) : object;
  } catch (error) {
    return (
      <MainContPlain>
        <View style={styles.errorCont}>
          <Text style={styles.errorText}>Error: Invalid grooming data.</Text>
        </View>
      </MainContPlain>
    );
  }

  const rawGroomingStr = useMemo(() => JSON.stringify(object), [object]);

  const parsedGrooming = useMemo(() => {
    try {
      console.log("Raw: ", rawGroomingStr);
      return JSON.parse(rawGroomingStr);
    } catch (error) {
      return null;
    }
  }, [rawGroomingStr]);


  const groomingId = grooming?.id;

  useEffect(() => {
    let isMounted = true;
    console.log("Bookeds: ", groomingId);
    const fetchBookingsForDate = async () => {
      if (!groomingId) return;

      console.log("running");
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', selectedDate)
        .eq('grooming_id', groomingId);

      if (error) return;
      if (data && isMounted) {
        const times = data.map((item: any) => item.time_start);
        setBookedTimes(times);
        console.log(times);
      }

      console.log('Booked Times: ', data);
    };
    fetchBookingsForDate();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, groomingId]);



  const generateNext7Dates = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = moment().add(i, 'days');
      return {
        value: date.format('YYYY-MM-DD'),
        month: date.format('MMM'),
        day: date.format('D'),
      };
    });
  };

  const getTimeSlots = (date: string) => {
    const day = moment(date).format('dddd').toLowerCase();
    let start = '08:00';
    let end = '19:30';
    if (day === 'sunday') {
      end = '16:30';
    } else if (['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].includes(day)) {
      end = '18:30';
    }
    const slots: string[] = [];
    let current = moment(start, 'HH:mm');
    const last = moment(end, 'HH:mm');
    const isToday = moment().isSame(date, 'day');
    while (current <= last) {
      const slotStr = current.format('HH:mm');
      if ((!isToday || current.isAfter(moment()))) {
        slots.push(slotStr);
      }
      current.add(30, 'minutes');
    }
    return slots;
  };

  const dateOptions = generateNext7Dates();

  const icon = grooming.svg_icon ? (
    <SvgValue
      svgIcon={grooming.svg_icon}
      color="#fff"
      width={dimensions.screenWidth * 0.11}
      height={dimensions.screenWidth * 0.11}
    />
  ) : null;


  return (
    <PortalProvider>
      <View style={{ height: '100%', backgroundColor: '#F8F8FF' }}>
        {(
          <AppbarDefault
            title="Booking"
            subtitle={grooming.title}
            subtitleSize={dimensions.screenWidth * 0.03}
            subtitleFont="Poppins-Regular"
            session={session}
            showLeading={false}
            leadingChildren
            zIndex={0}
            titleSize={dimensions.screenWidth * 0.045}
          />
        )}
        <MainContPlain>
          <View style={styles.cont1}>
            <Title1 text="To Book Service" fontSize={dimensions.screenWidth * 0.05} />
            <View style={styles.groomTypeCont}>
              <View style={styles.listSvgIconBG}>
                {!icon ? (
                  <DefaultListIcon
                    color="#fff"
                    width={dimensions.screenWidth * 0.11}
                    height={dimensions.screenWidth * 0.11}
                    props
                  />
                ) : (
                  icon
                )}
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.l1title}>{grooming.title}</Text>
                <Text style={styles.l1description}>{grooming.description}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cont1}>
            <Title1 text="Pet Selection" fontSize={dimensions.screenWidth * 0.05} />
            <Spacer height={dimensions.screenHeight * 0.01} />
            <View style={styles.cont2main}>
              <View style={styles.cont2}>
                <Text style={styles.cont2title}>Select Pet</Text>
                <Text style={styles.cont2desc}>Choose a pet for this appointment</Text>
              </View>
              <View style={[styles.cont2, { alignItems: 'flex-end', flex: 1 }]}>
                <Ionicons name="paw" size={dimensions.screenWidth * 0.06} color="#B5B5B5" />
              </View>
            </View>
            <Spacer height={dimensions.screenHeight * 0.015} />
            {
              petChosen.length == 0 ? (
                <Button1
                  title='Select a Pet'
                  isPrimary={false}
                  borderRadius={10}
                  onPress={() => { setSelectedPet(petChosen); openSheet(); }}
                  textStyle={{
                    fontSize: dimensions.screenWidth * 0.04,
                    color: 'white'
                  }}
                  paddingVertical={dimensions.screenHeight * 0.014}
                />
              ) : (
                <View style={{ flex: 1, width: '100%' }}>
                  <FlatList
                    data={petChosen}
                    scrollEnabled={false}
                    style={{}}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => {
                      const pet = item;
                      return (
                        <View key={item.id} style={[sheetStyles.petCont, {
                          backgroundColor: '#e2e7f3',
                          marginBottom: index != pets.length - 1 ? dimensions.screenHeight * 0.01 : dimensions.screenHeight * 0.015,
                          width: '100%'
                        }]}>
                          <View style={[sheetStyles.iconCont, {
                            width: dimensions.screenWidth * 0.12,
                            height: dimensions.screenWidth * 0.12,
                          }]}>
                            {
                              pet.pet_avatar ?
                                <Image source={{ uri: pet.pet_avatar }} style={{ height: '100%', width: '100%', borderRadius: 100, borderColor: '#808080', borderWidth: 2 }} />
                                : <SvgValue
                                  svgIcon={pet.pet_type ? 'dog' : 'cat'}
                                  color="#fff"
                                  width={dimensions.screenWidth * 0.05}
                                  height={dimensions.screenWidth * 0.05}
                                />
                            }
                          </View>
                          <View style={[sheetStyles.petDetailsCont, { flex: 1 }]}>
                            <Title1 text={pet.name} fontSize={dimensions.screenWidth * 0.04} lineHeight={dimensions.screenWidth * 0.055} />
                            <Subtitle1
                              text={`${pet.pet_type}${pet.weight ? ' • ' + getSizeCategory(pet.weight)?.size : ''}`} fontFamily='Poppins-Regular' style={{ letterSpacing: .5 }}
                            />
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setPetChosen(prev => prev.filter(p => p.id !== item.id));
                            }}
                            style={{
                              alignItems: 'center',
                              display: 'flex',
                              justifyContent: 'center',
                              borderRadius: 10,
                            }}
                          >
                            <View style={{
                              backgroundColor: '#ED7964',
                              alignItems: 'center',
                              display: 'flex',
                              justifyContent: 'center',
                              borderRadius: 10,
                              paddingVertical: dimensions.screenHeight * 0.01
                            }}>
                              <Ionicons name='remove-circle' size={dimensions.screenWidth * 0.04} color="#fff" style={{ marginHorizontal: dimensions.screenWidth * 0.02 }} />
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                  />
                  <View>
                    <Button1
                      title='Modify'
                      isPrimary={false}
                      borderRadius={10}
                      onPress={() => { setSelectedPet(petChosen); openSheet(); }}
                      textStyle={{
                        fontSize: dimensions.screenWidth * 0.04,
                        color: 'white'
                      }}
                      paddingVertical={dimensions.screenHeight * 0.014}
                    />
                  </View>
                  <Subtitle1
                    text='For dogs, price may vary depending on the size of the chosen pet.'
                    style={{
                      textAlign: 'left',
                      fontFamily: 'Poppins-Regular',
                      marginTop: dimensions.screenHeight * 0.02,
                      marginHorizontal: dimensions.screenWidth * 0.025
                    }}
                    tooltip={true}
                    tooltipWidget={({ closeSheet }: { closeSheet: () => void }) => (
                      <View>
                        <View style={sheetStyles.mainCont}>
                          <View style={sheetStyles.handle}></View>
                          <Text
                            style={{
                              fontFamily: 'Poppins-SemiBold',
                              alignSelf: 'center',
                              fontSize: dimensions.screenWidth * 0.04,
                              marginBottom: dimensions.screenHeight * 0.02
                            }}
                          >Size and Price Chart</Text>
                          <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: dimensions.screenWidth * 0.06 }}>
                            <Text
                              style={{
                                fontFamily: 'Poppins-SemiBold'

                              }}
                            >
                              For Dogs:
                            </Text>
                          </View>
                          <FlatList
                            data={dogSizes}
                            style={sheetStyles.listStyle}
                            scrollEnabled={false}
                            renderItem={({ item, index }) => {
                              const isEven = index % 2 == 0;

                              return (
                                <View
                                  style={{
                                    backgroundColor: '#e2e7f3',
                                    paddingHorizontal: dimensions.screenWidth * 0.035,
                                    paddingVertical: dimensions.screenHeight * 0.01,
                                    borderRadius: 30,
                                    marginBottom: dimensions.screenHeight * 0.01,
                                    flexDirection: 'row',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Ionicons name='paw' size={dimensions.screenWidth * 0.05} color="#466AA2" />
                                    <Spacer width={dimensions.screenWidth * 0.02} />
                                    <View style={{
                                      display: 'flex',
                                      justifyContent: 'flex-start',
                                      alignItems: 'flex-start',
                                      flexDirection: 'column',

                                    }}>
                                      <Title1 fontSize={dimensions.screenWidth * 0.038} text={item.size} lineHeight={dimensions.screenWidth * 0.055} />
                                      <Text
                                        style={{
                                          fontFamily: 'Poppins-Regular',
                                          color: '#808080',
                                          fontSize: dimensions.screenWidth * 0.03
                                        }}
                                      >{
                                          item.start > 0 && item.end != Infinity ?
                                            `${item.start}kg - ${item.end}kg` :
                                            item.start == 0 ?
                                              `${item.end}kg below` :
                                              item.end == Infinity ?
                                                `${item.start}kg up` : ''
                                        }</Text>
                                    </View>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontFamily: 'Poppins-Regular',
                                        color: '#808080'
                                      }}
                                    >Base Price + </Text>
                                    <Price value={item.addonPrice} color='#ED7964' fontFamily='Poppins-SemiBold' />
                                  </View>
                                </View>
                              );
                            }} />
                        </View><View style={{ paddingHorizontal: dimensions.screenWidth * 0.05, paddingBottom: dimensions.screenHeight * 0.03 }}>
                          <Spacer height={dimensions.screenHeight * 0.015} />
                          <Subtitle1 text='Please note that the size and price chart applies only to dogs, as cat grooming services have a fixed rate.' fontFamily='Poppins-Regular' />
                          <Spacer height={dimensions.screenHeight * 0.015} />
                          <Button1
                            title='Done'
                            isPrimary={false}
                            borderRadius={15}
                            onPress={closeSheet}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>
              )
            }
          </View>
          <Spacer height={dimensions.screenHeight * 0.03} />
          <View style={[{ paddingHorizontal: 0, backgroundColor: 'white' }]}>
            <View style={[styles.cont1, { paddingBottom: 0, paddingTop: 0 }]}>
              <Title1 text="Schedule Appointment" fontSize={dimensions.screenWidth * 0.05} />
              <Spacer height={dimensions.screenHeight * 0.01} />
              <View style={styles.cont2main}>
                <View style={styles.cont2}>
                  <Text style={styles.cont2title}>Select Date</Text>
                  <Text style={styles.cont2desc}>Choose a date for this booking</Text>
                </View>
                <View style={[styles.cont2, { alignItems: 'flex-end', flex: 1 }]}>
                  <Ionicons name="calendar" size={dimensions.screenWidth * 0.06} color="#B5B5B5" />
                </View>
              </View>
            </View>
            <FlatList
              data={dateOptions}
              style={{ paddingBottom: dimensions.screenHeight * 0.01 }}
              keyExtractor={(item) => item.value}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginTop: 15 }}
              renderItem={({ item, index }) => {
                const isSelected = item.value === selectedDate;
                return (
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      isSelected && styles.dateButtonSelected,
                      {
                        borderColor: isSelected ? '#ED7964' : '#D1D1D1',
                        marginLeft: index === 0 ? dimensions.screenWidth * 0.05 : 0,
                      },
                    ]}
                    onPress={() => {
                      setSelectedTime(null);
                      setSelectedDate(item.value);
                    }}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        isSelected && styles.dateTextSelected,
                        {
                          textAlign: 'center',
                          color: isSelected ? 'white' : '#808080',
                          fontSize: dimensions.screenWidth * 0.04,
                        },
                      ]}
                    >
                      {item.month}
                    </Text>
                    <Text
                      style={[
                        styles.dateText,
                        isSelected && styles.dateTextSelected,
                        {
                          textAlign: 'center',
                          fontFamily: 'Poppins-SemiBold',
                          color: isSelected ? 'white' : 'black',
                        },
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <View style={[styles.cont1, { paddingBottom: dimensions.screenHeight * 0.08, paddingTop: 0 }]}>
              <View style={styles.cont2main}>
                <View style={styles.cont2}>
                  <Text style={styles.cont2title}>Select Desired Time Slot</Text>
                  <Text style={styles.cont2desc}>Choose a specific time for this booking</Text>
                </View>
                <View style={[styles.cont2, { alignItems: 'flex-end', flex: 1 }]}>
                  <Ionicons name="time" size={dimensions.screenWidth * 0.06} color="#B5B5B5" />
                </View>
              </View>
              <View style={styles.wrapContainer}>
                {getTimeSlots(selectedDate).map((time, idx) => {
                  const isSelected = time === selectedTime;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.dateButton,
                        isSelected && styles.dateButtonSelected,
                        {
                          borderColor: isSelected ? '#ED7964' : '#D1D1D1',
                          backgroundColor: isSelected ? '#ED7964' : bookedTimes.includes(time) ? '#D9D9D9' : '#FFF',
                          width: dimensions.screenWidth * 0.265,
                          marginBottom: dimensions.screenHeight * 0.015,
                          marginRight: 0
                        },
                      ]}
                      onPress={!bookedTimes.includes(time) ? () => setSelectedTime(time) : () => { }}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          isSelected && styles.dateTextSelected,
                          {
                            textAlign: 'center',
                            color: isSelected ? '#FFF' : '#7E7E7E',
                            textDecorationLine: bookedTimes.includes(time) ? 'line-through' : 'none',
                            textDecorationStyle: 'dashed',
                          },
                        ]}
                      >
                        {moment(time, 'HH:mm').format('h:mm A')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
          <Portal>
            <BottomSheet
              ref={sheetRef}
              snapPoints={snapPoints}
              index={-1}
              enablePanDownToClose={true}
              handleComponent={null}
              backgroundStyle={{ backgroundColor: "#FFF" }}
              backdropComponent={backDrop}
              onChange={handleSheetChange}
              onClose={() => { setSelectedPet([]) }}
            >
              <BottomSheetView style={sheetStyles.bottomSheet}>
                <View style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}>
                  <View style={sheetStyles.mainCont}>
                    <View style={sheetStyles.handle}></View>
                    <Text
                      style={{
                        fontFamily: 'Poppins-SemiBold',
                        alignSelf: 'center',
                        fontSize: dimensions.screenWidth * 0.04,
                        marginBottom: dimensions.screenHeight * 0.03
                      }}
                    >Select a Pet for Appointment</Text>
                    <View>

                    </View>
                    <FlatList
                      data={pets}
                      style={sheetStyles.listStyle}
                      renderItem={({ item, index }) => {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedPet(prev => {
                                const exists = prev.find(p => p.id === item.id);
                                return exists
                                  ? prev.filter(p => p.id !== item.id)
                                  : [...prev, item];
                              });
                            }}
                          >
                            <View style={[sheetStyles.petCont, selectedPet?.find((i) => i.id == item.id) ? {
                              backgroundColor: '#e2e7f3'
                            } : null]}>
                              <View style={sheetStyles.iconCont}>
                                {
                                  item.pet_avatar ?
                                    <Image source={{ uri: item.pet_avatar }} style={{ width: '100%', height: '100%', borderRadius: 100 }} />
                                    : <SvgValue
                                      svgIcon={item.pet_type == 'Dog' ? 'dog' : 'cat'}
                                      color="#fff"
                                      width={dimensions.screenWidth * 0.08}
                                      height={dimensions.screenWidth * 0.08}
                                    />
                                }
                              </View>
                              <View style={sheetStyles.petDetailsCont}>
                                <Title1 text={item.name} fontSize={dimensions.screenWidth * 0.04} lineHeight={dimensions.screenWidth * 0.055} />
                                <Subtitle1 text={item.pet_type} fontFamily='Poppins-Regular' />
                              </View>
                              {
                                item.weight && <View style={sheetStyles.leadingCont}>
                                  <View style={sheetStyles.sizeCont}>
                                    <Text style={sheetStyles.sizeTitle}>{getSizeCategory(item.weight)?.size}</Text>
                                  </View>
                                </View>
                              }
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                  <View style={{ paddingHorizontal: dimensions.screenWidth * 0.05, paddingBottom: dimensions.screenHeight * 0.03 }}>
                    <Spacer height={dimensions.screenHeight * 0.015} />
                    <Subtitle1 text='Your chosen pet will be used for this booking only.' fontFamily='Poppins-Regular' />
                    <Spacer height={dimensions.screenHeight * 0.015} />
                    <Button1
                      title='Done'
                      isPrimary={false}
                      borderRadius={15}
                      onPress={handleSelectPet}
                    />
                  </View>
                </View>
              </BottomSheetView>
            </BottomSheet>
          </Portal>
        </MainContPlain >
        {isReady && (
          <TouchableOpacity
            onPress={() => {
              if (isLoading) return;

              setLoading(true);

              console.log('doing');

              console.log(selectedDate);
              console.log(selectedTime);
              console.log(grooming);
              console.log(petChosen);

              const simplifiedPets = petChosen.map(pet => ({
                id: pet.id,
                name: pet.name,
                weight: pet.weight,
                size: getSizeCategory(pet.weight)?.size,
                to_add_price: pet.pet_type == 'Dog'
                  ? (getSizeCategory(pet.weight)?.addonPrice ?? 0.0)
                  : 50,
                pet_type: pet.pet_type
              }));

              setLoading(false);

              router.push({
                pathname: './confirm_scheduling',
                params: {
                  selectedDate: selectedDate,
                  selectedTime: selectedTime,
                  groomingDetails: JSON.stringify(grooming),
                  appointedPets: JSON.stringify(simplifiedPets)
                }
              });

              // 🚫 No setLoading(false) here — let navigation take over
            }}
          >
            <View style={buttonStyles.bookButtonCont}>
              <View style={[
                buttonStyles.bookButton,
                {
                  alignItems: 'center',
                  justifyContent: isLoading ? 'center' : 'space-between'
                }
              ]}>
                {
                  isLoading ? (
                    <ActivityIndicator
                      color="#fff"
                      size="small"
                      style={{
                        transform: [{ scale: 1.5 }],
                        paddingVertical: dimensions.screenHeight * 0.0055
                      }}
                    />
                  ) : (
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Text style={buttonStyles.title}>Request a book</Text>
                      <Text style={buttonStyles.subtitle}>
                        {moment(selectedDate).format('MMM D')} - {moment(selectedTime, 'HH:mm').format('h:mm A')}
                      </Text>
                    </View>
                  )
                }
              </View>
            </View>
          </TouchableOpacity>
        )
        }
      </View>
    </PortalProvider>
  );
};

export default BookingScheduling;

const styles = StyleSheet.create({
  cont1: {
    marginTop: dimensions.screenHeight * 0.03,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: dimensions.screenWidth * 0.05,
    paddingVertical: dimensions.screenHeight * 0.025,
  },
  cont2main: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cont2: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cont2title: {
    fontFamily: 'Poppins-Bold',
    fontSize: dimensions.screenWidth * 0.04,
  },
  cont2desc: {
    fontFamily: 'Poppins-Regular',
    fontSize: dimensions.screenWidth * 0.033,
    lineHeight: dimensions.screenWidth * 0.04,
    color: '#808080',
  },
  groomTypeCont: {
    backgroundColor: 'white',
    elevation: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: dimensions.screenHeight * 0.013,
    marginBottom: dimensions.screenHeight * 0.013,
    paddingHorizontal: dimensions.screenWidth * 0.025,
    paddingVertical: dimensions.screenWidth * 0.025,
  },
  errorCont: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  listSvgIconBG: {
    backgroundColor: '#466AA2',
    borderRadius: 12,
    marginRight: dimensions.screenWidth * 0.03,
    padding: (dimensions.screenWidth + dimensions.screenHeight) * 0.008,
  },
  listItemDetails: {
    flexGrow: 1,
    width: '0%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: dimensions.screenWidth * 0.02,
  },
  l1title: {
    fontFamily: 'Poppins-SemiBold',
    color: '#466AA2',
    fontSize: dimensions.screenWidth * 0.04,
    lineHeight: dimensions.screenWidth * 0.055,
  },
  l1description: {
    fontFamily: 'Poppins-Regular',
    color: '#808080',
    fontSize: dimensions.screenWidth * 0.029,
    lineHeight: dimensions.screenWidth * 0.045,
    letterSpacing: 0.4,
  },
  dateButton: {
    paddingVertical: dimensions.screenHeight * 0.015,
    paddingHorizontal: dimensions.screenWidth * 0.04,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderColor: '#D1D1D1',
    borderWidth: 1.5,
    marginRight: dimensions.screenWidth * 0.032,
  },
  dateButtonSelected: {
    backgroundColor: '#ED7964',
  },
  dateText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.035,
    lineHeight: dimensions.screenWidth * 0.045,
    color: '#555',
  },
  dateTextSelected: {
    color: '#fff',
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: dimensions.screenHeight * 0.02,
    marginBottom: dimensions.screenHeight * 0.05,
  },
});

const buttonStyles = StyleSheet.create({
  bookButtonCont: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignSelf: 'center',
  },
  bookButton: {
    backgroundColor: '#466AA2',
    paddingHorizontal: dimensions.screenWidth * 0.05,
    marginHorizontal: dimensions.screenWidth * 0.05,
    marginBottom: dimensions.screenHeight * 0.03,
    paddingVertical: dimensions.screenHeight * 0.02,
    borderRadius: 15,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: dimensions.screenWidth * 0.04,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    color: 'white',
    fontSize: dimensions.screenWidth * 0.033,
  }
});

const sheetStyles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFF",
    position: "relative",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  handle: {
    backgroundColor: '#D1D1D1',
    width: dimensions.screenWidth * 0.1,
    height: dimensions.screenHeight * 0.008,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: dimensions.screenHeight * 0.02,
    marginBottom: dimensions.screenHeight * 0.02
  },
  mainCont: {
  },
  petCont: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: dimensions.screenHeight * 0.015,
    paddingHorizontal: dimensions.screenWidth * 0.03,
    paddingVertical: dimensions.screenHeight * 0.01,
    borderRadius: 15
  },
  iconCont: {
    backgroundColor: '#bfbfbf',
    width: dimensions.screenWidth * 0.15,
    height: dimensions.screenWidth * 0.15,
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: dimensions.screenWidth * 0.03
  },
  petDetailsCont: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start'
  },
  listStyle: {
    paddingHorizontal: dimensions.screenWidth * 0.05
  },
  leadingCont: {
    paddingTop: dimensions.screenHeight * 0.005
  },
  sizeCont: {
    backgroundColor: '#ED7964',
    paddingHorizontal: dimensions.screenWidth * 0.026,
    paddingVertical: dimensions.screenHeight * 0.001,
    borderRadius: 30
  },
  sizeTitle: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: dimensions.screenWidth * 0.033,
    lineHeight: dimensions.screenWidth * 0.05
  }
});
