import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Subcategories from '../../interfaces/subcategories';
import AppbarDefault from '../../components/bars/appbar_default';
import dimensions from '../../utils/sizing';
import MainContPlain from '../../components/general/background_plain';
import Title1 from '../../components/texts/title1';
import DefaultListIcon from '../../components/svgs/home/services/DefaultListIcon';
import SvgValue from '../../hooks/fetchSvg';
import moment from 'moment';
import Price from '../../components/general/price';
import { Ionicons } from '@expo/vector-icons';
import Spacer from '../../components/general/spacer';
import { PaymentMethod, paymentMethodsPetCare } from '../../hooks/fetchPaymentMethod';
import TitleValue from '../../components/list/title_value';
import { Divider } from '@rneui/themed/dist/Divider';
import Button1 from '../../components/buttons/button1';
import { PortalProvider } from '@gorhom/portal';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import MainContCircle from '../../components/general/background_circle';
import CustomTextInput from '../../components/inputs/custom_text_input1';
import PlainTextInput from '../../components/inputs/custom_text_input2';
import supabase from '../../utils/supabase';
import { useSession } from '../../context/sessions_context';
import CustomCheckbox1 from '../../components/inputs/custom_checkbox1';
import { CheckBox } from '@rneui/themed';
import { Voucher } from '../../interfaces/voucher';
import Paypal from '../../components/payments/paypal';
import { StackActions } from '@react-navigation/native';
import { useBooking } from '../../context/booking_context';


type Pet = {
  id: string;
  name: string;
  weight: number;
  size: string;
  to_add_price: number;
  pet_type: string;
};

