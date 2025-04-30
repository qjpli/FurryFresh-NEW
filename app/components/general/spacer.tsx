import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface SpacerProps {
    width?: number;
    height?: number;
}

const Spacer = (spacer: SpacerProps) => {
  return (
    <View style={{ width: spacer.width, height: spacer.height }}>
    </View>
  )
}

export default Spacer

const styles = StyleSheet.create({})