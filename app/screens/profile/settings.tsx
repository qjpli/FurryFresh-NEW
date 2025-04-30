import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { router, useNavigation } from 'expo-router';
import dimensions from "../../utils/sizing";
import MainContPlain from '../../components/general/background_plain';
import Spacer from '../../components/general/spacer';
import { AntDesign, Feather } from "@expo/vector-icons";
import supabase from '../../utils/supabase';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";

interface SettingOption {
  id: string;
  title: string;
  icon: JSX.Element;
  onPress?: () => void;
}

interface SettingSupAbt {
  id: string;
  title: string;
  icon: JSX.Element;
  onPress?: () => void;
}

interface SettingLogin {
  id: string;
  title: string;
  icon: JSX.Element;
  onPress: () => void;
}

const Settings: React.FC = () => {
  const navigation = useNavigation();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["20%"], []);
  const openSheet = () => sheetRef.current?.expand();

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

  const SETTINGS_OPTIONS: SettingOption[] = [
    {
      id: '1',
      title: 'Personal Account Information',
      icon: <Feather name="user" size={20} color="#a2a2a2" />,
      onPress: () => {
        router.push('../settings/account_info');
      },
    },
  ];

  const SETTINGS_SUPPORT_ABOUT: SettingSupAbt[] = [
    {
      id: '1',
      title: 'Terms and Policies',
      icon: <Feather name="alert-circle" size={20} color="#a2a2a2" />,
      onPress: () => {
        router.push('../settings/terms-policies');
      },
    },
    {
      id: '2',
      title: 'Contact Us',
      icon: <Feather name="phone" size={20} color="#a2a2a2" />,
      onPress: () => {
        router.push('../settings/contact-us');
      },
    },
    {
      id: '3',
      title: 'About Us',
      icon: <AntDesign name="questioncircleo" size={20} color="#a2a2a2" />,
      onPress: () => {
        router.push('../settings/about-us');
      },
    },
  ];

  const SETTINGS_LOGIN: SettingLogin[] = [
    {
      id: '1',
      title: 'Log out',
      icon: <Feather name="log-out" size={20} color="#a2a2a2" />,
      onPress: openSheet,
    },
  ];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Settings and Privacy',
      headerBackTitleVisible: false,
      headerTintColor: 'black',
    });
  }, [navigation]);

  const renderItem = ({ item }: { item: SettingOption | SettingLogin }) => (
    <TouchableOpacity style={styles.item} onPress={item.onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {'icon' in item && item.icon && (
          <View style={{ marginRight: 10 }}>{item.icon}</View>
        )}
        <Text style={styles.itemText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <MainContPlain>
      <Spacer height={dimensions.screenHeight * 0.023} />

      <View style={styles.containerAcc}>
        {renderSectionHeader('Account')}
        <View style={styles.listCont}>
          <FlatList
            data={SETTINGS_OPTIONS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </View>

      <Spacer height={dimensions.screenHeight * 0.01} />

      <View style={styles.containerSupAbt}>
        {renderSectionHeader('Support & About')}
        <View style={styles.listCont}>
          <FlatList
            data={SETTINGS_SUPPORT_ABOUT}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </View>

      <Spacer height={dimensions.screenHeight * 0.01} />

      <View style={styles.containerLogin}>
        {renderSectionHeader('Login')}
        <View style={styles.listCont}>
          <FlatList
            data={SETTINGS_LOGIN}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </View>

      <Portal>
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose={true}
          handleComponent={null}
          backgroundStyle={{ backgroundColor: "white", borderRadius: 20 }}
          backdropComponent={backDrop}
        >
          <BottomSheetView style={styles.sheetContainer}>
            <Text style={styles.sheetTitle}>Are you sure you want to log out?</Text>

            <TouchableOpacity
              onPress={async () => {
                await supabase.auth.signOut();
                router.replace("../auth/sign_in");
              }}
              style={[styles.sheetBtn, { borderTopWidth: 2 }]}
            >
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => sheetRef.current?.close()}
              style={[styles.sheetBtn, { borderTopWidth: 2 }]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </MainContPlain>
  );
};

export default Settings;

const styles = StyleSheet.create({
  containerAcc: {
    padding: dimensions.screenWidth * 0.04,
    paddingTop: 0,
  },
  containerLogin: {
    padding: dimensions.screenWidth * 0.04,
    paddingTop: 0,
  },
  containerSupAbt: {
    padding: dimensions.screenWidth * 0.04,
    paddingTop: 0,
  },
  listCont: {
    backgroundColor: 'white',
    borderRadius: 6,
  },
  sectionHeader: {
    fontSize: dimensions.screenWidth * 0.038,
    fontFamily: 'Poppins-SemiBold',
    color: "#a2a2a2",
    paddingLeft: dimensions.screenHeight * 0.015,
    marginBottom: dimensions.screenHeight * 0.01,
  },
  item: {
    padding: dimensions.screenHeight * 0.025,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: dimensions.screenWidth * 0.04,
    fontFamily: 'Poppins-Regular',
  },
  sheetTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  sheetContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
  },
  sheetBtn: {
    width: '100%',
    paddingVertical: 14,
    borderTopWidth: 2,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ff3b30',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },
});