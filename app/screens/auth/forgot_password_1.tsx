import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import MainContCircle from "../../components/general/background_circle";
import Title1 from "../../components/texts/title1";
import Subtitle1 from "../../components/texts/subtitle1";
import CustomTextInput from "../../components/inputs/custom_text_input1";
import Button1 from "../../components/buttons/button1";
import { router } from "expo-router";
import dimensions from "../../utils/sizing";

type Props = {};

const SignUpOTP = (props: Props) => {
  const [email, setEmail] = useState("");

  const handleSendCode = () => {
    router.push("./forgot_password_2");
  };

  return (
    <MainContCircle
      showPetImage={true}
      paddingHorizontal={dimensions.screenWidth * 0.08}
    >
      <View style={styles.header}>
        <Title1
          text="Forgot Your Password?"
          fontSize={dimensions.screenWidth * 0.08}
          lineHeight={dimensions.screenWidth * 0.1}
          style={styles.title}
        />
        <Subtitle1
          text="Don’t worry! Just enter the email you used to sign up and we’ll send you a code to reset your password."
          fontSize={dimensions.screenWidth * 0.038}
          fontFamily="Poppins-Regular"
          opacity={0.7}
          textAlign="left"
          style={styles.subtitle}
        />
      </View>

      <View style={styles.container}>
        <CustomTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          iconName="email"
          keyboardType="email-address"
          marginBottom={dimensions.screenHeight * 0.03}
        />
      </View>
      <View>
        <Button1
          title="Send Code"
          isPrimary
          borderRadius={15}
          onPress={handleSendCode}
        />
      </View>
    </MainContCircle>
  );
};

export default SignUpOTP;

const styles = StyleSheet.create({
  header: {
    marginTop: dimensions.screenHeight * 0.1,
    width: "100%",
  },
  title: {
    textAlign: "left",
  },
  subtitle: {
    textAlign: "left",
    opacity: 0.7,
  },
  container: {
    marginTop: dimensions.screenHeight * 0.04,
  },
});
