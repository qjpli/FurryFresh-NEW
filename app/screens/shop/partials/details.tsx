import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import dimensions from '../../../utils/sizing'

type Details = {
    details: string;
}

const Details = (props: Details) => {
  return (
    <View style={styles.detailsCont}>
      <Text style={styles.detailsText}>{props.details}</Text>
    </View>
    
  )
}

export default Details

const styles = StyleSheet.create({
    detailsCont: {
        paddingHorizontal: dimensions.screenWidth * 0.06,
        paddingVertical: dimensions.screenHeight * 0.03
    },
    detailsText: {
        fontFamily: 'Poppins-Regular',
        textAlign: 'justify',
    }
})