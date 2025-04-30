import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import MainContPlain from "../../components/general/background_plain";
import dimensions from "../../utils/sizing";
import { Ionicons } from "@expo/vector-icons";

const AboutUsScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "About Us",
      headerBackTitleVisible: false,
      headerTintColor: "black",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <MainContPlain>
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>Our Story</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Who We Are</Text>
            <Text style={styles.aboutText}>
              FurryFresh was created with a simple mission: to make pet care easier, more convenient, and more fun for pet owners everywhere.
            </Text>

            <Text style={styles.aboutTitle}>Our Mission</Text>
            <Text style={styles.aboutText}>
              We aim to connect pet owners with professional grooming services, high-quality products, helpful tips, and playdate opportunities through a user-friendly platform.
            </Text>

            <Text style={styles.aboutTitle}>Why FurryFresh?</Text>
            <Text style={styles.aboutText}>
              • Trusted grooming partners{"\n"}
              • Curated product selections{"\n"}
              • Safe and social playdate organization{"\n"}
              • Reliable pet care advice
            </Text>

            <Text style={styles.aboutTitle}>Join Our Community</Text>
            <Text style={styles.aboutText}>
              Download FurryFresh today and become part of a growing community that shares your love and passion for pets.
            </Text>
          </View>
        </ScrollView>
      </View>
    </MainContPlain>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  container: {
    padding: dimensions.screenWidth * 0.04,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionHeader: {
    fontSize: dimensions.screenWidth * 0.038,
    fontFamily: "Poppins-SemiBold",
    color: "#a2a2a2",
    paddingLeft: dimensions.screenHeight * 0.015,
    marginBottom: dimensions.screenHeight * 0.01,
  },
  aboutCard: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: dimensions.screenHeight * 0.025,
  },
  aboutTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginTop: 15,
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
  },
});
