import { Alert, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../../context/cart_context';
import supabase from '../../../utils/supabase';
import dimensions from '../../../utils/sizing';

type Props = {}

const CartItem = ({ item }: { item: any }) => {
    const { updateCartContext, fetchCarts, cartProducts } = useCart();
    const [quantity, setQuantity] = useState(item.quantity);
    const [loading, setLoading] = useState(false);

    const prod = cartProducts.find((cp) => cp.id === item.product_id);
    const productPrice = prod?.price ?? 0;

    const updateCart = async (newQuantity: number) => {
        try {
            const updatedCart = {
                ...item,
                quantity: newQuantity,
                price: productPrice * newQuantity,
            };

            const { error } = await supabase
                .from('carts')
                .update({
                    quantity: newQuantity,
                    price: updatedCart.price,
                })
                .eq('id', item.id);

            if (!error) {
                updateCartContext(updatedCart);
            }
        } catch (err) {
            console.error('Unexpected error updating cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeItemFromCart = async () => {
        try {
            const { error } = await supabase
                .from('carts')
                .delete()
                .eq('id', item.id);

            if (!error) {
                fetchCarts();
            }
        } catch (err) {
            console.error('Unexpected error removing item from cart:', err);
        }
    };

    const handleDecrement = async () => {
        if (quantity > 1 && !loading) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            setLoading(true);
            await updateCart(newQuantity);
        } else if (quantity === 1) {
            Alert.alert(
                'Remove Item',
                'This will remove the item from your cart. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        onPress: async () => await removeItemFromCart(),
                    },
                ],
                { cancelable: false }
            );
        }
    };

    const handleIncrement = async () => {
        if (!loading) {
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            setLoading(true);
            await updateCart(newQuantity);
        }
    };

    return (
        <View style={styles.cartCard}>
            <View
                style={{
                    height: dimensions.screenWidth * 0.21,
                    width: dimensions.screenWidth * 0.21,
                    backgroundColor: 'transparent',
                    marginRight: dimensions.screenWidth * 0.03,
                    borderRadius: 10,
                    overflow: 'hidden',
                }}
            >
                <Image
                    source={{ uri: (prod?.product_images ?? [])[0] }}
                    style={{
                        height: '100%',
                        width: '100%',
                        borderRadius: 10
                    }}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={{ fontFamily: 'Poppins-SemiBold' }}>
                    {prod?.name}
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular', color: '#808080', fontSize: dimensions.screenWidth * 0.032 }}>
                    ₱{(productPrice * quantity).toFixed(2)}
                </Text>

                <View
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        marginTop: dimensions.screenHeight * 0.015
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignSelf: 'flex-start',
                            gap: dimensions.screenWidth * 0.03,
                            borderColor: '#466AA2',
                            borderWidth: 1.5,
                            borderRadius: 30,
                            paddingHorizontal: dimensions.screenWidth * 0.02,
                            paddingVertical: dimensions.screenHeight * 0.002,
                        }}
                    >
                        <TouchableOpacity
                            disabled={loading}
                            onPress={handleDecrement}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        >
                            <Ionicons
                                name="remove"
                                color="#466AA2"
                                size={dimensions.screenWidth * 0.05}
                            />
                        </TouchableOpacity>
                        {loading ? (
                            <ActivityIndicator size="small" color="#466AA2" style={{
                                paddingVertical: dimensions.screenHeight * 0.0025,
                                width: dimensions.screenWidth * 0.09,
                            }} />
                        ) : (
                            <Text numberOfLines={1}
                                style={{
                                    fontFamily: 'Poppins-SemiBold',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    textAlign: 'center',
                                    color: '#466AA2',
                                    width: dimensions.screenWidth * 0.09,
                                    fontSize: dimensions.screenWidth * 0.035,
                                    lineHeight: dimensions.screenWidth * 0.05,
                                    paddingVertical: dimensions.screenHeight * 0.002
                                }}>{quantity}</Text>
                        )}
                        <TouchableOpacity
                            disabled={loading}
                            onPress={handleIncrement}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        >
                            <Ionicons
                                name="add"
                                color="#466AA2"
                                size={dimensions.screenWidth * 0.05}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Remove Item',
                                'Are you sure you want to remove this item from your cart?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Remove',
                                        style: 'destructive',
                                        onPress: async () => {
                                            await removeItemFromCart();
                                        }
                                    }
                                ],
                                { cancelable: true }
                            );
                        }}
                    >
                        <Ionicons
                            name='trash'
                            size={dimensions.screenWidth * 0.04}
                            color="#fff"
                            style={{
                                backgroundColor: "#ED7964",
                                paddingHorizontal: dimensions.screenWidth * 0.015,
                                paddingVertical: dimensions.screenWidth * 0.015,
                                borderRadius: 100,
                                marginRight: dimensions.screenWidth * 0.02
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default CartItem;

const styles = StyleSheet.create({
    cartCard: {
        backgroundColor: 'white',
        marginBottom: dimensions.screenHeight * 0.02,
        paddingHorizontal: dimensions.screenWidth * 0.02,
        paddingVertical: dimensions.screenHeight * 0.02,
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
