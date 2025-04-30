import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; 
import GetStarted from '../app/screens/onboarding/get_started';

const MainsPage = () => {
  const { isFirstTime } = useLocalSearchParams(); 

  if (isFirstTime === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isFirstTime === 'true') {
    return <GetStarted />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/images/general/furry-fresh-logo.png')}
        style={styles.loaderImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
  },
  loaderImage: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
}); 

export default MainsPage;
