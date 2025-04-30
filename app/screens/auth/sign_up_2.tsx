import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import MainContCircle from "../../components/general/background_circle";
import Title1 from "../../components/texts/title1";
import dimensions from "../../utils/sizing";
import Subtitle1 from "../../components/texts/subtitle1";
import Button1 from "../../components/buttons/button1";
import { OtpInput } from "react-native-otp-entry";
import { router, useLocalSearchParams } from "expo-router";
import supabase from "../../utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignUpOTP = () => {
  const route = useLocalSearchParams();
  const { email, firstname, lastname } = useLocalSearchParams();
  const [otpCode, setOTPCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCodeResent, setIsCodeResent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTimeLeft = async () => {
      const storedTimeLeft = await AsyncStorage.getItem(`${email}-timeLeft`);
      if (storedTimeLeft) {
        setTimeLeft(parseInt(storedTimeLeft, 10));
      }
    };

    loadTimeLeft();

    let interval: NodeJS.Timeout | null = null;

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime > 0) {
            AsyncStorage.setItem(`${email}-timeLeft`, (prevTime - 1).toString());
            return prevTime - 1;
          }
          if (interval) clearInterval(interval);
          AsyncStorage.removeItem(`${email}-timeLeft`);
          return 0;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, email]);

  const resendCode = async () => {
    if (isResending || timeLeft > 0) return;

    setIsResending(true);
    setIsCodeResent(false);

    const emailAddress = Array.isArray(email) ? email[0] : email;

    const { data: userData } = await supabase.auth.getUser();

    if (userData) {
      try {
        const { error } = await supabase.auth.resend({
          email: emailAddress,
          type: "signup",
        });

        if (error) {
          if (error.message.includes("For security purposes")) {
            const match = error.message.match(/after (\d+) seconds/);
            if (match && match[1]) {
              const secondsLeft = parseInt(match[1], 10);
              setTimeLeft(secondsLeft);
              await AsyncStorage.setItem(`${email}-timeLeft`, secondsLeft.toString());
              alert(`You can resend the code in ${secondsLeft} seconds.`);
            }
          } else {
            alert("There was an error resending the code. Please try again.");
          }
        } else {
          setIsCodeResent(true);
          alert("Verification code has been resent to your email.");
          setTimeLeft(180);
          await AsyncStorage.setItem(`${email}-timeLeft`, "180");
        }
      } catch (error) {
        alert("Something went wrong. Please try again.");
      }
    } else {
      alert("No user found. Please sign up first.");
    }

    setIsResending(false);
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: Array.isArray(email) ? email[0] : email,
        token: otpCode,
        type: "email",
      });

      if (error) {
        alert("Invalid or expired verification code.");
        setLoading(false);
        return;
      }

      const sessionData = await supabase.auth.getSession();
      const session = sessionData.data.session;

      if (!session) {
        alert("Session not found.");
        setLoading(false);
        return;
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: firstname,
          last_name: lastname,
        },
      });

      if (metadataError) {
        Alert.alert("Error updating user metadata", metadataError.message);
      }

      await AsyncStorage.removeItem(`${email}-timeLeft`);

      router.replace("./sign_up_3");
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <MainContCircle
      showPetImage={true}
      paddingHorizontal={dimensions.screenWidth * 0.08}
    >
      <View style={styles.header}>
        <Title1
          text="Verify Your Email"
          fontSize={dimensions.screenWidth * 0.08}
          lineHeight={dimensions.screenWidth * 0.1}
        />
        <Subtitle1
          text="We have sent a verification code to your email. It expires in 3 minutes, please check your inbox or spam folder."
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
          onFocus={() => { }}
          onBlur={() => { }}
          onTextChange={() => setOTPCode("")}
          onFilled={(text) => setOTPCode(text)}
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
          }}
        />
      </View>
      <View>
        <Button1
          title={"Verify Email"}
          loading={loading}
          isPrimary={true}
          borderRadius={15}
          onPress={!loading && otpCode ? verifyOTP : null}
        />
      </View>
      <View style={styles.container3}>
        <Text style={styles.accountReg}>Didn't Receive?</Text>
        <TouchableOpacity
          style={styles.clicker}
          onPress={resendCode}
        >
          <Text style={styles.signup}>
            {isResending
              ? "Resending..."
              : timeLeft > 0
                ? `Resend Code (${timeLeft}s)`
                : "Resend Code"}
          </Text>
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
    marginTop: dimensions.screenHeight * 0.04,
  },
  accountReg: {
    fontFamily: "Poppins-Regular",
    alignSelf: "center",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.6,
  },
  clicker: {
    marginLeft: 5,
  },
  signup: {
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    lineHeight: 20,
    color: "#ED7964",
  },
});
