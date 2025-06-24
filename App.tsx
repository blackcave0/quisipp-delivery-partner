import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import { useEffect } from 'react';
import SplashScreen from "./screens/SplashScreen";
import RoleSelectScreen from "./screens/RoleSelectScreen";
import DeliveryTypeSelectScreen from "./screens/DeliveryTypeSelectScreen";
import DeliveryUploadScreen from "./screens/DeliveryUploadScreen";
import BusinessUploadScreen from "./screens/BusinessUploadScreen";
import "./global.css";
import SelectVehicle from './screens/SelectVehicle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ThankYouScreen from './screens/ThankYouScreen';
import HomeScreen from './screens/HomeScreen';
import { requestAllPermissions } from './utils/permissions';
import { initializeNotifications } from './utils/notificationExamples';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Stack = createNativeStackNavigator();

function RootStack() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show splash screen while checking authentication
  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "HomeScreen" : "Splash"}
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated ? (
        // Authenticated routes
        <>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
        </>
      ) : (
        // Unauthenticated routes
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          <Stack.Screen name="DeliveryType" component={DeliveryTypeSelectScreen} />
          <Stack.Screen name="DeliveryUpload" component={DeliveryUploadScreen} />
          <Stack.Screen name="BusinessUpload" component={BusinessUploadScreen} />
          <Stack.Screen name="SelectVehicle" component={SelectVehicle} />
          <Stack.Screen name="ThankYou" component={ThankYouScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function AppWithAuth() {
  useEffect(() => {
    // Request permissions and initialize notifications when the app starts
    const setupApp = async () => {
      await requestAllPermissions();
      await initializeNotifications();
    };

    setupApp();
  }, []);

  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={styles.container}>
        <Toaster />
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});