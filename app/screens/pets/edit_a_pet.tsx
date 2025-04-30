// edit_a_pet.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import { petsStyles } from "./components/petsStyles";
import { Ionicons } from "@expo/vector-icons";
import MainContPaw from "../../components/general/background_paw";
import AppbarDefault from "../../components/bars/appbar_default";
import dimensions from "../../utils/sizing";
import { useSession } from "../../context/sessions_context";
import PlainTextInput from "../../components/inputs/custom_text_input2";
import DogIcon from "../../components/svgs/signUp/DogIcon";
import CatIcon from "../../components/svgs/signUp/CatIcon";
import HorizontalButtonList from "../../components/list/horizontal_button_list";
import MaleIcon from "../../components/svgs/personal/MaleIcon";
import FemaleIcon from "../../components/svgs/personal/FemaleIcon";
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import CustomInputEvent from "../../components/inputs/custom_input_event";
import moment from "moment";
import Spacer from "../../components/general/spacer";
import Button1 from "../../components/buttons/button1";
import * as ImagePicker from 'expo-image-picker';
import supabase from "../../utils/supabase";
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { usePet } from "../../context/pet_context";
import Title1 from "../../components/texts/title1";
import Subtitle1 from "../../components/texts/subtitle1";

interface EditPetProps {
    back: () => void;
    pet: any;
}

