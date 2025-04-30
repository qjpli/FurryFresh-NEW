import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dimensions from '../../../utils/sizing';
import Cart from '../../../interfaces/cart';
import Price from '../../../components/general/price';
import supabase from '../../../utils/supabase';
import { useCart } from '../../../context/cart_context';

interface Props {
  isCarting: boolean;
  productPrice: number;
  cart: Cart;
}

const AlreadyInCartBar: React.FC<Props> = ({ isCarting, productPrice, cart }) => {
  const { carts, fetchCarts, addToCartContext, updateCartContext } = useCart();
  const [quantity, setQuantity] = useState(cart.quantity);
  const [price, setPrice] = useState(cart.price);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuantity(cart.quantity);
  }, [cart]);

  const handleDecrement = async () => {
    if (quantity > 1 && !loading) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setPrice(productPrice * newQuantity);
      setLoading(true);
      await updateCart(newQuantity);
    } else if (quantity === 1) {
      // Show confirmation dialog if quantity is 1
      Alert.alert(
        'Remove Item',
        'This will remove the item from your cart. Are you sure?',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel pressed'),
            style: 'cancel',
          },
          {
            text: 'Remove',
            onPress: async () => {
              await removeItemFromCart();
            },
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
      setPrice(productPrice * newQuantity);
      setLoading(true);
      await updateCart(newQuantity);
    }
  };

  const removeItemFromCart = async () => {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cart.id);

      if (error) {
        console.error('Error removing item from cart:', error);
      } else {
        console.log('Item removed from cart!');
        fetchCarts(); 
      }
    } catch (err) {
      console.error('Unexpected error removing item from cart:', err);
    }
  };

  const updateCart = async (newQuantity: number) => {
    try {
      const updatedCart = { ...cart, quantity: newQuantity, price: productPrice * newQuantity };

      const { error } = await supabase
        .from('carts')
        .update({
          quantity: newQuantity,
          price: updatedCart.price,
        })
        .eq('id', cart.id);

      if (error) {
        console.error('Error updating cart:', error);
      } else {
        console.log('Cart updated successfully!');
        updateCartContext(updatedCart);
      }
    } catch (err) {
      console.error('Unexpected error updating cart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailsCont}>
        <Price
          value={price}
          currencySize={dimensions.screenWidth * 0.05}
          fontSize={dimensions.screenWidth * 0.05}
          lineHeight={dimensions.screenWidth * 0.06}
          fontFamily="Poppins-Bold"
        />
        <Text style={{ fontFamily: 'Poppins-Regular', color: '#808080' }}>Total</Text>
      </View>

      <View style={styles.incrementorCont}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={[styles.iconLeft, { backgroundColor: loading ? '#808080' : '#ED7964' }]}
          disabled={loading}
        >
          <Ionicons name="remove-circle" size={dimensions.screenWidth * 0.06} color="white" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', paddingHorizontal: dimensions.screenWidth * 0.03 }}>
          <Text style={{ fontSize: dimensions.screenWidth * 0.05, fontFamily: 'Poppins-SemiBold' }}>
            {quantity}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          style={[styles.iconRight, { backgroundColor: loading ? '#808080' : '#ED7964' }]}
          disabled={loading}
        >
          <Ionicons name="add-circle" size={dimensions.screenWidth * 0.06} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: dimensions.screenHeight * 0.025,
    paddingHorizontal: dimensions.screenWidth * 0.05,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 10, // Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.8, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
  },
  detailsCont: {
    flex: 1,
    width: 'auto',
  }, 
  iconLeft: {
    backgroundColor: '#ED7964',
    width: dimensions.screenWidth * 0.1,
    height: dimensions.screenWidth * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: dimensions.screenWidth * 0.02,
    borderRadius: 100,
    elevation: 5,
  },
  iconRight: {
    backgroundColor: '#ED7964',
    width: dimensions.screenWidth * 0.1,
    height: dimensions.screenWidth * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: dimensions.screenWidth * 0.02,
    borderRadius: 100,
    elevation: 5,
  },
  incrementorCont: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default AlreadyInCartBar;
