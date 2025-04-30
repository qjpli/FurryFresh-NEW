import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import MainContPlain from "../../components/general/background_plain";
import dimensions from "../../utils/sizing";
import { Ionicons } from "@expo/vector-icons";

const ContactUsScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Contact Us",
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
        <Text style={styles.sectionHeader}>Get in Touch</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Customer Support</Text>
            <Text style={styles.contactText}>
              • Email: support@furryfresh.com{"\n"}
              • Phone: +1 (123) 456-7890{"\n"}
              • Live Chat: Available in-app from 9 AM to 6 PM
            </Text>

            <Text style={styles.contactTitle}>Business Inquiries</Text>
            <Text style={styles.contactText}>
              • Email: business@furryfresh.com{"\n"}
              • Collaborations, partnerships, and sponsorship opportunities.
            </Text>

            <Text style={styles.contactTitle}>Visit Us</Text>
            <Text style={styles.contactText}>
              FurryFresh Headquarters{"\n"}
              1234 Pet Lane, Suite 567{"\n"}
              Petville, PA 12345
            </Text>
          </View>
        </ScrollView>
      </View>
    </MainContPlain>
  );
};

export default ContactUsScreen;

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
  contactCard: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: dimensions.screenHeight * 0.025,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginTop: 15,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
  },
});
