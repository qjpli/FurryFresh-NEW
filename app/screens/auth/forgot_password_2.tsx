import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import MainContCircle from "../../components/general/background_circle";
import Title1 from "../../components/texts/title1";
import dimensions from "../../utils/sizing";
import Subtitle1 from "../../components/texts/subtitle1";
import CustomTextInput from "../../components/inputs/custom_text_input1";
import Button1 from "../../components/buttons/button1";
import { OtpInput } from "react-native-otp-entry";
import { router } from "expo-router";

type Props = {};

const SignUpOTP = (props: Props) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <MainContCircle
      showPetImage={true}
      paddingHorizontal={dimensions.screenWidth * 0.08}
    >
      <View style={styles.header}>
        <Title1
          text="Check Your Email"
          fontSize={dimensions.screenWidth * 0.08}
          lineHeight={dimensions.screenWidth * 0.1}
        />
        <Subtitle1
          text="We’ve sent a 5-digit code to your email. Enter it below to verify your identity."
          fontSize={dimensions.screenWidth * 0.038}
          fontFamily="Poppins-Regular"
          opacity={0.7}
          textAlign="left"
        />
      </View>
      <View style={styles.otpstyle}>
        <OtpInput
          numberOfDigits={6}
          focusColor="#ED7964"
          autoFocus={false}
          hideStick={true}
          placeholder="-"
          blurOnFilled={true}
          disabled={false}
          type="numeric"
          secureTextEntry={false}
          focusStickBlinkingDuration={500}
          onFocus={() => console.log("Focused")}
          onBlur={() => console.log("Blurred")}
          onTextChange={(text) => console.log(text)}
          onFilled={(text) => console.log(`OTP is ${text}`)}
          textInputProps={{
            accessibilityLabel: "One-Time Password",
          }}
          textProps={{
            accessibilityRole: "text",
            accessibilityLabel: "OTP digit",
            allowFontScaling: false,
          }}
          theme={{
            pinCodeContainerStyle: {
              width: dimensions.screenWidth * 0.12,
              height: dimensions.screenHeight * 0.07,
              borderWidth: 2,
              borderRadius: 15,
              justifyContent: "center",
              alignItems: "center",
            },
            pinCodeTextStyle: {
              fontSize: 20,
            },
            containerStyle: {
              
            }
          }}
        />
      </View>
      <View>
        <Button1
          title="Verify Code"
          isPrimary={true}
          borderRadius={15}
          onPress={() => {router.push('./forgot_password_3')}}
        />
      </View>
      <View style={styles.container3}>
        <Text style={styles.accountReg}>Didn't Receive?</Text>
        <TouchableOpacity
          style={styles.clicker}
          onPress={() => {

          }}
        >
          <Text style={styles.signup}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </MainContCircle>
  );
};

export default SignUpOTP;

const styles = StyleSheet.create({
  header: {
    marginTop: dimensions.screenHeight * 0.1,
    alignItems: "flex-start",
  },
  otpstyle: {
    marginTop: dimensions.screenHeight * 0.06,
    marginBottom: dimensions.screenHeight * 0.06,
  },
  container3: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
    margin: 0,
    padding: 0,
    marginTop: dimensions.screenHeight * 0.04,
  },
  accountReg: {
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    textAlign: 'center',
    margin: 0,
    padding: 0,
    lineHeight: 20,
    opacity: 0.6
  },
  clicker: {
    marginLeft: 5,
  },
  signup: {
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    lineHeight: 20, 
    color: '#ED7964',
  },
});