const ConfirmScheduling = () => {
  const { selectedDate, selectedTime, groomingDetails, appointedPets, paymentResult: rawResult } = useLocalSearchParams();
  const { session } = useSession();
  const { bookings, addToBookingContext } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const hasHandledPayment = useRef(false);
  const navigation = useNavigation();
  const paymentResult = typeof rawResult === 'string' ? JSON.parse(rawResult) : null;
  const [isProcessing, setIsProcessing] = useState(false);


  const inputRef = React.useRef<TextInput>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    if (hasHandledPayment.current || !paymentResult) return;

    hasHandledPayment.current = true;

    const handlePayment = async () => {
      const status = paymentResult.success;
      const data = paymentResult.data;

      console.log("✅ Payment Result after coming back:");
      console.log("✅ Status: ", status);
      console.log("✅ Data: ", data);

      setIsProcessing(true);

      if (!status) {
        console.log("❌ Payment was not successful.");
        return;
      }

      console.log("✅ Payment Successful");

      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            grooming_id: parsedGrooming?.id,
            user_id: session?.user?.id,
            pet_ids: parsedPets.map((p) => p.id),
            date: selectedDate,
            time_start: selectedTime,
            amount: finalValue,
            discount_applied: discount,
            note: '',
            status: "pending",
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (bookingError) {
        console.log("❌ Booking insert error:", bookingError);
        return;
      }

      console.log("✅ Booking inserted successfully:", bookingResult);

      let metadata = paymentMethod?.id !== "Pay-on-service" ? data : null;

      const { data: paymentInsertResult, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            user_id: session?.user?.id,
            booking_id: bookingResult?.id,
            ref_id: '',
            payment_method: paymentMethod?.id,
            amount: finalValue,
            discount_applied: discount,
            status: paymentMethod?.id !== "Pay-on-service" ? true : false,
            currency: 'PHP',
            metadata,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (paymentError) {
        console.log("❌ Payment insert error:", paymentError);
        return;
      }

      console.log("✅ Payment inserted successfully:", paymentInsertResult);

      if (discount > 0) {
        const { data: usedVouchersResult, error: usedVoucherError } = await supabase
          .from('used_vouchers')
          .insert([
            {
              user_id: session?.user?.id,
              voucher_id: voucherSelected?.id,
              booking_id: bookingResult?.id,
              discount_applied: discount,
              original_total: parseFloat(getPetTotal('all')),
              used_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();

        if (usedVoucherError) {
          console.log("❌ Used voucher insert error:", paymentError);
          return;
        }
      }

      addToBookingContext(bookingResult);

      for (let i = 0; i < 3; i++) {
        if (router.canGoBack()) {
          router.back();
        }
      }

      router.replace({
        pathname: './success_booking',
        params: {
          booking: JSON.stringify(bookingResult),
          payment: JSON.stringify(paymentResult),
        }
      });
    };

    handlePayment();
  }, [paymentResult]);


  const parsedGrooming: Subcategories = JSON.parse(groomingDetails as string);
  const parsedPets: Pet[] = JSON.parse(appointedPets as string);

  const openSheet = () => sheetRef.current?.expand();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);


  const [hasVoucherChanges, setHasVoucherChanges] = useState<boolean>(false);
  const [tempVoucherSelected, setTempVoucherSelected] = useState<Voucher | null>(null);
  const [voucherSelected, setVoucherSelected] = useState<Voucher | null>(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherResults, setVoucherResults] = useState<any>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isSearchingVouchers, setSearchingVouchers] = useState<boolean>(false);

  const totalPrice = parsedPets.reduce(
    (sum, p) => sum + ((p.to_add_price || 0) + (parsedGrooming.price ?? 0)),
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

  const getPetTotal = (type: string): string => {
    const filteredPets =
      type.toLowerCase() === 'all'
        ? parsedPets
        : parsedPets.filter((p) => p.pet_type?.toLowerCase() === type.toLowerCase());

    const total = filteredPets.reduce(
      (sum, p) => sum + ((p.to_add_price || 0) + (parsedGrooming.price ?? 0)),
      0
    );

    return total.toFixed(2);
  };

  const finalValue = parseFloat(getPetTotal('all')) - discount;

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

  const icon = parsedGrooming.svg_icon ? (
    <SvgValue
      svgIcon={parsedGrooming.svg_icon}
      color="#fff"
      width={dimensions.screenWidth * 0.11}
      height={dimensions.screenWidth * 0.11}
    />
  ) : null;

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

        const validVouchers = vouchersData.filter((voucher) => {
          if (!voucher.is_active) return false;

          const validFrom = new Date(voucher.valid_from);
          const validTo = voucher.valid_to ? new Date(voucher.valid_to) : null;
          if (now < validFrom || (validTo && now > validTo)) return false;

          const totalUsed = usageCountMap[voucher.id] || 0;
          if (voucher.usage_limit !== null && totalUsed >= voucher.usage_limit) return false;

          const userUsed = usedVouchers.filter((v) => v.voucher_id === voucher.id).length;
          if (voucher.user_limit !== null && userUsed >= voucher.user_limit) return false;

          if (voucher.is_first_time_user_only) {
            const categories = voucher.applies_to_categories || [];
            const hasUsedCategory = categories.some((catId: string) => usedCategoryIds.includes(catId));
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

  return (
    <PortalProvider>
      <View style={{ height: '100%', backgroundColor: '#F8F8FF' }}>
        {(
          <AppbarDefault
            title="Confirm Booking"
            zIndex={0}
            subtitleSize={dimensions.screenWidth * 0.03}
            subtitleFont="Poppins-Regular"
            session={session}
            showLeading={false}
            leadingChildren
            titleSize={dimensions.screenWidth * 0.045}
          />
        )}
        <MainContPlain>
          <View style={styles.cont1}>
            <Title1 text="Booking Details" fontSize={dimensions.screenWidth * 0.05} />
            <View style={[styles.groomMainCont]}>
              <View style={styles.groomTypeCont}>
                <View style={[styles.listSvgIconBG, {
                  flexDirection: 'column',
                  display: 'flex',
                  justifyContent: 'center',
                }]}>
                  <Text
                    style={{
                      fontSize: dimensions.screenWidth * 0.05,
                      fontFamily: 'Poppins-SemiBold',
                      lineHeight: dimensions.screenWidth * 0.06,
                      textAlign: 'center'
                    }}
                  >{`${parsedPets.length}\n`}
                    <Text
                      style={{
                        color: '#808080',
                        fontSize: dimensions.screenWidth * 0.028,
                        lineHeight: dimensions.screenWidth * 0.03,
                        fontFamily: 'Poppins-Regular',
                        textAlign: 'center'
                      }}
                    >{parsedPets.length > 1 ? 'Pets' : 'Pet'}</Text>
                  </Text>
                </View>
                <View style={styles.listItemDetails}>
                  <Text style={styles.l1title}>{parsedGrooming.title}</Text>
                  <Text style={styles.l1description}>{`${moment(selectedDate).format('MMM D, YYYY')} - ${moment(selectedTime, 'HH:mm').format('h:mm A')}`}</Text>
                </View>
                <View style={{ height: "100%" }}>
                  <View
                    style={{
                      backgroundColor: "#ED7964",
                      paddingVertical:
                        dimensions.screenHeight * 0.001,
                      paddingHorizontal:
                        dimensions.screenWidth * 0.02,
                      borderRadius: 10,
                      marginTop: dimensions.screenHeight * 0.01,
                    }}
                  >
                    <Price
                      value={parsedGrooming.price ?? 0.0}
                      color="#fff"
                      fontFamily="Poppins-SemiBold"
                      fontSize={dimensions.screenWidth * 0.03}
                      lineHeight={
                        dimensions.screenWidth * 0.045
                      }
                      currencySize={
                        dimensions.screenWidth * 0.03
                      }
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: dimensions.screenWidth * 0.035,
                  paddingBottom: dimensions.screenHeight * 0.02
                }}
              >
                <Text
                  style={{
                    color: '#808080',
                    fontFamily: 'Poppins-Regular',
                    fontSize: dimensions.screenWidth * 0.03
                  }}
                >Appointed {parsedPets.length > 1 ? 'Pets' : 'Pet'}:</Text>
                {parsedPets.map((pet, index) => (
                  <View
                    style={{
                      backgroundColor: '#e2e7f3',
                      paddingHorizontal: dimensions.screenWidth * 0.035,
                      paddingVertical: dimensions.screenHeight * 0.01,
                      borderRadius: 30,
                      marginBottom: dimensions.screenHeight * 0.01,
                      flexDirection: 'row',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                    key={pet.id}>
                    <View
                      style={{
                        flexDirection: 'row',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <SvgValue svgIcon={pet.pet_type.toLocaleLowerCase()} color='#466AA2' width={dimensions.screenWidth * 0.05} height={dimensions.screenWidth * 0.05} />
                      <Spacer width={dimensions.screenWidth * 0.02} />
                      <View style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        flexDirection: 'column',

                      }}>
                        <Title1 fontSize={dimensions.screenWidth * 0.038} text={pet.name} lineHeight={dimensions.screenWidth * 0.045} />
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'column',
                        display: 'flex',
                        alignItems: 'flex-end'
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'Poppins-Regular',
                            color: '#808080'
                          }}
                        >{pet.size}: <Text style={{ color: '#ED7964', fontFamily: 'Poppins-SemiBold' }}>+ </Text></Text>
                        <Price value={`+${pet.to_add_price}`} color='#ED7964' fontFamily='Poppins-SemiBold' />
                      </View>
                    </View>
                  </View>
                ))}
                <Text
                  style={{
                    color: '#808080',
                    fontFamily: 'Poppins-Regular',
                    fontSize: dimensions.screenWidth * 0.028
                  }}
                >💡 Tip: Cats have a fixed additional rate of ₱50.00 for any size.</Text>
              </View>
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
                  <Text style={styles.cont2desc}>Choose a voucher for this booking</Text>
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
                  <Text style={styles.cont2desc}>Choose a payment method for this booking</Text>
                </View>
                <View style={[styles.cont2, { alignItems: 'flex-end', flex: 1 }]}>
                  <Ionicons name="cash" size={dimensions.screenWidth * 0.06} color="#B5B5B5" />
                </View>
              </View>
              <Spacer height={dimensions.screenHeight * 0.02} />
              <FlatList
                data={paymentMethodsPetCare}
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
              <Divider color='#D1D1D1' width={1}>
                <Spacer height={dimensions.screenHeight * 0.01} />
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                  <View style={styles.cont2}>
                    <Text style={styles.cont2desc}>Summary of the booking appointment</Text>
                  </View>
                  <View style={[{ width: '100%', marginTop: dimensions.screenHeight * 0.01 }]}>
                    <TitleValue
                      title="Grooming Price"
                      isSub={false}
                      isBold={true}
                      value={`₱${getPetTotal('All')}`}
                    />
                    <View
                      style={{
                        paddingHorizontal: dimensions.screenWidth * 0.03
                      }}
                    >
                      <TitleValue
                        title="Dogs"
                        isSub={true}
                        isBold={false}
                        value={`₱${getPetTotal('Dog')}`}
                      />
                      <TitleValue
                        title="Cats"
                        isSub={true}
                        isBold={false}
                        value={`₱${getPetTotal('Cat')}`}
                      />
                    </View>
                  </View>
                </View>
                <Spacer height={dimensions.screenHeight * 0.01} />
              </Divider>

              <Divider color='#D1D1D1' width={1}>
                <Spacer height={dimensions.screenHeight * 0.01} />
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                  <View style={[{ width: '100%', marginTop: dimensions.screenHeight * 0.01 }]}>
                    <TitleValue
                      title="Subtotal"
                      isSub={false}
                      isBold={true}
                      value={`₱${parsedPets.reduce((sum, p) => sum + ((p.to_add_price || 0) + (parsedGrooming.price ?? 0)), 0).toFixed(2)}`}
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
                        value={`₱${parsedPets.reduce((sum, p) => sum + ((p.to_add_price || 0) + (parsedGrooming.price ?? 0)), 0).toFixed(2)}`}
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
            title='Confirm Booking'
            isPrimary={true}
            onPress={paymentMethod ? () => {
              if (paymentMethod.name == 'PayPal') {
                console.log("Going PayPal");
                console.log(parsedGrooming);
                console.log(parsedPets);

                // 🔄 Map each pet to a PayPal item entry
                const items = parsedPets.map((pet) => {
                  const price = (parsedGrooming.price ?? 0) + (pet.to_add_price || 0);
                  return {
                    name: `${parsedGrooming.title} for ${pet.name}`,
                    price: Number(price).toFixed(2), // always 2 decimal places
                    currency: "PHP",
                    quantity: 1
                  };
                });

                console.log(discount);

                // ✅ Push to PayPal screen with discount
                router.push({
                  pathname: '../payments/paypal',
                  params: {
                    items: JSON.stringify(items),
                    discount: discount.toFixed(2)
                  }
                });
              }
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
                  // backgroundColor: 'red',
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
            <Text style={{ color: 'white', marginTop: 12, fontFamily: 'Poppins-SemiBold' }}>Finalizing your booking...</Text>
          </View>
        )}
      </View>
    </PortalProvider>
  );
};

export default ConfirmScheduling;

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
  input: {
    flex: 1,
    fontSize: dimensions.screenWidth * 0.035,
    fontFamily: "Poppins-Regular",
    color: "#333",
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
    marginBottom: dimensions.screenHeight * 0.013,
    elevation: 3,
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
    fontSize: dimensions.screenWidth * 0.04,
    lineHeight: dimensions.screenWidth * 0.055,
  },
  l1description: {
    fontFamily: 'Poppins-Regular',
    color: '#808080',
    fontSize: dimensions.screenWidth * 0.029,
    lineHeight: dimensions.screenWidth * 0.045,
    letterSpacing: 0.4,
  },
});
