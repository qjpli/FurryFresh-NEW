import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "expo-router";
import MainContPlain from "../../components/general/background_plain";
import dimensions from "../../utils/sizing";
import { Ionicons } from "@expo/vector-icons";
import supabase from "../../utils/supabase";
import moment from "moment";

type UserInfoItem = {
  id: string;
  title: string;
  value: string;
  note?: string;
  onPress?: () => void;
};

const AccountInformationScreen = () => {
  const navigation = useNavigation();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userNumber, setUserNumber] = useState<string>("");
  const [userBirthday, setUserBirthday] = useState<string>("Not set");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Account Information",
      headerBackTitleVisible: false,
      headerTintColor: "black",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 0 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "Not set");
        
        const phoneNumber = user.user_metadata?.contact_number || "Not set";
        setUserNumber(phoneNumber);

        const birthday = user.user_metadata?.birthday || "Not set";
        if (birthday !== "Not set") {
          setUserBirthday(moment(birthday).format("MMMM D, YYYY"));
        } else {
          setUserBirthday(birthday);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const userInfo: UserInfoItem[] = [
    { id: "1", title: "Phone number", value: userNumber },
    { id: "2", title: "Email", value: userEmail },
    { id: "3", title: "Date of birth", value: userBirthday },
  ];

  const renderItem = ({ item }: { item: UserInfoItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={item.onPress}
      activeOpacity={item.onPress ? 0.6 : 1}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemValue}>{item.value}</Text>
        {item.note && <Text style={styles.itemNote}>{item.note}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <MainContPlain>
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <FlatList
            data={userInfo}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </View>
    </MainContPlain>
  );
};

export default AccountInformationScreen;

const styles = StyleSheet.create({
  container: {
    padding: dimensions.screenWidth * 0.04,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: dimensions.screenWidth * 0.038,
    fontFamily: "Poppins-SemiBold",
    color: "#a2a2a2",
    paddingLeft: dimensions.screenHeight * 0.015,
    marginBottom: dimensions.screenHeight * 0.01,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 6,
  },
  item: {
    padding: dimensions.screenHeight * 0.025,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  itemValue: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginTop: 2,
  },
  itemNote: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#999",
    marginTop: 4,
    maxWidth: "90%",
  },
});