const EditPet = ({ back, pet }: EditPetProps) => {
    const { updatePetContext } = usePet();
    const { session } = useSession();

    const [petName, setPetName] = useState(pet.name);
    const [petType, setPetType] = useState(pet.pet_type);
    const [petGender, setPetGender] = useState(pet.gender);
    const [showPicker, setShowPicker] = useState(false);
    const [petBirthday, setPetBirthday] = useState<Date>(pet.birthday || null);
    const [petBio, setPetBio] = useState(pet.bio || "");
    const [petWeight, setPetWeight] = useState(pet.weight || "");
    const [petBreed, setPetBreed] = useState(pet.breed || "");
    const [isLoading, setLoading] = useState(false);
    const [activePetType, setActivePetType] = useState(pet.pet_type.toLowerCase());
    const [activePetGender, setActivePetGender] = useState(pet.gender.toLowerCase());
    const [image, setImage] = useState<string | null>(pet.pet_avatar || null);
    const [date, setDate] = useState(new Date());

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const onChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);

        setPetBirthday(currentDate);

        setShowPicker(false);
    };

    const showMode = async (currentMode: 'date' | 'time') => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: date,
                onChange,
                mode: currentMode,
                is24Hour: true,
                maximumDate: new Date(),
            });
            console.log('Opening Android Picker');
        } else {
            setShowPicker(true);
            console.log('Opening iOS Picker');
        }
    };

    const showDatepicker = () => {
        showMode('date');
    };


    const handleUpdatePet = async () => {
        try {
            setLoading(true);

            const updates = {
                name: petName,
                pet_type: activePetType === "dog" ? "Dog" : "Cat",
                gender: activePetGender === "female" ? "Female" : "Male",
                birthday: petBirthday || null,
                bio: petBio,
                breed: petBreed,
                weight: parseFloat(petWeight) || null,
            };

            const { data: updatedPet, error } = await supabase
                .from("pets")
                .update(updates)
                .eq("id", pet.id)
                .select()
                .single();

            if (error) throw error;

            if (image && !image.startsWith("http")) {
                const response = await FileSystem.readAsStringAsync(image, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const fileBuffer = Buffer.from(response, 'base64');
                const fileExt = image.split('.').pop();
                const fileName = `pet_${pet.id}.${fileExt}`;
                const filePath = `${pet.id}/avatar/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('petimages')
                    .upload(filePath, fileBuffer, {
                        contentType: `image/${fileExt}`,
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('petimages').getPublicUrl(filePath);
                const { publicUrl } = data;
                const bustedUrl = `${publicUrl}?t=${Date.now()}`;

                const { data: petWithAvatar, error: updateError } = await supabase
                    .from("pets")
                    .update({ pet_avatar: bustedUrl })
                    .eq("id", pet.id)
                    .select()
                    .single();

                setImage(bustedUrl);

                if (updateError) throw updateError;

                updatePetContext(petWithAvatar);
            } else {
                updatePetContext(updatedPet);
            }

            alert("Pet updated successfully!");
            back();
        } catch (err) {
            console.error("Error updating pet:", err);
            alert("There was an error updating your pet.");
        } finally {
            setLoading(false);
        }
    };

    const petTypes = [
        { id: "dog", title: "Dog", icon: DogIcon },
        { id: "cat", title: "Cat", icon: CatIcon },
    ];

    const petGenders = [
        { id: "male", title: "Male", icon: MaleIcon },
        { id: "female", title: "Female", icon: FemaleIcon },
    ];

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView behavior="padding" style={petsStyles.addPetContainer}>
                <View style={{ zIndex: 1 }}>
                    <AppbarDefault
                        title="Edit Pet"
                        session={session}
                        showLeading={false}
                        leadFunction={back}
                        leadingChildren={null}
                        titleSize={dimensions.screenWidth * 0.045}
                    />
                </View>
                <MainContPaw>
                    {/* Photo Upload */}
                    <View style={styles.photoUploadContainer}>
                        <View style={{ position: "relative" }}>
                            <View style={[styles.circleAdd]}>
                                <View style={styles.photoPlaceholder}>
                                    <Ionicons name="image-outline" size={40} color="#aaa" />
                                </View>
                                <Text style={styles.photoPlaceholderText}>
                                    {"Attach a Photo\nof your pet"}
                                </Text>

                                {image && (
                                    <Image
                                        source={{ uri: image }}
                                        style={{
                                            width: dimensions.screenWidth * 0.35,
                                            height: dimensions.screenWidth * 0.35,
                                            borderColor: "#D1D1D1",
                                            borderWidth: 1.2,
                                            position: 'absolute',
                                            borderRadius: 100
                                        }}
                                    />
                                )}

                                <TouchableOpacity style={styles.cameraIcon} onPress={() => pickImage()}>
                                    <Ionicons
                                        name="camera"
                                        size={dimensions.screenWidth * 0.055}
                                        color="#777"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Pet Name */}
                    <View style={styles.formGroup}>
                        <Text style={petsStyles.formLabel}>Pet Name</Text>
                        <PlainTextInput
                            value={petName}
                            onChangeText={setPetName}
                            placeholder="Enter your pet's name"
                            keyboardType="default"
                            backgroundColor="white"
                            height={dimensions.screenHeight * 0.065}
                            marginBottom={dimensions.screenHeight * 0.0}
                        />
                    </View>

                    {/* Pet Type */}
                    <View>
                        <View style={[styles.formGroup]}>
                            <Text style={petsStyles.formLabel}>Pet Type</Text>
                        </View>
                        <HorizontalButtonList
                            services={petTypes}
                            activeService={activePetType}
                            setActiveService={(id) => {
                                setActivePetType(id);
                            }}
                            marginLeft={dimensions.screenWidth * 0.05}
                            marginTop={0}
                            paddingHorizontal={dimensions.screenWidth * 0.06}
                        />
                    </View>

                    {/* Pet Gender */}
                    <View>
                        <View style={[styles.formGroup]}>
                            <Text style={petsStyles.formLabel}>Pet Gender</Text>
                        </View>
                        <HorizontalButtonList
                            services={petGenders}
                            activeService={activePetGender}
                            setActiveService={(id) => {
                                setActivePetGender(id);
                            }}
                            activeColor="#466AA2"
                            marginLeft={dimensions.screenWidth * 0.05}
                            marginTop={0}
                            paddingHorizontal={dimensions.screenWidth * 0.06}
                        />
                    </View>

                    {/* Pet Breed */}
                    <View style={styles.formGroup}>
                        <Text style={petsStyles.formLabel}>Pet Breed</Text>
                        <PlainTextInput
                            value={petBreed}
                            onChangeText={setPetBreed}
                            placeholder="Enter your pet's breed"
                            keyboardType="default"
                            backgroundColor="white"
                            height={dimensions.screenHeight * 0.065}
                            marginBottom={dimensions.screenHeight * 0.0}
                        />
                    </View>


                    {/* Pet Weight */}
                    <View style={styles.formGroup}>
                        <Text style={petsStyles.formLabel}>Pet Weight (Optional)</Text>
                        <PlainTextInput
                            value={petWeight}
                            onChangeText={setPetWeight}
                            placeholder="Enter your pet's weight"
                            keyboardType="default"
                            backgroundColor="white"
                            height={dimensions.screenHeight * 0.065}
                            marginBottom={dimensions.screenHeight * 0.0}
                        />
                    </View>

                    {/* Pet Birthday */}
                    <View style={styles.formGroup}>
                        <Text style={petsStyles.formLabel}>Pet's Birthday (Optional)</Text>
                        <CustomInputEvent
                            title={petBirthday ? moment(petBirthday).format('MMM D, YYYY') : "Select your Pet's Birthday"}
                            onPress={() => showDatepicker()}
                            backgroundColor="#ffffff"
                            fontColor={petBirthday ? '#000' : "#bbb"}
                            fontSize={dimensions.screenWidth * 0.035}
                            paddingHorizontal={dimensions.screenWidth * 0.05}
                            paddingVertical={dimensions.screenHeight * 0.02}
                            borderRadius={10}
                            // trailing={<Text style={{ color: 'gray' }}>Optional</Text>}
                            iconOnEnd={{
                                name: 'calendar',
                                size: 20,
                                color: '#999',
                            }}
                        />
                    </View>

                    {/* Pet Bio */}
                    <View style={styles.formGroup}>
                        <Text style={petsStyles.formLabel}>Pet's Bio (Optional)</Text>
                        <TextInput
                            style={[
                                petsStyles.textInput,
                                {
                                    minHeight: 100,
                                    textAlignVertical: "top",
                                    fontSize: dimensions.screenWidth * 0.035,
                                    paddingHorizontal: dimensions.screenWidth * 0.05
                                },
                            ]}
                            placeholder="Tell us about your pet..."
                            placeholderTextColor="#bbb"
                            value={petBio}
                            onChangeText={setPetBio}
                            multiline={true}
                            numberOfLines={4}
                        />
                    </View>
                    <Spacer height={dimensions.screenHeight * 0.15} />
                </MainContPaw>
                {/* Create Button */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: dimensions.screenHeight * 0.04,
                        left: dimensions.screenWidth * 0.05,
                        right: dimensions.screenWidth * 0.05,
                    }}
                >
                    <Button1
                        title="Save Changes"
                        isPrimary={true}
                        loading={isLoading}
                        onPress={handleUpdatePet}
                        borderRadius={15}
                    />
                </View>
                {Platform.OS === 'ios' && showPicker && (
                    <View style={{
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
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: dimensions.screenWidth * 0.02 }}>
                            <Text>Birthday</Text>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                onChange={onChange}
                                maximumDate={new Date()}
                                display="default"
                            />
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default EditPet;

const styles = StyleSheet.create({
    photoUploadContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: dimensions.screenHeight * 0.02,
    },
    circleAdd: {
        backgroundColor: "#FFFFFF",
        borderRadius: 100,
        width: dimensions.screenWidth * 0.35,
        height: dimensions.screenWidth * 0.35,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "#D1D1D1",
        borderWidth: 1.2,
    },
    photoPlaceholder: {},
    photoPlaceholderText: {
        textAlign: "center",
        color: "#A0A0A0",
        fontFamily: "Poppins-Regular",
    },
    cameraIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: dimensions.screenSize * 0.005,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    formGroup: {
        marginHorizontal: dimensions.screenWidth * 0.05,
        marginTop: dimensions.screenHeight * 0.03,
    },
});
