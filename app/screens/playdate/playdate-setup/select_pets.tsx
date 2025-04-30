import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AppbarDefault from '../../../components/bars/appbar_default'
import { useSession } from '../../../context/sessions_context'
import dimensions from '../../../utils/sizing';
import MainContPaw from '../../../components/general/background_paw';
import { FlatList } from 'react-native-gesture-handler';
import { usePet } from '../../../context/pet_context';
import Ionicons from '@expo/vector-icons/Ionicons';
import SvgValue from '../../../hooks/fetchSvg';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Button } from '@rneui/themed';
import Button1 from '../../../components/buttons/button1';
import supabase from '../../../utils/supabase';
import { router } from 'expo-router';

type SelectPlaydateProps = {}

const SelectPlaydatePets = (props: SelectPlaydateProps) => {
    const [selectedPets, setSelectedPet] = useState<String[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);

    const { session } = useSession();
    const { pets, updatePetContext } = usePet();

    const toggleSelect = ({ id }: { id: string }) => {

        if (selectedPets.find((pet) => pet == id)) {
            setSelectedPet(selectedPets.filter((pet) => pet !== id));
        } else {
            setSelectedPet([...selectedPets, id]);
        }

    }

    const updatePets = async () => {

        setLoading(true);

        const { data, error } = await supabase
            .from('pets')
            .update({ is_playdate_allowed: true }) 
            .in('id', selectedPets)
            .select();

        setLoading(false);

        if (error) {
            console.error('Error updating pets:', error);
        } else {

            for(let i = 0; i < data.length; i++) {
                updatePetContext(data[i]);
            }

            console.log('Successfully updated pets');
            
            router.push('../../playdate/home');
        }
    }

    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <AppbarDefault
                session={session}
                title='Add to Playdate'
                leadingChildren={null}
                showLeading={false}
                titleSize={dimensions.screenWidth * 0.05}
            />
            <MainContPaw>
                <FlatList
                    data={pets}
                    scrollEnabled={false}
                    renderItem={({ item, index }) => {

                        const isSelected = selectedPets.find((pet) => pet == item.id);

                        return (
                            <TouchableOpacity style={[
                                styles.petItemCont,
                                isSelected && styles.selectedPetItemCont
                            ]} onPress={() => toggleSelect({ id: item.id })}>
                                <View
                                    style={{
                                        position: "relative",
                                        width: dimensions.screenWidth * 0.18,
                                        // backgroundColor: "red",
                                        alignItems: "center",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        height: dimensions.screenWidth * 0.16,
                                        marginRight: dimensions.screenWidth * 0.03,
                                    }}
                                >
                                    {item.pet_avatar ? (
                                        <Image
                                            source={{ uri: item.pet_avatar }}
                                            style={petsStyles.petImage}
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                petsStyles.petImage,
                                                {
                                                    backgroundColor: "#D1D1D1",
                                                    marginBottom:
                                                        index != pets.length - 1
                                                            ? dimensions.screenHeight * 0.01
                                                            : dimensions.screenHeight * 0.015,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                },
                                            ]}
                                        >
                                            <SvgValue
                                                svgIcon={item.pet_type == 'Dog' ? "dog" : "cat"}
                                                color="#fff"
                                                width={dimensions.screenWidth * 0.07}
                                                height={dimensions.screenWidth * 0.07}
                                            />
                                        </View>
                                    )}
                                    <View
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            width: "100%",
                                            alignItems: "center",
                                        }}
                                    >
                                        <View
                                            style={[
                                                petsStyles.genderTag,
                                                {
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    flexDirection: "row",
                                                    gap: dimensions.screenWidth * 0.01,
                                                },
                                                item.gender === "Male"
                                                    ? petsStyles.maleTag
                                                    : petsStyles.femaleTag,
                                            ]}
                                        >
                                            <Ionicons
                                                name={item.gender == "Male" ? "male" : "female"}
                                                size={dimensions.screenWidth * 0.03}
                                                color="#fff"
                                            />
                                            <Text style={petsStyles.genderText}>{item.gender}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={petsStyles.petInfo}>
                                    <Text style={petsStyles.petName}>{item.name}</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FontAwesome5
                                            name={item.pet_type.toLowerCase() === "dog" ? "dog" : "cat"}
                                            size={12}
                                            color="#777"
                                        />
                                        <Text style={petsStyles.petType}> {item.pet_type}</Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        alignItems: "center",
                                        display: "flex",
                                        alignContent: "center",
                                    }}
                                >
                                    <View style={isSelected ? petsStyles.selectedPetCont : petsStyles.unselectedPetCont} >
                                        <Ionicons
                                            name='checkmark'
                                            size={dimensions.screenWidth * 0.05}
                                            color={isSelected ? 'white' : 'transparent'}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );

                    }}
                />
            </MainContPaw>
            <View
                style={{
                    position: 'absolute',
                    bottom: dimensions.screenHeight * 0.06,
                    left: dimensions.screenWidth * 0.05,
                    right: dimensions.screenWidth * 0.05,
                }}
            >
                <Button1
                    title='Add'
                    isPrimary={true}
                    onPress={selectedPets.length > 0 ? () => updatePets() : null}
                    loading={isLoading}
                    borderRadius={15}
                    paddingVertical={dimensions.screenHeight * 0.02}
                />
            </View>
        </View>
    )
}

