import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MainContPlain from '../../components/general/background_plain'
import AppbarDefault from '../../components/bars/appbar_default'
import { useSession } from '../../context/sessions_context'
import dimensions from '../../utils/sizing'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '../../context/cart_context'
import { FlatList } from 'react-native-gesture-handler'
import CartItem from '../shop/components/cart_item'
import TitleValue from '../../components/list/title_value'
import Spacer from '../../components/general/spacer'
import Button1 from '../../components/buttons/button1'
import { router } from 'expo-router'

type Props = {}

const Cart = (props: Props) => {
    const { session } = useSession();
    const { carts, cartProducts } = useCart();

    return (
        <View style={{ flex: 1, height: '100%' }}>
            {
                <AppbarDefault
                    title={'My Cart'}
                    session={session}
                    showLeading={false}
                    leadingChildren={undefined}
                    titleSize={dimensions.screenWidth * 0.045}
                />
            }
            <MainContPlain scrollEnabled={false} height="100%">
                <View style={styles.headerCont}>
                    <Ionicons
                        name='bag'
                        size={dimensions.screenWidth * 0.04}
                        color="#466AA2"
                    />
                    <Text style={styles.headerTitle}>You have {carts.length} items in your cart</Text>
                </View>
                <FlatList
                    data={carts}
                    renderItem={({ item }) => <CartItem item={item} />}
                    style={styles.listStyle}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
                <View style={styles.bottomDetails}>
                    <View>
                        <View style={styles.bd1}>
                            <TitleValue
                                title='Items'
                                value={`${carts.length} items`}
                                isBold={false}
                                isSub={false}
                            />
                            <Spacer height={dimensions.screenHeight * 0.01} />
                            <TitleValue
                                title='Cart Price'
                                value={`₱${carts.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`}
                                isBold={false}
                                isSub={false}
                            />
                        </View>
                        <View style={styles.bd2}>
                            <TitleValue
                                title='Total'
                                value={`₱${carts.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`}
                                isBold={false}
                                isSub={false}
                            />
                        </View>
                    </View>
                    <Button1
                        title='Checkout'
                        isPrimary={true}
                        borderRadius={15}
                        onPress={() => router.push('./confirm_order')}
                    />
                </View>
            </MainContPlain>
        </View>
    )
}

export default Cart

const styles = StyleSheet.create({
    headerCont: {
        backgroundColor: '#e2e7f3',
        marginHorizontal: dimensions.screenWidth * 0.1,
        paddingHorizontal: dimensions.screenWidth * 0.02,
        paddingVertical: dimensions.screenHeight * 0.022,
        borderRadius: 50,
        display: 'flex',
        marginTop: dimensions.screenHeight * 0.015,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: dimensions.screenWidth * 0.02
    },
    headerTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: '#466AA2',
        fontSize: dimensions.screenWidth * 0.034,
        lineHeight: dimensions.screenWidth * 0.05
    },
    listStyle: {
        marginHorizontal: dimensions.screenWidth * 0.05,
        marginTop: dimensions.screenHeight * 0.03,
        height: dimensions.screenHeight * 0.2,
    },
    bottomDetails: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: dimensions.screenWidth * 0.06,
        paddingTop: dimensions.screenHeight * 0.03,
        paddingBottom: dimensions.screenHeight * 0.03
    },
    bd1: {
        paddingBottom: dimensions.screenHeight * 0.02
    },
    bd2: {
        paddingTop: dimensions.screenHeight * 0.02,
        borderTopColor: '#d1d1d1',
        borderTopWidth: 1,
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    }

})