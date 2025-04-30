import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import MainContCircle from '../../components/general/background_circle'
import { router, useLocalSearchParams } from 'expo-router'
import Booking from '../../interfaces/booking'
import Payment from '../../interfaces/payment'
import { Ionicons } from '@expo/vector-icons'
import dimensions from '../../utils/sizing'
import { LinearGradient } from 'expo-linear-gradient';
import Title1 from '../../components/texts/title1'
import Subtitle1 from '../../components/texts/subtitle1'
import TitleValue from '../../components/list/title_value'
import moment from 'moment'
import Button1 from '../../components/buttons/button1'
import * as Clipboard from 'expo-clipboard'

type SuccessBookingProps = {}

const SuccessBooking = (props: SuccessBookingProps) => {
  const { booking, payment } = useLocalSearchParams();

  const bookingData = booking ? JSON.parse(booking as string) as Booking : null;
  const paymentData = payment ? JSON.parse(payment as string) as Payment : null;

  return (
    <MainContCircle>
      <View style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: dimensions.screenHeight * 0.15,
          }}
        >
          <LinearGradient
            colors={['rgba(76, 102, 159, 0.3)', 'rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 0.0)']}
            // start={{ x: 0, y: 0 }}
            // end={{ x: 1, y: 2 }}
            style={{
              padding: dimensions.screenWidth * 0.07,
              borderRadius: 100,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={dimensions.screenWidth * 0.23}
              color="#466AA2"
            />
          </LinearGradient>

          <Title1
            text='Congratulations!'
          />
          <Subtitle1
            text='You have successfully reserved an appointment'
            fontFamily='Poppins-Regular'
            fontSize={dimensions.screenWidth * 0.034}
            style={{
              letterSpacing: .3
            }}
          />
          <View
            style={{
              backgroundColor: '#e2e7f3',
              marginHorizontal: dimensions.screenWidth * 0.06,
              marginTop: dimensions.screenHeight * 0.03,
              borderRadius: 20
            }}
          >
            <TitleValue
              title="Booking ID"
              isSub={false}
              isBold={false}
              value={bookingData?.id ?? ''}
              paddingHorizontal={dimensions.screenWidth * 0.04}
              paddingVertical={dimensions.screenHeight * 0.01}
              icon={
                <TouchableOpacity onPress={() => {
                  if (bookingData?.id) {
                    Clipboard.setStringAsync(bookingData.id);
                  }
                }}>
                  <Ionicons name='copy' size={dimensions.screenWidth * 0.03} color="#466AA2" />
                </TouchableOpacity>
              }
            />
            <TitleValue
              title="Date"
              isSub={false}
              isBold={false}
              value={moment(bookingData?.date).format('MMM D, YYYY')}
              paddingHorizontal={dimensions.screenWidth * 0.04}
              paddingVertical={dimensions.screenHeight * 0.01}
            />
            <TitleValue
              title="Time"
              isSub={false}
              isBold={false}
              value={moment(bookingData?.time_start, 'HH:mm').format('h:mm A')}
              paddingHorizontal={dimensions.screenWidth * 0.04}
              paddingVertical={dimensions.screenHeight * 0.01}
            />
            <TitleValue
              title="Pets Appointed"
              isSub={false}
              isBold={false}
              value={bookingData?.pet_ids.length.toString() ?? ''}
              paddingHorizontal={dimensions.screenWidth * 0.04}
              paddingVertical={dimensions.screenHeight * 0.01}
            />
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: dimensions.screenWidth * 0.06,
            marginTop: dimensions.screenHeight * 0.03,
            marginBottom: dimensions.screenHeight * 0.1
          }}
        >
          <Button1
            title='Back to Home'
            isPrimary={false}
            onPress={() => router.replace({
              pathname: '../(tabs)',
              params: {
                goTo: './activity'
              }
            })}
            borderRadius={15}
          />
        </View>
      </View>
    </MainContCircle>
  )
}

export default SuccessBooking

const styles = StyleSheet.create({})