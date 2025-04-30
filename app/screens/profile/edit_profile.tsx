
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import MainContPaw from '../../components/general/background_paw';
import AppbarDefault from '../../components/bars/appbar_default';
import { useSession } from '../../context/sessions_context';
import dimensions from '../../utils/sizing';
import PlainTextInput from '../../components/inputs/custom_text_input2';
import supabase from '../../utils/supabase';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import moment from 'moment';
import CustomInputEvent from "../../components/inputs/custom_input_event";

const EditProfile = () => {
    const { session } = useSession();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [birthday, setBirthday] = useState<Date | null>(null);
    const [sex, setSex] = useState<string | null>(null); // Allow null for no selection
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        if (session?.user?.id) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        if (session) {
            const metadata = session.user?.user_metadata || {};
            setFirstName(metadata['first_name'] || '');
            setLastName(metadata['last_name'] || '');
            setContactNumber(metadata['contact_number'] || '');
            setAddress(metadata['address'] || '');
            setSex(metadata['sex'] ? metadata['sex'].toLowerCase() : null); // Set to null if not present
            const birthdayString = metadata['birthday'] || '';
            if (birthdayString) {
                const birthdayDate = new Date(birthdayString);
                setBirthday(birthdayDate);
                setDate(birthdayDate);
            }
        }
    };

    const handleSave = async () => {
        if (!session?.user?.id) {
            Alert.alert('Update Failed', 'No user session found.');
            return;
        }

        // Validate and sanitize sex
        const validSex = ['male', 'female'];
        if (sex && !validSex.includes(sex)) {
            Alert.alert('Update Failed', 'Please select either Male or Female for sex.');
            return;
        }

        setLoading(true);

        try {
            console.log("Saving profile with sex:", sex ? sex : 'Not specified');

            const profileData = {
                first_name: firstName,
                last_name: lastName,
                contact_number: contactNumber,
                address,
                sex: sex ? sex : null, // Save as null if not selected
                birthday: birthday ? moment(birthday).format('YYYY-MM-DD') : null,
                updated_at: new Date().toISOString(),
            };

            console.log("Profile Data:", profileData);

            const { data: data, error: profileError } = await supabase
                .auth
                .updateUser({
                  data: profileData
                });

            if (profileError) throw profileError;

            Alert.alert('Success', 'Profile updated successfully.');
        } catch (error: any) {
            console.error("Error updating user:", error);
            Alert.alert('Update Failed', error.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const onChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
        setBirthday(currentDate);
        setShowPicker(false);
    };

    const showMode = async (currentMode: 'date') => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: date,
                onChange,
                mode: currentMode,
                is24Hour: true,
                maximumDate: new Date(),
            });
        } else {
            setShowPicker(true);
        }
    };

    const showDatepicker = () => {
        showMode('date');
    };

    return (
        <View style={{ height: '100%', backgroundColor: '#F8F8FF' }}>
            <AppbarDefault
                title="Edit Profile"
                session={session}
                showBack={true}
                showLeading={false}
                leadingChildren={null}
                titleSize={dimensions.screenWidth * 0.045}
                paddingBottom={dimensions.screenHeight * 0.02}
            />
            <MainContPaw>
                <ScrollView contentContainerStyle={styles.content}>
                    <PlainTextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                        autoCapitalize="words"
                    />
                    <PlainTextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                        autoCapitalize="words"
                    />
                    <PlainTextInput
                        value={contactNumber}
                        onChangeText={setContactNumber}
                        placeholder="Contact Number"
                        keyboardType="phone-pad"
                    />

                    {/* Sex Selection */}
                    <View style={styles.sexContainer}>
                        <Text style={styles.sexLabel}>Sex</Text>
                        <View style={styles.sexOptions}>
                            <TouchableOpacity
                                style={[styles.sexOption, sex === 'male' && styles.sexOptionSelected]}
                                onPress={() => setSex('male')}
                            >
                                <Text style={[styles.sexOptionText, sex === 'male' && styles.sexOptionTextSelected]}>Male</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sexOption, sex === 'female' && styles.sexOptionSelected]}
                                onPress={() => setSex('female')}
                            >
                                <Text style={[styles.sexOptionText, sex === 'female' && styles.sexOptionTextSelected]}>Female</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <PlainTextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Address"
                    />

                    <View style={styles.formGroup}>
                        <CustomInputEvent
                            title={birthday ? moment(birthday).format('MMM D, YYYY') : "Select your Birthday"}
                            onPress={showDatepicker}
                            backgroundColor="#f1f1f1"
                            fontColor={birthday ? '#000' : "#d5d5d5"}
                            fontSize={dimensions.screenWidth * 0.035}
                            paddingHorizontal={dimensions.screenWidth * 0.05}
                            paddingVertical={dimensions.screenHeight * 0.028}
                            borderRadius={15}
                            iconOnEnd={{
                                name: 'calendar',
                                size: 20,
                                color: '#999',
                            }}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </MainContPaw>

            {Platform.OS === 'ios' && showPicker && (
                <View style={styles.iosDatePickerContainer}>
                    <View style={styles.iosDatePickerHeader}>
                        <Text style={styles.iosDatePickerTitle}>Birthday</Text>
                        <DateTimePicker
                            value={date}
                            mode="date"
                            onChange={onChange}
                            maximumDate={new Date()}
                            display="spinner"
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    content: {
        padding: 16,
        gap: dimensions.screenHeight * 0.02,
    },
    button: {
        backgroundColor: '#4B9CD3',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
        fontSize: dimensions.screenWidth * 0.04,
    },
    formGroup: {
        marginBottom: dimensions.screenHeight * 0.02,
    },
    iosDatePickerContainer: {
        zIndex: 3,
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        width: dimensions.screenWidth,
        paddingTop: dimensions.screenHeight * 0.02,
        paddingBottom: dimensions.screenHeight * 0.05,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    iosDatePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: dimensions.screenWidth * 0.05,
    },
    iosDatePickerTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: dimensions.screenWidth * 0.04,
    },
    sexContainer: {
        marginBottom: dimensions.screenHeight * 0.02,
    },
    sexLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: dimensions.screenWidth * 0.035,
        marginBottom: 8,
        color: '#333',
    },
    sexOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    sexOption: {
        flex: 1,
        paddingVertical: dimensions.screenHeight * 0.02,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    sexOptionSelected: {
        backgroundColor: '#4B9CD3',
        borderColor: '#4B9CD3',
    },
    sexOptionText: {
        fontFamily: 'Poppins-Medium',
        fontSize: dimensions.screenWidth * 0.035,
        color: '#666',
    },
    sexOptionTextSelected: {
        color: '#fff',
    },
});