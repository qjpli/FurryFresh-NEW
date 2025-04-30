import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import MainContCircle from "../../components/general/background_circle";
import Title1 from "../../components/texts/title1";
import dimensions from "../../utils/sizing";
import Subtitle1 from "../../components/texts/subtitle1";
import Button1 from "../../components/buttons/button1";
import DogIcon from "../../components/svgs/signUp/DogIcon";
import CatIcon from "../../components/svgs/signUp/CatIcon";
import { useRouter } from "expo-router";
import supabase from "../../utils/supabase";

type Props = {};

type PetButton = {
  id: string;
  title: string;
  icon: any;
};

const petButtons: PetButton[] = [
  {
    id: "1",
    title: "Dog",
    icon: DogIcon,
  },
  {
    id: "2",
    title: "Cat",
    icon: CatIcon,
  },
];

const SignUpPet = (props: Props) => {
  const router = useRouter();
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePetSelection = (id: string) => {
    setSelectedPets((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((petId) => petId !== id)
        : [...prevSelected, id] 
    );
  };

  const finishSetup = async () => {
    if(loading) return;
    try {
      setLoading(true);

      const { data: user, error } = await supabase.auth.getUser();

      if (user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { pets: selectedPets },
        });

        if (updateError) {
          console.error("Error updating user metadata:", updateError.message);
          return;
        }

        router.replace('../(tabs)');
        
      } else {
        console.error("No user found.");
      }
    } catch (error) {
      console.error("Error finishing setup:", error);
    }
  };

  return (
    <MainContCircle
      showPetImage={true}
      paddingHorizontal={dimensions.screenWidth * 0.08}
    >
      <View style={styles.header}>
        <Title1
          text="Pet Details"
          fontSize={dimensions.screenWidth * 0.08}
          lineHeight={dimensions.screenWidth * 0.1}
        />
        <Subtitle1
          text="Let us know about your pets to personalize their grooming experience!"
          fontSize={dimensions.screenWidth * 0.038}
          fontFamily="Poppins-Regular"
          opacity={0.7}
          textAlign="left"
        />
      </View>
      <View>
        <Subtitle1
          text="Select all types of pet that you have"
          fontSize={dimensions.screenWidth * 0.038}
          fontFamily="Poppins-Regular"
          opacity={0.7}
          textAlign="left"
        />
        <View style={styles.wrapContainer}>
          {petButtons.map((item, index) => {
            const isSelected = selectedPets.includes(item.id);
            const Icon = item.icon;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => togglePetSelection(item.id)}
              >
                <Icon
                  height={dimensions.screenWidth * 0.06}
                  width={dimensions.screenWidth * 0.06}
                  color={isSelected ? "#FFFFFF" : "#808080"}
                />
                <Text style={[styles.title, isSelected && styles.titleSelected]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View>
        <Button1
          title="Finish Setup"
          isPrimary={true}
          loading={loading}
          borderRadius={15}
          onPress={selectedPets.length === 0 ? null : finishSetup}
        />
      </View>
    </MainContCircle>
  );
};

export default SignUpPet;

const styles = StyleSheet.create({
  header: {
    marginTop: dimensions.screenHeight * 0.1,
    marginBottom: dimensions.screenHeight * 0.06,
    alignItems: "flex-start",
  },
  wrapContainer: {
    flexDirection: "row", 
    flexWrap: "wrap",
    marginTop: dimensions.screenHeight * 0.01,
    marginBottom: dimensions.screenHeight * 0.1,
  },
  item: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: dimensions.screenWidth * 0.06,
    paddingVertical: dimensions.screenHeight * 0.01,
    borderRadius: 10,
    marginRight: dimensions.screenWidth * 0.03,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  itemSelected: {
    backgroundColor: "#ED7964",
  },
  title: {
    color: "#808080",
    fontFamily: "Poppins-SemiBold",
    fontSize: dimensions.screenWidth * 0.04,
    marginLeft: dimensions.screenWidth * 0.01,
  },
  titleSelected: {
    color: "#FFFFFF",
  },
});
