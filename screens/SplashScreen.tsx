import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';
import AppLogo from '../components/AppLogo';
import LottieView from 'lottie-react-native';
import { ResizeMode, Video } from 'expo-av';

const { width, height } = Dimensions.get('window');
type RootStackParamList = {
  RoleSelect: undefined;
  HomeScreen: undefined;
  // add other routes here if needed
};

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const videoRef = useRef(null);
  const [splashStartTime] = useState(Date.now());

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const userData = await authService.getStoredUserData();
        setCheckingAuth(false);

        // If user is authenticated, navigate to HomeScreen
        if (userData && isAuthenticated) {
          // Ensure splash screen shows for at least 5 seconds
          const elapsedTime = Date.now() - splashStartTime;
          const remainingTime = Math.max(0, 5000 - elapsedTime);

          setTimeout(() => {
            navigation.replace('HomeScreen');
          }, remainingTime);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setCheckingAuth(false);
      }
    };

    checkAuth();

    // Set a timer to navigate after at least 5 seconds
    const minSplashTimer = setTimeout(() => {
      if (!isAuthenticated) {
        navigation.replace('RoleSelect');
      }
    }, 5000);

    return () => clearTimeout(minSplashTimer);
  }, [navigation, isAuthenticated, splashStartTime]);

  const handleVideoEnd = () => {
    // Navigate to RoleSelect screen when video ends, but only if 5 seconds have passed
    const elapsedTime = Date.now() - splashStartTime;
    if (elapsedTime >= 5000 && !isAuthenticated) {
      navigation.replace('RoleSelect');
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/splash-screen.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        style={{ width: '100%', height: '100%' }}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            handleVideoEnd();
          }
        }}
      />
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});