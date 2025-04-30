import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import MainContPaw from "../../components/general/background_paw";
import dimensions from "../../utils/sizing";
import Icon from "react-native-vector-icons/FontAwesome";
import { usePet } from "../../context/pet_context";
import { useSession } from "../../context/sessions_context";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import Spacer from "../../components/general/spacer";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import supabase from "../../utils/supabase";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";

const Profile = () => {
  const { session } = useSession();
  const { pets } = usePet();
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [bio, setBio] = useState(session?.user.user_metadata?.bio || "");
  const bioInputRef = useRef<TextInput>(null);

  
  // Add this effect to refresh bio when screen focuses
  useFocusEffect(
    useCallback(() => {
      setBio(session?.user.user_metadata?.bio || "");
    }, [session?.user.user_metadata?.bio])
  );

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["33%"], []);

  const openSheet = () => sheetRef.current?.expand();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      if (!session?.user?.id) throw new Error("No user ID");
  
      const response = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileExt = uri.split('.').pop();
      const fileName = `user_${session.user.id}.${fileExt}`;
      const filePath = `${session.user.id}/avatar/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('usersavatar')
        .upload(filePath, response, {
          contentType: `image/${fileExt}`,
          upsert: true,
          cacheControl: '3600',
        });
  
      if (uploadError) throw uploadError;
  
      const { data } = supabase.storage.from('usersavatar').getPublicUrl(filePath);
      const photoUrl = data.publicUrl;
  
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: photoUrl,
        },
      });
  
      if (updateError) throw updateError;
  
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("There was an error updating your profile picture.");
    } finally {
      setLoading(false);
    }
  };
  

  const backDrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const handleSheetChange = (index: number) => {
    if (index === 0) {
      sheetRef.current?.close();
    }
  };

  type SheetItemProps = {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    toRoute?: string;
  };

  const SheetItem = ({ title, icon, onPress, toRoute }: SheetItemProps) => {
    return (
      <TouchableOpacity onPress={onPress != null ? onPress : () => { sheetRef.current?.close(); router.push(toRoute ?? ''); }}>
        <View style={bs.itemCont}>
          <Ionicons name={icon} size={dimensions.screenWidth * 0.055} />
          <Spacer width={dimensions.screenWidth * 0.025} />
          <Text style={bs.itemTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainContPaw>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.topContainer}>
            <View style={styles.titlePage}>
              <View style={{ flex: 1 }}></View>
              <Text style={styles.titleText}>Profile</Text>
              <View style={styles.iconContainer}>
                <TouchableOpacity>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={dimensions.screenWidth * 0.06}
                    color="black"
                  />
                </TouchableOpacity>
                <Spacer width={dimensions.screenWidth * 0.02} />
                <TouchableOpacity onPress={openSheet}>
                  <Ionicons
                    name="menu"
                    size={dimensions.screenWidth * 0.07}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.profileContainer}>
              <View style={styles.profilePicContainer}>
                <View style={styles.profilePic}>
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.profilePic}
                    />
                  ) : session?.user.user_metadata['avatar_url'] ? (
                    <Image
                      source={{ uri: session.user.user_metadata.avatar_url }}
                      style={styles.profilePic}
                    />
                  ) : (
                    <Ionicons style={styles.profileIcon}
                      name="person"
                      size={dimensions.screenWidth * 0.12}
                    />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={pickImage}
                  disabled={isLoading}
                >
                  <Icon name="camera" size={20} color="black" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{session?.user.user_metadata['first_name'] + ' ' + session?.user.user_metadata['last_name']}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => router.push('../profile/edit_profile')}>
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                  <Icon name="edit" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewPetsButton} onPress={() => router.push('../pets/pets')}>
                  <Text style={styles.buttonText}>View Pets</Text>
                  <Icon name="paw" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <View style={[styles.statsContainer, { paddingTop: dimensions.screenWidth * 0.025 }]}>
                <View style={[styles.statItem, { flex: 1, alignItems: 'flex-start' }]}>
                  <View style={{ alignItems: "center" }}>
                    <Text style={styles.statNumber}>{pets.length}</Text>
                    <Text style={styles.statLabel}>Pets</Text>
                  </View>
                </View>
                <View style={[styles.statItem, { flex: 2 }]}>
                  <Text style={styles.statNumber}>{moment(session?.user.created_at).format('MMM DD, YYYY')}</Text>
                  <Text style={styles.statLabel}>Joined On</Text>
                </View>
                <View style={[styles.statItem, { flex: 1, alignItems: 'flex-end' }]}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.statNumber}>10</Text>
                    <Text style={styles.statLabel}>Playdates</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.aboutContainer}>
            <View style={styles.aboutHeader}>
              <Text style={[styles.aboutTitle, { fontFamily: 'Poppins-SemiBold' }]}>Bio</Text>
              <Icon
                name="user"
                size={dimensions.screenWidth * 0.04}
                color="white"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                ref={bioInputRef}
                style={styles.aboutInput}
                placeholder="Tell us about you and your pets..."
                placeholderTextColor="#888"
                multiline
                value={bio}
                editable={false}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.editBioButton}
                onPress={() => router.push('../profile/edit_bio')}
              >
                <Text style={styles.editBioButtonText}>Edit Bio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Portal>
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose={true}
          handleComponent={null}
          backgroundStyle={{ backgroundColor: "transparent" }}
          backdropComponent={backDrop}
          onChange={handleSheetChange}
        >
          <BottomSheetView style={bs.mainCont}>
            <SheetItem
              icon="settings-outline"
              title="Settings and Privacy"
              toRoute="../profile/settings"
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </MainContPaw>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  topContainer: {
    backgroundColor: "white",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingHorizontal: dimensions.screenWidth * 0.03,
  },
  titlePage: {
    marginTop: dimensions.screenHeight * 0.04,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: dimensions.screenWidth * 0.046,
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginVertical: dimensions.screenHeight * 0.03,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'flex-end',
    flex: 1
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: dimensions.screenHeight * 0.014,
  },
  profilePicContainer: {
    position: "relative",
    paddingBottom: dimensions.screenHeight * 0.009,
    paddingTop: dimensions.screenHeight * 0.009,
  },
  profilePic: {
    width: dimensions.screenHeight * 0.18,
    height: dimensions.screenHeight * 0.18,
    alignItems: 'center',
    backgroundColor: "#b1bfda",
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileIcon: {
    color: "white",
    alignItems: "center",
    flex: 1,
    position: "absolute",
    bottom: dimensions.screenHeight * 0.065,
  },
  cameraButton: {
    position: "absolute",
    bottom: dimensions.screenHeight * 0.007,
    right: dimensions.screenHeight * 0.003,
    width: dimensions.screenHeight * 0.05,
    height: dimensions.screenHeight * 0.05,
    borderRadius: 100,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: dimensions.screenHeight * 0.009,
    paddingBottom: dimensions.screenHeight * 0.009,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 25,
    marginTop: dimensions.screenHeight * 0.009,
  },
  editButton: {
    borderColor: "#E0E0E0",
    borderWidth: dimensions.screenHeight * 0.001,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: dimensions.screenHeight * 0.18,
    flex: 1,
    backgroundColor: "white",
  },
  editButtonText: {
    color: "black",
    fontFamily: "Poppins-SemiBold",
    fontSize: dimensions.screenWidth * 0.036,
    marginRight: dimensions.screenHeight * 0.01,
  },
  viewPetsButton: {
    backgroundColor: "#FF6F61",
    flex: 1,
    borderRadius: dimensions.screenHeight * 0.01,
    flexDirection: "row",
    paddingVertical: dimensions.screenHeight * 0.008,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: dimensions.screenWidth * 0.036,
    marginRight: dimensions.screenHeight * 0.01,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F7",
    padding: dimensions.screenHeight * 0.01,
    borderRadius: 15,
    paddingHorizontal: dimensions.screenWidth * 0.05,
    marginTop: dimensions.screenHeight * 0.02,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: dimensions.screenWidth * 0.041,
    lineHeight: dimensions.screenWidth * 0.05,
    margin: 0,
    fontFamily: "Poppins-SemiBold",
  },
  statLabel: {
    fontSize: dimensions.screenWidth * 0.03,
    fontFamily: "Poppins-Regular",
    lineHeight: dimensions.screenWidth * 0.04,
    color: "#888",
  },
  aboutContainer: {
    borderRadius: dimensions.screenHeight * 0.01,
    margin: dimensions.screenWidth * 0.05,
    marginTop: dimensions.screenHeight * 0.02,
  },
  aboutHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#466AA2",
    borderRadius: 30,
    paddingVertical: dimensions.screenHeight * 0.0035,
    paddingHorizontal: dimensions.screenHeight * 0.013,
    width: dimensions.screenHeight * 0.1,
    marginBottom: dimensions.screenHeight * 0.01,
  },
  aboutTitle: {
    fontSize: dimensions.screenWidth * 0.035,
    lineHeight: dimensions.screenWidth * 0.05,
    color: "white",
    marginRight: dimensions.screenHeight * 0.01,
  },
  bioContainer: {
    paddingHorizontal: dimensions.screenWidth * 0.05,
    paddingBottom: dimensions.screenHeight * 0.02,
  },
  editBioButton: {
    backgroundColor: "#FF6F61",
    paddingVertical: dimensions.screenHeight * 0.01,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: dimensions.screenHeight * 0.02,
    width: "60%",
  },
  editBioButtonText: {
    color: "white",
    fontSize: dimensions.screenWidth * 0.04,
    fontFamily: "Poppins-SemiBold",
  },
  inputContainer: {
    alignItems: "center",
    marginTop: dimensions.screenHeight * 0.001,
  },
  aboutInput: {
    borderColor: "transparent",
    backgroundColor: "white",
    borderWidth: 1,
    elevation: 0,
    minHeight: dimensions.screenHeight * 0.17,
    borderRadius: 15,
    padding: dimensions.screenWidth * 0.035,
    paddingRight: dimensions.screenHeight * 0.05,
    textAlignVertical: 'top',
    fontSize: dimensions.screenWidth * 0.04,
    fontFamily: 'Poppins-Regular',
    width: "100%",
  },
});

const bs = StyleSheet.create({
  mainCont: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  itemCont: {
    paddingVertical: dimensions.screenHeight * 0.025,
    borderBottomColor: '#bbb',
    borderBottomWidth: 0.2,
    marginHorizontal: dimensions.screenWidth * 0.05,
    paddingHorizontal: dimensions.screenWidth * 0.01,
    flexDirection: 'row',
  },
  itemTitle: {
    fontSize: dimensions.screenWidth * 0.042,
    fontFamily: 'Poppins-Medium',
  },
});

export default Profile;