export default SelectPlaydatePets

const styles = StyleSheet.create({
    petItemCont: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'white',
    },
    selectedPetItemCont: {
        borderColor: '#466AA2',
        borderWidth: 2,
        backgroundColor: '#ebf0f7'
    }
});

const petsStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    selectedPetCont: {
        backgroundColor: '#466AA2',
        borderRadius: 100,
        padding: dimensions.screenWidth * 0.01
    },
    unselectedPetCont: {
        backgroundColor: '#fff',
        borderColor: '#466AA2',
        opacity: 0.3,
        borderWidth: 2,
        borderRadius: 100,
        padding: dimensions.screenWidth * 0.01
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: dimensions.screenHeight * 0.02
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    filterButtonActive: {
        backgroundColor: '#ff6b6b',
    },
    filterButtonInactive: {
        backgroundColor: '#f1f1f1',
    },
    filterText: {
        color: '#fff',
    },
    filterTextInactive: {
        color: '#777',
    },
    petItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    petImage: {
        width: dimensions.screenWidth * 0.14,
        height: dimensions.screenWidth * 0.14,
        borderRadius: 100,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: dimensions.screenWidth * 0.038,
        fontFamily: 'Poppins-SemiBold'
    },
    petType: {
        fontSize: dimensions.screenWidth * 0.033,
        color: '#777',
        fontFamily: 'Poppins-Regular',
        marginTop: 2,
    },
    genderTag: {
        paddingHorizontal: dimensions.screenWidth * 0.02,
        paddingVertical: dimensions.screenHeight * 0.0012,
        alignItems: 'center',
        borderRadius: 12,
    },
    maleTag: {
        backgroundColor: '#466AA2',
    },
    femaleTag: {
        backgroundColor: '#ED7964',
    },
    genderText: {
        color: '#fff',
        fontSize: dimensions.screenWidth * 0.028,
        fontFamily: 'Poppins-SemiBold'
    },
    addButton: {
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    chevron: {
        alignSelf: 'center'
    },
    addPetContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    photoUploadContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoPlaceholderText: {
        color: '#aaa',
        textAlign: 'center',
        fontSize: 12,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    formGroup: {
        marginHorizontal: dimensions.screenWidth * 0.05,
    },
    formLabel: {
        fontSize: dimensions.screenWidth * 0.033,
        color: '#808080',
        fontFamily: 'Poppins-Regular',
        marginBottom: dimensions.screenHeight * 0.01,
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 5,
    },
    optionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    optionIcon: {
        marginRight: 6,
    },
    createButton: {
        backgroundColor: '#ff6b6b',
        marginHorizontal: 16,
        marginVertical: 20,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Pet Details Modal Styles
    petDetailsModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    petDetailsModalContent: {
        backgroundColor: '#fff',
        flex: 1,
        marginTop: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    petDetailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    petDetailsHeaderLeft: {
        flex: 1,
    },
    petDetailsName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    petDetailsType: {
        fontSize: 14,
        color: '#777',
    },
    petDetailsScrollView: {
        flex: 1,
    },
    petDetailsImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    petDetailsImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    petDetailsSectionContainer: {
        backgroundColor: '#f5f7fa',
        marginHorizontal: 15,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    petDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    petDetailsInfoItem: {
        alignItems: 'center',
        flex: 1,
    },
    petDetailsIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e6f0ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    petDetailsInfoLabel: {
        fontSize: 12,
        color: '#777',
        marginBottom: 4,
    },
    petDetailsInfoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    servicesSection: {
        marginHorizontal: 15,
        marginBottom: 20,
    },
    servicesSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    serviceCard: {
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    serviceCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    serviceCardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    serviceCardDescription: {
        fontSize: 14,
        color: '#777',
    },
    appointmentButton: {
        backgroundColor: '#ff6b6b',
        marginHorizontal: 15,
        marginBottom: 30,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    appointmentButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

});