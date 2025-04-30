import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from '../../context/sessions_context'
import dimensions from '../../utils/sizing'
import AppbarDefault from '../../components/bars/appbar_default'
import MainContPlain from '../../components/general/background_plain'
import Title1 from '../../components/texts/title1'
import moment from 'moment'
import { Divider } from '@rneui/themed/dist/Divider';
import Price from '../../components/general/price'
import { FlatList } from 'react-native-gesture-handler'
import { useCart } from '../../context/cart_context'
import { Ionicons } from '@expo/vector-icons'
import Spacer from '../../components/general/spacer'
import { Voucher } from '../../interfaces/voucher'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { PortalProvider } from '@gorhom/portal'
import Button1 from '../../components/buttons/button1'
import PlainTextInput from '../../components/inputs/custom_text_input2'
import { PaymentMethod, paymentMethodsPetSupplies } from '../../hooks/fetchPaymentMethod';
import SvgValue from '../../hooks/fetchSvg'
import TitleValue from '../../components/list/title_value'
import { router, useLocalSearchParams } from 'expo-router'
import supabase from '../../utils/supabase'
import CustomTextInput from '../../components/inputs/custom_text_input1'

type Props = {}


const ConfirmOrder = (props: Props) => {
    const { paymentResult: rawResult } = useLocalSearchParams();
    const paymentResult = typeof rawResult === 'string' ? JSON.parse(rawResult) : null;
    const { session } = useSession();
    const { carts, cartProducts, clearCart } = useCart();
    const hasHandledPayment = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [showFullList, setShowFullList] = useState(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const MAX_VISIBLE_ITEMS = 2;

    const visibleCarts = showFullList ? carts : carts.slice(0, MAX_VISIBLE_ITEMS);

    const openSheet = () => sheetRef.current?.expand();
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["60%"], []);

    // INPUT FIELD
    const inputRef = React.useRef<TextInput>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    const backDrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );

    const handleSheetChange = (index: number) => {
        if (index === 0) {
            sheetRef.current?.close();
        } else {

        }
    };

    // USE EFFECTS


    // VOUCHERS
    const [hasVoucherChanges, setHasVoucherChanges] = useState<boolean>(false);
    const [tempVoucherSelected, setTempVoucherSelected] = useState<Voucher | null>(null);
    const [voucherSelected, setVoucherSelected] = useState<Voucher | null>(null);
    const [voucherInput, setVoucherInput] = useState('');
    const [voucherResults, setVoucherResults] = useState<any>(null);
    const [voucherError, setVoucherError] = useState<string | null>(null);
    const [isSearchingVouchers, setSearchingVouchers] = useState<boolean>(false);

    useEffect(() => {
        const validateAndSearchVoucher = async () => {
            if (voucherInput.trim().length === 0 || !session?.user?.id) return;

            console.log("🔍 Starting voucher search for:", voucherInput);
            setSearchingVouchers(true);
            setVoucherResults(null);
            setVoucherError(null);

            try {
                const now = new Date();

                const { data: vouchersData, error: voucherError } = await supabase
                    .from("vouchers")
                    .select("*")
                    .ilike("code", voucherInput);

                if (voucherError) {
                    setVoucherError("Error searching vouchers");
                    console.error("❌ Voucher search error:", voucherError);
                    return;
                }

                console.log("✅ Vouchers fetched:", vouchersData);

                const { data: usedVouchers, error: usedError } = await supabase
                    .from("used_vouchers")
                    .select("*")
                    .eq("user_id", session.user.id);

                if (usedError) {
                    setVoucherError("Error checking used vouchers");
                    console.error("❌ Used vouchers fetch error:", usedError, "Session:", session?.user);
                    return;
                }

                console.log("✅ Used vouchers fetched:", usedVouchers);

                const usageCountMap: Record<string, number> = {};
                const usedCategoryIds: string[] = [];

                usedVouchers.forEach((entry) => {
                    usageCountMap[entry.voucher_id] = (usageCountMap[entry.voucher_id] || 0) + 1;
                    if (entry.category_id) {
                        usedCategoryIds.push(entry.category_id);
                    }
                });

                const currentCategoryId = '10f23363-ba26-4567-99dd-fc9501c472ba';

                const validVouchers = vouchersData.filter((voucher) => {
                    if (!voucher.is_active) return false;

                    const validFrom = new Date(voucher.valid_from);
                    const validTo = voucher.valid_to ? new Date(voucher.valid_to) : null;
                    if (now < validFrom || (validTo && now > validTo)) return false;

                    const totalUsed = usageCountMap[voucher.id] || 0;
                    if (voucher.usage_limit !== null && totalUsed >= voucher.usage_limit) return false;

                    const userUsed = usedVouchers.filter((v) => v.voucher_id === voucher.id).length;
                    if (voucher.user_limit !== null && userUsed >= voucher.user_limit) return false;

                    const appliesToCategories: string[] = voucher.applies_to_categories || [];
                    if (appliesToCategories.length > 0 && !appliesToCategories.includes(currentCategoryId)) return false;

                    if (voucher.is_first_time_user_only) {
                        const hasUsedCategory = appliesToCategories.some((catId: string) => usedCategoryIds.includes(catId));
                        if (hasUsedCategory) return false;
                    }
                    return true;
                });

                console.log("✅ Valid vouchers after filtering:", validVouchers);
                setVoucherResults(validVouchers);
            } catch (err) {
                console.error("🔥 Unexpected error:", err);
                setVoucherError("Unexpected error occurred");
            } finally {
                setSearchingVouchers(false);
                console.log("🔚 Voucher search finished");
            }
        };

        const debounceTimer = setTimeout(validateAndSearchVoucher, 500);
        return () => clearTimeout(debounceTimer);
    }, [voucherInput, session]);

    // PAYMENTS
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

    // SUMMARY

    // use effect upload
    useEffect(() => {
        if (hasHandledPayment.current || !paymentResult) return;

        hasHandledPayment.current = true;

        const handlePayment = async () => {
            setIsProcessing(true);

            try {
                const status = paymentResult.success;
                const data = paymentResult.data;

                console.log("✅ Payment Result after coming back:");
                console.log("✅ Status: ", status);
                console.log("✅ Data: ", data);

                if (!status) {
                    console.log("❌ Payment was not successful.");
                    return;
                }

                console.log("✅ Payment Successful");

                // Insert Order
                const { data: orderResult, error: orderInsertError } = await supabase
                    .from('orders')
                    .insert([
                        {
                            user_id: session?.user?.id,
                            note: '',
                            amount: finalValue,
                            delivery_type: 'Pick-up',
                            order_status: "Pending",
                        }
                    ])
                    .select()
                    .single();

                if (orderInsertError) {
                    console.error("❌ Order insert error:", orderInsertError);
                    return;
                }

                console.log("✅ Order inserted successfully:", orderResult);

                clearCart();

                // Insert Order Items in batch
                const orderItemsPayload = carts.map(cart => ({
                    order_id: orderResult.id,
                    product_id: cart.product_id,
                    quantity: cart.quantity,
                    item_amount: cart.price,
                    created_at: new Date().toISOString(),
                }));

                const { error: orderItemsError } = await supabase
                    .from('order_items')
                    .insert(orderItemsPayload);

                if (orderItemsError) {
                    console.error("❌ Order items insert error:", orderItemsError);
                    return;
                }

                console.log("✅ Order items inserted successfully");

                // Insert Payment
                const metadata = paymentMethod?.id !== "Cash-on-delivery" ? data : null;

                const { data: paymentInsertResult, error: paymentInsertError } = await supabase
                    .from('payments')
                    .insert([
                        {
                            user_id: session?.user?.id,
                            order_id: orderResult.id,
                            ref_id: '',
                            payment_method: paymentMethod?.id,
                            amount: finalValue,
                            discount_applied: discount,
                            status: paymentMethod?.id !== "Cash-on-delivery",
                            currency: 'PHP',
                            metadata,
                            created_at: new Date().toISOString(),
                        }
                    ])
                    .select()
                    .single();

                if (paymentInsertError) {
                    console.error("❌ Payment insert error:", paymentInsertError);
                    return;
                }

                console.log("✅ Payment inserted successfully:", paymentInsertResult);

                const { data: cartDataDeleted, error: cartDeleteItemsError } = await supabase
                    .from('carts')
                    .delete()
                    .eq('user_id', session?.user.id)
                    .select();

                if(cartDeleteItemsError) {
                    console.error("❌ Cart delete error:", cartDeleteItemsError);
                }

                console.log("✅ Cart items deleted successfully:", cartDataDeleted);

                router.back();
                router.back();
                
                // Navigate to success screen
                router.replace({
                    pathname: './order_completed',
                    params: {
                        booking: JSON.stringify(orderResult),
                        payment: JSON.stringify(paymentResult),
                    }
                });

            } catch (error) {
                console.error("❌ Unexpected error during payment processing:", error);
            } finally {
                setIsProcessing(false);
            }
        };

        handlePayment();
    }, [paymentResult]);


    const totalPrice = carts.reduce(
        (sum, p) => sum + (p.price),
        0
    );

    let discount = 0;
    if (voucherSelected?.type === 'Percent') {
        const percentDiscount = totalPrice * (voucherSelected.amount / 100);
        discount =
            voucherSelected.max_discount != null
                ? Math.min(percentDiscount, voucherSelected.max_discount)
                : percentDiscount;
    } else {
        discount = voucherSelected?.amount ?? 0;
    }

    const discountValue = totalPrice - discount;
    const discountValueString = `-₱${discountValue.toFixed(2)}`;

    const getCartTotal = carts.reduce(
        (sum, p) => sum + (p.price),
        0
    );


    const finalValue = getCartTotal - discount;

    return (
        <PortalProvider>
            <View style={{ flex: 1 }}>
                <AppbarDefault
                    title={'Confirm Order'}
                    session={session}
                    showLeading={false}
                    leadingChildren={undefined}
                    zIndex={0}
                    titleSize={dimensions.screenWidth * 0.045}
                />
                <MainContPlain>
                    <View style={styles.cont1}>
                        <Title1 text="Order Items" fontSize={dimensions.screenWidth * 0.05} />
                        <View style={[styles.groomMainCont]}>
                            <FlatList
                                data={visibleCarts}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => `${item.product_id}-${index}`}
                                renderItem={({ item }) => {
                                    const prod = cartProducts.find((cp) => cp.id == item.product_id);

                                    return (
                                        <View style={[styles.groomTypeCont]}>
                                            <View style={[styles.listSvgIconBG, {
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                            }]}>
                                                <Text style={{
                                                    fontSize: dimensions.screenWidth * 0.05,
                                                    fontFamily: 'Poppins-SemiBold',
                                                    lineHeight: dimensions.screenWidth * 0.06,
                                                    textAlign: 'center'
                                                }}>{item.quantity}</Text>
                                                <Text style={{
                                                    color: '#808080',
                                                    fontSize: dimensions.screenWidth * 0.028,
                                                    lineHeight: dimensions.screenWidth * 0.03,
                                                    fontFamily: 'Poppins-Regular',
                                                    textAlign: 'center'
                                                }}>Qty</Text>
                                            </View>
                                            <View style={styles.listItemDetails}>
                                                <Text numberOfLines={2} style={styles.l1title}>{prod?.name}</Text>
                                            </View>
                                            <View style={{ height: "100%" }}>
                                                <View
                                                    style={{
                                                        backgroundColor: "#ED7964",
                                                        paddingVertical: dimensions.screenHeight * 0.001,
                                                        paddingHorizontal: dimensions.screenWidth * 0.02,
                                                        borderRadius: 10,
                                                        marginTop: dimensions.screenHeight * 0.01,
                                                    }}
                                                >
                                                    <Price
                                                        value={item.price}
                                                        color="#fff"
                                                        fontFamily="Poppins-SemiBold"
                                                        fontSize={dimensions.screenWidth * 0.03}
                                                        lineHeight={dimensions.screenWidth * 0.045}
                                                        currencySize={dimensions.screenWidth * 0.03}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                            {carts.length > MAX_VISIBLE_ITEMS && (
                                <TouchableOpacity
                                    onPress={() => setShowFullList(!showFullList)}
                                    style={{ marginTop: 0 }}
                                >
                                    <Text style={{
                                        textAlign: 'center',
                                        fontFamily: 'Poppins-SemiBold',
                                        color: '#466AA2',
                                        fontSize: dimensions.screenWidth * 0.033
                                    }}>
                                        {showFullList ? 'View less' : 'View full list'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <Spacer height={dimensions.screenHeight * 0.03} />
                    <View style={[{ paddingHorizontal: 0, backgroundColor: 'white' }]}>
                        <View style={[styles.cont1, { paddingBottom: 0, paddingTop: 0 }]}>
                            <Title1 text="Voucher" fontSize={dimensions.screenWidth * 0.05} />
                            <Spacer height={dimensions.screenHeight * 0.01} />
                            <View style={styles.cont2main}>
                                <View style={styles.cont2}>
                                    <Text style={styles.cont2title}>Select Voucher</Text>
                                    <Text style={styles.cont2desc}>Choose a voucher for this order</Text>
                                </View>
                                <View style={[styles.cont2, { alignItems: 'flex-end', flex: 1 }]}>
                                    <Ionicons name="pricetag" size={dimensions.screenWidth * 0.06} color="#B5B5B5" />
                                </View>
                            </View>
                            <Spacer height={dimensions.screenHeight * 0.02} />
                            <TouchableOpacity onPress={() => {
                                if (voucherSelected != null) {
                                    setHasVoucherChanges(true);
                                    setTempVoucherSelected(voucherSelected);
                                }

                                openSheet();

                            }}>
                                <View
                                    style={{
                                        borderColor: voucherSelected != null ? '#466AA2' : '#D1D1D1',
                                        backgroundColor: voucherSelected != null ? '#e2e7f3' : '#fff',
                                        borderWidth: 1.7,
                                        borderRadius: 10,
                                        paddingHorizontal: dimensions.screenWidth * 0.04,
                                        paddingVertical: dimensions.screenHeight * 0.017,
                                        width: '100%',
                                        marginBottom: dimensions.screenHeight * 0.015,
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Ionicons
                                        name={voucherSelected != null ? 'pricetag-outline' : 'add-circle-outline'}
                                        size={dimensions.screenWidth * 0.06}
                                        color={voucherSelected != null ? '#466AA2' : '#808080'}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontFamily: voucherSelected != null ? 'Poppins-SemiBold' : 'Poppins-Regular',
                                            marginHorizontal: dimensions.screenWidth * 0.025,
                                            flex: 1,
                                            color: voucherSelected != null ? '#466AA2' : '#808080',
                                        }}
                                    >{

                                            voucherSelected != null ? voucherSelected.name : 'Add Voucher'

                                        }</Text>
                                    {
                                        false ? (
                                            <></>
                                        ) : (
                                            <Ionicons
                                                name='arrow-forward'
                                                size={dimensions.screenWidth * 0.04}
                                                color={voucherSelected != null ? '#466AA2' : '#808080'}
                                            />
                                        )
                                    }
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Spacer height={dimensions.screenHeight * 0.03} />
                    <View style={[{ paddingHorizontal: 0, backgroundColor: 'white' }]}>
                        <View style={[styles.cont1, { paddingBottom: 0, paddingTop: 0 }]}>
                            <Title1 text="Payment" fontSize={dimensions.screenWidth * 0.05} />
                            <Spacer height={dimensions.screenHeight * 0.01} />
                            <View style={styles.cont2main}>
                                <View style={styles.cont2}>
                                    <Text style={styles.cont2title}>Select Payment Method</Text>
                                    <Text style={styles.cont2desc}>Choose a payment method for this order</Text>
                                </View>
                                <View style={[styles.cont2, { alignItems: 'flex-end', flex: 1 }]}>
                                    <Ionicons name="cash" size={dimensions.screenWidth * 0.06} color="#B5B5B5" />
                                </View>
                            </View>
                            <Spacer height={dimensions.screenHeight * 0.02} />
                            <FlatList
                                data={paymentMethodsPetSupplies}
                                scrollEnabled={false}
                                style={{
                                    width: '100%',
                                }}
                                renderItem={({ item, index }) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (paymentMethod?.id === item.id) {
                                                    setPaymentMethod(null);
                                                } else {
                                                    setPaymentMethod(item);
                                                }
                                            }}

                                        >
                                            <View
                                                style={{
                                                    paddingHorizontal: dimensions.screenWidth * 0.04,
                                                    paddingVertical: dimensions.screenHeight * 0.013,
                                                    borderColor: paymentMethod != null && paymentMethod.id == item.id ? '#466AA2' : '#D1D1D1',
                                                    backgroundColor: paymentMethod != null && paymentMethod.id == item.id ? '#e2e7f3' : '#fff',
                                                    borderWidth: 2.5,
                                                    borderRadius: 10,
                                                    width: '100%',
                                                    marginBottom: dimensions.screenHeight * 0.015,
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <SvgValue
                                                    svgIcon={item.icon ?? ''}
                                                    color='#466AA2'
                                                    width={dimensions.screenWidth * 0.08}
                                                    height={dimensions.screenWidth * 0.08} />
                                                <Spacer width={dimensions.screenWidth * 0.04} />
                                                <Text
                                                    style={{
                                                        fontFamily: 'Poppins-SemiBold',
                                                        fontSize: dimensions.screenWidth * 0.037
                                                    }}
                                                >{item.name}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </View>
                    <Spacer height={dimensions.screenHeight * 0.03} />
                    <View style={[{ paddingHorizontal: 0, backgroundColor: 'white' }]}>
                        <View style={[styles.cont1, { paddingBottom: 0, paddingTop: 0 }]}>
                            <Title1 text="Summary" fontSize={dimensions.screenWidth * 0.05} />
                            <Spacer height={dimensions.screenHeight * 0.01} />
                            <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                                <View style={styles.cont2}>
                                    <Text style={styles.cont2desc}>Summary of the order</Text>
                                </View>
                            </View>
                            <Spacer height={dimensions.screenHeight * 0.01} />

                            <Divider color='#D1D1D1' width={1}>
                                <Spacer height={dimensions.screenHeight * 0.01} />
                                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                                    <View style={[{ width: '100%', marginTop: dimensions.screenHeight * 0.01 }]}>
                                        <TitleValue
                                            title="Subtotal"
                                            isSub={false}
                                            isBold={true}
                                            value={`₱${getCartTotal}`}
                                        />
                                        <TitleValue
                                            title="Voucher"
                                            isSub={false}
                                            isBold={true}
                                            value={`-₱${(voucherSelected ? discount : 0).toFixed(2)}`}
                                        />
                                        {
                                            voucherSelected && (
                                                <View
                                                    style={{
                                                        paddingHorizontal: dimensions.screenWidth * 0.03
                                                    }}
                                                >
                                                    <TitleValue
                                                        title={voucherSelected?.name ?? ''}
                                                        isSub={true}
                                                        isBold={false}
                                                        value={`₱${(voucherSelected ? discount : 0).toFixed(2)}`}
                                                    />
                                                </View>
                                            )
                                        }
                                    </View>
                                </View>
                                <Spacer height={dimensions.screenHeight * 0.01} />
                            </Divider>

                            <Divider color='#D1D1D1' width={1}>
                                <Spacer height={dimensions.screenHeight * 0.01} />
                                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                                    <View style={[{ width: '100%', marginTop: dimensions.screenHeight * 0.01 }]}>
                                        <TitleValue
                                            title="Total"
                                            isSub={false}
                                            isBold={true}
                                            value={`₱${(finalValue).toFixed(2)
                                                }`}
                                        />
                                        <View
                                            style={{
                                                paddingHorizontal: dimensions.screenWidth * 0.03
                                            }}
                                        >
                                            <TitleValue
                                                title="Subtotal"
                                                isSub={true}
                                                isBold={false}
                                                value={`₱${getCartTotal}`}
                                            />
                                            <TitleValue
                                                title="Voucher"
                                                isSub={true}
                                                isBold={false}
                                                value={`-₱${(voucherSelected ? discount : 0).toFixed(2)}`}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <Spacer height={dimensions.screenHeight * 0.01} />
                            </Divider>
                        </View>
                    </View>
                </MainContPlain>
                <View
                    style={{
                        paddingHorizontal: dimensions.screenWidth * 0.05,
                        paddingBottom: dimensions.screenHeight * 0.03,
                        paddingTop: dimensions.screenHeight * 0.02,
                        backgroundColor: 'white'
                    }}>
                    <View style={{
                        marginBottom: dimensions.screenHeight * 0.01,
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        width: '100%',
                        // backgroundColor: 'red'
                    }}>
                        <Text
                            style={{
                                fontFamily: 'Poppins-Regular',
                                fontSize: dimensions.screenWidth * 0.04
                            }}
                        >Total</Text>
                        <Price
                            fontSize={dimensions.screenWidth * 0.05}
                            fontFamily="Poppins-SemiBold"
                            value={finalValue.toString()}
                        />
                    </View>
                    <Button1
                        title='Proceed'
                        loading={isLoading}
                        isPrimary={true}
                        onPress={paymentMethod ? () => {
                            if (isLoading) return;

                            setLoading(true);

                            if (paymentMethod.name == 'PayPal') {
                                console.log("Going PayPal");
                                // console.log(carts);
                                // console.log(parsedPets);

                                const items = carts.map((item) => {
                                    const price = item.price;
                                    const prod = cartProducts.find((cp) => cp.id == item.product_id)
                                    return {
                                        name: `${prod?.name}`,
                                        price: Number(price).toFixed(2),
                                        currency: "PHP",
                                        quantity: 1
                                    };
                                });

                                console.log(discount);

                                router.push({
                                    pathname: '../payments/paypal',
                                    params: {
                                        items: JSON.stringify(items),
                                        discount: discount.toFixed(2)
                                    }
                                });
                            }

                            setLoading(false);
                        } : null
                        }
                        borderRadius={16}
                    />
                </View>
                <BottomSheet
                    ref={sheetRef}
                    snapPoints={snapPoints}
                    index={-1}
                    enablePanDownToClose={true}
                    handleComponent={null}
                    backgroundStyle={{ backgroundColor: "#FFF" }}
                    backdropComponent={backDrop}
                    onChange={handleSheetChange}
                    onClose={() => { setTempVoucherSelected(null); setVoucherInput(''); setHasVoucherChanges(false); }}
                >
                    <BottomSheetView
                        style={{
                            paddingHorizontal: dimensions.screenWidth * 0.05,
                            paddingTop: dimensions.screenHeight * 0.03,
                            position: 'relative',
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <View
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: 'Poppins-SemiBold',
                                    fontSize: dimensions.screenWidth * 0.05,
                                    lineHeight: dimensions.screenWidth * 0.06,
                                }}
                            >Apply Voucher Code</Text>
                            <TouchableOpacity onPress={() => { sheetRef.current?.close(); }}>
                                <Ionicons name='close' size={dimensions.screenWidth * 0.08} />
                            </TouchableOpacity>
                        </View>
                        <View style={{}}>
                            <Spacer height={dimensions.screenHeight * 0.02} />
                            <View style={{ width: '100%', height: dimensions.screenHeight * 0.07, backgroundColor: "#f0f0f0", borderRadius: 15, paddingHorizontal: dimensions.screenWidth * 0.04, marginBottom: dimensions.screenHeight * 0.015 }}>
                                <TextInput
                                    ref={inputRef}
                                    style={styles.input}
                                    value={voucherInput}
                                    onChangeText={setVoucherInput}
                                    placeholder="Enter promo / voucher code here"
                                    keyboardType="default"
                                    placeholderTextColor="#bbb"
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => !voucherResults && setIsFocused(false)}
                                />
                            </View>
                            <FlatList
                                data={voucherResults}
                                style={{
                                    height: dimensions.screenHeight * 0.35,
                                    width: '100%'
                                }}
                                scrollEnabled={true}
                                renderItem={({ item, index }) => {
                                    const isSelected = tempVoucherSelected != null && tempVoucherSelected.id == item.id;
                                    return (
                                        <View
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                marginHorizontal: dimensions.screenWidth * 0.01,
                                                marginBottom: dimensions.screenHeight * 0.015
                                            }}
                                        >
                                            <View
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}>
                                                <Ionicons
                                                    name='pricetag'
                                                    color="white"
                                                    size={dimensions.screenWidth * 0.06}
                                                    style={{
                                                        backgroundColor: '#ED7964',
                                                        borderRadius: 8,
                                                        padding: dimensions.screenWidth * 0.035,
                                                        marginRight: dimensions.screenWidth * 0.03
                                                    }}
                                                />
                                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'Poppins-SemiBold',
                                                            fontSize: dimensions.screenWidth * 0.037,
                                                            lineHeight: dimensions.screenWidth * 0.04
                                                        }}
                                                        numberOfLines={1}
                                                    >{item.name}</Text>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'Poppins-Regular',
                                                            fontSize: dimensions.screenWidth * 0.03,
                                                            color: '#808080',
                                                            lineHeight: dimensions.screenWidth * 0.04
                                                        }}
                                                        numberOfLines={1}
                                                    >{item.type}</Text>
                                                </View>
                                            </View>
                                            <View>
                                                <TouchableOpacity onPress={() => {
                                                    setHasVoucherChanges(true);

                                                    if (isSelected) {
                                                        setTempVoucherSelected(null);
                                                    } else {
                                                        setTempVoucherSelected(item);
                                                    }
                                                }}>
                                                    <View
                                                        style={{
                                                            backgroundColor: isSelected ? 'green' : '#fff',
                                                            borderColor: isSelected ? 'green' : '#D1D1D1',
                                                            borderWidth: 1.8,
                                                            width: dimensions.screenWidth * 0.07,
                                                            height: dimensions.screenWidth * 0.07,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            borderRadius: 100
                                                        }}
                                                    >
                                                        {tempVoucherSelected?.id === item.id && (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={dimensions.screenWidth * 0.05} // or 0.035 for tighter fit
                                                                color="#fff"
                                                            />
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                        {
                            hasVoucherChanges && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: dimensions.screenHeight * 0.04,
                                        right: 0,
                                        width: dimensions.screenWidth,
                                        display: 'flex',
                                        paddingHorizontal: dimensions.screenWidth * 0.06,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Button1
                                        title='Apply'
                                        isPrimary={true}
                                        borderRadius={15}
                                        onPress={() => {
                                            setVoucherSelected(tempVoucherSelected);
                                            sheetRef.current?.close();
                                        }}
                                    />
                                </View>
                            )
                        }
                    </BottomSheetView>
                </BottomSheet>
                {isProcessing && (
                    <View style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999,
                    }}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={{ color: 'white', marginTop: 12, fontFamily: 'Poppins-SemiBold' }}>Finalizing your order...</Text>
                    </View>
                )}
            </View>
        </PortalProvider>
    );
};


