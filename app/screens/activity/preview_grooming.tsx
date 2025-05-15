import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import MainContPlain from '../../components/general/background_plain'
import { Ionicons } from '@expo/vector-icons'
import dimensions from '../../utils/sizing'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import Booking from '../../interfaces/booking'
import moment from 'moment'
import Spacer from '../../components/general/spacer'
import { FlatList } from 'react-native-gesture-handler'
import { usePet } from '../../context/pet_context'
import { useGrooming } from '../../context/grooming_context'
import SvgValue from '../../hooks/fetchSvg'
import TitleValue from '../../components/list/title_value'
import Button1 from '../../components/buttons/button1'
import supabase from '../../utils/supabase'
import { useBooking } from '../../context/booking_context'


const PreviewGrooming = () => {
  const [toReview, setToReview] = useState(false);

  const { booking } = useLocalSearchParams();
  const { pets } = usePet();
  const { groomings } = useGrooming();
  const [isLoading1, setLoading1] = useState<boolean>(false);
  const { updateBookingContext, bookings } = useBooking();
  const [reviewData, setReviewData] = useState<any>(null);

  const bookingRaw = booking ? JSON.parse(booking as string) as Booking : null;
  const parsedBooking = bookings.find((book) => book.id == bookingRaw?.id);


  const grooming = groomings.find((groom) => groom.subcategory_id == parsedBooking?.grooming_id);

  const checkReview = async () => {
    const { data, error } = await supabase
      .from('review_ratings')
      .select('*')
      .eq('ref_id', parsedBooking?.id)
      .select();


    if (data) {
      console.log('Review existing');
      setReviewData(data[0]);
    } else {
      setToReview(true);
      console.log('No review found');
    }
  }

  useFocusEffect(
    useCallback(() => {
      console.log('Triggered on return');
      checkReview();

      return () => {
        console.log('Leaving the screen');
      };
    }, [])
  );

  return (
    <View style={{ flex: 1, height: '100%', position: 'relative', width: '100%' }}>
      <MainContPlain scrollEnabled={true}>
        <View style={general.header}>
        </View>
        <View style={body.main}>
          <View style={body.cont}>
            <View style={body.titleCont}>
              <Ionicons name='paw' size={dimensions.screenWidth * 0.06} color="#808080" />
              <Spacer width={dimensions.screenWidth * 0.02} />
              <Text style={body.title}>{(parsedBooking?.pet_ids ?? []).length > 1 ? 'Pets' : 'Pet'} Appointed</Text>
            </View>
            <View style={{ paddingVertical: dimensions.screenHeight * 0.02 }}>
              <FlatList
                data={parsedBooking?.pet_ids}
                scrollEnabled={true}
                horizontal={true}
                renderItem={({ item }) => {
                  const pet = pets.find((pet) => pet.id == item);
                  return (
                    <View style={{ alignItems: 'center', marginRight: dimensions.screenWidth * 0.05 }}>
                      <Image
                        source={{ uri: pet?.pet_avatar }}
                        style={body.petImage}
                      />
                      <Spacer height={dimensions.screenHeight * 0.005} />
                      <Text style={body.petName}>{pet?.name}</Text>
                    </View>
                  );

                }}
              />
            </View>
          </View>
          <View style={body.cont}>
            <View style={body.titleCont}>
              <Ionicons name='briefcase' size={dimensions.screenWidth * 0.06} color="#808080" />
              <Spacer width={dimensions.screenWidth * 0.02} />
              <Text style={body.title}>Services Included</Text>
            </View>
            <View style={{ paddingVertical: dimensions.screenHeight * 0.02 }}>
              <FlatList
                data={grooming?.inclusions}
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={{
                    alignItems: 'center',
                    marginRight: dimensions.screenWidth * 0.05,
                    width: dimensions.screenWidth * 0.23,
                    backgroundColor: '#e2e7f3',
                    paddingVertical: dimensions.screenHeight * 0.015,
                    paddingHorizontal: dimensions.screenWidth * 0.02,
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'center',

                  }}>
                    <View
                      style={{
                        backgroundColor: '#466AA2',
                        borderRadius: 10,
                        padding: dimensions.screenWidth * 0.03
                      }}
                    >
                      <SvgValue
                        svgIcon={item.svg}
                        color='#fff'
                        width={dimensions.screenWidth * 0.08}
                        height={dimensions.screenWidth * 0.08}
                      />
                    </View>
                    <Spacer height={dimensions.screenHeight * 0.005} />
                    <Text style={[body.petName,
                    {
                      textAlign: 'center',
                      color: '#466AA2',
                      fontSize: dimensions.screenWidth * 0.034,
                      lineHeight: dimensions.screenWidth * 0.05
                    }]}>{item.title}</Text>
                  </View>
                )}
              />
            </View>
          </View>
          <View style={body.cont}>
            <View style={body.titleCont}>
              <Ionicons name='information-circle' size={dimensions.screenWidth * 0.06} color="#808080" />
              <Spacer width={dimensions.screenWidth * 0.02} />
              <Text style={body.title}>Other Details</Text>
            </View>
            <View style={{ paddingVertical: dimensions.screenHeight * 0.02 }}>
              <View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Ionicons name='document-text' size={dimensions.screenWidth * 0.04} color="#808080" />
                  <Spacer width={dimensions.screenWidth * 0.02} />
                  <Text style={body.otherDetailsTitle}>Booking note</Text>
                </View>
                <View style={{
                  backgroundColor: '#e6e6e6',
                  paddingHorizontal: dimensions.screenWidth * 0.04,
                  paddingVertical: dimensions.screenHeight * 0.01,
                  borderRadius: 13
                }}>
                  <Text style={body.otherDetailsSubtitle}>{(parsedBooking?.note ?? '').length > 0 ? parsedBooking?.note : 'No notes added'}</Text>
                </View>
              </View>
              <Spacer height={dimensions.screenHeight * 0.02} />
              <View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Ionicons name='pricetag' size={dimensions.screenWidth * 0.04} color="#808080" />
                  <Spacer width={dimensions.screenWidth * 0.02} />
                  <Text style={body.otherDetailsTitle}>Price Summary</Text>
                </View>
                <View style={{
                  // backgroundColor: '#e6e6e6', 
                  paddingHorizontal: dimensions.screenWidth * 0.04,
                  paddingVertical: dimensions.screenHeight * 0.01,
                  borderRadius: 13
                }}>
                  <TitleValue
                    title='Subtotal'
                    value={`₱${(parsedBooking?.amount ?? 0).toFixed(2)}`}
                    isBold={false}
                    isSub={false}
                  />
                  <TitleValue
                    title='Voucher'
                    value={`₱${(parsedBooking?.discount_applied ?? 0).toFixed(2)}`}
                    isBold={false}
                    isSub={false}
                  />
                </View>
              </View>
              <Spacer height={dimensions.screenHeight * 0.02} />
              {
                reviewData && <View>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Ionicons name='star' size={dimensions.screenWidth * 0.04} color="#808080" />
                    <Spacer width={dimensions.screenWidth * 0.02} />
                    <Text style={body.otherDetailsTitle}>Review for this booking</Text>
                  </View>
                  <View style={{
                    paddingHorizontal: dimensions.screenWidth * 0.04,
                    paddingVertical: dimensions.screenHeight * 0.01,
                    borderRadius: 13
                  }}>
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: dimensions.screenSize * 0.01, color: '#808080', marginLeft: dimensions.screenWidth * 0.01 }}>You said:</Text>
                    <View style={{
                      backgroundColor: '#E7E7E7',
                      padding: dimensions.screenSize * 0.01,
                      borderRadius: 15
                    }}>
                      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: dimensions.screenSize * 0.011, color: '#000' }}>{reviewData.review_text}</Text>
                      <View style={{
                          alignItems: 'flex-center',
                          flexDirection: 'row',
                          justifyContent: 'flex-end'
                        }}>
                          <Ionicons size={dimensions.screenSize * 0.013} name='star' color="orange" />
                          <Spacer width={dimensions.screenWidth * 0.01} />
                          <Text style={{  
                            fontFamily: 'Poppins-Regular', fontSize: dimensions.screenSize * 0.01, color: '#000'
                          }}>{(reviewData.rating).toFixed(1)} • Sent on {moment(reviewData.created_at).format("MMM DD, YYYY")}</Text>

                      </View>
                    </View>
                  </View>
                </View>
              }
            </View>
          </View>
          <Spacer height={dimensions.screenHeight * 0.2} />
        </View>

        {/* FLOATING HEADER CONT SHOULD BE AT THE BOTTOM ALWAYS */}
        <View style={floating.main}>
          <View style={[floating.cont, {}]}>
            <Text style={floating.title}>Basic Grooming</Text>
            <Text style={[floating.status, {
              backgroundColor: parsedBooking?.status.toLocaleLowerCase() == 'completed' ? 'green' : '#ED7964'
            }]}>
              {parsedBooking?.status.substring(0, 1).toLocaleUpperCase()}{parsedBooking?.status.substring(1, parsedBooking?.status.length)}
            </Text>
          </View>
          <View style={floating.cont}>
            <Text style={floating.subtitle}>
              Scheduled for {moment(parsedBooking?.date).format("MMM DD, YYYY")} -{" "}
              {moment(parsedBooking?.time_start, "HH:mm").format("h:mm A")}
            </Text>
          </View>
        </View>
      </MainContPlain>
      <View style={general.topButtons}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={dimensions.screenWidth * 0.065} color="#fff" />
        </TouchableOpacity>
        <Ionicons name='ellipsis-horizontal' size={dimensions.screenWidth * 0.05} color="#fff" />
      </View>
      {
        parsedBooking?.status != 'completed' && (
          <View style={{ position: 'absolute', bottom: dimensions.screenHeight * 0.03, width: '100%', paddingHorizontal: dimensions.screenWidth * 0.06 }}>
            <Button1
              title='Mark as Completed'
              isPrimary={true}
              loading={isLoading1}
              borderRadius={15}
              onPress={async () => {
                setLoading1(true);

                const { data, error } = await supabase
                  .from('bookings')
                  .update({
                    status: 'completed',
                    updated_at: new Date()
                  })
                  .eq('id', parsedBooking?.id)
                  .select();

                setLoading1(false);

                if (error) {
                  console.error('Error Encountered:', error);
                  alert('Failed to mark booking as completed.');
                  return;
                }

                if (data && data[0]) {
                  updateBookingContext(data[0]);
                  alert('Booking marked as completed.');
                }
              }}
            />
          </View>
        )
      }
      {
        parsedBooking?.status == 'completed' && toReview && (
          <View style={{ position: 'absolute', bottom: dimensions.screenHeight * 0.03, width: '100%', paddingHorizontal: dimensions.screenWidth * 0.06 }}>
            <Button1
              title='Add a Review'
              isPrimary={false}
              borderRadius={15}
              onPress={() => router.push({
                pathname: '../reviews/reviews',
                params: {
                  refId: parsedBooking?.id,
                  serviceProductId: grooming?.subcategory_id,
                  type: 'PetCare'
                }
              })}
            />
          </View>
        )
      }
    </View>
  )
}

