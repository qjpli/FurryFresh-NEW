import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import MainContCircle from '../../components/general/background_circle'
import Title1 from '../../components/texts/title1'
import dimensions from '../../utils/sizing'
import Subtitle1 from '../../components/texts/subtitle1'
import CustomTextInput from '../../components/inputs/custom_text_input1'
import Button1 from '../../components/buttons/button1'
import { router } from 'expo-router'
import supabase from '../../utils/supabase'

type Props = {}

const SignUp = (props: Props) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (loading) return;

    setLoading(true);

    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      Alert.alert('Email already exists. Try logging in instead.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      if (error.message.includes('User already registered') || error.message.includes('email')) {
        Alert.alert('Email is already registered. Please try logging in or use a different email.');
      } else {
        Alert.alert(error.message);
      }
      setLoading(false);
      return;
    }

    if (!data.session) {
      setLoading(false);
      console.log("No session registered");

      router.replace({
        pathname: './sign_up_2',
        params: {
          email: email,
          firstname: firstname,
          lastname: lastname,
        },
      });
      return;
    }

    setLoading(false);
  }


  return (
    <MainContCircle showPetImage={true} paddingHorizontal={dimensions.screenWidth * 0.08}>
      <View style={styles.header}>
        <Title1
          text='Sign Up'
          fontSize={dimensions.screenWidth * 0.08}
          lineHeight={dimensions.screenWidth * 0.1}
        />
        <Subtitle1
          text='Start today your Furry Account'
          fontSize={dimensions.screenWidth * 0.038}
          fontFamily='Poppins-Regular'
          opacity={0.7}
        />
      </View>
      <View>
        <CustomTextInput
          label="First Name"
          value={firstname}
          onChangeText={setFirstname}
          placeholder="Enter your First Name"
          iconName="account"
          marginTop={dimensions.screenHeight * 0.035}
          marginBottom={dimensions.screenHeight * 0.03}
        />
        <CustomTextInput
          label="Last Name"
          value={lastname}
          onChangeText={setLastname}
          placeholder="Enter your Last Name"
          iconName="account"
          marginTop={dimensions.screenHeight * 0.0}
          marginBottom={dimensions.screenHeight * 0.03}
        />
        <CustomTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          iconName="email"
          keyboardType="email-address"
          marginBottom={dimensions.screenHeight * 0.03}
        />
        <CustomTextInput
          value={password}
          label="Password"
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={true}
          iconName="lock"
          marginBottom={dimensions.screenHeight * 0.07}
        />
        <Button1 title="Continue" isPrimary={true} loading={loading} borderRadius={15} onPress={signUpWithEmail} />
        <View style={styles.container3}>
                            <Text style={styles.accountLogin}>Already have an account?</Text>
                            <TouchableOpacity style={styles.clicker} onPress={() => {router.push('./sign_in')}}>
                                <Text style={styles.signin}>Sign In</Text>
                            </TouchableOpacity> 
                        </View>
      </View>
    </MainContCircle>
  )
}

export default SignUp

const styles = StyleSheet.create({
  header: {
    marginTop: dimensions.screenHeight * 0.1,
    alignItems: 'flex-start'
  },
  container3: {
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          flexDirection: 'row',
          margin: 0,
          padding: 0,
          marginTop: dimensions.screenHeight * 0.04
        },
        accountLogin: {
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
        signin: {
          fontFamily: 'Poppins-SemiBold',
          textAlign: 'center',
          lineHeight: 20, 
          color: '#ED7964',
        },
})