export default ConfirmOrder

const styles = StyleSheet.create({
    cont1: {
        marginTop: dimensions.screenHeight * 0.03,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingHorizontal: dimensions.screenWidth * 0.05,
        paddingVertical: dimensions.screenHeight * 0.025,
    },
    cont2main: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cont2: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    cont2title: {
        fontFamily: 'Poppins-Bold',
        fontSize: dimensions.screenWidth * 0.04,
    },
    cont2desc: {
        fontFamily: 'Poppins-Regular',
        fontSize: dimensions.screenWidth * 0.033,
        lineHeight: dimensions.screenWidth * 0.04,
        color: '#808080',
    },
    groomMainCont: {
        backgroundColor: 'white',
        marginTop: dimensions.screenHeight * 0.013,
        borderRadius: 15,
        width: '100%',
        flexDirection: 'column',
        display: 'flex',
        justifyContent: 'center',
    },
    groomTypeCont: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: dimensions.screenHeight * 0.013,
        elevation: 3,
        borderRadius: 15,
        backgroundColor: 'white',
        marginHorizontal: dimensions.screenWidth * 0.02,
        paddingHorizontal: dimensions.screenWidth * 0.025,
        paddingVertical: dimensions.screenWidth * 0.025,
    },
    listSvgIconBG: {
        backgroundColor: '#fff',
        width: dimensions.screenSize * 0.05,
        height: dimensions.screenSize * 0.05,
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        borderRadius: 100,
        borderColor: '#D1D1D1',
        borderWidth: 1,
        marginRight: dimensions.screenWidth * 0.03,
    },
    listItemDetails: {
        flexGrow: 1,
        width: '0%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginRight: dimensions.screenWidth * 0.02,
    },
    l1title: {
        fontFamily: 'Poppins-SemiBold',
        color: '#466AA2',
        fontSize: dimensions.screenWidth * 0.033,
        lineHeight: dimensions.screenWidth * 0.055,
    },
    l1description: {
        fontFamily: 'Poppins-Regular',
        color: '#808080',
        fontSize: dimensions.screenWidth * 0.029,
        lineHeight: dimensions.screenWidth * 0.045,
        letterSpacing: 0.4,
    },
    container: {
        flex: 1
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 15,
        position: "relative",
    },
    input: {
        flex: 1,
        fontSize: dimensions.screenWidth * 0.035,
        fontFamily: "Poppins-Regular",
        color: "#333",
    },
    clearIcon: {
        position: "absolute",
        right: 10,
    },
});