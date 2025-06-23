import * as Location from "expo-location";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

export const requestLocationPermission = async () => {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus !== "granted") {
    Alert.alert(
      "Location Permission Required",
      "This app needs access to your location to show nearby delivery requests.",
      [{ text: "OK" }]
    );
    return false;
  }

  // For background location (only if needed)
  // const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  // if (backgroundStatus !== 'granted') {
  //   Alert.alert(
  //     'Background Location Permission',
  //     'Background location access is needed for tracking deliveries.',
  //     [{ text: 'OK' }]
  //   );
  //   return false;
  // }

  return true;
};

export const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Camera Permission Required",
      "This app needs access to your camera to take photos of deliveries.",
      [{ text: "OK" }]
    );
    return false;
  }

  return true;
};

export const requestMediaLibraryPermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Media Library Permission Required",
      "This app needs access to your photo library to upload delivery proof.",
      [{ text: "OK" }]
    );
    return false;
  }

  return true;
};

export const requestNotificationPermission = async () => {
  // Skip notification setup in Expo Go for SDK 53+
  if (isExpoGo) {
    console.warn(
      "Notifications are not fully supported in Expo Go. Use a development build for full notification support."
    );
    Alert.alert(
      "Notification Notice",
      "Notifications are limited in Expo Go. For full notification support, please use a development build.",
      [{ text: "OK" }]
    );
    return true; // Return true to not block the app flow
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Notification Permission Required",
        "This app needs to send you notifications about new delivery requests.",
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Error requesting notification permissions:", error);
    Alert.alert(
      "Notification Setup Error",
      "There was an issue setting up notifications. The app will continue to work without notifications.",
      [{ text: "OK" }]
    );
    return true; // Return true to not block the app flow
  }
};

export const requestAllPermissions = async () => {
  const locationGranted = await requestLocationPermission();
  const cameraGranted = await requestCameraPermission();
  const mediaLibraryGranted = await requestMediaLibraryPermission();
  const notificationGranted = await requestNotificationPermission();

  return {
    locationGranted,
    cameraGranted,
    mediaLibraryGranted,
    notificationGranted,
    allGranted:
      locationGranted &&
      cameraGranted &&
      mediaLibraryGranted &&
      notificationGranted,
  };
};
