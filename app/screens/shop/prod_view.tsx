import { Animated, FlatList, StyleSheet, Text, View, Image, ViewToken, TouchableOpacity } from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import MainContPlain from '../../components/general/background_plain';
import Product from '../../interfaces/product';
import supabase from '../../utils/supabase';
import Paginator from '../onboarding/paginator';
import dimensions from '../../utils/sizing';
import Price from '../../components/general/price';
import { Ionicons } from '@expo/vector-icons';
import StarRatings from '../../components/general/ratings';
import Subtitle1 from '../../components/texts/subtitle1';
import Details from './partials/details';
import Button1 from '../../components/buttons/button1';
import { LinearGradient } from 'expo-linear-gradient';
import AppbarDefault from '../../components/bars/appbar_default';
import { Session } from '@supabase/supabase-js';
import { useCart } from '../../context/cart_context';
import AlreadyInCartBar from './components/already_in_cart';
import AddNewToCartBar from './components/add_new_to_cart';
import Cart from '../../interfaces/cart';

const ProductView = () => {
  const navigation = useNavigation();
  const [session, setSession] = useState<Session | null>(null);
  const { id, subcategory } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMenuIndex, setCurrentMenuIndex] = useState<string>('1');
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCarting, setCarting] = useState(false);
  const [ratings, setRatings] = useState<number>(3.5);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const { carts, fetchCarts, addToCartContext, addToCartProductsContext, updateCartContext, updateCartProductsContext } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(Array.isArray(id) ? id[0] : id);
    }
  }, [id]); 

  const fetchProduct = async (id: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      const parsed = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
      } as Product;

      setProduct(parsed);

    } catch (err) {
      console.error('Unexpected error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCartButton = async () => {
    if (!session || !product) {
      console.log('No session or product available.');
      return;
    }

    const user_id = session.user.id;
    const product_id = product.id;

    if ((carts.find((cts) => cts.product_id == (Array.isArray(id) ? id[0] : id)))) {
      console.log('Product already in cart');
      return;
    }

    console.log('Adding product to cart...');
    setCarting(true);

    try {
      const { data: existingCart, error: fetchError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user_id)
        .eq('product_id', product_id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking cart:', fetchError);
        return;
      }

      if (!existingCart) {
        console.log('Product not found in cart. Adding new item...');

        const { data: newCart, error: insertError } = await supabase.from('carts').insert({
          user_id,
          product_id,
          quantity: 1,
          price: product.price,
        }).select().single();


        if (insertError) {
          console.error('Error inserting into cart:', insertError);
        } else {
          console.log('Product added to cart successfully!');

          addToCartContext(newCart);
          addToCartProductsContext(product);
        }
      } else {
        console.log('Product found in cart. Updating quantity...');

        const { error: updateError } = await supabase
          .from('carts')
          .update({
            quantity: existingCart.quantity + 1,
            price: product.price * (existingCart.quantity + 1),
          })
          .eq('id', existingCart.id);

        if (updateError) {
          console.error('Error updating cart:', updateError);
        } else {
          console.log('Cart quantity updated successfully!');

          updateCartContext({
            product_id, quantity: existingCart.quantity + 1, price: product.price * (existingCart.quantity + 1),
            id: existingCart.id,
            user_id: session.user.id,
            created_at: undefined
          });
          updateCartProductsContext(product);
        }
      }
    } catch (err) {
      console.error('Unexpected error adding to cart:', err);
    } finally {
      setCarting(false);
    }
  };



  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct(Array.isArray(id) ? id[0] : id);
    }
  }, [id, session]);

  const photoSlides = product?.product_images || [];

  const menus = [
    {
      id: '1',
      title: 'Details',
    },
    {
      id: '2',
      title: 'Reviews',
    },
    {
      id: '3',
      title: 'FAQs',
    },
  ];

  const addToCart = () => {
    return (carts.find((cts) => cts.product_id == (Array.isArray(id) ? id[0] : id)) ? <AlreadyInCartBar isCarting={isCarting} productPrice={product?.price ?? 0.0} cart={carts.find(item => item.product_id === (Array.isArray(id) ? id[0] : id)) as Cart} />
      : <AddNewToCartBar isCarting={isCarting} onAddToCart={addToCartButton} />
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <AppbarDefault
          title={subcategory as string}
          session={session}
          showLeading={true}
          leadingChildren={(
            <View style={{ flex: 1, justifyContent: 'flex-end', display: 'flex', alignItems: 'flex-end' }}>
              <Ionicons name='heart' size={dimensions.screenWidth * 0.07} color="#ED7964" />
            </View>
          )}
          titleSize={dimensions.screenWidth * 0.045}
        />
      ),
    });
  }, [navigation, session]);

  return (
    <MainContPlain floatingComponent={addToCart()} floatingPosition={{ bottom: 0, left: 0, right: 0 }}>
      <View style={styles.productImageCont}>
        <FlatList
          ref={flatListRef}
          data={photoSlides}
          renderItem={({ item }) => (
            <View style={{ width: dimensions.screenWidth, display: 'flex', alignItems: 'center' }}>
              <Image
                source={{ uri: item }}
                style={{
                  width: dimensions.screenWidth * 0.6,
                  height: dimensions.screenWidth * 0.6,
                }}
                resizeMode="cover"
              />
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item, index) => index.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={viewableItemsChanged}
        />

        {/* Left Arrow */}
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.arrowLeft}
            onPress={() => {
              if (currentIndex > 0) {
                flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
              }
            }}
          >
            <Ionicons name="chevron-back" size={32} color="#333" />
          </TouchableOpacity>
        )}

        {/* Right Arrow */}
        {currentIndex < photoSlides.length - 1 && (
          <TouchableOpacity
            style={styles.arrowRight}
            onPress={() => {
              if (currentIndex < photoSlides.length - 1) {
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
              }
            }}
          >
            <Ionicons name="chevron-forward" size={32} color="#333" />
          </TouchableOpacity>
        )}

        <Paginator data={photoSlides} scrollX={scrollX} />
      </View>

      <View style={styles.productDetailsCont}>
        <View style={styles.productFirstRow}>
          <Text style={styles.productSubcategory}>{(subcategory as string).toLocaleUpperCase()}</Text>
        </View>
        <View style={styles.productSecondRow}>
          <Text numberOfLines={3} style={styles.productName}>{product?.name}</Text>
          <Price
            value={product?.price ?? 0}
            currencySize={dimensions.screenWidth * 0.04}
            fontSize={dimensions.screenWidth * 0.05}
            fontFamily='Poppins-SemiBold'
          />
        </View>
        <View style={styles.productThirdRow}>
          <View style={styles.starsPlacement}>
            <StarRatings ratings={ratings} />
          </View>
          <Subtitle1 text={ratings + '/5.0'} fontSize={dimensions.screenWidth * 0.035} lineHeight={dimensions.screenWidth * 0.05} fontFamily='Poppins-Regular' />
        </View>
        <View style={styles.productFourthRow}>
          <FlatList
            data={menus}
            scrollEnabled={false}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setCurrentMenuIndex(item.id)}>
                <View>
                  <Text style={[styles.menu, {
                    color: currentMenuIndex == item.id ? '#466AA2' : '#808080',
                    fontFamily: currentMenuIndex == item.id ? 'Poppins-SemiBold' : 'Poppins-Regular',
                    borderBottomWidth: currentMenuIndex == item.id ? 3 : 0,
                    borderBottomColor: '#466AA2'
                  }]}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={styles.productFifthRow}>
          {currentMenuIndex == '1' ?
            (
              <Details details={product?.description ?? ''} />
            ) : currentMenuIndex == '2' ? (
              <></>
            ) : (
              <></>
            )
          }
        </View>
      </View>
    </MainContPlain>
  );
};

