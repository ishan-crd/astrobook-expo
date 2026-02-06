import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions and get push token (Expo alternative to FCM)
export const getExpoPushToken = async () => {
  try {
    if (!Device.isDevice) {
      console.warn('Must use physical device for Push Notifications');
      return 'expo-device-token';
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // You'll need to set this in app.json
    });

    return token.data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
};

// Get device ID (Expo alternative)
export const getDeviceId = async () => {
  try {
    if (Device.isDevice) {
      return Device.modelName || 'unknown-device';
    }
    return 'simulator-device';
  } catch (error) {
    return 'unknown-device';
  }
};
