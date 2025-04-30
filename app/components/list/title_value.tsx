import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import dimensions from '../../utils/sizing'

type TitleValueProps = {
  title: string;
  value: string;
  isSub: boolean;
  isBold: boolean;
  paddingVertical?: number;
  paddingHorizontal?: number;
  icon?: JSX.Element | null; // Optional icon
}

const TitleValue = (props: TitleValueProps) => {
  return (
    <View
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: props.paddingHorizontal,
        paddingVertical: props.paddingVertical
      }}
    >
      <Text
        style={{
          fontFamily: props.isBold ? 'Poppins-SemiBold' : 'Poppins-Regular',
          fontSize: props.isSub == false ? dimensions.screenWidth * 0.035 : dimensions.screenWidth * 0.033,
          color: props.isSub == false ? 'black' : '#808080',
          flex: 2
        }}
      >
        {props.title}
      </Text>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontFamily: props.isBold ? 'Poppins-SemiBold' : 'Poppins-Regular',
            fontSize: props.isSub == false ? dimensions.screenWidth * 0.035 : dimensions.screenWidth * 0.033,
            color: props.isSub == false ? 'black' : '#808080',
            marginRight: props.icon ? 6 : 0
          }}
        >
          {props.value}
        </Text>
        {props.icon && props.icon}
      </View>
    </View>
  )
}

export default TitleValue

const styles = StyleSheet.create({})
