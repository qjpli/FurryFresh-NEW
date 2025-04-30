import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import MainContPlain from "../../components/general/background_plain";
import dimensions from "../../utils/sizing";
import { Ionicons } from "@expo/vector-icons";

const PolicyScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Terms & Policies",
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
        <Text style={styles.sectionHeader}>FurryFresh Policy</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.policyCard}>
            {/* Introduction */}
            <Text style={styles.policyTitle}>Introduction</Text>
            <Text style={styles.policyText}>
              Welcome to FurryFresh, your one-stop app for pet grooming services, products, playdates, and pet care tips. By using our app, you agree to the following terms and conditions.
            </Text>

            {/* User Accounts */}
            <Text style={styles.policyTitle}>User Accounts</Text>
            <Text style={styles.policyText}>
              • Users must create an account to access grooming services and product features.{"\n"}
              • Users are responsible for maintaining the confidentiality of their account information.
            </Text>

            {/* Grooming Services */}
            <Text style={styles.policyTitle}>Grooming Services</Text>
            <Text style={styles.policyText}>
              • Users can book grooming appointments based on their pet's size (small, medium, large).{"\n"}
              • Appointment dates and times are subject to availability.{"\n"}
              • Pricing varies according to the size of the pet and the services selected.
            </Text>

            {/* Shopping */}
            <Text style={styles.policyTitle}>Shopping</Text>
            <Text style={styles.policyText}>
              • Users can browse and purchase pet products through our in-app store.{"\n"}
              • All transactions are processed securely; FurryFresh does not store payment information.
            </Text>

            {/* Playdates */}
            <Text style={styles.policyTitle}>Playdates</Text>
            <Text style={styles.policyText}>
              • Our playdate feature allows pet owners to connect for socialization opportunities.{"\n"}
              • Users must ensure their pets are vaccinated and socialized before arranging playdates.
            </Text>

            {/* Pet Care Tips */}
            <Text style={styles.policyTitle}>Pet Care Tips</Text>
            <Text style={styles.policyText}>
              FurryFresh provides informational resources about pet care. Content is intended for general guidance and should not replace professional veterinary advice.
            </Text>

            {/* User Conduct */}
            <Text style={styles.policyTitle}>User Conduct</Text>
            <Text style={styles.policyText}>
              • Users are expected to treat others with respect and kindness.{"\n"}
              • Any abusive or inappropriate behavior may result in account suspension.
            </Text>

            {/* Privacy Policy */}
            <Text style={styles.policyTitle}>Privacy Policy</Text>
            <Text style={styles.policyText}>
              We value your privacy. Personal information will not be shared with third parties without your consent.{"\n"}
              Please refer to our Privacy Policy for more details on data collection and usage.
            </Text>

            {/* Changes to Policy */}
            <Text style={styles.policyTitle}>Changes to Policy</Text>
            <Text style={styles.policyText}>
              FurryFresh reserves the right to modify this policy at any time. Users will be notified of significant changes.
            </Text>
            
          </View>
        </ScrollView>
      </View>
    </MainContPlain>
  );
};

export default PolicyScreen;

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
  policyCard: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: dimensions.screenHeight * 0.025,
  },
  policyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginTop: 15,
    marginBottom: 6,
  },
  policyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
  },
});
