import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
  } from "react-native";
  import React, { useState, useRef, useLayoutEffect } from "react";
  import MainContPaw from "../../components/general/background_paw";
  import dimensions from "../../utils/sizing";
  import { useSession } from "../../context/sessions_context";
  import { router, useNavigation } from "expo-router";
  import { Ionicons } from "@expo/vector-icons";
  import supabase from "../../utils/supabase";
  
  const EditBio = () => {
    const { session } = useSession();
    const navigation = useNavigation();
    const [bio, setBio] = useState(session?.user.user_metadata?.bio || "");
    const [charCount, setCharCount] = useState(bio.length);
    const bioInputRef = useRef<TextInput>(null);
    const maxLength = 150;
  
    useLayoutEffect(() => {
      navigation.setOptions({
        title: "Edit Bio",
        headerBackTitleVisible: false,
        headerTintColor: "black",
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 0 }} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        ),
      });
    }, [navigation, bio]);
  
    const handleSave = async () => {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { bio }
        });
  
        if (error) throw error;
  
        router.back();
      } catch (error) {
        console.error("Error updating bio:", error);
      }
    };
  
    const handleChangeText = (text: string) => {
      if (text.length <= maxLength) {
        setBio(text);
        setCharCount(text.length);
      }
    };
  
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 60 : 0;
  
    return (
      <MainContPaw>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={keyboardVerticalOffset}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={bioInputRef}
                  style={styles.bioInput}
                  placeholder="Tell us about you and your pets..."
                  placeholderTextColor="#888"
                  multiline
                  value={bio}
                  onChangeText={handleChangeText}
                  autoFocus
                  maxLength={maxLength}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>
                  {charCount}/{maxLength}
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </MainContPaw>
    );
  };
  
  const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    saveButton: {
      color: "#466AA2",
      fontSize: dimensions.screenWidth * 0.04,
      fontFamily: "Poppins-SemiBold",
      marginRight: dimensions.screenWidth * 0.04,
    },
    container: {
      flex: 1,
      paddingHorizontal: dimensions.screenWidth * 0.05,
      paddingTop: dimensions.screenHeight * 0.02,
    },
    inputContainer: {
      marginBottom: dimensions.screenHeight * 0.03,
    },
    bioInput: {
      borderColor: "#E0E0E0",
      borderWidth: 1,
      borderRadius: 10,
      minHeight: dimensions.screenHeight * 0.15,
      padding: dimensions.screenWidth * 0.04,
      fontSize: dimensions.screenWidth * 0.04,
      fontFamily: "Poppins-Regular",
      backgroundColor: "white",
      textAlignVertical: "top",
    },
    charCount: {
      textAlign: "right",
      marginTop: dimensions.screenHeight * 0.01,
      color: "#888",
      fontSize: dimensions.screenWidth * 0.035,
      fontFamily: "Poppins-Regular",
    },
  });
  
  export default EditBio;