import { useEffect } from 'react';
import { StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const customerData = await AsyncStorage.getItem('customerData');
        
        // Wait for splash animation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (isLoggedIn === 'true' && customerData) {
          // User is logged in, go to home
          navigation.replace('Home');
        } else {
          // User not logged in, go to login
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Splash screen error:', error);
        // Default to login on error
        navigation.replace('Login');
      }
    };

    checkLoginStatus();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/splash.png')}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  splashImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