export default PreviewGrooming

const general = StyleSheet.create({
  topButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'absolute',
    flexDirection: 'row',
    flex: 1,
    left: 0,
    right: 0,
    alignItems: 'center',
    top: dimensions.screenHeight * 0.07,
    paddingHorizontal: dimensions.screenWidth * 0.05
  },
  header: {
    backgroundColor: 'rgba(70, 106, 162, 0.3)',
    width: '100%',
    height: dimensions.screenHeight * 0.32
  },
});

const body = StyleSheet.create({
  main: {
    paddingHorizontal: dimensions.screenWidth * 0.08,
    marginTop: dimensions.screenHeight * 0.1
  },
  cont: {

  },
  titleCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    color: '#808080',
    fontSize: dimensions.screenWidth * 0.045,
    lineHeight: dimensions.screenWidth * 0.062
  },
  petName: {
    fontFamily: 'Poppins-SemiBold',
    color: '#000'
  },
  petImage: {
    width: dimensions.screenWidth * 0.15,
    height: dimensions.screenWidth * 0.15,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 100,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 5,
  },
  otherDetailsTitle: {
    fontFamily: 'Poppins-Regular',
    color: '#808080'
  },
  otherDetailsSubtitle: {
    fontFamily: 'Poppins-Regular',
    color: '#808080'
  }
});

const floating = StyleSheet.create({
  main: {
    position: 'absolute',
    backgroundColor: 'white',
    left: dimensions.screenWidth * 0.08,
    right: dimensions.screenWidth * 0.08,
    top: dimensions.screenHeight * 0.28,
    paddingHorizontal: dimensions.screenWidth * 0.05,
    paddingVertical: dimensions.screenHeight * 0.02,
    borderRadius: 15,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 5,
  },
  cont: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.045,
    color: '#466AA2',
    lineHeight: dimensions.screenWidth * 0.07
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: dimensions.screenWidth * 0.032,
    color: '#808080'
  },
  status: {
    backgroundColor: '#ED7964',
    paddingHorizontal: dimensions.screenWidth * 0.02,
    borderRadius: 10,
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.033,
    color: 'white',
    lineHeight: dimensions.screenWidth * 0.05
  }
});