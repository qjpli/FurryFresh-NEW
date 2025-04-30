import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import dimensions from '../../utils/sizing'

interface NavbarItemProps {
    icon: any;
    title: string;
    color: string;
    marginTop?: number;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ icon, title, color, marginTop }) => {
  return (
    <View style={[styles.cont]}>
      {icon}
      <Text 
        style={[
            styles.textStyle, 
            { fontFamily: color == "#466AA2" ? "Poppins-Bold" : "Poppins-Regular" },
            { color: color },
            { marginTop: marginTop ?? dimensions.screenHeight * 0.002 }
        ]}
    >{title}</Text>
    </View>
  )
}

export default NavbarItem

const styles = StyleSheet.create({
    cont: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textStyle: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      color: '#466AA2', 
      marginTop: dimensions.screenHeight * 0.002,
    },
  });
  