export default ProductView;

const styles = StyleSheet.create({
  productImageCont: {
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: dimensions.screenHeight * 0.02,
    marginVertical: dimensions.screenHeight * 0.02,
  },
  productDetailsCont: {
    backgroundColor: 'white',
    flex: 1,
  },
  productFirstRow: {
    paddingTop: dimensions.screenHeight * 0.015,
    paddingHorizontal: dimensions.screenWidth * 0.06
  },
  productSecondRow: {
    paddingTop: dimensions.screenHeight * 0.005,
    paddingHorizontal: dimensions.screenWidth * 0.06,
    display: 'flex',
    flexDirection: 'row'
  },
  productThirdRow: {
    paddingHorizontal: dimensions.screenWidth * 0.06,
    marginBottom: dimensions.screenHeight * 0.02,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  productFourthRow: {
    borderBottomWidth: 0.2,
    borderBottomColor: '#808080'
  },
  productSubcategory: {
    fontFamily: 'Poppins-Regular',
    color: '#808080',
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.05,
    flex: 1,
    marginRight: dimensions.screenWidth * 0.015,
  },
  menu: {
    marginHorizontal: dimensions.screenWidth * 0.06,
    fontFamily: 'Poppins-Regular',
    fontSize: dimensions.screenWidth * 0.038,
    paddingVertical: dimensions.screenHeight * 0.005,
    marginRight: dimensions.screenWidth * 0.1
  },
  starsPlacement: {
    display: 'flex',
    flexDirection: 'row',
    gap: dimensions.screenWidth * 0.01,
    marginRight: dimensions.screenWidth * 0.02
  },
  productFifthRow: {
    paddingBottom: dimensions.screenHeight * 0.1
  },
  addToCartButton: {
    backgroundColor: '#466AA2',
    paddingVertical: dimensions.screenHeight * 0.018,
    width: '100%',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6.27,
    elevation: 10,
    flex: 1
  },
  buttonText: {
    color: 'white',
    fontSize: dimensions.screenWidth * 0.045,
    fontFamily: 'Poppins-SemiBold',
  },
  addToCart: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: dimensions.screenWidth * 0.06,
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: dimensions.screenHeight * 0.04,
    paddingTop: dimensions.screenHeight * 0.02
  },
  arrowLeft: {
    position: 'absolute',
    left: 10,
    top: '40%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 30,
    padding: 5,
    zIndex: 1,
  },
  arrowRight: {
    position: 'absolute',
    right: 10,
    top: '40%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 30,
    padding: 5,
    zIndex: 1,
  },
});
