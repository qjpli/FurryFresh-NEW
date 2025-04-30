import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import React from 'react';
import { useNavigation, useRouter } from 'expo-router';
import MainContPaw from '../../components/general/background_paw';
import AppbarDefault from '../../components/bars/appbar_default';
import dimensions from '../../utils/sizing';
import { useSession } from '../../context/sessions_context';
import { Ionicons } from '@expo/vector-icons';
import useCustomFonts from '../../hooks/useFonts';
import { usePet } from '../../context/pet_context';


const Explore = () => {
  const { pets } = usePet();
  const { session } = useSession();
  const navigation = useNavigation();
  const router = useRouter();

  const fontsLoaded = useCustomFonts();
  if (!fontsLoaded) return null;

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalText, setModalText] = React.useState('');

  const showComingSoon = (text: string) => {
    setModalText(text);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <MainContPaw>
        <AppbarDefault
          title={'Explore More'}
          session={session}
          showBack={false}
          showLeading={false}
          leadingChildren={null}
          titleSize={dimensions.screenWidth * 0.045}
        />
        <View style={styles.box}>
          <Text style={styles.text}>Other App Features</Text>

          {/* FurryFresh Play Date */}
          <TouchableOpacity onPress={() => {

            const showGetStarted = (pets.filter((pet) => pet.is_playdate_allowed).length == 0);

            if (showGetStarted) {
              router.push('../playdate/getstarted');
            } else {
              router.push('../playdate/home');
            }

          }}>
            <View style={styles.innerBox}>
              <View style={styles.indicator}>
                <View style={styles.indicatorContent}>
                  <Image
                    source={require('../../assets/images/others/stars.png')}
                    style={styles.indicatorIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.indicatorText}>NEW</Text>
                </View>
              </View>

              <View style={styles.colorBox}>
                <Image
                  source={require('../../assets/images/others/features1.png')}
                  style={styles.colorBoxImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.innerTextBlack}>Play Date</Text>
                <Text style={styles.innerTextGray}>Activities</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Pet Care Tips */}
          <TouchableOpacity onPress={() => router.push('../tips/getstarted')}>
            <View style={styles.innerBox}>
              <View style={styles.indicator}>
                <View style={styles.indicatorContent}>
                  <Image
                    source={require('../../assets/images/others/stars.png')}
                    style={styles.indicatorIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.indicatorText}>NEW</Text>
                </View>
              </View>

              <View style={styles.colorBox}>
                <Image
                  source={require('../../assets/images/others/features2.png')}
                  style={styles.colorBoxImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.innerTextBlack}>Pet Care Tips</Text>
                <Text style={styles.innerTextGray}>Education</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Pet Show Contest */}
          <TouchableOpacity onPress={() => router.push('../minigame/minigame')}>
            <View style={styles.innerBox}>
              <View style={styles.indicator}>
                <Text style={styles.indicatorText}>COMING SOON!</Text>
              </View>
              <View style={styles.colorBox}>
                <Image
                  source={require('../../assets/images/others/features3.png')}
                  style={styles.colorBoxImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.innerTextBlack}>Pet Show Contest</Text>
                <Text style={styles.innerTextGray}>Activities</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Online Consultation */}
          <TouchableOpacity onPress={() => showComingSoon('Online Consultation')}>
            <View style={styles.innerBox}>
              <View style={styles.indicator}>
                <Text style={styles.indicatorText}>COMING SOON!</Text>
              </View>
              <View style={styles.colorBox}>
                <Image
                  source={require('../../assets/images/others/features4.png')}
                  style={styles.colorBoxImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.innerTextBlack}>Online Consultation</Text>
                <Text style={styles.innerTextGray}>Health</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </MainContPaw>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
            <Image
              source={require('../../assets/images/general/furry-fresh-logo.png')}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Coming Soon</Text>
            <Text style={styles.modalMessage}>
              {modalText} is launching soon. Stay tuned!
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F8F8FF',
  },
  box: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginVertical: 10,
  },
  innerBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    backgroundColor: '#ED7964',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  indicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorIcon: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  indicatorText: {
    fontSize: dimensions.screenWidth * 0.020,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
  },
  colorBox: {
    width: 60,
    height: 60,
    backgroundColor: '#466AA2',
    borderRadius: 10,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  colorBoxImage: {
    width: 30,
    height: 30,
  },
  text: {
    fontSize: dimensions.screenWidth * 0.055,
    color: '#466AA2',
    fontFamily: 'Poppins-SemiBold',
    padding: 5,
  },
  innerTextBlack: {
    fontSize: dimensions.screenWidth * 0.035,
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
  },
  textContainer: {
    flexDirection: 'column',
  },
  innerTextGray: {
    fontSize: dimensions.screenWidth * 0.030,
    color: '#808080',
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    marginBottom: 10,
    color: '#ED7964',
  },
  modalMessage: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: '#333',
  },
});
