import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import SignUpLoginScreen from '../screens/SignUpLoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyConsultationsScreen from '../screens/MyConsultationsScreen';
import CartScreen from '../screens/CartScreen';
import BookedPoojaScreen from '../screens/BookedPoojaScreen';
import FreeKundliScreen from '../screens/FreeKundliScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import BlogScreen from '../screens/BlogScreen';
import ContactScreen from '../screens/ContactScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#2C1810',
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
  headerShadowVisible: true,
  contentStyle: { backgroundColor: '#F8F4EF' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions} initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpLogin"
          component={SignUpLoginScreen}
          options={{ title: 'Complete Profile' }}
        />
        <Stack.Screen
          name="Home"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen
          name="MyConsultations"
          component={MyConsultationsScreen}
          options={{ title: 'My Consultations' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: 'Pooja Cart' }}
        />
        <Stack.Screen
          name="BookedPooja"
          component={BookedPoojaScreen}
          options={{ title: 'Booked Pooja' }}
        />
        <Stack.Screen
          name="FreeKundli"
          component={FreeKundliScreen}
          options={{ title: 'Free Kundli' }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsScreen}
          options={{ title: 'About Us' }}
        />
        <Stack.Screen
          name="Blogs"
          component={BlogScreen}
          options={{ title: 'Blogs' }}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{ title: 'Contact Us' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
