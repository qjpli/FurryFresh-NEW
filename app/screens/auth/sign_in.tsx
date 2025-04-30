import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import dimensions from '../../utils/sizing';
import React, { useState } from 'react';
import MainContCircle from '../../components/general/background_circle';
import Title1 from '../../components/texts/title1';
import Subtitle1 from '../../components/texts/subtitle1';
import CustomTextInput from '../../components/inputs/custom_text_input1';
import Button1 from '../../components/buttons/button1';
import CustomCheckbox1 from '../../components/inputs/custom_checkbox1';
import ClickableText from '../../components/inputs/custom_text';
import supabase from '../../utils/supabase';
import { router } from 'expo-router';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCheckboxChange = (newValue: boolean) => {
        setIsChecked(newValue);
    };

    async function signInWithEmail() {
        if (loading) return;

        console.log('Entered');
      
        setLoading(true);
      
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        setLoading(false);
      
        if (error) {
          Alert.alert(error.message);

          return;
        }

        router.replace('../(tabs)');

        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }

    return (
        <MainContCircle showPetImage={true} paddingHorizontal={dimensions.screenWidth * 0.04}>
            <Image
                source={require('../../assets/images/general/furry-fresh-logo.png')}
                style={styles.loaderImage}
            />
            <Subtitle1 text="PET GROOMING • QUALITY SUPPLIES" />
            <View style={styles.container1}>
                <Title1 text='Sign In' fontSize={dimensions.screenWidth * 0.05} />
                <Subtitle1 text="Enter your Email and Password" fontFamily="Poppins-Regular" fontSize={dimensions.screenWidth * 0.03}/>
            </View>
            <View style={styles.container1}>
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
                    marginBottom={dimensions.screenHeight * 0.005}
                />
                <View style={styles.container2}>
                    <CustomCheckbox1
                        label="Remember Me"
                        value={isChecked}
                        onValueChange={handleCheckboxChange}
                    />
                    <ClickableText fontSize={dimensions.screenWidth * 0.036} color='#ED7964' onPress={() => { router.push('./forgot_password_1') }}>Forgot Password?</ClickableText>
                </View>
                <Button1 title="Sign In" loading={loading} isPrimary={true} borderRadius={15} onPress={() => signInWithEmail()} />
                <View style={styles.container3}>
                    <Text style={styles.accountReg}>Don't have an account?</Text>
                    <TouchableOpacity style={styles.clicker} onPress={() => {router.push('./sign_up_1')}}>
                        <Text style={styles.signup}>Sign up</Text>
                    </TouchableOpacity> 
                </View>
            </View>
        </MainContCircle>
    );
};

export default SignIn;

const styles = StyleSheet.create({
    loaderImage: {
        alignSelf: 'center',
        marginTop: dimensions.screenHeight * 0.07,
        width: dimensions.screenWidth * 0.27,
        height: dimensions.screenWidth * 0.27
    },
    container1: {
        alignItems: 'flex-start',
        marginTop: dimensions.screenHeight * 0.04,
        paddingHorizontal: dimensions.screenWidth * 0.035
    },
    container2: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: dimensions.screenHeight * 0.03,
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
