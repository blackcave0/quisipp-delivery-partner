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
import { requestAllPermissions } from './utils/permissions';
import { initializeNotifications } from './utils/notificationExamples';


const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="DeliveryType" component={DeliveryTypeSelectScreen} />
      <Stack.Screen name="DeliveryUpload" component={DeliveryUploadScreen} />
      <Stack.Screen name="BusinessUpload" component={BusinessUploadScreen} />
      <Stack.Screen name="SelectVehicle" component={SelectVehicle} />
      <Stack.Screen name="ThankYou" component={ThankYouScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Request permissions and initialize notifications when the app starts
    const setupApp = async () => {
      await requestAllPermissions();
      await initializeNotifications();
    };

    setupApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={styles.container}>
        <Toaster />
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
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