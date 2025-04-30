import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import dimensions from '../../../utils/sizing'
import { useCart } from '../../../context/cart_context'

type FloatingCartButtonProps = {
    onPress: () => void;
};

const FloatingCartButton = ({ onPress }: FloatingCartButtonProps) => {
    const { carts } = useCart();

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.mainCont}>
                <View style={styles.circleBtn}>
                    <Ionicons
                        name="cart"
                        size={dimensions.screenWidth * 0.08}
                        color="#fff"
                    />
                </View>
                {carts.length > 0 && (
                    <Text
                        style={{
                            backgroundColor: "#ED7964",
                            position: "absolute",
                            right: -5,
                            top: -5,
                            color: "white",
                            borderRadius: 100,
                            fontFamily: "Poppins-SemiBold",
                            fontSize: dimensions.screenWidth * 0.035,
                            lineHeight: dimensions.screenWidth * 0.05,
                            padding: dimensions.screenWidth * 0.005,
                            paddingHorizontal: dimensions.screenWidth * 0.018,
                        }}
                    >
                        {carts.length}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};


export default FloatingCartButton

const styles = StyleSheet.create({
    mainCont: {
        position: 'absolute',
        bottom: dimensions.screenWidth * 0.08,
        right: dimensions.screenWidth * 0.06
    },
    circleBtn: {
        width: dimensions.screenWidth * 0.15,
        height: dimensions.screenWidth * 0.15,
        marginRight: dimensions.screenWidth * 0.01,
        backgroundColor: '#466AA2',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100
    }
})